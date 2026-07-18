# Domain solutions for aime.io

## 1) Apex on GitHub Pages
- Keep CNAME as aime.io
- Configure DNS A records to:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

## 2) www + apex redirect
- Set CNAME to www.aime.io
- Set www CNAME to <org-or-user>.github.io
- Redirect apex aime.io to https://www.aime.io

## 3) Cloudflare flattening
- Keep CNAME as aime.io
- Use CNAME flattening for apex to <org-or-user>.github.io
- Start with DNS-only until SSL validates
