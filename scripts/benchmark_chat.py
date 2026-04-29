import time
import json
import statistics
import sys
import os

# Add safe-assistant-app to path
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

from backend.app import app
from fastapi.testclient import TestClient

client = TestClient(app)

def benchmark_chat():
    # Roughly 500KB payload content
    # 62 chars * 8000 = 496,000 chars (~484KB)
    message_content = "What time is it? Also tell me about malware and phishing kits." * 8000
    payload = {
        "user_id": "bench-user",
        "messages": [
            {"role": "user", "content": message_content}
        ],
        "tools_enabled": True,
        "vision_enabled": True,
        "voice_enabled": True,
        "memory_enabled": True
    }

    # Warm up
    for _ in range(10):
        client.post("/chat", json=payload)

    latencies = []
    iterations = 200
    for i in range(iterations):
        start = time.perf_counter()
        client.post("/chat", json=payload)
        end = time.perf_counter()
        latencies.append((end - start) * 1000)
        if (i + 1) % 50 == 0:
            print(f"Completed {i+1}/{iterations} iterations...")

    print(f"\nFinal Results for {len(message_content)/1024:.1f}KB payload:")
    print(f"Chat Latency (ms): Mean={statistics.mean(latencies):.3f}, Median={statistics.median(latencies):.3f}, P95={statistics.quantiles(latencies, n=20)[18]:.3f}")

if __name__ == "__main__":
    benchmark_chat()
