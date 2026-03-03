import os
import sys

def verify_headers():
    files_to_check = ['netlify.toml', 'public/_headers', 'public/_redirects']
    for file in files_to_check:
        if not os.path.exists(file):
            print(f"Error: {file} is missing")
            return False

    # Check for security headers in netlify.toml
    with open('netlify.toml', 'r') as f:
        content = f.read()
        headers = [
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        for header in headers:
            if header not in content:
                print(f"Error: {header} missing in netlify.toml")
                return False

    print("All header checks passed!")
    return True

if __name__ == "__main__":
    if not verify_headers():
        sys.exit(1)
