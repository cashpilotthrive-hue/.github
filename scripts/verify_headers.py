import os
import sys

def verify_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Error: {filepath} is missing")
        return False
    print(f"✅ Found: {filepath}")
    return True

def verify_content(filepath, patterns):
    if not os.path.exists(filepath):
        return False

    with open(filepath, 'r') as f:
        content = f.read()

    all_found = True
    for pattern in patterns:
        if pattern in content:
            print(f"✅ Found pattern '{pattern}' in {filepath}")
        else:
            print(f"❌ Error: Pattern '{pattern}' NOT found in {filepath}")
            all_found = False
    return all_found

def main():
    success = True

    # Core files
    files_to_check = [
        "netlify.toml",
        "public/_headers",
        "public/_redirects",
        "public/index.html"
    ]

    for f in files_to_check:
        if not verify_file_exists(f):
            success = False

    # Header checks
    header_patterns = [
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options"
    ]

    if not verify_content("netlify.toml", header_patterns):
        success = False

    if not verify_content("public/_headers", header_patterns):
        success = False

    # Redirect check
    if not verify_content("public/_redirects", ["/* /index.html 200"]):
        success = False

    # Build signature check
    if not verify_content("public/index.html", ["build-signature"]):
        success = False

    if not success:
        print("\n❌ Verification failed!")
        sys.exit(1)

    print("\n✨ All infrastructure checks passed!")

if __name__ == "__main__":
    main()
