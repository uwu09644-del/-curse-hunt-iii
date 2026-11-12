/* RUINBREAKER — shared helpers for hand-directed episode shots: painted plates with a camera move, camera shake,
   cast overrides, glowing threads, distant creature silhouettes, eyes in the dark, chain harness, title cards. */
'use strict';

const KIT = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX;
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  const proj = p => S3.project(p[0], p[1], p[2]);
  const over = (api, t, map) => api.castList(t).map(c => map[c[0]] ? [c[0], { ...c[1], ...map[c[0]].pose }, { ...c[2], ...(map[c[0]].o || {}) }] : c);
  const yaw = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const H = n => S3.SPRITE_H[n] || 3;
  // a painted plate filling the frame, with a slow zoom/pan and optional shake (pixels)
  function plate(id, lt, d, o = {}) {
    const im = S3.plateImage(id), c = GFX.ctx, k = ease.io(clamp(lt / d)), z = lerp(o.z0 ?? 1.0, o.z1 ?? 1.12, k), sh = o.shake || 0;
    const sx = sh ? (hash(GFX.twos(lt, 30), 1) - 0.5) * sh : 0, sy = sh ? (hash(GFX.twos(lt, 30), 2) - 0.5) * sh : 0;
    if (!im) return GFX.fill(o.bg || '#0c0c10');
    const s = Math.max(1280 / im.width, 720 / im.height) * z * 1.06; c.drawImage(im, 640 - im.width * s / 2 + (o.pan || 0) * k * 1280 + sx, 360 - im.height * s / 2 + (o.tilt || 0) * k * 720 + sy, im.width * s, im.height * s);
  }
  // glowing thread between screen points (Rin's Red Thread by default)
  function thread(a, b, t, k = 1, o = {}) {
    const c = GFX.ctx, sag = o.sag ?? 30, i = o.i || 0, mx = (a[0] + b[0]) / 2 + Math.sin(t * 3 + i) * 6, my = (a[1] + b[1]) / 2 + sag, ex = lerp(a[0], b[0], k), ey = lerp(a[1], b[1], k), col = o.color || [255, 80, 90];
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[10, 0.18], [o.w || 2.4, 0.95], [1, 0.9]].forEach(([lw, al], j) => { c.strokeStyle = j === 2 ? 'rgba(255,230,230,' + al + ')' : 'rgba(' + col.join(',') + ',' + al + ')'; c.lineWidth = lw; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(lerp(a[0], mx, k), lerp(a[1], my, k), ex, ey); c.stroke(); });
    c.restore(); GFX.radial(ex, ey, 20, 'rgba(' + col.join(',') + ',0.7)', 'rgba(0,0,0,0)', 1, 'lighter');
  }
  // a creature sprite drawn flat into the frame: distant, darkened, eyes burning
  function sil(name, x, y, h, a, t, o = {}) {
    const ch = S3.chars[name], im = ch && ch.mat.map.image; if (!im || a <= 0) return; const w = h * im.width / im.height, c = GFX.ctx, bob = Math.abs(Math.sin(t * (o.rate || 2.2) + (o.ph || 0))) * h * 0.02;
    c.save(); c.globalAlpha = a; c.filter = o.filter || 'brightness(0.32) saturate(0.6)'; if (o.flip) { c.translate(x, 0); c.scale(-1, 1); c.translate(-x, 0); } c.drawImage(im, x - w / 2, y - h - bob, w, h); c.restore();
    if (o.eyes !== false) [-0.06, 0.06].forEach(e => GFX.radial(x + e * w, y - h * (o.eyeY || 0.84) - bob, Math.max(3, h * 0.03), 'rgba(' + (o.eyeCol || '255,80,40') + ',' + (0.95 * a).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'));
  }
  function eyePairs(n, t, a, o = {}) { // pairs of eyes in darkness
    for (let i = 0; i < n; i++) { const x = (o.x0 ?? 80) + hash(i, 2) * ((o.x1 ?? 1200) - (o.x0 ?? 80)), y = (o.y0 ?? 300) + hash(i, 5) * ((o.y1 ?? 560) - (o.y0 ?? 300)), sz = (o.size || 6) * (0.6 + hash(i, 7)), blink = Math.sin(t * 0.7 + i * 3.1) > 0.97 ? 0 : 1, k = a * blink * clamp((t * 2 - i * 0.05));
      if (k <= 0) continue; [-1, 1].forEach(dx => GFX.radial(x + dx * sz * 1.6, y, sz * 2, 'rgba(' + (o.col || '255,60,40') + ',' + (0.9 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter')); }
  }
  function chains(t, glow, snap = 0, who = 'takuto') {
    const g = GFX.ctx; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const p = proj(S3.weaponTip(who, -0.05 + i * 0.11)), off = snap > 0 ? [Math.cos(i * 2.3) * snap * 160, Math.sin(i * 1.7) * snap * 120 + snap * snap * 200] : [0, 0];
      g.strokeStyle = 'rgba(255,200,90,' + (0.9 * glow * (1 - snap)).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(p[0] + off[0], p[1] + off[1], 7, 4, i * 0.6 + t * 2, 0, 7); g.stroke(); }
    g.restore();
  }
  function ribbons(from, to, t, k, o = {}) { // wind ribbons (Vesper's White Gale)
    const c = GFX.ctx, n = o.n || 5; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const ph = t * 5 + i * 1.3, e = clamp(k * 1.3 - i * 0.08), ex = lerp(from[0], to[0], e), ey = lerp(from[1], to[1], e) + Math.sin(ph) * 40 * (1 - e);
      c.strokeStyle = 'rgba(' + (o.col || '230,245,255') + ',' + (0.75 * (1 - i * 0.1)).toFixed(2) + ')'; c.lineWidth = 5 - i * 0.6; c.beginPath(); c.moveTo(from[0], from[1]); c.bezierCurveTo(from[0] + Math.cos(ph) * 160, from[1] - 120 + i * 30, lerp(from[0], ex, 0.6) + Math.sin(ph) * 120, ey - 80, ex, ey); c.stroke();
      if (o.wrap) { c.lineWidth = 3; c.beginPath(); c.ellipse(to[0], to[1] - 60 + i * 40, 70 * o.wrap, 18 * o.wrap, 0.1 * Math.sin(t + i), ph % 6, ph % 6 + 4.8 * o.wrap); c.stroke(); } }
    c.restore();
  }
  function frost(x, y, r, k, t) { // Haruki's Frozen Hour / Tyr's ice: a pale ring and crystals
    if (k <= 0) return; const c = GFX.ctx; GFX.radial(x, y, r, 'rgba(200,235,255,' + (0.45 * k).toFixed(2) + ')', 'rgba(120,190,255,0)', 1, 'lighter');
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(220,245,255,' + (0.8 * k).toFixed(2) + ')'; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2 + hash(i, 3) * 0.3, r0 = r * 0.25, r1 = r * (0.6 + hash(i, 4) * 0.4) * k; c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7); c.stroke(); }
    c.restore();
  }
  function gold(x, y, w, h, k, t, o = {}) { // Lucien's Sanctum: a golden hex barrier
    if (k <= 0) return; const c = GFX.ctx, s = o.cell || 46; c.save(); c.globalCompositeOperation = 'lighter';
    c.beginPath(); c.ellipse(x, y, w / 2 * k, h / 2 * k, 0, 0, 7); c.clip();
    GFX.radial(x, y, Math.max(w, h) * 0.6, 'rgba(255,215,120,' + (0.22 * k).toFixed(2) + ')', 'rgba(255,190,60,0.05)', 1, 'lighter');
    c.strokeStyle = 'rgba(255,225,150,' + (0.55 * k).toFixed(2) + ')'; c.lineWidth = 1.5;
    for (let gy = y - h / 2; gy < y + h / 2; gy += s * 0.86) for (let gx = x - w / 2 + ((Math.round((gy - y) / (s * 0.86)) & 1) ? s / 2 : 0); gx < x + w / 2; gx += s) { c.beginPath(); for (let j = 0; j < 6; j++) { const a = j / 6 * PI * 2 + PI / 6; c[j ? 'lineTo' : 'moveTo'](gx + Math.cos(a) * s * 0.5, gy + Math.sin(a) * s * 0.5); } c.closePath(); c.stroke(); }
    c.restore(); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,235,170,' + (0.9 * k).toFixed(2) + ')'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, y, w / 2 * k, h / 2 * k, 0, 0, 7); c.stroke(); c.restore();
  }
  function cracks(x, y, r, k, o = {}) { // radial cracks (a barrier or a shell breaking)
    if (k <= 0) return; const c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.strokeStyle = o.col || 'rgba(255,170,60,0.95)'; c.lineWidth = o.w || 4;
    for (let i = 0; i < (o.n || 10); i++) { const a = i / (o.n || 10) * PI * 2 + hash(i, 2), L = r * (0.4 + hash(i, 3) * 0.6) * k; c.beginPath(); c.moveTo(x, y); for (let j = 1; j <= 4; j++) c.lineTo(x + Math.cos(a + (hash(i, j) - 0.5) * 0.6) * L * j / 4, y + Math.sin(a + (hash(i, j + 5) - 0.5) * 0.6) * L * j / 4); c.stroke(); }
    c.restore();
  }
  function wolf(x, y, s, a, t, i = 0) { // a grey wolf in mid-leap: dark body, two red eyes
    const c = GFX.ctx; c.save(); c.globalAlpha = a; c.fillStyle = '#16141c'; c.translate(x, y); c.rotate(Math.sin(t * 6 + i) * 0.1 - 0.2);
    c.beginPath(); c.ellipse(0, 0, s, s * 0.38, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(s * 0.9, -s * 0.22, s * 0.38, s * 0.26, -0.3, 0, 7); c.fill();
    c.beginPath(); c.moveTo(s * 0.9, -s * 0.42); c.lineTo(s * 1.0, -s * 0.72); c.lineTo(s * 1.12, -s * 0.38); c.fill(); c.beginPath(); c.moveTo(-s * 0.9, 0); c.quadraticCurveTo(-s * 1.5, -s * 0.4, -s * 1.7, -s * 0.1); c.lineTo(-s * 0.9, s * 0.1); c.fill(); c.restore();
    GFX.radial(x + s * 1.02, y - s * 0.3, s * 0.12 + 3, 'rgba(255,50,40,' + (0.95 * a).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
  }
  function staticArcs(x, y, r, k, t, n = 6) { // Mr. Sable's crackle: blue-white lightning arcs
    if (k <= 0) return; const c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const s0 = GFX.twos(t, 14) + i * 7.1, a = hash(s0, 1) * PI * 2, L = r * (0.4 + hash(s0, 2) * 0.6) * k; let px = x, py = y;
      c.strokeStyle = 'rgba(190,215,255,' + (0.9 * k).toFixed(2) + ')'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(px, py);
      for (let j = 1; j <= 6; j++) { px = x + Math.cos(a) * L * j / 6 + (hash(s0, j + 3) - 0.5) * 40; py = y + Math.sin(a) * L * j / 6 + (hash(s0, j + 9) - 0.5) * 40; c.lineTo(px, py); } c.stroke(); }
    c.restore(); GFX.radial(x, y, r * 0.5, 'rgba(160,190,255,' + (0.35 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
  }
  const crimson = k => { GFX.fill('#ff1020', 0.14 * k, 'multiply'); POST.set({ sat: 1.25, gain: [1.15, 0.86, 0.84], bloom: 0.8, thr: 0.5, vig: 0.6 }); };
  function title(no, jp, en, size = 100) { // the "next episode" card
    return (lt, d) => { const a = inv(0, 0.8, lt); GFX.fill('#050406');
      GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt(no, 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      GFX.txt(jp, 640, 430, { font: '400 ' + size + 'px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 14, a }); GFX.txt(en, 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
      GFX.fill('#000', inv(d - 1.2, d, lt)); };
  }
  const rain = (t, a = 0.5) => GFX.motes(t * 3, { n: 160, vy: 900, vx: -120, color: '#a8b8d0', size: 1.3, glow: false, seed: 21, a });
  const snow = (t, a = 0.7) => GFX.motes(t * 0.8, { n: 140, vy: 70, vx: -30, color: '#f0f6ff', size: 2.6, glow: false, seed: 23, a });
  const embers = (t, a = 0.8) => GFX.motes(t * 4, { n: 100, vy: -70, color: '#ff8a3a', size: 2.4, seed: 4, a });
  return { jolt, proj, over, yaw, H, plate, thread, sil, eyePairs, chains, ribbons, frost, gold, cracks, wolf, staticArcs, crimson, title, rain, snow, embers };
})();
