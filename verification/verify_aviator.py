from playwright.sync_api import sync_playwright
import os
import http.server
import threading
import socketserver

def serve_static():
    os.chdir("aviator-ai-pro-lab")
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", 8000), handler) as httpd:
        httpd.serve_forever()

def run_cuj(page):
    page.goto("http://localhost:8000")
    page.wait_for_timeout(1000)

    # Start simulation
    page.get_by_role("button", name="Start Live Sim").click()
    page.wait_for_timeout(3000) # Let it run for a bit

    # Stop simulation
    page.get_by_role("button", name="Stop").click()
    page.wait_for_timeout(1000)

    # Run backtest
    page.get_by_role("button", name="Run Backtest").click()
    page.wait_for_timeout(2000)

    # Run AI Optimizer
    page.get_by_role("button", name="AI Optimizer").click()
    page.wait_for_timeout(500)
    page.get_by_role("button", name="Run AI Optimizer").click()
    page.wait_for_timeout(3000)

    # Take screenshot at the end
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    daemon = threading.Thread(target=serve_static, daemon=True)
    daemon.start()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
