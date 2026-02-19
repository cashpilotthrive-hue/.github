import sys
import os

def verify():
    # Final CI stability fix for Cloudflare and Netlify
    print("Verifying security headers...")
    headers_path = "public/_headers"
    if not os.path.exists(headers_path):
        print(f"Error: {headers_path} not found")
        return False

    with open(headers_path, 'r') as f:
        content = f.read()
        if "Content-Security-Policy" not in content:
            print("Error: CSP missing")
            return False
        if "Strict-Transport-Security" not in content:
            print("Error: HSTS missing")
            return False

    print("Verification successful!")
    return True

if __name__ == "__main__":
    if verify():
        sys.exit(0)
    else:
        sys.exit(1)
