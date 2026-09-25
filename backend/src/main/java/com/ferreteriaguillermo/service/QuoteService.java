package com.ferreteriaguillermo.service;

import com.ferreteriaguillermo.dto.QuoteItemRequest;
import com.ferreteriaguillermo.dto.QuoteRequest;
import com.ferreteriaguillermo.model.*;
import com.ferreteriaguillermo.repository.ProductRepository;
import com.ferreteriaguillermo.repository.QuoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    public QuoteService(
            QuoteRepository quoteRepository,
            ProductRepository productRepository,
            EmailService emailService
    ) {
        this.quoteRepository = quoteRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Quote create(QuoteRequest request) {

        Quote quote = new Quote();

        quote.setClientName(request.clientName());
        quote.setClientEmail(request.clientEmail());
        quote.setClientPhone(request.clientPhone());
        quote.setMessage(request.message());

        BigDecimal total = BigDecimal.ZERO;

        for (QuoteItemRequest itemRequest : request.items()) {

            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Producto no encontrado: " + itemRequest.productId()
                            )
                    );

            QuoteItem item = new QuoteItem();

            item.setQuote(quote);
            item.setProduct(product);
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(product.getPrice());

            quote.getItems().add(item);

            total = total.add(
                    product.getPrice()
                            .multiply(BigDecimal.valueOf(itemRequest.quantity()))
            );
        }

        quote.setTotal(total);

        Quote savedQuote = quoteRepository.save(quote);

        emailService.sendQuoteNotification(savedQuote);

        return savedQuote;
    }

    public List<Quote> latest() {
        return quoteRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public long count() {
        return quoteRepository.count();
    }
}