"""Cross-check the vowel lengths printed in the course against Lewis & Short and Collatinus.

Lewis & Short (Perseus XML) is the authority; Collatinus is a second, independent hint.
This compares only stem vowels, and only where Collatinus marks the vowel explicitly
and the vowel is not followed by two consonants (Collatinus marks length by position
there, so its macron says nothing about the vowel). Endings are not compared.

Usage (Collatinus data is GPL and is not stored in this repository):
  node -e 'const C=require("./scripts/lib/latin-corpus.cjs");console.log(JSON.stringify([...C.words().keys()]))' > forms.json
  python3 -I pronunciation/tools/collatinus_stem_check.py forms.json /path/to/collatinus/lemmes.la /path/to/lewis-short.xml out.json
pycollatinus must be importable (used only to identify the lemma of each form; on Python 3.10+
its import of collections.Callable needs changing to collections.abc.Callable).
Its own vowel quantities are not used: they were found to be unreliable (e.g. āgit).
"""
import json, sys, unicodedata, re
from pycollatinus import Lemmatiseur

forms = json.load(open(sys.argv[1], encoding='utf-8'))
LONGS = {'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u', 'ȳ': 'y'}

def letters(q):
    """Marked string -> list of (letter, mark) with mark in L, S, C (common) or None.
    Perseus L&S writes a common vowel as a macron followed by ^ (tŏnī^trus)."""
    out = []
    q = re.sub(r'([āēīōūȳ])\^', lambda m: m.group(1) + '\u0306', q)
    for ch in unicodedata.normalize('NFD', q.replace('\x01', '')):
        if unicodedata.category(ch) == 'Mn':
            if not out: continue
            l, m = out[-1]
            if ch == '̄': m = 'C' if m == 'S' else 'L'
            elif ch == '̆': m = 'C' if m == 'L' else 'S'
            out[-1] = (l, m)
        else:
            out.append((ch.lower(), None))
    return [(('i' if l == 'j' else l), m) for l, m in out]

def course(w):
    out = []
    for ch in unicodedata.normalize('NFC', w).lower():
        if ch in LONGS: out.append((LONGS[ch], 'L'))
        elif ch in 'aeiouy': out.append((ch, 'S'))
        else: out.append((ch, None))
    return out

VOW = set('aeiouy')
DIPH = ('ae', 'au', 'oe')

def closed(seq, i):
    """True if the vowel at i is followed by two consonants (x and z count as two, qu as
    one, h as none, a stop + l/r as none), so a Collatinus macron there may be positional."""
    rest = re.sub('qu', 'q', ''.join(l for l, _ in seq[i+1:])).replace('h', '')
    m = re.match(r'[^aeiouy]*', rest).group(0)
    if 'x' in m or 'z' in m: return True
    if re.fullmatch(r'[pbtdcg][lr]', m): return False
    return len(m) >= 2

def compare(form, stem, is_head):
    """Compare marked stem vowels inside the longest common prefix of form and stem.
    For a dictionary head, skip its last vowel (the ending) and any vowel directly
    before another vowel (shortened in hiatus: vĭdĕo, but vidēre). A principal-part
    stem must be a full prefix of the form."""
    f, s = course(form), letters(stem)
    k = 0
    while k < min(len(f), len(s)) and f[k][0] == s[k][0]: k += 1
    if (not is_head and k < len(s)) or k < 2: return None
    vidx = [i for i, (l, _) in enumerate(s) if l in VOW]
    if is_head and len(vidx) > 1: vidx = vidx[:-1]
    agree, disagree = [], []
    for i in vidx:
        if i >= k: break
        m = s[i][1]
        if m in (None, 'C') or closed(s, i) or closed(f, i): continue
        if is_head and i + 1 < len(s) and s[i+1][0] in VOW: continue
        if s[i][0] + (s[i+1][0] if i + 1 < len(s) else '') in DIPH or (i and s[i-1][0] + s[i][0] in DIPH): continue
        if m == f[i][1]: agree.append(i)
        else: disagree.append('%s(vowel %d) %s in source' % (s[i][0], len([j for j in vidx if j <= i]), 'long' if m == 'L' else 'short'))
    return agree, disagree

