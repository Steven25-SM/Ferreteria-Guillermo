package com.ferreteriaguillermo.inventory;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service public class StockService {
    private final InventoryRepository inventories;
    private final StockMovementRepository movements;
    public StockService(InventoryRepository i,StockMovementRepository m) {
        inventories=i;
        movements=m;
    }
    @Transactional public void move(Long productId,String type,int quantity,Long actorId,String reason) {
        if(quantity<=0||!Set.of("IN","OUT").contains(type))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Movimiento inválido");
        Inventory inv=inventories.lockByProduct(productId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto sin inventario"));
        int next=inv.quantity+(type.equals("IN")?quantity:-quantity);
        if(next<0)throw new ResponseStatusException(HttpStatus.CONFLICT,"Stock insuficiente");
        inv.quantity=next;
        inventories.save(inv);
        StockMovement m=new StockMovement();
        m.productId=productId;
        m.actorId=actorId;
        m.type=type;
        m.quantity=quantity;
        m.reason=reason;
        movements.save(m);
    }
}
