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

    def handle_request(self, request_id, processing_time):
        with self.lock:
            if self.active_connections >= self.capacity:
                logging.warning(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
                return

            self.active_connections += 1
            cpu_load = self.active_connections / self.capacity
            logging.info(f"Request {request_id} assigned to {self.name}. Active connections: {self.active_connections}/{self.capacity} (CPU load: {cpu_load:.2%})")

            if cpu_load >= 0.8:
                logging.warning(f"ALERT: Server {self.name} is approaching high CPU load: {cpu_load:.2%}")

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
            if server.active_connections < min_connections:
                min_connections = server.active_connections
                best_server = server

        return best_server

    def route_request(self, request_id, processing_time):
        with self.lock:
            server = self.select_server()
            if server:
                # The Server instance is responsible for checking its own capacity.
                server.handle_request(request_id, processing_time)
            else:
                logging.error(f"No servers available for request {request_id}.")

def simulate_request(load_balancer, request_id):
    processing_time = random.uniform(1.0, 3.0)
    load_balancer.route_request(request_id, processing_time)

if __name__ == "__main__":
    servers = [Server("Server-1"), Server("Server-2"), Server("Server-3")]
    load_balancer = LoadBalancer(servers)

    threads = []
    for i in range(50):
        thread = threading.Thread(target=simulate_request, args=(load_balancer, i))
        threads.append(thread)
        thread.start()
        time.sleep(random.uniform(0.01, 0.1))

    for thread in threads:
        thread.join()

    logging.info("All requests have been processed.")
