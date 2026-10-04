package com.smartcanteen.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    private String category;
    @Column(nullable = false)
    private BigDecimal price;
    private boolean todayOffer;
    private BigDecimal offerPrice;
    private boolean available;
    @Column(length = 500)
    private String description;

    public MenuItem() {}

    public MenuItem(Long id, String name, String category, BigDecimal price, boolean todayOffer, BigDecimal offerPrice, boolean available, String description) {
        this.id = id; this.name = name; this.category = category; this.price = price;
        this.todayOffer = todayOffer; this.offerPrice = offerPrice; this.available = available; this.description = description;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public boolean isTodayOffer() { return todayOffer; }
    public BigDecimal getOfferPrice() { return offerPrice; }
    public boolean isAvailable() { return available; }
    public String getDescription() { return description; }
    public void setName(String v) { name = v; }
    public void setCategory(String v) { category = v; }
    public void setPrice(BigDecimal v) { price = v; }
    public void setTodayOffer(boolean v) { todayOffer = v; }
    public void setOfferPrice(BigDecimal v) { offerPrice = v; }
    public void setAvailable(boolean v) { available = v; }
    public void setDescription(String v) { description = v; }
}
