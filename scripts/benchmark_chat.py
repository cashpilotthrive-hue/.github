import time
import json
import os
import sys
from typing import Any

# Add the app directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def benchmark_chat(iterations: int = 100, payload_size_kb: int = 100):
    # Create a large message to make the overhead of .lower() and validation noticeable
    large_content = "This is a test message. " * (payload_size_kb * 1024 // 24)
    payload = {
        "user_id": "bench_user",
        "messages": [
            {"role": "user", "content": large_content + " what time is it?"}
        ],
        "tools_enabled": True,
        "vision_enabled": True,
        "voice_enabled": True,
        "memory_enabled": True
    }

    print(f"Benchmarking /chat with {payload_size_kb}KB payload, {iterations} iterations...")

    # Warmup
    client.post("/chat", json=payload)

    times = []
    for _ in range(iterations):
        start_time = time.perf_counter()
        client.post("/chat", json=payload)
        end_time = time.perf_counter()
        times.append((end_time - start_time) * 1000)

    avg_time = sum(times) / iterations
    print(f"Average time per request: {avg_time:.2f}ms")
    return avg_time

if __name__ == "__main__":
    benchmark_chat(iterations=200, payload_size_kb=500)
