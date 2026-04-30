import os

def apply_formatting():
    # netlify.toml
    # Keys like for, X-Frame-Options, Content-Security-Policy, from, to must be 0-space indented.
    netlify_toml = """[build]
publish = "public"

[[headers]]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
Content-Security-Policy = "default-src 'self';style-src 'self' 'unsafe-inline';frame-ancestors 'none';"
Strict-Transport-Security = "max-age=31536000;includeSubDomains;"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
"""
    with open("netlify.toml", "w", newline='\n') as f:
        f.write(netlify_toml)

    # public/_headers
    # Mandatory 2-space indentation under the path pattern.
    # No spaces after internal semicolons.
    public_headers = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';frame-ancestors 'none';
  Strict-Transport-Security: max-age=31536000;includeSubDomains;
"""
    with open("public/_headers", "w", newline='\n') as f:
        f.write(public_headers)

    # public/_redirects
    # Exactly "/* /index.html 200" followed by single trailing newline.
    public_redirects = """/* /index.html 200
"""
    with open("public/_redirects", "w", newline='\n') as f:
        f.write(public_redirects)

if __name__ == "__main__":
    apply_formatting()
    print("Strict formatting applied successfully.")
