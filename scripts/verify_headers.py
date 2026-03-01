import os
import sys

def verify():
    files = ['netlify.toml', 'public/_headers', 'public/_redirects']
    for f in files:
        if not os.path.exists(f):
            print(f"Missing {f}")
            return False

    # Check for mandatory headers in netlify.toml
    with open('netlify.toml', 'r') as f:
        content = f.read()
        mandatory = ['X-Frame-Options', 'X-Content-Type-Options', 'Content-Security-Policy', 'Strict-Transport-Security']
        for h in mandatory:
            if h not in content:
                print(f"Missing header {h} in netlify.toml")
                return False

    print("Verification passed")
    return True

if __name__ == "__main__":
    if verify():
        sys.exit(0)
    else:
        sys.exit(1)
