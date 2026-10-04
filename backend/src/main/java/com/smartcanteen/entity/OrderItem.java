package com.smartcanteen.entity;


import jakarta.persistence.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private CustomerOrder order;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private MenuItem menuItem;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public OrderItem() {}
    public Long getId() { return id; }
    @JsonIgnore
    public CustomerOrder getOrder() { return order; }
    public MenuItem getMenuItem() { return menuItem; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setOrder(CustomerOrder v) { order = v; }
    public void setMenuItem(MenuItem v) { menuItem = v; }
    public void setQuantity(Integer v) { quantity = v; }
    public void setUnitPrice(BigDecimal v) { unitPrice = v; }
    public void setSubtotal(BigDecimal v) { subtotal = v; }
}
