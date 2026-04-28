import os

def apply_strict_formatting():
    # netlify.toml
    # Memory: keys like for, X-Frame-Options, Content-Security-Policy, from, to at 0-space.
    # CSP and HSTS: trailing semicolon, no spaces after internal semicolons.
    # Exactly one trailing newline.
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
    # Memory: 2-space indentation.
    # CSP and HSTS: trailing semicolon, no spaces after internal semicolons.
    # Exactly one trailing newline.
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
    # Memory: exactly '/* /index.html 200' followed by a single trailing newline.
    public_redirects = '/* /index.html 200\n'
    with open('public/_redirects', 'w', newline='\n') as f:
        f.write(public_redirects)

    # public/index.html
    # Memory: exact strings for items, no backticks, leading number and period.
    # build-timestamp in body, build ID in signature.
    # Exactly one trailing newline (not explicitly required for index.html but good practice).
    index_html = (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '    <meta charset="UTF-8">\n'
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '    <title>Betting Platform Social Workflows</title>\n'
        '    <link rel="stylesheet" href="assets/style.css">\n'
        '    <style>\n'
        '        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; color: #333; }\n'
        '        header { border-bottom: 2px solid #333; margin-bottom: 1rem; }\n'
        '        .perf-box { background: #f4f4f4; padding: 1rem; border-radius: 4px; margin-top: 2rem; border-left: 4px solid #f39c12; }\n'
        '        .build-signature { margin-top: 2rem; padding: 1rem; border: 1px dashed #ccc; background: #fafafa; }\n'
        '        h1, h2, h3 { color: #2c3e50; }\n'
    )
    index_html += (
        '    </style>\n'
        '</head>\n'
        '<body data-build-timestamp="2026-04-21 17:31:21 UTC">\n'
        '    <header>\n'
        '        <h1>Betting Platform Social Workflows</h1>\n'
        '    </header>\n'
        '    <main>\n'
        '        <p>This repository contains the implementation of social-user-facing workflows for the betting platform.</p>\n'
        '        <p>Implementation includes Support, GDPR, Auth, KYC, and more.</p>\n'
        '\n'
        '        <div class="perf-box">\n'
        '            <h2>⚡ Performance Optimizations</h2>\n'
        '            <ul>\n'
        '                <li>1. Implemented idempotent package installation to skip redundant system updates.</li>\n'
        '                <li>2. Batch package queries in scripts/install-packages.sh to reduce process forks.</li>\n'
        '                <li>3. Optimization of scripts/configure-system.sh by replacing redundant grep forks with internal Bash regex matching resulted in a ~49% warm-run performance gain.</li>\n'
        '                <li>4. Optimized scripts/setup-dotfiles.sh using cmp -s to skip redundant backups and copies when files are already identical.</li>\n'
        '                <li>5. Batch gh secret set and gh variable set calls in scripts/configure-revenue-tools.sh using the -f flag to reduce process forks and execution time.</li>\n'
        '                <li>6. Optimized the backend /files endpoint by switching to a synchronous handler, allowing FastAPI to offload file I/O to a thread pool and improving event loop responsiveness.</li>\n'
        '                <li>7. Optimized the backend /chat endpoint by reusing a single pre-lowered user message for moderation and tool checks, improving request latency.</li>\n'
        '            </ul>\n'
        '        </div>\n'
        '\n'
        '        <div class="build-signature">\n'
        '            <h3>Build Signature</h3>\n'
        '            <p><strong>Build ID:</strong> <span>1771219342564672046</span></p>\n'
        '            <p><strong>Build Timestamp:</strong> <span>2026-04-21 17:31:21 UTC</span></p>\n'
        '            <p><strong>Agent:</strong> Bolt ⚡</p>\n'
        '        </div>\n'
        '    </main>\n'
        '    <footer>\n'
        '        <p>&copy; 2026 Betting Platform - Optimized by Bolt ⚡</p>\n'
        '    </footer>\n'
        '</body>\n'
        '</html>\n'
    )
    with open('public/index.html', 'w', newline='\n') as f:
        f.write(index_html)

if __name__ == "__main__":
    apply_strict_formatting()
    print("Strict formatting applied.")
