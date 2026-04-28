import os

def write_strict_file(filepath, content):
    with open(filepath, 'w', newline='\n') as f:
        f.write(content.strip() + '\n')

# public/_headers
headers_content = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';
  Strict-Transport-Security: max-age=31536000;includeSubDomains;
"""
write_strict_file('public/_headers', headers_content)

# public/_redirects
redirects_content = "/* /index.html 200"
write_strict_file('public/_redirects', redirects_content)

# netlify.toml
# Note: Indentation for for, X-Frame-Options, etc. should be 0-space as per memory.
# But for [[headers]] it might be different. Let's follow the "0-space indentation for keys" rule.
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

print("Strict formatting applied to config files.")
