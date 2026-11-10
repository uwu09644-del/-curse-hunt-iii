/* RUINBREAKER — Episode 1 "The Crossing" (第一話「踏切」)
   Shot list, dialogue, sound design and score on one timeline. */
'use strict';

const EP01 = (() => {
  const G = GFX, S = SND;
  const { W, H, clamp, lerp, inv, ease, hash } = G;
  const shots = [], subs = [], ev = [], chapters = [];
  let T = 0;

  /* ---------- timeline helpers ---------- */
  function shot(d, draw, o = {}) {
    const s = { t0: T, d, draw, vig: o.vig !== false, grain: o.grain ?? 0.07, xin: o.xin || 0 };
    shots.push(s);
    (o.subs || []).forEach(([a, b, who, text, mono]) => subs.push({ t0: T + a, t1: T + b, who, text, mono: !!mono }));
    (o.sfx || []).forEach(([a, f, d2 = 0.2, long = false]) => ev.push({ t: T + a, d: d2, f, long }));
    T += d; return s;
  }
  const at = (t, f, d = 0.2, long = false) => ev.push({ t, d, f, long });
  const chapter = name => chapters.push({ t: T, name });
  const n = S.n;

  /* ---------- reusable shot painters ---------- */
  const TK = { bx: 368, by: 785, ex: 405, ey: 222, hx: 112, hy: 452 }; // Takuto anchors (original art px)
  const NM = { bx: 460, by: 920, hx: 520, hy: 150 };
  const SB = { bx: 380, by: 1068, sx: 342, sy: 160, eyes: [[326, 178], [358, 178]], shx: 590, shy: 700 };
  const DUSK = { mul: '#f3c4ae', mulA: 0.5, glow: { c: '#ffb070', a: 0.3, r: 16 } };
  const shake = (t, amt, fps = 30) => { if (amt <= 0) return; const k = G.twos(t, fps); G.ctx.translate((hash(k, 1) - 0.5) * amt * 2, (hash(k, 2) - 0.5) * amt * 2); };
  const pt = (ax, ay, cx, cy, sc, x, y) => [cx + (x - ax) * sc, cy + (y - ay) * sc];
  const bokeh = (t, list, a = 1) => list.forEach(([x, y, r, c], i) => G.radial(x + Math.sin(t * 0.3 + i) * 4, y, r, c, 'rgba(0,0,0,0)', a * (0.75 + 0.25 * Math.sin(t * 0.7 + i * 2)), 'lighter'));
  const EARTH_BOKEH = [[1050, 140, 120, 'rgba(160,190,255,0.45)'], [1180, 260, 70, 'rgba(255,190,120,0.35)'], [140, 120, 90, 'rgba(255,80,60,0.18)'], [300, 300, 60, 'rgba(255,200,140,0.25)'], [900, 600, 140, 'rgba(120,150,255,0.18)']];
  const DUSK_BOKEH = [[200, 120, 160, 'rgba(255,170,110,0.35)'], [1100, 160, 130, 'rgba(255,220,180,0.3)'], [900, 620, 120, 'rgba(255,120,90,0.2)'], [400, 600, 90, 'rgba(255,190,130,0.2)']];

  function eyes(t, lt, d, o = {}) { // extreme close-up on Takuto's eyes (axe stays out of frame)
    const { mode = 'dusk', z0 = 6.2, z1 = 6.8, cx = 390, cy = 226, flash = 0 } = o;
    const sc = lerp(z0, z1, ease.io(clamp(lt / d)));
    if (mode === 'earth') { G.vgrad([[0, '#0a0e1a'], [1, '#1a1626']]); bokeh(t, EARTH_BOKEH); }
    else if (mode === 'red' || mode === 'blood') { G.vgrad([[0, '#1a0003'], [1, '#3a0508']]); bokeh(t, [[200, 150, 160, 'rgba(255,40,40,0.3)'], [1100, 500, 180, 'rgba(255,60,30,0.3)']]); }
    else { G.vgrad([[0, '#3a1f33'], [1, '#c26a58']]); bokeh(t, DUSK_BOKEH); }
    const fx = mode === 'earth' ? { mul: o.lamp ? '#ff5050' : '#a9bcff', mulA: o.lamp ? 0.55 : 0.45 }
      : mode === 'red' ? { mul: '#ff5a5a', mulA: 0.65 } : mode === 'blood' ? { mul: '#ff3a3a', mulA: 0.7 } : { mul: '#ffcfb5', mulA: 0.35 };
    G.fig('takuto', W / 2, H / 2, cx, cy, sc, fx);
    if (mode === 'red' || mode === 'blood' || o.glowEyes) {
      const ga = o.glowEyes ?? 0.7;
      [[365, 222], [447, 220]].forEach(([x, y]) => { const [sx, sy] = pt(cx, cy, W / 2, H / 2, sc, x, y); G.radial(sx, sy, 40 * sc / 6, 'rgba(255,60,50,' + ga + ')', 'rgba(255,0,0,0)', 1, 'lighter'); });
    }
    if (mode === 'earth') G.rain(t, { n: 120, a: 0.25, len: 40, speed: 1700, seed: 4 });
    if (mode === 'red' || mode === 'blood') G.motes(t, { n: 40, vy: -60, color: '#ff6a3a', size: 2.5, seed: 21 });
    if (flash) G.fill('#fff', flash);
  }
  function takutoFull(t, cx, cy, sc, fx = {}) { G.fig('takuto', cx, cy, TK.bx, TK.by, sc, fx); }
  function nemuFull(t, cx, cy, sc, fx = {}) { // gentle breathing
    const br = 1 + Math.sin(t * 1.6) * 0.004;
    G.fig('nemu', cx, cy, NM.bx, NM.by, sc * br, fx);
  }
  function shieldAt(t, cx, cy, sc, fx = {}, eyeA = 1) {
    G.fig('shield', cx, cy, SB.bx, SB.by, sc, fx);
    if (eyeA > 0) SB.eyes.forEach(([x, y]) => { const [sx, sy] = pt(SB.bx, SB.by, cx, cy, sc, x, y); const fl = 0.8 + 0.2 * Math.sin(t * 9); G.radial(sx, sy, 26 * sc + 8, 'rgba(255,40,30,' + (0.95 * eyeA * fl).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter'); G.radial(sx, sy, 5 * sc + 2, 'rgba(255,230,200,' + eyeA + ')', 'rgba(255,80,60,0)', 1, 'lighter'); });
  }
  function silGirl(x, y, s, rot, a = 1) { // tiny cat-eared silhouette (used before Nemu is introduced)
    const c = G.ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#050407';
    c.beginPath(); c.arc(0, -40, 9, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-8, -45); c.lineTo(-7, -58); c.lineTo(-2, -48); c.fill(); c.beginPath(); c.moveTo(8, -45); c.lineTo(7, -58); c.lineTo(2, -48); c.fill();
    c.fillRect(-7, -32, 14, 22); c.fillRect(-8, -12, 7, 20); c.fillRect(1, -12, 7, 20); c.fillRect(-12, -30, 4, 16); c.fillRect(8, -30, 4, 16);
    c.lineWidth = 3; c.strokeStyle = '#050407'; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(18, -8, 16, -26); c.stroke();
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,60,60,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(0, -40, 9, -2, 0.5); c.stroke(); c.restore();
  }
  function twoShot(t, lt, d, o = {}) {
    const { push = 0.03, mood = 'dusk', camx = 0 } = o, z = 1 + push * ease.io(clamp(lt / d));
    G.barrow(t, { x: camx, y: 0, z }, { mood, fogA: 0.45 });
    const c = G.ctx; c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    takutoFull(t, 330, 800, 0.86, DUSK);
    nemuFull(t, 960, 960, 0.8, DUSK);
    c.restore();
    G.frontFog(t, 0.4, '#e9b5b5', 560, 30);
  }
  function nemuClose(t, lt, d, o = {}) {
    const { sc0 = 1.45, sc1 = 1.55, ay = NM.hy + 40 } = o, sc = lerp(sc0, sc1, ease.io(clamp(lt / d)));
    G.barrow(t, { x: 120, y: -40, z: 1.25 }, { mood: o.mood || 'dusk', fogA: 0.5 });
    G.fill('#2a1020', 0.25);
    nemuFull(t, W / 2 + 130, H / 2 + 60 + (NM.by - ay) * sc, sc, DUSK);
    G.frontFog(t, 0.35, '#e9b5b5', 600, 30);
  }
  function inkPanel(t, lt, d, nm, o = {}) {
    G.paper();
    const z = lerp(1.0, 1.08, clamp(lt / d)), a = G.A[nm];
    const src = G.duo(nm, '#1d1412', '#ffffff');
    const c = G.ctx; c.save(); c.globalAlpha = ease.out(inv(0, 1.2, lt)) * (o.a ?? 1);
    if (o.cut) G.fig(nm, o.cx, o.cy, o.ax, o.ay, o.sc * z, { src, comp: 'multiply' });
    else G.cover(nm, o.x ?? 240, o.y ?? 40, o.w ?? 800, o.h ?? 640, o.fx ?? 0.5, o.fy ?? 0.45, z, { src, comp: 'multiply' });
    c.restore();
    if (!o.cut) { // feather the print into the paper
      const x = o.x ?? 240, y = o.y ?? 40, w = o.w ?? 800, h = o.h ?? 640, f = 70, P = 'rgba(233,224,207,', g2 = (x0, y0, x1, y1) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, P + '1)'); gr.addColorStop(1, P + '0)'); return gr; };
      c.fillStyle = g2(x, 0, x + f, 0); c.fillRect(x - 2, y - 2, f, h + 4); c.fillStyle = g2(x + w, 0, x + w - f, 0); c.fillRect(x + w - f, y - 2, f + 2, h + 4);
      c.fillStyle = g2(0, y, 0, y + f); c.fillRect(x - 2, y - 2, w + 4, f); c.fillStyle = g2(0, y + h, 0, y + h - f); c.fillRect(x - 2, y + h - f, w + 4, f + 2);
    }
    if (o.red) G.inkStroke(o.red, ease.out(inv(0.4, 2.2, lt)), 9, 'rgba(170,18,28,0.85)');
    if (o.label) { G.txt(o.label, 1180, 90, { font: '400 26px ' + G.FONT.jp, fill: 'rgba(150,20,28,0.75)', align: 'right', a: inv(0.8, 1.8, lt) }); }
    G.vignette(0.5);
  }
  function earthPOV(t, cam, o) { G.earth(t, cam, o); G.rain(t, { n: 280, a: 0.32, seed: 1 }); G.splashes(t, { n: 46 }); }
  const focusCam = (wx, wy, sx, sy, z, d = 0.5) => { const zl = 1 + (z - 1) * d; return { x: ((wx - W / 2) * zl - (sx - W / 2)) / d, y: ((wy - H / 2) * zl - (sy - H / 2)) / d, z }; };
  const mixCam = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });

  /* ---------- poster (pre-rendered on first use) ---------- */
  let posterC = null;
  function buildPoster() {
    const sc = 2, pw = 320, ph = 450; posterC = G.canvas(pw * sc, ph * sc); const g = posterC.getContext('2d'); g.scale(sc, sc);
    g.fillStyle = '#efece4'; g.fillRect(0, 0, pw, ph);
    g.fillStyle = '#b3141d'; g.fillRect(0, 0, pw, 86);
    g.fillStyle = '#fff'; g.font = '400 52px ' + G.FONT.jp; g.textAlign = 'center'; g.fillText('行方不明', pw / 2, 58);
    g.font = '700 13px ' + G.FONT.sub; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('MISSING PERSON', pw / 2, 78); if ('letterSpacing' in g) g.letterSpacing = '0px';
    const a = G.A.haruki; // photo
    g.save(); g.fillStyle = '#222'; g.fillRect(85, 102, 150, 172); g.beginPath(); g.rect(90, 107, 140, 162); g.clip();
    g.fillStyle = '#d8d4cc'; g.fillRect(90, 107, 140, 162);
    g.drawImage(a.img, (330 - a.ox) * a.s, (20 - a.oy) * a.s, 210 * a.s, 245 * a.s, 90, 107, 140, 162);
    g.globalCompositeOperation = 'saturation'; g.fillStyle = '#000'; g.fillRect(90, 107, 140, 162);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#d9ccb4'; g.fillRect(90, 107, 140, 162); g.restore();
    g.fillStyle = '#1b1b1b'; g.textAlign = 'center';
    g.font = '400 24px ' + G.FONT.jp; g.fillText('新庄 春樹（16）', pw / 2, 306);
    g.font = '700 12px ' + G.FONT.sub; g.fillText('SHINJO HARUKI, 16', pw / 2, 324);
    g.font = '400 12px ' + G.FONT.jp; g.fillText('2024年11月9日 第4踏切付近で目撃', pw / 2, 352);
    g.font = '500 11px ' + G.FONT.sub; g.fillStyle = '#333'; g.fillText('Last seen Nov. 9, 2024 near Crossing No. 4', pw / 2, 368);
    g.font = '400 12px ' + G.FONT.jp; g.fillStyle = '#1b1b1b'; g.fillText('心当たりの方は練馬警察署まで', pw / 2, 396);
    g.font = '500 11px ' + G.FONT.sub; g.fillStyle = '#333'; g.fillText('Any information: Nerima Police Station', pw / 2, 412);
    g.fillStyle = 'rgba(80,60,40,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(Math.random() * pw, 86 + Math.random() * (ph - 86), 2 + Math.random() * 4, 30 + Math.random() * 90); // water stains
    g.fillStyle = 'rgba(255,255,255,0.4)'; [[6, 6], [pw - 46, 6], [6, ph - 22], [pw - 46, ph - 22]].forEach(([x, y]) => g.fillRect(x, y, 40, 14)); // tape
  }
  function posterShot(t, lt, d) {
    if (!posterC) buildPoster();
    const c = G.ctx, z = lerp(1.0, 1.18, ease.io(clamp(lt / d))), py = lerp(0, -40, ease.io(clamp(lt / d)));
    G.vgrad([[0, '#070912'], [1, '#14121c']]); bokeh(t, EARTH_BOKEH, 0.9);
    c.save(); c.translate(W / 2, H / 2 + py); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const pg = c.createLinearGradient(470, 0, 810, 0); pg.addColorStop(0, '#0d1110'); pg.addColorStop(0.35, '#3a4440'); pg.addColorStop(0.6, '#26302d'); pg.addColorStop(1, '#090b0b');
    c.fillStyle = pg; c.fillRect(470, -100, 340, H + 200);
    for (let y = -100; y < H + 100; y += 90) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(470, y, 340, 6); }
    c.save(); c.translate(640, 380); c.rotate(-0.025); c.drawImage(posterC, -160, -225, 320, 450);
    const sh = c.createLinearGradient(-160, -225, 160, 225); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); sh.addColorStop(0.7, 'rgba(180,200,255,0.10)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = sh; c.fillRect(-160, -225, 320, 450);
    c.strokeStyle = 'rgba(200,215,240,0.35)'; c.lineWidth = 1.5; // drips running down the plastic sleeve
    for (let i = 0; i < 14; i++) { const x = -150 + hash(i, 3) * 300, sp = 30 + hash(i, 4) * 50, y0 = -225 + ((t * sp + hash(i, 5) * 450) % 450); c.beginPath(); c.moveTo(x, y0 - 40); c.lineTo(x + 1, y0); c.stroke(); c.fillStyle = 'rgba(220,230,255,0.6)'; c.beginPath(); c.arc(x + 1, y0, 2.2, 0, 7); c.fill(); }
    c.restore(); c.restore();
    G.rain(t, { n: 90, a: 0.3, len: 60, speed: 1900, seed: 8, lw: 1.6 });
  }
  function catClose(t, lt, d, pose) {
    const c = G.ctx, z = lerp(1, 1.06, clamp(lt / d));
    G.vgrad([[0, '#06070d'], [0.55, '#0e1220'], [1, '#05060a']]); bokeh(t, [[980, 200, 220, 'rgba(170,200,255,0.5)'], [260, 180, 120, 'rgba(255,190,120,0.25)'], [620, 120, 80, 'rgba(255,255,255,0.15)']]);
    c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const gg = c.createLinearGradient(0, 470, 0, H); gg.addColorStop(0, '#11131b'); gg.addColorStop(1, '#07080c'); c.fillStyle = gg; c.fillRect(-100, 470, W + 200, 400);
    G.radial(900, 520, 380, 'rgba(150,180,255,0.18)', 'rgba(0,0,0,0)', 1, 'lighter');
    c.fillStyle = '#c9ccd4'; c.beginPath(); c.ellipse(560, 600, 70, 16, 0, 0, 7); c.fill(); c.fillStyle = '#8a7a6a'; c.beginPath(); c.ellipse(560, 596, 52, 9, 0, 0, 7); c.fill(); // dish of tuna
    G.drawBag(300, 610, 2.2);
    G.drawCat(700, 610, 3.0, pose, t, '#b8ccff');
    c.save(); c.globalAlpha = 0.25; c.translate(0, 1220); c.scale(1, -1); G.drawCat(700, 610, 3.0, pose, t, '#b8ccff'); c.restore(); // reflection
    c.restore();
    G.splashes(t, { n: 60, y0: 520, y1: 720, a: 0.5 });
    G.rain(t, { n: 160, a: 0.3, len: 34, seed: 2 });
  }

  /* ====================================================================
     COLD OPEN (flash-forward)
     ==================================================================== */
  chapter('Cold open');
  shot(4, (lt, d, t) => { G.fill('#000'); G.motes(t, { n: 30, vy: -25, color: '#ff4a2a', a: 0.5 * inv(0, 2, lt), size: 1.8, seed: 3 }); },
    { subs: [[1.0, 3.9, 'AKURO', 'Tell me, boy...']], sfx: [[0.3, (g, w) => S.heartbeat(g, w, 0.55)], [1.6, (g, w) => S.heartbeat(g, w, 0.6)], [2.9, (g, w) => S.heartbeat(g, w, 0.65)]] });
  shot(4.5, (lt, d, t) => { eyes(t, lt, d, { mode: 'red', z0: 6.6, z1: 7.4 }); G.fill('#000', 1 - inv(0, 0.6, lt)); },
    { subs: [[0.3, 4.2, 'AKURO', '...what is it you want to break?']], sfx: [[3.6, (g, w) => S.heartbeat(g, w, 0.7)]] });
  shot(7.5, (lt, d, t) => {
    const z = lerp(1.0, 1.12, ease.io(lt / d));
    G.barrow(t, { x: 0, y: 0, z }, { mood: 'blood', fogA: 0.6 });
    const c = G.ctx; c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    takutoFull(t, 640, 820, 0.92, { sil: '#1a0406', silA: 0.72, mul: '#ff6b5b', mulA: 0.5, glow: { c: '#ff2a1a', a: 0.7 + 0.2 * Math.sin(t * 6), r: 26 } });
    c.restore();
    G.motes(t, { n: 110, vy: -90, vx: 20, color: '#ff7a3a', size: 2.4, seed: 5 });
    G.frontFog(t, 0.5, '#ff6a6a');
    G.fill('#000', 1 - inv(0, 0.4, lt));
  }, { subs: [[2.0, 6.0, 'TAKUTO', 'Everything that\'s in the way.']], sfx: [[0, (g, w) => S.whoosh(g, w, 1.2, 0.12, 200, 900)]] });
  shot(2, () => G.fill('#000'), { sfx: [[0, (g, w) => { S.boom(g, w, 0.55); S.shatter(g, w + 0.03, 0.18, 4); }]] });
  // cold open score: low drone + brass swell
  at(0, (g, w, off) => { S.pad(g, w, n('D2'), 16.5 - off, { vol: 0.07, cut: 380, att: 2 }); S.pad(g, w, n('A2'), 16.5 - off, { vol: 0.04, cut: 500, att: 3 }); }, 17, true);
  at(9.8, (g, w) => { S.brass(g, w, n('D3'), 5.5, 0.07); S.brass(g, w, n('A3'), 5.5, 0.05); S.brass(g, w, n('D4'), 5.5, 0.04); S.choir(g, w, n('F4'), 5, 0.035, 1.5); });
  at(9.8, (g, w) => S.taiko(g, w, 0.4));

  /* ====================================================================
     EARTH — Nerima, Crossing No. 4, 2:14 a.m.
     ==================================================================== */
  chapter('Nerima, 2:14 a.m.');
  const E0 = T;
  at(E0, (g, w, off) => S.noiseBed(g, w, off, 83, { vol: 0.16, hp: 900, lp: 7500, fin: 2.5, fout: 1 }), 83, true); // rain
  at(E0, (g, w, off) => S.noiseBed(g, w, off, 83, { vol: 0.12, brown: true, lp: 600, fin: 2.5, fout: 1 }), 83, true); // rain body
  const trainCam = { x: 0, y: 0, z: 1 };
  shot(10, (lt, d, t) => {
    const head = -100 + 1150 * (lt - 0.4), gate = ease.io(inv(7.0, 8.5, lt));
    earthPOV(t, { x: 0, y: 0, z: lerp(1, 1.04, lt / d) }, { lamps: lt < 7.6, gate, cat: 'sit', train: lt > 0.4 && lt < 7 ? { x: head, v: 1150 } : null });
    G.locationCard(lt - 1.0, 5.2, 'NERIMA, TOKYO', 'Crossing No. 4  ·  2:14 a.m.');
    G.fill('#000', 1 - inv(0, 1.2, lt));
  }, { subs: [[6.2, 9.8, 'TAKUTO', 'Two-fourteen. Last freight of the night.', true]],
    sfx: [[0.2, (g, w, off) => S.train(g, w, off, 7.4, 0.42), 7.4, true]] });
  for (let k = 0; k * 0.5 < 7.6; k++) at(E0 + k * 0.5, (g, w) => S.kan(g, w, 0.11));
  // gentle night piano begins as the train clears
  const CUE_NIGHT = E0 + 8.5;
  shot(7, (lt, d, t) => {
    const cam = mixCam(focusCam(640, 360, 640, 360, 1.04), focusCam(925, 420, 640, 400, 2.3), ease.io(clamp(lt / 2.2)));
    earthPOV(t, cam, { gate: 1, cat: 'sit' });
  }, { subs: [[0.5, 3.4, 'TAKUTO', 'Same crossing. Same bell.', true], [3.8, 6.6, 'TAKUTO', 'Same cat.', true]], sfx: [[4.6, (g, w) => S.meow(g, w, 0.045)]] });
  shot(7, (lt, d, t) => posterShot(t, lt, d), { subs: [[0.6, 6.6, 'TAKUTO', 'It was Haruki\'s cat first. He fed it every night on his way home.', true]] });
  shot(7, (lt, d, t) => eyes(t, lt, d, { mode: 'earth', z0: 6.3, z1: 6.7 }), { subs: [[0.4, 3.4, 'TAKUTO', 'Two years now.', true], [3.6, 6.8, 'TAKUTO', 'So I bring the cat food. Somebody has to.', true]] });
  shot(7, (lt, d, t) => catClose(t, lt, d, 'eat'), { subs: [[0.6, 3.4, 'TAKUTO', 'Tuna. The expensive kind. Don\'t tell anyone.'], [3.7, 6.8, 'TAKUTO', 'Grandma used to say I was born to carry things for other people.', true]] });
  shot(6, (lt, d, t) => {
    earthPOV(t, focusCam(700, 420, 640, 380, lerp(1.25, 1.35, lt / d)), { gate: 1, cat: lt > 1.0 ? 'alert' : 'sit' });
  }, { subs: [[2.2, 4.8, 'TAKUTO', '...What is it?']], sfx: [[1.0, (g, w) => S.tone(g, w, 55, 5.5, 0.05, 'sine', 'sfx', 3, 0.5)]] });
  const SKY = T;
  shot(7, (lt, d, t) => { // the sky cracks
    const p = inv(0.8, 6.2, lt), c = G.ctx;
    G.layer(G.L.eSky, { x: 0, y: -110, z: 1.05 }, 1);
    G.radial(640, 200, 700, 'rgba(255,30,40,' + (0.35 * p).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter');
    c.save(); shake(t, p * 1.5); G.drawCrack(t, p, 0.6 + p); c.restore();
    G.layer(G.L.eMid, { x: 0, y: -300, z: 1.0 }, 1);
    G.rain(t, { n: 200, a: 0.25, seed: 9 });
  }, { subs: [[3.8, 6.6, 'TAKUTO', 'The bell... There\'s no train.', true]], sfx: [[0.8, (g, w) => S.crackSky(g, w, 6.4, 0.16)]] });
  for (let k = 0; k * 0.5 < 30.5; k++) at(SKY + 3.5 + k * 0.5, (g, w) => S.kan(g, w, 0.12)); // bell rings on its own until the aftermath
  shot(2.5, (lt, d, t) => eyes(t, lt, d, { mode: 'earth', lamp: Math.floor((t) / 0.5) % 2 === 0, z0: 6.6, z1: 8.6 }), { sfx: [[0, (g, w) => S.whoosh(g, w, 0.6, 0.18, 400, 2400)]] });
  shot(5.5, (lt, d, t) => { // the rift tears open; something falls out
    const open = ease.out(inv(0, 1.2, lt)), c = G.ctx;
    c.save(); shake(t, (1 - inv(0, 2, lt)) * 6 + (lt > 3.6 && lt < 4.1 ? 6 : 0));
    earthPOV(t, { x: 0, y: -20, z: 1.0 }, { lamps: true, gate: 0, cat: 'alert', rift: { open, cx: 640, cy: 150 },
      world: () => {
        const f = inv(1.0, 3.6, lt);
        if (lt > 1.0 && lt < 3.6) { const y = lerp(170, 500, f * f), x = lerp(650, 600, f); silGirl(x, y, 1.1, f * 9, 1); }
        if (lt >= 3.6) silGirl(600, 506, 1.1, -1.5, 1);
      } });
    c.restore();
    if (lt > 3.6) G.motes(t - 3.6, { n: 30, vy: -30, vx: 0, wob: 40, size: 3, color: '#8a8a90', a: 0.4 * (1 - inv(3.6, 5.5, lt)), glow: false, seed: 31, x0: 520, x1: 700, y0: 440, y1: 520 });
  }, { sfx: [[0, (g, w) => S.riftRoar(g, w, 5, 0.22)], [3.6, (g, w) => S.thud(g, w, 0.5)]] });
  shot(6, (lt, d, t) => { // the Shieldbearer climbs down
    const land = 3.5, c = G.ctx, f = ease.in(inv(0.4, land, lt));
    c.save(); shake(t, lt > land && lt < land + 0.7 ? 14 * (1 - inv(land, land + 0.7, lt)) : 1.5);
    earthPOV(t, { x: 0, y: -20, z: lerp(1.0, 1.08, lt / d) }, { lamps: true, gate: 0, cat: 'alert', brokenGate: lt > land + 0.1, rift: { open: 1, cx: 640, cy: 150 },
      world: () => {
        silGirl(600, 506, 1.1, -1.5, 1);
        const g = G.ctx; g.save(); if (lt < land) { g.beginPath(); g.rect(-400, 132, W + 800, 2000); g.clip(); } // it climbs out of the rift
        shieldAt(t, 720, lerp(220, 528, f), 0.43, { mul: '#45333a', mulA: 0.85, sil: '#0b0608', silA: 0.35, glow: { c: '#ff2a35', a: 0.55, r: 10 } }); g.restore();
      } });
    c.restore();
  }, { subs: [[4.3, 5.9, 'TAKUTO', '...Okay. No.']], sfx: [[1.0, (g, w) => S.clicks(g, w, 2.2, 40, { vol: 0.12, f0: 900, f1: 2600, q: 3, len: 0.02, seed: 41 })], [3.5, (g, w) => { S.boom(g, w, 0.6); S.clang(g, w + 0.05, 0.12); }]] });
  shot(5, (lt, d, t) => { // trapped on the tracks; a train is coming
    const cam = focusCam(650, 440, 640, 400, lerp(1.6, 1.75, lt / d)), raise = ease.io(inv(0.5, 3.0, lt));
    earthPOV(t, cam, { lamps: true, gate: 0, cat: null, brokenGate: true, rift: { open: 1, cx: 640, cy: 150 },
      world: () => {
        silGirl(600, 506, 1.1, lerp(-1.5, -0.4, inv(0, 2, lt)), 1);
        shieldAt(t, 720, 528 - raise * 30, 0.43, { mul: '#45333a', mulA: 0.85, sil: '#0b0608', silA: 0.35, glow: { c: '#ff2a35', a: 0.6, r: 10 } });
        const hl = inv(1.8, 5, lt); G.radial(1400, 430, 200 + hl * 700, 'rgba(255,245,215,' + (hl * 0.9).toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter');
      } });
  }, { subs: [[0.3, 2.6, '???', 'Don\'t come near it!'], [2.8, 4.8, 'TAKUTO', 'Hey!']], sfx: [[2.0, (g, w) => S.horn(g, w, 2.6, 0.12)], [1.8, (g, w, off) => S.train(g, w, off, 9, 0.5), 9, true]] });
  shot(4.5, (lt, d, t) => { // Takuto runs in
    const c = G.ctx, z = lerp(1.4, 2.8, ease.in(clamp(lt / 3.7)));
    c.save(); shake(t, 3 + lt * 2);
    earthPOV(t, focusCam(630, 470, 640, 420, z), { lamps: true, gate: 0, cat: null, brokenGate: true, rift: { open: 1, cx: 640, cy: 150 },
      world: () => { silGirl(600, 506, 1.1, -0.4, 1); const hl = 0.6 + inv(0, 3.7, lt) * 0.4; G.radial(1300, 430, 900, 'rgba(255,245,215,' + hl.toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter'); } });
    c.restore();
    shieldAt(t, 760, lerp(-200, 520, ease.in(inv(2.0, 3.7, lt))), 1.6, { sil: '#000', silA: 0.9, glow: { c: '#ff2030', a: 0.5, r: 20 } }, 0.8);
    G.dashLines(t, { n: 60, a: 0.35 * inv(0.3, 1, lt), dir: -1 });
    G.fill('#fff', inv(3.55, 3.8, lt));
  }, { subs: [[0.3, 2.2, 'TAKUTO', 'Get down!']], sfx: [[0.2, (g, w) => S.splash(g, w)], [0.48, (g, w) => S.splash(g, w)], [0.76, (g, w) => S.splash(g, w)], [1.02, (g, w) => S.splash(g, w)], [1.28, (g, w) => S.splash(g, w)], [1.52, (g, w) => S.splash(g, w)],
    [2.9, (g, w) => S.whoosh(g, w, 0.8, 0.3, 300, 3000)], [3.72, (g, w) => { S.boom(g, w, 0.7); S.riftRoar(g, w, 2.4, 0.2); }]] });
  shot(7.5, (lt, d, t) => { // aftermath: nobody there
    const close = inv(1.2, 5.0, lt);
    earthPOV(t, { x: 0, y: 0, z: lerp(1.0, 1.03, lt / d) }, { lamps: lt < 3.5, gate: 0, brokenGate: true, cat: 'alert', bag: true,
      train: lt < 2.6 ? { x: 2600 + lt * 1150, v: 1150 } : null, rift: { open: 1, close, cx: 640, cy: 150 } });
    G.fill('#fff', 1 - inv(0, 0.9, lt));
    G.fill('#000', inv(6.3, 7.5, lt));
  }, {});
  // night piano: from CUE_NIGHT to just before the cat looks up
  cueNight(CUE_NIGHT, SKY - CUE_NIGHT - 4);

  /* ====================================================================
     OPENING TITLES — 38 bars at 150 BPM
     ==================================================================== */
  chapter('Opening');
  const OP = T, BAR = 1.6;
  const opDur = 38 * BAR;
  const CAST = {
    nemu: { name: 'NEMU', jp: 'ネム', brand: 'NINE LIVES', bg: '#26324d', ac: '#a9c7ff', nm: 'nemu', ax: NM.hx, ay: 260, sc: 1.05, x: 860, y: 470 },
    sieg: { name: 'SIEG VALEN', jp: 'ジーク', brand: 'AFTERIMAGE', bg: '#141f38', ac: '#8fb4ff', nm: 'sieg', ax: 360, ay: 330, sc: 1.0, x: 820, y: 420 },
    rin: { name: 'RIN ASHVEIL', jp: 'リン', brand: 'RED THREAD', bg: '#4a0c16', ac: '#ff6a78', nm: 'rin', ax: 170, ay: 380, sc: 1.05, x: 840, y: 400 },
    wick: { name: 'WICK', jp: 'ウィック', brand: 'WILL-O\'-WISP', bg: '#0a2433', ac: '#5fd8ff', nm: 'wick', ax: 470, ay: 760, sc: 0.72, x: 840, y: 450 },
    haruki: { name: 'HARUKI SHINJO', jp: 'ハルキ', brand: 'FROZEN HOUR', bg: '#0e1626', ac: '#a8d6ff', nm: 'haruki', ax: 420, ay: 360, sc: 1.0, x: 830, y: 400 },
  };
  function opChar(lt, d, c, t, py = 0) {
    const k = ease.out5(inv(0, 0.45, lt)), drift = lt * 10;
    G.fill(c.bg);
    const g = G.ctx; g.save(); g.globalAlpha = 0.1; g.fillStyle = '#fff';
    for (let i = -10; i < 30; i++) g.fillRect(i * 60 + (lt * 40) % 60, -50, 18, H + 100);
    g.restore();
    G.txt(c.jp, 330 - drift * 2, 520, { font: '400 300px ' + G.FONT.jp, fill: c.ac, a: 0.16, align: 'center' });
    g.save(); g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.moveTo(560 + (1 - k) * 600, -20); g.lineTo(820 + (1 - k) * 600, -20); g.lineTo(560 + (1 - k) * 600, H + 20); g.lineTo(300 + (1 - k) * 600, H + 20); g.fill(); g.restore();
    G.fig(c.nm, c.x + (1 - k) * 260 - drift, c.y, c.ax, c.ay, c.sc * (1 + lt * 0.015), { glow: { c: c.ac, a: 0.45, r: 18 } });
    const pk = ease.out5(inv(0.15, 0.7, lt));
    g.save(); g.fillStyle = '#0a0a0c'; g.fillRect(0, 560 + py, 520 * pk, 108); g.fillStyle = c.ac; g.fillRect(0, 560 + py, 520 * pk, 4); g.restore();
    G.txt(c.name, 48, 630 + py, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: pk });
    G.txt('BRAND · ' + c.brand, 50, 655 + py, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: c.ac, ls: 4, a: inv(0.4, 0.9, lt) });
  }
  function opPanel(lt, d, nm, name, sub, bg, ac, fxp, fyp, py = 0) {
    const k = ease.out5(inv(0, 0.4, lt)); G.fill(bg);
    const g = G.ctx; g.save(); g.beginPath(); g.moveTo(200 + (1 - k) * 900, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(60 + (1 - k) * 900, H); g.closePath(); g.clip();
    G.cover(nm, 60, 0, W - 60, H, fxp, fyp, 1.05 + lt * 0.03); g.restore();
    g.save(); g.strokeStyle = ac; g.lineWidth = 6; g.beginPath(); g.moveTo(200 + (1 - k) * 900, 0); g.lineTo(60 + (1 - k) * 900, H); g.stroke(); g.restore();
    G.txt(name, 48, 640 + py, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, stroke: 'rgba(0,0,0,0.6)', lw: 8, a: inv(0.15, 0.5, lt) });
    G.txt(sub, 50, 666 + py, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: ac, ls: 4, a: inv(0.3, 0.7, lt), stroke: 'rgba(0,0,0,0.6)', lw: 4 });
  }
  const FIENDS = [
    ['m_shield', 'SKELETAL SHIELDBEARER', 'LESSER FIEND', '#d8cbb8'], ['m_redgiant', 'RED GIANT', 'GREATER FIEND', '#ff5a4a'], ['m_hydra', 'HYDRA OF MARROWMERE', 'GREATER FIEND', '#7fd0e0'],
    ['m_golem', 'STONEHIDE BEHEMOTH', 'GREATER FIEND', '#d9c690'], ['m_plume', 'PLUME OGRE CHIEFTAIN', 'GREATER FIEND', '#8fe0ff'], ['m_wolf', 'KUROZANE, THE FANG RONIN', 'GREATER FIEND', '#ffb0a0'],
    ['m_morvudd', 'MORVUDD', 'CALAMITY', '#b9c4ff'], ['m_tyr', 'TYR, THE FROST TITAN', 'CALAMITY', '#a9ecff']];
  function opFiend(lt, d, i, t) {
    const [nm0, name, cls, ac] = FIENDS[i], nm = nm0 === 'm_shield' ? 'shield' : nm0;
    G.fill('#0b0b0e');
    const src = G.duo(nm, '#0b0b0e', ac), punch = 1.12 - 0.1 * ease.out5(inv(0, 0.35, lt));
    if (nm === 'shield') G.fig(nm, 760, 380, SB.sx, 600, 0.62 * punch, { src });
    else G.cover(nm, 300, 0, 980, H, 0.5, 0.42, punch, { src });
    const g = G.ctx; g.save(); g.fillStyle = 'rgba(11,11,14,0.85)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(420, 0); g.lineTo(300, H); g.lineTo(0, H); g.fill(); g.restore();
    G.txt(cls, 50, 560, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: ac, ls: 5 });
    const words = name.split(', ');
    words.forEach((w, k) => G.txt(w, 48, 610 + k * 46, { font: '900 46px ' + G.FONT.disp, align: 'left', ls: 1 }));
    G.txt(String(i + 1).padStart(2, '0') + ' / 08', 50, 80, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: 'rgba(255,255,255,0.5)', ls: 4 });
    G.fill('#fff', 0.5 * (1 - inv(0, 0.12, lt)));
  }
  shot(opDur, (lt, d, t) => {
    const b = lt / BAR, bi = Math.floor(b), bl = lt - bi * BAR;
    if (bi < 2) { // intro: slash + flicker
      G.fill('#060507'); const k = ease.out5(inv(0, 0.5, lt));
      const g = G.ctx; g.save(); g.fillStyle = '#e8343c'; g.beginPath(); g.moveTo(-50, 380); g.lineTo(-50 + 1400 * k, 330); g.lineTo(-50 + 1400 * k, 342); g.lineTo(-50, 394); g.fill(); g.restore();
      if (G.twos(lt, 8) % 3 === 0) G.txt('RUINBREAKER', 640, 400, { font: '900 140px ' + G.FONT.disp, fill: 'rgba(244,239,233,0.08)', ls: 20 });
    } else if (bi < 4) { // quick cuts
      const q = Math.floor((lt - 2 * BAR) / (BAR / 2));
      if (q === 0) { G.fill('#120204'); G.fig('takuto', 640, 360, 600, 140, 2.6, { mul: '#ff6a6a', mulA: 0.5 }); }
      else if (q === 1) { G.fill('#0a0003'); G.fig('takuto', 640, 360, 405, 222, 6.5, { mul: '#ff5050', mulA: 0.6 }); }
      else if (q === 2) { G.earth(t, focusCam(380, 246, 640, 360, 3.2), { lamps: true, gate: 0, cat: null }); }
      else { G.fill('#05070e'); G.drawCrack(t, 1, 1.4); }
      G.fill('#fff', 0.6 * (1 - inv(0, 0.1, bl)));
    } else if (bi < 12) { const k2 = Math.floor((bi - 4) / 2), keys = ['nemu', 'sieg', 'rin', 'wick']; opChar(lt - (4 + k2 * 2) * BAR, 2 * BAR, CAST[keys[k2]], t); }
    else if (bi === 12) opPanel(lt - 12 * BAR, BAR, 'gideon', 'GIDEON HALLOWAY', 'BRAND · COGWHEEL CORE', '#2a1e10', '#d9a650', 0.5, 0.3);
    else if (bi === 13) opPanel(lt - 13 * BAR, BAR, 'valentine', 'VALENTINE & TOFU', 'BRAND · ENCORE', '#2a0a1c', '#ff7ab6', 0.5, 0.5);
    else if (bi < 16) opChar(lt - 14 * BAR, 2 * BAR, CAST.haruki, t);
    else if (bi < 24) opFiend(lt - bi * BAR, BAR, bi - 16, t);
    else if (bi < 26) opPanel(lt - 24 * BAR, 2 * BAR, 'lucien', 'LUCIEN AUREL', 'S-RANK · BRAND · SANCTUM', '#2a2008', '#ffd36a', 0.5, 0.3);
    else if (bi === 26) opPanel(lt - 26 * BAR, BAR, 'vesper', 'VESPER', 'GUILD EXECUTIONER · WHITE GALE', '#151a26', '#e6f0ff', 0.5, 0.3);
    else if (bi === 27) { const l2 = lt - 27 * BAR; G.fill('#050507'); G.fig('sable', 820, 760, 380, 1011, 0.78 + l2 * 0.03, { glow: { c: '#9fb0ff', a: 0.35, r: 14 } }); G.radial(820 + (270 - 380) * 0.8, 760 + (185 - 1011) * 0.8, 70, 'rgba(220,230,255,0.9)', 'rgba(120,140,255,0)', 0.6 + 0.4 * Math.sin(t * 20), 'lighter'); G.txt('MR. SABLE', 48, 640, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: inv(0.1, 0.4, l2) }); G.txt('CALAMITY · THE GENTLEMAN OF THE RIFT', 50, 666, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#c8d2ff', ls: 4, a: inv(0.2, 0.6, l2) }); }
    else if (bi < 30) { const l2 = lt - 28 * BAR; G.fill('#100002'); G.cover('akuro', 0, 0, W, H, 0.5, 0.38, 1.0 + l2 * 0.05, { a: inv(0, 0.4, l2) }); G.fill('#ff0000', 0.12, 'multiply'); G.txt('AKURO', 48, 640, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, stroke: 'rgba(0,0,0,0.7)', lw: 8 }); G.txt('THE CRIMSON CALAMITY', 50, 666, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#ff6a6a', ls: 4, stroke: 'rgba(0,0,0,0.7)', lw: 4 }); }
    else if (bi < 34) { // hero shot
      const l2 = lt - 30 * BAR, z = lerp(0.8, 0.9, l2 / (4 * BAR));
      G.vgrad([[0, '#0a0103'], [1, '#3a0508']]);
      G.focusLines(640, 330, t, { a: 0.12 + (bl < 0.15 ? 0.25 : 0), color: '#ff5050', inner: 260 });
      G.fig('akuro', 640, 380, 380, 450, 0.9, { a: 0.18, comp: 'screen' });
      takutoFull(t, 640, 800, z, { glow: { c: '#ff2a1a', a: 0.6 + 0.25 * Math.sin(t * 8), r: 24 } });
      G.motes(t, { n: 80, vy: -110, vx: 20, color: '#ff7a3a', size: 2.4, seed: 7 });
      const pk = ease.out5(inv(0.3, 1.0, l2)), g = G.ctx; g.save(); g.fillStyle = '#0a0a0c'; g.fillRect(0, 560, 560 * pk, 108); g.fillStyle = '#ff3a3a'; g.fillRect(0, 560, 560 * pk, 4); g.restore();
      G.txt('TAKUTO KIRISHIMA', 48, 630, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: pk }); G.txt('BRAND · RUINBREAKER', 50, 655, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#ff6a6a', ls: 4, a: inv(0.6, 1.2, l2) });
    } else { // logo
      const l2 = lt - 34 * BAR; G.fill('#060507'); G.motes(t, { n: 60, vy: -40, color: '#ff4a2a', size: 2, seed: 8, a: 0.6 });
      G.logo(640, 380, 1, inv(0, 2.2, l2)); if (bi >= 36) G.fill('#fff', 0.7 * (1 - inv(36 * BAR, 36 * BAR + 0.3, lt))); G.fill('#000', inv(opDur - 0.8, opDur, lt));
    }
  }, { vig: true });
  cueOP(OP);

  /* ====================================================================
     TITLE CARD
     ==================================================================== */
  shot(6.2, (lt, d) => {
    G.fill('#050406'); const a = inv(0.3, 1.2, lt) * (1 - inv(d - 1, d, lt));
    G.txt('第一話', 640, 250, { font: '400 30px ' + G.FONT.jp, fill: '#e8343c', a, ls: 8 });
    G.txt('踏切', 640, 400, { font: '400 150px ' + G.FONT.jp, fill: '#f4efe9', a, ls: 20 });
    G.ctx.save(); G.ctx.globalAlpha = a; G.ctx.fillStyle = '#e8343c'; G.ctx.fillRect(560, 446, 160 * ease.out(inv(0.6, 1.6, lt)), 2); G.ctx.restore();
    G.txt('EPISODE 1', 640, 492, { font: '700 15px ' + G.FONT.sub, fill: '#bdb6b0', a, ls: 8 });
    G.txt('THE CROSSING', 640, 540, { font: '800 40px ' + G.FONT.disp, fill: '#f4efe9', a, ls: 12 });
  }, { sfx: [[0.6, (g, w) => S.kan(g, w, 0.09)], [1.1, (g, w) => S.kan(g, w, 0.07)]] });

  /* ====================================================================
     PART A — The Barrow Fields
     ==================================================================== */
  chapter('Part A');
  const PA = T;
  at(PA, (g, w, off) => S.noiseBed(g, w, off, 175, { vol: 0.08, bp: 420, q: 0.6, lfo: 0.07, lfoDepth: 160, fin: 3, fout: 3 }), 175, true); // wind
  shot(8, (lt, d, t) => {
    const k = ease.io(clamp(lt / d)); G.barrow(t, { x: 0, y: lerp(-240, -40, k), z: 1.1 }, { fogA: 0.4 });
    G.fill('#000', 1 - inv(0.2, 2.5, lt));
  }, { subs: [[3.0, 6.5, 'TAKUTO', '...Two moons.', true]], sfx: [[0.2, (g, w) => S.piano(g, w, n('A5'), 0.5, 0.2)]] });
  shot(4, (lt, d, t) => { eyes(t, lt, d, { mode: 'dusk', z0: 6.0, z1: 6.3 }); G.fill('#000', 0.6 * (1 - inv(0, 1.2, lt))); }, { subs: [[0.4, 3.6, 'TAKUTO', 'Okay. That\'s new.', true]] });
  shot(6, (lt, d, t) => {
    G.barrow(t, { x: -300, y: 60, z: 1.6 }, { fogA: 0.5 }); G.fill('#2a1020', 0.35);
    const sc = lerp(3.0, 3.25, lt / d); G.fig('takuto', 600, 400, TK.hx, TK.hy, sc, DUSK);
  }, { subs: [[0.8, 5.6, 'TAKUTO', 'And I\'m holding... an axe?', true]] });
  shot(8, (lt, d, t) => {
    const z = lerp(1.0, 1.07, ease.io(lt / d)); G.barrow(t, { x: 0, y: 0, z }, { fogA: 0.45 });
    const c = G.ctx; c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    takutoFull(t, 470, 820, 0.84, DUSK); c.restore();
    G.frontFog(t, 0.45);
    G.locationCard(lt - 0.6, 5.8, 'THE BARROW FIELDS', 'Ashen March frontier  ·  dusk');
  }, { subs: [[4.2, 7.6, 'TAKUTO', 'Where the hell am I?', true]] });
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 160, y: 0, z: 1.12 }, { fogA: 0.45 });
    const rise = ease.out(inv(0, 1.4, lt)); nemuFull(t, 760, lerp(1100, 980, rise), 0.82, DUSK);
    G.frontFog(t, 0.4);
  }, { subs: [[0.6, 4.2, 'NEMU', 'Hnnnaaah... Oh. You\'re alive. Neat.'], [4.5, 7.8, 'TAKUTO', 'You were lying on train tracks a minute ago.']], sfx: [[0.4, (g, w) => { S.pluck(g, w, n('F5'), 0.08); S.pluck(g, w + 0.18, n('A5'), 0.07); S.pluck(g, w + 0.36, n('C6'), 0.06); }]] });
  shot(5, (lt, d, t) => nemuClose(t, lt, d), { subs: [[0.3, 2.5, 'NEMU', 'Mm. I\'m very good at that.'], [2.7, 4.8, 'NEMU', 'Lying places. Getting squished.']] });
  shot(9, (lt, d, t) => twoShot(t, lt, d), { subs: [[0.5, 3.3, 'TAKUTO', 'Where is this?'], [3.5, 6.6, 'NEMU', 'The Barrow Fields. Edge of the Ashen March.'], [6.8, 8.8, 'NEMU', 'You fell out of the sky.']] });
  shot(7, (lt, d, t) => twoShot(t, lt, d, { push: 0.06, camx: 40 }), { subs: [[0.2, 3.4, 'NEMU', 'People like you have a name here. Skyfallen.'], [3.6, 6.8, 'TAKUTO', 'There are others?']] });
  shot(6, (lt, d, t) => nemuClose(t, lt, d, { sc0: 1.5, sc1: 1.58 }), { subs: [[0.2, 3.0, 'NEMU', 'A few. Most of them land worse.'], [3.2, 5.8, 'TAKUTO', '...I\'ll take that as a compliment.']] });
  shot(6.5, (lt, d, t) => {
    if (lt < 1.4) { G.fill('#f4efe9'); G.focusLines(640, 360, t, { color: '#1a1a1a', a: 0.25, inner: 200 }); G.fig('nemu_gg', 640, 380, 325, 378, 5.2 + lt * 0.4, {}); }
    else nemuClose(t, lt, d, { sc0: 1.6, sc1: 1.66 });
  }, { subs: [[1.5, 3.4, 'NEMU', '...Hey.'], [3.6, 6.3, 'NEMU', 'Where did you get that axe?']], sfx: [[0.05, (g, w) => S.ui(g, w, 0.06)]] });
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: -100, y: 20, z: 1.2 }, { fogA: 0.45 });
    takutoFull(t, 560, 860, lerp(1.05, 1.1, lt / d), DUSK); G.frontFog(t, 0.35);
  }, { subs: [[0.3, 4.3, 'TAKUTO', 'It was sticking out of a grave. I grabbed it on the way down.'], [4.6, 7.8, 'NEMU', 'That\'s the Headsman\'s Axe.']] });
  shot(8, (lt, d, t) => {
    const k = ease.io(clamp(lt / d)); G.barrow(t, { x: lerp(300, 380, k), y: lerp(160, 190, k), z: 1.5 }, { fogA: 0.5 });
    G.radial(1010 - 300 * 0.8, 520, 200, 'rgba(255,180,120,0.12)', 'rgba(0,0,0,0)', 1, 'lighter');
  }, { subs: [[0.3, 4.3, 'NEMU', 'It\'s been stuck in that grave for three hundred years.'], [4.5, 7.8, 'NEMU', 'People tried pulling it out with horses.']] });
  shot(4, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.3, z1: 6.4 }), { subs: [[0.8, 3.6, 'TAKUTO', '...It was loose.']] });
  shot(4, (lt, d, t) => {
    G.fill('#cfe0ff'); G.focusLines(640, 360, t, { color: '#ffffff', a: 0.8, inner: 180 });
    const c = G.ctx; c.save(); shake(t, 4, 20); G.fig('nemu_chibi', 640, 370, 135, 225, 2.7, {}); c.restore();
  }, { subs: [[0.3, 3.6, 'NEMU', 'WHY WAS IT LOOSE?!']], sfx: [[0.2, (g, w) => { S.whoosh(g, w, 0.25, 0.15, 800, 3000); S.pluck(g, w + 0.05, n('D6'), 0.06); S.pluck(g, w + 0.12, n('A5'), 0.06); }]] });
  // the world, in ink
  shot(8, (lt, d, t) => inkPanel(t, lt, d, 'm_morvudd', { x: 230, y: 30, w: 820, h: 660, fy: 0.4, red: [[120, 120], [400, 90], [700, 130], [1160, 100]], label: '亀裂' }),
    { subs: [[0.5, 3.8, 'NEMU', 'Rifts open in the sky. Things crawl out.'], [4.0, 7.8, 'NEMU', 'We call them Fiends.']], sfx: [[0.3, (g, w) => S.whoosh(g, w, 0.9, 0.08, 200, 700)]] });
  shot(8, (lt, d, t) => inkPanel(t, lt, d, 'm_redgiant', { x: 200, y: 20, w: 880, h: 680, fy: 0.35, label: '魔物' }),
    { subs: [[0.3, 3.8, 'NEMU', 'Swords don\'t bite them. Arrows bounce off.'], [4.0, 7.8, 'NEMU', 'Normal people can\'t do anything but run.']] });
  shot(10, (lt, d, t) => {
    G.paper(); G.sigilAxe(640, 340, 190, inv(0.4, 5, lt), t, '#a3121b', 0.9);
    G.txt('烙印', 1180, 90, { font: '400 26px ' + G.FONT.jp, fill: 'rgba(150,20,28,0.75)', align: 'right', a: inv(1, 2, lt) }); G.vignette(0.5);
  }, { subs: [[0.5, 4.0, 'NEMU', 'Unless you have a Brand.'], [4.2, 9.6, 'NEMU', 'A mark on your soul. It wakes up when you\'re about to die... if you have one.']], sfx: [[0.5, (g, w) => S.riser(g, w, 4.4, 0.05)]] });
  shot(6, (lt, d, t) => inkPanel(t, lt, d, 'sieg', { cut: true, cx: 640, cy: 760, ax: 370, ay: 899, sc: 0.78, label: '狩人' }),
    { subs: [[0.3, 5.6, 'NEMU', 'Branded people become Hunters. They hunt Fiends for the Guild.']] });
  shot(6, (lt, d, t) => twoShot(t, lt, d, { push: 0.02 }), { subs: [[0.3, 3.0, 'TAKUTO', 'And people without one?'], [3.2, 5.8, 'NEMU', 'Get very good at running.']] });
  shot(8, (lt, d, t) => {
    nemuClose(t, lt, d, { sc0: 1.35, sc1: 1.42, ay: 330 });
    G.sigilPaw(380, 330, 110, 3, 9, ease.out(inv(0.6, 2, lt)), 0.95);
    G.radial(380, 330, 220, 'rgba(140,200,255,0.25)', 'rgba(0,0,0,0)', inv(0.6, 2, lt), 'lighter');
  }, { subs: [[0.3, 4.0, 'NEMU', 'Mine\'s called Nine Lives.'], [4.2, 7.8, 'NEMU', 'I can die nine times. I\'ve used six.']], sfx: [[0.6, (g, w) => { S.bell(g, w, n('A5'), 0.05); S.bell(g, w + 0.2, n('E6'), 0.04); }]] });
  shot(5, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.5, z1: 6.9 }), { subs: [[0.3, 2.2, 'TAKUTO', 'Six.'], [2.4, 4.8, 'NEMU', 'Don\'t make the face.']] });
  shot(6, (lt, d, t) => nemuClose(t, lt, d, { sc0: 1.55, sc1: 1.6 }), { subs: [[0.3, 2.6, 'TAKUTO', 'I\'m not making a face.'], [2.8, 5.8, 'NEMU', 'You\'re making it with your eyes.']] });
  shot(10, (lt, d, t) => twoShot(t, lt, d, { push: 0.05, camx: -30 }), { subs: [[0.3, 4.5, 'TAKUTO', 'That thing at the crossing. Was it chasing you?'], [4.7, 9.7, 'NEMU', 'I was digging for grave silver. It woke up. Shieldbearers don\'t wake up.']] });
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 0, y: -200, z: 1.15 }, { fogA: 0.3, rift: { open: 0.04, cx: 640, cy: 200, w: 300, h: 60 } });
    G.fill('#200810', 0.15);
  }, { subs: [[0.3, 4.5, 'NEMU', 'Then the ground opened. Rifts open in the sky... not into other worlds.'], [4.7, 7.8, 'NEMU', 'Somebody opened that one.']] });
  const BELLS = T;
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 0, y: 0, z: lerp(1.0, 1.05, lt / d) }, { fogA: lerp(0.45, 0.8, lt / d) });
    const c = G.ctx; c.save(); c.translate(W / 2, H / 2); c.scale(1.02, 1.02); c.translate(-W / 2, -H / 2);
    takutoFull(t, 330, 800, 0.86, DUSK); nemuFull(t, 960, 960, 0.8, DUSK); c.restore();
    G.frontFog(t, lerp(0.4, 0.75, lt / d));
  }, { subs: [[2.0, 5.0, 'TAKUTO', '...You hear that?'], [5.2, 7.8, 'NEMU', 'A bell. There are no bells out here.']] });
  [0.8, 1.3, 3.0, 3.5, 5.6, 6.1].forEach(o => at(BELLS + o, (g, w) => S.kan(g, w, 0.04)));
  shot(7, (lt, d, t) => { // it rises
    const c = G.ctx, rise = ease.out(inv(0.6, 6.5, lt));
    c.save(); shake(t, 2 + lt * 0.6);
    G.barrow(t, { x: 120, y: 60, z: 1.3 }, { fogA: 0.7, mid: () => {} });
    G.fill('#140812', 0.25);
    shieldAt(t, 720, lerp(1300, 900, rise), 0.95, { mul: '#9a7f86', mulA: 0.8, sil: '#120a10', silA: 0.25, glow: { c: '#ff6a5a', a: 0.25, r: 14 } }, inv(5.6, 6.2, lt));
    G.frontFog(t, 0.85, '#d9a8b0', 470, 50);
    c.restore();
    G.fill('#fff', 0.5 * inv(6.0, 6.1, lt) * (1 - inv(6.1, 6.6, lt)));
  }, { sfx: [[0.5, (g, w) => S.noiseBed(g, w, 0, 6.5, { vol: 0.2, brown: true, lp: 140, fin: 1, fout: 0.3, b: 'sfx' })], [1.5, (g, w) => S.clicks(g, w, 4, 70, { vol: 0.16, f0: 900, f1: 2800, q: 4, len: 0.02, seed: 51 })], [6.0, (g, w) => { S.boom(g, w, 0.45); S.brass(g, w, n('D2'), 1.4, 0.09); S.brass(g, w, n('Eb2'), 1.4, 0.07); }]] });
  cueOther(PA + 1, BELLS - PA - 2);
  cueTension(BELLS + 2, 11);

  /* ====================================================================
     EYECATCH
     ==================================================================== */
  shot(4, (lt, d, t) => {
    G.fill('#efe8df'); const g = G.ctx; g.save(); g.fillStyle = 'rgba(232,52,60,0.10)';
    for (let y = 0; y < H; y += 22) for (let x = (y / 22 % 2) * 11; x < W; x += 22) { g.beginPath(); g.arc(x, y, 4 + 3 * Math.sin(x * 0.01 + lt), 0, 7); g.fill(); } g.restore();
    G.fig('nemu', 900, 1000, NM.bx, NM.by, 0.82, {});
    G.logo(470, 380, 0.62, 1, { fill: '#1a1416', sub: '#6a6064' });
  }, { vig: false, sfx: [[0.1, (g, w) => [n('D5'), n('A5'), n('F5'), n('D6')].forEach((f, i) => S.bell(g, w + i * 0.13, f, 0.07, 1.6))]] });
  shot(4, (lt, d, t) => {
    G.fill('#0b0607'); G.motes(t, { n: 40, vy: -30, color: '#ff4a2a', size: 2, seed: 12 });
    takutoFull(t, 870, 800, 0.84, { sil: '#000', silA: 0.85, glow: { c: '#ff2a1a', a: 0.6, r: 20 } });
    G.logo(430, 380, 0.62, 1);
  }, { vig: false, sfx: [[0.1, (g, w) => [n('D6'), n('F5'), n('A5'), n('D5')].forEach((f, i) => S.bell(g, w + i * 0.13, f, 0.07, 1.6))]] });

  /* ====================================================================
     PART B — The Shieldbearer
     ==================================================================== */
  chapter('Part B');
  const PB = T;
  shot(8, (lt, d, t) => {
    const c = G.ctx, k = ease.io(clamp(lt / d));
    c.save(); shake(t, (lt > 4.5 && lt < 5.1) ? 8 : 0.8);
    G.barrow(t, { x: 100, y: lerp(120, 0, k), z: 1.2 }, { fogA: 0.6 });
    G.fill('#1a0a12', 0.25);
    shieldAt(t, 680, 990, lerp(0.95, 0.98, k), { mul: '#a58c92', mulA: 0.75, glow: { c: '#ff6a5a', a: 0.3, r: 14 } });
    G.frontFog(t, 0.7, '#d9a8b0', 520, 50); c.restore();
    G.infoCard(lt - 1.2, 5.6, { cls: 'LESSER FIEND', name: 'SKELETAL SHIELDBEARER', sub: ['Armored undead. Its shield', 'has never been broken.'], threat: 2, color: '#e8343c' });
  }, { sfx: [[1.0, (g, w) => S.ui(g, w, 0.05)], [4.6, (g, w) => S.step(g, w, 0.55)], [0.3, (g, w) => S.clicks(g, w, 1.5, 20, { vol: 0.12, f0: 900, f1: 2600, q: 4, len: 0.02, seed: 61 })]] });
  shot(8, (lt, d, t) => twoShot(t, lt, d, { push: 0.04 }), { subs: [[0.3, 2.6, 'NEMU', 'Run. I mean it this time.'], [2.8, 5.0, 'TAKUTO', 'You said that at the crossing.'], [5.2, 7.8, 'NEMU', 'And you didn\'t listen! I only have three left!']] });
  shot(5, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.4, z1: 7.2 }), { subs: [[0.5, 4.5, 'TAKUTO', 'Then stay behind me.']] });
  const FIGHT = T;
  shot(5, (lt, d, t) => { // charge, CLANG
    const c = G.ctx, hit = 3.0, k = ease.in(inv(0.4, hit, lt));
    c.save(); shake(t, lt > hit && lt < hit + 0.5 ? 16 : 2);
    G.barrow(t, { x: lerp(-100, 120, k), y: 30, z: 1.25 }, { fogA: 0.5 });
    shieldAt(t, 900, 1010, 0.9, { mul: '#a58c92', mulA: 0.75 });
    takutoFull(t, lerp(100, 640, k), 840, 0.9, { ...DUSK, rot: lt < hit ? -0.08 : 0.05 });
    if (lt < hit) G.dashLines(t, { a: 0.35, dir: 1 });
    c.restore();
    if (lt > hit && lt < hit + 0.12) G.impact('inv');
    if (lt > hit) G.motes(lt - hit, { n: 40, vy: 160, vx: -60, wob: 120, size: 2.5, color: '#ffd08a', a: 1 - inv(hit, hit + 1.2, lt), seed: 71, x0: 640, x1: 900, y0: 200, y1: 520 });
  }, { sfx: [[0.4, (g, w) => S.whoosh(g, w, 2.4, 0.2, 200, 1400)], [3.0, (g, w) => S.clang(g, w, 0.4)]] });
  shot(5, (lt, d, t) => {
    const c = G.ctx; c.save(); shake(t, 3 * (1 - inv(0, 1, lt)));
    G.barrow(t, { x: 200, y: 60, z: 1.6 }, { fogA: 0.4 }); G.fill('#1a0a12', 0.3);
    G.fig('shield', 640, 360, SB.shx, 640, 1.3, { mul: '#a58c92', mulA: 0.75 });
    takutoFull(t, lerp(380, 140, ease.out(inv(0.2, 1.4, lt))), 900, 0.8, { ...DUSK, rot: -0.25 * ease.out(inv(0.2, 1.4, lt)) });
    c.restore();
  }, { subs: [[0.8, 4.6, 'NEMU', 'Don\'t hit the shield! Nothing breaks the shield!']], sfx: [[0.4, (g, w) => S.thud(g, w, 0.35)]] });
  shot(6, (lt, d, t) => twoShot(t, lt, d, { push: 0.06, camx: -60 }), { subs: [[0.3, 2.6, 'TAKUTO', 'Then what do I hit?!'], [2.8, 5.6, 'NEMU', 'Nothing! We run!']] });
  shot(6, (lt, d, t) => {
    const c = G.ctx, steps = [0.8, 2.6, 4.4], hitAmt = steps.reduce((m, s) => Math.max(m, lt > s && lt < s + 0.4 ? 10 * (1 - (lt - s) / 0.4) : 0), 0), adv = ease.io(clamp(lt / d));
    c.save(); shake(t, hitAmt);
    G.barrow(t, { x: 60, y: 120, z: 1.25 }, { fogA: 0.65 }); G.fill('#1a0a12', 0.3);
    shieldAt(t, 660, lerp(1020, 1120, adv), lerp(0.95, 1.2, adv), { mul: '#a58c92', mulA: 0.75, glow: { c: '#ff6a5a', a: 0.3, r: 14 } });
    G.frontFog(t, 0.7, '#d9a8b0', 520, 60); c.restore();
  }, { sfx: [[0.8, (g, w) => S.step(g, w, 0.6)], [2.6, (g, w) => S.step(g, w, 0.65)], [4.4, (g, w) => S.step(g, w, 0.7)]] });
  shot(5, (lt, d, t) => { // shield bash
    const c = G.ctx, hit = 1.4, lunge = ease.in(inv(0.6, hit, lt)), fly = ease.out(inv(hit, 2.4, lt));
    c.save(); shake(t, lt > hit && lt < hit + 0.6 ? 18 : 2);
    G.barrow(t, { x: -60, y: 40, z: 1.3 }, { fogA: 0.5 });
    takutoFull(t, lerp(520, 1300, fly), lerp(860, 760, fly), 0.86, { ...DUSK, rot: fly * 0.6 });
    shieldAt(t, lerp(80, 360, lunge), 1040, lerp(1.0, 1.25, lunge), { mul: '#a58c92', mulA: 0.75 });
    c.restore();
    if (lt > hit && lt < hit + 0.1) G.impact('inv');
    if (lt > hit) G.focusLines(1000, 380, t, { a: 0.4 * (1 - inv(hit, hit + 1.2, lt)), inner: 160 });
  }, { sfx: [[0.6, (g, w) => S.whoosh(g, w, 0.8, 0.25, 150, 900)], [1.4, (g, w) => { S.boom(g, w, 0.6); S.clang(g, w, 0.2); }], [2.2, (g, w) => { S.thud(g, w, 0.5); S.clicks(g, w, 0.5, 25, { vol: 0.2, f0: 600, f1: 3000, q: 2, len: 0.03, seed: 81 }); }]] });
  shot(7, (lt, d, t) => { // dazed POV
    const c = G.ctx, wob = Math.sin(t * 1.3) * 0.02;
    c.save(); c.translate(W / 2, H / 2); c.rotate(-0.12 + wob); c.translate(-W / 2, -H / 2);
    G.barrow(t, { x: 0, y: 80, z: 1.2 }, { fogA: 0.6, mood: 'ash' });
    const adv = ease.io(clamp(lt / d)), sc = lerp(0.9, 1.15, adv);
    shieldAt(t, 680, 1040, sc, { mul: '#9a8a8e', mulA: 0.7, a: 0.55 });
    shieldAt(t, 680 + 30 + Math.sin(t * 2) * 18, 1040, sc, { mul: '#9a8a8e', mulA: 0.7, a: 0.45 });
    c.restore();
    G.fill('#000', 0.25 + 0.2 * Math.sin(t * 2.4)); G.vignette(1); G.vignette(0.7);
  }, { subs: [[1.0, 4.5, 'TAKUTO', 'Can\'t... get up...', true]], sfx: [[0, (g, w) => S.tone(g, w, 3950, 6.5, 0.012, 'sine', 'sfx', 0.3, 2)], [0.6, (g, w) => S.heartbeat(g, w, 0.5)], [2.0, (g, w) => S.heartbeat(g, w, 0.5)], [3.4, (g, w) => S.heartbeat(g, w, 0.55)], [4.8, (g, w) => S.heartbeat(g, w, 0.55)], [6.0, (g, w) => S.heartbeat(g, w, 0.6)]] });
  shot(5, (lt, d, t) => { // the guillotine
    const c = G.ctx, up = ease.io(inv(0.3, 4, lt));
    c.save(); shake(t, 1.5);
    G.barrow(t, { x: 0, y: -200, z: 1.4 }, { fogA: 0.3 }); G.fill('#2a0a12', 0.3);
    shieldAt(t, 640, lerp(1500, 1380, up), 1.55, { mul: '#a58c92', mulA: 0.75, glow: { c: '#ff4a3a', a: 0.4, r: 18 } });
    c.restore();
  }, { sfx: [[0.3, (g, w) => S.riser(g, w, 4.2, 0.08)]] });
  shot(5, (lt, d, t) => { // Nemu steps in
    G.barrow(t, { x: 100, y: 40, z: 1.25 }, { fogA: 0.45 });
    const k = ease.out5(inv(0, 0.6, lt));
    nemuFull(t, lerp(1500, 780, k), 980, 0.86, { ...DUSK, glow: { c: '#9fd0ff', a: 0.25, r: 14 } });
    if (lt > 2.4) { const f = inv(2.4, 3.2, lt); const g = G.ctx; g.save(); g.fillStyle = '#2a2026'; g.beginPath(); g.arc(lerp(700, 200, f), lerp(200, 260, f) - Math.sin(f * Math.PI) * 120, 10, 0, 7); g.fill(); g.restore(); }
    G.frontFog(t, 0.4);
  }, { subs: [[0.5, 2.4, 'NEMU', 'Hey! Ugly!'], [2.6, 4.8, 'NEMU', 'Over here!']], sfx: [[0.1, (g, w) => S.whoosh(g, w, 0.4, 0.15, 500, 2500)], [3.2, (g, w) => S.clang(g, w, 0.08)]] });
  shot(3, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.4, z1: 8.0 }), { subs: [[0.3, 2.6, 'TAKUTO', 'Wait—!']], sfx: [[0, (g, w) => S.whoosh(g, w, 0.5, 0.12, 300, 1600)]] });
  const BLOW = T + 1.0;
  shot(4, (lt, d, t) => {
    if (lt < 1.0) {
      const c = G.ctx, f = ease.in(inv(0, 1.0, lt)); c.save(); shake(t, 4);
      G.barrow(t, { x: 100, y: 40, z: 1.25 }, { fogA: 0.45 }); nemuFull(t, 780, 980, 0.86, { ...DUSK, sil: '#000', silA: 0.6 });
      G.fig('shield', 760, lerp(-700, 260, f), SB.shx, 360, 1.4, { sil: '#000', silA: 0.85 }); c.restore();
    } else { G.fill('#fff'); G.fill('#000', inv(1.4, 4, lt)); }
  }, { sfx: [[1.0, (g, w) => { S.boom(g, w, 0.75); S.tone(g, w + 0.3, 4100, 3.6, 0.02, 'sine', 'sfx', 0.2, 2.5); }]] });
  shot(7, (lt, d, t) => { // stillness
    G.barrow(t, { x: 140, y: 120, z: 1.35 }, { fogA: 0.6, mood: 'ash', wisps: false }); G.fill('#000', 0.35);
    G.fig('nemu', 640, 560, 460, 480, 0.6, { rot: -1.5, mul: '#8a8090', mulA: 0.8 });
    G.sigilPaw(640, 330, 70, 3, 9, inv(1.0, 2, lt), 0.9, 2, inv(4.0, 4.6, lt));
    G.fill('#000', 1 - inv(0, 1.2, lt));
  }, { sfx: [[4.0, (g, w) => S.piano(g, w, n('A4'), 2, 0.4, 'music', 0.6)]] });
  shot(10, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.2, z1: 7.6, glowEyes: 0.3 * inv(4, 10, lt) }) || G.fill('#ff0000', 0.25 * inv(3, 10, lt), 'multiply'),
    { subs: [[0.5, 3.5, 'TAKUTO', 'Born to carry things for other people.', true], [3.7, 6.5, 'TAKUTO', 'Groceries. Grudges. Blame.', true], [6.7, 9.8, 'TAKUTO', 'Not this. I\'m not carrying this one.', true]],
      sfx: [[1, (g, w) => S.heartbeat(g, w, 0.4)], [3.4, (g, w) => S.heartbeat(g, w, 0.45)], [5.6, (g, w) => S.heartbeat(g, w, 0.5)], [7.6, (g, w) => S.heartbeat(g, w, 0.55)], [9.2, (g, w) => S.heartbeat(g, w, 0.6)]] });
  shot(8, (lt, d, t) => { // the world stops
    G.barrow(t, { x: 40, y: 40, z: 1.2 }, { fogA: 0.5, mood: 'still', wisps: false });
    takutoFull(t, 330, 860, 0.84, { mul: '#b0a8b0', mulA: 0.6, glow: { c: '#ff2a1a', a: 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 5)) * inv(0, 4, lt), r: 22 } });
    shieldAt(t, 900, 1120, 1.0, { mul: '#9a9aa0', mulA: 0.7 }, 0.3);
    G.desat(0.7);
    const c = G.ctx; c.save(); c.translate(0, 220); G.drawCrack(t, inv(1, 7.5, lt), 1.3); c.restore();
  }, { subs: [[1.0, 3.6, 'AKURO', 'Finally.'], [3.8, 7.8, 'AKURO', 'Three hundred years in the dirt, and this is who pulls me out?']],
    sfx: [[0, (g, w) => S.whoosh(g, w, 1.2, 0.18, 2000, 150)], [1.2, (g, w) => S.heartbeat(g, w, 0.7)], [3.0, (g, w) => S.heartbeat(g, w, 0.7)], [5.0, (g, w) => S.heartbeat(g, w, 0.75)], [6.8, (g, w) => S.heartbeat(g, w, 0.8)]] });
  shot(10, (lt, d, t) => { // mindscape
    G.fill('#050000'); G.radial(640, 300, 800, 'rgba(120,0,10,0.9)', 'rgba(0,0,0,0)');
    G.cover('akuro', 0, 0, W, H, 0.52, 0.4, lerp(1.0, 1.2, ease.io(lt / d)), { a: ease.io(inv(0.5, 4, lt)) });
    G.fill('#ff1010', 0.18, 'multiply');
    const c = G.ctx; c.save(); c.translate(0, 300); G.drawCrack(t, 1, 1.2); c.restore();
    takutoFull(t, 250, 840, 0.62, { sil: '#000', silA: 1, glow: { c: '#ff2a1a', a: 0.8, r: 14 } });
    G.motes(t, { n: 70, vy: -50, color: '#ff4a3a', seed: 15, size: 2 });
  }, { subs: [[0.5, 2.6, 'TAKUTO', 'Who are you?'], [2.8, 6.0, 'AKURO', 'The reason the axe was stuck.'], [6.2, 9.8, 'AKURO', 'Tell me, boy. What is it you want to break?']],
    sfx: [[0.2, (g, w) => S.noiseBed(g, w, 0, 9.6, { vol: 0.14, brown: true, lp: 120, fin: 2, fout: 1, b: 'sfx' })]] });
  shot(6, (lt, d, t) => eyes(t, lt, d, { mode: 'red', z0: 6.8, z1: 7.4, glowEyes: 0.9 }), { subs: [[0.5, 4.2, 'TAKUTO', 'Everything that\'s in the way.'], [4.4, 5.9, 'AKURO', '...Good answer.']] });
  const AWAKE = T;
  shot(10, (lt, d, t) => { // BRAND AWAKENED
    G.vgrad([[0, '#140003'], [1, '#2a0306']]);
    const c = G.ctx, sc = lerp(3.2, 3.6, ease.io(lt / d));
    c.save(); shake(t, lt < 1.2 ? 8 * (1 - lt / 1.2) : 1);
    G.fig('takuto', 560, 400, TK.hx, TK.hy, sc, { mul: '#ff6a6a', mulA: 0.55, a: lt > 5 ? lerp(1, 0.35, inv(5, 6, lt)) : 1 });
    const [sx, sy] = pt(TK.hx, TK.hy, 560, 400, sc, 125, 448);
    G.radial(sx, sy, 380, 'rgba(255,40,20,0.6)', 'rgba(255,0,0,0)', inv(0, 1.5, lt), 'lighter');
    G.sigilAxe(sx, sy, 90, inv(0.4, 4.2, lt), t, '#ff4a3a', 1 - inv(5, 6, lt));
    c.restore();
    G.focusLines(640, 360, t, { a: 0.18, color: '#ff6060', inner: 300 });
    G.fill('#fff', inv(4.3, 4.6, lt) * (1 - inv(4.6, 5.4, lt)));
    if (lt > 4.6) { // title card
      const k = ease.out5(inv(4.6, 5.6, lt));
      G.fill('#000', 0.55 * k);
      c.save(); c.fillStyle = '#e8343c'; c.fillRect(640 - 420 * k, 300, 840 * k, 2); c.fillRect(640 - 420 * k, 452, 840 * k, 2); c.restore();
      G.txt('BRAND AWAKENED', 640, 280, { font: '700 16px ' + G.FONT.sub, fill: '#ff8a8a', ls: 10, a: k });
      G.txt('ルインブレイカー', 640, 372, { font: '400 64px ' + G.FONT.jp, fill: '#fff', ls: lerp(30, 8, k), a: k, stroke: 'rgba(120,0,0,0.8)', lw: 8 });
      G.txt('RUINBREAKER', 640, 432, { font: '900 52px ' + G.FONT.disp, fill: '#ffdede', ls: lerp(40, 16, k), a: k });
      G.txt('Whatever it strikes, breaks.', 640, 488, { font: 'italic 500 18px ' + G.FONT.sub, fill: '#d9c5c5', a: inv(6, 7, lt) });
    }
  }, { sfx: [[0, (g, w) => { S.boom(g, w, 0.7); S.crash(g, w, 0.12, 'sfx'); }], [0.4, (g, w) => S.riser(g, w, 3.9, 0.1)], [4.3, (g, w) => { S.boom(g, w, 0.8); S.shatter(g, w, 0.12, 9); }]] });
  shot(8, (lt, d, t) => { // power
    const z = lerp(1.0, 1.1, ease.io(lt / d));
    G.barrow(t, { x: 0, y: 0, z }, { mood: 'blood', fogA: 0.6 });
    const c = G.ctx; c.save(); shake(t, 1.5); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    takutoFull(t, 640, 820, 0.92, { mul: '#ff9a8a', mulA: 0.55, glow: { c: '#ff2a1a', a: 0.75 + 0.2 * Math.sin(t * 7), r: 28 } });
    [[365, 222], [447, 220]].forEach(([x, y]) => { const [sx, sy] = pt(TK.bx, TK.by, 640, 820, 0.92, x, y); G.radial(sx, sy, 22, 'rgba(255,70,50,0.95)', 'rgba(255,0,0,0)', 1, 'lighter'); });
    const [ax, ay] = pt(TK.bx, TK.by, 640, 820, 0.92, 640, 160); G.radial(ax, ay, 220, 'rgba(255,40,20,0.45)', 'rgba(255,0,0,0)', 0.7 + 0.3 * Math.sin(t * 9), 'lighter');
    c.restore();
    G.motes(t, { n: 130, vy: -130, vx: 25, color: '#ff7a3a', size: 2.6, seed: 17 });
    G.frontFog(t, 0.5, '#ff6a6a');
  }, { sfx: [[0, (g, w) => S.noiseBed(g, w, 0, 8, { vol: 0.12, brown: true, lp: 200, fin: 0.5, fout: 1, b: 'sfx' })]] });
  shot(5, (lt, d, t) => { // it braces
    G.barrow(t, { x: 100, y: 0, z: 1.2 }, { mood: 'blood', fogA: 0.6 });
    const brace = ease.out(inv(0.5, 1.5, lt)); const c = G.ctx; c.save(); shake(t, lt > 0.5 && lt < 1.2 ? 6 : 1);
    shieldAt(t, 640 + brace * 40, 1010 + brace * 20, 0.98, { mul: '#c88a8a', mulA: 0.8, glow: { c: '#ff3a2a', a: 0.4, r: 14 } }, 1);
    c.restore(); G.frontFog(t, 0.6, '#ff6a6a', 520, 60);
  }, { sfx: [[0.5, (g, w) => { S.step(g, w, 0.6); S.clang(g, w + 0.1, 0.12); }]] });
  const SHATTER_SHOT = T;
  // crack geometry on the shield face (original-art coordinates)
  const crackR = G.rng(404), cracks = [];
  for (let i = 0; i < 18; i++) { const a = crackR() * Math.PI * 2, pts = [[SB.shx, SB.shy]]; let x = SB.shx, y = SB.shy; for (let k = 0; k < 7; k++) { x += Math.cos(a + (crackR() - 0.5) * 0.9) * (20 + crackR() * 30); y += Math.sin(a + (crackR() - 0.5) * 0.9) * (20 + crackR() * 30); pts.push([x, y]); } cracks.push(pts); }
  shot(5, (lt, d, t) => { // the swing
    const hit = 3.0, k = ease.in(inv(0.3, hit, lt)), c = G.ctx, sc = 1.0, cx = 900, cy = 1060;
    c.save(); shake(t, lt > hit ? 18 * (1 - inv(hit, hit + 1, lt)) : 2);
    G.barrow(t, { x: lerp(-60, 140, k), y: 30, z: 1.3 }, { mood: 'blood', fogA: 0.5 });
    shieldAt(t, cx, cy, sc, { mul: '#c88a8a', mulA: 0.8 });
    if (lt > hit) { // spreading cracks
      const f = inv(hit, hit + 0.9, lt); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      cracks.forEach(p => { const sp = p.map(([x, y]) => pt(SB.bx, SB.by, cx, cy, sc, x, y)); c.strokeStyle = 'rgba(255,60,40,0.5)'; c.lineWidth = 7; G.strokePartial(sp, f); c.strokeStyle = 'rgba(255,240,220,0.95)'; c.lineWidth = 2; G.strokePartial(sp, f); });
      c.restore();
    }
    takutoFull(t, lerp(-50, 560, k), 860, 0.92, { mul: '#ff9a8a', mulA: 0.5, glow: { c: '#ff2a1a', a: 0.7, r: 24 }, rot: lt < hit ? -0.1 : 0.12 });
    if (lt < hit) G.dashLines(t, { a: 0.4, dir: 1, color: '#ffd0c0' });
    c.restore();
    if (lt > hit && lt < hit + 0.14) G.impact('inv');
    if (lt > hit) G.focusLines(780, 380, t, { a: 0.35 * (1 - inv(hit, hit + 1.5, lt)), inner: 120, color: '#fff' });
  }, { sfx: [[0.3, (g, w) => S.whoosh(g, w, 2.6, 0.25, 150, 2000)], [3.0, (g, w) => { S.clang(g, w, 0.35); S.boom(g, w, 0.5); S.clicks(g, w, 0.9, 50, { vol: 0.18, f0: 2000, f1: 6000, q: 3, len: 0.01, seed: 91 }); }]] });
  shot(6, (lt, d, t) => { // it breaks
    const c = G.ctx, sep = ease.out(inv(0.1, 2.2, lt)), fade = inv(1.4, 3.8, lt), cx = 760, cy = 1060, sc = 1.0;
    c.save(); shake(t, 12 * (1 - inv(0, 1.2, lt)));
    G.barrow(t, { x: 60, y: 30, z: 1.3 }, { mood: 'blood', fogA: 0.5 });
    // the split: two halves of the Fiend slide apart along the slash
    const sx0 = 380, sy0 = -60, sx1 = 1100, sy1 = 900, nx = 0.78, ny = -0.62;
    [[1, 0], [-1, 1]].forEach(([sgn]) => {
      c.save(); c.beginPath();
      if (sgn > 0) { c.moveTo(sx0 - 2000 * 0.62, sy0 - 2000 * 0.78); c.lineTo(sx1 + 2000 * 0.62, sy1 + 2000 * 0.78); c.lineTo(sx1 + 4000, -3000); c.closePath(); }
      else { c.moveTo(sx0 - 2000 * 0.62, sy0 - 2000 * 0.78); c.lineTo(sx1 + 2000 * 0.62, sy1 + 2000 * 0.78); c.lineTo(-3000, 3000); c.closePath(); }
      c.clip(); c.translate(sgn * nx * 70 * sep, sgn * ny * 70 * sep + sep * 30);
      shieldAt(t, cx, cy, sc, { mul: '#c88a8a', mulA: 0.8, a: 1 - fade }, 1 - inv(0, 0.6, lt)); c.restore();
    });
    const s = 1 - inv(0.6, 2.4, lt); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[36, 'rgba(255,30,20,0.25)'], [14, 'rgba(255,60,40,0.6)'], [4, 'rgba(255,245,235,1)']].forEach(([lw, col]) => { c.globalAlpha = s; c.strokeStyle = col; c.lineWidth = lw * (0.6 + s * 0.4); c.beginPath(); c.moveTo(sx0, sy0); c.lineTo(sx1, sy1); c.stroke(); });
    c.restore();
    for (let i = 0; i < 60; i++) { // shield shards
      const a = hash(i, 3) * Math.PI * 2, v = 300 + hash(i, 4) * 700, tt = lt, x = cx + 200 + Math.cos(a) * v * tt, y = 520 + Math.sin(a) * v * tt + 500 * tt * tt, r = 6 + hash(i, 5) * 22, rr = tt * (hash(i, 6) - 0.5) * 12;
      if (y > H + 50) continue;
      c.save(); c.translate(x, y); c.rotate(rr); c.globalAlpha = 1 - inv(1.2, 2.6, lt); c.fillStyle = hash(i, 7) < 0.5 ? '#6a5a50' : '#3a302c'; c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(r * 0.6, -r); c.lineTo(r, r * 0.5); c.lineTo(-r * 0.2, r); c.fill(); c.strokeStyle = 'rgba(255,200,170,0.5)'; c.stroke(); c.restore();
    }
    c.restore();
    G.motes(t, { n: 160, vy: -40 - 60 * fade, vx: 30, wob: 60, size: 2.6, color: '#2a2224', a: inv(0.8, 2, lt) * (1 - inv(4.5, 6, lt)), glow: false, seed: 23, x0: 500, x1: 1100, y0: 100, y1: 700 });
    G.motes(t, { n: 60, vy: -120, color: '#ff7a3a', size: 2.4, seed: 25 });
    G.fill('#fff', 0.8 * (1 - inv(0, 0.25, lt)));
  }, { subs: [[2.5, 5.5, 'TAKUTO', 'It was in the way.']], sfx: [[0, (g, w) => { S.shatter(g, w, 0.35, 12); S.boom(g, w, 0.75); S.slash(g, w, 0.3); }], [1.6, (g, w) => S.clicks(g, w, 2.4, 60, { vol: 0.08, f0: 400, f1: 1500, q: 1.5, len: 0.03, seed: 95 })]] });
  shot(7, (lt, d, t) => { // ash like snow
    G.barrow(t, { x: 0, y: 0, z: lerp(1.05, 1.1, lt / d) }, { mood: 'ash', fogA: 0.5 });
    const settle = ease.io(inv(0, 4, lt));
    takutoFull(t, 640, lerp(820, 880, settle), 0.88, { ...DUSK, glow: { c: '#ff2a1a', a: 0.6 * (1 - settle), r: 22 } });
    G.motes(t, { n: 140, vy: 30, vx: 8, wob: 40, size: 2.2, color: '#d9d0d0', a: 0.55, glow: false, seed: 27 });
    G.frontFog(t, 0.4, '#d8c8c8');
  }, { sfx: [[0, (g, w, off) => S.noiseBed(g, w, off, 7, { vol: 0.08, bp: 400, q: 0.6, lfo: 0.1, lfoDepth: 150, fin: 1, fout: 1.5 }), 7, true]] });
  const WAKE = T;
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 160, y: 0, z: 1.12 }, { fogA: 0.4, mood: 'ash' }); G.fill('#ffcf9a', 0.12, 'screen');
    const rise = ease.out(inv(0, 1.6, lt)); nemuFull(t, 760, lerp(1100, 980, rise), 0.82, DUSK); G.frontFog(t, 0.35);
  }, { subs: [[0.5, 3.8, 'NEMU', 'Hnnaaah... Ow.'], [4.0, 7.5, 'TAKUTO', 'You were dead.']] });
  shot(10, (lt, d, t) => twoShot(t, lt, d, { push: 0.04, mood: 'ash' }), { subs: [[0.2, 3.5, 'NEMU', 'Mm. That\'s seven. Two left.'], [3.7, 6.8, 'TAKUTO', 'Don\'t do that again.'], [7.0, 9.8, 'NEMU', 'You\'re making the face.']] });
  shot(7, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.2, z1: 6.4 }), { subs: [[0.3, 3.8, 'TAKUTO', 'I\'m making it with my whole face this time.'], [4.0, 6.8, 'TAKUTO', '...I never asked your name.']] });
  shot(6, (lt, d, t) => nemuClose(t, lt, d, { sc0: 1.5, sc1: 1.56, mood: 'ash' }), { subs: [[0.3, 2.0, 'NEMU', 'Nemu.'], [2.2, 5.8, 'NEMU', 'And you\'re the idiot who pulled out the Headsman\'s Axe.']] });
  shot(7, (lt, d, t) => {
    G.barrow(t, { x: -100, y: 20, z: 1.2 }, { fogA: 0.45, mood: 'ash' });
    takutoFull(t, 560, 860, lerp(1.05, 1.08, lt / d), DUSK); G.frontFog(t, 0.35);
  }, { subs: [[0.2, 3.2, 'TAKUTO', 'Takuto. Kirishima Takuto.']], sfx: [[3.6, (g, w) => S.clap(g, w)], [4.4, (g, w) => S.clap(g, w)], [5.2, (g, w) => S.clap(g, w)]] });
  const SIEG = T;
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 200, y: 0, z: 1.1 }, { fogA: 0.45, mood: 'ash' });
    const k = ease.out(inv(0, 2.5, lt)); G.fig('sieg', lerp(1080, 900, k), 920, 370, 899, 0.76, { ...DUSK, glow: { c: '#9fc0ff', a: 0.3, r: 16 } });
    G.frontFog(t, 0.35);
    G.infoCard(lt - 1.0, 6.6, { cls: 'A-RANK HUNTER', name: 'SIEG VALEN', sub: ['"The Laughing Blade"', 'Brand: Afterimage'], color: '#8fb4ff', side: 'left' });
  }, { subs: [[0.3, 3.5, 'SIEG', 'Well, well, well.'], [3.7, 7.6, 'SIEG', 'A Shieldbearer\'s shield. Broken in one swing.']], sfx: [[1.0, (g, w) => S.ui(g, w, 0.05)]] });
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 240, y: -40, z: 1.4 }, { fogA: 0.4, mood: 'ash' }); G.fill('#2a1020', 0.2);
    G.fig('sieg', 640, 420, 360, 230, lerp(2.3, 2.45, lt / d), DUSK);
  }, { subs: [[0.3, 3.5, 'SIEG', 'Twelve years I\'ve been hunting. Never seen that.'], [3.7, 7.6, 'SIEG', 'Nice axe, kid. Mind telling me where you got it?']] });
  shot(5, (lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.3, z1: 6.35 }), { subs: [[0.3, 2.5, 'TAKUTO', 'It was loose.'], [2.7, 4.8, 'NEMU', 'He keeps saying that.']] });
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 200, y: 0, z: 1.15 }, { fogA: 0.45, mood: 'ash' });
    G.fig('sieg', 880, 920, 370, 899, 0.8, DUSK); G.frontFog(t, 0.35);
  }, { subs: [[0.2, 2.6, 'SIEG', 'Ha! It was loose, he says.'], [2.8, 7.6, 'SIEG', 'You two had better come with me. Because that...']] });
  const RIFTEYE = T;
  shot(8, (lt, d, t) => {
    G.barrow(t, { x: 0, y: lerp(-150, -230, lt / d), z: 1.2 }, { fogA: 0.3, mood: 'ash', rift: { open: 1, cx: 640, cy: 190, w: 520, h: 150, eye: inv(3.5, 4.5, lt) * (lt > 6.4 && lt < 6.6 ? 0.1 : 1) } });
  }, { subs: [[0.3, 4.0, 'SIEG', '...is not supposed to stay open.']], sfx: [[3.5, (g, w) => S.staticBurst(g, w, 1.6, 0.1)], [3.6, (g, w) => { S.brass(g, w, n('D2'), 3, 0.08); S.brass(g, w, n('Ab2'), 3, 0.07); S.boom(g, w, 0.4); }]] });
  shot(10, (lt, d, t) => {
    G.vgrad([[0, '#1a0a12'], [1, '#3a1a20']]);
    G.fig('takuto', 640, 400, TK.hx, TK.hy, lerp(3.0, 3.3, lt / d), { mul: '#e0a090', mulA: 0.5 });
    const [sx, sy] = pt(TK.hx, TK.hy, 640, 400, lerp(3.0, 3.3, lt / d), 125, 448);
    G.sigilAxe(sx, sy, 80, 1, t, '#ff4a3a', 0.35 + 0.25 * Math.sin(t * 2.5));
    G.fill('#000', inv(7.6, 9.5, lt));
  }, { subs: [[1.0, 4.5, 'AKURO', 'We\'re going to have so much fun, you and I.']], sfx: [[6.0, (g, w) => S.kan(g, w, 0.05)], [6.5, (g, w) => S.kan(g, w, 0.04)], [7.0, (g, w) => S.kan(g, w, 0.03)]] });
  // Part B score
  cueTension(PB, FIGHT - PB);
  cueBattle(FIGHT, BLOW - FIGHT - 0.05);
  at(BLOW + 2.5, (g, w, off) => { S.pad(g, w, n('D2'), 26 - off, { vol: 0.05, cut: 260, att: 4, type: 'sine' }); }, 26, true);
  cueAwaken(AWAKE, SHATTER_SHOT);
  cueAfter(SHATTER_SHOT + 7, WAKE + 8 + 10 + 7 + 6 + 7 - (SHATTER_SHOT + 7) - 1);
  cueSieg(SIEG, RIFTEYE - SIEG);
  at(RIFTEYE + 3.6, (g, w, off) => { S.pad(g, w, n('D2'), 13 - off, { vol: 0.06, cut: 300, att: 1 }); S.pad(g, w, n('Eb3'), 13 - off, { vol: 0.03, cut: 600, att: 2 }); }, 13, true);

  /* ====================================================================
     ENDING
     ==================================================================== */
  chapter('Ending');
  const ED = T, ED_D = 58;
  const CREDITS = [['RUINBREAKER', 'h1'], ['Episode 1  ·  The Crossing', 'h2'], ['', ''], ['CAST', 'l'], ['Takuto Kirishima', 'n'], ['Nemu', 'n'], ['Sieg Valen', 'n'], ['Akuro (voice)', 'n'], ['Mr. Sable', 'n'], ['The Skeletal Shieldbearer', 'n'], ['The cat at Crossing No. 4', 'n'], ['', ''],
    ['ORIGINAL CONCEPT & CHARACTERS', 'l'], ['The series creator', 'n'], ['', ''], ['SCRIPT  ·  STORYBOARD', 'l'], ['ANIMATION  ·  MUSIC  ·  SOUND', 'l'], ['Written and built with Claude', 'n'], ['', ''],
    ['CHARACTER & CREATURE ART', 'l'], ['Reference illustrations by', 'n'], ['their original artists.', 'n'], ['All rights belong to them.', 'n'], ['', ''],
    ['OPENING THEME', 'l'], ['"Ruinbreaker" (instrumental)', 'n'], ['ENDING THEME', 'l'], ['"Crossing No. 4" (instrumental)', 'n'], ['', ''], ['Every sound in this episode', 's'], ['is synthesized live in your browser.', 's']];
  shot(ED_D, (lt, d, t) => {
    const seg = 11.6, i = Math.min(4, Math.floor(lt / seg)), sl = lt - i * seg, z = 1 + sl * 0.006, c = G.ctx;
    const scene = (k, l) => {
      if (k === 0) { G.earth(t, { x: 0, y: 0, z: z }, { gate: 1, cat: 'sit' }); G.fill('#ffb38a', 0.25, 'screen'); G.fill('#f0c8b0', 0.3, 'multiply'); }
      else if (k === 1) { G.barrow(t, { x: 0, y: -80, z: z + 0.05 }, { fogA: 0.5 }); G.fill('#4a4a8a', 0.45, 'multiply'); }
      else if (k === 2) { G.paper(); const src = G.duo('nemu_chibi', '#2a2020', '#ffffff'); G.fig('nemu_chibi', 420, 380, 135, 225, 1.9 * z, { src, comp: 'multiply' }); G.fig('nemu_gg', 700, 470, 325, 378, 2.4, { comp: 'multiply' }); G.vignette(0.4); }
      else if (k === 3) { G.paper(); const src = G.duo('takuto', '#2a1418', '#ffffff'); G.fig('takuto', 480, 780, TK.bx, TK.by, 0.85 * z, { src, comp: 'multiply' }); G.inkStroke([[160, 640], [860, 600]], ease.out(inv(1, 3, l)), 7, 'rgba(170,18,28,0.8)'); G.vignette(0.4); }
      else { G.paper(); const src = G.duo('sieg', '#1a1a24', '#ffffff'); G.fig('sieg', 470, 800, 370, 899, 0.78 * z, { src, comp: 'multiply' }); G.vignette(0.4); }
    };
    scene(i, sl);
    if (sl < 1.2 && i > 0) { c.save(); c.globalAlpha = 1 - sl / 1.2; scene(i - 1, sl + seg); c.restore(); }
    const g = c.createLinearGradient(720, 0, W, 0); g.addColorStop(0, 'rgba(6,5,8,0)'); g.addColorStop(0.35, 'rgba(6,5,8,0.82)'); g.addColorStop(1, 'rgba(6,5,8,0.92)'); c.fillStyle = g; c.fillRect(720, 0, W - 720, H);
    let y = H + 40 - lt * 30;
    CREDITS.forEach(([s, k]) => {
      const st = { h1: ['900 44px ' + G.FONT.disp, '#f4efe9', 54, 3], h2: ['600 16px ' + G.FONT.sub, '#e8343c', 40, 2], l: ['700 12px ' + G.FONT.sub, '#a9a1a6', 26, 4], n: ['500 19px ' + G.FONT.sub, '#f1ebe6', 30, 0], s: ['italic 500 14px ' + G.FONT.sub, '#a9a1a6', 22, 0], '': ['', '', 26, 0] }[k];
      if (s && y > -40 && y < H + 40) G.txt(s, 860, y, { font: st[0], fill: st[1], align: 'left', ls: st[3] });
      y += st[2];
    });
    G.fill('#000', 1 - inv(0, 1.5, lt)); G.fill('#000', inv(d - 1.5, d, lt));
  }, {});
  cueED(ED + 0.4);

  /* ====================================================================
     POST-CREDITS
     ==================================================================== */
  chapter('After the credits');
  const TAG = T;
  shot(16, (lt, d, t) => {
    const cam = focusCam(700, 420, 640, 380, lerp(1.3, 1.45, lt / d));
    G.earth(t, cam, { gate: 1, cat: 'alert', brokenGate: true, lamps: lt > 9.5,
      world: () => { G.fig('sable', 700, 528, 380, 1011, 0.22, { mul: '#9aa4c8', mulA: 0.8, a: ease.out(inv(1.5, 3.5, lt)), glow: { c: '#a8b8ff', a: 0.3, r: 8 } }); const [ex, ey] = pt(380, 1011, 700, 528, 0.22, 270, 185); G.radial(ex, ey, 20, 'rgba(230,240,255,0.95)', 'rgba(150,170,255,0)', inv(3.5, 4.2, lt) * (0.7 + 0.3 * Math.sin(t * 25)), 'lighter'); } });
    G.fill('#ffb38a', 0.18, 'screen'); G.fill('#b8c4e8', 0.25, 'multiply');
    G.fill('#000', 1 - inv(0, 1.5, lt)); G.fill('#000', inv(14.5, 16, lt));
  }, { subs: [[5.0, 8.4, 'SABLE', 'One fell through.'], [9.6, 12.4, 'SABLE', '...Good.']],
    sfx: [[3.5, (g, w) => S.staticBurst(g, w, 1.2, 0.08)], [12.6, (g, w) => S.meow(g, w, 0.04)], [0, (g, w, off) => S.noiseBed(g, w, off, 16, { vol: 0.05, bp: 500, q: 0.5, fin: 2, fout: 2 }), 16, true]] });
  for (let k = 0; k < 10; k++) at(TAG + 9.5 + k * 0.5, (g, w) => S.kan(g, w, 0.08));

  /* ====================================================================
     NEXT EPISODE PREVIEW
     ==================================================================== */
  chapter('Next episode');
  const PV = T;
  shot(20, (lt, d, t) => {
    const cut = Math.floor(lt / 2.6);
    if (cut === 0) opChar(lt, 2.6, CAST.rin, t, -440);
    else if (cut === 1) opPanel(lt - 2.6, 2.6, 'valentine', 'VALENTINE & TOFU', 'GUILD APPRAISER', '#2a0a1c', '#ff7ab6', 0.5, 0.5, -480);
    else if (cut === 2) { G.fill('#05060a'); const g = G.ctx; for (let i = 0; i < 9; i++) { const k = G.twos(t, 12) + i; G.txt('ERROR', 640 + (hash(k, 1) - 0.5) * 40, 380 + (hash(k, 2) - 0.5) * 30, { font: '900 160px ' + G.FONT.disp, fill: i % 3 === 0 ? 'rgba(255,40,60,0.5)' : i % 3 === 1 ? 'rgba(60,220,255,0.4)' : 'rgba(255,255,255,0.25)', ls: 12 }); } G.txt('RANK', 640, 230, { font: '700 18px ' + G.FONT.sub, fill: '#a9a1a6', ls: 10 }); }
    else if (cut === 3) opChar(lt - 7.8, 2.6, CAST.wick, t, -440);
    else if (cut === 4) { G.fill('#0a0a0d'); G.fig('rin_face', 640, 380, 540, 230, 2.0 + (lt - 10.4) * 0.05, { glow: { c: '#ff6a78', a: 0.3, r: 14 } }); }
    else if (cut === 5) { G.fill('#0b0b0e'); G.cover('m_golem', 0, 0, W, H, 0.5, 0.4, 1.05 + (lt - 13) * 0.04, { src: G.duo('m_golem', '#0b0b0e', '#d9c690') }); }
    else {
      const l2 = lt - 15.6, a = inv(0, 0.8, l2); G.fill('#050406');
      G.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + G.FONT.sub, fill: '#e8343c', ls: 10, a });
      G.txt('第二話', 640, 300, { font: '400 26px ' + G.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      G.txt('烙印', 640, 430, { font: '400 130px ' + G.FONT.jp, fill: '#f4efe9', ls: 20, a });
      G.txt('BRANDED', 640, 510, { font: '800 40px ' + G.FONT.disp, fill: '#f4efe9', ls: 14, a });
      G.fill('#000', inv(d - 1.2 - 15.6 + 15.6, d, lt));
    }
    if (lt < 15.6) G.fill('#fff', 0.5 * (1 - inv(0, 0.1, lt % 2.6)));
  }, { subs: [[0.4, 3.8, 'TAKUTO', 'Next time: the Hunters\' Guild.'], [4.0, 7.6, 'TAKUTO', 'A test that reads my rank as ERROR...'], [7.8, 12.0, 'TAKUTO', '...and a girl with a red scarf who hates me on sight.'], [12.2, 15.2, 'TAKUTO', 'Why does she have my hair?']] });
  cuePreview(PV);
  shot(3, (lt) => { G.fill('#000'); G.logo(640, 380, 0.5, 1, { a: 1 - inv(1.6, 3, lt) }); }, { vig: false });

  /* ====================================================================
     SCORE
     ==================================================================== */
  function cueNight(t0, dur) {
    const b = 60 / 72, bar = b * 4;
    const prog = [[['D2', 'A2'], ['F4', 'A4', 'C5', 'E5']], [['Bb1', 'F2'], ['D4', 'F4', 'A4', 'C5']], [['G1', 'D2'], ['Bb3', 'D4', 'F4', 'A4']], [['A1', 'E2'], ['C#4', 'E4', 'A4', 'D5']]];
    const pat = [0, 1, 2, 3, 2, 1, 2, 3];
    const mel = [['D5', 0, 2], ['A4', 2, 2], ['C5', 4, 2], ['D5', 6, 2], ['F5', 8, 2], ['E5', 10, 2], ['C5', 12, 1], ['A4', 13, 1], ['D5', 14, 2]];
    const bars = Math.floor(dur / bar);
    for (let i = 0; i < bars; i++) {
      const [bs, ar] = prog[i % 4], t = t0 + i * bar, fade = clamp((dur - (i * bar)) / 5);
      at(t, (g, w) => { S.piano(g, w, n(bs[0]), bar * 0.95, 0.42 * fade); S.piano(g, w + b * 2, n(bs[1]), bar * 0.45, 0.3 * fade); });
      pat.forEach((p, k) => at(t + k * b / 2 + (hash(i * 8 + k, 3) - 0.5) * 0.02, (g, w) => S.piano(g, w, n(ar[p]), b * 0.9, (0.24 + (k % 2 ? 0 : 0.06)) * fade)));
      if (i >= 4 && i < 8) mel.filter(m => Math.floor(m[1] / 4) === i - 4).forEach(([nt, st, ln]) => at(t + (st % 4) * b, (g, w) => S.piano(g, w, n(nt), ln * b, 0.5 * fade)));
    }
  }
  function cueOther(t0, dur) {
    at(t0, (g, w, off) => S.pad(g, w, n('D2'), dur - off, { vol: 0.045, type: 'sine', cut: 300, att: 4, rel: 4 }), dur, true);
    const chords = [['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['F3', 'A3', 'C4'], ['C3', 'E3', 'G3']];
    for (let i = 0; i * 8 < dur - 2; i++) chords[i % 4].forEach(c => at(t0 + i * 8, (g, w) => S.choir(g, w, n(c), 7.2, 0.016, 2.5, 3)));
    const pent = ['D5', 'F5', 'G5', 'A5', 'C6', 'D6'];
    for (let x = 1.5, k = 0; x < dur - 3; x += 1.9 + hash(k, 8) * 1.8, k++) at(t0 + x, (g, w) => S.bell(g, w, n(pent[Math.floor(hash(k, 9) * 6)]), 0.03, 2.4));
  }
  function cueTension(t0, dur) {
    at(t0, (g, w, off) => { S.pad(g, w, n('D2'), dur - off, { vol: 0.06, cut: 420, att: 1.5 }); S.pad(g, w, n('Eb2'), dur - off, { vol: 0.04, cut: 380, att: 2.5 }); }, dur, true);
    const b = 0.6; for (let x = 0, k = 0; x < dur; x += b / 2, k++) { const v = 0.05 + 0.1 * (x / dur); at(t0 + x, (g, w) => S.bass(g, w, n('D1'), 0.22, v)); }
    for (let x = 0; x < dur; x += 2.4) at(t0 + x, (g, w) => S.taiko(g, w, 0.25 + 0.2 * (x / dur)));
  }
  function chordOf(r) { return { D: ['D', 'F', 'A'], C: ['C', 'E', 'G'], Bb: ['Bb', 'D', 'F'], A: ['A', 'C#', 'E'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Dmaj: ['D', 'F#', 'A'] }[r]; }
  function cueBattle(t0, dur, bpm = 150) {
    const b = 60 / bpm, bar = 4 * b, roots = ['D', 'C', 'Bb', 'A'];
    const mel = [['D5', 'A4', 'C5', 'D5'], ['F5', 'E5', 'C5', 'D5'], ['F5', 'G5', 'A5', 'A5'], ['G5', 'F5', 'E5', 'E5']];
    for (let i = 0; i * bar < dur - 0.05; i++) {
      const t = t0 + i * bar, r = roots[i % 4], ch = chordOf(r), ro = r === 'Bb' || r === 'A' ? 1 : 2;
      [0, 1.5, 2].forEach(x => at(t + x * b, (g, w) => S.kick(g, w, 0.42)));
      [1, 3].forEach(x => at(t + x * b, (g, w) => S.snare(g, w, 0.2)));
      for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.hat(g, w, 0.035));
      at(t, (g, w) => S.taiko(g, w, 0.35));
      if (i % 4 === 0) at(t, (g, w) => S.crash(g, w, 0.08));
      [0, 0, 12, 0, 0, 12, 0, 7].forEach((o, k) => at(t + k * b / 2, (g, w) => S.bass(g, w, n(r + ro) * Math.pow(2, o / 12), b / 2 * 0.9, 0.13)));
      at(t, (g, w) => ch.forEach(c => S.brass(g, w, n(c + 4), b * 0.7, 0.045)));
      at(t + 2.5 * b, (g, w) => ch.forEach(c => S.brass(g, w, n(c + 4), b * 0.4, 0.04)));
      at(t, (g, w) => ch.forEach(c => S.pad(g, w, n(c + 5), bar, { vol: 0.012, att: 0.05, rel: 0.2, trem: 12, cut: 3000 })));
      if (i >= 4) { const m = mel[(i - 4) % 4]; m.forEach((nt, k) => at(t + k * b, (g, w) => S.brass(g, w, n(nt), b * 0.85, 0.06))); }
    }
  }
  function cueAwaken(t0, tCharge) {
    const bar = 2.5, b = bar / 4, roots = ['D', 'Bb', 'C', 'Dmaj'], mel = [[['D5', 0, 2], ['A4', 2, 2]], [['C5', 0, 2], ['D5', 2, 2]], [['F5', 0, 2], ['E5', 2, 2]], [['C5', 0, 1], ['A4', 1, 1], ['D5', 2, 2]]];
    for (let i = 0; i < 7; i++) {
      const t = t0 + i * bar, r = roots[Math.min(3, i)], ch = chordOf(r);
      at(t, (g, w) => { ch.forEach(c => S.choir(g, w, n(c + 3), bar, 0.03, 0.3, 1)); S.pad(g, w, n(r[0] === 'D' ? 'D2' : r === 'Bb' ? 'Bb1' : 'C2'), bar, { vol: 0.06, cut: 600, att: 0.2, rel: 0.8 }); S.crash(g, w, 0.06); });
      [0, 2].forEach(x => at(t + x * b, (g, w) => S.taiko(g, w, 0.5)));
      if (i < 4) mel[i].forEach(([nt, st, ln]) => at(t + st * b, (g, w) => { S.brass(g, w, n(nt), ln * b * 0.95, 0.075); S.brass(g, w, n(nt) / 2, ln * b * 0.95, 0.05); }));
      if (i === 3) for (let k = 0; k < 8; k++) at(t + 2 * b + k * b / 4, (g, w) => S.taiko(g, w, 0.25 + k * 0.03));
    }
    // charge: fast battle groove, then the final chord on the shatter
    const charge = tCharge - 5;
    cueBattle(charge, 5 + 3.0, 160);
    const hit = tCharge + 3.0;
    at(hit, (g, w) => { ['D', 'F#', 'A'].forEach(c => { S.brass(g, w, n(c + 4), 4.5, 0.07); S.choir(g, w, n(c + 3), 5, 0.04, 0.05, 2.5); }); S.brass(g, w, n('D3'), 4.5, 0.08); S.crash(g, w, 0.14); S.taiko(g, w, 0.6); S.pad(g, w, n('D2'), 5, { vol: 0.08, cut: 500, att: 0.05, rel: 2 }); });
  }
  function cueAfter(t0, dur) {
    const ch = [['Bb2', 'D3', 'F3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3'], ['D3', 'F3', 'A3']];
    for (let i = 0; i * 5 < dur - 1; i++) ch[i % 4].forEach(c => at(t0 + i * 5, (g, w) => S.pad(g, w, n(c), 4.8, { vol: 0.022, cut: 900, att: 1.2, rel: 1.5 })));
    [['D5', 0], ['A4', 1.6], ['C5', 3.2], ['D5', 4.8], ['F5', 8], ['E5', 9.6], ['C5', 11.2], ['D5', 12.8]].forEach(([nt, x]) => { if (x < dur - 2) at(t0 + 2 + x, (g, w) => S.piano(g, w, n(nt), 1.5, 0.32)); });
  }
  function cueSieg(t0, dur) {
    const b = 60 / 112, bar = 4 * b, prog = [['F', 'F2', 'C3'], ['Bb', 'Bb1', 'F2'], ['C', 'C2', 'G2'], ['F', 'F2', 'C3']];
    for (let i = 0; i * bar < dur - 0.2; i++) {
      const t = t0 + i * bar, [r, b1, b2] = prog[i % 4], ch = chordOf(r), fade = clamp((dur - i * bar) / 3);
      [b1, b2, b1, b2].forEach((x, k) => at(t + k * b, (g, w) => S.pluck(g, w, n(x), 0.16 * fade)));
      [0, 1, 2, 1, 0, 1, 2, 1].forEach((x, k) => at(t + k * b / 2, (g, w) => S.pluck(g, w, n(ch[x] + 4), 0.07 * fade)));
      [1, 3].forEach(x => at(t + x * b + b / 2, (g, w) => S.hat(g, w, 0.025)));
    }
  }
  function cueOP(t0) {
    const b = 60 / 150, bar = 4 * b, prog = ['D', 'Bb', 'F', 'C'];
    const pc = r => { const root = { D: 'D2', Bb: 'Bb1', F: 'F2', C: 'C2' }[r]; const f = n(root); return [f, f * 1.4983, f * 2]; };
    const chorus = [['D5', 'A4', 'C5', 'D5'], ['F5', 'E5', 'C5', 'D5'], ['F5', 'G5', 'A5', 'G5'], ['F5', 'E5', 'D5', 'C5'], ['D5', 'A4', 'C5', 'D5'], ['F5', 'E5', 'C5', 'A5'], ['Bb5', 'A5', 'G5', 'F5'], ['E5', 'C#5', 'D5', 'D5']];
    const drums = (t, full = true) => { [0, 1.5, 2].forEach(x => at(t + x * b, (g, w) => S.kick(g, w, 0.45))); [1, 3].forEach(x => at(t + x * b, (g, w) => S.snare(g, w, 0.22))); if (full) for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.hat(g, w, 0.04)); };
    for (let i = 0; i < 38; i++) {
      const t = t0 + i * bar, r = prog[i % 4], pcs = pc(r), rb = n({ D: 'D2', Bb: 'Bb1', F: 'F2', C: 'C2' }[r]);
      if (i < 4) { // intro riff on D
        const ip = pc('D');
        for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.guitar(g, w, ip, b / 2 * 0.9, k === 0 ? 0.07 : 0.05, k !== 0));
        if (i === 0) at(t, (g, w) => S.crash(g, w, 0.1));
        if (i >= 2) { drums(t); chorus[(i - 2)].forEach((nt, k) => at(t + k * b, (g, w) => S.lead(g, w, n(nt), b * 0.9, 0.05))); }
      } else if (i < 12) { // verse
        drums(t); for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.guitar(g, w, pcs, b / 2 * 0.9, 0.05, true));
        for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.bass(g, w, rb, b / 2 * 0.9, 0.12));
        at(t, (g, w) => chordOf(r).forEach(c => S.pad(g, w, n(c + 4), bar, { vol: 0.012, att: 0.3, cut: 1800 })));
      } else if (i < 16) { // pre-chorus
        const pr = ['Bb', 'C', 'D', 'C'][i - 12], pp = pc(pr), prb = n({ Bb: 'Bb1', C: 'C2', D: 'D2' }[pr]);
        [0, 2].forEach(x => at(t + x * b, (g, w) => S.guitar(g, w, pp, b * 1.9, 0.06, false)));
        [0, 2].forEach(x => at(t + x * b, (g, w) => S.kick(g, w, 0.45))); at(t + 1 * b, (g, w) => S.snare(g, w, 0.2)); at(t + 3 * b, (g, w) => S.snare(g, w, 0.2));
        for (let k = 0; k < 4; k++) at(t + k * b, (g, w) => S.bass(g, w, prb, b * 0.9, 0.13));
        if (i === 15) for (let k = 0; k < 16; k++) at(t + k * b / 4, (g, w) => S.snare(g, w, 0.08 + k * 0.012));
        if (i === 14) at(t, (g, w) => S.riser(g, w, bar * 2, 0.1));
      } else if (i < 24 || (i >= 28 && i < 36)) { // chorus
        const ci = i < 24 ? i - 16 : i - 28;
        drums(t); if (ci === 0 || ci === 4) at(t, (g, w) => S.crash(g, w, 0.11)); else at(t, (g, w) => S.crash(g, w, 0.05));
        for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.guitar(g, w, pcs, b / 2 * 0.95, 0.055, false));
        for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.bass(g, w, rb * (k % 4 === 3 ? 2 : 1), b / 2 * 0.9, 0.13));
        let prev = 0; chorus[ci].forEach((nt, k) => { const f = n(nt), pf = prev; prev = f; at(t + k * b, (g, w) => S.lead(g, w, f, b * 0.95, 0.06, pf)); });
        if (i >= 28) at(t, (g, w) => chordOf(r).forEach(c => S.choir(g, w, n(c + 4), bar, 0.018, 0.2, 0.6)));
      } else if (i < 28) { // bridge, half time
        const br = [['A5', 'G5'], ['F5', 'F5'], ['E5', 'D5'], ['C#5', 'C#5']][i - 24], brc = ['F', 'C', 'Bb', 'A'][i - 24];
        at(t, (g, w) => S.kick(g, w, 0.45)); at(t + 2 * b, (g, w) => S.snare(g, w, 0.22));
        at(t, (g, w) => chordOf(brc).forEach(c => S.pad(g, w, n(c + 4), bar, { vol: 0.02, att: 0.4, cut: 2200 })));
        at(t, (g, w) => S.bass(g, w, n({ F: 'F2', C: 'C2', Bb: 'Bb1', A: 'A1' }[brc]), bar * 0.95, 0.12));
        br.forEach((nt, k) => at(t + k * 2 * b, (g, w) => S.lead(g, w, n(nt), 2 * b * 0.95, 0.055)));
      } else if (i === 36) { // final hit
        at(t, (g, w) => { S.guitar(g, w, pc('D'), bar * 1.9, 0.08, false); S.crash(g, w, 0.16); S.taiko(g, w, 0.6); S.kick(g, w, 0.55); S.bass(g, w, n('D2'), bar * 1.9, 0.15); ['D', 'F', 'A'].forEach(c => S.brass(g, w, n(c + 4), bar * 1.8, 0.05)); });
      }
    }
  }
  function cueED(t0) {
    const b = 0.8, bar = 3.2, prog = [['Bb1', ['D4', 'F4', 'A4', 'C5']], ['C2', ['E4', 'G4', 'C5', 'E5']], ['A1', ['C4', 'E4', 'G4', 'C5']], ['D2', ['F4', 'A4', 'C5', 'E5']]];
    const mel = [[['F5', 0, 1], ['A5', 1, 1], ['G5', 2, 2]], [['E5', 0, 1], ['G5', 1, 1], ['C5', 2, 2]], [['A4', 0, 1], ['C5', 1, 1], ['E5', 2, 1], ['D5', 3, 1]], [['D5', 0, 4]]];
    for (let i = 0; i < 18; i++) {
      const t = t0 + i * bar, [bs, ar] = prog[Math.min(i, 17) % 4], last = i >= 16, fade = i === 17 ? 0.7 : 1;
      const bsN = last ? (i === 16 ? 'Bb1' : 'D2') : bs, arN = last ? (i === 16 ? prog[0][1] : ['F4', 'A4', 'D5', 'E5']) : ar;
      at(t, (g, w) => S.piano(g, w, n(bsN), bar * (last ? 1.6 : 0.95), 0.4 * fade));
      at(t, (g, w) => arN.forEach(c => S.pad(g, w, n(c) / 2, bar, { vol: 0.009, att: 0.8, cut: 1400 })));
      if (!last) [0, 1, 2, 3, 2, 1, 2, 3].forEach((p, k) => at(t + k * b / 2, (g, w) => S.piano(g, w, n(arN[p]), b * 0.8, 0.2)));
      else if (i === 17) arN.forEach((c, k) => at(t + k * 0.18, (g, w) => S.piano(g, w, n(c), 4, 0.3)));
      if (i >= 4 && i < 16) { [0, 2.5].forEach(x => at(t + x * b, (g, w) => S.kick(g, w, 0.3))); [1, 3].forEach(x => at(t + x * b, (g, w) => S.snare(g, w, 0.07))); for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.hat(g, w, 0.02)); }
      if (i >= 4 && i < 12) mel[(i - 4) % 4].forEach(([nt, st, ln]) => at(t + st * b, (g, w) => S.lead(g, w, n(nt), ln * b * 0.95, 0.03)));
      if (i >= 12 && i < 16) mel[(i - 12) % 4].forEach(([nt, st, ln]) => at(t + st * b, (g, w) => S.piano(g, w, n(nt) * 2, ln * b, 0.32)));
    }
  }
  function cuePreview(t0) {
    const b = 0.4, bar = 1.6, prog = ['D', 'Bb', 'F', 'C'];
    for (let i = 0; i < 10; i++) {
      const t = t0 + i * bar, r = prog[i % 4], f = n({ D: 'D2', Bb: 'Bb1', F: 'F2', C: 'C2' }[r]), pcs = [f, f * 1.4983, f * 2];
      for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.guitar(g, w, pcs, b / 2 * 0.9, 0.045, i < 2 && k !== 0));
      if (i >= 2) { [0, 1.5, 2].forEach(x => at(t + x * b, (g, w) => S.kick(g, w, 0.4))); [1, 3].forEach(x => at(t + x * b, (g, w) => S.snare(g, w, 0.18))); }
      for (let k = 0; k < 8; k++) at(t + k * b / 2, (g, w) => S.bass(g, w, f, b / 2 * 0.9, 0.1));
    }
    at(t0 + 15.6, (g, w) => { S.guitar(g, w, [n('D2'), n('A2'), n('D3')], 3, 0.07); S.crash(g, w, 0.12); S.taiko(g, w, 0.5); });
  }

  ev.sort((a, b) => a.t - b.t);
  return { shots, subs, ev, chapters, duration: T };
})();
