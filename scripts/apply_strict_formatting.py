import os

def write_headers():
    # 2-space indentation for headers
    # No spaces after internal semicolons
    # Trailing semicolon included
    content = "/*\n"
    content += "  X-Frame-Options: DENY\n"
    content += "  X-Content-Type-Options: nosniff\n"
    content += "  Content-Security-Policy: default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';\n"
    content += "  Strict-Transport-Security: max-age=31536000;includeSubDomains;\n"
    with open('public/_headers', 'w', newline='\n') as f:
        f.write(content)

def write_redirects():
    # Exactly /* /index.html 200 followed by a single trailing newline
    content = "/* /index.html 200\n"
    with open('public/_redirects', 'w', newline='\n') as f:
        f.write(content)

def write_netlify_toml():
    # Keys like for, X-Frame-Options, Content-Security-Policy, from, and to with 0-space indentation
    # No spaces after internal semicolons
    # Trailing semicolon included
    content = "[build]\n"
    content += "  publish = \"public\"\n"
    content += "\n"
    content += "[[headers]]\n"
    content += "for = \"/*\"\n"
    content += "[headers.values]\n"
    content += "X-Frame-Options = \"DENY\"\n"
    content += "X-Content-Type-Options = \"nosniff\"\n"
    content += "Content-Security-Policy = \"default-src 'self';frame-ancestors 'none';script-src 'self';style-src 'self' 'unsafe-inline';\"\n"
    content += "Strict-Transport-Security = \"max-age=31536000;includeSubDomains;\"\n"
    content += "\n"
    content += "[[redirects]]\n"
    content += "from = \"/*\"\n"
    content += "to = \"/index.html\"\n"
    content += "status = 200\n"
    with open('netlify.toml', 'w', newline='\n') as f:
        f.write(content)

if __name__ == "__main__":
    write_headers()
    write_redirects()
    write_netlify_toml()
    print("Strict formatting applied successfully.")
