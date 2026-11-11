"""Make an episode page from the 3D Episode 1 page.
usage: python3 tools/make_page.py N 'Title' '第N話' '日本語' 'Synopsis...' cast,list sprite,list plate,list"""
import re, sys
n, title, jpno, jp, syn, cast, sprites, plates = sys.argv[1:9]
s = open('3d.html').read()
s = s.replace('<title>Ruinbreaker 3D</title>', f'<title>Ruinbreaker Episode {n}</title>', 1)
cfg = (f"<script>VOICE_DATA.lenient = true; window.RB_EP_LABEL = 'Episode {n}  ·  {title}'; window.RB_EP_NO = {n}; "
       f"window.RB_CAST = {cast.split(',')!r}; window.RB_SPRITES = {[x for x in sprites.split(',') if x and x != '-']!r}; window.RB_PLATES = {[x for x in plates.split(',') if x and x != '-']!r};</script>")
s = s.replace('<script src="js/voice-data.js"></script>', f'<script src="js/voice-data-ep{int(n):02d}.js"></script>\n' + cfg, 1)
s = s.replace('<script src="js/ep01.js"></script>', f'<script src="js/ep01.js"></script>\n<script src="js/director.js"></script>\n<script src="js/shotkit.js"></script>\n<script src="js/ep{int(n):02d}.js"></script>\n<script src="js/ep{int(n):02d}_shots.js"></script>\n<script>window.RB_EP = EP{int(n):02d};</script>', 1)
s = s.replace('Season 1 · 12 episodes · 3D edition', f'Season 1 · Episode {n}', 1)
s = s.replace('aria-label="Ruinbreaker Episode 1 animation, 3D edition"', f'aria-label="Ruinbreaker Episode {n} animation"', 1)
s = s.replace('<div class="eyebrow">Episode 1</div>\n      <h1>The Crossing</h1>\n      <div class="jp">第一話「踏切」</div>', f'<div class="eyebrow">Episode {n}</div>\n      <h1>{title}</h1>\n      <div class="jp">{jpno}「{jp}」</div>', 1)
s = s.replace('<span data-dur>11:32</span>', '<span data-dur>24:00</span>', 1)
s = re.sub(r'<p class="syn">.*?</p>', f'<p class="syn">{syn}</p>', s, count=1, flags=re.S)
s = s.replace('<li class="now"><span class="no">01</span><div><h4>The Crossing<em>NOW PLAYING</em></h4>', '<li><span class="no">01</span><div><h4>The Crossing</h4>', 1)
m = re.search(r'<li><span class="no">%02d</span><div><h4>([^<]*)</h4>' % int(n), s)
if m: s = s.replace(m.group(0), '<li class="now"><span class="no">%02d</span><div><h4>%s<em>NOW PLAYING</em></h4>' % (int(n), m.group(1)), 1)
open(f'ep{n}.html', 'w').write(s)
print('ep%s.html' % n)
