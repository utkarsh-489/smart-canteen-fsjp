package com.smartcanteen;

import com.smartcanteen.entity.AppUser;
import com.smartcanteen.entity.Canteen;
import com.smartcanteen.entity.MenuItem;
import com.smartcanteen.entity.Role;
import com.smartcanteen.repository.AppUserRepository;
import com.smartcanteen.repository.CanteenRepository;
import com.smartcanteen.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@SpringBootApplication
public class SmartCanteenApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartCanteenApplication.class, args);
    }

    @Bean
    CommandLineRunner seedData(AppUserRepository users, CanteenRepository canteens, MenuItemRepository menu,
                                PasswordEncoder encoder, @Value("${app.demo-mode:false}") boolean demoMode) {
        return args -> {
            if (canteens.count() == 0 && users.count() > 0) {
                Canteen existing = canteens.save(new Canteen(null, "Smart Canteen", "Existing College", "Mumbai"));
                users.findAll().forEach(u -> {
                    if (u.getCanteen() == null) {
                        u.setCanteen(existing);
                        users.save(u);
                    }
                });
            }

            if (demoMode && canteens.count() == 0) {
                Canteen demoCanteen = canteens.save(new Canteen(null, "Smart Canteen", "Demo College", "Mumbai"));
                if (users.count() == 0) {
                    users.save(new AppUser(null, "System Admin", "admin@canteen.com", encoder.encode("admin123"), Role.ADMIN, false, demoCanteen));
                    users.save(new AppUser(null, "Rohan Staff", "staff@canteen.com", encoder.encode("staff123"), Role.STAFF, false, demoCanteen));
                    users.save(new AppUser(null, "Demo Student", "student@college.edu", encoder.encode("student123"), Role.STUDENT, false, demoCanteen));
                }
            }

            if (demoMode && menu.count() == 0) {
                menu.save(new MenuItem(null, "Veg Burger", "Snacks", new BigDecimal("50.00"), true, new BigDecimal("45.00"), true, "Fresh veg patty burger"));
                menu.save(new MenuItem(null, "Veg Pizza", "Meals", new BigDecimal("100.00"), false, null, true, "Cheesy vegetable pizza"));
                menu.save(new MenuItem(null, "Samosa", "Snacks", new BigDecimal("25.00"), true, new BigDecimal("20.00"), true, "Crispy potato samosa"));
                menu.save(new MenuItem(null, "Cold Coffee", "Beverages", new BigDecimal("40.00"), false, null, true, "Chilled coffee with milk"));
                menu.save(new MenuItem(null, "Masala Dosa", "Meals", new BigDecimal("100.00"), true, new BigDecimal("90.00"), true, "South Indian masala dosa"));
                menu.save(new MenuItem(null, "Veg Puff", "Snacks", new BigDecimal("20.00"), false, null, true, "Flaky puff with veg filling"));
            }
        };
    }
}
