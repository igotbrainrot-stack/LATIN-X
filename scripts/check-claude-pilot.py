#!/usr/bin/env python3
"""Independent source-equivalence check for Claude's unsigned Latin pilot.
Does not analyse or approve the correctness of the original Latin."""
import json
import re
import unicodedata
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs/pilot/CLAUDE_PILOT_B01_C001_C008.md"
def main():
    lines = SRC.read_text(encoding="utf-8").splitlines()
    parsed = []
    chapter = None
    segment = None
    mode = ""
    for line in lines:
        if re.match(r"^# Caput (?:I|II|III|IV|V|VI|VII|VIII) — ", line):
            chapter = []
            parsed.append(chapter)
            mode = "front"
            continue
        if chapter is None:
            continue
        if line.startswith("## Lēctiō "):
            segment = []
            chapter.append(segment)
            mode = "reading"
            continue
        if line.startswith("## ") or line.startswith("> "):
            mode = "other"
            continue
        if mode == "reading" and line.strip():
            segment.append(line)
    assert len(parsed) == 8, "Expected eight chapters"
    forms = {
        "bibunt": 8, "laetī": 14, "patris": None, "mātris": None,
        "līviae": 2, "mātrī": 4, "timentne": 8,
    }
    total = 0
    for n, segments in enumerate(parsed, start=1):
        filename = ROOT / "lessons" / "b01" / f"c{n:03d}.json"
        chapter = json.loads(filename.read_text(encoding="utf-8"))
        assert len(chapter["segments"]) == len(segments), "Segment count mismatch"
        seen = set()
        for actual, expected in zip(chapter["segments"], segments):
            assert len(actual["sentences"]) == len(expected), "Reading line count changed"
            for sentence, source in zip(actual["sentences"], expected):
                assert sentence["text_la"] == source, "Claude's Latin changed"
                key = unicodedata.normalize("NFC", source).strip().lower()
                assert key not in seen, "Repeated line in chapter"
                seen.add(key)
                for word in re.findall(r"[^\W\d_]+", source.lower(), flags=re.UNICODE):
                    first = forms.get(word, 0)
                    assert first != None and first <= n, f"{word} too early in chapter {n}"
                assert all(t["lx"] is None and t["annotation_status"]=="draft_unverified"
                           for t in sentence["tokens"]), "Unsigned annotation was modified"
                total += 1
    print(f"PASS independent Python check: 8 chapters, {total} source lines, exact text, no duplicates or premature sampled forms.")
if __name__ == "__main__":
    main()
