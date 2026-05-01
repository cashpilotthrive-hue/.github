import time
import asyncio
from typing import Any
import sys
import os

# Add the backend to sys.path so we can import the app
sys.path.append(os.path.join(os.getcwd(), "safe-assistant-app"))

from backend.app import app, ChatRequest, ChatMessage
from httpx import ASGITransport, AsyncClient

async def benchmark_chat():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a large payload to make the overhead more visible
        large_content = "This is a test message. " * 5000 # ~120KB
        payload = {
            "user_id": "test_user",
            "messages": [
                {"role": "user", "content": large_content}
            ],
            "tools_enabled": True
        }

        # Warm up
        await client.post("/chat", json=payload)

        start_time = time.perf_counter()
        iterations = 200
        for _ in range(iterations):
            await client.post("/chat", json=payload)
        end_time = time.perf_counter()

        avg_time = (end_time - start_time) / iterations
        print(f"Average time for /chat with {len(large_content)//1024}KB payload: {avg_time*1000:.3f}ms")

if __name__ == "__main__":
    asyncio.run(benchmark_chat())
