package com.ferreteriaguillermo.inventory;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StockMovementRepository extends JpaRepository<StockMovement,Long> {
}
