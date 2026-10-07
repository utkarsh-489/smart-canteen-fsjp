package com.smartcanteen.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(nullable = false, unique = true)
    private String email;
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    private boolean blocked;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "canteen_id")
    @JsonIgnore
    private Canteen canteen;

    public AppUser() {}

    public AppUser(Long id, String name, String email, String password, Role role, boolean blocked) {
        this(id, name, email, password, role, blocked, null);
    }

    public AppUser(Long id, String name, String email, String password, Role role, boolean blocked, Canteen canteen) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.blocked = blocked;
        this.canteen = canteen;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public boolean isBlocked() { return blocked; }
    public Canteen getCanteen() { return canteen; }
    public void setCanteen(Canteen canteen) { this.canteen = canteen; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }
}
