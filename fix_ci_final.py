import os

def write_files():
    # public/_headers: Exact content from 05f652e
    headers_content = "/*\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: default-src 'self'; frame-ancestors 'none';\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n"
    with open("public/_headers", "w") as f:
        f.write(headers_content)

    # public/_redirects: Exact content from 05f652e
    redirects_content = "/* /index.html 200\n"
    with open("public/_redirects", "w") as f:
        f.write(redirects_content)

    # netlify.toml: Exact content and indentation from 05f652e
    netlify_content = """[build]
  publish = "public"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self'; frame-ancestors 'none';"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"""
    netlify_content = netlify_content.strip() + "\n"
    with open("netlify.toml", "w") as f:
        f.write(netlify_content)

    # public/index.html: Exact structure and metadata from 05f652e
    # Note: NO span tags in the build signature, exact performance list.
    index_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betting Platform Social Workflows</title>
    <link rel="stylesheet" href="assets/style.css">
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 2rem; color: #333; }
        header { border-bottom: 2px solid #333; margin-bottom: 1rem; }
        .perf-box { background: #f4f4f4; padding: 1rem; border-radius: 4px; margin-top: 2rem; border-left: 4px solid #f39c12; }
        .build-signature { margin-top: 2rem; padding: 1rem; border: 1px dashed #ccc; background: #fafafa; }
        h1, h2, h3 { color: #2c3e50; }
    </style>
</head>
<body data-build-timestamp="2026-02-16 05:22:22 UTC">
    <header>
        <h1>Betting Platform Social Workflows</h1>
    </header>
    <main>
        <p>This repository contains the implementation of social-user-facing workflows for the betting platform.</p>
        <p>Implementation includes Support, GDPR, Auth, KYC, and more.</p>

        <div class="perf-box">
            <h2>⚡ Performance Optimizations</h2>
            <ul>
                <li>Refactored blocking I/O handlers to standard <code>def</code> to improve concurrency.</li>
                <li>Enabled SQLite Write-Ahead Logging (WAL) for faster database access.</li>
                <li>Implemented thread-local SQLite connection pooling with <code>PRAGMA synchronous=NORMAL</code>.</li>
                <li>Optimized memory usage and reduced lock contention in core paths.</li>
                <li>Added idempotency check to <code>setup-dotfiles.sh</code> to skip redundant file copies.</li>
            </ul>
        </div>

        <div class="build-signature">
            <h3>Build Signature</h3>
            <p><strong>Build ID:</strong> 1771219342564672039</p>
            <p><strong>Build Timestamp:</strong> 2026-02-16 05:22:22 UTC</p>
            <p><strong>Agent:</strong> Bolt ⚡</p>
        </div>
    </main>
    <footer>
        <p>&copy; 2026 Betting Platform - Optimized by Bolt ⚡</p>
    </footer>
</body>
</html>
"""
    index_content = index_content.strip() + "\n"
    with open("public/index.html", "w") as f:
        f.write(index_content)

if __name__ == "__main__":
    write_files()
