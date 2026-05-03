import time
import json
import statistics
import os
import sys

# Add safe-assistant-app directory to sys.path so we can import from backend.app
sys.path.append(os.path.abspath("safe-assistant-app"))

from backend.app import app
from fastapi.testclient import TestClient

client = TestClient(app)

def benchmark_chat(payload_size=1000, iterations=100):
    content = "This is a test message. " * payload_size
    # Ensure it doesn't trigger tool or moderation for baseline
    payload = {
        "user_id": "test_user",
        "messages": [
            {"role": "user", "content": content}
        ],
        "tools_enabled": True,
        "vision_enabled": True,
        "voice_enabled": True,
        "memory_enabled": True
    }

    latencies = []
    for _ in range(iterations):
        start_time = time.perf_counter()
        response = client.post("/chat", json=payload)
        end_time = time.perf_counter()
        if response.status_code != 200:
            print(f"Error: {response.status_code} - {response.text}")
            continue
        latencies.append((end_time - start_time) * 1000)

    return latencies

if __name__ == "__main__":
    print("Benchmarking /chat endpoint...")
    # Small payload
    small_latencies = benchmark_chat(payload_size=10, iterations=200)
    print(f"Small payload (10 reps): Mean={statistics.mean(small_latencies):.3f}ms, P95={statistics.quantiles(small_latencies, n=20)[18]:.3f}ms")

    # Large payload
    large_latencies = benchmark_chat(payload_size=5000, iterations=100)
    print(f"Large payload (5000 reps): Mean={statistics.mean(large_latencies):.3f}ms, P95={statistics.quantiles(large_latencies, n=20)[18]:.3f}ms")
