"""Phase 1 inventory of Latin-bearing records in LATIN-X. Read-only.
Usage: python3 -I inventory.py <repo> <out.json>
"""
import json, re, sys, glob, os, subprocess
repo, out = sys.argv[1], sys.argv[2]
R = []
def rec(rid, f, loc, kind, la, en=None, learner=True, status=None, extra=None):
    R.append(dict(record_id=rid, file=f, locator=loc, kind=kind, latin=la, english=en,
                  learner_facing=learner, status=status, **(extra or {})))
J = lambda p: json.load(open(os.path.join(repo, p), encoding='utf-8'))

# A. legacy lessons (published, graded)
for p in sorted(glob.glob(os.path.join(repo, 'lessons/legacy/ch*.json'))):
    f = os.path.relpath(p, repo); d = json.load(open(p, encoding='utf-8')); cid = d['id']; s = d['legacy_source']
    st = d['status']
    rec(cid+'.name', f, 'legacy_source.name', 'title', s['name'], status=st)
    rec(cid+'.sub', f, 'legacy_source.sub', 'subtitle', s['sub'], status=st)
    rec(cid+'.context', f, 'legacy_source.context', 'context', s['context'], status=st)
    rec(cid+'.explain', f, 'legacy_source.explain', 'explanation', s['explain'], status=st)
    for x in d['sentences']:
        rec(x['id'], f, 'sentences[%s]' % x['id'], 'sentence', x['text_la'], x['en'], status=st)
    for i, v in enumerate(s['v'], 1):
        rec('%s.v%02d' % (cid, i), f, 'legacy_source.v[%d]' % (i-1), 'vocab', ' | '.join([v[0], v[2]]).strip(' |'), v[1], status=st)
    for i, q in enumerate(d['questions'], 1):
        t = q['legacy_source']
        rec(q['id'], f, 'questions[%d]' % (i-1), 'question_mc' if t[1] else 'question_short',
            json.dumps(t, ensure_ascii=False), None, status=st)
    c = d['cloze_source']
    rec(cid+'.cloze', f, 'cloze_source', 'cloze', json.dumps(c, ensure_ascii=False), status=st)

# B. runtime strings
rt = os.path.join(repo, 'app/legacy-runtime.js'); src = open(rt, encoding='utf-8').read()
m = re.search(r'const shared=(\[\[.*?\]\]);', src)
for i, v in enumerate(json.loads(m.group(1)), 1):
    rec('runtime.shared.%02d' % i, 'app/legacy-runtime.js', 'shared[%d]' % (i-1), 'vocab', ' | '.join([v[0], v[2]]).strip(' |'), v[1], status='legacy_unreviewed')
gc = re.search(r'const guidedCloze=\[(.*?)\n\];', src, re.S)
for i, line in enumerate(re.findall(r'\{text:.*?\}', gc.group(1)), 1):
    rec('runtime.guidedCloze.%02d' % i, 'app/legacy-runtime.js', 'guidedCloze[%d]' % (i-1), 'cloze_runtime_copy', line, status='legacy_unreviewed')
UI = ['Legō…','Lectiō','Exercitia','Memoria','Progressus','Liber prīmus','Dux discendī','Verbum electum','Rectē!','Rēlege sententiam','Bene respondistī','Nōndum','Rēlege narrātiōnem','Vērum','Falsum','Respondē Latīnē…','Verbum dēest','Servāta','Hodiē','Posteā','Elige verbum Latīnum in lēctiōne','Ostende significātiōnem','Musica ex fontibus Graecīs et Rōmānīs īnspīrāta est; reconstrūctiō incerta est.','Vōx mea','Lectiō lecta','Recordātiō incepta','Intellege et responde','Lectiō propria']
for i, u in enumerate(UI, 1):
    lines = [str(n+1) for n, l in enumerate(src.split('\n')) if u.rstrip('…!.') in l]
    rec('runtime.ui.%02d' % i, 'app/legacy-runtime.js', 'line ' + ','.join(lines), 'ui_string', u, status='ui')
for f, strings in [('index.html', ['I · Lectiō — Read','II · Exercitia — Practise','III · Memoria — Remember','Tablinum — Prima Via','I · Hortus, II · Familia, III · Dōnum, IV · Cēna, V · Forum, VI · Canis, VII · Tempestās and VIII · Crās']),
                   ('app/65-picture-practice.js', ['Quaestiōnēs pictae','Caput','Rectē! Reviewed answer.','Nōndum. Try again.']),
                   ('content/music.js', ['Hortus serēnus','Sub columnīs','Vesper in vīllā'])]:
    txt = open(os.path.join(repo, f), encoding='utf-8').read()
    for i, u in enumerate(strings, 1):
        lines = [str(n+1) for n, l in enumerate(txt.split('\n')) if u.split(',')[0] in l]
        rec('%s.ui.%02d' % (f.split('/')[-1].split('.')[0], i), f, 'line ' + ','.join(lines), 'ui_string', u, status='ui')

