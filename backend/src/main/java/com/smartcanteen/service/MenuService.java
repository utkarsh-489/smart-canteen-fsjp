package com.smartcanteen.service;

import com.smartcanteen.dto.MenuRequest;
import com.smartcanteen.entity.MenuItem;
import com.smartcanteen.repository.MenuItemRepository;
import com.smartcanteen.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {
    private final MenuItemRepository repo;
    private final OrderItemRepository orderItems;

    public MenuService(MenuItemRepository repo, OrderItemRepository orderItems) {
        this.repo = repo;
        this.orderItems = orderItems;
    }

    public List<MenuItem> all() { return repo.findAll(); }

    public MenuItem one(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found"));
    }

    public MenuItem create(MenuRequest r) {
        validate(r);

        MenuItem item = map(new MenuItem(), r);

        try {
            System.out.println("=== SMART CANTEEN MENU CREATE ===");
            System.out.println("name = " + item.getName());
            System.out.println("category = " + item.getCategory());
            System.out.println("price = " + item.getPrice());
            System.out.println("todayOffer = " + item.isTodayOffer());
            System.out.println("offerPrice = " + item.getOfferPrice());
            System.out.println("available = " + item.isAvailable());
            System.out.println("description = " + item.getDescription());

            MenuItem saved = repo.save(item);

            System.out.println("=== MENU CREATE SUCCESS: id=" + saved.getId() + " ===");

            return saved;

        } catch (Exception ex) {
            System.err.println("=== MENU CREATE FAILED ===");
            ex.printStackTrace();
            throw ex;
        }
    }

    public MenuItem update(Long id, MenuRequest r) {
        validate(r);
        return repo.save(map(one(id), r));
    }

    public void delete(Long id) {
        if (orderItems.existsByMenuItem_Id(id)) {
            throw new IllegalArgumentException(
                    "This item is already present in order history. Mark it Out of Stock instead of removing it."
            );
        }
        repo.deleteById(id);
    }

    private MenuItem map(MenuItem m, MenuRequest r) {
        m.setName(r.name.trim());
        m.setCategory(r.category);
        m.setPrice(r.price);
        m.setTodayOffer(r.todayOffer);
        m.setOfferPrice(r.todayOffer ? r.offerPrice : null);
        m.setAvailable(r.available);
        m.setDescription(r.description);
        return m;
    }

    private void validate(MenuRequest r) {
        if (r.name == null || r.name.isBlank() || r.price == null || r.price.signum() < 0) {
            throw new IllegalArgumentException("Name and valid price are required");
        }
        if (r.todayOffer && r.offerPrice == null) {
            throw new IllegalArgumentException("Offer price is required for today's offer");
        }
    }
}
