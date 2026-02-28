import sys
import os

def verify():
    print("Verifying CI infrastructure...")
    files = ['netlify.toml', 'public/_headers', 'public/_redirects', 'public/index.html']
    for f in files:
        if not os.path.exists(f):
            print(f"Error: {f} missing")
            return False

    with open('public/_headers', 'r') as f:
        content = f.read()
        if "Content-Security-Policy" not in content or "Strict-Transport-Security" not in content:
            print("Error: Security headers missing in public/_headers")
            return False

    print("✓ Verification successful")
    return True

if __name__ == "__main__":
    if verify():
        sys.exit(0)
    else:
        sys.exit(1)
