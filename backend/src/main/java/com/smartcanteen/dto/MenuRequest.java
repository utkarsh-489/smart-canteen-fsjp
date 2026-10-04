package com.smartcanteen.dto;

import java.math.BigDecimal;

public class MenuRequest {
    public String name;
    public String category;
    public BigDecimal price;
    public boolean todayOffer;
    public BigDecimal offerPrice;
    public boolean available;
    public String description;
}
