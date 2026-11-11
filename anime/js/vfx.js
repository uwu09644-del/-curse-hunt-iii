/* RUINBREAKER — action effects: energy slashes, auras, sparks, debris, shockwaves, light shafts,
   converging energy and holographic Brand readouts. All pure functions of time. */
'use strict';

const VFX = (() => {
  const G = GFX, { W, H, clamp, lerp, inv, ease, hash } = G;
  let flame = null, puff = null;
  function build() {
    flame = G.canvas(64, 128); const f = flame.getContext('2d');
    const g = f.createRadialGradient(32, 92, 2, 32, 80, 60); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    f.fillStyle = g; f.beginPath(); f.moveTo(32, 2); f.quadraticCurveTo(62, 70, 54, 100); f.quadraticCurveTo(32, 130, 10, 100); f.quadraticCurveTo(2, 70, 32, 2); f.fill();
    puff = G.canvas(64, 64); const p = puff.getContext('2d'), pg = p.createRadialGradient(32, 32, 0, 32, 32, 32); pg.addColorStop(0, 'rgba(255,255,255,0.9)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); p.fillStyle = pg; p.fillRect(0, 0, 64, 64);
  }
  const tinted = new Map();
  function tintSprite(spr, color) {
    const key = (spr === flame ? 'f' : 'p') + color; if (tinted.has(key)) return tinted.get(key);
    const c = G.canvas(spr.width, spr.height), g = c.getContext('2d'); g.drawImage(spr, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    tinted.set(key, c); return c;
  }

  // crescent energy slash: sweeps from a0 to a1, then lingers and fades with a bright core
  function slash(lt, o) {
    const { x, y, r, a0, a1, dur = 0.16, hold = 0.35, w = 60, color = '#ff3a2a', core = '#fff4ee', flat = 0.55, rot = 0 } = o;
    if (lt < 0 || lt > dur + hold) return;
    const sweep = ease.out(clamp(lt / dur)), fade = 1 - inv(dur, dur + hold, lt), head = a0 + (a1 - a0) * sweep;
    const c = G.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, flat); c.globalCompositeOperation = 'lighter';
    const N = 28;
    for (let layer = 0; layer < 3; layer++) {
      const lw = [w * 1.8, w, w * 0.32][layer], col = [color, color, core][layer], al = [0.25, 0.55, 0.95][layer] * fade;
      for (let i = 0; i < N; i++) {
        const f0 = i / N, f1 = (i + 1) / N, b0 = a0 + (head - a0) * f0, b1 = a0 + (head - a0) * f1, taper = Math.pow(f1, 1.6);
        c.strokeStyle = col; c.globalAlpha = al * taper; c.lineWidth = lw * (0.15 + 0.85 * taper) * (0.7 + 0.3 * fade); c.lineCap = 'round';
        c.beginPath(); c.arc(0, 0, r, b0, b1, a1 < a0); c.stroke();
      }
    }
    c.restore();
  }
  // rising flame aura around a region
  function aura(t, o) {
    const { x, y, w, h, n = 70, color = '#ff2a1a', core = '#ffd0a0', a = 1, seed = 1, smoke = true, speed = 1 } = o;
    if (!flame) build();
    const fc = tintSprite(flame, color), cc = tintSprite(flame, core), c = G.ctx;
    c.save();
    if (smoke) { c.globalCompositeOperation = 'source-over'; const pc = tintSprite(puff, '#0a0204'); for (let i = 0; i < n / 3; i++) { const life = 1.6 + hash(i, seed) * 1.2, ph = ((t * speed + hash(i, seed + 1) * life) % life) / life; const px = x + (hash(i, seed + 2) - 0.5) * w * (1 + ph * 0.4), py = y + h * 0.5 - ph * h * 1.2, s = (40 + 60 * ph) * (w / 400); c.globalAlpha = a * 0.35 * Math.sin(ph * Math.PI); c.drawImage(pc, px - s / 2, py - s / 2, s, s); } }
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const life = 0.7 + hash(i, seed + 3) * 0.6, ph = ((t * speed + hash(i, seed + 4) * life) % life) / life;
      const edge = hash(i, seed + 5) < 0.5 ? -1 : 1, px = x + edge * w * 0.5 * (0.55 + 0.45 * hash(i, seed + 6)) + Math.sin(t * 6 + i) * 8, py = y + h * 0.5 - ph * h * (0.6 + hash(i, seed + 7) * 0.7);
      const s = (18 + 26 * hash(i, seed + 8)) * (1 - ph * 0.6) * (w / 400), al = a * Math.sin(ph * Math.PI) * 0.8, sk = Math.sin(t * 9 + i) * 0.25;
      c.globalAlpha = al; c.save(); c.translate(px, py); c.rotate(sk); c.drawImage(fc, -s * 0.32, -s * 2.6, s * 0.64, s * 2.8); if (i % 3 === 0) { c.globalAlpha = al * 0.7; c.drawImage(cc, -s * 0.16, -s * 1.5, s * 0.32, s * 1.6); } c.restore();
    }
    c.restore();
  }
  // sparks with motion trails, launched at t0
  function sparks(dt, o) {
    const { x, y, n = 40, ang = -Math.PI / 2, spread = Math.PI, speed = 900, grav = 1400, color = '#ffd27a', life = 0.9, seed = 2, len = 0.03 } = o;
    if (dt < 0 || dt > life * 1.3) return;
    const c = G.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = ang + (hash(i, seed) - 0.5) * spread, v = speed * (0.35 + hash(i, seed + 1) * 0.9), l = life * (0.5 + hash(i, seed + 2) * 0.6);
      if (dt > l) continue;
      const p = tt => [x + Math.cos(a) * v * tt, y + Math.sin(a) * v * tt + grav * tt * tt / 2];
      const [x1, y1] = p(dt), [x0, y0] = p(Math.max(0, dt - len));
      c.globalAlpha = 1 - dt / l; c.strokeStyle = color; c.lineWidth = 1.5 + hash(i, seed + 3) * 2.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    c.restore();
  }
  // rock chunks and dust
  function debris(dt, o) {
    const { x, y, n = 26, speed = 700, grav = 1800, color = '#3a3034', dust = '#8a7a74', seed = 5, size = 14 } = o;
    if (dt < 0 || dt > 2.2) return;
    const c = G.ctx; c.save();
    const pc = tintSprite(puff || (build(), puff), dust);
    for (let i = 0; i < 10; i++) { const a = -Math.PI * hash(i, seed + 9), v = 140 * (0.4 + hash(i, seed + 10)), s = (60 + 120 * dt) * (0.6 + hash(i, seed + 11)); c.globalAlpha = 0.45 * (1 - dt / 2.2); c.drawImage(pc, x + Math.cos(a) * v * dt - s / 2, y + Math.sin(a) * v * dt * 0.5 - s / 2, s, s); }
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.1 + 0.8 * hash(i, seed)), v = speed * (0.3 + hash(i, seed + 1)), px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + grav * dt * dt / 2, r = size * (0.4 + hash(i, seed + 2));
      if (py > H + 40) continue;
      c.globalAlpha = 1; c.save(); c.translate(px, py); c.rotate(dt * (hash(i, seed + 3) - 0.5) * 14); c.fillStyle = color; c.beginPath(); c.moveTo(-r, -r * 0.4); c.lineTo(r * 0.3, -r); c.lineTo(r, r * 0.2); c.lineTo(-r * 0.2, r * 0.8); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.stroke(); c.restore();
    }
    c.restore();
  }
  function ring(dt, o) {
    const { x, y, r0 = 20, r1 = 600, dur = 0.5, color = '#ffffff', w = 18, flat = 0.35 } = o;
    if (dt < 0 || dt > dur) return;
    const k = ease.out(dt / dur), c = G.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, flat);
    c.globalAlpha = (1 - k) * 0.9; c.strokeStyle = color; c.lineWidth = w * (1 - k) + 2; c.beginPath(); c.arc(0, 0, lerp(r0, r1, k), 0, Math.PI * 2); c.stroke(); c.restore();
    POST.set({ shock: { x: x / W, y: y / H, r: lerp(0.02, 0.5, k), w: 0.06, amp: 0.025 * (1 - k) } });
  }
  function shafts(t, o) { // light shafts from an off-screen source
    const { x, y, ang = 1.9, spread = 0.7, n = 7, color = 'rgba(255,200,150,1)', a = 0.12, len = 1600 } = o, c = G.ctx;
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const aa = ang + (i / (n - 1) - 0.5) * spread + Math.sin(t * 0.2 + i) * 0.015, wd = 0.02 + hash(i, 4) * 0.04;
      const g = c.createLinearGradient(x, y, x + Math.cos(aa) * len, y + Math.sin(aa) * len); g.addColorStop(0, color.replace(',1)', ',' + (a * (0.6 + 0.4 * Math.sin(t * 0.7 + i * 1.7))).toFixed(3) + ')')); g.addColorStop(1, color.replace(',1)', ',0)'));
      c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(aa - wd) * len, y + Math.sin(aa - wd) * len); c.lineTo(x + Math.cos(aa + wd) * len, y + Math.sin(aa + wd) * len); c.closePath(); c.fill();
    }
    c.restore();
  }
  function converge(t, o) { // energy streaming into a point
    const { x, y, r = 420, n = 90, color = '#ff4a3a', a = 1, seed = 8 } = o, c = G.ctx;
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const life = 0.6 + hash(i, seed) * 0.5, ph = ((t + hash(i, seed + 1) * life) % life) / life, ang = hash(i, seed + 2) * Math.PI * 2 + t * 0.6, rr = r * (1 - ease.in(ph));
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * 0.8, l = 24 + 40 * ph;
      c.globalAlpha = a * Math.sin(ph * Math.PI); c.strokeStyle = i % 4 ? color : '#fff'; c.lineWidth = 1.5 + ph * 2.5;
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(ang) * l, py + Math.sin(ang) * l * 0.8); c.stroke();
    }
    c.restore();
  }
  function bolt(t, x0, y0, x1, y1, o = {}) {
    const { color = '#ffb0a0', w = 2.5, seed = 3, seg = 12, jag = 26, a = 1 } = o, c = G.ctx, tk = G.twos(t, 20);
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = color; c.globalAlpha = a; c.lineJoin = 'round';
    [[w * 4, 0.25], [w, 1]].forEach(([lw, al]) => { c.lineWidth = lw; c.globalAlpha = a * al; c.beginPath(); c.moveTo(x0, y0); for (let i = 1; i < seg; i++) { const f = i / seg; c.lineTo(lerp(x0, x1, f) + (hash(i, tk + seed) - 0.5) * jag, lerp(y0, y1, f) + (hash(i, tk + seed + 7) - 0.5) * jag); } c.lineTo(x1, y1); c.stroke(); });
    c.restore();
  }

  /* ---------- holographic Brand readout (the show's own UI language) ---------- */
  function holo(lt, d, o) {
    const { x, y, w = 520, title = 'NOTICE', lines = [], color = '#ff3a46', accent = '#ffd6d6', cps = 38, icon = '◆', lh = 36 } = o;
    const h = 70 + lines.length * lh + 22;
    const open = ease.out5(inv(0, 0.35, lt)), close = ease.in(inv(d - 0.35, d, lt)), sy = open * (1 - close);
    if (sy <= 0.01) return;
    const c = G.ctx, flick = (lt < 0.4 && G.twos(lt, 30) % 3 === 0) ? 0.5 : 1;
    c.save(); c.translate(x, y); c.scale(1, sy); c.globalAlpha = flick;
    const bg = c.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, 'rgba(26,4,8,0.86)'); bg.addColorStop(1, 'rgba(10,2,4,0.86)');
    c.fillStyle = bg; c.fillRect(-w / 2, -h / 2, w, h);
    c.save(); c.globalCompositeOperation = 'lighter'; c.shadowColor = color; c.shadowBlur = 18 * G.K; c.strokeStyle = color; c.lineWidth = 1.5; c.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1); c.restore();
    c.strokeStyle = accent; c.lineWidth = 3; const k = 18; // corner brackets
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy2]) => { const cx = sx * w / 2, cy = sy2 * h / 2; c.beginPath(); c.moveTo(cx - sx * k, cy); c.lineTo(cx, cy); c.lineTo(cx, cy - sy2 * k); c.stroke(); });
    c.fillStyle = color; c.globalAlpha = 0.18 * flick; c.fillRect(-w / 2, -h / 2, w, 44); c.globalAlpha = flick;
    G.txt(icon + '  ' + title, -w / 2 + 22, -h / 2 + 29, { font: '800 16px ' + G.FONT.sub, align: 'left', fill: accent, ls: 5 });
    c.fillStyle = color; c.fillRect(-w / 2 + 16, -h / 2 + 44, w - 32, 1);
    let shown = Math.max(0, (lt - 0.3) * cps);
    lines.forEach((ln, i) => {
      const s = typeof ln === 'string' ? { t: ln } : ln, n = Math.min(s.t.length, Math.floor(shown)); shown -= s.t.length + 6;
      if (n <= 0) return;
      G.txt(s.t.slice(0, n), s.c ? 0 : -w / 2 + 24, -h / 2 + 82 + i * lh + (s.huge ? 10 : 0), { font: (s.huge ? '400 46px ' + G.FONT.jp : s.big ? '900 30px ' + G.FONT.disp : '500 18px ' + G.FONT.sub), align: s.c ? 'center' : 'left', fill: s.col || '#f4e9e9', ls: s.huge ? 10 : s.big ? 4 : 0.5, stroke: s.huge ? 'rgba(120,0,10,0.9)' : null, lw: 6 });
    });
    c.globalAlpha = 0.08 * flick; c.fillStyle = '#fff'; for (let yy = -h / 2; yy < h / 2; yy += 4) c.fillRect(-w / 2, yy, w, 1); // scanlines
    c.restore();
  }

  return { build, slash, aura, sparks, debris, ring, shafts, converge, bolt, holo };
})();
