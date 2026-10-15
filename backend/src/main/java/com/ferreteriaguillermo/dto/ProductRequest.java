package com.ferreteriaguillermo.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record ProductRequest(
    @NotBlank String name,
    @NotBlank String category,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    @DecimalMin("0.01") BigDecimal oldPrice,
    String icon,
    @Size(max = 1500000) String imageUrl,
    @DecimalMin("0.0") @DecimalMax("5.0") BigDecimal rating,
    boolean featured
) {}
