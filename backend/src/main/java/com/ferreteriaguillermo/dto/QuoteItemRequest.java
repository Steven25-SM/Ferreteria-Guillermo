package com.ferreteriaguillermo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuoteItemRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
) {}
