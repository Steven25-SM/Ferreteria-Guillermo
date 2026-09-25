package com.ferreteriaguillermo.controller;

import com.ferreteriaguillermo.dto.QuoteRequest;
import com.ferreteriaguillermo.model.Quote;
import com.ferreteriaguillermo.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {
    private final QuoteService service;

    public QuoteController(QuoteService service) {
        this.service = service;
    }

    @PostMapping
    public Quote create(@Valid @RequestBody QuoteRequest request) {
        return service.create(request);
    }

    @GetMapping("/latest")
    public List<Quote> latest() {
        return service.latest();
    }

    @GetMapping("/count")
    public long count() {
        return service.count();
    }
}
