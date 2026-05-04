import time
import json
import statistics
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def benchmark_chat():
    # Large payload to amplify differences
    payload = {
        "user_id": "user123",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Tell me about time " + "and " * 25000 + "what it is."}
        ],
        "tools_enabled": True
    }

    iterations = 200
    latencies = []

    # Warmup
    for _ in range(10):
        client.post("/chat", json=payload)

    for _ in range(iterations):
        start = time.perf_counter()
        response = client.post("/chat", json=payload)
        end = time.perf_counter()
        assert response.status_code == 200
        latencies.append((end - start) * 1000)

    print(f"Benchmark results for /chat ({iterations} iterations):")
    print(f"  Mean: {statistics.mean(latencies):.3f} ms")
    print(f"  P95:  {statistics.quantiles(latencies, n=20)[18]:.3f} ms")
    print(f"  Max:  {max(latencies):.3f} ms")

if __name__ == "__main__":
    benchmark_chat()
