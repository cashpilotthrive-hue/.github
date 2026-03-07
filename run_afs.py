import http.server
import socketserver
import threading
import time
import logging
import os

# Import modules
from data_ingestion.ingest import ingest_data
from trading_engine.engine import run_trading
from security_layer.layer import apply_security
from learning_module.module import learn_strategies

PORT = 8000
LOG_FILE = "afs.log"

# Setup logging to both console and file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

def start_dashboard():
    # Use the standard library's SimpleHTTPRequestHandler to serve the ui/ directory
    class DashboardHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            # Tell the handler to serve from the 'ui' directory
            super().__init__(*args, directory="ui", **kwargs)

        def log_message(self, format, *args):
            # Silence server logs in the main console
            pass

    # Allow address reuse to avoid "Address already in use" errors during quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        logging.info(f"AFS Dashboard available at http://localhost:{PORT}")
        httpd.serve_forever()

def main():
    logging.info("Starting Autonomous Financial System (AFS)...")
    time.sleep(0.5)

    apply_security()
    ingest_data()
    run_trading()
    learn_strategies()

    # Start the dashboard in a separate thread
    dashboard_thread = threading.Thread(target=start_dashboard, daemon=True)
    dashboard_thread.start()

    logging.info("AFS System is now operational.")

    try:
        while True:
            # Main system loop simulation
            time.sleep(10)
    except KeyboardInterrupt:
        logging.info("Shutting down AFS...")

if __name__ == "__main__":
    main()
