import threading
import time
import random
import logging
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Server:
    def __init__(self, name, capacity=10):
        self.name = name
        self.capacity = capacity
        self.active_connections = 0
        self.lock = threading.Lock()
        # BOLT: Pre-calculate threshold to avoid redundant floating-point division in the hot path.
        self.high_load_threshold = capacity * 0.8

    def reserve_connection(self):
        """Atomically check capacity and increment active connections. Returns count if successful, else None."""
        with self.lock:
            if self.active_connections >= self.capacity:
                return None

            self.active_connections += 1
            return self.active_connections

    def process_request(self, request_id, processing_time):
        """Simulate request processing and decrement connections on completion."""
        try:
            time.sleep(processing_time)
        finally:
            with self.lock:
                self.active_connections -= 1
                connections = self.active_connections
            # BOLT: Logging outside the lock to reduce contention.
            logging.info(f"Request {request_id} completed by {self.name}. Active connections: {connections}")

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def select_server(self):
        """Select the server with the fewest active connections that has available capacity."""
        best_server = None
        min_connections = float('inf')

        for server in self.servers:
            # BOLT: Prioritize capacity check to avoid selecting full servers.
            # We check current_load < min_connections first as it's a faster filter.
            current_load = server.active_connections
            if current_load < min_connections and current_load < server.capacity:
                min_connections = current_load
                best_server = server
                if min_connections == 0:
                    break

        return best_server

    def route_request(self, request_id, processing_time):
        """Route request to the least busy server without holding the global lock during processing."""
        server = None
        connections = 0
        with self.lock:
            server = self.select_server()
            if server:
                # BOLT: Atomically reserve connection inside LB lock to avoid race conditions.
                connections = server.reserve_connection()
                if connections is None:
                    server = None

        if server:
            # BOLT: Logging and calculations moved outside the global LB lock to reduce contention.
            logging.info(f"Request {request_id} assigned to {server.name}. Active connections: {connections}/{server.capacity}")
            if connections >= server.high_load_threshold:
                logging.warning(f"ALERT: Server {server.name} is approaching high load: {connections / server.capacity:.2%}")
            # BOLT: Process the request outside the LB lock to allow other requests to be routed concurrently.
            server.process_request(request_id, processing_time)
        else:
            logging.error(f"No servers available for request {request_id}.")

def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)

if __name__ == "__main__":
    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    start_time = time.time()
    # BOLT: Use ThreadPoolExecutor for efficient thread reuse and resource management.
    with ThreadPoolExecutor(max_workers=50) as executor:
        for i in range(50):
            executor.submit(simulate_request, load_balancer, i)
            time.sleep(random.uniform(0.01, 0.1))

    end_time = time.time()
    logging.info(f"All requests have been processed in {end_time - start_time:.2f} seconds.")
