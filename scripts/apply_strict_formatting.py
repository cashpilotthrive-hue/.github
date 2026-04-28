import os

def apply_strict_formatting():
    # netlify.toml
    netlify_toml = (
        '[build]\n'
        '  publish = "public"\n'
        '\n'
        '[[headers]]\n'
        'for = "/*"\n'
        '[headers.values]\n'
        'X-Frame-Options = "DENY"\n'
        'X-Content-Type-Options = "nosniff"\n'
        'Content-Security-Policy = "default-src \'self\';frame-ancestors \'none\';script-src \'self\';style-src \'self\' \'unsafe-inline\';"\n'
        'Strict-Transport-Security = "max-age=31536000;includeSubDomains;"\n'
        '\n'
        '[[redirects]]\n'
        'from = "/*"\n'
        'to = "/index.html"\n'
        'status = 200\n'
    )
    with open('netlify.toml', 'w', newline='\n') as f:
        f.write(netlify_toml)

    # public/_headers
    public_headers = (
        '/*\n'
        '  X-Frame-Options: DENY\n'
        '  X-Content-Type-Options: nosniff\n'
        '  Content-Security-Policy: default-src \'self\';frame-ancestors \'none\';script-src \'self\';style-src \'self\' \'unsafe-inline\';\n'
        '  Strict-Transport-Security: max-age=31536000;includeSubDomains;\n'
    )
    with open('public/_headers', 'w', newline='\n') as f:
        f.write(public_headers)

    # public/_redirects
    public_redirects = '/* /index.html 200\n'
    with open('public/_redirects', 'w', newline='\n') as f:
        f.write(public_redirects)

if __name__ == "__main__":
    apply_strict_formatting()
    print("Strict formatting applied.")
