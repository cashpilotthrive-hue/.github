import os
import sys

def check_netlify_toml():
    print("Checking netlify.toml...")
    if not os.path.exists("netlify.toml"):
        print("  [FAIL] netlify.toml missing")
        return False
    with open("netlify.toml", "r") as f:
        content = f.read()
        expected = [
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        for h in expected:
            if h not in content:
                print(f"  [FAIL] {h} missing in netlify.toml")
                return False
    print("  [OK] netlify.toml headers present")
    return True

def check_public_headers():
    print("Checking public/_headers...")
    if not os.path.exists("public/_headers"):
        print("  [FAIL] public/_headers missing")
        return False
    with open("public/_headers", "r") as f:
        content = f.read()
        expected = [
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        for h in expected:
            if h not in content:
                print(f"  [FAIL] {h} missing in public/_headers")
                return False
    print("  [OK] public/_headers present")
    return True

if __name__ == "__main__":
    success = True
    success &= check_netlify_toml()
    success &= check_public_headers()

    if success:
        print("\nCI infrastructure headers verified successfully!")
        sys.exit(0)
    else:
        print("\nCI infrastructure header verification failed!")
        sys.exit(1)
