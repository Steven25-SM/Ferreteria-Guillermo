package com.ferreteriaguillermo.repository;

import com.ferreteriaguillermo.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findTop10ByOrderByCreatedAtDesc();
}
