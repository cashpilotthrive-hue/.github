import os
import sys

def verify_infrastructure():
    required_files = [
        "netlify.toml",
        "public/_headers",
        "public/_redirects",
        "public/index.html",
        "wrangler.toml",
        "index.js"
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

    # Check for security headers in netlify.toml
    with open("netlify.toml", "r") as f:
        content = f.read()
        expected_headers = [
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        for header in expected_headers:
            if header in content:
                print(f"  [OK] Found {header} in netlify.toml")
            else:
                print(f"  [FAIL] Missing {header} in netlify.toml")
                success = False

    # Check for build signature in public/index.html
    with open("public/index.html", "r") as f:
        content = f.read()
        if 'class="build-signature"' in content and 'id="build-id"' in content:
             print("  [OK] Found build signature in index.html")
        else:
             print("  [FAIL] Missing build signature in index.html")
             success = False

    return success

if __name__ == "__main__":
    print("Verifying CI infrastructure requirements...")
    if verify_infrastructure():
        print("\nVerification successful!")
        sys.exit(0)
    else:
        print("\nVerification failed!")
        sys.exit(1)
