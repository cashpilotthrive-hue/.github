import os
import sys

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} missing")
        return False
    print(f"✓ {filepath} exists")
    return True

def check_headers(filepath):
    if not os.path.exists(filepath):
        return False
    with open(filepath, 'r') as f:
        content = f.read()

    headers = [
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Content-Security-Policy",
        "Strict-Transport-Security"
    ]

    missing = []
    for h in headers:
        if h not in content:
            missing.append(h)

    if missing:
        print(f"Error: {filepath} missing headers: {', '.join(missing)}")
        return False
    print(f"✓ {filepath} has all mandatory headers")
    return True

def main():
    success = True
    success &= check_file_exists("netlify.toml")
    success &= check_file_exists("public/_headers")
    success &= check_file_exists("public/_redirects")
    success &= check_headers("netlify.toml")
    success &= check_headers("public/_headers")

    if not success:
        sys.exit(1)
    print("All header checks passed!")

if __name__ == "__main__":
    main()
