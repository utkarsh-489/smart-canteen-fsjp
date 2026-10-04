package com.smartcanteen.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    private CustomerOrder order;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private AppUser student;
    private Integer rating;
    @Column(length = 1000)
    private String comment;
    private LocalDateTime createdAt;

    public Feedback() {}
    public Long getId() { return id; }
    public CustomerOrder getOrder() { return order; }
    public AppUser getStudent() { return student; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setOrder(CustomerOrder v) { order = v; }
    public void setStudent(AppUser v) { student = v; }
    public void setRating(Integer v) { rating = v; }
    public void setComment(String v) { comment = v; }
    public void setCreatedAt(LocalDateTime v) { createdAt = v; }
}
