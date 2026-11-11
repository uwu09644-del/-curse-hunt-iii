/* RUINBREAKER — Episode 1 "The Crossing" (第一話「踏切」)
   Shot list with rigged, voiced characters, full-body poses, weapons, effects and score. */
'use strict';

const EP01 = (() => {
  const G = GFX, S = SND, V = VOICE, R = RIG, P = POSE, X = VFX;
  const { W, H, clamp, lerp, inv, ease, hash } = G;
  const shots = [], subs = [], ev = [], chapters = [];
  let T = 0;

  /* ---------- timeline ---------- */
  function shot(d, draw, o = {}) {
    let lastEnd = 0;
    (o.say || []).forEach(([at, id]) => {
      const tt = typeof at === 'string' ? lastEnd + parseFloat(at) : at;
      const p = V.place(T + tt, id);
      subs.push({ t0: T + tt, t1: T + tt + p.dur + 0.3, who: p.who, text: p.text, mono: p.mono });
      ev.push({ t: T + tt, d: p.dur + 0.1, long: true, f: (g, w, off) => V.play(g, p, w, off) });
      lastEnd = tt + p.dur;
    });
    if (o.say && o.say.length) d = Math.max(d, lastEnd + (o.tail ?? 0.6));
    const s = { t0: T, d, draw, vig: o.vig !== false };
    shots.push(s);
    (o.sfx || []).forEach(([a, f, d2 = 0.2, long = false]) => ev.push({ t: T + a, d: d2, f, long }));
    T += d; return s;
  }
  const at = (t, f, d = 0.2, long = false) => ev.push({ t, d, f, long });
  // 3D mode (3d.html): a shot's 3D staging replaces its 2D drawing; the 2D one stays as the fallback
  const D3 = typeof window !== 'undefined' && window.RB_MODE === '3d' && typeof EP3D !== 'undefined';
  const alt = (f2, f3) => !D3 ? f2 : (lt, d, t) => { if (!S3.ok) return f2(lt, d, t); return f3(lt, d, t, f2); };
  const chapter = name => chapters.push({ t: T, name });
  const n = S.n;
  const shake = (t, amt, fps = 30) => { if (amt <= 0) return; const k = G.twos(t, fps); G.ctx.translate((hash(k, 1) - 0.5) * amt * 2, (hash(k, 2) - 0.5) * amt * 2); };
  const zoomAt = (cx, cy, z) => { const c = G.ctx; c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); };
  const bokeh = (t, list, a = 1) => list.forEach(([x, y, r, c], i) => G.radial(x + Math.sin(t * 0.3 + i) * 4, y, r, c, 'rgba(0,0,0,0)', a * (0.75 + 0.25 * Math.sin(t * 0.7 + i * 2)), 'lighter'));
  const EARTH_BOKEH = [[1050, 140, 120, 'rgba(160,190,255,0.45)'], [1180, 260, 70, 'rgba(255,190,120,0.35)'], [140, 120, 90, 'rgba(255,80,60,0.18)'], [300, 300, 60, 'rgba(255,200,140,0.25)'], [900, 600, 140, 'rgba(120,150,255,0.18)']];
  const DUSK_BOKEH = [[200, 120, 160, 'rgba(255,170,110,0.35)'], [1100, 160, 130, 'rgba(255,220,180,0.3)'], [900, 620, 120, 'rgba(255,120,90,0.2)'], [400, 600, 90, 'rgba(255,190,130,0.2)']];

  /* ---------- lighting presets ---------- */
  const DUSK = { mul: '#f3c4ae', mulA: 0.42, glow: { c: '#ffb070', a: 0.32, r: 16 } };
  const ASH = { mul: '#d8c4c0', mulA: 0.45, glow: { c: '#ffc8a0', a: 0.22, r: 14 } };
  const BLOOD = { mul: '#ff9a8a', mulA: 0.55, glow: { c: '#ff2a1a', a: 0.8, r: 26 } };
  const NIGHT = { mul: '#8a90b8', mulA: 0.6, glow: { c: '#ff2a35', a: 0.5, r: 10 } };
  const STILL = { mul: '#b0a8b0', mulA: 0.6 };

  /* ---------- characters (full bodies, weapons, voices) ---------- */
  const STAND = [{ spread: 0.11 }, { spread: 0.14 }];
  function TK(t, x, y, sc, o = {}, fx = DUSK) {
    const place = { x, y, ax: 368, ay: 1610, sc, rot: o.rot || 0 };
    const pose = P.takuto(t, { talk: V.amp('TAKUTO', t), ...o });
    if (o.legs !== false) PARTS.legs('takuto', PARTS.LEGS.takuto.hips.map(([hx, hy]) => R.point('takuto', place, pose, hx, hy)), sc, place.rot, o.legPose || STAND, fx);
    const grip = R.point('takuto', place, pose, 118, 455), ang = place.rot - 0.5009 + pose.bones.armR.r + (o.axeR || 0);
    const afx = { mul: fx.mul, mulA: fx.mulA, sil: fx.sil, silA: fx.silA, a: fx.a, rot: ang, glow: o.axeGlow ? { c: '#ff3a2a', a: o.axeGlow, r: 34 } : fx.glow };
    if (!o.axeFront) G.fig('axe', grip[0], grip[1], 0, 0, sc, afx);
    R.draw('takuto', place, pose, fx);
    if (o.axeFront) G.fig('axe', grip[0], grip[1], 0, 0, sc, afx);
    return { place, pose, grip, ang };
  }
  function axeTip(k, dist = 700) { return [k.grip[0] + Math.cos(k.ang) * dist * k.place.sc, k.grip[1] + Math.sin(k.ang) * dist * k.place.sc]; }
  function NM(t, x, y, sc, o = {}, fx = DUSK) {
    const place = { x, y, ax: 460, ay: 975, sc, rot: o.rot || 0 };
    const pose = P.nemu(t, { talk: Math.max(V.amp('NEMU', t), V.amp('???', t)), ...o });
    if (o.legs !== false) PARTS.legs('nemu', PARTS.LEGS.nemu.hips.map(([hx, hy]) => R.point('nemu', place, pose, hx, hy)), sc, place.rot, [{ spread: 0.02 }], fx);
    R.draw('nemu', place, pose, fx); return { place, pose };
  }
  function SG(t, x, y, sc, o = {}, fx = ASH) {
    const place = { x, y, ax: 370, ay: 1530, sc, rot: o.rot || 0 }, talk = V.amp('SIEG', t);
    const pose = P.sieg(t, { talk, ...o }); pose.open = talk;
    const lp = o.walk ? PARTS.walk(t * 4.2, o.walk) : STAND;
    PARTS.legs('sieg', PARTS.LEGS.sieg.hips.map(([hx, hy]) => R.point('sieg', place, pose, hx, hy)), sc, place.rot, lp, fx);
    const grip = R.point('sieg', place, pose, 128, 716);
    G.fig('glaive', grip[0], grip[1], 0, 0, sc, { mul: fx.mul, mulA: fx.mulA, rot: place.rot - 0.673 + pose.bones.armL.r + (o.glaiveR || 0), glow: fx.glow });
    R.draw('sieg', place, pose, fx); return { place, pose };
  }
  function SBL(t, x, y, sc, o = {}, fx = {}) {
    const place = { x, y, ax: 380, ay: 1600, sc }, pose = P.sable(t, { talk: V.amp('SABLE', t), ...o });
    PARTS.legs('sable', PARTS.LEGS.sable.hips.map(([hx, hy]) => R.point('sable', place, pose, hx, hy)), sc, 0, [{ spread: 0.03 }, { spread: 0.05 }], fx);
    R.draw('sable', place, pose, fx);
    const [ex, ey] = R.point('sable', place, pose, 270, 185), amp = V.amp('SABLE', t);
    G.radial(ex, ey, 70 * sc / 0.36 * 0.3 + 10, 'rgba(230,240,255,0.95)', 'rgba(150,170,255,0)', (o.eye ?? 1) * (0.7 + 0.3 * Math.sin(t * 25)), 'lighter');
    const [gx, gy] = R.point('sable', place, pose, 290, 228); G.radial(gx, gy, 50 * sc / 0.36 * 0.3 + 6, 'rgba(200,220,255,0.8)', 'rgba(120,140,255,0)', (o.eye ?? 1) * (0.3 + amp * 0.9), 'lighter');
    return { place, pose };
  }
  function SHB(t, x, y, sc, o = {}, fx = {}, eyeA = 1) {
    const place = { x, y, ax: 380, ay: 1065, sc, rot: o.rot || 0 }, pose = P.shield(t, o);
    R.draw('shield', place, pose, fx);
    if (eyeA > 0) [[326, 178], [358, 178]].forEach(([ex, ey]) => { const [sx, sy] = R.point('shield', place, pose, ex, ey), fl = 0.8 + 0.2 * Math.sin(t * 9); G.radial(sx, sy, 26 * sc + 8, 'rgba(255,40,30,' + (0.95 * eyeA * fl).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter'); G.radial(sx, sy, 5 * sc + 2, 'rgba(255,230,200,' + eyeA + ')', 'rgba(255,80,60,0)', 1, 'lighter'); });
    return { place, pose, pt: (px, py) => R.point('shield', place, pose, px, py) };
  }
  function eyes(t, lt, d, o = {}) { // extreme close-up on Takuto
    const { mode = 'dusk', z0 = 6.2, z1 = 6.8, cx = 390, cy = 226, open = null } = o;
    const sc = lerp(z0, z1, ease.io(clamp(lt / d)));
    if (mode === 'earth') { G.vgrad([[0, '#0a0e1a'], [1, '#1a1626']]); bokeh(t, EARTH_BOKEH); }
    else if (mode === 'red' || mode === 'blood') { G.vgrad([[0, '#1a0003'], [1, '#3a0508']]); bokeh(t, [[200, 150, 160, 'rgba(255,40,40,0.3)'], [1100, 500, 180, 'rgba(255,60,30,0.3)']]); }
    else { G.vgrad([[0, '#3a1f33'], [1, '#c26a58']]); bokeh(t, DUSK_BOKEH); }
    const fx = mode === 'earth' ? { mul: o.lamp ? '#ff5050' : '#a9bcff', mulA: o.lamp ? 0.55 : 0.45 } : mode === 'red' ? { mul: '#ff5a5a', mulA: 0.65 } : mode === 'blood' ? { mul: '#ff3a3a', mulA: 0.7 } : { mul: '#ffcfb5', mulA: 0.35 };
    const pose = P.takuto(t, { talk: V.amp('TAKUTO', t), blink: open == null ? undefined : 1 - open, headR: (o.tremble || 0) * Math.sin(t * 40) * 0.01 });
    const place = { x: W / 2, y: H / 2, ax: cx, ay: cy, sc };
    R.draw('takuto', place, pose, fx);
    if (mode === 'red' || mode === 'blood' || o.glowEyes) {
      const ga = o.glowEyes ?? 0.75;
      [[365, 222], [447, 220]].forEach(([x, y]) => { const [sx, sy] = R.point('takuto', place, pose, x, y); G.radial(sx, sy, 44 * sc / 6, 'rgba(255,60,50,' + ga + ')', 'rgba(255,0,0,0)', 1, 'lighter'); });
    }
    if (mode === 'earth') G.rain(t, { n: 120, a: 0.25, len: 40, speed: 1700, seed: 4 });
    if (mode === 'red' || mode === 'blood') { G.motes(t, { n: 50, vy: -70, color: '#ff6a3a', size: 2.6, seed: 21 }); POST.set({ bloom: 0.9, thr: 0.5 }); }
  }
  function twoShot(t, lt, d, o = {}) { // full bodies now: Takuto left, Nemu right
    const { push = 0.03, mood = 'dusk', camx = 0 } = o, z = 1 + push * ease.io(clamp(lt / d)), fx = mood === 'ash' ? ASH : DUSK;
    G.barrow(t, { x: camx, y: 0, z }, { mood, fogA: 0.45 });
    sunShafts(t, mood);
    const c = G.ctx; c.save(); zoomAt(W / 2, H / 2, z);
    TK(t, 330, 1150, 0.66, { headR: o.tkHead || 0.05, lookBias: 0.8, ...(o.tk || {}) }, fx);
    NM(t, 940, 1100, 0.92, { headR: o.nmHead || -0.03, lookBias: -0.8, ...(o.nm || {}) }, fx);
    c.restore();
    G.frontFog(t, 0.4, mood === 'ash' ? '#d8c8c8' : '#e9b5b5', 560, 30);
    grass(t);
  }
  function nemuClose(t, lt, d, o = {}) {
    const sc = lerp(o.sc0 ?? 1.45, o.sc1 ?? 1.55, ease.io(clamp(lt / d)));
    G.barrow(t, { x: 120, y: -40, z: 1.25 }, { mood: o.mood || 'dusk', fogA: 0.5 }); G.fill('#2a1020', 0.25);
    NM(t, W / 2 + 130, H / 2 + 60 + (975 - (o.ay ?? 190)) * sc, sc, { lookBias: -0.7, ...(o.pose || {}) }, o.mood === 'ash' ? ASH : DUSK);
    G.frontFog(t, 0.35, '#e9b5b5', 600, 30);
  }
  function sunShafts(t, mood = 'dusk') {
    if (mood === 'dusk') X.shafts(t, { x: 1050, y: -60, ang: 2.05, spread: 0.9, n: 8, color: 'rgba(255,190,140,1)', a: 0.10 });
    else if (mood === 'blood') X.shafts(t, { x: 640, y: -120, ang: 1.57, spread: 1.4, n: 10, color: 'rgba(255,60,40,1)', a: 0.14 });
  }
  function grass(t, a = 1) { // swaying foreground grass for parallax depth
    const c = G.ctx; c.save(); c.strokeStyle = 'rgba(18,10,16,' + (0.9 * a) + ')'; c.lineCap = 'round';
    for (let i = 0; i < 70; i++) { const x = hash(i, 51) * (W + 80) - 40, h = 30 + hash(i, 52) * 70, sw = Math.sin(t * 1.6 + i * 0.7) * 8 * (h / 100); c.lineWidth = 2 + hash(i, 53) * 3; c.beginPath(); c.moveTo(x, H + 4); c.quadraticCurveTo(x + sw * 0.4, H - h * 0.5, x + sw, H - h); c.stroke(); }
    c.restore();
  }
  function inkPanel(t, lt, d, nm, o = {}) {
    G.paper();
    const z = lerp(1.0, 1.08, clamp(lt / d)), c = G.ctx;
    const pose = P.generic(t, {}), fx = { duo: ['#1d1412', '#ffffff'], comp: 'multiply', a: ease.out(inv(0, 1.2, lt)) };
    if (o.cut) R.draw(nm, { x: o.cx, y: o.cy, ax: o.ax, ay: o.ay, sc: o.sc * z }, nm === 'sieg' ? P.sieg(t, {}) : pose, fx);
    else R.cover(nm, o.x ?? 240, o.y ?? 40, o.w ?? 800, o.h ?? 640, o.fx ?? 0.5, o.fy ?? 0.45, z * 1.04, pose, fx);
    if (!o.cut) { // feather the print into the paper
      const x = o.x ?? 240, y = o.y ?? 40, w = o.w ?? 800, h = o.h ?? 640, f = 70, Pp = 'rgba(233,224,207,', g2 = (x0, y0, x1, y1) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, Pp + '1)'); gr.addColorStop(1, Pp + '0)'); return gr; };
      c.fillStyle = g2(x, 0, x + f, 0); c.fillRect(x - 2, y - 2, f, h + 4); c.fillStyle = g2(x + w, 0, x + w - f, 0); c.fillRect(x + w - f, y - 2, f + 2, h + 4);
      c.fillStyle = g2(0, y, 0, y + f); c.fillRect(x - 2, y - 2, w + 4, f); c.fillStyle = g2(0, y + h, 0, y + h - f); c.fillRect(x - 2, y + h - f, w + 4, f + 2);
    }
    if (o.red) G.inkStroke(o.red, ease.out(inv(0.4, 2.2, lt)), 9, 'rgba(170,18,28,0.85)');
    if (o.label) G.txt(o.label, 1180, 90, { font: '400 26px ' + G.FONT.jp, fill: 'rgba(150,20,28,0.75)', align: 'right', a: inv(0.8, 1.8, lt) });
    POST.set({ bloom: 0.15, vig: 0.5, sat: 1 });
  }
  function earthPOV(t, cam, o) { G.earth(t, cam, o); G.rain(t, { n: 280, a: 0.32, seed: 1 }); G.splashes(t, { n: 46 }); POST.set({ lift: [0.02, 0.03, 0.06], gain: [0.95, 1, 1.08], sat: 1.0, bloom: 0.7, thr: 0.55 }); }
  const focusCam = (wx, wy, sx, sy, z, d = 0.5) => { const zl = 1 + (z - 1) * d; return { x: ((wx - W / 2) * zl - (sx - W / 2)) / d, y: ((wy - H / 2) * zl - (sy - H / 2)) / d, z }; };
  const mixCam = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) });
  function silGirl(x, y, s, rot, a = 1) {
    const c = G.ctx; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#050407';
    c.beginPath(); c.arc(0, -40, 9, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-8, -45); c.lineTo(-7, -58); c.lineTo(-2, -48); c.fill(); c.beginPath(); c.moveTo(8, -45); c.lineTo(7, -58); c.lineTo(2, -48); c.fill();
    c.fillRect(-7, -32, 14, 22); c.fillRect(-8, -12, 7, 20); c.fillRect(1, -12, 7, 20); c.fillRect(-12, -30, 4, 16); c.fillRect(8, -30, 4, 16);
    c.lineWidth = 3; c.strokeStyle = '#050407'; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(18, -8 + Math.sin(x) * 4, 16, -26); c.stroke();
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,60,60,0.5)'; c.lineWidth = 1; c.beginPath(); c.arc(0, -40, 9, -2, 0.5); c.stroke(); c.restore();
  }
  let posterC = null;
  function buildPoster() {
    const sc = 2, pw = 320, ph = 450; posterC = G.canvas(pw * sc, ph * sc); const g = posterC.getContext('2d'); g.scale(sc, sc);
    g.fillStyle = '#efece4'; g.fillRect(0, 0, pw, ph); g.fillStyle = '#b3141d'; g.fillRect(0, 0, pw, 86);
    g.fillStyle = '#fff'; g.font = '400 52px ' + G.FONT.jp; g.textAlign = 'center'; g.fillText('行方不明', pw / 2, 58);
    g.font = '700 13px ' + G.FONT.sub; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillText('MISSING PERSON', pw / 2, 78); if ('letterSpacing' in g) g.letterSpacing = '0px';
    const a = G.A.haruki; g.save(); g.fillStyle = '#222'; g.fillRect(85, 102, 150, 172); g.beginPath(); g.rect(90, 107, 140, 162); g.clip(); g.fillStyle = '#d8d4cc'; g.fillRect(90, 107, 140, 162);
    g.drawImage(a.img, (330 - a.ox) * a.s, (20 - a.oy) * a.s, 210 * a.s, 245 * a.s, 90, 107, 140, 162);
    g.globalCompositeOperation = 'saturation'; g.fillStyle = '#000'; g.fillRect(90, 107, 140, 162); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#d9ccb4'; g.fillRect(90, 107, 140, 162); g.restore();
    g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.font = '400 24px ' + G.FONT.jp; g.fillText('新庄 春樹（16）', pw / 2, 306);
    g.font = '700 12px ' + G.FONT.sub; g.fillText('SHINJO HARUKI, 16', pw / 2, 324); g.font = '400 12px ' + G.FONT.jp; g.fillText('2024年11月9日 第4踏切付近で目撃', pw / 2, 352);
    g.font = '500 11px ' + G.FONT.sub; g.fillStyle = '#333'; g.fillText('Last seen Nov. 9, 2024 near Crossing No. 4', pw / 2, 368);
    g.font = '400 12px ' + G.FONT.jp; g.fillStyle = '#1b1b1b'; g.fillText('心当たりの方は練馬警察署まで', pw / 2, 396); g.font = '500 11px ' + G.FONT.sub; g.fillStyle = '#333'; g.fillText('Any information: Nerima Police Station', pw / 2, 412);
    const Rr = G.rng(5); g.fillStyle = 'rgba(80,60,40,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(Rr() * pw, 86 + Rr() * (ph - 86), 2 + Rr() * 4, 30 + Rr() * 90);
    g.fillStyle = 'rgba(255,255,255,0.4)'; [[6, 6], [pw - 46, 6], [6, ph - 22], [pw - 46, ph - 22]].forEach(([x, y]) => g.fillRect(x, y, 40, 14));
  }
  function posterShot(t, lt, d) {
    if (!posterC) buildPoster();
    const c = G.ctx, z = lerp(1.0, 1.18, ease.io(clamp(lt / d))), py = lerp(0, -40, ease.io(clamp(lt / d)));
    G.vgrad([[0, '#070912'], [1, '#14121c']]); bokeh(t, EARTH_BOKEH, 0.9);
    c.save(); c.translate(W / 2, H / 2 + py); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const pg = c.createLinearGradient(470, 0, 810, 0); pg.addColorStop(0, '#0d1110'); pg.addColorStop(0.35, '#3a4440'); pg.addColorStop(0.6, '#26302d'); pg.addColorStop(1, '#090b0b'); c.fillStyle = pg; c.fillRect(470, -100, 340, H + 200);
    for (let y = -100; y < H + 100; y += 90) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(470, y, 340, 6); }
    c.save(); c.translate(640, 380); c.rotate(-0.025 + Math.sin(t * 0.8) * 0.004); c.drawImage(posterC, -160, -225, 320, 450);
    const sh = c.createLinearGradient(-160, -225, 160, 225); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); sh.addColorStop(0.7, 'rgba(180,200,255,0.10)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = sh; c.fillRect(-160, -225, 320, 450);
    c.strokeStyle = 'rgba(200,215,240,0.35)'; c.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { const x = -150 + hash(i, 3) * 300, sp = 30 + hash(i, 4) * 50, y0 = -225 + ((t * sp + hash(i, 5) * 450) % 450); c.beginPath(); c.moveTo(x, y0 - 40); c.lineTo(x + 1, y0); c.stroke(); c.fillStyle = 'rgba(220,230,255,0.6)'; c.beginPath(); c.arc(x + 1, y0, 2.2, 0, 7); c.fill(); }
    c.restore(); c.restore();
    G.rain(t, { n: 90, a: 0.3, len: 60, speed: 1900, seed: 8, lw: 1.6 });
  }
  function catClose(t, lt, d, pose) {
    const c = G.ctx, z = lerp(1, 1.06, clamp(lt / d));
    G.vgrad([[0, '#06070d'], [0.55, '#0e1220'], [1, '#05060a']]); bokeh(t, [[980, 200, 220, 'rgba(170,200,255,0.5)'], [260, 180, 120, 'rgba(255,190,120,0.25)'], [620, 120, 80, 'rgba(255,255,255,0.15)']]);
    c.save(); zoomAt(W / 2, H / 2, z);
    const gg = c.createLinearGradient(0, 470, 0, H); gg.addColorStop(0, '#11131b'); gg.addColorStop(1, '#07080c'); c.fillStyle = gg; c.fillRect(-100, 470, W + 200, 400);
    G.radial(900, 520, 380, 'rgba(150,180,255,0.18)', 'rgba(0,0,0,0)', 1, 'lighter');
    c.fillStyle = '#c9ccd4'; c.beginPath(); c.ellipse(560, 600, 70, 16, 0, 0, 7); c.fill(); c.fillStyle = '#8a7a6a'; c.beginPath(); c.ellipse(560, 596, 52, 9, 0, 0, 7); c.fill();
    G.drawBag(300, 610, 2.2);
    const bob = pose === 'eat' ? Math.abs(Math.sin(t * 5)) * 6 : 0;
    c.save(); c.translate(0, bob); G.drawCat(700, 610 - bob, 3.0, pose, t, '#b8ccff'); c.restore();
    c.save(); c.globalAlpha = 0.25; c.translate(0, 1220); c.scale(1, -1); G.drawCat(700, 610, 3.0, pose, t, '#b8ccff'); c.restore();
    c.restore();
    G.splashes(t, { n: 60, y0: 520, y1: 720, a: 0.5 }); G.rain(t, { n: 160, a: 0.3, len: 34, seed: 2 });
  }

  /* ====================================================================
     COLD OPEN (flash-forward)
     ==================================================================== */
  chapter('Cold open');
  shot(4, (lt, d, t) => { G.fill('#000'); G.motes(t, { n: 40, vy: -25, color: '#ff4a2a', a: 0.6 * inv(0, 2, lt), size: 1.8, seed: 3 }); },
    { say: [[1.0, 'c1']], sfx: [[0.3, (g, w) => S.heartbeat(g, w, 0.55)], [1.6, (g, w) => S.heartbeat(g, w, 0.6)], [2.9, (g, w) => S.heartbeat(g, w, 0.65)]] });
  shot(4.5, alt((lt, d, t) => { eyes(t, lt, d, { mode: 'red', z0: 6.6, z1: 7.4 }); G.fill('#000', 1 - inv(0, 0.6, lt)); }, EP3D.coldEyes), { say: [[0.3, 'c2']], sfx: [[3.6, (g, w) => S.heartbeat(g, w, 0.7)]] });
  shot(7.5, alt((lt, d, t) => {
    const z = lerp(1.0, 1.14, ease.io(lt / d));
    G.barrow(t, { x: 0, y: 0, z }, { mood: 'blood', fogA: 0.6 }); sunShafts(t, 'blood');
    const c = G.ctx; c.save(); zoomAt(W / 2, H / 2, z);
    X.aura(t, { x: 640, y: 470, w: 520, h: 560, n: 80, a: 0.9 });
    TK(t, 640, 1180, 0.62, { wind: 2.6, headR: lerp(0.12, 0, ease.out(inv(1.5, 3.5, lt))), arm: -0.05, axeGlow: 0.8 }, { sil: '#1a0406', silA: 0.7, mul: '#ff6b5b', mulA: 0.5, glow: { c: '#ff2a1a', a: 0.75 + 0.2 * Math.sin(t * 6), r: 28 } });
    c.restore();
    G.motes(t, { n: 120, vy: -90, vx: 20, color: '#ff7a3a', size: 2.4, seed: 5 });
    G.frontFog(t, 0.5, '#ff6a6a');
    G.fill('#000', 1 - inv(0, 0.4, lt));
    POST.set({ bloom: 0.8, thr: 0.52, gain: [1.08, 0.93, 0.92], ca: 0.002 });
  }, EP3D.coldHero), { say: [[2.0, 'c3']], sfx: [[0, (g, w) => S.whoosh(g, w, 1.2, 0.12, 200, 900)], [0.2, (g, w) => S.noiseBed(g, w, 0, 7, { vol: 0.12, bp: 300, q: 0.5, fin: 1, fout: 1, b: 'sfx' })]] });
  shot(2, () => { G.fill('#000'); }, { sfx: [[0, (g, w) => { S.boom(g, w, 0.55); S.shatter(g, w + 0.03, 0.18, 4); }]] });
  at(0, (g, w, off) => { S.pad(g, w, n('D2'), 16.5 - off, { vol: 0.07, cut: 380, att: 2 }); S.pad(g, w, n('A2'), 16.5 - off, { vol: 0.04, cut: 500, att: 3 }); }, 17, true);
  const CO3 = shots[2].t0;
  at(CO3 + 1.4, (g, w) => { S.brass(g, w, n('D3'), 5.5, 0.07); S.brass(g, w, n('A3'), 5.5, 0.05); S.brass(g, w, n('D4'), 5.5, 0.04); S.choir(g, w, n('F4'), 5, 0.035, 1.5); S.taiko(g, w, 0.4); });

  /* ====================================================================
     EARTH — Nerima, Crossing No. 4, 2:14 a.m.
     ==================================================================== */
  chapter('Nerima, 2:14 a.m.');
  const E0 = T;
  shot(10, alt((lt, d, t) => {
    const head = -100 + 1150 * (lt - 0.4), gate = ease.io(inv(7.0, 8.5, lt));
    earthPOV(t, { x: 0, y: 0, z: lerp(1, 1.05, lt / d) }, { lamps: lt < 7.6, gate, cat: 'sit', train: lt > 0.4 && lt < 7 ? { x: head, v: 1150 } : null });
    if (lt > 0.4 && lt < 7) POST.set({ dir: [0.004, 0] });
    G.locationCard(lt - 1.0, 5.2, 'NERIMA, TOKYO', 'Crossing No. 4  ·  2:14 a.m.');
    G.fill('#000', 1 - inv(0, 1.2, lt));
  }, EP3D.earthWide), { say: [[6.4, 'e1']], sfx: [[0.2, (g, w, off) => S.train(g, w, off, 7.4, 0.42), 7.4, true]] });
  for (let k = 0; k * 0.5 < 7.6; k++) at(E0 + k * 0.5, (g, w) => S.kan(g, w, 0.11));
  const CUE_NIGHT = E0 + 8.5;
  shot(7, alt((lt, d, t) => { earthPOV(t, mixCam(focusCam(640, 360, 640, 360, 1.05), focusCam(925, 420, 640, 400, 2.3), ease.io(clamp(lt / 2.2))), { gate: 1, cat: 'sit' }); }, EP3D.earthCat),
    { say: [[0.6, 'e2'], ['+0.8', 'e3']], sfx: [[5.0, (g, w) => S.meow(g, w, 0.045)]] });
  shot(7, (lt, d, t) => posterShot(t, lt, d), { say: [[0.6, 'e4']] });
  shot(7, alt((lt, d, t) => eyes(t, lt, d, { mode: 'earth', z0: 6.3, z1: 6.7 }), EP3D.earthFace), { say: [[0.5, 'e5'], ['+0.6', 'e6']] });
  shot(7, alt((lt, d, t) => catClose(t, lt, d, 'eat'), EP3D.earthFeed), { say: [[0.6, 'e7'], ['+0.7', 'e8']] });
  shot(6, alt((lt, d, t) => earthPOV(t, focusCam(700, 420, 640, 380, lerp(1.25, 1.35, lt / d)), { gate: 1, cat: lt > 1.0 ? 'alert' : 'sit' }), EP3D.earthAlert),
    { say: [[2.4, 'e9']], sfx: [[1.0, (g, w) => S.tone(g, w, 55, 5.5, 0.05, 'sine', 'sfx', 3, 0.5)]] });
  const SKY = T;
  shot(7, alt((lt, d, t) => {
    const p = inv(0.8, 6.2, lt), c = G.ctx;
    G.layer(G.L.eSky, { x: 0, y: -110, z: 1.05 }, 1);
    G.radial(640, 200, 700, 'rgba(255,30,40,' + (0.35 * p).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter');
    c.save(); shake(t, p * 1.5); G.drawCrack(t, p, 0.6 + p); c.restore();
    G.layer(G.L.eMid, { x: 0, y: -300, z: 1.0 }, 1);
    G.rain(t, { n: 200, a: 0.25, seed: 9 });
    POST.set({ bloom: 0.8 + p * 0.6, thr: 0.45, ca: 0.002 + p * 0.002 });
  }, EP3D.earthSky), { say: [[3.9, 'e10']], sfx: [[0.8, (g, w) => S.crackSky(g, w, 6.4, 0.16)]] });
  shot(2.5, alt((lt, d, t) => { eyes(t, lt, d, { mode: 'earth', lamp: Math.floor(t / 0.5) % 2 === 0, z0: 6.6, z1: 8.6 }); POST.set({ radial: 0.03 * lt }); }, EP3D.earthSmash), { sfx: [[0, (g, w) => S.whoosh(g, w, 0.6, 0.18, 400, 2400)]] });
  shot(5.5, alt((lt, d, t) => {
    const open = ease.out(inv(0, 1.2, lt)), c = G.ctx;
    c.save(); shake(t, (1 - inv(0, 2, lt)) * 6 + (lt > 3.6 && lt < 4.1 ? 7 : 0));
    earthPOV(t, { x: 0, y: -20, z: 1.0 }, { lamps: true, gate: 0, cat: 'alert', rift: { open, cx: 640, cy: 150 },
      world: () => { const f = inv(1.0, 3.6, lt); if (lt > 1.0 && lt < 3.6) silGirl(lerp(650, 600, f), lerp(170, 500, f * f), 1.1, f * 9, 1); if (lt >= 3.6) silGirl(600, 506, 1.1, -1.5, 1); } });
    c.restore();
    if (lt > 3.6) X.debris(lt - 3.6, { x: 600, y: 505, n: 14, speed: 300, size: 5, seed: 31, dust: '#6a6a74' });
    POST.set({ bloom: 1.0, thr: 0.45, ca: 0.003 * (1 - inv(0, 2, lt)) + 0.001 });
    if (lt < 0.25) POST.set({ flash: 0.7 * (1 - lt / 0.25), flashCol: [1, 0.3, 0.3] });
  }, EP3D.earthRift), { sfx: [[0, (g, w) => S.riftRoar(g, w, 5, 0.22)], [3.6, (g, w) => S.thud(g, w, 0.5)]] });
  shot(6, alt((lt, d, t) => {
    const land = 3.5, c = G.ctx, f = ease.in(inv(0.4, land, lt)), sq = lt > land ? 1 - 0.12 * Math.exp(-(lt - land) * 9) * Math.cos((lt - land) * 30) : 1;
    c.save(); shake(t, lt > land && lt < land + 0.7 ? 16 * (1 - inv(land, land + 0.7, lt)) : 1.5);
    earthPOV(t, { x: 0, y: -20, z: lerp(1.0, 1.08, lt / d) }, { lamps: true, gate: 0, cat: 'alert', brokenGate: lt > land + 0.1, rift: { open: 1, cx: 640, cy: 150 },
      world: () => {
        silGirl(600, 506, 1.1, -1.5, 1);
        const g = G.ctx; g.save(); if (lt < land) { g.beginPath(); g.rect(-400, 132, W + 800, 2000); g.clip(); }
        SHB(t, 720, lerp(220, 528, f), 0.43, { claw: lt < land ? -0.35 + Math.sin(t * 3) * 0.1 : 0, shieldR: lt < land ? -0.15 : 0, sy: sq, sx: 2 - sq, jaw: lt > land + 0.6 && lt < land + 1.8 ? 0.8 : 0, headR: lt > land + 0.5 ? -0.12 : 0 }, NIGHT);
        g.restore();
        if (lt > land) X.debris(lt - land, { x: 720, y: 528, n: 30, speed: 600, size: 9, seed: 33 });
      } });
    c.restore();
    if (lt > land) X.ring(lt - land, { x: 720, y: 520, r1: 700, dur: 0.6 });
    POST.set({ bloom: 0.9, thr: 0.5 });
  }, EP3D.earthLand), { say: [[4.4, 'e11']], sfx: [[1.0, (g, w) => S.clicks(g, w, 2.2, 40, { vol: 0.12, f0: 900, f1: 2600, q: 3, len: 0.02, seed: 41 })], [3.5, (g, w) => { S.boom(g, w, 0.65); S.clang(g, w + 0.05, 0.12); }], [4.1, (g, w) => S.riftRoar(g, w, 1.5, 0.14)]] });
  shot(5, alt((lt, d, t) => {
    const cam = focusCam(650, 440, 640, 400, lerp(1.6, 1.75, lt / d)), raise = ease.io(inv(0.5, 3.0, lt));
    earthPOV(t, cam, { lamps: true, gate: 0, cat: null, brokenGate: true, rift: { open: 1, cx: 640, cy: 150 },
      world: () => {
        silGirl(600, 506, 1.1, lerp(-1.5, -0.4, inv(0, 2, lt)), 1);
        SHB(t, 720, 528, 0.43, { shieldR: -0.35 * raise, shieldY: -60 * raise, headR: -0.08 }, NIGHT);
        const hl = inv(1.8, 5, lt); G.radial(1400, 430, 200 + hl * 700, 'rgba(255,245,215,' + (hl * 0.9).toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter');
      } });
    POST.set({ bloom: 1.0 + inv(1.8, 5, lt) * 0.8, thr: 0.5 });
  }, EP3D.earthRaise), { say: [[0.3, 'e12'], ['+0.4', 'e13']], sfx: [[2.0, (g, w) => S.horn(g, w, 2.6, 0.12)], [1.8, (g, w, off) => S.train(g, w, off, 9, 0.5), 9, true]] });
  shot(4.5, alt((lt, d, t) => {
    const c = G.ctx, z = lerp(1.4, 2.8, ease.in(clamp(lt / 3.7)));
    c.save(); shake(t, 3 + lt * 2);
    earthPOV(t, focusCam(630, 470, 640, 420, z), { lamps: true, gate: 0, cat: null, brokenGate: true, rift: { open: 1, cx: 640, cy: 150 },
      world: () => { silGirl(600, 506, 1.1, -0.4, 1); G.radial(1300, 430, 900, 'rgba(255,245,215,' + (0.6 + inv(0, 3.7, lt) * 0.4).toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter'); } });
    c.restore();
    SHB(t, 760, lerp(-200, 520, ease.in(inv(2.0, 3.7, lt))), 1.6, { shieldR: lerp(-0.4, 0.2, ease.in(inv(2.0, 3.7, lt))) }, { sil: '#000', silA: 0.9, glow: { c: '#ff2030', a: 0.5, r: 20 } }, 0.8);
    G.dashLines(t, { n: 60, a: 0.35 * inv(0.3, 1, lt), dir: -1 });
    POST.set({ radial: 0.05 + lt * 0.02, bloom: 1.2, thr: 0.45 });
    G.fill('#fff', inv(3.55, 3.8, lt));
  }, EP3D.earthDive), { say: [[0.3, 'e14']], sfx: [[0.2, (g, w) => S.splash(g, w)], [0.48, (g, w) => S.splash(g, w)], [0.76, (g, w) => S.splash(g, w)], [1.02, (g, w) => S.splash(g, w)], [1.28, (g, w) => S.splash(g, w)], [1.52, (g, w) => S.splash(g, w)],
    [2.9, (g, w) => S.whoosh(g, w, 0.8, 0.3, 300, 3000)], [3.72, (g, w) => { S.boom(g, w, 0.7); S.riftRoar(g, w, 2.4, 0.2); }]] });
  const AFTER = T;
  shot(7.5, alt((lt, d, t) => {
    earthPOV(t, { x: 0, y: 0, z: lerp(1.0, 1.03, lt / d) }, { lamps: lt < 3.5, gate: 0, brokenGate: true, cat: 'alert', bag: true, train: lt < 2.6 ? { x: 2600 + lt * 1150, v: 1150 } : null, rift: { open: 1, close: inv(1.2, 5.0, lt), cx: 640, cy: 150 } });
    G.fill('#fff', 1 - inv(0, 0.9, lt)); G.fill('#000', inv(6.3, 7.5, lt));
  }, EP3D.earthAfter));
  for (let tt = SKY + 3.5; tt < AFTER + 3.5; tt += 0.5) at(tt, (g, w) => S.kan(g, w, 0.12));
  at(E0, (g, w, off) => S.noiseBed(g, w, off, T - E0 + 1, { vol: 0.16, hp: 900, lp: 7500, fin: 2.5, fout: 1 }), T - E0 + 1, true);
  at(E0, (g, w, off) => S.noiseBed(g, w, off, T - E0 + 1, { vol: 0.12, brown: true, lp: 600, fin: 2.5, fout: 1 }), T - E0 + 1, true);
  cueNight(CUE_NIGHT, SKY - CUE_NIGHT - 4);

  /* ====================================================================
     OPENING TITLES — 38 bars at 150 BPM
     ==================================================================== */
  chapter('Opening');
  const OP = T, BAR = 1.6, opDur = 38 * BAR;
  const CAST = {
    nemu: { name: 'NEMU', jp: 'ネム', brand: 'NINE LIVES', bg: '#26324d', ac: '#a9c7ff', nm: 'nemu', ax: 520, ay: 260, sc: 1.05, x: 860, y: 470, pose: 'nemu' },
    sieg: { name: 'SIEG VALEN', jp: 'ジーク', brand: 'AFTERIMAGE', bg: '#141f38', ac: '#8fb4ff', nm: 'sieg', ax: 360, ay: 330, sc: 1.0, x: 820, y: 420, pose: 'sieg' },
    rin: { name: 'RIN ASHVEIL', jp: 'リン', brand: 'RED THREAD', bg: '#4a0c16', ac: '#ff6a78', nm: 'rin', ax: 170, ay: 380, sc: 1.05, x: 840, y: 400, pose: 'generic' },
    wick: { name: 'WICK', jp: 'ウィック', brand: 'WILL-O\'-WISP', bg: '#0a2433', ac: '#5fd8ff', nm: 'wick', ax: 470, ay: 760, sc: 0.72, x: 840, y: 450, pose: 'generic' },
    haruki: { name: 'HARUKI SHINJO', jp: 'ハルキ', brand: 'FROZEN HOUR', bg: '#0e1626', ac: '#a8d6ff', nm: 'haruki', ax: 420, ay: 360, sc: 1.0, x: 830, y: 400, pose: 'generic' },
  };
  function opChar(lt, d, c, t, py = 0) {
    const k = ease.out5(inv(0, 0.45, lt)), drift = lt * 10, g = G.ctx;
    G.fill(c.bg);
    g.save(); g.globalAlpha = 0.1; g.fillStyle = '#fff'; for (let i = -10; i < 30; i++) g.fillRect(i * 60 + (lt * 40) % 60, -50, 18, H + 100); g.restore();
    G.txt(c.jp, 330 - drift * 2, 520, { font: '400 300px ' + G.FONT.jp, fill: c.ac, a: 0.16, align: 'center' });
    g.save(); g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.moveTo(560 + (1 - k) * 600, -20); g.lineTo(820 + (1 - k) * 600, -20); g.lineTo(560 + (1 - k) * 600, H + 20); g.lineTo(300 + (1 - k) * 600, H + 20); g.fill(); g.restore();
    const pose = P[c.pose](t, {}); if (c.nm === 'sieg') pose.open = 0;
    R.draw(c.nm, { x: c.x + (1 - k) * 260 - drift, y: c.y, ax: c.ax, ay: c.ay, sc: c.sc * (1 + lt * 0.015) }, pose, { glow: { c: c.ac, a: 0.5, r: 18 } });
    const pk = ease.out5(inv(0.15, 0.7, lt));
    g.save(); g.fillStyle = '#0a0a0c'; g.fillRect(0, 560 + py, 520 * pk, 108); g.fillStyle = c.ac; g.fillRect(0, 560 + py, 520 * pk, 4); g.restore();
    G.txt(c.name, 48, 630 + py, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: pk });
    G.txt('BRAND · ' + c.brand, 50, 655 + py, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: c.ac, ls: 4, a: inv(0.4, 0.9, lt) });
  }
  function opPanel(lt, d, nm, name, sub, bg, ac, fxp, fyp, t, py = 0) {
    const k = ease.out5(inv(0, 0.4, lt)), g = G.ctx; G.fill(bg);
    g.save(); g.beginPath(); g.moveTo(200 + (1 - k) * 900, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(60 + (1 - k) * 900, H); g.closePath(); g.clip();
    R.cover(nm, 60, 0, W - 60, H, fxp, fyp, 1.08 + lt * 0.03, P.generic(t, {}), {}); g.restore();
    g.save(); g.strokeStyle = ac; g.lineWidth = 6; g.beginPath(); g.moveTo(200 + (1 - k) * 900, 0); g.lineTo(60 + (1 - k) * 900, H); g.stroke(); g.restore();
    const gr = g.createLinearGradient(0, 520 + py, 0, 700 + py); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.7)'); g.fillStyle = gr; g.fillRect(0, 520 + py, 700, 200);
    G.txt(name, 48, 640 + py, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, stroke: 'rgba(0,0,0,0.6)', lw: 8, a: inv(0.15, 0.5, lt) });
    G.txt(sub, 50, 666 + py, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: ac, ls: 4, a: inv(0.3, 0.7, lt), stroke: 'rgba(0,0,0,0.6)', lw: 4 });
  }
  const FIENDS = [['shield', 'SKELETAL SHIELDBEARER', 'LESSER FIEND', '#d8cbb8'], ['m_redgiant', 'RED GIANT', 'GREATER FIEND', '#ff5a4a'], ['m_hydra', 'HYDRA OF MARROWMERE', 'GREATER FIEND', '#7fd0e0'],
    ['m_golem', 'STONEHIDE BEHEMOTH', 'GREATER FIEND', '#d9c690'], ['m_plume', 'PLUME OGRE CHIEFTAIN', 'GREATER FIEND', '#8fe0ff'], ['m_wolf', 'KUROZANE, THE FANG RONIN', 'GREATER FIEND', '#ffb0a0'],
    ['m_morvudd', 'MORVUDD', 'CALAMITY', '#b9c4ff'], ['m_tyr', 'TYR, THE FROST TITAN', 'CALAMITY', '#a9ecff']];
  function opFiend(lt, d, i, t) {
    const [nm, name, cls, ac] = FIENDS[i], punch = 1.12 - 0.1 * ease.out5(inv(0, 0.35, lt)), g = G.ctx;
    G.fill('#0b0b0e');
    if (nm === 'shield') SHB(t, 760, 760, 0.62 * punch, { walk: 0.6 }, { duo: ['#0b0b0e', ac] }, 1);
    else R.cover(nm, 300, 0, 980, H, 0.5, 0.42, punch, P.generic(t, {}), { duo: ['#0b0b0e', ac] });
    g.save(); g.fillStyle = 'rgba(11,11,14,0.85)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(420, 0); g.lineTo(300, H); g.lineTo(0, H); g.fill(); g.restore();
    G.txt(cls, 50, 560, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: ac, ls: 5 });
    name.split(', ').forEach((w, k) => G.txt(w, 48, 610 + k * 46, { font: '900 46px ' + G.FONT.disp, align: 'left', ls: 1 }));
    G.txt(String(i + 1).padStart(2, '0') + ' / 08', 50, 80, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: 'rgba(255,255,255,0.5)', ls: 4 });
    if (lt < 0.12) POST.set({ flash: 0.5 * (1 - lt / 0.12), ca: 0.006 });
  }
  shot(opDur, (lt, d, t) => {
    const b = lt / BAR, bi = Math.floor(b), bl = lt - bi * BAR;
    POST.set({ bloom: 0.75, thr: 0.55 });
    if (bi < 2) {
      G.fill('#060507'); const k = ease.out5(inv(0, 0.5, lt)), g = G.ctx;
      g.save(); g.fillStyle = '#e8343c'; g.beginPath(); g.moveTo(-50, 380); g.lineTo(-50 + 1400 * k, 330); g.lineTo(-50 + 1400 * k, 342); g.lineTo(-50, 394); g.fill(); g.restore();
      if (G.twos(lt, 8) % 3 === 0) G.txt('RUINBREAKER', 640, 400, { font: '900 140px ' + G.FONT.disp, fill: 'rgba(244,239,233,0.08)', ls: 20 });
    } else if (bi < 4) {
      const q = Math.floor((lt - 2 * BAR) / (BAR / 2)), ql = (lt - 2 * BAR) % (BAR / 2);
      if (q === 0) { G.fill('#120204'); G.fig('axe', 300, 470, 514, 0, 1.5, { rot: -0.4 + ql * 0.3, glow: { c: '#ff3a2a', a: 0.8, r: 30 } }); }
      else if (q === 1) { G.fill('#0a0003'); R.draw('takuto', { x: 640, y: 360, ax: 405, ay: 222, sc: 6.5 }, P.takuto(t, { blink: 0 }), { mul: '#ff5050', mulA: 0.6 }); }
      else if (q === 2) { G.earth(t, focusCam(380, 246, 640, 360, 3.2), { lamps: true, gate: 0, cat: null }); }
      else { G.fill('#05070e'); G.drawCrack(t, 1, 1.4); }
      if (ql < 0.08) POST.set({ flash: 0.6 * (1 - ql / 0.08) });
    } else if (bi < 12) { const k2 = Math.floor((bi - 4) / 2), keys = ['nemu', 'sieg', 'rin', 'wick']; opChar(lt - (4 + k2 * 2) * BAR, 2 * BAR, CAST[keys[k2]], t); }
    else if (bi === 12) opPanel(lt - 12 * BAR, BAR, 'gideon', 'GIDEON HALLOWAY', 'BRAND · COGWHEEL CORE', '#2a1e10', '#d9a650', 0.5, 0.3, t);
    else if (bi === 13) opPanel(lt - 13 * BAR, BAR, 'valentine', 'VALENTINE & TOFU', 'BRAND · ENCORE', '#2a0a1c', '#ff7ab6', 0.5, 0.5, t);
    else if (bi < 16) opChar(lt - 14 * BAR, 2 * BAR, CAST.haruki, t);
    else if (bi < 24) opFiend(lt - bi * BAR, BAR, bi - 16, t);
    else if (bi < 26) opPanel(lt - 24 * BAR, 2 * BAR, 'lucien', 'LUCIEN AUREL', 'S-RANK · BRAND · SANCTUM', '#2a2008', '#ffd36a', 0.5, 0.3, t);
    else if (bi === 26) opPanel(lt - 26 * BAR, BAR, 'vesper', 'VESPER', 'GUILD EXECUTIONER · WHITE GALE', '#151a26', '#e6f0ff', 0.5, 0.3, t);
    else if (bi === 27) { const l2 = lt - 27 * BAR; G.fill('#050507'); SBL(t, 800, 1240, 0.62 + l2 * 0.02, { hand: Math.sin(t * 3) * 0.1 }, { glow: { c: '#9fb0ff', a: 0.35, r: 14 } }); G.txt('MR. SABLE', 48, 640, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: inv(0.1, 0.4, l2) }); G.txt('CALAMITY · THE GENTLEMAN OF THE RIFT', 50, 666, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#c8d2ff', ls: 4, a: inv(0.2, 0.6, l2) }); }
    else if (bi < 30) { const l2 = lt - 28 * BAR; G.fill('#100002'); R.cover('akuro', 0, 0, W, H, 0.5, 0.38, 1.04 + l2 * 0.05, P.generic(t, {}), { a: inv(0, 0.4, l2) }); G.fill('#ff0000', 0.12, 'multiply'); G.txt('AKURO', 48, 640, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, stroke: 'rgba(0,0,0,0.7)', lw: 8 }); G.txt('THE CRIMSON CALAMITY', 50, 666, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#ff6a6a', ls: 4, stroke: 'rgba(0,0,0,0.7)', lw: 4 }); POST.set({ bloom: 1.1, thr: 0.45 }); }
    else if (bi < 34) {
      const l2 = lt - 30 * BAR, z = lerp(0.52, 0.58, l2 / (4 * BAR));
      G.vgrad([[0, '#0a0103'], [1, '#3a0508']]);
      G.focusLines(640, 330, t, { a: 0.12 + (bl < 0.15 ? 0.25 : 0), color: '#ff5050', inner: 260 });
      X.aura(t, { x: 640, y: 420, w: 500, h: 600, n: 90 });
      TK(t, 640, 360 + 1535 * z * 0.75, z, { wind: 2.5, arm: -0.1 + Math.sin(t * 2) * 0.05, axeGlow: 0.9 }, { glow: { c: '#ff2a1a', a: 0.6 + 0.25 * Math.sin(t * 8), r: 24 } });
      G.motes(t, { n: 80, vy: -110, vx: 20, color: '#ff7a3a', size: 2.4, seed: 7 });
      const pk = ease.out5(inv(0.3, 1.0, l2)), g = G.ctx; g.save(); g.fillStyle = '#0a0a0c'; g.fillRect(0, 560, 560 * pk, 108); g.fillStyle = '#ff3a3a'; g.fillRect(0, 560, 560 * pk, 4); g.restore();
      G.txt('TAKUTO KIRISHIMA', 48, 630, { font: '900 58px ' + G.FONT.disp, align: 'left', ls: 2, a: pk }); G.txt('BRAND · RUINBREAKER', 50, 655, { font: '700 14px ' + G.FONT.sub, align: 'left', fill: '#ff6a6a', ls: 4, a: inv(0.6, 1.2, l2) });
      POST.set({ bloom: 1.2, thr: 0.45, ca: bl < 0.1 ? 0.006 : 0.002 });
    } else {
      const l2 = lt - 34 * BAR; G.fill('#060507'); G.motes(t, { n: 60, vy: -40, color: '#ff4a2a', size: 2, seed: 8, a: 0.6 });
      G.logo(640, 380, 1, inv(0, 2.2, l2)); if (bi >= 36) POST.set({ flash: 0.7 * (1 - inv(36 * BAR, 36 * BAR + 0.3, lt)) }); G.fill('#000', inv(opDur - 0.8, opDur, lt));
    }
  });
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
  }, { vig: false, sfx: [[0.6, (g, w) => S.kan(g, w, 0.09)], [1.1, (g, w) => S.kan(g, w, 0.07)]] });

  /* ====================================================================
     PART A — The Barrow Fields
     ==================================================================== */
  chapter('Part A');
  const PA = T;
  shot(8, alt((lt, d, t) => { const k = ease.io(clamp(lt / d)); G.barrow(t, { x: 0, y: lerp(-240, -40, k), z: 1.1 }, { fogA: 0.4 }); sunShafts(t); G.fill('#000', 1 - inv(0.2, 2.5, lt)); POST.set({ bloom: 0.8, thr: 0.5 }); }, EP3D.barrowOpen),
    { say: [[3.2, 'a1']], sfx: [[0.2, (g, w) => S.piano(g, w, n('A5'), 0.5, 0.2)]] });
  shot(4, alt((lt, d, t) => { eyes(t, lt, d, { mode: 'dusk', z0: 6.0, z1: 6.3, open: ease.out(inv(0.3, 1.6, lt)) }); G.fill('#000', 0.6 * (1 - inv(0, 1.2, lt))); }, EP3D.barrowWake), { say: [[1.5, 'a2']] });
  shot(6, alt((lt, d, t) => {
    G.barrow(t, { x: -300, y: 60, z: 1.6 }, { fogA: 0.5 }); G.fill('#2a1020', 0.35);
    const sc = lerp(3.0, 3.25, lt / d), place = { x: 600, y: 400, ax: 112, ay: 452, sc }, pose = P.takuto(t, { arm: 0.02 * Math.sin(t * 5) * inv(0, 2, lt) });
    const grip = R.point('takuto', place, pose, 118, 455); G.fig('axe', grip[0], grip[1], 0, 0, sc, { ...DUSK, rot: -0.5009 + pose.bones.armR.r });
    R.draw('takuto', place, pose, DUSK);
  }, EP3D.barrowHand), { say: [[0.8, 'a3']] });
  shot(9, alt((lt, d, t) => { // he stands up and looks around
    const z = lerp(1.0, 1.06, ease.io(lt / d)), rise = ease.out(inv(0.2, 2.2, lt)), look = lt > 2.4 ? Math.sin((lt - 2.4) * 1.6) * 0.22 : 0;
    G.barrow(t, { x: 0, y: 0, z }, { fogA: 0.45 }); sunShafts(t);
    const c = G.ctx; c.save(); zoomAt(W / 2, H / 2, z);
    TK(t, 480, lerp(1150, 920, rise), 0.48, { headR: look, chestR: lerp(0.2, 0, rise), legPose: [{ spread: lerp(0.5, 0.07, rise), lift: lerp(0.8, 0, rise) }, { spread: lerp(0.3, 0.1, rise), lift: lerp(0.5, 0, rise) }] }, DUSK);
    c.restore();
    G.frontFog(t, 0.45); grass(t);
    G.locationCard(lt - 0.8, 5.8, 'THE BARROW FIELDS', 'Ashen March frontier  ·  dusk');
  }, EP3D.barrowRise), { say: [[5.2, 'a4']] });
  shot(8, alt((lt, d, t) => {
    G.barrow(t, { x: 160, y: 0, z: 1.12 }, { fogA: 0.45 }); sunShafts(t);
    const rise = ease.out(inv(0, 1.4, lt)), yawn = lt < 3 ? Math.sin(Math.min(1, lt / 3) * Math.PI) : 0;
    NM(t, 760, lerp(1260, 1110, rise), 0.92, { yawn, armUp: -0.12 * yawn, tail: 0.3 * Math.sin(t * 2), ears: -0.2 * yawn }, DUSK);
    G.frontFog(t, 0.4); grass(t);
  }, EP3D.nemuWake), { say: [[0.6, 'a5'], ['+0.6', 'a6']], sfx: [[0.4, (g, w) => { S.pluck(g, w, n('F5'), 0.08); S.pluck(g, w + 0.18, n('A5'), 0.07); S.pluck(g, w + 0.36, n('C6'), 0.06); }]] });
  shot(9, alt((lt, d, t) => twoShot(t, lt, d), EP3D.twoShot), { say: [[0.5, 'a9'], ['+0.5', 'a10'], ['+0.4', 'a11']] });
  shot(7, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.06, camx: 40 }), EP3D.otsNemu), { say: [[0.2, 'a12'], ['+0.5', 'a13']] });
  shot(6.5, alt((lt, d, t) => {
    if (lt < 1.4) { G.fill('#f4efe9'); G.focusLines(640, 360, t, { color: '#1a1a1a', a: 0.25, inner: 200 }); const bo = 1 + 0.08 * Math.abs(Math.sin(lt * 9)); R.draw('nemu_gg', { x: 640, y: 420, ax: 325, ay: 420, sc: 5.2 * bo }, P.generic(t, {}), {}); }
    else nemuClose(t, lt, d, { sc0: 1.6, sc1: 1.66, pose: { ears: 0.25, headR: 0.08 } });
  }, (lt, d, t, f2) => lt < 1.4 ? f2(lt, d, t) : EP3D.nmClose({ d0: 0.85, opts: { ears: 0.25 } })(lt, d, t)), { say: [[1.5, 'a16'], ['+0.4', 'a17']], sfx: [[0.05, (g, w) => S.ui(g, w, 0.06)]] });
  shot(8, alt((lt, d, t) => { G.barrow(t, { x: -100, y: 20, z: 1.2 }, { fogA: 0.45 }); sunShafts(t); TK(t, 560, lerp(1300, 1320, lt / d), 0.72, { lookBias: 0.6, arm: lt > 0.5 && lt < 2.5 ? -0.12 * Math.sin((lt - 0.5) / 2 * Math.PI) : 0, headR: 0.04 }, DUSK); G.frontFog(t, 0.35); grass(t); }, EP3D.tkAxe),
    { say: [[0.3, 'a18'], ['+0.5', 'a19']] });
  shot(8, alt((lt, d, t) => { const k = ease.io(clamp(lt / d)); G.barrow(t, { x: lerp(300, 380, k), y: lerp(160, 190, k), z: 1.5 }, { fogA: 0.5 }); G.radial(770, 520, 200, 'rgba(255,180,120,0.12)', 'rgba(0,0,0,0)', 1, 'lighter'); X.shafts(t, { x: 900, y: -100, ang: 1.9, spread: 0.4, n: 4, a: 0.12 }); }, EP3D.headsmanGrave),
    { say: [[0.3, 'a20'], ['+0.5', 'a21']] });
  shot(4, alt((lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.3, z1: 6.4 }), EP3D.tkClose({ locked: true, d0: 0.8, still: true })), { say: [[0.9, 'a22']] });
  shot(4, (lt, d, t) => {
    G.fill('#cfe0ff'); G.focusLines(640, 360, t, { color: '#ffffff', a: 0.8, inner: 180 });
    const c = G.ctx, sq = 1 + 0.1 * Math.sin(lt * 18) * Math.exp(-lt * 1.2); c.save(); shake(t, 4, 20);
    R.draw('nemu_chibi', { x: 640, y: 560, ax: 135, ay: 350, sc: 2.7 }, { t, bones: { head: { sx: 2 - sq, sy: sq, r: 0.06 * Math.sin(lt * 14) } } }, {});
    for (let i = 0; i < 2; i++) for (let k = 0; k < 6; k++) { const ph = ((lt * 2.4 + k / 6) % 1), x = 640 + (i ? 70 : -95) + (i ? 1 : -1) * ph * 160, y = 350 + ph * ph * 260; c.fillStyle = 'rgba(255,255,255,' + (1 - ph) + ')'; c.beginPath(); c.ellipse(x, y, 9, 14, 0, 0, 7); c.fill(); }
    c.restore();
  }, { say: [[0.3, 'a23']], sfx: [[0.2, (g, w) => { S.whoosh(g, w, 0.25, 0.15, 800, 3000); S.pluck(g, w + 0.05, n('D6'), 0.06); S.pluck(g, w + 0.12, n('A5'), 0.06); }]] });
  shot(8, (lt, d, t) => inkPanel(t, lt, d, 'm_morvudd', { x: 230, y: 30, w: 820, h: 660, fy: 0.4, red: [[120, 120], [400, 90], [700, 130], [1160, 100]], label: '亀裂' }), { say: [[0.5, 'a24'], ['+0.5', 'a25']], sfx: [[0.3, (g, w) => S.whoosh(g, w, 0.9, 0.08, 200, 700)]] });
  shot(8, (lt, d, t) => inkPanel(t, lt, d, 'm_redgiant', { x: 200, y: 20, w: 880, h: 680, fy: 0.35, label: '魔物' }), { say: [[0.3, 'a26'], ['+0.5', 'a27']] });
  shot(10, (lt, d, t) => { G.paper(); G.sigilAxe(640, 340, 190, inv(0.4, 5, lt), t, '#a3121b', 0.9); G.txt('烙印', 1180, 90, { font: '400 26px ' + G.FONT.jp, fill: 'rgba(150,20,28,0.75)', align: 'right', a: inv(1, 2, lt) }); POST.set({ bloom: 0.2, vig: 0.5 }); },
    { say: [[0.5, 'a28'], ['+0.6', 'a29']], sfx: [[0.5, (g, w) => S.riser(g, w, 4.4, 0.05)]] });
  shot(6, (lt, d, t) => inkPanel(t, lt, d, 'sieg', { cut: true, cx: 640, cy: 760, ax: 370, ay: 899, sc: 0.78, label: '狩人' }), { say: [[0.3, 'a30']] });
  shot(6, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.02 }), (lt, d, t) => EP3D.twoShot(lt, d, t, { push: 0.02, ang: 0.55 })), { say: [[0.3, 'a31'], ['+0.4', 'a32']] });
  shot(8, alt((lt, d, t) => {
    nemuClose(t, lt, d, { sc0: 1.35, sc1: 1.42, ay: 330, pose: { armM: 0.18 * inv(0.3, 1, lt), headR: -0.06 } });
    G.sigilPaw(380, 330, 110, 3, 9, ease.out(inv(0.6, 2, lt)), 0.95); G.radial(380, 330, 220, 'rgba(140,200,255,0.25)', 'rgba(0,0,0,0)', inv(0.6, 2, lt), 'lighter');
    POST.set({ bloom: 0.9, thr: 0.5 });
  }, EP3D.nemuSigil), { say: [[0.3, 'a33'], ['+0.5', 'a34']], sfx: [[0.6, (g, w) => { S.bell(g, w, n('A5'), 0.05); S.bell(g, w + 0.2, n('E6'), 0.04); }]] });
  shot(5, alt((lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.5, z1: 6.9 }), EP3D.tkClose({ d0: 0.75, ang: -0.3 })), { say: [[0.3, 'a35'], ['+0.4', 'a36']] });
  shot(10, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.05, camx: -30, nm: { ears: -0.25 } }), (lt, d, t) => EP3D.twoShot(lt, d, t, { push: 0.05, ang: -0.3, arc: 0.3, ears: -0.25 })), { say: [[0.3, 'a39'], ['+0.5', 'a40']] });
  shot(8, alt((lt, d, t) => { G.barrow(t, { x: 0, y: -200, z: 1.15 }, { fogA: 0.3, rift: { open: 0.04, cx: 640, cy: 200, w: 300, h: 60 } }); G.fill('#200810', 0.15); }, EP3D.riftThin), { say: [[0.3, 'a41'], ['+0.5', 'a42']] });
  const BELLS = T;
  shot(8, alt((lt, d, t) => {
    G.barrow(t, { x: 0, y: 0, z: lerp(1.0, 1.05, lt / d) }, { fogA: lerp(0.45, 0.8, lt / d) });
    const c = G.ctx, turn = ease.io(inv(0.6, 1.6, lt)) * 0.25; c.save(); zoomAt(W / 2, H / 2, 1.02);
    TK(t, 330, 1150, 0.66, { headR: -turn, headX: -turn * 20 }, DUSK); NM(t, 940, 1100, 0.92, { headR: -turn * 1.2, ears: 0.35 * turn * 4 }, DUSK); c.restore();
    G.frontFog(t, lerp(0.4, 0.75, lt / d)); grass(t);
  }, EP3D.bellsTurn), { say: [[2.0, 'a43'], ['+0.5', 'a44']] });
  [0.8, 1.3, 3.0, 3.5, 5.6, 6.1].forEach(o => at(BELLS + o, (g, w) => S.kan(g, w, 0.04)));
  shot(7, alt((lt, d, t) => {
    const c = G.ctx, rise = ease.out(inv(0.6, 6.5, lt));
    c.save(); shake(t, 2 + lt * 0.6);
    G.barrow(t, { x: 120, y: 60, z: 1.3 }, { fogA: 0.7 }); G.fill('#140812', 0.25);
    SHB(t, 720, lerp(1550, 1120, rise), 0.95, { headR: lerp(0.3, -0.05, rise), claw: -0.4 * (1 - rise), jaw: lt > 6.0 ? 0.9 : 0 }, { mul: '#9a7f86', mulA: 0.8, glow: { c: '#ff6a5a', a: 0.25, r: 14 } }, inv(5.6, 6.2, lt));
    G.frontFog(t, 0.85, '#d9a8b0', 470, 50);
    c.restore();
    if (lt > 6.0) { X.ring(lt - 6.0, { x: 720, y: 330, r1: 800, dur: 0.7, flat: 0.8 }); POST.set({ ca: 0.006 * (1 - inv(6, 6.8, lt)) }); }
  }, EP3D.sbRise), { sfx: [[0.5, (g, w) => S.noiseBed(g, w, 0, 6.5, { vol: 0.2, brown: true, lp: 140, fin: 1, fout: 0.3, b: 'sfx' })], [1.5, (g, w) => S.clicks(g, w, 4, 70, { vol: 0.16, f0: 900, f1: 2800, q: 4, len: 0.02, seed: 51 })], [6.0, (g, w) => { S.boom(g, w, 0.45); S.riftRoar(g, w, 1.8, 0.22); S.brass(g, w, n('D2'), 1.4, 0.09); S.brass(g, w, n('Eb2'), 1.4, 0.07); }]] });
  cueOther(PA + 1, BELLS - PA - 2);
  cueTension(BELLS + 2, 11);

  /* ====================================================================
     EYECATCH
     ==================================================================== */
  shot(4, (lt, d, t) => {
    G.fill('#efe8df'); const g = G.ctx; g.save(); g.fillStyle = 'rgba(232,52,60,0.10)';
    for (let y = 0; y < H; y += 22) for (let x = (y / 22 % 2) * 11; x < W; x += 22) { g.beginPath(); g.arc(x, y, 4 + 3 * Math.sin(x * 0.01 + lt), 0, 7); g.fill(); } g.restore();
    NM(t, 900, 1080, 0.82, { yawn: 0.6 + 0.4 * Math.sin(lt * 2), tail: Math.sin(t * 3) * 0.4 }, {});
    G.logo(470, 380, 0.62, 1, { fill: '#1a1416', sub: '#6a6064' }); POST.set({ bloom: 0.2, vig: 0.15 });
  }, { vig: false, sfx: [[0.1, (g, w) => [n('D5'), n('A5'), n('F5'), n('D6')].forEach((f, i) => S.bell(g, w + i * 0.13, f, 0.07, 1.6))]] });
  shot(4, (lt, d, t) => {
    G.fill('#0b0607'); G.motes(t, { n: 40, vy: -30, color: '#ff4a2a', size: 2, seed: 12 }); X.aura(t, { x: 870, y: 420, w: 420, h: 520, n: 50, a: 0.6 });
    TK(t, 870, 1060, 0.5, { wind: 2 }, { sil: '#000', silA: 0.85, glow: { c: '#ff2a1a', a: 0.6, r: 20 } });
    G.logo(430, 380, 0.62, 1); POST.set({ bloom: 1.0, thr: 0.45 });
  }, { vig: false, sfx: [[0.1, (g, w) => [n('D6'), n('F5'), n('A5'), n('D5')].forEach((f, i) => S.bell(g, w + i * 0.13, f, 0.07, 1.6))]] });


  /* ---------- full-body duel cuts (silhouettes against the sky) ---------- */
  const SIL = rim => ({ sil: '#07030a', silA: 1, glow: { c: rim, a: 0.75, r: 10 } });
  const hitstop = (lt, hits, len = 0.11) => hits.reduce((a, h) => a - Math.max(0, Math.min(lt - h, len)), lt);
  function duelEnd(t, mood) { grass(t, 1); G.motes(t, { n: 50, vy: -30, color: mood === 'blood' ? '#ff5a3a' : '#ffc890', size: 2, seed: 44, a: 0.6 }); }
  /* ====================================================================
     PART B — The Shieldbearer
     ==================================================================== */
  chapter('Part B');
  const PB = T;
  shot(9, alt((lt, d, t) => { // it walks out of the fog
    const c = G.ctx, k = ease.io(clamp(lt / d)), steps = [0.9, 2.3, 3.7, 5.1], stp = steps.reduce((m, s) => Math.max(m, lt > s && lt < s + 0.35 ? 10 * (1 - (lt - s) / 0.35) : 0), 0);
    c.save(); shake(t, stp + (lt > 6.4 && lt < 7.4 ? 8 : 0.6));
    G.barrow(t, { x: 100, y: lerp(120, 0, k), z: 1.2 }, { fogA: 0.6 }); G.fill('#1a0a12', 0.25);
    const walk = lt < 6 ? 1 : 0, sb = SHB(t, 680, lerp(1050, 1100, k), lerp(0.9, 1.0, k), { walk, walkPh: lt * Math.PI / 1.4, jaw: lt > 6.4 && lt < 7.6 ? 1 : 0, headR: lt > 6.4 && lt < 7.6 ? -0.12 : 0 }, { mul: '#a58c92', mulA: 0.75, glow: { c: '#ff6a5a', a: 0.3, r: 14 } });
    steps.forEach(s => X.debris(lt - s, { x: 600 + (steps.indexOf(s) % 2) * 160, y: 690, n: 10, speed: 260, size: 6, seed: 60 + s * 10 }));
    G.frontFog(t, 0.7, '#d9a8b0', 520, 50); c.restore();
    if (lt > 6.4) { X.ring(lt - 6.4, { x: 680, y: 300, r1: 900, dur: 0.8, flat: 0.9 }); POST.set({ ca: 0.008 * (1 - inv(6.4, 7.4, lt)) }); }
    X.holo(lt - 1.2, 4.8, { x: 930, y: 230, w: 540, title: 'FIEND DETECTED', lines: [{ t: 'Skeletal Shieldbearer', big: true }, 'Class: Lesser  ·  Threat ▰▰▱▱▱', { t: 'Its shield has never been broken.', col: '#ffb0b0' }] });
  }, EP3D.sbWalk), { sfx: [[1.0, (g, w) => S.ui(g, w, 0.05)], [0.9, (g, w) => S.step(g, w, 0.5)], [2.3, (g, w) => S.step(g, w, 0.55)], [3.7, (g, w) => S.step(g, w, 0.6)], [5.1, (g, w) => S.step(g, w, 0.62)], [6.4, (g, w) => { S.riftRoar(g, w, 1.6, 0.3); S.boom(g, w, 0.4); }], [0.3, (g, w) => S.clicks(g, w, 1.5, 20, { vol: 0.12, f0: 900, f1: 2600, q: 4, len: 0.02, seed: 61 })]] });
  shot(8, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.04, nm: { ears: -0.35, tail: -0.3 }, tk: { arm: -0.12 } }), EP3D.faceOff), { say: [[0.3, 'b1'], ['+0.4', 'b2'], ['+0.3', 'b3']] });
  shot(5, alt((lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.4, z1: 7.2 }), EP3D.tkVow), { say: [[0.5, 'b4']] });
  const FIGHT_T = T;
  shot(4.6, alt((lt, d, t) => { // EXCHANGE 1: sprint, leap, chop, CLANG, flip back
    const hit = 2.42, a = hitstop(lt, [hit]), c = G.ctx;
    const cam = lerp(-40, 60, clamp(a / 3));
    c.save(); shake(t, lt > hit && lt < hit + 0.45 ? 16 * (1 - (lt - hit) / 0.45) : 0.8);
    FIGHT.backdrop(t, { mood: 'dusk', camx: cam });
    const mon = SHB(t, 930 - cam * 0.5, 606, 0.46, { crouch: 0.25, shieldR: a > hit ? 0.1 * Math.exp(-(a - hit) * 7) : 0, headR: -0.05 }, SIL('#ffb07a'), 1);
    let pose;
    if (a < 1.3) pose = { ...FIGHT.run(a * 15), x: lerp(110, 560, a / 1.3), vx: 380 };
    else pose = FIGHT.seq(a, [[1.3, 'ready', { x: 560 }], [1.45, 'crouch', { x: 585 }], [1.75, 'leap', { x: 650, y: -150, vx: 400 }, 'out'], [2.15, 'windup', { x: 740, y: -170 }], [2.42, 'chop', { x: 790, y: -60 }, 'in'], [2.6, 'chop', { x: 780, y: -70 }], [3.15, 'spin', { x: 640, y: -160, rot: -5.6, vx: 500 }, 'out'], [3.5, 'slide', { x: 520, y: 0, rot: -6.28 }, 'in'], [3.9, 'slide', { x: 450, rot: -6.28 }, 'out'], [4.6, 'ready', { x: 440, rot: -6.28 }]]);
    pose.x -= cam * 0.5;
    const k = FIGHT.draw({ x: 0, y: 606, s: 1.3, t, pose, rim: '#ffb07a' });
    if (a < 1.3) [0.2, 0.45, 0.7, 0.95, 1.2].forEach((s0, i) => FIGHT.dust(a - s0, 110 + (s0 / 1.3) * 450 - cam * 0.5, 604, 5, i + 3));
    if (a > 3.5) FIGHT.dust(a - 3.5, 520 - cam * 0.5, 604, 12, 9, Math.PI * 0.1);
    if (lt > hit) { X.sparks(lt - hit, { x: 800 - cam * 0.5, y: 470, n: 70, ang: Math.PI * 1.1, spread: 2.2, speed: 1300 }); X.ring(lt - hit, { x: 800 - cam * 0.5, y: 470, r1: 600, dur: 0.45, flat: 1 }); }
    if (a > 1.9 && a < 2.42) X.slash(a - 1.9, { x: k.grip[0], y: k.grip[1], r: 120, a0: -2.6, a1: 0.6, dur: 0.5, hold: 0.15, w: 34, color: '#ffd0a0', flat: 1 });
    c.restore(); duelEnd(t, 'dusk');
    if (lt > hit && lt < hit + 0.1) { G.impact('inv'); POST.set({ ca: 0.014 }); }
    POST.set({ bloom: 0.9, thr: 0.5, dir: a < 1.3 ? [0.004, 0] : [0, 0] });
  }, EP3D.exchange1), { sfx: [[0.15, (g, w) => [0, 0.26, 0.52, 0.78, 1.04].forEach(o => S.step(g, w + o, 0.12))], [1.45, (g, w) => S.whoosh(g, w, 0.5, 0.2, 200, 1500)], [2.1, (g, w) => S.whoosh(g, w, 0.35, 0.3, 400, 3200)], [2.42, (g, w) => { S.clang(g, w, 0.42); S.boom(g, w, 0.28); }], [2.7, (g, w) => S.whoosh(g, w, 0.5, 0.15, 900, 300)], [3.5, (g, w) => S.noiseBed(g, w, 0, 0.6, { vol: 0.14, bp: 1100, q: 0.8, fin: 0.02, fout: 0.4, b: 'sfx' })]] });
  shot(5, alt((lt, d, t) => {
    const c = G.ctx; c.save(); shake(t, 3 * (1 - inv(0, 1, lt)));
    G.barrow(t, { x: 200, y: 60, z: 1.6 }, { fogA: 0.4 }); G.fill('#1a0a12', 0.3);
    R.draw('shield', { x: 640, y: 360, ax: 590, ay: 640, sc: 1.3 }, P.shield(t, {}), { mul: '#a58c92', mulA: 0.75 });
    const slide = ease.out(inv(0.1, 1.4, lt));
    TK(t, lerp(380, 140, slide), 1420, 0.62, { rot: -0.25 * slide, lean: -0.1, arm: 0.3 * (1 - slide) }, DUSK);
    X.debris(lt - 0.1, { x: lerp(380, 140, slide), y: 700, n: 8, speed: 200, size: 5, seed: 71 });
    c.restore();
  }, EP3D.slideBack), { say: [[0.8, 'b5']], sfx: [[0.3, (g, w) => S.noiseBed(g, w, 0, 1.2, { vol: 0.12, bp: 900, q: 0.8, fin: 0.05, fout: 0.6, b: 'sfx' })]] });
  shot(6, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.06, camx: -60, nm: { ears: -0.4, armUp: -0.2 } }), EP3D.panicPair), { say: [[0.3, 'b6'], ['+0.3', 'b7']] });
  shot(4.6, alt((lt, d, t) => { // EXCHANGE 2: duck the claw, counter, shield bash, launched
    const clang = 2.05, bash = 2.78, a = hitstop(lt, [clang, bash], 0.1), c = G.ctx;
    c.save(); shake(t, (lt > clang && lt < clang + 0.3 ? 10 : 0) + (lt > bash && lt < bash + 0.5 ? 18 * (1 - (lt - bash) / 0.5) : 0.8));
    FIGHT.backdrop(t, { mood: 'dusk', camx: 20 });
    const swipe = ease.in(clamp((a - 1.25) / 0.35)), lunge = ease.in(clamp((a - 2.45) / 0.33)) * (1 - ease.out(clamp((a - 3.3) / 0.8)));
    SHB(t, lerp(900, 820, clamp(a / 1.2)) - lunge * 70, 606, 0.46, { walk: a < 1.2 ? 1 : 0, walkPh: a * 4, claw: lerp(-0.9, 0.8, swipe) * (a < 1.25 ? clamp(a / 1.25) : 1), shieldX: 90 * lunge, shieldS: 1 + 0.1 * lunge, lean: 0.1 * lunge, jaw: a > 2.4 && a < 3.2 ? 1 : 0 }, SIL('#ffb07a'), 1);
    let pose = FIGHT.seq(a, [[0, 'ready', { x: 440 }], [1.15, 'ready', { x: 450 }], [1.32, 'duck', { x: 470 }, 'out'], [1.65, 'duck', { x: 480 }], [1.8, 'crouch', { x: 500 }], [2.05, 'windup', { x: 560, y: -40 }, 'out'], [2.25, 'block', { x: 540 }], [2.78, 'block', { x: 560 }], [3.0, 'hit', { x: 380, y: -110, rot: -2.2, vx: 900 }, 'out'], [3.8, 'hit', { x: -260, y: -60, rot: -7.5, vx: 900 }]]);
    const k = FIGHT.draw({ x: 0, y: 606, s: 1.3, t, pose, rim: '#ffb07a' });
    if (a > 1.32 && a < 1.65) X.slash(a - 1.32, { x: 760, y: 470, r: 200, a0: -2.5, a1: -0.5, dur: 0.18, hold: 0.25, w: 40, color: '#c8b8c0', core: '#ffffff', flat: 0.55, rot: Math.PI });
    if (lt > clang) X.sparks(lt - clang, { x: 640, y: 440, n: 50, ang: -Math.PI * 0.6, spread: 2, speed: 1000 });
    if (lt > bash) { X.ring(lt - bash, { x: 600, y: 460, r1: 700, dur: 0.5, flat: 1 }); X.sparks(lt - bash, { x: 590, y: 470, n: 40, ang: Math.PI, spread: 1.4, speed: 900 }); }
    c.restore(); duelEnd(t, 'dusk');
    if (lt > bash && lt < bash + 0.1) { G.impact('inv'); POST.set({ ca: 0.016 }); }
    POST.set({ bloom: 0.9, thr: 0.5, dir: a > 2.85 && a < 3.6 ? [-0.008, 0] : [0, 0] });
  }, EP3D.exchange2), { sfx: [[0.3, (g, w) => [0, 0.45, 0.9].forEach(o => S.step(g, w + o, 0.55))], [1.25, (g, w) => S.whoosh(g, w, 0.45, 0.32, 1400, 300)], [1.85, (g, w) => S.whoosh(g, w, 0.25, 0.25, 400, 2600)], [2.05, (g, w) => S.clang(g, w, 0.36)], [2.45, (g, w) => S.riftRoar(g, w, 0.8, 0.2)], [2.78, (g, w) => { S.boom(g, w, 0.6); S.clang(g, w, 0.2); }], [2.9, (g, w) => S.whoosh(g, w, 0.9, 0.2, 2000, 200)]] });
  shot(2.6, alt((lt, d, t) => { // crash into a gravestone
    const c = G.ctx, fly = ease.out(clamp(lt / 0.5)); c.save(); shake(t, lt > 0.45 && lt < 1.1 ? 18 * (1 - (lt - 0.45) / 0.65) : 2);
    G.barrow(t, { x: -60, y: 40, z: 1.3 }, { fogA: 0.5 });
    TK(t, lerp(-300, 1060, fly), lerp(1150, 1240, fly), 0.6, { rot: 0.9 + fly * 0.6, arm: 0.5, legPose: [{ lift: 1, spread: 0.4 }, { lift: 0.6, spread: 0.6 }] }, { ...DUSK, smear: lt < 0.5 ? { dx: 260, dy: 0, n: 4, a: 0.4 } : null });
    if (lt > 0.45) { X.debris(lt - 0.45, { x: 1150, y: 560, n: 46, speed: 760, size: 13, seed: 91 }); X.ring(lt - 0.45, { x: 1150, y: 520, r1: 600, dur: 0.5, flat: 0.8 }); }
    c.restore();
    if (lt > 0.45 && lt < 0.55) { G.impact('inv'); POST.set({ ca: 0.014 }); }
  }, EP3D.crash), { sfx: [[0.45, (g, w) => { S.thud(g, w, 0.6); S.clicks(g, w, 0.6, 30, { vol: 0.22, f0: 600, f1: 3000, q: 2, len: 0.03, seed: 81 }); S.boom(g, w, 0.35); }]] });
  shot(7, alt((lt, d, t) => { // dazed POV
    const c = G.ctx, wob = Math.sin(t * 1.3) * 0.02;
    c.save(); c.translate(W / 2, H / 2); c.rotate(-0.12 + wob); c.translate(-W / 2, -H / 2);
    G.barrow(t, { x: 0, y: 80, z: 1.2 }, { fogA: 0.6, mood: 'ash' });
    const adv = ease.io(clamp(lt / d)), sc = lerp(0.9, 1.15, adv), fx = { mul: '#9a8a8e', mulA: 0.7 };
    SHB(t, 680, 1040, sc, { walk: 0.7 }, { ...fx, a: 0.55 }); SHB(t, 710 + Math.sin(t * 2) * 18, 1040, sc, { walk: 0.7 }, { ...fx, a: 0.45 });
    c.restore();
    G.fill('#000', 0.25 + 0.2 * Math.sin(t * 2.4)); POST.set({ vig: 0.8, sat: 0.6, radial: 0.015 + 0.01 * Math.sin(t * 2) });
  }, EP3D.dazed), { say: [[1.0, 'b8']], sfx: [[0, (g, w) => S.tone(g, w, 3950, 6.5, 0.012, 'sine', 'sfx', 0.3, 2)], [0.6, (g, w) => S.heartbeat(g, w, 0.5)], [2.0, (g, w) => S.heartbeat(g, w, 0.5)], [3.4, (g, w) => S.heartbeat(g, w, 0.55)], [4.8, (g, w) => S.heartbeat(g, w, 0.55)], [6.0, (g, w) => S.heartbeat(g, w, 0.6)]] });
  shot(5, alt((lt, d, t) => { // the guillotine
    const c = G.ctx, up = ease.io(inv(0.3, 4, lt));
    c.save(); shake(t, 1.5);
    G.barrow(t, { x: 0, y: -200, z: 1.4 }, { fogA: 0.3 }); G.fill('#2a0a12', 0.3);
    SHB(t, 640, 1450, 1.55, { shieldR: -0.42 * up, shieldY: -90 * up, jaw: up * 0.8, headR: -0.1 * up }, { mul: '#a58c92', mulA: 0.75, glow: { c: '#ff4a3a', a: 0.4, r: 18 } });
    c.restore();
  }, EP3D.guillotine), { sfx: [[0.3, (g, w) => S.riser(g, w, 4.2, 0.08)]] });
  shot(2.6, alt((lt, d, t) => { // Nemu sprints in, full body
    const c = G.ctx; c.save(); shake(t, 1.5);
    FIGHT.backdrop(t, { mood: 'dusk', camx: 0 });
    SHB(t, 880, 606, 0.5, { shieldR: -0.42, shieldY: -90, jaw: 0.8, headR: -0.08 }, SIL('#ffb07a'), 1);
    const run = clamp(lt / 1.6), pose = lt < 1.6 ? { ...FIGHT.run(lt * 17), lean: 0.5, x: lerp(-80, 560, run), vx: 600, tail: 0.8 } : FIGHT.seq(lt, [[1.6, 'nemuDash', { x: 560 }], [1.9, 'nemuThrow', { x: 580 }, 'out'], [2.6, 'nemuThrow', { x: 585 }]]);
    FIGHT.draw({ x: 0, y: 606, s: 0.95, t, pose, style: 'nemu', rim: '#9fd0ff' });
    if (lt < 1.6) FIGHT.afterimages({ x: 0, y: 606, s: 0.95, t, style: 'nemu' }, tt => ({ ...FIGHT.run(tt * 17), lean: 0.5, x: lerp(-80, 560, clamp(tt / 1.6)) }), 3, 0.05, '#7ab8ff');
    if (lt > 1.9) { const f = clamp((lt - 1.9) / 0.6); c.fillStyle = '#07030a'; c.beginPath(); c.arc(lerp(620, 850, f), lerp(470, 360, f) - Math.sin(f * Math.PI) * 60, 7, 0, 7); c.fill(); }
    c.restore(); duelEnd(t, 'dusk'); POST.set({ bloom: 0.9, thr: 0.5, dir: lt < 1.6 ? [0.005, 0] : [0, 0] });
  }, EP3D.nemuSprint), { sfx: [[0.1, (g, w) => [0, 0.22, 0.44, 0.66, 0.88, 1.1, 1.32].forEach(o => S.step(g, w + o, 0.08))], [1.9, (g, w) => S.whoosh(g, w, 0.4, 0.18, 600, 2400)]] });
  shot(5, alt((lt, d, t) => { // Nemu steps in
    G.barrow(t, { x: 100, y: 40, z: 1.25 }, { fogA: 0.45 });
    const k = ease.out5(inv(0, 0.6, lt)), thr = ease.in(inv(2.3, 2.6, lt));
    NM(t, lerp(1500, 780, k), 1210, 1.05, { lean: (1 - k) * -0.2, armM: -0.6 * thr, armUp: -0.3, ears: -0.4, tail: 0.6 }, { ...DUSK, glow: { c: '#9fd0ff', a: 0.25, r: 14 }, smear: k < 1 ? { dx: 300 * (1 - k), dy: 0, n: 4, a: 0.4 } : null });
    if (lt > 2.5) { const f = inv(2.5, 3.2, lt), g = G.ctx; g.save(); g.fillStyle = '#2a2026'; g.beginPath(); g.arc(lerp(700, 200, f), lerp(260, 300, f) - Math.sin(f * Math.PI) * 140, 11, 0, 7); g.fill(); g.restore(); }
    G.frontFog(t, 0.4); grass(t);
  }, EP3D.nemuTaunt), { say: [[0.5, 'b9'], ['+0.3', 'b10']], sfx: [[0.1, (g, w) => S.whoosh(g, w, 0.4, 0.15, 500, 2500)], [3.2, (g, w) => S.clang(g, w, 0.08)]] });
  shot(3, alt((lt, d, t) => { eyes(t, lt, d, { mode: 'dusk', z0: 6.4, z1: 8.0 }); POST.set({ radial: 0.02 * lt }); }, EP3D.tkClose({ pose: EP3D.slumped(), at: {}, d0: 1.1, d1: 0.5, e: 'in', fov: 24, ang: 0.2 })), { say: [[0.3, 'b11']], sfx: [[0, (g, w) => S.whoosh(g, w, 0.5, 0.12, 300, 1600)]] });
  const BLOW = T + 1.0;
  shot(4, alt((lt, d, t) => {
    if (lt < 1.0) {
      const c = G.ctx, f = ease.in(inv(0, 1.0, lt)); c.save(); shake(t, 4);
      G.barrow(t, { x: 100, y: 40, z: 1.25 }, { fogA: 0.45 }); NM(t, 780, 1210, 1.05, { ears: -0.5, armUp: -0.3 }, { ...DUSK, sil: '#000', silA: 0.6 });
      R.draw('shield', { x: 760, y: lerp(-700, 260, f), ax: 590, ay: 360, sc: 1.4 }, P.shield(t, {}), { sil: '#000', silA: 0.85, smear: { dx: 0, dy: 200 * f, n: 4, a: 0.4 } }); c.restore();
    } else { G.fill('#fff'); G.fill('#000', inv(1.4, 4, lt)); }
  }, EP3D.blowDown), { vig: false, sfx: [[1.0, (g, w) => { S.boom(g, w, 0.75); S.tone(g, w + 0.3, 4100, 3.6, 0.02, 'sine', 'sfx', 0.2, 2.5); }]] });
  shot(7, alt((lt, d, t) => { // stillness
    G.barrow(t, { x: 140, y: 120, z: 1.35 }, { fogA: 0.6, mood: 'ash', wisps: false }); G.fill('#000', 0.35);
    NM(t, 640, 600, 0.6, { rot: -1.5, breath: 0, freeze: 2.0, legs: false }, { mul: '#8a8090', mulA: 0.8 });
    G.sigilPaw(640, 330, 70, 3, 9, inv(1.0, 2, lt), 0.9, 2, inv(4.0, 4.6, lt));
    G.fill('#000', 1 - inv(0, 1.2, lt)); POST.set({ sat: 0.5, vig: 0.7 });
  }, EP3D.stillness), { sfx: [[4.0, (g, w) => S.piano(g, w, n('A4'), 2, 0.4, 'music', 0.6)]] });
  shot(10, alt((lt, d, t) => { eyes(t, lt, d, { mode: 'dusk', z0: 6.2, z1: 7.6, glowEyes: 0.35 * inv(4, 10, lt), tremble: inv(3, 10, lt) }); G.fill('#ff0000', 0.25 * inv(3, 10, lt), 'multiply'); }, EP3D.tremble),
    { say: [[0.5, 'b12'], ['+0.6', 'b13'], ['+0.6', 'b14']], sfx: [[1, (g, w) => S.heartbeat(g, w, 0.4)], [3.4, (g, w) => S.heartbeat(g, w, 0.45)], [5.6, (g, w) => S.heartbeat(g, w, 0.5)], [7.6, (g, w) => S.heartbeat(g, w, 0.55)], [9.2, (g, w) => S.heartbeat(g, w, 0.6)]] });
  shot(8, alt((lt, d, t) => { // the world stops
    G.barrow(t, { x: 40, y: 40, z: 1.2 }, { fogA: 0.5, mood: 'still', wisps: false });
    TK(t, 340, 1190, 0.6, { freeze: 3.1, rot: -0.15, legPose: [{ lift: 0.5, spread: 0.3 }, { spread: 0.5 }], axeGlow: 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 5)) * inv(0, 4, lt) }, STILL);
    SHB(t, 900, 1120, 1.0, { freeze: 2.0, shieldR: -0.42, shieldY: -90 }, { mul: '#9a9aa0', mulA: 0.7 }, 0.3);
    G.desat(0.7);
    const c = G.ctx; c.save(); c.translate(0, 220); G.drawCrack(t, inv(1, 7.5, lt), 1.3); c.restore();
    POST.set({ sat: 0.25, con: 1.2, bloom: 0.8, thr: 0.4 });
  }, EP3D.worldStops), { say: [[1.0, 'b15'], ['+0.8', 'b16']], sfx: [[0, (g, w) => S.whoosh(g, w, 1.2, 0.18, 2000, 150)], [1.2, (g, w) => S.heartbeat(g, w, 0.7)], [3.0, (g, w) => S.heartbeat(g, w, 0.7)], [5.0, (g, w) => S.heartbeat(g, w, 0.75)], [6.8, (g, w) => S.heartbeat(g, w, 0.8)]] });
  shot(10, alt((lt, d, t) => { // mindscape
    G.fill('#050000'); G.radial(640, 300, 800, 'rgba(120,0,10,0.9)', 'rgba(0,0,0,0)');
    const amp = V.amp('AKURO', t);
    R.cover('akuro', 0, 0, W, H, 0.52, 0.4, lerp(1.04, 1.22, ease.io(lt / d)), { t, wind: 1 + amp * 2, bones: { body: { sy: 1 + amp * 0.01 } } }, { a: ease.io(inv(0.5, 4, lt)) });
    G.fill('#ff1010', 0.18, 'multiply');
    const c = G.ctx; c.save(); c.translate(0, 300); G.drawCrack(t, 1, 1.2 + amp); c.restore();
    X.converge(t, { x: 640, y: 400, r: 520, n: 60, a: 0.5 + amp });
    if (!D3) TK(t, 250, 1160, 0.42, { wind: 1.5 }, { sil: '#000', silA: 1, glow: { c: '#ff2a1a', a: 0.8, r: 14 } });
    G.motes(t, { n: 70, vy: -50, color: '#ff4a3a', seed: 15, size: 2 });
    POST.set({ bloom: 1.2 + amp, thr: 0.4, ca: 0.003 + amp * 0.006, gain: [1.15, 0.9, 0.9] });
  }, (lt, d, t, f2) => { f2(lt, d, t); EP3D.mindscapeTK(lt, d, t); }), { say: [[0.5, 'b17'], ['+0.5', 'b18'], ['+0.6', 'b19']], sfx: [[0.2, (g, w) => S.noiseBed(g, w, 0, 12, { vol: 0.14, brown: true, lp: 120, fin: 2, fout: 1, b: 'sfx' })]] });
  shot(6, alt((lt, d, t) => eyes(t, lt, d, { mode: 'red', z0: 6.8, z1: 7.4, glowEyes: 0.95 }), EP3D.eyesRed), { say: [[0.5, 'b20'], ['+0.4', 'b21']] });
  const AWAKE = T;
  shot(10.5, alt((lt, d, t) => { // BRAND AWAKENED
    G.vgrad([[0, '#140003'], [1, '#2a0306']]);
    const c = G.ctx, sc = lerp(3.2, 3.6, ease.io(lt / d)), place = { x: 560, y: 400, ax: 112, ay: 452, sc }, pose = P.takuto(t, { arm: Math.sin(t * 30) * 0.004 * (1 - inv(4, 5, lt)) });
    c.save(); shake(t, lt < 1.2 ? 8 * (1 - lt / 1.2) : lt < 4.3 ? 1 + lt * 0.5 : 1);
    const grip = R.point('takuto', place, pose, 118, 455); G.fig('axe', grip[0], grip[1], 0, 0, sc, { mul: '#ff6a6a', mulA: 0.5, rot: -0.5009, glow: { c: '#ff3a2a', a: inv(0.5, 4, lt), r: 40 } });
    R.draw('takuto', place, pose, { mul: '#ff6a6a', mulA: 0.55, a: lt > 5 ? lerp(1, 0.35, inv(5, 6, lt)) : 1 });
    const [sx, sy] = R.point('takuto', place, pose, 125, 448);
    if (lt < 4.4) X.converge(t, { x: sx, y: sy, r: 600, n: 110, a: inv(0, 1.5, lt) });
    G.radial(sx, sy, 380, 'rgba(255,40,20,0.6)', 'rgba(255,0,0,0)', inv(0, 1.5, lt), 'lighter');
    G.sigilAxe(sx, sy, 90, inv(0.4, 4.2, lt), t, '#ff4a3a', 1 - inv(5, 6, lt));
    c.restore();
    G.focusLines(640, 360, t, { a: 0.18, color: '#ff6060', inner: 300 });
    if (lt > 4.3 && lt < 4.6) POST.set({ flash: inv(4.3, 4.6, lt) });
    if (lt > 4.6) {
      POST.set({ flash: 1 - inv(4.6, 5.4, lt) });
      X.aura(t, { x: 640, y: 520, w: 900, h: 500, n: 90, a: 0.6 * inv(4.6, 6, lt) });
      X.holo(lt - 4.8, 5.5, { x: 640, y: 360, w: 820, title: 'BRAND AWAKENED', color: '#ff2a3a', lh: 48, lines: [{ t: 'ルインブレイカー', c: true, huge: true }, { t: 'R U I N B R E A K E R', c: true, big: true, col: '#ffd6d6' }, { t: 'Rank: unreadable', c: true, col: '#ff9a9a' }, { t: 'Whatever it strikes, breaks.', c: true }], cps: 30 });
    }
    POST.set({ bloom: 1.3, thr: 0.4, gain: [1.15, 0.9, 0.88], ca: 0.003 + (lt > 4.3 && lt < 5 ? 0.01 : 0) });
    if (lt > 4.3) X.ring(lt - 4.3, { x: 640, y: 360, r1: 900, dur: 0.8, flat: 1, color: '#ff8a7a' });
  }, EP3D.awaken), { sfx: [[0, (g, w) => { S.boom(g, w, 0.7); S.crash(g, w, 0.12, 'sfx'); }], [0.4, (g, w) => S.riser(g, w, 3.9, 0.12)], [4.3, (g, w) => { S.boom(g, w, 0.85); S.shatter(g, w, 0.12, 9); }], [4.9, (g, w) => S.ui(g, w, 0.06)]] });
  shot(9, alt((lt, d, t) => { // power
    const z = lerp(1.0, 1.12, ease.io(lt / d)), rise = ease.out(inv(0, 2.5, lt));
    G.barrow(t, { x: 0, y: 0, z }, { mood: 'blood', fogA: 0.6 }); sunShafts(t, 'blood');
    const c = G.ctx; c.save(); shake(t, 1.5 + (1 - rise) * 3); zoomAt(W / 2, H / 2, z);
    for (let i = 0; i < 14; i++) { const ph = (t * 0.25 + hash(i, 3)) % 1, x = 200 + hash(i, 4) * 880, y = 700 - ph * 500; c.save(); c.translate(x, y); c.rotate(t * (hash(i, 5) - 0.5) * 2); c.globalAlpha = Math.sin(ph * Math.PI) * 0.9; c.fillStyle = '#2a1418'; const r = 4 + hash(i, 6) * 12; c.fillRect(-r, -r * 0.6, r * 2, r * 1.2); c.restore(); } // stones float up
    X.aura(t, { x: 640, y: 380, w: 560, h: 640, n: 120, a: 0.75 });
    const k = TK(t, 640, lerp(1260, 1180, rise), 0.6, { wind: 3.2, headR: lerp(0.18, 0, rise), headY: lerp(10, 0, rise), arm: lerp(0.2, -0.08, rise), axeGlow: 1, legPose: [{ spread: 0.12 }, { spread: 0.14 }] }, { mul: '#ff9a8a', mulA: 0.55, glow: { c: '#ff2a1a', a: 0.8 + 0.2 * Math.sin(t * 7), r: 30 } });
    [[365, 222], [447, 220]].forEach(([x, y]) => { const [sx, sy] = R.point('takuto', k.place, k.pose, x, y); G.radial(sx, sy, 22, 'rgba(255,70,50,0.95)', 'rgba(255,0,0,0)', 1, 'lighter'); });
    const tip = axeTip(k, 560); for (let i = 0; i < 3; i++) X.bolt(t + i, tip[0], tip[1], tip[0] + (hash(i + G.twos(t, 8), 2) - 0.5) * 300, tip[1] + (hash(i + G.twos(t, 8), 3) - 0.3) * 260, { color: '#ff9a8a', a: 0.7, seed: i * 9 });
    c.restore();
    G.motes(t, { n: 140, vy: -130, vx: 25, color: '#ff7a3a', size: 2.6, seed: 17 }); G.frontFog(t, 0.5, '#ff6a6a');
    POST.set({ bloom: 0.95, thr: 0.52, ca: 0.003, gain: [1.12, 0.9, 0.88], sat: 1.1 });
  }, EP3D.power), { sfx: [[0, (g, w) => S.noiseBed(g, w, 0, 9, { vol: 0.14, brown: true, lp: 220, fin: 0.5, fout: 1, b: 'sfx' })], [0, (g, w) => S.noiseBed(g, w, 0, 9, { vol: 0.08, bp: 700, q: 0.7, fin: 0.5, fout: 1, b: 'sfx' })], [2.0, (g, w) => S.staticBurst(g, w, 2, 0.05)]] });
  shot(5, alt((lt, d, t) => { // it braces
    G.barrow(t, { x: 100, y: 0, z: 1.2 }, { mood: 'blood', fogA: 0.6 });
    const br = ease.out(inv(0.5, 1.5, lt)), c = G.ctx; c.save(); shake(t, lt > 0.5 && lt < 1.2 ? 6 : 1);
    SHB(t, 640 + br * 40, 1010 + br * 20, 0.98, { crouch: br, shieldR: -0.12 * br, shieldX: -30 * br, headR: 0.1 * br, jaw: lt > 2 && lt < 3.4 ? 1 : 0 }, { mul: '#c88a8a', mulA: 0.8, glow: { c: '#ff3a2a', a: 0.4, r: 14 } }, 1);
    c.restore(); G.frontFog(t, 0.6, '#ff6a6a', 520, 60);
    POST.set({ bloom: 1.0, thr: 0.45, gain: [1.15, 0.9, 0.9] });
  }, EP3D.sbBraces), { sfx: [[0.5, (g, w) => { S.step(g, w, 0.6); S.clang(g, w + 0.1, 0.12); }], [2.0, (g, w) => S.riftRoar(g, w, 1.4, 0.25)]] });
  const SWING = T;
  const crackR = G.rng(404), cracks = [];
  for (let i = 0; i < 18; i++) { const a = crackR() * Math.PI * 2, pts = [[590, 700]]; let x = 590, y = 700; for (let k = 0; k < 7; k++) { x += Math.cos(a + (crackR() - 0.5) * 0.9) * (20 + crackR() * 30); y += Math.sin(a + (crackR() - 0.5) * 0.9) * (20 + crackR() * 30); pts.push([x, y]); } cracks.push(pts); }
  const CLIMAX_HIT = 3.85;
  shot(6.6, alt((lt, d, t) => { // THE CLIMAX: vanish, zig-zag, leap over the sweep in slow motion, crescent slash
    const c = G.ctx, H1 = CLIMAX_HIT;
    // time remap: real time until the leap, slow motion over the shield, snap into the strike, hit-stop
    const a = lt < 1.5 ? lt : lt < 3.5 ? 1.5 + (lt - 1.5) * 0.25 : lt < H1 ? 2.0 + (lt - 3.5) * 1.0 : lt < H1 + 0.18 ? 2.35 : 2.35 + (lt - H1 - 0.18);
    c.save(); shake(t, (lt > H1 && lt < H1 + 0.8 ? 24 * (1 - (lt - H1) / 0.8) : 1.2) + (lt < 0.8 ? lt * 2 : 0));
    FIGHT.backdrop(t, { mood: 'blood', camx: lerp(0, 80, clamp(a / 2.4)) });
    const sweep = ease.in(clamp((a - 1.3) / 0.35)), crackP = clamp((lt - H1) / 0.9);
    const mon = SHB(t, 880, 606, 0.5, { crouch: 1, shieldR: -0.1 + sweep * 0.55 * (1 - clamp((a - 2.1) / 0.3)), shieldX: -30 + sweep * -60, headR: a > 2.0 ? -0.2 : 0.05, jaw: a > 1.3 && a < 2.1 ? 1 : 0 }, SIL('#ff6a4a'), 1);
    if (lt > H1) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; cracks.forEach(pp => { const sp = pp.map(([x, y]) => mon.pt(x, y)); c.strokeStyle = 'rgba(255,60,40,0.6)'; c.lineWidth = 8; G.strokePartial(sp, crackP); c.strokeStyle = 'rgba(255,240,220,0.95)'; c.lineWidth = 2.5; G.strokePartial(sp, crackP); }); c.restore(); }
    const keys = [[0, 'crouch', { x: 300 }], [0.7, 'crouch', { x: 300 }], [0.75, 'ready', { x: 520 }, 'out'], [0.95, 'ready', { x: 520 }], [1.0, 'ready', { x: 420 }, 'out'], [1.15, 'ready', { x: 420 }], [1.25, 'crouch', { x: 690 }, 'out'], [1.45, 'crouch', { x: 700 }],
      [1.8, 'leap', { x: 780, y: -230, rot: -1.6, vx: 300 }, 'out'], [2.0, 'windup', { x: 860, y: -300, rot: -6.28 }], [2.35, 'chop', { x: 930, y: -120, rot: -6.28 }, 'in'], [2.6, 'slide', { x: 1060, y: 0, rot: -6.28 }, 'in'], [3.2, 'slide', { x: 1110, rot: -6.28 }, 'out']];
    const vis = !(a > 0.7 && a < 0.75) && !(a > 0.95 && a < 1.0) && !(a > 1.15 && a < 1.25);
    const pose = FIGHT.seq(a, keys);
    X.aura(t, { x: pose.x, y: 470 + pose.y, w: 260, h: 380, n: 50, a: a < 2.6 ? 0.9 : 0.4 });
    FIGHT.afterimages({ x: 0, y: 606, s: 1.3, t: a }, tt => FIGHT.seq(tt, keys), a > 1.45 && a < 2.4 ? 5 : 3, a > 1.45 ? 0.06 : 0.04, '#ff2a1a');
    let k = null; if (vis) k = FIGHT.draw({ x: 0, y: 606, s: 1.3, t, pose, rim: '#ff6a4a', axeGlow: 1, glow: a < 2.6 ? 'rgba(255,40,20,0.6)' : null });
    [[0.7, 300, 520], [0.95, 520, 420], [1.15, 420, 690]].forEach(([t0, x0, x1]) => { const f = clamp((a - t0) / 0.12); if (f > 0 && f < 1.6) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,60,40,' + (1 - f / 1.6) + ')'; c.lineWidth = 26 * (1 - f / 1.6); c.beginPath(); c.moveTo(x0, 470); c.lineTo(lerp(x0, x1, Math.min(1, f)), 470); c.stroke(); c.restore(); X.sparks((a - t0) * 4, { x: x0, y: 480, n: 24, ang: -Math.PI / 2, spread: 2.5, speed: 500, color: '#ff6a4a', life: 0.6 }); } });
    if (a > 1.3 && a < 1.9) X.slash(a - 1.3, { x: 860, y: 470, r: 230, a0: -0.6, a1: 2.2, dur: 0.3, hold: 0.3, w: 60, color: '#d0a0a0', core: '#ffffff', flat: 0.4, rot: Math.PI });
    if (lt > 3.5) X.slash(lt - 3.55, { x: 860, y: 300, r: 380, a0: -2.4, a1: 0.95, dur: 0.22, hold: 0.9, w: 130, flat: 0.75, rot: 0.15 });
    if (lt > H1) { X.ring(lt - H1, { x: 880, y: 420, r1: 1300, dur: 0.9, flat: 1, color: '#ffd0c0' }); X.sparks(lt - H1, { x: 880, y: 420, n: 120, ang: -0.4, spread: 3.2, speed: 1700, color: '#ffc29a' }); X.debris(lt - H1, { x: 900, y: 600, n: 46, speed: 1000, size: 13, seed: 99 }); }
    c.restore(); duelEnd(t, 'blood');
    if (lt > H1 && lt < H1 + 0.06) { G.fill('#fff'); POST.set({ ca: 0.02 }); }
    else if (lt > H1 + 0.06 && lt < H1 + 0.12) { G.impact('inv'); POST.set({ ca: 0.02 }); }
    else if (lt > H1 + 0.12 && lt < H1 + 0.18) { G.fill('#000', 0.85); G.ctx.save(); G.ctx.globalCompositeOperation = 'lighter'; G.ctx.strokeStyle = '#ff3a2a'; G.ctx.lineWidth = 14; G.ctx.beginPath(); G.ctx.moveTo(380, -60); G.ctx.lineTo(1100, 900); G.ctx.stroke(); G.ctx.restore(); }
    if (lt > 1.5 && lt < 3.5) POST.set({ sat: 0.6, radial: 0.012, ca: 0.005 });
    POST.set({ bloom: 1.2, thr: 0.45, gain: [1.15, 0.9, 0.88], dir: a < 1.3 && a > 0.7 ? [0.01, 0] : [0, 0] });
  }, (lt, d, t) => EP3D.climax(lt, d, t, CLIMAX_HIT)), { sfx: [[0, (g, w) => S.noiseBed(g, w, 0, 1.5, { vol: 0.12, brown: true, lp: 200, fin: 0.3, fout: 0.3, b: 'sfx' })], [0.7, (g, w) => { S.whoosh(g, w, 0.18, 0.3, 600, 4000); S.boom(g, w, 0.25); }], [0.95, (g, w) => S.whoosh(g, w, 0.15, 0.28, 600, 4000)], [1.15, (g, w) => S.whoosh(g, w, 0.15, 0.3, 600, 4000)], [1.3, (g, w) => { S.riftRoar(g, w, 0.8, 0.25); S.whoosh(g, w, 0.5, 0.35, 1600, 250); }],
    [1.5, (g, w) => { S.tone(g, w, 55, 2.0, 0.09, 'sine', 'sfx', 0.2, 0.2); S.heartbeat(g, w + 0.3, 0.7); S.heartbeat(g, w + 1.3, 0.75); }], [3.5, (g, w) => S.slash(g, w, 0.45)], [3.85, (g, w) => { S.clang(g, w, 0.32); S.boom(g, w, 0.55); S.shatter(g, w + 0.05, 0.14, 7); S.clicks(g, w, 0.9, 50, { vol: 0.18, f0: 2000, f1: 6000, q: 3, len: 0.01, seed: 91 }); }]] });
  const SHATTER = T;
  shot(6.5, alt((lt, d, t) => { // it breaks
    const c = G.ctx, sep = ease.out(inv(0.1, 2.2, lt)), fade = inv(1.4, 3.8, lt), cx = 760, cy = 1080, sc = 1.0;
    c.save(); shake(t, 12 * (1 - inv(0, 1.2, lt)));
    G.barrow(t, { x: 60, y: 30, z: 1.3 }, { mood: 'blood', fogA: 0.5 });
    const sx0 = 380, sy0 = -60, sx1 = 1100, sy1 = 900, nx = 0.78, ny = -0.62;
    [1, -1].forEach(sgn => {
      c.save(); c.beginPath();
      if (sgn > 0) { c.moveTo(sx0 - 1240, sy0 - 1560); c.lineTo(sx1 + 1240, sy1 + 1560); c.lineTo(sx1 + 4000, -3000); }
      else { c.moveTo(sx0 - 1240, sy0 - 1560); c.lineTo(sx1 + 1240, sy1 + 1560); c.lineTo(-3000, 3000); }
      c.closePath(); c.clip(); c.translate(sgn * nx * 70 * sep, sgn * ny * 70 * sep + sep * 30);
      SHB(t, cx, cy, sc, { freeze: 1, crouch: 1, rot: sgn * 0.08 * sep }, { mul: '#c88a8a', mulA: 0.8, a: 1 - fade }, 1 - inv(0, 0.6, lt)); c.restore();
    });
    const s = 1 - inv(0.6, 2.4, lt); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[48, 'rgba(255,30,20,0.25)'], [18, 'rgba(255,60,40,0.6)'], [5, 'rgba(255,245,235,1)']].forEach(([lw, col]) => { c.globalAlpha = s; c.strokeStyle = col; c.lineWidth = lw * (0.6 + s * 0.4); c.beginPath(); c.moveTo(sx0, sy0); c.lineTo(sx1, sy1); c.stroke(); });
    c.restore();
    for (let i = 0; i < 70; i++) {
      const a = hash(i, 3) * Math.PI * 2, v = 300 + hash(i, 4) * 800, x = cx + 120 + Math.cos(a) * v * lt, y = 520 + Math.sin(a) * v * lt + 500 * lt * lt, r = 6 + hash(i, 5) * 22;
      if (y > H + 50) continue;
      c.save(); c.translate(x, y); c.rotate(lt * (hash(i, 6) - 0.5) * 12); c.globalAlpha = 1 - inv(1.2, 2.6, lt); c.fillStyle = hash(i, 7) < 0.5 ? '#6a5a50' : '#3a302c'; c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(r * 0.6, -r); c.lineTo(r, r * 0.5); c.lineTo(-r * 0.2, r); c.fill(); c.strokeStyle = 'rgba(255,200,170,0.5)'; c.stroke(); c.restore();
    }
    c.restore();
    G.motes(t, { n: 180, vy: -40 - 60 * fade, vx: 30, wob: 60, size: 2.6, color: '#2a2224', a: inv(0.8, 2, lt) * (1 - inv(4.5, 6, lt)), glow: false, seed: 23, x0: 500, x1: 1100, y0: 100, y1: 700 });
    G.motes(t, { n: 80, vy: -120, color: '#ff7a3a', size: 2.4, seed: 25 });
    X.ring(lt, { x: 760, y: 420, r1: 1200, dur: 1.0, flat: 1, color: '#ffd0c0' });
    POST.set({ bloom: 1.4, thr: 0.4, flash: 0.8 * (1 - inv(0, 0.3, lt)), gain: [1.15, 0.9, 0.88] });
  }, EP3D.shatter), { say: [[2.6, 'b22']], sfx: [[0, (g, w) => { S.shatter(g, w, 0.28, 12); S.boom(g, w, 0.6); S.slash(g, w, 0.25); }], [1.6, (g, w) => S.clicks(g, w, 2.4, 60, { vol: 0.08, f0: 400, f1: 1500, q: 1.5, len: 0.03, seed: 95 })]] });
  shot(7, alt((lt, d, t) => { // ash like snow
    G.barrow(t, { x: 0, y: 0, z: lerp(1.05, 1.1, lt / d) }, { mood: 'ash', fogA: 0.5 });
    const settle = ease.io(inv(0, 4, lt));
    X.aura(t, { x: 640, y: 420, w: 420, h: 520, n: 60, a: 0.6 * (1 - settle) });
    TK(t, 640, lerp(1180, 1215, settle), 0.56, { arm: lerp(-0.05, 0.28, settle), headR: 0.1 * settle, breath: 2.2, axeGlow: 0.8 * (1 - settle) }, { ...ASH, glow: { c: '#ff2a1a', a: 0.6 * (1 - settle), r: 22 } });
    G.motes(t, { n: 160, vy: 30, vx: 8, wob: 40, size: 2.2, color: '#d9d0d0', a: 0.55, glow: false, seed: 27 }); G.frontFog(t, 0.4, '#d8c8c8'); grass(t);
    POST.set({ sat: 0.75, bloom: 0.6 });
  }, EP3D.ashFall), { sfx: [[0, (g, w, off) => S.noiseBed(g, w, off, 7, { vol: 0.08, bp: 400, q: 0.6, lfo: 0.1, lfoDepth: 150, fin: 1, fout: 1.5 }), 7, true]] });
  const WAKE = T;
  shot(8, alt((lt, d, t) => {
    G.barrow(t, { x: 160, y: 0, z: 1.12 }, { fogA: 0.4, mood: 'ash' }); G.fill('#ffcf9a', 0.12, 'screen');
    const rise = ease.out(inv(0, 1.6, lt)), yawn = lt < 3 ? Math.sin(Math.min(1, lt / 3) * Math.PI) : 0;
    NM(t, 760, lerp(1260, 1110, rise), 0.92, { yawn, armUp: -0.15 * yawn }, ASH); G.frontFog(t, 0.35); grass(t);
  }, (lt, d, t) => EP3D.nemuWake(lt, d, t, { mood: 'ash' })), { say: [[0.5, 'b23'], ['+0.6', 'b24']] });
  shot(10, alt((lt, d, t) => twoShot(t, lt, d, { push: 0.04, mood: 'ash', nm: { tail: 0.3 } }), (lt, d, t) => EP3D.twoShot(lt, d, t, { mood: 'ash', push: 0.04, ang: 0.2 })), { say: [[0.2, 'b25'], ['+0.5', 'b26'], ['+0.4', 'b27']] });
  shot(7, alt((lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.2, z1: 6.4 }), EP3D.tkClose({ d0: 0.8, envOpts: { mood: 'ash' } })), { say: [[0.3, 'b28'], ['+0.6', 'b29']] });
  shot(6, alt((lt, d, t) => nemuClose(t, lt, d, { sc0: 1.5, sc1: 1.56, mood: 'ash', pose: { headR: 0.06, ears: 0.2 } }), EP3D.nmClose({ d0: 0.85, envOpts: { mood: 'ash' }, opts: { ears: 0.2 } })), { say: [[0.3, 'b30'], ['+0.4', 'b31']] });
  shot(7, alt((lt, d, t) => { G.barrow(t, { x: -100, y: 20, z: 1.2 }, { fogA: 0.45, mood: 'ash' }); TK(t, 560, 1300, 0.72, { headR: 0.03, lookBias: 0.6 }, ASH); G.frontFog(t, 0.35); grass(t); }, EP3D.tkClaps),
    { say: [[0.2, 'b32']], sfx: [[3.6, (g, w) => S.clap(g, w)], [4.4, (g, w) => S.clap(g, w)], [5.2, (g, w) => S.clap(g, w)]] });
  const SIEG = T;
  shot(9, alt((lt, d, t) => { // Sieg walks in
    G.barrow(t, { x: 200, y: 0, z: 1.1 }, { fogA: 0.45, mood: 'ash' });
    const k = ease.out(inv(0, 3.2, lt)), walking = 1 - inv(2.6, 3.4, lt);
    SG(t, lerp(1180, 880, k), 1260, 0.62, { walk: walking, headR: lt > 3.4 ? 0.04 : 0, lookBias: -0.7 }, { ...ASH, glow: { c: '#9fc0ff', a: 0.3, r: 16 } });
    G.frontFog(t, 0.35); grass(t);
    X.holo(lt - 1.2, 6.4, { x: 330, y: 220, w: 460, title: 'HUNTER', color: '#5f9dff', accent: '#d6e6ff', lines: [{ t: 'Sieg Valen', big: true }, 'Rank A  ·  "The Laughing Blade"', { t: 'Brand: Afterimage', col: '#bcd4ff' }] });
  }, EP3D.siegWalk), { say: [[0.4, 'b33'], ['+0.6', 'b34']], sfx: [[1.2, (g, w) => S.ui(g, w, 0.05)], [0.3, (g, w) => [0, 0.48, 0.96, 1.44, 1.92, 2.4].forEach(o => S.step(g, w + o, 0.08))]] });
  shot(8, alt((lt, d, t) => {
    G.barrow(t, { x: 240, y: -40, z: 1.4 }, { fogA: 0.4, mood: 'ash' }); G.fill('#2a1020', 0.2);
    const place = { x: 640, y: 420, ax: 360, ay: 230, sc: lerp(2.3, 2.45, lt / d) }, talk = V.amp('SIEG', t), pose = P.sieg(t, { talk, lookBias: -0.6 }); pose.open = talk;
    R.draw('sieg', place, pose, ASH);
  }, EP3D.sgClose({ d0: 0.85, fov: 26 })), { say: [[0.3, 'b36']] });
  shot(5, alt((lt, d, t) => eyes(t, lt, d, { mode: 'dusk', z0: 6.3, z1: 6.35 }), EP3D.tkClose({ locked: true, still: true, d0: 0.8, envOpts: { mood: 'ash' } })), { say: [[0.3, 'b37'], ['+0.4', 'b38']] });
  shot(8, alt((lt, d, t) => {
    G.barrow(t, { x: 200, y: 0, z: 1.15 }, { fogA: 0.45, mood: 'ash' });
    const laugh = V.amp('SIEG', t) > 0 && lt < 2 ? 1 : 0;
    SG(t, 880, 1320, 0.68, { lookBias: -0.7, headR: laugh ? -0.08 + Math.sin(t * 20) * 0.02 : 0.03, glaiveR: Math.sin(t * 0.8) * 0.03 }, ASH); G.frontFog(t, 0.35); grass(t);
  }, EP3D.siegLaugh), { say: [[0.2, 'b39'], ['+0.5', 'b40']] });
  const RIFTEYE = T;
  shot(8, alt((lt, d, t) => { G.barrow(t, { x: 0, y: lerp(-150, -230, lt / d), z: 1.2 }, { fogA: 0.3, mood: 'ash', rift: { open: 1, cx: 640, cy: 190, w: 520, h: 150, eye: inv(3.5, 4.5, lt) * (lt > 6.4 && lt < 6.6 ? 0.1 : 1) } }); POST.set({ bloom: 1.0, thr: 0.45 }); }, EP3D.riftEye),
    { say: [[0.3, 'b41']], sfx: [[3.5, (g, w) => S.staticBurst(g, w, 1.6, 0.1)], [3.6, (g, w) => { S.brass(g, w, n('D2'), 3, 0.08); S.brass(g, w, n('Ab2'), 3, 0.07); S.boom(g, w, 0.4); }]] });
  shot(10, alt((lt, d, t) => {
    G.vgrad([[0, '#1a0a12'], [1, '#3a1a20']]);
    const sc = lerp(3.0, 3.3, lt / d), place = { x: 640, y: 400, ax: 112, ay: 452, sc }, pose = P.takuto(t, {});
    const grip = R.point('takuto', place, pose, 118, 455); G.fig('axe', grip[0], grip[1], 0, 0, sc, { mul: '#e0a090', mulA: 0.5, rot: -0.5009 + pose.bones.armR.r });
    R.draw('takuto', place, pose, { mul: '#e0a090', mulA: 0.5 });
    const [sx, sy] = R.point('takuto', place, pose, 125, 448), amp = V.amp('AKURO', t);
    G.sigilAxe(sx, sy, 80, 1, t, '#ff4a3a', 0.35 + 0.25 * Math.sin(t * 2.5) + amp * 0.5);
    G.fill('#000', inv(d - 2.4, d - 0.5, lt)); POST.set({ bloom: 0.9 + amp, thr: 0.45 });
  }, EP3D.akuroLast), { say: [[1.0, 'b42']], sfx: [[6.0, (g, w) => S.kan(g, w, 0.05)], [6.5, (g, w) => S.kan(g, w, 0.04)], [7.0, (g, w) => S.kan(g, w, 0.03)]] });
  cueTension(PB, FIGHT_T - PB);
  cueBattle(FIGHT_T, BLOW - FIGHT_T - 0.05);
  at(BLOW + 2.5, (g, w, off) => { S.pad(g, w, n('D2'), AWAKE - BLOW - 2.5 - off, { vol: 0.05, cut: 260, att: 4, type: 'sine' }); }, AWAKE - BLOW - 2.5, true);
  cueAwakenNew(AWAKE, SWING, SWING + CLIMAX_HIT);
  cueAfter(SHATTER + 1.5, SIEG - SHATTER - 2.5);
  cueSieg(SIEG, RIFTEYE - SIEG);
  at(RIFTEYE + 3.6, (g, w, off) => { S.pad(g, w, n('D2'), 13 - off, { vol: 0.06, cut: 300, att: 1 }); S.pad(g, w, n('Eb3'), 13 - off, { vol: 0.03, cut: 600, att: 2 }); }, 13, true);
  function cueAwakenNew(t0, tSwing, tHit) {
    const bar = 2.5, b = bar / 4, roots = ['D', 'Bb', 'C', 'Dmaj'], mel = [[['D5', 0, 2], ['A4', 2, 2]], [['C5', 0, 2], ['D5', 2, 2]], [['F5', 0, 2], ['E5', 2, 2]], [['C5', 0, 1], ['A4', 1, 1], ['D5', 2, 2]]];
    const nb = Math.floor((tSwing - 5 - t0) / bar);
    for (let i = 0; i < nb; i++) {
      const t = t0 + i * bar, r = roots[Math.min(3, i)], ch = chordOf(r);
      at(t, (g, w) => { ch.forEach(c => S.choir(g, w, n(c + 3), bar, 0.03, 0.3, 1)); S.pad(g, w, n(r[0] === 'D' ? 'D2' : r === 'Bb' ? 'Bb1' : 'C2'), bar, { vol: 0.06, cut: 600, att: 0.2, rel: 0.8 }); S.crash(g, w, 0.06); });
      [0, 2].forEach(x => at(t + x * b, (g, w) => S.taiko(g, w, 0.5)));
      if (i < 4) mel[i].forEach(([nt, st, ln]) => at(t + st * b, (g, w) => { S.brass(g, w, n(nt), ln * b * 0.95, 0.075); S.brass(g, w, n(nt) / 2, ln * b * 0.95, 0.05); }));
      if (i === 3) for (let k = 0; k < 8; k++) at(t + 2 * b + k * b / 4, (g, w) => S.taiko(g, w, 0.25 + k * 0.03));
    }
    cueBattle(tSwing - 5, 6.0, 160);
    at(tSwing + 1.0, (g, w) => { ['D', 'F', 'A'].forEach(c => S.choir(g, w, n(c + 3), 2.5, 0.04, 0.5, 0.4)); });
    at(tHit, (g, w) => { ['D', 'F#', 'A'].forEach(c => { S.brass(g, w, n(c + 4), 4.5, 0.07); S.choir(g, w, n(c + 3), 5, 0.04, 0.05, 2.5); }); S.brass(g, w, n('D3'), 4.5, 0.08); S.crash(g, w, 0.14); S.taiko(g, w, 0.6); S.pad(g, w, n('D2'), 5, { vol: 0.08, cut: 500, att: 0.05, rel: 2 }); });
  }

  /* ====================================================================
     ENDING
     ==================================================================== */
  chapter('Ending');
  const ED = T, ED_D = 58;
  const CREDITS = [['RUINBREAKER', 'h1'], ['Episode 1  ·  The Crossing', 'h2'], ['', ''], ['CAST', 'l'], ['Takuto Kirishima', 'n'], ['Nemu', 'n'], ['Sieg Valen', 'n'], ['Akuro (voice)', 'n'], ['Mr. Sable', 'n'], ['The Skeletal Shieldbearer', 'n'], ['The cat at Crossing No. 4', 'n'], ['', ''],
    ['VOICES', 'l'], ['Kokoro-82M neural voices', 'n'], ['(Apache-2.0, hexgrad)', 's'], ['', ''],
    ['ORIGINAL CONCEPT & CHARACTERS', 'l'], ['The series creator', 'n'], ['', ''], ['SCRIPT  ·  STORYBOARD', 'l'], ['ANIMATION  ·  MUSIC  ·  SOUND', 'l'], ['Written and built with Claude', 'n'], ['', ''],
    ['CHARACTER & CREATURE ART', 'l'], ['Reference illustrations by', 'n'], ['their original artists.', 'n'], ['All rights belong to them.', 'n'], ['', ''],
    ['OPENING THEME', 'l'], ['"Ruinbreaker" (instrumental)', 'n'], ['ENDING THEME', 'l'], ['"Crossing No. 4" (instrumental)', 'n'], ['', ''], ['Every note of music and every sound effect', 's'], ['is synthesized live in your browser.', 's']];
  shot(ED_D, (lt, d, t) => {
    const seg = 11.6, i = Math.min(4, Math.floor(lt / seg)), sl = lt - i * seg, z = 1 + sl * 0.006, c = G.ctx;
    const scene = (k, l) => {
      if (k === 0) { G.earth(t, { x: 0, y: 0, z }, { gate: 1, cat: 'sit' }); G.fill('#ffb38a', 0.25, 'screen'); G.fill('#f0c8b0', 0.3, 'multiply'); }
      else if (k === 1) { G.barrow(t, { x: 0, y: -80, z: z + 0.05 }, { fogA: 0.5 }); G.fill('#4a4a8a', 0.45, 'multiply'); }
      else if (k === 2) { G.paper(); R.draw('nemu_chibi', { x: 420, y: 520, ax: 135, ay: 350, sc: 1.9 * z }, P.generic(t, {}), { duo: ['#2a2020', '#ffffff'], comp: 'multiply' }); R.draw('nemu_gg', { x: 700, y: 520, ax: 325, ay: 420, sc: 2.4 }, P.generic(t, {}), { comp: 'multiply' }); }
      else if (k === 3) { G.paper(); const fx = { duo: ['#2a1418', '#ffffff'], comp: 'multiply' }; TK(t, 480, 1350, 0.62 * z, { legs: false }, fx); G.inkStroke([[160, 640], [860, 600]], ease.out(inv(1, 3, l)), 7, 'rgba(170,18,28,0.8)'); }
      else { G.paper(); R.draw('sieg', { x: 470, y: 800, ax: 370, ay: 899, sc: 0.78 * z }, P.sieg(t, {}), { duo: ['#1a1a24', '#ffffff'], comp: 'multiply' }); }
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
    G.fill('#000', 1 - inv(0, 1.5, lt)); G.fill('#000', inv(d - 1.5, d, lt)); POST.set({ bloom: 0.4 });
  });
  cueED(ED + 0.4);

  /* ====================================================================
     POST-CREDITS
     ==================================================================== */
  chapter('After the credits');
  const TAG = T;
  shot(16, alt((lt, d, t) => {
    const cam = focusCam(700, 420, 640, 380, lerp(1.3, 1.45, lt / d));
    G.earth(t, cam, { gate: 1, cat: 'alert', brokenGate: true, lamps: lt > 9.5, world: () => SBL(t, 700, 528, 0.13, { eye: inv(3.5, 4.2, lt), hand: lt > 9 ? Math.sin(t * 4) * 0.15 : 0 }, { mul: '#9aa4c8', mulA: 0.8, a: ease.out(inv(1.5, 3.5, lt)), glow: { c: '#a8b8ff', a: 0.3, r: 8 } }) });
    G.fill('#ffb38a', 0.18, 'screen'); G.fill('#b8c4e8', 0.25, 'multiply');
    G.fill('#000', 1 - inv(0, 1.5, lt)); G.fill('#000', inv(d - 1.5, d, lt)); POST.set({ bloom: 0.8, thr: 0.5 });
  }, EP3D.sableTag), { say: [[5.0, 's1'], ['+1.2', 's2']], sfx: [[3.5, (g, w) => S.staticBurst(g, w, 1.2, 0.08)], [12.6, (g, w) => S.meow(g, w, 0.04)], [0, (g, w, off) => S.noiseBed(g, w, off, 16, { vol: 0.05, bp: 500, q: 0.5, fin: 2, fout: 2 }), 16, true]] });
  for (let k = 0; k < 10; k++) at(TAG + 9.5 + k * 0.5, (g, w) => S.kan(g, w, 0.08));

  /* ====================================================================
     NEXT EPISODE PREVIEW
     ==================================================================== */
  chapter('Next episode');
  const PV = T;
  shot(20, (lt, d, t) => {
    const cut = Math.floor(lt / 2.6);
    if (cut === 0) opChar(lt, 2.6, CAST.rin, t, -440);
    else if (cut === 1) opPanel(lt - 2.6, 2.6, 'valentine', 'VALENTINE & TOFU', 'GUILD APPRAISER', '#2a0a1c', '#ff7ab6', 0.5, 0.5, t, -480);
    else if (cut === 2) { G.fill('#05060a'); X.holo(lt - 5.2, 2.6, { x: 640, y: 360, w: 520, title: 'BRAND APPRAISAL', lines: ['Subject: Kirishima Takuto', { t: 'RANK: ERROR', big: true, c: true, col: '#ff5060' }] }); if (G.twos(t, 12) % 4 === 0) POST.set({ ca: 0.01 }); }
    else if (cut === 3) opChar(lt - 7.8, 2.6, CAST.wick, t, -440);
    else if (cut === 4) { G.fill('#0a0a0d'); R.draw('rin_face', { x: 640, y: 380, ax: 540, ay: 230, sc: 2.0 + (lt - 10.4) * 0.05 }, P.generic(t, {}), { glow: { c: '#ff6a78', a: 0.3, r: 14 } }); }
    else if (cut === 5) { G.fill('#0b0b0e'); R.cover('m_golem', 0, 0, W, H, 0.5, 0.4, 1.06 + (lt - 13) * 0.04, P.generic(t, {}), { duo: ['#0b0b0e', '#d9c690'] }); }
    else {
      const l2 = lt - 15.6, a = inv(0, 0.8, l2); G.fill('#050406');
      G.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + G.FONT.sub, fill: '#e8343c', ls: 10, a });
      G.txt('第二話', 640, 300, { font: '400 26px ' + G.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      G.txt('烙印', 640, 430, { font: '400 130px ' + G.FONT.jp, fill: '#f4efe9', ls: 20, a });
      G.txt('BRANDED', 640, 510, { font: '800 40px ' + G.FONT.disp, fill: '#f4efe9', ls: 14, a });
      G.fill('#000', inv(d - 1.2, d, lt));
    }
    if (lt < 15.6 && (lt % 2.6) < 0.1) POST.set({ flash: 0.5 * (1 - (lt % 2.6) / 0.1) });
  }, { say: [[0.4, 'p1'], ['+0.4', 'p2'], ['+0.4', 'p3'], ['+0.4', 'p4'], [16.2, 'p5']] });
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
