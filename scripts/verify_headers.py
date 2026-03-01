import sys
import os

def check():
    required_files = ['netlify.toml', 'public/_headers', 'public/_redirects', 'public/index.html', 'wrangler.toml', 'index.js']
    for f in required_files:
        if not os.path.exists(f):
            print(f"Missing {f}")
            return False

    with open('public/_headers', 'r') as f:
        lines = f.readlines()
        if lines[0].strip() != '/*':
            print("First line of _headers must be /*")
            return False
        for line in lines[1:]:
            if line.strip() and not line.startswith('  '):
                print(f"Header line not indented: {line}")
                return False

    print("Verification passed")
    return True

if __name__ == "__main__":
    if check():
        sys.exit(0)
    else:
        sys.exit(1)
