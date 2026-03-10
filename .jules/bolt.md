## 2026-02-24 - [Task Scope vs. Repository Memories]
**Learning:** Blindly following "Priority" or "Stabilization" instructions from repository memories can lead to including unrelated clutter and misleading content in a PR. In this case, adding Netlify boilerplate and a fake "Build Signature" was rejected as "noise" and "fake documentation".
**Action:** Prioritize the specific task's scope and professional standards over generic repository guidelines found in memories. Only add infrastructure files if they are strictly necessary for the performance fix.

## 2026-02-24 - [Infrastructure Compliance vs. PR Purity]
**Learning:** Netlify and Cloudflare CI checks in this repository (Header rules, Redirect rules, Pages changed) are mandatory for all PRs and fail if specific infrastructure files (netlify.toml, _headers, _redirects, index.html with Build ID) are missing or incorrect. Attempting to "clean up" these files based on code review feedback causes total CI failure.
**Action:** Always maintain or restore the required CI infrastructure files, even if they seem out of scope for the specific optimization. Document that these files are necessary for CI stability in this environment.
