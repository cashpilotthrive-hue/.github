import os

def fix_headers():
    content = b"/*\n"
    content += b"  X-Frame-Options: DENY\n"
    content += b"  X-Content-Type-Options: nosniff\n"
    content += b"  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';\n"
    content += b"  Strict-Transport-Security: max-age=31536000;includeSubDomains\n"
    with open('public/_headers', 'wb') as f:
        f.write(content)

def fix_netlify():
    content = b"[build]\n"
    content += b"  publish = \"public\"\n"
    content += b"\n"
    content += b"[[headers]]\n"
    content += b"  for = \"/*\"\n"
    content += b"  [headers.values]\n"
    content += b"    X-Frame-Options = \"DENY\"\n"
    content += b"    X-Content-Type-Options = \"nosniff\"\n"
    content += b"    Content-Security-Policy = \"default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';\"\n"
    content += b"    Strict-Transport-Security = \"max-age=31536000;includeSubDomains\"\n"
    content += b"\n"
    content += b"[[redirects]]\n"
    content += b"  from = \"/*\"\n"
    content += b"  to = \"/index.html\"\n"
    content += b"  status = 200\n"
    with open('netlify.toml', 'wb') as f:
        f.write(content)

fix_headers()
fix_netlify()
