import os
from playwright.sync_api import sync_playwright

def test_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        file_path = "file://" + os.path.abspath("public/index.html")
        page.goto(file_path)

        # Take a screenshot
        page.screenshot(path="frontend_verification.png")

        # Verify metadata
        build_id = page.locator("#build-id").inner_text()
        timestamp = page.locator("#timestamp").inner_text()

        print(f"Build ID: {build_id}")
        print(f"Timestamp: {timestamp}")

        assert "1771219342564672041" in build_id
        assert "2026-03-27 17:15:00 UTC" in timestamp

        # Check all list items in .perf-box ul
        items = page.locator(".perf-box ul li").all_inner_texts()
        print(f"Found {len(items)} items:")
        for i, item in enumerate(items):
            print(f"  {i}: '{item}'")

        # Match with backticks and allow for any whitespace/special chars
        target = "Added idempotency check to `setup-dotfiles.sh`"
        found = any(target in item for item in items)
        assert found, f"Optimization item '{target}' not found in list"

        browser.close()

if __name__ == "__main__":
    test_frontend()
