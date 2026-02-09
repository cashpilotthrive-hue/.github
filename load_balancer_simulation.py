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
        # BOLT: Pre-calculate threshold to avoid floating-point division in hot path
        self.alert_threshold = capacity * 0.8

    def reserve_connection(self):
        """Atomically check capacity and increment active connections."""
        with self.lock:
            if self.active_connections >= self.capacity:
                return False, 0
            self.active_connections += 1
            return True, self.active_connections

    def process_request(self, request_id, processing_time):
        """Simulate request processing and decrement connections on completion."""
        try:
            time.sleep(processing_time)
        finally:
            current_connections = 0
            with self.lock:
                self.active_connections -= 1
                current_connections = self.active_connections
            # BOLT: Logging outside the lock to reduce contention
            logging.info(
                f"Request {request_id} completed by {self.name}. "
                f"Active connections: {current_connections}"
            )

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
        current_connections = 0

        with self.lock:
            server = self.select_server()
            if server:
                # BOLT: Atomically reserve connection inside LB lock
                success, current_connections = server.reserve_connection()
                if not success:
                    server = None

        if server:
            # BOLT: Logging outside the lock to reduce contention
            cpu_load = current_connections / server.capacity
            logging.info(
                f"Request {request_id} assigned to {server.name}. "
                f"Active connections: {current_connections}/{server.capacity} "
                f"(CPU load: {cpu_load:.2%})"
            )
            if current_connections >= server.alert_threshold:
                logging.warning(
                    f"ALERT: Server {server.name} is approaching high CPU load: {cpu_load:.2%}"
                )

            # BOLT: Process the request outside the LB lock
            server.process_request(request_id, processing_time)
        else:
            logging.error(f"No servers available or capacity reached for request {request_id}.")

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
