package com.smartcanteen.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String tokenNumber;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private AppUser student;
    @Column(nullable = false)
    private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    private String paymentStatus;
    private String paymentMethod;
    private Integer estimatedMinutes;
    @Transient
    private Integer queuePosition;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime readyAt;
    private LocalDateTime collectedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public CustomerOrder() {}

    public Long getId() { return id; }
    public String getTokenNumber() { return tokenNumber; }
    public AppUser getStudent() { return student; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public Integer getQueuePosition() { return queuePosition; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public LocalDateTime getReadyAt() { return readyAt; }
    public LocalDateTime getCollectedAt() { return collectedAt; }
    public List<OrderItem> getItems() { return items; }

    public void setTokenNumber(String v) { tokenNumber = v; }
    public void setStudent(AppUser v) { student = v; }
    public void setTotalAmount(BigDecimal v) { totalAmount = v; }
    public void setStatus(OrderStatus v) { status = v; }
    public void setPaymentStatus(String v) { paymentStatus = v; }
    public void setPaymentMethod(String v) { paymentMethod = v; }
    public void setEstimatedMinutes(Integer v) { estimatedMinutes = v; }
    public void setQueuePosition(Integer v) { queuePosition = v; }
    public void setNotes(String v) { notes = v; }
    public void setCreatedAt(LocalDateTime v) { createdAt = v; }
    public void setAcceptedAt(LocalDateTime v) { acceptedAt = v; }
    public void setReadyAt(LocalDateTime v) { readyAt = v; }
    public void setCollectedAt(LocalDateTime v) { collectedAt = v; }
}
