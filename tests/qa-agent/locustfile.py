import os
import random
from locust import HttpUser, events, task, between
import datetime

# QA Persona v2 -- auto-generated tests
# Service: app
# Suite:   performance
# Source:  test_strategy/plans/app__performance.json
# Generated: 2024-05-24T15:30:00Z

SERVICE_URL = os.environ.get("SERVICE_URL", "http://localhost:8000").strip()
P95_MS_THRESHOLD = float(os.environ.get("PERF_P95_MS_THRESHOLD", "500"))
FAIL_RATIO_THRESHOLD = float(os.environ.get("PERF_FAIL_RATIO_THRESHOLD", "0.01"))

class TargetUser(HttpUser):
    """Simulates user behavior for the Smart Study Management System."""
    host = SERVICE_URL
    wait_time = between(0.5, 2.5)

    @task(3)
    def task_read_endpoints(self):
        """Covers various read-heavy endpoints.

        test_id: app__performance__002
        target: GET /api/v1/users/profile, GET /api/v1/flashcards/due, GET /api/v1/materials
        ac_ids: NFR-PERF-AC-3
        """
        endpoints = [
            "/api/v1/users/profile",
            "/api/v1/flashcards/due",
            "/api/v1/materials",
            "/api/v1/analytics/mastery",
            "/api/v1/schedule"
        ]
        self.client.get(random.choice(endpoints), name="/api/v1/[read_endpoints]")

    @task(1)
    def task_write_endpoints(self):
        """Covers various write-heavy endpoints.

        test_id: app__performance__001, app__performance__003
        target: POST /api/v1/flashcards/review, POST /api/v1/materials/upload
        ac_ids: NFR-PERF-AC-1, NFR-PERF-AC-4
        """
        # Simulate reviewing a flashcard
        review_payload = {
            "card_id": f"fc_perf_{random.randint(1, 1000)}",
            "rating": random.randint(1, 4) # 1: Again, 2: Hard, 3: Good, 4: Easy
        }
        self.client.post("/api/v1/flashcards/review", json=review_payload, name="/api/v1/flashcards/review")

        # Simulate uploading a new study material
        upload_payload = {
            "title": f"Perf Test Material {random.randint(1, 1000)}",
            "category": "Performance Testing",
            "format": "text",
            "content_text": "This is sample content for a performance test material upload."
        }
        self.client.post("/api/v1/materials/upload", json=upload_payload, name="/api/v1/materials/upload")

    @task(1)
    def health_check(self):
        """Simple health check task."""
        self.client.get("/health")

@events.test_stop.add_listener
def enforce_thresholds(environment, **kwargs):
    """Checks if performance thresholds were met and sets exit code accordingly."""
    stats = environment.stats.total
    fail_ratio = stats.fail_ratio
    p95_ms = stats.get_response_time_percentile(0.95)

    print(f"\n--- Performance Summary ---")
    print(f"Total Requests: {stats.num_requests}")
    print(f"Total Fails: {stats.num_failures}")
    print(f"Failure Ratio: {fail_ratio:.4f} (Threshold: {FAIL_RATIO_THRESHOLD:.4f})")
    if p95_ms is not None:
        print(f"P95 Response Time: {p95_ms:.2f} ms (Threshold: {P95_MS_THRESHOLD:.2f} ms)")
    else:
        print("P95 Response Time: N/A (not enough data)")
    print("-------------------------\n")

    if fail_ratio > FAIL_RATIO_THRESHOLD:
        print(f"FAIL: Failure ratio {fail_ratio:.4f} exceeded threshold {FAIL_RATIO_THRESHOLD:.4f}.")
        environment.process_exit_code = 1

    if p95_ms and p95_ms >= P95_MS_THRESHOLD:
        print(f"FAIL: P95 response time {p95_ms:.2f} ms exceeded threshold {P95_MS_THRESHOLD:.2f} ms.")
        environment.process_exit_code = 1

    if environment.process_exit_code == 0:
        print("PASS: All performance thresholds met.")
