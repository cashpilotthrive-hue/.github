import threading
import time
import random
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Server:
    def __init__(self, name, capacity=10):
        self.name = name
        self.capacity = capacity
        self.active_connections = 0
        self.lock = threading.Lock()

    def reserve_connection(self, request_id):
        """Atomically check capacity and increment active connections."""
        with self.lock:
            if self.active_connections >= self.capacity:
                logging.warning(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
                return False

            self.active_connections += 1
            cpu_load = self.active_connections / self.capacity
            logging.info(f"Request {request_id} assigned to {self.name}. Active connections: {self.active_connections}/{self.capacity} (CPU load: {cpu_load:.2%})")

            if cpu_load >= 0.8:
                logging.warning(f"ALERT: Server {self.name} is approaching high CPU load: {cpu_load:.2%}")
            return True

    def process_request(self, request_id, processing_time):
        """Simulate request processing and decrement connections on completion."""
        try:
            time.sleep(processing_time)
        finally:
            with self.lock:
                self.active_connections -= 1
                logging.info(f"Request {request_id} completed by {self.name}. Active connections: {self.active_connections}")

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def select_server(self):
        """Select the server with the fewest active connections."""
        best_server = None
        min_connections = float('inf')

        for server in self.servers:
            if server.active_connections < min_connections:
                min_connections = server.active_connections
                best_server = server

        return best_server

    def route_request(self, request_id, processing_time):
        """Route request to the least busy server without holding the global lock during processing."""
        server = None
        with self.lock:
            server = self.select_server()
            if server:
                # BOLT: Atomically reserve connection inside LB lock to avoid race conditions
                # where multiple threads pick the same server before its load is incremented.
                if not server.reserve_connection(request_id):
                    server = None

        if server:
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

    threads = []
    start_time = time.time()
    for i in range(50):
        thread = threading.Thread(target=simulate_request, args=(load_balancer, i))
        threads.append(thread)
        thread.start()
        time.sleep(random.uniform(0.01, 0.1))

    for thread in threads:
        thread.join()

    end_time = time.time()
    logging.info(f"All requests have been processed in {end_time - start_time:.2f} seconds.")
