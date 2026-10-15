package com.ferreteriaguillermo.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reads a local .env file as UTF-8 before application.properties is resolved.
 * OS environment variables and JVM system properties always take precedence.
 * The file is optional, and its contents are never printed to logs.
 */
public final class Utf8DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path file = Path.of(".env");
        if (!Files.isRegularFile(file)) {
            file = Path.of("backend", ".env");
        }
        if (!Files.isRegularFile(file)) {
            return;
        }

        Map<String, Object> variables = new LinkedHashMap<>();
        try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            String line;
            boolean first = true;
            while ((line = reader.readLine()) != null) {
                if (first && line.startsWith("\uFEFF")) line = line.substring(1);
                first = false;
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
                if (trimmed.startsWith("export ")) trimmed = trimmed.substring(7).trim();
                int separator = trimmed.indexOf('=');
                if (separator < 1) continue;

                String key = trimmed.substring(0, separator).trim();
                if (!key.matches("[A-Za-z_][A-Za-z0-9_]*")) continue;

                String value = trimmed.substring(separator + 1).trim();
                if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }
                variables.put(key, value);
            }
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el archivo .env en UTF-8", e);
        }

        if (!variables.isEmpty()) {
            // Last priority ensures process env, JVM -D values, and deploy secrets win.
            environment.getPropertySources().addLast(new MapPropertySource("localUtf8Dotenv", variables));
        }
    }
}
