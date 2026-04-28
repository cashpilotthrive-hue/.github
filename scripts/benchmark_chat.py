
import time
import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def benchmark_chat():
    # Large payload to make the optimization measurable
    large_content = "Is it time for coffee? " * 15000 # ~300KB
    payload = {
        "user_id": "user123",
        "messages": [
            {"role": "user", "content": large_content}
        ],
        "tools_enabled": True
    }

    # Warm up
    for _ in range(10):
        client.post("/chat", json=payload)

    start_time = time.perf_counter()
    iterations = 200
    for _ in range(iterations):
        client.post("/chat", json=payload)
    end_time = time.perf_counter()

    avg_latency = (end_time - start_time) / iterations * 1000
    print(f"Average /chat latency (300KB): {avg_latency:.4f} ms")

if __name__ == "__main__":
    benchmark_chat()
