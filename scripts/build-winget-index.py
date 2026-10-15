#!/usr/bin/env python3
"""Build data/winget-index.json from the official winget source package.

The winget community source is published as an MSIX at
https://cdn.winget.microsoft.com/cache/source.msix and contains Public/index.db, a SQLite database
with every package id, name, moniker, version and tag. This script extracts one entry per package
with its latest version so the generator's Software tab can search the catalog offline.

    python3 scripts/build-winget-index.py [output.json]
"""
import io
import json
import re
import sqlite3
import sys
import tempfile
import time
import urllib.request
import zipfile
from pathlib import Path

SOURCE = "https://cdn.winget.microsoft.com/cache/source.msix"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "data/winget-index.json")


def version_key(version):
    """Sort key approximating winget's version comparison: numeric parts first, then text."""
    parts = []
    for piece in re.split(r"[.\-+]", version.strip()):
        m = re.match(r"(\d+)(.*)", piece)
        if m:
            parts.append((0, int(m.group(1)), m.group(2).lower()))
        else:
            parts.append((1, 0, piece.lower()))
    return parts


def main():
    print(f"downloading {SOURCE}")
    data = urllib.request.urlopen(SOURCE, timeout=300).read()
    print(f"{len(data)} bytes")
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        db_bytes = z.read("Public/index.db")
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
        tmp.write(db_bytes)
        db_path = tmp.name

    con = sqlite3.connect(db_path)
    rows = con.execute(
        """
        select m.rowid, i.id, n.name, v.version, coalesce(c.channel, ''), coalesce(mo.moniker, '')
        from manifest m
        join ids i on i.rowid = m.id
        join names n on n.rowid = m.name
        join versions v on v.rowid = m.version
        left join channels c on c.rowid = m.channel
        left join monikers mo on mo.rowid = m.moniker
        """
    ).fetchall()
    tags_by_manifest = {}
    for manifest, tag in con.execute("select tm.manifest, t.tag from tags_map tm join tags t on t.rowid = tm.tag"):
        tags_by_manifest.setdefault(manifest, []).append(tag)

    latest = {}
    for manifest, pid, name, version, channel, moniker in rows:
        if channel:
            continue  # beta/preview channels are not what an unattended install wants
        current = latest.get(pid)
        if current is None or version_key(version) > version_key(current["v"]):
            tags = sorted({t for t in tags_by_manifest.get(manifest, []) if t and len(t) <= 30})[:6]
            latest[pid] = {"i": pid, "n": name, "v": version, "m": moniker, "t": tags}

    packages = sorted(latest.values(), key=lambda p: p["i"].lower())
    for p in packages:
        if not p["m"]:
            del p["m"]
        if not p["t"]:
            del p["t"]
    out = {
        "generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": SOURCE,
        "count": len(packages),
        "packages": packages,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} with {len(packages)} packages ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
