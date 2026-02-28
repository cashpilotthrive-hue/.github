import os
import sys

def verify_infrastructure():
    required_files = [
        "netlify.toml",
        "public/_headers",
        "public/_redirects"
    ]

    success = True
    for f in required_files:
        if os.path.exists(f):
            print(f"  [OK] Found {f}")
        else:
            print(f"  [FAIL] Missing {f}")
            success = False

    if not success:
        return False

    # Basic check for security headers in netlify.toml
    with open("netlify.toml", "r") as f:
        content = f.read()
        for header in ["X-Frame-Options", "X-Content-Type-Options", "Content-Security-Policy", "Strict-Transport-Security"]:
            if header in content:
                print(f"  [OK] Found {header} in netlify.toml")
            else:
                print(f"  [FAIL] Missing {header} in netlify.toml")
                success = False

    return success

if __name__ == "__main__":
    print("Verifying CI infrastructure headers...")
    if verify_infrastructure():
        print("\nVerification successful!")
        sys.exit(0)
    else:
        print("\nVerification failed!")
        sys.exit(1)
