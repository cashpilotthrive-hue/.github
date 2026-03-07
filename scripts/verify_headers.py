import os
import sys

def verify_headers():
    files_to_check = [
        'netlify.toml',
        'public/_headers',
        'public/_redirects',
        'public/index.html',
        'wrangler.toml',
        'index.js'
    ]

    for f in files_to_check:
        if not os.path.exists(f):
            print(f"CRITICAL: Missing mandatory file: {f}")
            return False

    with open('public/_headers', 'r') as f:
        content = f.read()
        mandatory_headers = [
            'X-Frame-Options: DENY',
            'X-Content-Type-Options: nosniff',
            'Content-Security-Policy: default-src',
            'Strict-Transport-Security: max-age'
        ]
        for header in mandatory_headers:
            if header not in content:
                print(f"CRITICAL: Missing header '{header}' in public/_headers")
                return False

    with open('public/index.html', 'r') as f:
        content = f.read()
        if 'class="build-signature"' not in content or '<strong>Build ID:</strong>' not in content:
            print("CRITICAL: public/index.html structure incorrect (missing build-signature)")
            return False

    print("✓ All CI infrastructure files verified successfully.")
    return True

if __name__ == "__main__":
    if not verify_headers():
        sys.exit(1)
