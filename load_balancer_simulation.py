import threading
import time
import random
import logging

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
        """Atomically check capacity and increment active connections."""
        with self.lock:
            if self.active_connections < self.capacity:
                self.active_connections += 1
                return True, self.active_connections
            return False, self.active_connections

    def process_request(self, request_id, processing_time):
        """Simulate request processing and decrement connections on completion."""
        try:
            time.sleep(processing_time)
        finally:
            with self.lock:
                self.active_connections -= 1
                current_connections = self.active_connections
            logging.info(
                f"Request {request_id} completed by {self.name}. Active connections: {current_connections}"
            )


class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.lock = threading.Lock()

    def route_request(self, request_id, processing_time):
        """Route request to the least busy server without holding the global lock during processing."""
        selected_server = None
        current_load = 0
        with self.lock:
            # Heuristic: try servers in order of current load to find the best available one.
            # This ensures we don't reject a request if any server has capacity.
            for server in sorted(self.servers, key=lambda s: s.active_connections):
                success, load = server.reserve_connection()
                if success:
                    selected_server = server
                    current_load = load
                    break

        if selected_server:
            cpu_load = current_load / selected_server.capacity
            logging.info(
                f"Request {request_id} assigned to {selected_server.name}. Active connections: {current_load}/{selected_server.capacity} (CPU load: {cpu_load:.2%})"
            )
            if cpu_load >= 0.8:
                logging.warning(
                    f"ALERT: Server {selected_server.name} is approaching high CPU load: {cpu_load:.2%}"
                )
            selected_server.process_request(request_id, processing_time)
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
    logging.info(
        f"All requests have been processed in {end_time - start_time:.2f} seconds."
    )
