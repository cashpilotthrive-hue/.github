#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
report_runs = sorted((root / "output" / "reports").glob("run-*"))
if not report_runs:
    raise SystemExit("No report run directories found")

report_dir = report_runs[-1]
correlated_file = report_dir / "correlated.json"
if not correlated_file.exists():
    raise SystemExit("correlated.json not found")

data = json.loads(correlated_file.read_text())
md = ["# Autonomous Security Run Report", "", f"Run: `{report_dir.name}`", "", "## Findings"]
if not data:
    md.append("- No findings generated.")
else:
    for item in data:
        md.append(
            f"- **{item['target']}** phases={', '.join(item['observed_phases'])} priority={item['priority']}"
        )

(report_dir / "report.md").write_text("\n".join(md) + "\n")
print(report_dir / "report.md")
