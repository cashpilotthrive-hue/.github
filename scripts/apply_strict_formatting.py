import os

def write_strict_file(filepath, content):
    # Ensure exact character precision and a single trailing newline
    with open(filepath, 'w', newline='\n') as f:
        f.write(content.strip() + '\n')

# public/_headers
# Requirement: 2-space indentation, trailing semicolon for CSP/HSTS, no spaces after internal semicolons.
headers_content = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';
  Strict-Transport-Security: max-age=31536000;includeSubDomains;
"""
write_strict_file('public/_headers', headers_content)

# public/_redirects
# Requirement: Exactly "/* /index.html 200"
redirects_content = "/* /index.html 200"
write_strict_file('public/_redirects', redirects_content)

# netlify.toml
# Requirement: 0-space indentation for keys, trailing semicolon for CSP/HSTS, no spaces after internal semicolons.
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
write_strict_file('netlify.toml', netlify_toml_content)

print("CI-compliant strict formatting applied.")
