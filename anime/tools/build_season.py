# Build the season artifact folder (usage: python3 tools/build_season.py OUT_DIR [paths...]). The main page is the season hub (season.html);
# is a full page beside it, with the shared scripts, art, paintings, sprites, models (as base64 text, since .glb is not
# a served type) and voice tracks as supporting files. Writes batches.json: the files split into publishes under 60 MB.
import os, re, base64, json, sys
sys.path.insert(0, '/home/user/-curse-hunt-iii/anime/tools')
from season import EPISODES
root = '/home/user/-curse-hunt-iii/anime'; out = sys.argv[1]
os.makedirs(out, exist_ok=True)
HUB = '<a class="hub" href="./" style="margin-left:auto;color:var(--muted);text-decoration:none;font:700 13px/1 var(--f-body);letter-spacing:.08em">&larr; ALL EPISODES</a>'
def prep(s):
    s = s.replace("<script>window.RB_MODE = '3d';</script>", "<script>window.RB_MODE = '3d'; window.RB_MODELS_B64 = true;</script>")  # web types only: models as base64 text
    s = s.replace('</span>\n  </header>', '</span>' + HUB + '\n  </header>', 1)
    if '.eps h4 a' not in s: s = s.replace('.eps h4 {', '.eps h4 a { color: inherit; text-decoration: none; } .eps h4 a:hover, .eps h4 a:focus-visible { color: var(--accent-soft); text-decoration: underline; }\n.eps h4 {', 1)
    for n, title, *_ in EPISODES:
        s = re.sub(r'(<span class="no">%02d</span><div><h4>)(%s)(?!</a>)' % (n, re.escape(title)), r'\1<a href="ep%d.html">\2</a>' % n, s, count=1)
    return s
full_ep1 = os.path.exists(f'{root}/voice/ep01x.mp3')  # until the full-length cut is voiced, Episode 1 is the original edition
sources = {n: (f'ep{n}.html' if n > 1 or full_ep1 else '3d.html') for n in range(1, 13)}
files = {}
for n, src in sources.items():
    open(f'{out}/ep{n}.html', 'w').write(prep(open(f'{root}/{src}').read())); files[f'ep{n}.html'] = f'{out}/ep{n}.html'
scripts = set()
for src in sources.values(): scripts |= set(re.findall(r'<script src="([^"]+)"', open(f'{root}/{src}').read()))
for p in sorted(scripts): files[p] = f'{root}/{p}'
for d in ['assets', 'plates', 'sprites']:
    for f in sorted(os.listdir(f'{root}/{d}')):
        if f.endswith('.webp'): files[f'{d}/{f}'] = f'{root}/{d}/{f}'
os.makedirs(f'{out}/models', exist_ok=True)
for f in sorted(os.listdir(f'{root}/models')):
    if f.endswith('.glb'):
        dst = f'{out}/models/{f}.b64.txt'
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(f'{root}/models/{f}'): open(dst, 'w').write(base64.b64encode(open(f'{root}/models/{f}', 'rb').read()).decode())
        files[f'models/{f}.b64.txt'] = dst
for src in sources.values():
    vd = re.search(r'<script src="js/(voice-data[^"]*)"', open(f'{root}/{src}').read()).group(1)
    v = re.search(r'"?file"?\s*:\s*"([^"]+)"', open(f'{root}/js/{vd}').read()).group(1)
    if os.path.exists(f'{root}/{v}'): files[v] = f'{root}/{v}'
    else: print('not voiced yet:', v)
only = sys.argv[2:]  # optional: only these published paths (prefix match), for an update
if only: files = {k: v for k, v in files.items() if any(k.startswith(o) for o in only)}
batches, cur, size = [], {}, 0
for k, v in files.items():
    sz = os.path.getsize(v)
    if cur and size + sz > 60e6: batches.append(cur); cur, size = {}, 0
    cur[k] = v; size += sz
batches.append(cur)
json.dump(batches, open(f'{out}/batches.json', 'w'), indent=0)
print(len(files), 'files', round(sum(os.path.getsize(v) for v in files.values()) / 1e6, 1), 'MB in', len(batches), 'publishes:', [round(sum(os.path.getsize(v) for v in b.values()) / 1e6, 1) for b in batches])
