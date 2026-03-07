import unittest
import socket
import time
import subprocess
import os
import signal
import requests

class TestAFSSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Start the AFS system as a background process for all tests."""
        cls.log_file = "afs.log"
        # Ensure old log file is gone
        if os.path.exists(cls.log_file):
            os.remove(cls.log_file)

        # Add current directory to PYTHONPATH
        env = os.environ.copy()
        env["PYTHONPATH"] = "."

        cls.process = subprocess.Popen(
            ["python", "run_afs.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid,
            env=env
        )
        # Give it time to start
        time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        """Shut down the AFS system process."""
        if cls.process:
            try:
                os.killpg(os.getpgid(cls.process.pid), signal.SIGTERM)
                cls.process.wait(timeout=5)
            except Exception:
                pass

    def test_dashboard_accessible(self):
        """Verify the dashboard returns a 200 OK status and contains expected text."""
        url = "http://localhost:8000"
        try:
            response = requests.get(url, timeout=5)
            self.assertEqual(response.status_code, 200)
            self.assertIn("Welcome to the Autonomous Financial System (AFS) Dashboard", response.text)
        except requests.exceptions.RequestException as e:
            self.fail(f"Dashboard not accessible at {url}: {e}")

    def test_log_file_exists_and_has_content(self):
        """Verify that afs.log is created and contains initialization messages."""
        log_path = "afs.log"
        self.assertTrue(os.path.exists(log_path), "Log file 'afs.log' was not created.")

        with open(log_path, 'r') as f:
            content = f.read()

        # Check for core initialization logs
        self.assertIn("Starting Autonomous Financial System (AFS)...", content)
        self.assertIn("Security Layer: Ensuring data integrity", content)
        self.assertIn("Data Ingestion: Streaming market data", content)
        self.assertIn("Trading Engine: Analyzing data", content)
        self.assertIn("Learning Module: Continuously refining strategies", content)
        self.assertIn("AFS System is now operational.", content)

if __name__ == "__main__":
    unittest.main()
