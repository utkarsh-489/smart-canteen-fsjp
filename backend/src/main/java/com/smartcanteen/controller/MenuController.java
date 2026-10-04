package com.smartcanteen.controller;

import com.smartcanteen.dto.MenuRequest;
import com.smartcanteen.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {
    private final MenuService menu;
    public MenuController(MenuService menu) { this.menu = menu; }

    @GetMapping public ResponseEntity<?> all() { return ResponseEntity.ok(menu.all()); }
    @GetMapping("/{id}") public ResponseEntity<?> one(@PathVariable Long id) { return ResponseEntity.ok(menu.one(id)); }
    @PostMapping @PreAuthorize("hasAnyRole('STAFF','ADMIN')") public ResponseEntity<?> create(@RequestBody MenuRequest r) { return ResponseEntity.ok(menu.create(r)); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('STAFF','ADMIN')") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MenuRequest r) { return ResponseEntity.ok(menu.update(id, r)); }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('STAFF','ADMIN')") public ResponseEntity<?> delete(@PathVariable Long id) { menu.delete(id); return ResponseEntity.noContent().build(); }
}
