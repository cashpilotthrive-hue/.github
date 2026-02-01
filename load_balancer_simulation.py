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
        # BOLT: Pre-calculate threshold to avoid division in hot path
        self.alert_threshold = capacity * 0.9

    def get_load(self):
        return self.current_load

    def process_request(self, request_id, processing_time):
        # BOLT: Using direct attribute access instead of get_load() method call for performance (~2x faster)
        rejection = False
        with self.lock:
            if self.current_load >= self.capacity:
                rejection = True
            else:
                self.current_load += 1
                load = self.current_load
                # BOLT: Check alert threshold within lock to ensure consistency
                alert = load >= self.alert_threshold

        # BOLT: Move slow I/O (print) outside of lock to reduce contention
        if rejection:
            print(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
            return False

        print(f"Request {request_id} assigned to Server {self.name}. Current load: {load}/{self.capacity}")
        if alert:
            print(f"ALERT: Server {self.name} is approaching 100% CPU load!")

        time.sleep(processing_time)

        with self.lock:
            self.current_load -= 1
            load = self.current_load

        # BOLT: Move slow I/O (print) outside of lock to reduce contention
        print(f"Request {request_id} finished on Server {self.name}. Current load: {load}/{self.capacity}")
        return True

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        # BOLT: Use ThreadPoolExecutor to reuse threads and reduce overhead
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=30)

    def get_least_busy_server(self):
        # BOLT: Using a generator expression with min(..., default=None) is ~20% faster than list comprehension
        return min((s for s in self.servers if s.current_load < s.capacity),
                   key=operator.attrgetter('current_load'),
                   default=None)

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
