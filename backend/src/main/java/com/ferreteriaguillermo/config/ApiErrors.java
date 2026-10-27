package com.ferreteriaguillermo.config;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
@RestControllerAdvice public class ApiErrors {
    @ExceptionHandler(ResponseStatusException.class)public ResponseEntity<Map<String,String>> handle(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Solicitud no válida":e.getReason()));
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)public ResponseEntity<Map<String,String>> conflict(Exception e) {
        return ResponseEntity.status(409).body(Map.of("message","El registro ya existe o está referenciado"));
    }
}
