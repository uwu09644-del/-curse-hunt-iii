/* RUINBREAKER — parts the source art is missing: complete weapons and legs.
   Weapons are painted once into canvases (registered as art assets, so glow/rig code works on them).
   Legs are drawn as cel-shaded vector shapes every frame, posed by simple two-bone kinematics. */
'use strict';

const PARTS = (() => {
  const G = GFX;
  const OUT = '#231a1e';

  /* ---------- the Headsman's Axe (crescent "moon" axe) ----------
     Local units = Takuto's original-art pixels. Origin = his grip, +x runs up the handle to the head. */
  function paintAxe() {
    const S = 2, X0 = -150, Y0 = -230, Wd = 880, Ht = 460, c = G.canvas(Wd * S, Ht * S), g = c.getContext('2d');
    g.scale(S, S); g.translate(-X0, -Y0); g.lineJoin = 'round'; g.lineCap = 'round';
    // handle
    const hg = g.createLinearGradient(0, -10, 0, 10); hg.addColorStop(0, '#5e626c'); hg.addColorStop(0.35, '#9ea3ae'); hg.addColorStop(0.55, '#3c3f47'); hg.addColorStop(1, '#22242a');
    g.fillStyle = hg; g.strokeStyle = OUT; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(-118, -9); g.lineTo(612, -8); g.lineTo(612, 8); g.lineTo(-118, 9); g.closePath(); g.fill(); g.stroke();
    [[-40, 6], [40, 5], [160, 4], [300, 4], [400, 5]].forEach(([x, w]) => { g.fillStyle = '#2b2d33'; g.fillRect(x, -10, w, 20); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, -10, 1.5, 20); });
    // butt cap
    g.fillStyle = '#8d929c'; g.beginPath(); g.moveTo(-140, -13); g.lineTo(-112, -12); g.lineTo(-112, 12); g.lineTo(-140, 13); g.quadraticCurveTo(-150, 0, -140, -13); g.fill(); g.stroke();
    g.fillStyle = '#3a3d45'; g.fillRect(-112, -12, 8, 24); g.strokeRect(-112, -12, 8, 24);
    // red grip wrap near the head
    const rg = g.createLinearGradient(0, -14, 0, 14); rg.addColorStop(0, '#c4404c'); rg.addColorStop(0.5, '#8e2430'); rg.addColorStop(1, '#4a0e16');
    g.fillStyle = rg; g.beginPath(); g.moveTo(452, -12); g.lineTo(540, -15); g.lineTo(546, 0); g.lineTo(540, 15); g.lineTo(452, 12); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(40,6,10,0.8)'; g.lineWidth = 2; for (let x = 460; x < 540; x += 11) { g.beginPath(); g.moveTo(x, -13); g.lineTo(x + 9, 13); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2.6;
    // steel collar
    g.fillStyle = '#7d828d'; g.beginPath(); g.moveTo(546, -16); g.lineTo(588, -14); g.lineTo(592, 0); g.lineTo(588, 14); g.lineTo(546, 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(552, -14, 30, 4);
    // crescent blade: tips sweep back toward the wielder, cutting edge faces forward
    const C = 514, Rin = 98, Rout = 210, A = 1.72;
    const outer = a => { const k = Math.abs(a) / A; return Rin + (Rout - Rin) * Math.pow(Math.max(0, 1 - k * k), 0.55); };
    g.beginPath();
    for (let i = 0; i <= 80; i++) { const a = -A + 2 * A * i / 80, r = outer(a); const x = C + Math.cos(a) * r, y = Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let i = 80; i >= 0; i--) { const a = -A + 2 * A * i / 80, x = C + Math.cos(a) * Rin, y = Math.sin(a) * Rin; g.lineTo(x, y); }
    g.closePath();
    const bg = g.createRadialGradient(C, 0, Rin, C, 0, Rout); bg.addColorStop(0, '#8b8e98'); bg.addColorStop(0.45, '#c9ccd4'); bg.addColorStop(0.8, '#a6a9b3'); bg.addColorStop(1, '#eef0f6');
    g.fillStyle = bg; g.fill();
    g.save(); g.clip();
    g.fillStyle = 'rgba(60,62,72,0.45)'; g.beginPath(); for (let i = 0; i <= 60; i++) { const a = -A + 2 * A * i / 60, r = Rin + (outer(a) - Rin) * 0.38; const x = C + Math.cos(a) * r, y = Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); } for (let i = 60; i >= 0; i--) { const a = -A + 2 * A * i / 60; g.lineTo(C + Math.cos(a) * Rin, Math.sin(a) * Rin); } g.fill(); // shadow band
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 5; g.beginPath(); for (let i = 6; i <= 74; i++) { const a = -A + 2 * A * i / 80, r = outer(a) - 6; const x = C + Math.cos(a) * r, y = Math.sin(a) * r; i > 6 ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); // honed edge
    g.strokeStyle = 'rgba(40,40,50,0.35)'; g.lineWidth = 1.2; for (let k = 0; k < 7; k++) { g.beginPath(); const a0 = -1.4 + k * 0.45; g.moveTo(C + Math.cos(a0) * (Rin + 14), Math.sin(a0) * (Rin + 14)); g.lineTo(C + Math.cos(a0 + 0.1) * (Rin + 60), Math.sin(a0 + 0.1) * (Rin + 60)); g.stroke(); } // scratches
    g.restore();
    g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath();
    for (let i = 0; i <= 80; i++) { const a = -A + 2 * A * i / 80, r = outer(a); const x = C + Math.cos(a) * r, y = Math.sin(a) * r; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let i = 80; i >= 0; i--) { const a = -A + 2 * A * i / 80; g.lineTo(C + Math.cos(a) * Rin, Math.sin(a) * Rin); } g.closePath(); g.stroke();
    // socket plate with the checker pattern from the original art
    g.save(); g.translate(C + Rin - 6, 0);
    g.fillStyle = '#5c5f69'; g.beginPath(); g.moveTo(0, -52); g.lineTo(48, -44); g.lineTo(58, 0); g.lineTo(48, 44); g.lineTo(0, 52); g.closePath(); g.fill(); g.stroke();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2 === 0) { g.fillStyle = (i * 3 + j) % 3 ? '#9b9fab' : '#3b3d45'; g.fillRect(6 + i * 11, -38 + j * 13, 10, 12); }
    g.fillStyle = '#c0c3cc'; g.beginPath(); g.arc(30, 0, 6, 0, 7); g.fill(); g.stroke();
    g.restore();
    // forward spike
    g.fillStyle = '#b8bbc4'; g.beginPath(); g.moveTo(C + Rin + 52, -10); g.lineTo(C + Rout + 30, 0); g.lineTo(C + Rin + 52, 10); g.closePath(); g.fill(); g.stroke();
    return { img: c, ox: X0, oy: Y0, s: S, w: Wd * S, h: Ht * S };
  }

  /* ---------- Sieg's glaive ----------
     Origin = his grip; +x runs up the pole to the blade. */
  function paintGlaive() {
    const S = 2, X0 = -200, Y0 = -130, Wd = 1260, Ht = 260, c = G.canvas(Wd * S, Ht * S), g = c.getContext('2d');
    g.scale(S, S); g.translate(-X0, -Y0); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = OUT; g.lineWidth = 2.6;
    const pg = g.createLinearGradient(0, -8, 0, 8); pg.addColorStop(0, '#4a4650'); pg.addColorStop(0.4, '#2a2730'); pg.addColorStop(1, '#141218');
    g.fillStyle = pg; g.beginPath(); g.moveTo(-160, -7); g.lineTo(620, -7); g.lineTo(620, 7); g.lineTo(-160, 7); g.closePath(); g.fill(); g.stroke();
    [-120, -40, 120, 260, 420, 560].forEach(x => { g.fillStyle = '#8f96a6'; g.fillRect(x, -8, 6, 16); g.strokeRect(x, -8, 6, 16); });
    g.fillStyle = '#a3202a'; g.beginPath(); g.moveTo(-160, -11); g.lineTo(-190, -6); g.lineTo(-200, 0); g.lineTo(-190, 6); g.lineTo(-160, 11); g.closePath(); g.fill(); g.stroke(); // red pommel
    g.fillStyle = '#c9a659'; g.beginPath(); g.moveTo(612, -22); g.lineTo(640, -26); g.lineTo(648, 0); g.lineTo(640, 26); g.lineTo(612, 22); g.closePath(); g.fill(); g.stroke(); // brass guard
    // blade: long, slightly curved, single edge on top
    g.beginPath(); g.moveTo(646, -18); g.quadraticCurveTo(840, -70, 1050, -64); g.quadraticCurveTo(980, -20, 900, 14); g.quadraticCurveTo(780, 26, 646, 18); g.closePath();
    const bl = g.createLinearGradient(0, -70, 0, 26); bl.addColorStop(0, '#e8eef8'); bl.addColorStop(0.18, '#9fb0c8'); bl.addColorStop(0.55, '#4a5266'); bl.addColorStop(1, '#262a36');
    g.fillStyle = bl; g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(660, -20); g.quadraticCurveTo(840, -64, 1030, -60); g.stroke();
    g.strokeStyle = 'rgba(20,24,34,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(660, 2); g.quadraticCurveTo(820, -10, 960, -22); g.stroke(); // fuller
    return { img: c, ox: X0, oy: Y0, s: S, w: Wd * S, h: Ht * S };
  }

  function register() { G.A.axe = paintAxe(); G.A.glaive = paintGlaive(); }

  /* ---------- colour helpers so vector parts take the same lighting as the art ---------- */
  const rgb = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  function lit(hex, fx = {}) {
    let [r, g, b] = rgb(hex);
    if (fx.mul) { const [mr, mg, mb] = rgb(fx.mul), k = fx.mulA ?? 1; r = r * (1 - k + k * mr / 255); g = g * (1 - k + k * mg / 255); b = b * (1 - k + k * mb / 255); }
    if (fx.scr) { const [sr, sg, sb] = rgb(fx.scr), k = fx.scrA ?? 1; r += k * (255 - r) * sr / 255; g += k * (255 - g) * sg / 255; b += k * (255 - b) * sb / 255; }
    if (fx.sil) { const [sr, sg, sb] = rgb(fx.sil), k = fx.silA ?? 1; r += (sr - r) * k; g += (sg - g) * k; b += (sb - b) * k; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  /* ---------- legs ----------
     Front-facing two-bone legs. pose per leg: { spread (rad, outward), lift (0..1 knee toward camera),
     bend (knee), kneel (0..1 knee on the ground) }. Lengths are in original-art pixels. */
  const LEGS = {
    takuto: { hips: [[305, 752], [440, 752]], thigh: 405, shin: 380, w: [150, 112, 94], pants: '#2e2e37', shade: '#1a1a20', hi: '#55556a', strap: '#3ec9c0', boot: '#1d1c22', bootHi: '#56545f', lace: '#c43642', foot: 112, bag: 1.1 },
    sieg: { hips: [[282, 772], [446, 772]], thigh: 390, shin: 365, w: [160, 120, 98], pants: '#2a2f40', shade: '#181b26', hi: '#46506a', strap: null, boot: '#5a4232', bootHi: '#8a6a52', lace: '#2a1e16', foot: 104, tear: true, bag: 1.0 },
    sable: { hips: [[250, 800], [384, 800]], thigh: 410, shin: 380, w: [150, 116, 92], pants: '#16171c', shade: '#0b0b0e', hi: '#33353f', strap: null, boot: '#0d0d10', bootHi: '#4a4c58', lace: null, foot: 96, shoe: true, crease: true, bag: 0.95 },
    nemu: { hips: [[452, 800]], thigh: 80, shin: 80, w: [160, 150, 128], pants: '#3b4049', shade: '#2a2e36', hi: '#565c6a', strap: null, boot: '#ebe8e4', bootHi: '#ffffff', lace: '#9a9590', foot: 90, bag: 1.3 },
  };
  function contour(g, P, Wd) { // smooth outline around a polyline with per-point widths
    const L = [], R = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      L.push([P[i][0] + nx * Wd[i] / 2, P[i][1] + ny * Wd[i] / 2]); R.push([P[i][0] - nx * Wd[i] / 2, P[i][1] - ny * Wd[i] / 2]);
    }
    const pts = [...L, ...R.reverse()];
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); g.closePath();
    return { L, R: R.reverse() };
  }
  function legs(name, hipScreen, sc, rot, poses, fx = {}) {
    const L = LEGS[name], g = G.ctx; if (!L) return;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    const col = k => lit(L[k], fx), lw = Math.max(1.2, 6 * sc);
    hipScreen.forEach((H, i) => {
      const p = poses[i] || {}, side = hipScreen.length === 1 ? 1 : (i === 0 ? -1 : 1), lift = p.lift || 0, kneel = p.kneel || 0;
      const tl = L.thigh * sc * (1 - 0.45 * lift) * (1 - 0.15 * kneel), sl = L.shin * sc * (1 - 0.3 * lift);
      const ta = (p.spread ?? 0.05) * side + rot;
      const K = [H[0] + Math.sin(ta) * tl, H[1] + Math.cos(ta) * tl];
      const sa = ta + (p.shin || 0) * side - lift * 0.25 * side;
      let A = [K[0] + Math.sin(sa) * sl, K[1] + Math.cos(sa) * sl];
      if (kneel) A = [K[0] + side * 30 * sc, K[1] + sl * (1 - kneel * 0.75)];
      const bag = L.bag || 1, [w0, w1, w2] = L.w.map(w => w * sc * bag);
      const mid = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      const P = [H, mid(H, K, 0.45), mid(H, K, 0.85), K, mid(K, A, 0.4), mid(K, A, 0.82), A];
      const Wd = [w0, w0 * 1.04, w1 * 1.06, w1, w1 * 1.02, w2 * (L.shoe ? 0.95 : 1.12), w2 * (L.shoe ? 0.9 : 1.18)];
      if (fx.glow) { g.save(); g.shadowColor = fx.glow.c; g.shadowBlur = (fx.glow.r || 16) * G.K; g.globalAlpha = (fx.glow.a ?? 0.6) * (fx.a ?? 1); g.fillStyle = fx.glow.c; contour(g, P, Wd); g.fill(); g.restore(); }
      g.globalAlpha = fx.a ?? 1;
      // boot / shoe (front view) drawn first; the trouser hem overlaps it
      const bw = w2 * (L.shoe ? 1.15 : 1.42), bh = L.foot * sc, bx = A[0], by = A[1];
      g.fillStyle = col('boot'); g.strokeStyle = OUT; g.lineWidth = lw;
      g.beginPath(); g.moveTo(bx - bw * 0.4, by - bh * (L.shoe ? 0.25 : 0.95)); g.lineTo(bx + bw * 0.4, by - bh * (L.shoe ? 0.25 : 0.95));
      g.lineTo(bx + bw * 0.52, by + bh * 0.15); g.quadraticCurveTo(bx + bw * 0.62, by + bh * 0.62, bx, by + bh * 0.64); g.quadraticCurveTo(bx - bw * 0.62, by + bh * 0.62, bx - bw * 0.52, by + bh * 0.15); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = col('bootHi'); g.beginPath(); g.ellipse(bx - bw * 0.14, by + bh * 0.26, bw * 0.2, bh * 0.12, -0.25, 0, 7); g.fill();
      g.fillStyle = OUT; g.beginPath(); g.ellipse(bx, by + bh * 0.6, bw * 0.6, Math.max(2, bh * 0.1), 0, 0, 7); g.fill(); // sole
      if (L.lace) { g.strokeStyle = col('lace'); g.lineWidth = Math.max(1, 4 * sc); for (let k = 0; k < 3; k++) { const yy = by - bh * 0.78 + k * bh * 0.24; g.beginPath(); g.moveTo(bx - bw * 0.15, yy); g.lineTo(bx + bw * 0.15, yy + bh * 0.13); g.moveTo(bx + bw * 0.15, yy); g.lineTo(bx - bw * 0.15, yy + bh * 0.13); g.stroke(); } }
      // trousers
      g.fillStyle = col('pants'); const ct = contour(g, P, Wd); g.fill();
      g.save(); contour(g, P, Wd); g.clip(); // inner-side shading and folds
      const inner = side < 0 ? ct.R : ct.L;
      g.fillStyle = col('shade'); g.globalAlpha = (fx.a ?? 1) * 0.75; g.beginPath(); g.moveTo(inner[0][0], inner[0][1]); inner.forEach(q => g.lineTo(q[0], q[1])); for (let k = P.length - 1; k >= 0; k--) { const q = P[k], o = side < 0 ? -1 : 1; g.lineTo(q[0] + o * Wd[k] * 0.06, q[1]); } g.closePath(); g.fill();
      g.globalAlpha = fx.a ?? 1; g.strokeStyle = col('hi'); g.lineWidth = Math.max(1, 5 * sc); const outer = side < 0 ? ct.L : ct.R;
      g.beginPath(); outer.slice(1, 6).forEach((q, k) => { const c2 = [q[0] * 0.8 + P[k + 1][0] * 0.2, q[1]]; k ? g.lineTo(c2[0], c2[1]) : g.moveTo(c2[0], c2[1]); }); g.stroke();
      g.strokeStyle = col('shade'); g.lineWidth = Math.max(1, 4 * sc);
      [[2, 0.32], [3, 0.28], [5, 0.4], [6, 0.35]].forEach(([k, f]) => { const q = P[k], w = Wd[k]; g.beginPath(); g.moveTo(q[0] - w * f, q[1] - 10 * sc); g.quadraticCurveTo(q[0], q[1] + 8 * sc, q[0] + w * f * 0.8, q[1] - 14 * sc); g.stroke(); });
      if (L.crease) { g.strokeStyle = col('hi'); g.lineWidth = Math.max(1, 3 * sc); g.beginPath(); g.moveTo(P[0][0], P[0][1]); P.forEach(q => g.lineTo(q[0], q[1])); g.stroke(); }
      g.restore();
      g.save(); contour(g, P, Wd); g.clip(); const og = g.createLinearGradient(H[0], H[1], K[0], K[1]); og.addColorStop(0, 'rgba(8,4,8,0.85)'); og.addColorStop(0.35, 'rgba(8,4,8,0)'); g.fillStyle = og; g.fillRect(H[0] - w0, H[1] - 10, w0 * 2, tl * 0.6); g.restore(); // shadow under the coat
      g.strokeStyle = OUT; g.lineWidth = lw; contour(g, P, Wd); g.stroke();
      if (L.strap) { // cargo pocket + teal strap, like the jacket
        const m = mid(H, K, 0.55), wpk = w0 * 0.42, hpk = 92 * sc, px = m[0] + side * w0 * 0.12 - wpk / 2;
        g.fillStyle = col('shade'); g.strokeStyle = OUT; g.lineWidth = lw * 0.8; g.beginPath(); g.rect(px, m[1] - hpk / 2, wpk, hpk); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(px, m[1] - hpk / 2 + 18 * sc); g.lineTo(px + wpk, m[1] - hpk / 2 + 18 * sc); g.stroke();
        const s0 = mid(H, K, 0.2), s1 = mid(H, K, 0.24); g.strokeStyle = lit(L.strap, fx); g.lineWidth = Math.max(1.5, 12 * sc);
        g.beginPath(); g.moveTo(s0[0] - w0 * 0.52, s0[1]); g.lineTo(s1[0] + w0 * 0.52, s1[1]); g.stroke();
      }
      if (L.tear && i === 0) { g.fillStyle = lit('#c79a84', fx); g.strokeStyle = OUT; g.lineWidth = lw * 0.7; g.beginPath(); g.ellipse(K[0], K[1] - 20 * sc, w1 * 0.22, 14 * sc, 0, 0, 7); g.fill(); g.stroke(); }
    });
    g.restore();
  }
  // a standard walk cycle for front-facing legs
  function walk(ph, amt = 1) { const s = Math.sin(ph); return [{ lift: Math.max(0, s) * 0.55 * amt, spread: 0.05 }, { lift: Math.max(0, -s) * 0.55 * amt, spread: 0.05 }]; }

  return { register, legs, walk, lit, LEGS };
})();
