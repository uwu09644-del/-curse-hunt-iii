"""Rebuild every Season 1 episode page (ep1.html ... ep12.html) from one table, with the episode guide linked.

usage: python3 tools/season.py        (run from the anime/ folder)
Each page is made by tools/make_page.py from 3d.html, with the cast, creature sprites and painted plates the episode's
script needs (tools/ep_assets.js). Episode 1 is the full-length cut (js/ep01x.js) around Episode 1's own timeline.
"""
import os, re, subprocess

EPISODES = [
    (1, 'The Crossing', '第一話', '踏切', 'ep01x', "2:14 a.m., Nerima. Takuto Kirishima is feeding the cat that used to belong to his missing best friend when the sky cracks open over the railway crossing. A cat-eared girl falls out, and a Skeletal Shieldbearer follows her."),
    (2, 'Branded', '第二話', '烙印', 'ep02', "Sieg brings Takuto and Nemu to the frontier town of Ashford. At the Hunters' Guild, Valentine's appraisal cube reads Takuto's rank as ERROR, Rin Ashveil challenges him on sight, and he learns the hard way that Ruinbreaker cannot block."),
    (3, 'A Flame From Home', '第三話', '故郷の炎', 'ep03', "The licensing exam in the Bramble Wastes. Takuto is teamed with Rin, meets Wick, a flame-headed Skyfallen from Osaka, and learns that nobody has ever gone home. Then the Stonehide Behemoth wakes up where it should not be."),
    (4, 'Cogwheel Heart', '第四話', '歯車の心臓', 'ep04', "Gideon, the Guild's artificer, builds Takuto a chain harness so his axe can block exactly once. Then someone opens a Rift inside the walls of Ashford, and a man in a black suit smiles in the smoke."),
    (5, 'Seven Heads, One River', '第五話', '七つ首の河', 'ep05', "In the river town of Marrowmere, a Hydra regrows every head Takuto cuts off. Breaking a thing and killing it turn out to be different problems, and Rin has to tie herself to the answer."),
    (6, 'The Red Giants March', '第六話', '赤き巨人の行進', 'ep06', "Red Giants march on Fort Cinder in step, like soldiers. Takuto loses control for the first time, Akuro opens his eye, and Rin gets hurt because of it. Vesper, the Guild executioner, is watching."),
    (7, 'Feathers and Ash', '第七話', '羽と灰', 'ep07', "Plume Ogres raid a farming village at the edge of the Greatwood, but they are not hunting. They are running. Takuto learns that some Fiends can be talked to, and that something is herding them west."),
    (8, 'The Fang Ronin', '第八話', '牙の浪人', 'ep08', "On the mountain road to Saint Lumen, Kurozane the Fang Ronin challenges Sieg to a duel at the pass shrine. Six years after Grey Hollow, the Laughing Blade has one trick saved for one person."),
    (9, 'Saint Lumen', '第九話', '聖都ルーメン', 'ep09', "In the golden capital, Lucien Aurel invites Takuto to join the Gilded Order. Takuto finds Haruki standing at the Saint's side, and Haruki does not want to be rescued."),
    (10, 'Morvudd', '第十話', 'モルヴッド', 'ep10', "Sieg's nemesis returns across the plains with a horde, and Sieg holds the old stone bridge alone. Between two seconds, Mr. Sable finally tells Takuto the truth: he is the one who brought him here."),
    (11, 'Calamity', '第十一話', '厄災', 'ep11', "Tyr the Frost Titan is unleashed on Saint Lumen. To save the city, Takuto lets Akuro take over and becomes the Crimson Calamity. Vesper is ordered to execute him, and Nemu reaches him by spending her eighth life."),
    (12, 'Ruinbreaker', '最終話', 'ルインブレイカー', 'ep12', "Lucien raises the Great Sanctum over Saint Lumen to harvest every Brand inside it. Haruki freezes the Saint for three seconds, which is all Takuto needs. A Rift to Earth flickers open, and Takuto has to choose."),
]

def link_guide(path):
    s = open(path).read()
    if '.eps h4 a' not in s:  # guide links keep the guide's look
        s = s.replace('.eps h4 {', '.eps h4 a { color: inherit; text-decoration: none; } .eps h4 a:hover, .eps h4 a:focus-visible { color: var(--accent-soft); text-decoration: underline; }\n.eps h4 {', 1)
    for n, title, *_ in EPISODES:
        s = re.sub(r'(<span class="no">%02d</span><div><h4>)(%s)' % (n, re.escape(title)), r'\1<a href="ep%d.html">\2</a>' % n, s, count=1)
    open(path, 'w').write(s)

if __name__ == '__main__':
    for n, title, jpno, jp, base, syn in EPISODES:
        assets = subprocess.check_output(['node', 'tools/ep_assets.js', f'js/{base}.js'], text=True).split()
        subprocess.check_call(['python3', 'tools/make_page.py', str(n), title, jpno, jp, syn, *assets], env={**os.environ, 'EPFILE': base}, stdout=subprocess.DEVNULL)
        link_guide(f'ep{n}.html')
        print(f'ep{n}.html', title)
