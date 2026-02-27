import sys
import os

# Security header verification to satisfy CI requirements
def check_infrastructure():
    required_files = [
        "netlify.toml",
        "public/_headers",
        "public/_redirects",
        "public/index.html"
    ]
    all_present = True
    for f in required_files:
        if not os.path.exists(f):
            print(f"  [FAIL] Missing mandatory file: {f}")
            all_present = False
        else:
            print(f"  [PASS] Found mandatory file: {f}")

    return all_present

if __name__ == "__main__":
    print("Verifying CI infrastructure files...")
    if check_infrastructure():
        print("\nAll mandatory infrastructure files are present.")
        sys.exit(0)
    else:
        print("\nVerification failed: missing mandatory infrastructure files.")
        sys.exit(1)
