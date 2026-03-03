import os
import sys

def check_file_exists(filepath):
    if os.path.exists(filepath):
        print(f"  [OK] Found {filepath}")
        return True
    else:
        print(f"  [FAIL] Missing {filepath}")
        return False

def check_header_content(filepath, expected_headers):
    if not os.path.exists(filepath):
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    success = True
    for header in expected_headers:
        if header in content:
            print(f"  [OK] Found header {header} in {filepath}")
        else:
            print(f"  [FAIL] Missing header {header} in {filepath}")
            success = False
    return success

if __name__ == "__main__":
    print("Verifying CI infrastructure files...")
    success = True

    # Check core infrastructure files
    success &= check_file_exists("netlify.toml")
    success &= check_file_exists("wrangler.toml")
    success &= check_file_exists("public/_headers")
    success &= check_file_exists("public/_redirects")
    success &= check_file_exists("public/index.html")

    # Check for mandatory security headers in netlify.toml and _headers
    expected_headers = [
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Content-Security-Policy",
        "Strict-Transport-Security"
    ]

    print("\nVerifying security headers in netlify.toml...")
    success &= check_header_content("netlify.toml", expected_headers)

    print("\nVerifying security headers in public/_headers...")
    success &= check_header_content("public/_headers", expected_headers)

    if success:
        print("\nCI infrastructure verification passed!")
        sys.exit(0)
    else:
        print("\nCI infrastructure verification failed!")
        sys.exit(1)
