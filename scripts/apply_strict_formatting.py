import os

def write_headers():
    content = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';
  Strict-Transport-Security: max-age=31536000;includeSubDomains;
"""
    with open('public/_headers', 'w', newline='\n') as f:
        f.write(content)

def write_redirects():
    content = "/* /index.html 200\n"
    with open('public/_redirects', 'w', newline='\n') as f:
        f.write(content)

def write_netlify_toml():
    content = """[build]
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
    with open('netlify.toml', 'w', newline='\n') as f:
        f.write(content)

if __name__ == "__main__":
    write_headers()
    write_redirects()
    write_netlify_toml()
    print("Formatting applied successfully.")
