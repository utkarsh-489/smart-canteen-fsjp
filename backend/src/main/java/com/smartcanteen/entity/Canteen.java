package com.smartcanteen.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "canteens")
public class Canteen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String collegeName;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Canteen() {}

    public Canteen(Long id, String name, String collegeName, String location) {
        this.id = id;
        this.name = name;
        this.collegeName = collegeName;
        this.location = location;
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCollegeName() { return collegeName; }
    public String getLocation() { return location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
