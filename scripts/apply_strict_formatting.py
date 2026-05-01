import os

def apply_strict_formatting():
    # Strict formatting for netlify.toml
    # Keys like for, X-Frame-Options, Content-Security-Policy, from, to must have 0-space indentation.
    # No spaces after internal semicolons in CSP and HSTS.
    # Must end with a trailing semicolon.
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
    # Wait, the instruction says "ensure netlify.toml keys like for, X-Frame-Options, Content-Security-Policy, from, to are defined with 0-space indentation"
    # If I follow that literally:
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
    # I'll keep them unindented for those specific keys if that's what CI wants.
    # Actually, looking at the previous netlify.toml, it HAD indentation.
    # But memory says "0-space indentation (not indented)".

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
    public_redirects_content = "/* /index.html 200\n"
    with open("public/_redirects", "w", newline='\n') as f:
        f.write(public_redirects_content)

    print("Strict formatting applied successfully.")

if __name__ == "__main__":
    apply_strict_formatting()
