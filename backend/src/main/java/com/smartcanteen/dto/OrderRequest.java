package com.smartcanteen.dto;

import java.util.List;

public class OrderRequest {
    public List<Item> items;
    public String notes;
    public String paymentMethod;

    public static class Item {
        public Long menuItemId;
        public Integer quantity;
    }
}
