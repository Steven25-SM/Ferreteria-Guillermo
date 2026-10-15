package com.ferreteriaguillermo.repository;
import com.ferreteriaguillermo.model.StoreOrder;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface StoreOrderRepository extends JpaRepository<StoreOrder,Long> {
 boolean existsByPaymentReferenceAndIdNotAndStatusNot(String paymentReference,Long id,String status);
 List<StoreOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
 List<StoreOrder> findAllByOrderByCreatedAtDesc();
 @Query("select i.product.id, sum(i.quantity) from StoreOrderItem i where i.order.status in ('PAID','PREPARING','READY','DELIVERED') group by i.product.id order by sum(i.quantity) desc") List<Object[]> bestSellers();
 @Query("select distinct i.product.id from StoreOrderItem i where i.order.status in ('PAID','PREPARING','READY','DELIVERED') and i.order.customer.id=:id") List<Long> purchasedIds(@Param("id") Long id);
 @Query("select i.product.id, count(distinct i.order.id) from StoreOrderItem i where i.order.status in ('PAID','PREPARING','READY','DELIVERED') and i.product.id not in :owned and i.order.id in (select j.order.id from StoreOrderItem j where j.order.status in ('PAID','PREPARING','READY','DELIVERED') and j.product.id in :owned) group by i.product.id order by count(distinct i.order.id) desc") List<Object[]> alsoBought(@Param("owned") List<Long> owned);
}