
import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Setup directories
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    # Load the app
    page.goto("http://localhost:8080")
    page.wait_for_timeout(1000)

    # Click on the 'AI Optimizer' tab
    page.click("button[data-tab='optimizerTab']")
    page.wait_for_timeout(500)

    # Click on a strategy card to ensure it's selected (e.g., aiNeural)
    # The onclick handler is on the div.strategy-card
    page.click("div[data-strategy='aiNeural']")
    page.wait_for_timeout(500)

    # Run the AI Optimizer
    page.click("#optimizeStrategy")

    # Wait for optimization to complete (it should be faster now!)
    # We wait for the 'optimizerResults' to not have the 'no-data' class or just wait for the results to appear
    page.wait_for_selector("#optimizerResults:not(.no-data)", timeout=10000)
    page.wait_for_timeout(1000)

    # Take screenshot of the results
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
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
