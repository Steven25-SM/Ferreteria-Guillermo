package com.ferreteriaguillermo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record QuoteRequest(
        @NotBlank String clientName,
        @NotBlank @Email String clientEmail,
        @NotBlank String clientPhone,
        String message,
        @NotEmpty List<@Valid QuoteItemRequest> items
) {}
