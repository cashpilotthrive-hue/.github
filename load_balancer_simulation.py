import asyncio
import random
import time
import operator
from typing import List, Optional

class Server:
    """Represents a backend server in the load balancer simulation."""

    def __init__(self, name: str, capacity: int):
        self.name = name
        self.capacity = capacity
        self.current_load = 0
        # BOLT: Pre-calculate threshold to avoid division in hot path
        self.alert_threshold = capacity * 0.9

    async def process_request(self, request_id: int, processing_time: float) -> bool:
        """Simulates processing a request on this server."""
        # BOLT: In asyncio, we don't need locks for simple attribute updates
        # as long as we don't yield (await) between check and increment.
        if self.current_load >= self.capacity:
            print(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
            return False

        self.current_load += 1
        load = self.current_load
        alert = load >= self.alert_threshold

        print(f"Request {request_id} assigned to Server {self.name}. Current load: {load}/{self.capacity}")
        if alert:
            print(f"ALERT: Server {self.name} is approaching 100% CPU load!")

        # Simulate I/O bound processing time
        await asyncio.sleep(processing_time)

        self.current_load -= 1
        load = self.current_load

        print(f"Request {request_id} finished on Server {self.name}. Current load: {load}/{self.capacity}")
        return True

class LoadBalancer:
    """Least Connections Load Balancer simulation."""

    # BOLT: Pre-calculate the attrgetter to avoid redundant callable creation
    _load_getter = operator.attrgetter('current_load')

    def __init__(self, servers: List[Server]):
        self.servers = servers

    def get_least_busy_server(self) -> Optional[Server]:
        """Finds the server with the fewest active connections and available capacity."""
        # BOLT: Using a generator expression with min(..., default=None)
        return min((s for s in self.servers if s.current_load < s.capacity),
                   key=self._load_getter,
                   default=None)

    async def route_request(self, request_id: int, processing_time: float):
        """Routes an incoming request to the best available server."""
        server = self.get_least_busy_server()
        if server:
            # BOLT: Using asyncio tasks is significantly more efficient than threads for I/O simulations
            return asyncio.create_task(server.process_request(request_id, processing_time))
        else:
            print(f"No servers available to handle Request {request_id}.")
            return None

async def main():
    """Main simulation loop."""
    servers = [
        Server("Server-1", 10),
        Server("Server-2", 10),
        Server("Server-3", 10)
    ]

    load_balancer = LoadBalancer(servers)

    tasks = []
    for i in range(50):
        processing_time = random.uniform(0.1, 1.0)
        task = await load_balancer.route_request(i + 1, processing_time)
        if task:
            tasks.append(task)
        # Simulate request arrival interval
        await asyncio.sleep(random.uniform(0.01, 0.1))

    # Wait for all scheduled requests to complete
    if tasks:
        await asyncio.gather(*tasks)

    print("All requests have been processed.")

if __name__ == "__main__":
    start_time = time.perf_counter()
    asyncio.run(main())
    end_time = time.perf_counter()
    print(f"Simulation completed in {end_time - start_time:.2f} seconds.")
