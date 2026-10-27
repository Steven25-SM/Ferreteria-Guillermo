package com.ferreteriaguillermo.inventory;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface InventoryRepository extends JpaRepository<Inventory,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)@Query("select i from Inventory i where i.productId=:id")Optional<Inventory> lockByProduct(@Param("id")Long id);
}
