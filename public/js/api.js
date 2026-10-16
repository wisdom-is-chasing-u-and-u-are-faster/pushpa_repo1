/**
 * Smart Study Management System - Client API Module
 * Provides asynchronous fetch methods for all REST API contract endpoints.
 */

const API_BASE = "/api/v1";

const apiClient = {
    // Health Probe
    async checkHealth() {
        const res = await fetch("/health");
        return res.json();
    },

    // Auth & Profile
    async login(email, provider = "google") {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, provider })
        });
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    },

    async getProfile() {
        const res = await fetch(`${API_BASE}/users/profile`);
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
    },

    // Materials
    async uploadMaterial(data) {
        const res = await fetch(`${API_BASE}/materials/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Material ingestion failed");
        return res.json();
    },

    async listMaterials() {
        const res = await fetch(`${API_BASE}/materials`);
        if (!res.ok) throw new Error("Failed to fetch materials");
        return res.json();
    },

    // Flashcards & FSRS
    async generateFlashcards(materialId, count = 3) {
        const res = await fetch(`${API_BASE}/flashcards/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ material_id: materialId, count })
        });
        if (!res.ok) throw new Error("Flashcard synthesis failed");
        return res.json();
    },

    async getDueFlashcards() {
        const res = await fetch(`${API_BASE}/flashcards/due`);
        if (!res.ok) throw new Error("Failed to load due flashcards");
        return res.json();
    },

    async submitReview(cardId, rating) {
        const res = await fetch(`${API_BASE}/flashcards/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card_id: cardId, rating })
        });
        if (!res.ok) throw new Error("Review submission failed");
        return res.json();
    },

    // Quizzes
    async generateQuiz(materialId, questionCount = 3) {
        const res = await fetch(`${API_BASE}/quizzes/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ material_id: materialId, question_count: questionCount })
        });
        if (!res.ok) throw new Error("Quiz generation failed");
        return res.json();
    },

    async listQuizzes() {
        const res = await fetch(`${API_BASE}/quizzes`);
        if (!res.ok) throw new Error("Failed to list quizzes");
        return res.json();
    },

    async getQuiz(quizId) {
        const res = await fetch(`${API_BASE}/quizzes/${quizId}`);
        if (!res.ok) throw new Error("Failed to load quiz");
        return res.json();
    },

    async submitQuiz(quizId, answers) {
        const res = await fetch(`${API_BASE}/quizzes/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz_id: quizId, answers })
        });
        if (!res.ok) throw new Error("Quiz evaluation failed");
        return res.json();
    },

    // Study Schedule & Calendar
    async getSchedule() {
        const res = await fetch(`${API_BASE}/schedule`);
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
    },

    async rebalanceSchedule() {
        const res = await fetch(`${API_BASE}/schedule/rebalance`, {
            method: "POST"
        });
        if (!res.ok) throw new Error("Schedule rebalancing failed");
        return res.json();
    },

    // Analytics & Telemetry
    async getAnalytics() {
        const res = await fetch(`${API_BASE}/analytics/mastery`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
    }
};

// Global helper for UI notifications
function showNotification(message, isError = false) {
    let banner = document.getElementById("notification-banner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "notification-banner";
        banner.className = "banner";
        document.querySelector("main")?.prepend(banner);
    }
    banner.textContent = message;
    banner.className = `banner show ${isError ? 'banner-error' : 'banner-success'}`;
    setTimeout(() => {
        banner.className = "banner";
    }, 4000);
}

window.apiClient = apiClient;
window.showNotification = showNotification;
