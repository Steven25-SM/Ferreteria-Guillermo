package com.ferreteriaguillermo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferreteriaguillermo.model.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@Service
public class AiRecommendationService {
    @Value("${recommendations.ai.enabled:false}") private boolean enabled;
    @Value("${recommendations.ai.key:}") private String apiKey;
    @Value("${recommendations.ai.provider:groq}") private String provider;
    @Value("${recommendations.ai.model:llama-3.3-70b-versatile}") private String model;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    public AiRecommendationService(ObjectMapper mapper) { this.mapper = mapper; }

    public List<Product> rank(List<Product> candidates, List<Product> purchased, boolean returningCustomer) {
        if (!enabled || apiKey.isBlank() || candidates.size() < 2 || !returningCustomer) return candidates;
        // AI only reorders verified database candidates; it cannot invent products or use unverified transactions.
        try {
            if (!Set.of("groq", "xai").contains(provider)) return candidates;
            String endpoint = provider.equals("xai") ? "https://api.x.ai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
            String history = purchased.stream().limit(15).map(p -> p.getId() + ":" + p.getName() + "(" + p.getCategory() + ")").toList().toString();
            String catalog = candidates.stream().limit(25).map(p -> p.getId() + ":" + p.getName() + "(" + p.getCategory() + ")").toList().toString();
            String prompt = "Eres un recomendador de una ferretería peruana. Reordena productos existentes según complementos útiles para el historial de compra. " +
                    "Devuelve EXCLUSIVAMENTE JSON con formato {\"ids\":[1,2,3]}. No inventes IDs ni productos. " +
                    "Historial: " + history + ". Candidatos: " + catalog;
            String body = mapper.writeValueAsString(Map.of(
                    "model", model,
                    "temperature", 0,
                    "max_tokens", 150,
                    "messages", List.of(Map.of("role", "user", "content", prompt))));
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(5))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) return candidates;
            JsonNode completion = mapper.readTree(response.body());
            String raw = completion.path("choices").path(0).path("message").path("content").asText("");
            int start = raw.indexOf('{'), end = raw.lastIndexOf('}');
            if (start < 0 || end < start) return candidates;
            JsonNode ids = mapper.readTree(raw.substring(start, end + 1)).path("ids");
            if (!ids.isArray()) return candidates;
            Map<Long, Product> lookup = new LinkedHashMap<>();
            for (Product product : candidates) lookup.put(product.getId(), product);
            LinkedHashSet<Long> order = new LinkedHashSet<>();
            for (JsonNode id : ids) {
                if (id.canConvertToLong() && lookup.containsKey(id.asLong())) order.add(id.asLong());
            }
            List<Product> output = new ArrayList<>();
            for (Long id : order) output.add(lookup.get(id));
            for (Product product : candidates) if (!order.contains(product.getId())) output.add(product);
            return output;
        } catch (Exception ignored) {
            return candidates; // Reliable non-AI fallback.
        }
    }
}
