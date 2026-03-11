import os
import sys

def verify_ci_infrastructure():
    print("Verifying CI infrastructure files...")
    mandatory_files = [
        "netlify.toml",
        "public/_headers",
        "public/_redirects",
        "public/index.html",
        "wrangler.toml",
        "index.js"
    ]

    all_present = True
    for f in mandatory_files:
        if os.path.exists(f):
            print(f"  [OK] {f} exists")
        else:
            print(f"  [FAIL] {f} is missing")
            all_present = False

    if not all_present:
        return False

    # Check for mandatory Build ID label in index.html
    with open("public/index.html", "r") as f:
        content = f.read()
        if '<strong>Build ID:</strong>' in content and 'class="build-signature"' in content:
            print("  [OK] public/index.html has correct build signature structure")
        else:
            print("  [FAIL] public/index.html is missing build signature markers")
            all_present = False

    return all_present

if __name__ == "__main__":
    if verify_ci_infrastructure():
        print("\nCI infrastructure verification successful!")
        sys.exit(0)
    else:
        print("\nCI infrastructure verification failed!")
        sys.exit(1)
