package com.persistent.sales.model;

import jakarta.persistence.*;

@Entity
@Table(name = "solutions")
public class Solution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(length = 1000)
    private String description;

    private String leadContact;
    private String leadEmail;
    private String roiForecast;

    public Solution() {}

    public Solution(String name, String category, String description, String leadContact, String leadEmail, String roiForecast) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.leadContact = leadContact;
        this.leadEmail = leadEmail;
        this.roiForecast = roiForecast;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLeadContact() { return leadContact; }
    public void setLeadContact(String leadContact) { this.leadContact = leadContact; }
    public String getLeadEmail() { return leadEmail; }
    public void setLeadEmail(String leadEmail) { this.leadEmail = leadEmail; }
    public String getRoiForecast() { return roiForecast; }
    public void setRoiForecast(String roiForecast) { this.roiForecast = roiForecast; }
}
