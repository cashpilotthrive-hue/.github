import threading
import time
import random

class Server:
    def __init__(self, name, capacity):
        self.name = name
        self.capacity = capacity
        self.current_load = 0
        self.lock = threading.Lock()

    def get_load(self):
        return self.current_load

    def process_request(self, request_id, processing_time):
        with self.lock:
            if self.current_load >= self.capacity:
                print(f"Server {self.name} is at full capacity. Request {request_id} rejected.")
                return False
            self.current_load += 1
            print(f"Request {request_id} assigned to Server {self.name}. Current load: {self.get_load()}/{self.capacity}")
            if self.get_load() / self.capacity >= 0.9:
                 print(f"ALERT: Server {self.name} is approaching 100% CPU load!")


        time.sleep(processing_time)

        with self.lock:
            self.current_load -= 1
            print(f"Request {request_id} finished on Server {self.name}. Current load: {self.get_load()}/{self.capacity}")
            return True

class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers

    def get_least_busy_server(self):
        min_load = float('inf')
        least_busy_server = None
        for server in self.servers:
            load = server.get_load()
            if load < min_load:
                min_load = load
                least_busy_server = server
        return least_busy_server

    def route_request(self, request_id, processing_time):
        server = self.get_least_busy_server()
        if server:
            thread = threading.Thread(target=server.process_request, args=(request_id, processing_time))
            thread.start()
            return thread
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

    threads = []
    for i in range(50):
        processing_time = random.uniform(0.1, 1.0)
        thread = load_balancer.route_request(i + 1, processing_time)
        if thread:
            threads.append(thread)
        time.sleep(random.uniform(0.01, 0.1))

    for thread in threads:
        thread.join()

    print("All requests have been processed.")
