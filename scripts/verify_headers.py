import sys
import os

def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} missing")
        return False
    return True

def verify_headers():
    required_files = ['netlify.toml', 'public/_headers', 'public/_redirects']
    for f in required_files:
        if not check_file_exists(f):
            return False

    # Simple check for security headers in _headers
    with open('public/_headers', 'r') as f:
        content = f.read()
        for header in ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options']:
            if header not in content:
                print(f"Error: Missing {header} in public/_headers")
                return False

    # Check consistency between netlify.toml and _headers
    with open('netlify.toml', 'r') as f:
        toml_content = f.read()
        if 'Content-Security-Policy' not in toml_content:
             print("Error: Missing CSP in netlify.toml")
             return False

    print("✓ Header and redirect configuration verification successful")
    return True

if __name__ == "__main__":
    if verify_headers():
        sys.exit(0)
    else:
        sys.exit(1)
