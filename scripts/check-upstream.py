#!/usr/bin/env python3
"""Check whether the generators this tool mirrors have moved.

1. schneegans.de: regenerate the reference file (test/fixtures/snoops-2026.xml) from the parameter URL
   stored in its first comment, through the site's view endpoint, and compare. Differences mean
   upstream changed its scripts; the new file and a diff are written next to the fixture for review.
2. schneegans' removable-apps list (resource/Bloatware.json in cschneegans/unattend-generator): list
   the entries whose package / capability / feature selectors the removal catalog
   (js/removal-catalog.js) does not know yet, and catalog selectors upstream no longer uses.
   (Microsoft retired its own "provisioned apps" page, so this list is the best machine-readable source.)

Results go to stdout and, inside GitHub Actions, to $GITHUB_OUTPUT (changed, old_hash, new_hash,
unknown_apps). Network problems are reported but never fail the run.
"""
import difflib
import html
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURE = ROOT / "test" / "fixtures" / "snoops-2026.xml"
CATALOG = ROOT / "js" / "removal-catalog.js"
BLOATWARE_JSON = "https://raw.githubusercontent.com/cschneegans/unattend-generator/master/resource/Bloatware.json"
UA = {"User-Agent": "windows-unattend-generator upstream check (+https://github.com/rbardtke/windows-unattend-generator)"}

outputs = {}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read().decode("utf-8")


def strip(text):
    text = text.replace("\r\n", "\n")
    text = re.sub(r"\t\t<Build>[\s\S]*?</Build>\n", "", text)
    return "\n".join(l for l in text.split("\n") if not l.startswith("\t<!--"))


def build_hash(text):
    m = re.search(r"<Hash>([0-9a-f]+)</Hash>", text)
    return m.group(1) if m else ""


def check_schneegans():
    fixture = FIXTURE.read_bytes().decode("utf-8")
    m = re.search(r"<!--(https://schneegans\.de/windows/unattend-generator/\?[^\s]*?)-->", fixture)
    if not m:
        print("fixture has no schneegans URL comment; skipping")
        return
    url = m.group(1).replace("%2D%2D", "--").replace("&amp;", "&")
    view = url.replace("/unattend-generator/?", "/unattend-generator/view/?", 1)
    try:
        current = fetch(view)
    except Exception as e:  # noqa: BLE001
        print(f"could not fetch schneegans.de: {e}")
        return
    old_hash, new_hash = build_hash(fixture), build_hash(current)
    outputs["old_hash"], outputs["new_hash"] = old_hash, new_hash
    if strip(fixture) == strip(current):
        print(f"schneegans.de output unchanged (build {new_hash[:7]})")
        outputs["changed"] = "false"
        return
    outputs["changed"] = "true"
    out_dir = ROOT / "upstream"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "schneegans-current.xml").write_bytes(current.encode("utf-8"))
    diff = difflib.unified_diff(strip(fixture).split("\n"), strip(current).split("\n"),
                                fromfile="test/fixtures/snoops-2026.xml", tofile="schneegans today", lineterm="", n=2)
    diff_text = "\n".join(diff)
    (out_dir / "schneegans.diff").write_text(diff_text, encoding="utf-8")
    changed = sum(1 for l in diff_text.split("\n") if l[:1] in "+-" and not l.startswith(("+++", "---")))
    print(f"schneegans.de output CHANGED: {changed} changed lines, build {old_hash[:7]} -> {new_hash[:7]}")
    print(diff_text[:4000])
    outputs["changed_lines"] = str(changed)


def check_bloatware_list():
    import json
    try:
        raw = urllib.request.urlopen(urllib.request.Request(BLOATWARE_JSON, headers=UA), timeout=120).read()
        entries = json.loads(raw.decode("utf-8-sig"))
    except Exception as e:  # noqa: BLE001
        print(f"could not fetch the upstream bloatware list: {e}")
        return
    catalog = CATALOG.read_text(encoding="utf-8")
    known = set(re.findall(r"'([A-Za-z0-9][A-Za-z0-9.+-]*)'", catalog))
    upstream = set()
    unknown_entries = []
    for entry in entries:
        selectors = [s.get("Selector") for s in entry.get("Steps", []) if s.get("Selector")]
        upstream.update(selectors)
        missing = [s for s in selectors if s not in known]
        if missing:
            unknown_entries.append(f"{entry.get('DisplayName', '?')}: {', '.join(missing)}")
    retired = sorted(s for s in known if "." in s and s not in upstream
                     and s not in {"MSTeams", "MicrosoftTeams"} and not s.endswith(".ps1"))
    print(f"upstream bloatware entries: {len(entries)}, with selectors unknown to the catalog: {len(unknown_entries)}")
    for line in unknown_entries:
        print(f"  {line}")
    if retired:
        print(f"catalog selectors upstream no longer lists: {', '.join(retired)}")
    outputs["unknown_apps"] = "\\n".join(unknown_entries)
    outputs["retired_selectors"] = " ".join(retired)


def main():
    check_schneegans()
    check_bloatware_list()
    gh = os.environ.get("GITHUB_OUTPUT")
    if gh:
        with open(gh, "a", encoding="utf-8") as f:
            for k, v in outputs.items():
                f.write(f"{k}={v}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
