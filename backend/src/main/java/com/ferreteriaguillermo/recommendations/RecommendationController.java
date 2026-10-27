package com.ferreteriaguillermo.recommendations;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api") public class RecommendationController {
 private final RecommendationService service;
 public RecommendationController(RecommendationService service){this.service=service;}
 private Long user(Authentication auth){Long id=service.customerId(auth==null?null:auth.getName());if(id==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);return id;}
 public record Event(String type, Long productId, String query){}
 public record Feedback(Long productId,String action){}
 @PostMapping("/interactions") public Map<String,Boolean> event(@RequestBody Event event,Authentication auth){service.event(user(auth),event.type(),event.productId(),event.query());return Map.of("ok",true);}
 @PostMapping("/recommendations/feedback") public Map<String,Boolean> feedback(@RequestBody Feedback value,Authentication auth){service.feedback(user(auth),value.productId(),value.action());return Map.of("ok",true);}
}
