package com.persistent.sales.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "client_leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String email;

    private String targetSolution;

    @Column(length = 2000)
    private String inquiryNotes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Lead() {}

    public Lead(String clientName, String company, String email, String targetSolution, String inquiryNotes) {
        this.clientName = clientName;
        this.company = company;
        this.email = email;
        this.targetSolution = targetSolution;
        this.inquiryNotes = inquiryNotes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTargetSolution() { return targetSolution; }
    public void setTargetSolution(String targetSolution) { this.targetSolution = targetSolution; }
    public String getInquiryNotes() { return inquiryNotes; }
    public void setInquiryNotes(String inquiryNotes) { this.inquiryNotes = inquiryNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