heads = {}
for line in open(sys.argv[2], encoding='utf-8'):
    if line.startswith('!') or '|' not in line: continue
    p = line.rstrip('\n').split('|')
    head = p[0].split('=')[0]
    key = re.sub(r'\d+$', '', ''.join(l for l, _ in letters(head))).replace('v', 'u')
    heads.setdefault(key, []).append(dict(head=head, model=p[1], stems=[x for x in p[2:4] if x]))

ls = {}
for m in re.finditer(r'<entryFree[^>]*key="([^"]+)"[^>]*>(?=(.{0,600}))', open(sys.argv[3], encoding='utf-8').read(), re.S):
    key = re.sub(r'\d+$', '', m.group(1)).lower().replace('v', 'u').replace('j', 'i')
    body = m.group(2).split('<sense')[0].split('</entryFree')[0]
    orths = re.findall(r'<orth[^>]*>([^<]+)</orth>', body)
    itype = re.findall(r'<itype>([^<]+)</itype>', body)
    parts = [w for t in itype for w in re.findall(r"[^\s,.;:()0-9]+", t) if len(w) > 2]
    for o in orths: ls.setdefault(key, []).append(dict(head=o, stems=parts))

def check(form, entries):
    res = []
    for h in entries:
        for stem in [h['head']] + h['stems']:
            r = compare(re.sub(r'(?<=[^aeiouyāēīōū])ne$', '', form), stem, True)
            if r: res.append(dict(lemma=h['head'], stem=stem, agree=r[0], disagree=r[1]))
    return res

def verdict_of(lemmas, results):
    ok = [r for r in results if r['agree'] and not r['disagree']]
    bad = [r for r in results if r['disagree']]
    if not lemmas: return 'not_recognised'
    if ok and bad: return 'agree_other_stem_differs'
    if ok: return 'agree'
    if bad: return 'disagree'
    return 'no_comparable_vowel'

L = Lemmatiseur()
rows = []
for form in forms:
    base = ''.join(LONGS.get(c, c) for c in form.lower())
    an = list(L.lemmatise(base)) or ([] if not base.endswith('ne') else list(L.lemmatise(base[:-2])))
    lemmas = sorted({re.sub(r'\d+$', '', a['lemma'].lower().replace('v', 'u').replace('j', 'i')) for a in an})
    results = []
    for lem in lemmas:
        for h in heads.get(lem, []):
            for stem, drop in [(h['head'], True)] + [(s, False) for s in h['stems']]:
                r = compare(re.sub(r'(?<=[^aeiouyāēīōū])ne$', '', form), stem, drop)
                if r: results.append(dict(lemma=h['head'], stem=stem, agree=r[0], disagree=r[1]))
    lsres = [] if not lemmas else check(form, [e for lem in lemmas for e in ls.get(lem, [])])
    def summary(res):
        good = [r for r in res if r['agree'] and not r['disagree']]
        return dict(verdict=verdict_of(lemmas, res),
                    confirmed=sorted({i for r in good for i in r['agree']}),
                    agreeing_heads=sorted({r['lemma'] for r in good}),
                    other_stems=sorted({'%s: %s' % (r['stem'], '; '.join(r['disagree'])) for r in res if r['disagree']}))
    rows.append(dict(form=form, lemmas=lemmas, models=sorted({h['model'] for lem in lemmas for h in heads.get(lem, [])}), lewis_short=summary(lsres), collatinus=summary(results)))
json.dump(dict(generated_by='pronunciation/tools/collatinus_stem_check.py', note='Indices in confirmed are character positions in the NFC lower-case form.', forms=rows), open(sys.argv[4], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print('Lewis & Short', Counter(r['lewis_short']['verdict'] for r in rows))
print('Collatinus', Counter(r['collatinus']['verdict'] for r in rows))
