
import time
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def benchmark_chat():
    # Larger payload to make string operations more significant
    payload = {
        "user_id": "test-user",
        "messages": [
            {"role": "user", "content": "Hello, what time is it? " * 5000}
        ],
        "tools_enabled": True,
        "vision_enabled": True,
        "voice_enabled": True,
        "memory_enabled": True
    }

    # Warm up
    for _ in range(20):
        client.post("/chat", json=payload)

    start_time = time.perf_counter()
    iterations = 200
    for _ in range(iterations):
        client.post("/chat", json=payload)
    end_time = time.perf_counter()

    avg_time = (end_time - start_time) / iterations
    print(f"Average /chat response time: {avg_time*1000:.4f}ms")

if __name__ == "__main__":
    benchmark_chat()