# C. Book I pilot (draft, unpublished)
for p in sorted(glob.glob(os.path.join(repo, 'lessons/b01/c*.json'))):
    f = os.path.relpath(p, repo); d = json.load(open(p, encoding='utf-8')); st = d['status']
    rec(d['id']+'.title', f, 'title', 'title', d['title'], learner=False, status=st)
    for k in ('proposed_new_lemmas_raw', 'proposed_grammar_raw', 'proposed_margin_raw'):
        rec(d['id']+'.'+k, f, k, 'margin_or_meta', d[k], learner=False, status=st)
    for seg in d['segments']:
        rec(seg['id'], f, 'segments[%s].title_la' % seg['id'], 'title', seg['title_la'], learner=False, status=st)
        for x in seg['sentences']:
            rec(x['id'], f, 'source_line %s' % x.get('source_line'), 'sentence', x['text_la'], learner=False, status=st)
    for e in d['exercises']:
        la = e.get('text_original') or e.get('prompt_la')
        rec(e['id'], f, 'exercises[%s]' % e['id'], 'exercise_'+e['type'], la, learner=False, status=e['status'])
    for e in d['speaking']:
        rec(e['id'], f, 'speaking[%s]' % e['id'], 'speaking', e['text_original'], learner=False, status=e['status'])

# D. picture practice (separate page; unpublished, ungraded)
pe = J('curriculum/picture-exercises-b01.json')
for ch, lst in pe['chapters'].items():
    for e in lst:
        rec('pic.'+e['id'], 'curriculum/picture-exercises-b01.json', e['id'], 'picture_prompt', e['prompt_la'], None, learner=True,
            status=e['status'], extra={'answer': e['answer']})

# E. narration catalogue (transcripts for audio)
node = "require('%s/content/narration.js');process.stdout.write(JSON.stringify(globalThis.TablinumNarrationCatalogue))" % repo
nar = json.loads(subprocess.check_output(['node', '-e', node]))
for s in nar['sentences']:
    rec('narration.'+s['sentence_id'], 'content/narration.js', s['sentence_id'], 'audio_transcript', s['canonical_text'],
        status=';'.join(t.get('owner_listening', '') for t in s['takes']))
for w in nar['words']:
    rec('narration.'+w['clip_id'], 'content/narration.js', w['clip_id'], 'audio_transcript_word', w['canonical_text'], status=w.get('owner_listening'))
for p in sorted(glob.glob(os.path.join(repo, 'docs/audio/arjun_lectio_ch0*_20261110.json'))):
    f = os.path.relpath(p, repo); d = json.load(open(p, encoding='utf-8'))
    items = d if isinstance(d, list) else d.get('lines') or d.get('items') or d.get('clips') or d.get('sentences') or []
    for i, it in enumerate(items):
        txt = it.get('prompt_text') or it.get('text') or it.get('tts_text') or it.get('canonical_text') or json.dumps(it, ensure_ascii=False)
        rec('%s#%d' % (os.path.basename(p), i), f, 'items[%d]' % i, 'tts_generation_text', txt, learner=False,
            status=it.get('owner_listening'), extra={'raw': it})

ch1 = J('docs/audio/ARJUN_CH1_REGENERATION_20261109.json')
for i, tk in enumerate(ch1['takes']):
    rec('ARJUN_CH1#%s' % tk['key'], 'docs/audio/ARJUN_CH1_REGENERATION_20261109.json', 'takes[%d]' % i, 'tts_generation_text',
        tk['private_tts_prompt'], None, learner=False, status=tk.get('owner_listening'), extra={'canonical_text': tk['canonical_text']})

# F. paradigm proposal engine samples
ps = J('tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json')
for s in ps['specimens']:
    for c in s['checks']:
        rec('paradigm.%s.%s' % (s['pattern'], c[0]), 'tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json', s['pattern'], 'paradigm_assertion',
            c[1], None, learner=False, status=ps['review_status'], extra={'lexeme': s['lexeme']['head'] if 'head' in s['lexeme'] else s['lexeme'].get('principal_parts')})

# G. legacy candidate lexicon (unsigned)
cm = J('curriculum/lexicon/legacy-candidate-map.json')
cands = cm.get('candidates') if isinstance(cm, dict) else cm
if isinstance(cands, dict): cands = list(cands.values())
for c in cands or []:
    rec('lexcand.'+str(c.get('id') or c.get('candidate_id')), 'curriculum/lexicon/legacy-candidate-map.json', str(c.get('id') or c.get('candidate_id')), 'lexicon_candidate',
        str(c.get('head_as_in_app')), str(c.get('original_gloss')), learner=False, status=c.get('review_state'), extra={'raw': c})

json.dump(R, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(R)); print(Counter((r['kind'], r['learner_facing']) for r in R))
