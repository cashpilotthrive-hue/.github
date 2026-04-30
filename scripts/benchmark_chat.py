import asyncio
import time
import os
import sys

# Ensure we can import from safe-assistant-app
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

import httpx
from backend.app import app

async def run_benchmark(iterations=200, payload_multiplier=10000):
    content = "Check if I have any time to talk about wire fraud. " * payload_multiplier
    payload = {
        "user_id": "benchmarker",
        "messages": [
            {"role": "user", "content": content}
        ],
        "tools_enabled": True,
        "vision_enabled": False,
        "voice_enabled": False,
        "memory_enabled": False
    }

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Warmup
        await client.post("/chat", json=payload)

        start_time = time.perf_counter()
        for _ in range(iterations):
            await client.post("/chat", json=payload)
        end_time = time.perf_counter()

    total_time = end_time - start_time
    avg_latency = (total_time / iterations) * 1000
    print(f"Benchmark Results ({iterations} iterations, payload size ~{len(content)//1024}KB):")
    print(f"  Total Time: {total_time:.4f}s")
    print(f"  Avg Latency: {avg_latency:.4f}ms")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
