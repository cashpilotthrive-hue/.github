import os

def apply_strict_formatting():
    # Strict formatting for netlify.toml
    # Keys like for, X-Frame-Options, Content-Security-Policy, from, to defined with 0-space indentation.
    # CSP and HSTS headers must end with a trailing semicolon and must not contain any spaces after internal semicolons.
    netlify_toml_content = """[build]
  publish = "public"

[[headers]]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
Content-Security-Policy = "default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';"
Strict-Transport-Security = "max-age=31536000;includeSubDomains;"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
"""
    with open("netlify.toml", "w", newline='\n') as f:
        f.write(netlify_toml_content)

    # Strict formatting for public/_headers
    # Mandatory 2-space indentation under the path pattern.
    # No spaces after internal semicolons in CSP and HSTS.
    public_headers_content = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';
  Strict-Transport-Security: max-age=31536000;includeSubDomains;
"""
    os.makedirs("public", exist_ok=True)
    with open("public/_headers", "w", newline='\n') as f:
        f.write(public_headers_content)

    # Strict formatting for public/_redirects
    # exactly /* /index.html 200 followed by a single trailing newline.
    public_redirects_content = "/* /index.html 200\n"
    with open("public/_redirects", "w", newline='\n') as f:
        f.write(public_redirects_content)

    print("Strict formatting applied successfully.")

if __name__ == "__main__":
    apply_strict_formatting()
