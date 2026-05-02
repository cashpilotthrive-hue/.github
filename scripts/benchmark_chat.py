import time
import statistics
import sys
import os

# Add the project root to sys.path to import the app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "safe-assistant-app")))

from fastapi.testclient import TestClient
from backend.app import app

client = TestClient(app)

def benchmark_chat(payload, iterations=200):
    latencies = []
    # Warmup
    for _ in range(10):
        client.post("/chat", json=payload)

    for _ in range(iterations):
        start = time.perf_counter()
        response = client.post("/chat", json=payload)
        end = time.perf_counter()
        if response.status_code == 200:
            latencies.append((end - start) * 1000)
        else:
            print(f"Error: {response.status_code} - {response.text}")

    if not latencies:
        return None

    return {
        "mean": statistics.mean(latencies),
        "p95": statistics.quantiles(latencies, n=20)[18],
        "min": min(latencies),
        "max": max(latencies)
    }

if __name__ == "__main__":
    # Larger payload: ~1.5MB
    payload = {
        "user_id": "bench_user",
        "messages": [
            {"role": "user", "content": "Tell me about safety and time " * 50000}
        ],
        "tools_enabled": True
    }

    print("Running benchmark with ~1.5MB payload...")
    results = benchmark_chat(payload)
    if results:
        print(f"Mean latency: {results['mean']:.3f} ms")
        print(f"P95 latency: {results['p95']:.3f} ms")
        print(f"Min latency: {results['min']:.3f} ms")
        print(f"Max latency: {results['max']:.3f} ms")
