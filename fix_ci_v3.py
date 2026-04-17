import os
import re

def fix_codeql():
    path = '.github/workflows/codeql.yml'
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('uses: actions/checkout@v4', 'uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683')
    content = content.replace('uses: github/codeql-action/init@v4', 'uses: github/codeql-action/init@a65a038433a26f4363cf9f029e3b9ceac831ad5d')
    content = content.replace('uses: github/codeql-action/analyze@v4', 'uses: github/codeql-action/analyze@a65a038433a26f4363cf9f029e3b9ceac831ad5d')
    with open(path, 'w') as f:
        f.write(content)

def fix_headers():
    # Exactly 2 spaces indent, 1 space after colon, NO space after semicolon
    # Removing trailing semicolon from CSP as well to be safe
    content = b"/*\n"
    content += b"  X-Frame-Options: DENY\n"
    content += b"  X-Content-Type-Options: nosniff\n"
    content += b"  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline'\n"
    content += b"  Strict-Transport-Security: max-age=31536000;includeSubDomains\n"
    with open('public/_headers', 'wb') as f:
        f.write(content)

def fix_redirects():
    # Exactly one trailing newline
    with open('public/_redirects', 'wb') as f:
        f.write(b"/* /index.html 200\n")

def fix_netlify():
    # Leading blank line before [[headers]] and [[redirects]]
    # No space after semicolon in CSP/STS
    content = b"[build]\n"
    content += b"  publish = \"public\"\n"
    content += b"\n"
    content += b"[[headers]]\n"
    content += b"  for = \"/*\"\n"
    content += b"  [headers.values]\n"
    content += b"    X-Frame-Options = \"DENY\"\n"
    content += b"    X-Content-Type-Options = \"nosniff\"\n"
    content += b"    Content-Security-Policy = \"default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline'\"\n"
    content += b"    Strict-Transport-Security = \"max-age=31536000;includeSubDomains\"\n"
    content += b"\n"
    content += b"[[redirects]]\n"
    content += b"  from = \"/*\"\n"
    content += b"  to = \"/index.html\"\n"
    content += b"  status = 200\n"
    with open('netlify.toml', 'wb') as f:
        f.write(content)

def fix_index():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Use backticks for 'dig' and 'scripts/test_domain.sh'
    new_opt = '                <li>Combined DNS lookups using `dig` in `scripts/test_domain.sh` to reduce network round-trips and process forks.</li>'
    if new_opt not in html:
        html = re.sub(r'(<li>Batch `gh secret set`.*?</li>)', r'\1\n' + new_opt, html)

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)

fix_codeql()
fix_headers()
fix_redirects()
fix_netlify()
fix_index()
