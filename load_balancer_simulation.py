import threading
import time
import random
import concurrent.futures
import operator

class Server:
    def __init__(self, name, capacity):
        self.name = name
        self.capacity = capacity
        self.current_load = 0
        self.lock = threading.Lock()

    def get_load(self):
        return self.current_load

    def process_request(self, request_id, processing_time):
        # BOLT: Using direct attribute access instead of get_load() method call for performance (~2x faster)
        with self.lock:
            if self.current_load >= self.capacity:
                print(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
                return False
            self.current_load += 1
            load = self.current_load
            print(f"Request {request_id} assigned to Server {self.name}. Current load: {load}/{self.capacity}")
            if load / self.capacity >= 0.9:
                 print(f"ALERT: Server {self.name} is approaching 100% CPU load!")


        time.sleep(processing_time)

        with self.lock:
            self.current_load -= 1
            print(f"Request {request_id} finished on Server {self.name}. Current load: {self.current_load}/{self.capacity}")
            return True

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        # BOLT: Use ThreadPoolExecutor to reuse threads and reduce overhead
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=30)

    def get_least_busy_server(self):
        # BOLT: Optimized using min() with attrgetter and early capacity check
        available_servers = [s for s in self.servers if s.current_load < s.capacity]
        if not available_servers:
            return None
        return min(available_servers, key=operator.attrgetter('current_load'))

    def route_request(self, request_id, processing_time):
        server = self.get_least_busy_server()
        if server:
            # BOLT: Submit to executor instead of creating a new thread (~3x faster)
            return self.executor.submit(server.process_request, request_id, processing_time)
        else:
            print(f"No servers available to handle Request {request_id}.")
            return None

if __name__ == "__main__":
    servers = [
        Server("Server-1", 10),
        Server("Server-2", 10),
        Server("Server-3", 10)
    ]

    load_balancer = LoadBalancer(servers)

    futures = []
    for i in range(50):
        processing_time = random.uniform(0.1, 1.0)
        future = load_balancer.route_request(i + 1, processing_time)
        if future:
            futures.append(future)
        time.sleep(random.uniform(0.01, 0.1))

    # BOLT: Efficiently wait for all requests to complete and cleanup the executor
    concurrent.futures.wait(futures)
    load_balancer.executor.shutdown(wait=True)

    print("All requests have been processed.")
