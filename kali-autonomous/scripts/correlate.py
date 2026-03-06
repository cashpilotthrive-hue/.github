#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from pathlib import Path

root = Path(__file__).resolve().parent.parent
run_dirs = sorted((root / "output" / "normalized").glob("run-*"))
if not run_dirs:
    raise SystemExit("No normalized run directories found")

run_dir = run_dirs[-1]
report_dir = root / "output" / "reports" / run_dir.name
report_dir.mkdir(parents=True, exist_ok=True)

findings: dict[str, dict] = {}
for jsonl in run_dir.glob("*.jsonl"):
    for line in jsonl.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        target = row.get("target", "unknown")
        findings.setdefault(target, {"target": target, "phases": set()})
        findings[target]["phases"].add(row.get("phase", "unknown"))

summary = []
for _, item in sorted(findings.items()):
    phases = sorted(item["phases"])
    summary.append({
        "target": item["target"],
        "observed_phases": phases,
        "priority": "review",
    })

(report_dir / "correlated.json").write_text(json.dumps(summary, indent=2) + "\n")
