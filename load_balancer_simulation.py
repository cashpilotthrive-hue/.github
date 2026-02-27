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

    def reserve_connection(self):
        """Atomically reserve a connection if capacity allows."""
        with self.lock:
            if self.active_connections < self.capacity:
                self.active_connections += 1
                return True, self.active_connections
            return False, self.active_connections

    def release_connection(self):
        """Atomically release a connection."""
        with self.lock:
            self.active_connections -= 1
            return self.active_connections

    def handle_request(self, request_id, processing_time, current_load):
        """Process the request outside of connection locks."""
        logging.info(f"Request {request_id} assigned to {self.name}. Active connections: {current_load}/{self.capacity}")

        if current_load >= self.high_load_threshold:
            logging.warning(f"ALERT: Server {self.name} is approaching high CPU load: {current_load / self.capacity:.2%}")

        try:
            time.sleep(processing_time)
        finally:
            new_load = self.release_connection()
            logging.info(f"Request {request_id} completed by {self.name}. Active connections: {new_load}")


class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def select_and_reserve_server(self):
        """Select the least loaded server and reserve a connection atomically."""
        best_server = None
        min_connections = float('inf')

        # Heuristic search for the least loaded server
        for server in self.servers:
            # Direct attribute access is faster in Python
            current_connections = server.active_connections
            if current_connections < server.capacity and current_connections < min_connections:
                min_connections = current_connections
                best_server = server
                # Early exit: if we find an idle server, select it immediately
                if min_connections == 0:
                    break

        if best_server:
            # Reserve connection while holding LoadBalancer lock to ensure atomicity
            # and prevent over-assignment race conditions.
            success, load = best_server.reserve_connection()
            if success:
                return best_server, load

        return None, 0

    def route_request(self, request_id, processing_time):
        with self.lock:
            server, current_load = self.select_and_reserve_server()

        if server:
            server.handle_request(request_id, processing_time, current_load)
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
