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
        self.heap_index = -1
        # Pre-calculate threshold for performance
        self.alert_threshold = capacity * 0.8

    def handle_request(self, request_id, processing_time, current_connections):
        # Passing current_connections avoids redundant lookups and ensures logging consistency
        load_pct = (current_connections / self.capacity) * 100
        logging.info(
            "Request %s assigned to %s. Active connections: %d/%d (CPU load: %.2f%%)",
            request_id,
            self.name,
            current_connections,
            self.capacity,
            load_pct,
        )

        if current_connections >= self.alert_threshold:
            logging.warning(
                "ALERT: Server %s is approaching high CPU load: %.2f%%",
                self.name,
                load_pct,
            )

        time.sleep(processing_time)

    def complete_request(self, request_id, current_connections):
        logging.info(
            "Request %s completed by %s. Active connections: %d",
            request_id,
            self.name,
            current_connections,
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
        node_conns = node.active_connections
        while i > 0:
            parent_idx = (i - 1) // 2
            parent = self.servers[parent_idx]
            if node_conns < parent.active_connections:
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
        node_conns = node.active_connections
        while True:
            child_idx = 2 * i + 1
            if child_idx >= n:
                break

            child = self.servers[child_idx]
            child_conns = child.active_connections

            # Choose the smaller child
            if child_idx + 1 < n:
                right_child = self.servers[child_idx + 1]
                right_conns = right_child.active_connections
                if right_conns < child_conns:
                    child_idx += 1
                    child = right_child
                    child_conns = right_conns

            if child_conns < node_conns:
                self.servers[i] = child
                child.heap_index = i
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
        current_conns = 0
        error_type = 0  # 0: None, 1: Full, 2: Unavailable

        with self.lock:
            server = self.select_server()
            if server:
                if server.active_connections < server.capacity:
                    # Atomic reservation: increment count and update heap position
                    server.active_connections += 1
                    current_conns = server.active_connections
                    self._sift_down(server.heap_index)
                    assigned_server = server
                else:
                    error_type = 1
            else:
                error_type = 2

        if assigned_server:
            try:
                # Processing happens outside the global lock to allow concurrency
                assigned_server.handle_request(
                    request_id, processing_time, current_conns
                )
            finally:
                # Atomic release: decrement count and update heap position
                with self.lock:
                    assigned_server.active_connections -= 1
                    current_conns = assigned_server.active_connections
                    self._sift_up(assigned_server.heap_index)
                assigned_server.complete_request(request_id, current_conns)
        elif error_type == 1:
            logging.error(
                "All servers at full capacity. Request %s rejected.", request_id
            )
        elif error_type == 2:
            logging.error("No servers available for request %s.", request_id)


def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)


if __name__ == "__main__":
    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    # Use ThreadPoolExecutor for efficient concurrent request handling
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        for i in range(50):
            executor.submit(simulate_request, load_balancer, i)
            time.sleep(random.uniform(0.01, 0.1))

    logging.info("All requests have been processed.")
