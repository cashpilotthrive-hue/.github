import threading
import time
import random
import logging
import concurrent.futures

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class Server:
    def __init__(self, name, capacity=10):
        self.name = name
        self.capacity = capacity
        self.active_connections = 0
        self.lock = threading.Lock()

    def reserve_connection(self):
        with self.lock:
            if self.active_connections >= self.capacity:
                return False, self.active_connections
            self.active_connections += 1
            return True, self.active_connections

    def release_connection(self):
        with self.lock:
            self.active_connections -= 1
            return self.active_connections

    def handle_request(self, request_id, processing_time):
        """Deprecated: Use reserve_connection and release_connection for better concurrency."""
        with self.lock:
            if self.active_connections >= self.capacity:
                logging.warning(
                    f"Server {self.name} is at full capacity. Request {request_id} rejected."
                )
                return

            self.active_connections += 1
            cpu_load = self.active_connections / self.capacity
            logging.info(
                f"Request {request_id} assigned to {self.name}. Active connections: {self.active_connections}/{self.capacity} (CPU load: {cpu_load:.2%})"
            )

            if cpu_load >= 0.8:
                logging.warning(
                    f"ALERT: Server {self.name} is approaching high CPU load: {cpu_load:.2%}"
                )

        time.sleep(processing_time)

        with self.lock:
            self.active_connections -= 1
            logging.info(
                f"Request {request_id} completed by {self.name}. Active connections: {self.active_connections}"
            )


class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def select_server(self):
        best_server = None
        min_connections = float("inf")

        for server in self.servers:
            # Atomic selection: check capacity and find the least loaded server
            if server.active_connections < server.capacity:
                if server.active_connections < min_connections:
                    min_connections = server.active_connections
                    best_server = server

        return best_server

    def route_request(self, request_id, processing_time):
        server = None
        reserved = False
        current_connections = 0

        with self.lock:
            server = self.select_server()
            if server:
                reserved, current_connections = server.reserve_connection()

        if reserved:
            cpu_load = current_connections / server.capacity
            logging.info(
                f"Request {request_id} assigned to {server.name}. Active connections: {current_connections}/{server.capacity} (CPU load: {cpu_load:.2%})"
            )

            if cpu_load >= 0.8:
                logging.warning(
                    f"ALERT: Server {server.name} is approaching high CPU load: {cpu_load:.2%}"
                )

            try:
                time.sleep(processing_time)
            finally:
                final_connections = server.release_connection()
                logging.info(
                    f"Request {request_id} completed by {server.name}. Active connections: {final_connections}"
                )
        else:
            logging.error(f"No servers available for request {request_id}.")


def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)


if __name__ == "__main__":
    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    # Use ThreadPoolExecutor for modern concurrency management
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        for i in range(50):
            executor.submit(simulate_request, load_balancer, i)
            time.sleep(random.uniform(0.01, 0.1))

    logging.info("All requests have been processed.")
