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
        self.heap_index = -1

    def handle_request(self, request_id, processing_time):
        # Work is simulated here. Connection management is handled by the LoadBalancer
        # for atomic heap updates and better concurrency.
        cpu_load = self.active_connections / self.capacity
        logging.info(
            f"Request {request_id} assigned to {self.name}. "
            f"Active connections: {self.active_connections}/{self.capacity} "
            f"(CPU load: {cpu_load:.2%})"
        )

        if cpu_load >= 0.8:
            logging.warning(
                f"ALERT: Server {self.name} is approaching high CPU load: {cpu_load:.2%}"
            )

        time.sleep(processing_time)

    def complete_request(self, request_id):
        logging.info(
            f"Request {request_id} completed by {self.name}. Active connections: {self.active_connections}"
        )


class LoadBalancer:
    def __init__(self, servers):
        self.servers = list(servers)
        self.lock = threading.Lock()
        # Initialize heap indexes
        for i, server in enumerate(self.servers):
            server.heap_index = i
        # Build heap to ensure the heap property is satisfied from the start.
        for i in range(len(self.servers) // 2 - 1, -1, -1):
            self._sift_down(i)

    def _sift_up(self, i):
        node = self.servers[i]
        while i > 0:
            parent_idx = (i - 1) // 2
            parent = self.servers[parent_idx]
            if node.active_connections < parent.active_connections:
                self.servers[i] = parent
                parent.heap_index = i
                i = parent_idx
            else:
                break
        self.servers[i] = node
        node.heap_index = i

    def _sift_down(self, i):
        n = len(self.servers)
        node = self.servers[i]
        while True:
            child_idx = 2 * i + 1
            if child_idx >= n:
                break
            # Choose the smaller child
            if (
                child_idx + 1 < n
                and self.servers[child_idx + 1].active_connections
                < self.servers[child_idx].active_connections
            ):
                child_idx += 1

            if self.servers[child_idx].active_connections < node.active_connections:
                self.servers[i] = self.servers[child_idx]
                self.servers[i].heap_index = i
                i = child_idx
            else:
                break
        self.servers[i] = node
        node.heap_index = i

    def select_server(self):
        if not self.servers:
            return None
        # In a min-heap, the server with the fewest connections is always at the root.
        return self.servers[0]

    def route_request(self, request_id, processing_time):
        assigned_server = None
        with self.lock:
            server = self.select_server()
            if server:
                if server.active_connections < server.capacity:
                    # Atomic reservation: increment count and update heap position
                    server.active_connections += 1
                    self._sift_down(server.heap_index)
                    assigned_server = server
                else:
                    logging.error(
                        f"All servers at full capacity. Request {request_id} rejected."
                    )
            else:
                logging.error(f"No servers available for request {request_id}.")

        if assigned_server:
            try:
                # Processing happens outside the global lock to allow concurrency
                assigned_server.handle_request(request_id, processing_time)
            finally:
                # Atomic release: decrement count and update heap position
                with self.lock:
                    assigned_server.active_connections -= 1
                    self._sift_up(assigned_server.heap_index)
                assigned_server.complete_request(request_id)


def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)


if __name__ == "__main__":
    import concurrent.futures

    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    # Use ThreadPoolExecutor for efficient concurrent request handling
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        for i in range(50):
            executor.submit(simulate_request, load_balancer, i)
            time.sleep(random.uniform(0.01, 0.1))

    logging.info("All requests have been processed.")
