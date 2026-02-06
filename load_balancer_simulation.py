import threading
import time
import random
import logging
import concurrent.futures

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Server:
    def __init__(self, name, capacity=10):
        self.name = name
        self.capacity = capacity
        self.active_connections = 0
        self.lock = threading.Lock()
        # Pre-calculate high load threshold to avoid floating-point division in hot path
        self.high_load_threshold = capacity * 0.8

    def handle_request(self, request_id, processing_time):
        with self.lock:
            if self.active_connections >= self.capacity:
                logging.warning(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
                return

            self.active_connections += 1
            # Cache active_connections for slightly faster access
            curr_load = self.active_connections
            logging.info(f"Request {request_id} assigned to {self.name}. Active connections: {curr_load}/{self.capacity}")

            if curr_load >= self.high_load_threshold:
                logging.warning(f"ALERT: Server {self.name} is approaching high CPU load: {curr_load / self.capacity:.2%}")

        time.sleep(processing_time)

        with self.lock:
            self.active_connections -= 1
            logging.info(f"Request {request_id} completed by {self.name}. Active connections: {self.active_connections}")


class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def select_server(self):
        best_server = None
        min_connections = float('inf')

        for server in self.servers:
            # Use direct attribute access for performance
            current_connections = server.active_connections
            # Skip servers at full capacity and find the one with the least connections
            if current_connections < server.capacity and current_connections < min_connections:
                min_connections = current_connections
                best_server = server
                # Early exit: if we find a server with 0 connections, select it immediately
                if min_connections == 0:
                    break

        return best_server

    def route_request(self, request_id, processing_time):
        with self.lock:
            server = self.select_server()

        if server:
            # Move the actual request handling outside the global lock to prevent serialization.
            # Each Server has its own lock for thread-safe connection counting.
            server.handle_request(request_id, processing_time)
        else:
            logging.error(f"No servers available for request {request_id}.")

def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)

if __name__ == "__main__":
    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    # Use ThreadPoolExecutor for better resource management and thread reuse
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        for i in range(50):
            executor.submit(simulate_request, load_balancer, i)
            time.sleep(random.uniform(0.01, 0.1))

    logging.info("All requests have been processed.")
