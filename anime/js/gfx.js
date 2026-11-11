/* RUINBREAKER — rendering toolkit: art compositing, painted backgrounds, FX, typography.
   All drawing is a pure function of time so any frame can be rendered on demand. */
'use strict';

const GFX = (() => {
  const W = 1280, H = 720;
  let ctx = null, K = 1; // main context, device px per logical px
  const FONT = {
    disp: '"Big Shoulders Display", "Oswald", "Arial Narrow", Impact, sans-serif',
    jp: '"Dela Gothic One", "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
    sub: '"Noto Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  /* ---------- math ---------- */
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inv = (a, b, x) => clamp((x - a) / (b - a));
  const ease = {
    io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    out5: t => 1 - Math.pow(1 - t, 5),
    back: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };
  const hash = (i, s = 0) => { let x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // smooth 1D noise
  const vnoise = (x, s = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, s), hash(i + 1, s), u); };
  const twos = (t, fps = 12) => Math.floor(t * fps); // "animated on twos" ticks

  /* ---------- canvases ---------- */
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  const scratchPool = [];
  function scratch(i, w, h) {
    let s = scratchPool[i];
    if (!s) { s = canvas(w, h); scratchPool[i] = s; }
    if (s.width < w || s.height < h) { s.width = Math.max(s.width, Math.ceil(w)); s.height = Math.max(s.height, Math.ceil(h)); }
    const c = s.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
    c.clearRect(0, 0, w + 2, h + 2);
    return { c, s };
  }
  const hasFilter = (() => { try { const c = document.createElement('canvas').getContext('2d'); return typeof c.filter === 'string' && (c.filter = 'blur(2px)', c.filter === 'blur(2px)'); } catch (e) { return false; } })();

  /* ---------- assets ---------- */
  // ox/oy/s map original-art coordinates to asset pixels: asset = (orig - o) * s
  const DEFS = {
    takuto: { ox: 3, oy: 3, s: 2 }, nemu: { ox: 250, oy: 0, s: 1.5 }, nemu_chibi: { ox: 33, oy: 105, s: 1.5 }, nemu_gg: { ox: 296, oy: 339, s: 2 },
    sieg: { ox: 2, oy: 40, s: 1.5 }, sable: { ox: 72, oy: 3, s: 1.5 }, shield: { ox: 23, oy: 77, s: 1.5 }, haruki: { ox: 58, oy: 0, s: 1.5 },
    rin: { ox: 0, oy: 31, s: 1.5 }, rin_face: { ox: 345, oy: 17, s: 1.5 }, wick: { ox: 129, oy: 302, s: 1 },
    gideon: {}, valentine: {}, vesper: {}, lucien: {}, akuro: {},
    m_redgiant: { oy: 128 }, m_hydra: { oy: 95 }, m_golem: { oy: 150 }, m_morvudd: { oy: 125 }, m_plume: {}, m_wolf: {}, m_tyr: { ox: 128 },
  };
  const A = {};
  function loadAssets(base, onProgress) {
    const names = Object.keys(DEFS); let done = 0;
    return Promise.all(names.map(nm => new Promise((res, rej) => {
      const img = new Image(); img.decoding = 'async';
      img.onload = () => { const d = DEFS[nm]; A[nm] = { img, ox: d.ox || 0, oy: d.oy || 0, s: d.s || 1, w: img.naturalWidth, h: img.naturalHeight }; done++; onProgress && onProgress(done / names.length); res(); };
      img.onerror = () => rej(new Error('Could not load ' + nm));
      img.src = base + nm + '.webp';
    })));
  }

  /* ---------- derived art (cached) ---------- */
  const cache = new Map();
  function glowOf(nm, color) { // blurred, tinted silhouette for rim/aura light
    const key = 'g|' + nm + '|' + color; if (cache.has(key)) return cache.get(key);
    const a = A[nm], sw = Math.max(8, Math.round(a.w / 14)), sh = Math.max(8, Math.round(a.h / 14));
    const s1 = canvas(sw, sh), c1 = s1.getContext('2d'); c1.drawImage(a.img, 0, 0, sw, sh);
    const s2 = canvas(sw * 3, sh * 3), c2 = s2.getContext('2d'); c2.imageSmoothingQuality = 'high';
    c2.drawImage(s1, 0, 0, sw * 3, sh * 3); c2.globalCompositeOperation = 'source-in'; c2.fillStyle = color; c2.fillRect(0, 0, sw * 3, sh * 3);
    const s3 = canvas(sw * 2, sh * 2), c3 = s3.getContext('2d'); c3.drawImage(s2, 0, 0, sw * 2, sh * 2); // second blur pass
    cache.set(key, s3); return s3;
  }
  const tintCache = new Map(), q = v => v == null ? '' : (Math.round(v * 20) / 20).toFixed(2);
  function tintOf(nm, fx) {
    const key = [nm, fx.mul || '', q(fx.mulA ?? (fx.mul ? 1 : null)), fx.scr || '', q(fx.scrA ?? (fx.scr ? 1 : null)), fx.sil || '', q(fx.silA ?? (fx.sil ? 1 : null))].join('|');
    let c = tintCache.get(key);
    if (c) { tintCache.delete(key); tintCache.set(key, c); return c; }
    const a = A[nm]; c = canvas(a.w, a.h); const g = c.getContext('2d');
    g.drawImage(a.img, 0, 0);
    if (fx.mul) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = +q(fx.mulA ?? 1); g.fillStyle = fx.mul; g.fillRect(0, 0, a.w, a.h); }
    if (fx.scr) { g.globalCompositeOperation = 'screen'; g.globalAlpha = +q(fx.scrA ?? 1); g.fillStyle = fx.scr; g.fillRect(0, 0, a.w, a.h); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(a.img, 0, 0);
    if (fx.sil) { g.globalCompositeOperation = 'source-atop'; g.globalAlpha = +q(fx.silA ?? 1); g.fillStyle = fx.sil; g.fillRect(0, 0, a.w, a.h); }
    tintCache.set(key, c);
    while (tintCache.size > 16) { const k0 = tintCache.keys().next().value, old = tintCache.get(k0); tintCache.delete(k0); old.width = old.height = 1; }
    return c;
  }
  function duo(nm, dark, light) { // two-tone print look used for ink and title sequences
    const key = 'd|' + nm + '|' + dark + '|' + light; if (cache.has(key)) return cache.get(key);
    const a = A[nm], s = canvas(a.w, a.h), c = s.getContext('2d');
    c.drawImage(a.img, 0, 0);
    c.globalCompositeOperation = 'saturation'; c.fillStyle = '#000'; c.fillRect(0, 0, a.w, a.h);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = light; c.fillRect(0, 0, a.w, a.h);
    c.globalCompositeOperation = 'screen'; c.fillStyle = dark; c.fillRect(0, 0, a.w, a.h);
    c.globalCompositeOperation = 'destination-in'; c.drawImage(a.img, 0, 0);
    cache.set(key, s); return s;
  }

  /* ---------- art compositing ----------
     fig(nm, cx, cy, ax, ay, sc, fx): draws the asset so original-art point (ax,ay) lands at
     screen (cx,cy), sc = screen px per original px. fx: a, mul, mulA, scr, scrA, sil, silA,
     glow:{c,a,r}, flip, rot, blur, comp, src (canvas override), clip:[x,y,w,h] in orig coords */
  function fig(nm, cx, cy, ax, ay, sc, fx = {}) {
    const a = A[nm]; if (!a) return;
    const img = fx.src || a.img;
    let sx = 0, sy = 0, sw = a.w, sh = a.h;
    if (fx.clip) { const [x, y, w, h] = fx.clip; sx = (x - a.ox) * a.s; sy = (y - a.oy) * a.s; sw = w * a.s; sh = h * a.s; }
    const k = sc / a.s; // screen px per asset px
    let dx = cx - (ax - a.ox) * sc + sx * k, dy = cy - (ay - a.oy) * sc + sy * k, dw = sw * k, dh = sh * k;
    if (fx.flip) dx = 2 * cx - dx - dw;
    if (fx.rot) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(fx.rot); ctx.translate(-cx, -cy); }
    if (fx.glow) {
      const g = glowOf(nm, fx.glow.c), r = fx.glow.r || 30;
      ctx.save(); ctx.globalAlpha = (fx.glow.a ?? 0.8) * (fx.a ?? 1); ctx.globalCompositeOperation = fx.glow.comp || 'lighter';
      const gx = cx - (ax - a.ox) * sc, gy = cy - (ay - a.oy) * sc, gw = a.w * k, gh = a.h * k;
      ctx.drawImage(g, (fx.flip ? 2 * cx - gx - gw : gx) - r, gy - r, gw + 2 * r, gh + 2 * r); ctx.restore();
    }
    if (!fx.glowOnly) {
      if ((fx.mul || fx.scr || fx.sil) && !fx.flip && !fx.src) { // static lighting: tint once, then reuse
        const tinted = tintOf(nm, fx);
        drawFx(tinted, sx, sy, sw, sh, dx, dy, dw, dh, { a: fx.a, comp: fx.comp, blur: fx.blur }, !fx.rot);
      } else drawFx(img, sx, sy, sw, sh, dx, dy, dw, dh, fx, !fx.rot);
    }
    if (fx.rot) ctx.restore();
  }
  function drawFx(img, sx, sy, sw, sh, dx, dy, dw, dh, fx, clipToScreen) {
    if (clipToScreen) { // only process what is on screen
      const m = 60, x0 = Math.max(dx, -m), y0 = Math.max(dy, -m), x1 = Math.min(dx + dw, W + m), y1 = Math.min(dy + dh, H + m);
      if (x1 <= x0 || y1 <= y0) return;
      const fx0 = (x0 - dx) / dw, fy0 = (y0 - dy) / dh, fx1 = (x1 - dx) / dw, fy1 = (y1 - dy) / dh;
      if (fx.flip) { const t0 = 1 - fx1, t1 = 1 - fx0; sx += t0 * sw; sw *= (t1 - t0); } else { sx += fx0 * sw; sw *= (fx1 - fx0); }
      sy += fy0 * sh; sh *= (fy1 - fy0); dx = x0; dy = y0; dw = x1 - x0; dh = y1 - y0;
    }
    const plain = !fx.mul && !fx.scr && !fx.sil && !fx.flip;
    ctx.save();
    ctx.globalAlpha = fx.a ?? 1; if (fx.comp) ctx.globalCompositeOperation = fx.comp;
    if (fx.blur && hasFilter) ctx.filter = 'blur(' + (fx.blur * K).toFixed(1) + 'px)';
    if (plain) { ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); ctx.restore(); return; }
    const cw = Math.min(2600, Math.ceil(dw * K)), ch = Math.min(2600, Math.ceil(dh * K));
    const { c, s } = scratch(0, cw, ch);
    if (fx.flip) { c.translate(cw, 0); c.scale(-1, 1); }
    c.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (fx.mul) { c.globalCompositeOperation = 'multiply'; c.globalAlpha = fx.mulA ?? 1; c.fillStyle = fx.mul; c.fillRect(0, 0, cw, ch); }
    if (fx.scr) { c.globalCompositeOperation = 'screen'; c.globalAlpha = fx.scrA ?? 1; c.fillStyle = fx.scr; c.fillRect(0, 0, cw, ch); }
    if (fx.sil) { c.globalCompositeOperation = 'source-atop'; c.globalAlpha = fx.silA ?? 1; c.fillStyle = fx.sil; c.fillRect(0, 0, cw, ch); }
    if (fx.mul || fx.scr) { // restore original alpha
      c.globalAlpha = 1; c.globalCompositeOperation = 'destination-in';
      if (fx.flip) { c.translate(cw, 0); c.scale(-1, 1); }
      c.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch); c.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.drawImage(s, 0, 0, cw, ch, dx, dy, dw, dh);
    ctx.restore();
  }
  // full-frame "panel" art: cover a rect with an image (object-fit: cover), with focus point and zoom
  function cover(nm, rx, ry, rw, rh, fxp = 0.5, fyp = 0.5, zoom = 1, fx = {}) {
    const a = A[nm]; const img = fx.src || a.img;
    const s = Math.max(rw / a.w, rh / a.h) * zoom;
    const vw = rw / s, vh = rh / s;
    const sx = clamp(fxp * a.w - vw / 2, 0, a.w - vw), sy = clamp(fyp * a.h - vh / 2, 0, a.h - vh);
    ctx.save(); ctx.globalAlpha = fx.a ?? 1; if (fx.comp) ctx.globalCompositeOperation = fx.comp;
    ctx.drawImage(img, sx, sy, vw, vh, rx, ry, rw, rh); ctx.restore();
  }

  /* ---------- basic drawing ---------- */
  function fill(c, a = 1, comp) { ctx.save(); ctx.globalAlpha = a; if (comp) ctx.globalCompositeOperation = comp; ctx.fillStyle = c; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); }
  function vgrad(stops, x = 0, y = 0, w = W, h = H) { const g = ctx.createLinearGradient(0, y, 0, y + h); stops.forEach(([p, c]) => g.addColorStop(p, c)); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  function radial(x, y, r, c0, c1 = 'rgba(0,0,0,0)', a = 1, comp) {
    ctx.save(); ctx.globalAlpha = a; if (comp) ctx.globalCompositeOperation = comp;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }
  function txt(s, x, y, o = {}) {
    const { font = '600 28px ' + FONT.sub, fill: f = '#fff', stroke = null, lw = 6, align = 'center', base = 'alphabetic', a = 1, ls = 0, comp } = o;
    ctx.save(); ctx.globalAlpha = a; if (comp) ctx.globalCompositeOperation = comp; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = base;
    if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
    if (stroke) { ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeText(s, x, y); }
    ctx.fillStyle = f; ctx.fillText(s, x, y); ctx.restore();
  }
  function measure(s, font, ls = 0) { ctx.save(); ctx.font = font; if ('letterSpacing' in ctx) ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.restore(); return w; }

  /* ---------- particles (pure functions of t) ---------- */
  function rain(t, o = {}) {
    const { n = 260, speed = 1500, ang = 0.18, len = 26, a = 0.35, color = '#b9c8e0', seed = 1, y0 = 0, y1 = H, lw = 1.1 } = o;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
    const span = (y1 - y0) + len, dx = Math.tan(ang) * len;
    for (let i = 0; i < n; i++) {
      const r1 = hash(i, seed), r2 = hash(i, seed + 1), r3 = hash(i, seed + 2);
      const sp = speed * (0.75 + r3 * 0.5), yy = ((r2 * span + t * sp) % span) + y0 - len;
      const xx = ((r1 * (W + 300) - 150 - yy * Math.tan(ang)) % (W + 300) + W + 300) % (W + 300) - 150;
      const l = len * (0.6 + r3 * 0.6); ctx.moveTo(xx, yy); ctx.lineTo(xx + dx * l / len, yy + l);
    }
    ctx.stroke(); ctx.restore();
  }
  function splashes(t, o = {}) {
    const { n = 40, y0 = 560, y1 = 720, a = 0.4, seed = 3, color = '#c9d6ea' } = o;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const per = 0.35 + hash(i, seed) * 0.4, ph = (t / per + hash(i, seed + 1)) % 1, cyc = Math.floor(t / per + hash(i, seed + 1));
      const x = hash(i * 31 + cyc, seed + 2) * W, y = lerp(y0, y1, hash(i * 17 + cyc, seed + 3)), sc = 0.5 + (y - y0) / (y1 - y0);
      ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.ellipse(x, y, (2 + ph * 9) * sc, (0.6 + ph * 2.2) * sc, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  function motes(t, o = {}) { // embers / ash / wisps / dust
    const { n = 60, vy = -40, vx = 10, wob = 20, size = 2.2, color = '#ff7a3a', a = 0.8, seed = 9, glow = true, x0 = 0, x1 = W, y0 = 0, y1 = H, flick = true } = o;
    ctx.save(); if (glow) ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = color;
    const hgt = y1 - y0 + 40;
    for (let i = 0; i < n; i++) {
      const r = hash(i, seed), r2 = hash(i, seed + 1), r3 = hash(i, seed + 2);
      const sp = 0.6 + r3 * 0.8;
      let y = (r2 * hgt + t * vy * sp) % hgt; if (y < 0) y += hgt; y += y0 - 20;
      const x = x0 + ((r * (x1 - x0) + t * vx * sp + Math.sin(t * (0.6 + r3) + i) * wob) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
      const s = size * (0.5 + r3);
      ctx.globalAlpha = a * (flick ? 0.55 + 0.45 * Math.sin(t * (3 + r * 5) + i) : 1) * (0.4 + r2 * 0.6);
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function focusLines(cx, cy, t, o = {}) {
    const { n = 90, color = '#fff', a = 0.75, inner = 230, seed = 4, fps = 24 } = o, tk = twos(t, fps);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath();
    const R = Math.hypot(W, H);
    for (let i = 0; i < n; i++) {
      const ang = hash(i, seed + tk) * Math.PI * 2, wdt = 0.004 + hash(i, seed + tk + 50) * 0.012, r0 = inner * (0.8 + hash(i, tk + 9) * 0.9);
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang - wdt) * R, cy + Math.sin(ang - wdt) * R);
      ctx.lineTo(cx + Math.cos(ang + wdt) * R, cy + Math.sin(ang + wdt) * R);
    }
    ctx.fill(); ctx.restore();
  }
  function dashLines(t, o = {}) {
    const { n = 70, color = '#fff', a = 0.5, dir = 1, seed = 6, fps = 30 } = o, tk = twos(t, fps);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const y = hash(i, seed + tk) * H, l = 120 + hash(i, seed + tk + 3) * 520, x = hash(i, seed + tk + 7) * (W + l) - l, th = 0.6 + hash(i, tk) * 2.2;
      ctx.fillRect(dir > 0 ? x : W - x - l, y, l, th);
    }
    ctx.restore();
  }

  /* ---------- post FX ---------- */
  let grainC = null, vigC = null;
  function initPost() {
    grainC = canvas(256, 256); const g = grainC.getContext('2d'), id = g.createImageData(256, 256), R = rng(99);
    for (let i = 0; i < id.data.length; i += 4) { const v = 110 + R() * 40; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
    vigC = canvas(W / 2, H / 2); const v = vigC.getContext('2d'), rg = v.createRadialGradient(W / 4, H / 4, H * 0.18, W / 4, H / 4, W * 0.36);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.62)'); v.fillStyle = rg; v.fillRect(0, 0, W / 2, H / 2);
  }
  function grain(t, a = 0.07) {
    const tk = twos(t, 24); ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor(hash(tk, 1) * 256), oy = Math.floor(hash(tk, 2) * 256);
    const pat = ctx.createPattern(grainC, 'repeat'); ctx.translate(-ox, -oy); ctx.fillStyle = pat; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  }
  function vignette(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(vigC, 0, 0, W, H); ctx.restore(); }
  function impact(mode = 'inv') { // classic anime impact frame
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (mode === 'inv') { ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'color-burn'; ctx.fillStyle = '#7a7a7a'; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function desat(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#000'; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore(); }
  function grade(color, a = 1, comp = 'multiply') { fill(color, a, comp); }
  function letterbox(p = 1, h = 70) { if (p <= 0) return; ctx.save(); ctx.fillStyle = '#000'; const hh = h * p; ctx.fillRect(-50, -50, W + 100, hh + 50); ctx.fillRect(-50, H - hh, W + 100, hh + 50); ctx.restore(); }

  /* ---------- painted environments (pre-rendered layers) ---------- */
  const L = {}; // layers
  const LW = 1600, LH = 900, LX = (W - LW) / 2, LY = (H - LH) / 2;
  function layer(c, cam, d) { // parallax layer, cam = {x,y,z}
    const z = 1 + (cam.z - 1) * d, ox = -cam.x * d, oy = -cam.y * d;
    ctx.save(); ctx.translate(W / 2 + ox, H / 2 + oy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(c, LX, LY, LW, LH); ctx.restore();
  }
  function withCam(cam, d, fn) { const z = 1 + (cam.z - 1) * d; ctx.save(); ctx.translate(W / 2 - cam.x * d, H / 2 - cam.y * d); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); fn(); ctx.restore(); }
  let texDark = null, texLight = null;
  function buildTex() {
    const mk = (col, seed) => { const c = canvas(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256), R = rng(seed);
      const grid = []; for (let i = 0; i < 4; i++) { const n = 4 << i, a = []; for (let k = 0; k < n * n; k++) a.push(R()); grid.push([n, a]); }
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { let v = 0, amp = 0.5;
        grid.forEach(([n, a]) => { const fx = x / 256 * n, fy = y / 256 * n, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy, q = (i, j) => a[((iy + j) % n) * n + ((ix + i) % n)];
          const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty); v += amp * lerp(lerp(q(0, 0), q(1, 0), sx), lerp(q(0, 1), q(1, 1), sx), sy); amp *= 0.5; });
        const o = (y * 256 + x) * 4; id.data[o] = col[0]; id.data[o + 1] = col[1]; id.data[o + 2] = col[2]; id.data[o + 3] = Math.max(0, Math.min(255, (v - 0.45) * 420)); }
      g.putImageData(id, 0, 0); return c; };
    texDark = mk([10, 4, 12], 3); texLight = mk([255, 230, 210], 9);
  }
  function paintTex(g, da = 0.22, la = 0.08) { // mottled, hand-painted look on whatever is already drawn
    if (!texDark) buildTex();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = da; g.fillStyle = g.createPattern(texDark, 'repeat'); g.fillRect(0, 0, LW, LH);
    g.globalAlpha = la; g.fillStyle = g.createPattern(texLight, 'repeat'); g.translate(97, 53); g.fillRect(-97, -53, LW, LH); g.restore();
  }
  function mkLayer(fn, tex = [0.22, 0.08]) { const c = canvas(LW, LH), g = c.getContext('2d'); g.translate(-LX, -LY); fn(g); if (tex) paintTex(g, tex[0], tex[1]); return c; }

  function buildEarth() {
    L.eSky = mkLayer(g => {
      const gr = g.createLinearGradient(0, LY, 0, 620); gr.addColorStop(0, '#05070e'); gr.addColorStop(0.45, '#0e1424'); gr.addColorStop(0.8, '#2b2236'); gr.addColorStop(1, '#4a2f39');
      g.fillStyle = gr; g.fillRect(LX, LY, LW, LH);
      const R = rng(12);
      for (let i = 0; i < 26; i++) { // low clouds lit by city glow
        const x = LX + R() * LW, y = 80 + R() * 260, rx = 120 + R() * 260, ry = 30 + R() * 50;
        const cg = g.createRadialGradient(x, y + ry * 0.4, 0, x, y, rx); cg.addColorStop(0, 'rgba(110,70,80,0.30)'); cg.addColorStop(1, 'rgba(40,30,50,0)');
        g.fillStyle = cg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
      }
    });
    L.eCity = mkLayer(g => {
      const R = rng(31); let x = LX;
      while (x < LX + LW) {
        const w = 30 + R() * 100, h = 50 + Math.pow(R(), 1.6) * 210, top = 455 - h;
        g.fillStyle = R() < 0.5 ? '#0b0e18' : '#0f1320'; g.fillRect(x, top, w, h + 60);
        for (let wy = top + 8; wy < 450; wy += 11) for (let wx = x + 5; wx < x + w - 6; wx += 9) {
          const q = R(); if (q < 0.13) { g.fillStyle = q < 0.03 ? 'rgba(160,200,255,0.55)' : 'rgba(255,205,130,' + (0.35 + R() * 0.5).toFixed(2) + ')'; g.fillRect(wx, wy, 4, 5); }
        }
        x += w + R() * 6;
      }
    });
    L.eMid = mkLayer(g => {
      // houses left, apartment right
      g.fillStyle = '#07080d';
      g.beginPath(); g.moveTo(LX, 470); g.lineTo(LX, 300); g.lineTo(60, 300); g.lineTo(140, 250); g.lineTo(230, 300); g.lineTo(300, 300); g.lineTo(300, 470); g.fill();
      g.fillRect(1060, 230, 600, 260);
      const R = rng(8);
      for (let i = 0; i < 40; i++) { const wx = 1080 + (i % 10) * 48, wy = 250 + Math.floor(i / 10) * 52; if (R() < 0.45) { g.fillStyle = R() < 0.3 ? 'rgba(170,205,255,0.5)' : 'rgba(255,200,120,0.55)'; g.fillRect(wx, wy, 26, 30); } }
      g.fillStyle = 'rgba(255,190,110,0.5)'; g.fillRect(150, 330, 40, 28); g.fillRect(-60, 340, 50, 30);
      // ground plane
      const gr = g.createLinearGradient(0, 460, 0, LY + LH); gr.addColorStop(0, '#15161c'); gr.addColorStop(1, '#0a0b10'); g.fillStyle = gr; g.fillRect(LX, 462, LW, LH);
      // ballast + rails
      g.fillStyle = '#23211f'; g.fillRect(LX, 470, LW, 58);
      for (let sx = LX; sx < LX + LW; sx += 22) { g.fillStyle = '#2e2a26'; g.fillRect(sx, 476, 12, 46); }
      [484, 514].forEach(y => { g.fillStyle = '#5c6068'; g.fillRect(LX, y, LW, 3); g.fillStyle = 'rgba(200,210,230,0.35)'; g.fillRect(LX, y, LW, 1); });
      // road crossing the tracks toward camera
      g.fillStyle = '#1b1c22'; g.beginPath(); g.moveTo(520, 462); g.lineTo(760, 462); g.lineTo(1150, LY + LH); g.lineTo(130, LY + LH); g.fill();
      g.fillStyle = '#25262d'; g.fillRect(520, 470, 240, 58); // crossing plates
      // stop line + 止まれ
      g.fillStyle = 'rgba(230,230,225,0.75)'; g.beginPath(); g.moveTo(470, 560); g.lineTo(810, 560); g.lineTo(816, 568); g.lineTo(462, 568); g.fill();
      g.save(); g.translate(640, 640); g.scale(1.25, 0.42); g.font = '900 88px ' + FONT.jp; g.textAlign = 'center'; g.fillStyle = 'rgba(225,225,220,0.7)'; g.fillText('止まれ', 0, 0); g.restore();
      // far sidewalk & vending machine body
      g.fillStyle = '#101117'; g.fillRect(800, 440, 400, 24);
      g.fillStyle = '#d8dde6'; g.fillRect(944, 352, 66, 112); g.fillStyle = '#9fb3cf'; g.fillRect(950, 362, 54, 36);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { g.fillStyle = ['#d94a4a', '#3a7bd5', '#e8b23a', '#5bb36b'][(r + c) % 4]; g.fillRect(953 + c * 13, 366 + r * 11, 8, 8); }
      g.fillStyle = '#2a2f38'; g.fillRect(950, 430, 54, 12);
      // poles + wires
      const pole = (x, top, bot, w) => { g.fillStyle = '#0b0c10'; g.fillRect(x - w / 2, top, w, bot - top); g.fillRect(x - w * 3, top + 14, w * 6, 4); g.fillRect(x - w * 2.4, top + 30, w * 4.8, 3); };
      pole(120, 130, 470, 9); pole(1240, 160, 470, 8); pole(690, 300, 466, 4);
      g.strokeStyle = 'rgba(10,10,14,0.95)'; g.lineWidth = 1.4;
      [[120, 146, 690, 316], [120, 162, 690, 322], [690, 316, 1240, 176], [690, 322, 1240, 192], [LX, 120, 120, 146], [1240, 176, LX + LW, 140]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2, Math.max(b, d) + 34, c, d); g.stroke(); });
      // crossing signals: near (big) and far (small)
      const signal = (x, top, base, s) => {
        g.fillStyle = '#16171c'; g.fillRect(x - 4 * s, top, 8 * s, base - top);
        for (let i = 0; i < (base - top) / (16 * s); i++) if (i % 2 === 0) { g.fillStyle = '#1e1f25'; g.fillRect(x - 4 * s, top + i * 16 * s, 8 * s, 8 * s); }
        g.save(); g.translate(x, top + 18 * s);
        [0.62, -0.62].forEach(r => { g.save(); g.rotate(r); for (let k = -5; k < 5; k++) { g.fillStyle = k % 2 ? '#e2c43a' : '#141414'; g.fillRect(k * 7 * s, -5 * s, 7 * s, 10 * s); } g.restore(); });
        g.restore();
        g.fillStyle = '#121318'; g.fillRect(x - 34 * s, top + 52 * s, 68 * s, 6 * s);
        [-24, 24].forEach(o => { g.beginPath(); g.arc(x + o * s, top + 70 * s, 13 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a1a1c'; g.beginPath(); g.arc(x + o * s, top + 70 * s, 9 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = '#121318'; });
        g.fillStyle = '#1a1b20'; g.fillRect(x - 10 * s, top + 92 * s, 20 * s, 34 * s); // bell box
      };
      signal(380, 176, 562, 1.0); signal(872, 316, 470, 0.5);
      // vertical shop signs on the apartment block
      [[1100, 250, '居酒屋', '#ff4a5a'], [1166, 262, 'カラオケ', '#5ad0ff']].forEach(([x, y, txt, col]) => { g.fillStyle = '#120c14'; g.fillRect(x - 18, y - 6, 36, txt.length * 34 + 12); g.font = '400 28px ' + FONT.jp; g.textAlign = 'center'; g.fillStyle = col; [...txt].forEach((ch, k) => g.fillText(ch, x, y + 26 + k * 34)); });
      // street lamp
      g.fillStyle = '#0c0d12'; g.fillRect(232, 250, 6, 300); g.fillRect(232, 250, 38, 5); g.fillStyle = '#e8e2c8'; g.fillRect(262, 254, 16, 6);
    }, [0.18, 0.04]);
  }
  // lamp positions for live glow (logical coords before camera)
  const LAMPS = [[356, 246, 1.0], [404, 246, 1.0], [860, 351, 0.5], [884, 351, 0.5]];
  function earthLive(t, o) { // dynamic parts drawn in world space (call inside withCam d=0.5)
    const { lamps = false, lampPh = 0, gate = 0, cat = 'sit', train = null, bag = false, brokenGate = false } = o;
    // vending machine glow, neon signs, street lamp cone
    radial(977, 410, 140, 'rgba(190,215,255,0.35)', 'rgba(190,215,255,0)', 1, 'lighter');
    const fl = 0.8 + 0.2 * Math.sin(t * 17) * (Math.sin(t * 1.3) > 0.9 ? 1 : 0.15);
    radial(1100, 300, 90, 'rgba(255,60,80,' + (0.45 * fl).toFixed(2) + ')', 'rgba(255,60,80,0)', 1, 'lighter'); radial(1166, 330, 100, 'rgba(80,200,255,0.4)', 'rgba(80,200,255,0)', 1, 'lighter');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lc = ctx.createLinearGradient(0, 260, 0, 560); lc.addColorStop(0, 'rgba(255,240,200,0.28)'); lc.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lc; ctx.beginPath(); ctx.moveTo(262, 260); ctx.lineTo(278, 260); ctx.lineTo(360, 560); ctx.lineTo(180, 560); ctx.closePath(); ctx.fill(); ctx.restore();
    radial(270, 258, 40, 'rgba(255,240,210,0.8)', 'rgba(255,240,210,0)', 1, 'lighter');
    // cat on far side, then the train passes in front of it
    if (cat) drawCat(918, 462, 0.5, cat, t, '#d8e4ff');
    if (train) drawTrain(train.x, train.v);
    // lamps
    if (lamps) {
      const on = Math.floor((t + lampPh) / 0.5) % 2;
      LAMPS.forEach(([x, y, s], i) => {
        const lit = (i % 2) === on;
        if (lit) { ctx.save(); ctx.fillStyle = '#ff3b2f'; ctx.beginPath(); ctx.arc(x, y, 9 * s, 0, Math.PI * 2); ctx.fill(); ctx.restore(); radial(x, y, 120 * s, 'rgba(255,40,30,0.75)', 'rgba(255,40,30,0)', 1, 'lighter'); }
      });
      const on2 = on; // road reflections
      LAMPS.slice(0, 2).forEach(([x], i) => { if ((i % 2) === on2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 560, 0, 900); g.addColorStop(0, 'rgba(255,40,30,0.32)'); g.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = g; ctx.fillRect(x - 18, 560, 36, 360); ctx.restore(); } });
    }
    // vending reflection
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const vg = ctx.createLinearGradient(0, 470, 0, 640); vg.addColorStop(0, 'rgba(170,200,255,0.18)'); vg.addColorStop(1, 'rgba(170,200,255,0)'); ctx.fillStyle = vg; ctx.fillRect(950, 470, 56, 170); ctx.restore();
    // gate arm (pivot at near signal)
    if (brokenGate) {
      ctx.save(); ctx.translate(560, 590); ctx.rotate(0.12); for (let k = 0; k < 9; k++) { ctx.fillStyle = k % 2 ? '#e2c43a' : '#141414'; ctx.fillRect(k * 26, -5, 26, 10); } ctx.restore();
    } else {
      ctx.save(); ctx.translate(392, 436); ctx.rotate(-gate * Math.PI * 0.46);
      for (let k = 0; k < 21; k++) { ctx.fillStyle = k % 2 ? '#e2c43a' : '#141414'; ctx.fillRect(k * 26, -5, 26, 10); }
      ctx.restore(); ctx.fillStyle = '#0d0e12'; ctx.fillRect(382, 426, 22, 22);
    }
    if (bag) drawBag(470, 600);
  }
  function drawTrain(x, v) { // freight train running left->right, x = head position
    const cars = [{ l: 260, c: '#1d2129', loco: true }]; const pal = ['#4b2e26', '#232c3a', '#3c3a35', '#53382a', '#2a3530'];
    for (let i = 0; i < 22; i++) cars.push({ l: 230, c: pal[i % 5] });
    let cx = x;
    ctx.save();
    const blur = Math.min(3, Math.abs(v) / 400);
    for (let b = 0; b < blur + 1; b++) {
      ctx.globalAlpha = b === 0 ? 1 : 0.25; cx = x - b * 14;
      cars.forEach((car, i) => {
        const x1 = cx - car.l; if (cx > -50 && x1 < W + 50) {
          ctx.fillStyle = car.c; ctx.fillRect(x1, car.loco ? 360 : 378, car.l - 10, car.loco ? 116 : 96);
          ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let r = x1 + 10; r < cx - 14; r += 16) ctx.fillRect(r, 382, 2, 88);
          ctx.fillStyle = '#08090b'; ctx.fillRect(x1 - 4, 474, car.l, 12);
          if (car.loco) { ctx.fillStyle = '#c9d2dc'; ctx.fillRect(cx - 52, 372, 36, 24); radial(cx - 6, 450, 200, 'rgba(255,240,200,0.55)', 'rgba(255,240,200,0)', 1, 'lighter'); }
        }
        cx = x1 - 8;
      });
    }
    ctx.restore();
  }
  function drawCat(x, y, s, pose, t, rim = '#9fb6ff') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#040506';
    ctx.beginPath(); ctx.ellipse(0, -30, 26, 32, 0, 0, Math.PI * 2); ctx.fill(); // body
    const tw = Math.sin(t * 1.4) * 6;
    ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.strokeStyle = '#040506'; ctx.beginPath(); ctx.moveTo(20, -8); ctx.quadraticCurveTo(52, -6 + tw, 44, -40 + tw); ctx.stroke(); // tail
    let hx = 6, hy = -66;
    if (pose === 'eat') { hx = -28; hy = -14; }
    if (pose === 'alert') { hx = 4; hy = -74; }
    ctx.beginPath(); ctx.arc(hx, hy, 17, 0, Math.PI * 2); ctx.fill();
    const ears = pose === 'alert' ? 1.25 : 1;
    ctx.beginPath(); ctx.moveTo(hx - 15, hy - 6); ctx.lineTo(hx - 12, hy - 28 * ears); ctx.lineTo(hx - 2, hy - 13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 15, hy - 6); ctx.lineTo(hx + 12, hy - 28 * ears); ctx.lineTo(hx + 2, hy - 13); ctx.fill();
    if (pose !== 'eat') { // eyes
      const blink = (t % 4.3) < 0.12 ? 0.15 : 1;
      ctx.fillStyle = pose === 'alert' ? '#ffd76a' : '#c8f08a';
      [-6, 7].forEach(o => { ctx.beginPath(); ctx.ellipse(hx + o, hy + (pose === 'alert' ? -4 : 0), 3.2, 3.6 * blink, 0, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rim; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(hx, hy, 17, -1.4, 0.2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, -30, 26, 32, 0, -1.2, 0.6); ctx.stroke();
    ctx.restore();
  }
  function drawBag(x, y, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(225,228,235,0.85)'; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-30, -26, -12, -34); ctx.lineTo(-8, -48); ctx.lineTo(-2, -34); ctx.lineTo(8, -34); ctx.lineTo(13, -46); ctx.lineTo(16, -33); ctx.quadraticCurveTo(32, -22, 28, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,130,150,0.5)'; ctx.fillRect(-20, -18, 40, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 2, 34, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function earth(t, cam, o) {
    layer(L.eSky, cam, 0.05);
    // distant aircraft-warning light
    withCam(cam, 0.15, () => { if ((t % 2.4) < 1.2) radial(1180, 222, 26, 'rgba(255,60,50,0.9)', 'rgba(255,60,50,0)', 1, 'lighter'); });
    layer(L.eCity, cam, 0.15);
    if (o.rift) withCam(cam, 0.1, () => drawRift(t, o.rift));
    layer(L.eMid, cam, 0.5);
    withCam(cam, 0.5, () => { earthLive(t, o); if (o.world) o.world(t); });
    // wet sheen on road
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.12; vgrad([[0, 'rgba(0,0,0,0)'], [1, 'rgba(120,140,190,1)']], 0, 560, W, 160); ctx.restore();
  }

  /* ---------- sky crack & rift ---------- */
  let crackPaths = null;
  function buildCrack() {
    const R = rng(77); crackPaths = [];
    const main = []; let x = 120, y = 150; main.push([x, y]);
    while (x < 1180) { x += 30 + R() * 50; y += (R() - 0.45) * 40; main.push([x, y]); }
    crackPaths.push({ pts: main, t0: 0, w: 1 });
    for (let b = 0; b < 16; b++) {
      const i = 2 + Math.floor(R() * (main.length - 4)), [sx, sy] = main[i], pts = [[sx, sy]], dir = R() < 0.5 ? -1 : 1;
      let bx = sx, by = sy; const n = 2 + Math.floor(R() * 5);
      for (let k = 0; k < n; k++) { bx += (R() - 0.5) * 60; by += dir * (14 + R() * 30); pts.push([bx, by]); }
      crackPaths.push({ pts, t0: i / main.length, w: 0.5 });
    }
  }
  function pathLen(pts) { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return l; }
  function strokePartial(pts, f) {
    const tot = pathLen(pts) * f; let acc = 0; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], l = Math.hypot(x1 - x0, y1 - y0);
      if (acc + l >= tot) { const k = (tot - acc) / l; ctx.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); break; }
      ctx.lineTo(x1, y1); acc += l;
    }
    ctx.stroke();
  }
  function drawCrack(t, p, glow = 1) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
    crackPaths.forEach(c => {
      const f = clamp((p - c.t0 * 0.6) / 0.5); if (f <= 0) return;
      const fl = 0.85 + 0.15 * Math.sin(t * 23 + c.t0 * 40);
      [[18 * c.w, 'rgba(255,30,40,0.10)'], [8 * c.w, 'rgba(255,50,50,0.28)'], [3 * c.w, 'rgba(255,140,120,0.8)'], [1.2, 'rgba(255,255,255,0.95)']].forEach(([lw, col]) => {
        ctx.lineWidth = lw * (lw > 2 ? glow * fl : 1); ctx.strokeStyle = col; strokePartial(c.pts, f);
      });
    });
    ctx.restore();
  }
  function drawRift(t, o) { // o: {open 0..1, cx, cy, w, h, eye}
    const { open = 1, cx = 640, cy = 150, w = 560, h = 170, eye = 0, close = 0 } = o;
    const hh = h * open * (1 - close), ww = w * (1 - close * 0.3);
    if (hh < 1) { if (open > 0 && close < 1) drawCrack(t, 1, 0.6); return; }
    radial(cx, cy, ww * 0.85, 'rgba(255,40,50,0.5)', 'rgba(120,0,20,0)', 1, 'lighter');
    const N = 72, pts = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2, nz = vnoise(i * 0.55, 3) * 0.22 + vnoise(i * 2.1 + t * 0.6, 4) * 0.08, jag = (i % 2 ? 0.94 : 1.04);
      const r = (0.82 + nz) * jag;
      pts.push([cx + Math.cos(a) * ww / 2 * r, cy + Math.sin(a) * hh / 2 * r * (0.9 + 0.1 * Math.sin(t * 2.2 + i * 0.3))]);
    }
    const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    ctx.save(); path();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, ww / 2); g.addColorStop(0, '#050002'); g.addColorStop(0.35, '#16000a'); g.addColorStop(0.75, '#5a0414'); g.addColorStop(1, '#d01e34');
    ctx.fillStyle = g; ctx.fill(); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) { // slow vortex of light inside
      const a = hash(i, 3) * Math.PI * 2 + t * (0.25 + hash(i, 4) * 0.5) * (i % 2 ? 1 : -1), rx = ww * (0.08 + hash(i, 5) * 0.42), ry = hh * (0.1 + hash(i, 6) * 0.4);
      ctx.strokeStyle = 'rgba(255,' + (40 + Math.floor(hash(i, 7) * 80)) + ',70,' + (0.18 + hash(i, 8) * 0.3).toFixed(2) + ')'; ctx.lineWidth = 1 + hash(i, 9) * 2.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a, a + 1.2 + hash(i, 10) * 2); ctx.stroke();
    }
    radial(cx, cy, hh * 0.9, 'rgba(255,60,80,0.18)', 'rgba(0,0,0,0)', 1, 'lighter');
    if (eye > 0) { // something watches from inside
      radial(cx + 20, cy, 70 * eye, 'rgba(230,240,255,1)', 'rgba(150,170,255,0)', eye, 'lighter');
      ctx.globalAlpha = eye; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx + 20, cy, 14 * eye, 9 * eye, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,215,255,0.9)'; ctx.lineWidth = 1.5; const tk = twos(t, 12);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); let x = cx + 20, y = cy; ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (hash(i * 7 + k, tk) - 0.3) * 26; y += (hash(i * 11 + k, tk + 1) - 0.5) * 22; ctx.lineTo(x, y); } ctx.stroke(); }
    }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; path();
    ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,30,50,0.16)'; ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,60,70,0.35)'; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,210,200,0.9)'; ctx.stroke(); ctx.restore();
  }
  function riftTunnel(t, p) { // falling through the rift
    fill('#0a0003');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 140; i++) {
      const a = hash(i, 1) * Math.PI * 2, sp = 0.3 + hash(i, 2), z = ((hash(i, 3) + t * sp * 0.9) % 1), r = Math.pow(z, 3) * 1100, l = 20 + z * z * 260;
      ctx.strokeStyle = i % 5 ? 'rgba(255,40,60,' + (z * 0.8).toFixed(2) + ')' : 'rgba(255,230,230,' + (z * 0.9).toFixed(2) + ')'; ctx.lineWidth = 1 + z * 3;
      ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a + t * 0.4) * r, H / 2 + Math.sin(a + t * 0.4) * r); ctx.lineTo(W / 2 + Math.cos(a + t * 0.4) * (r + l), H / 2 + Math.sin(a + t * 0.4) * (r + l)); ctx.stroke();
    }
    ctx.restore();
    radial(W / 2, H / 2, 260, 'rgba(255,255,255,' + (0.2 + p * 0.8).toFixed(2) + ')', 'rgba(255,60,60,0)', 1, 'lighter');
  }

  /* ---------- the other world: Barrow Fields at dusk ---------- */
  function buildBarrow() {
    L.oSky = mkLayer(g => {
      const gr = g.createLinearGradient(0, LY, 0, 520);
      [[0, '#120d24'], [0.3, '#2e1d43'], [0.55, '#6a3255'], [0.75, '#c2585a'], [0.9, '#ee9a62'], [1, '#f7c77e']].forEach(([p, c]) => gr.addColorStop(p, c));
      g.fillStyle = gr; g.fillRect(LX, LY, LW, LH);
      const R = rng(41); for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(255,240,230,' + (R() * 0.6).toFixed(2) + ')'; g.fillRect(LX + R() * LW, LY + R() * 260, 1.4, 1.4); }
      const moon = (x, y, r, c, halo) => {
        const hg = g.createRadialGradient(x, y, r * 0.8, x, y, r * 3); hg.addColorStop(0, halo); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.beginPath(); g.arc(x, y, r * 3, 0, 7); g.fill();
        const mg = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); mg.addColorStop(0, c); mg.addColorStop(1, 'rgba(180,150,160,0.9)'); g.fillStyle = mg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        g.fillStyle = 'rgba(120,90,110,0.18)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(x + (R() - 0.5) * r * 1.3, y + (R() - 0.5) * r * 1.3, r * (0.08 + R() * 0.16), 0, 7); g.fill(); }
      };
      moon(990, 150, 112, '#f6ece2', 'rgba(255,230,220,0.18)'); moon(250, 105, 30, '#e8705e', 'rgba(255,90,70,0.25)');
      for (let i = 0; i < 60; i++) { const y = 230 + R() * 260, x = LX + R() * LW, w = 80 + R() * 260, hh = 2 + R() * 5; const sg = g.createLinearGradient(x - w, 0, x + w, 0); const col = y > 380 ? '255,210,160' : '255,170,190'; sg.addColorStop(0, 'rgba(' + col + ',0)'); sg.addColorStop(0.5, 'rgba(' + col + ',' + (0.06 + R() * 0.1).toFixed(2) + ')'); sg.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = sg; g.fillRect(x - w, y, w * 2, hh); }
    }, [0.12, 0.05]);
    L.oClouds = mkLayer(g => {
      const R = rng(52);
      for (let i = 0; i < 38; i++) {
        const x = LX + R() * LW, y = 200 + R() * 240, rx = 160 + R() * 340, ry = 8 + R() * 20;
        const cg = g.createLinearGradient(0, y - ry, 0, y + ry); cg.addColorStop(0, 'rgba(255,190,150,0.0)'); cg.addColorStop(0.5, 'rgba(255,170,140,' + (0.15 + R() * 0.25).toFixed(2) + ')'); cg.addColorStop(1, 'rgba(110,50,80,0.25)');
        g.fillStyle = cg; [-LW, 0, LW].forEach(o => { g.beginPath(); g.ellipse(x + o, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); });
      }
    });
    const hill = (g, base, amp, f, seed, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(LX, LY + LH); for (let x = LX; x <= LX + LW; x += 8) g.lineTo(x, base - amp * (vnoise(x * f, seed) * 0.7 + vnoise(x * f * 3, seed + 1) * 0.3)); g.lineTo(LX + LW, LY + LH); g.fill(); };
    const grave = (g, x, y, s, R, col) => {
      g.save(); g.translate(x, y); g.rotate((R() - 0.5) * 0.35); g.fillStyle = col; const k = R();
      if (k < 0.45) { g.beginPath(); g.moveTo(-9 * s, 0); g.lineTo(-9 * s, -20 * s); g.arc(0, -20 * s, 9 * s, Math.PI, 0); g.lineTo(9 * s, 0); g.fill(); }
      else if (k < 0.8) { g.fillRect(-2.5 * s, -32 * s, 5 * s, 32 * s); g.fillRect(-10 * s, -24 * s, 20 * s, 5 * s); }
      else { g.beginPath(); g.moveTo(-6 * s, 0); g.lineTo(-4 * s, -40 * s); g.lineTo(0, -48 * s); g.lineTo(4 * s, -40 * s); g.lineTo(6 * s, 0); g.fill(); }
      g.globalCompositeOperation = 'source-atop'; const rg = g.createLinearGradient(2 * s, 0, 10 * s, 0); rg.addColorStop(0, 'rgba(255,170,120,0)'); rg.addColorStop(1, 'rgba(255,170,120,0.55)'); g.fillStyle = rg; g.fillRect(0, -60 * s, 14 * s, 62 * s); g.globalCompositeOperation = 'source-over';
      g.restore();
    };
    const tree = (g, x, y, len, ang, w, d, R, col) => {
      if (d === 0 || len < 3) return; const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      const n = R() < 0.3 ? 3 : 2; for (let i = 0; i < n; i++) tree(g, x2, y2, len * (0.6 + R() * 0.2), ang + (R() - 0.5) * 1.3, w * 0.66, d - 1, R, col);
    };
    L.oFar = mkLayer(g => {
      hill(g, 470, 120, 0.004, 3, '#7a4560');
      g.fillStyle = '#6c3b57'; g.fillRect(300, 330, 14, 110); g.fillRect(292, 330, 30, 8); g.beginPath(); g.moveTo(296, 330); g.lineTo(307, 292); g.lineTo(318, 330); g.fill(); // ruined spire
      g.fillRect(1180, 360, 60, 90); g.beginPath(); g.moveTo(1180, 360); g.lineTo(1190, 340); g.lineTo(1205, 356); g.lineTo(1220, 330); g.lineTo(1240, 360); g.fill();
      const R2 = rng(19); g.fillStyle = '#6e3c58'; for (let x = LX; x < LX + LW; x += 7) { const base = 470 - 120 * (vnoise(x * 0.004, 3) * 0.7 + vnoise(x * 0.012, 4) * 0.3) + 6, h = 10 + R2() * 18; g.beginPath(); g.moveTo(x - 5, base + 4); g.lineTo(x, base - h); g.lineTo(x + 5, base + 4); g.fill(); } // forest line
      g.fillStyle = '#5e3150'; g.beginPath(); g.moveTo(1290, 470); g.lineTo(1320, 300); g.lineTo(1370, 280); g.lineTo(1420, 320); g.lineTo(1440, 470); g.fill(); // cliff
      [[1336, 214, 14, 70], [1356, 190, 16, 94], [1380, 226, 12, 58], [1398, 240, 18, 44]].forEach(([x, y, w, h]) => { g.fillRect(x, y, w, h); g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + w / 2, y - 22); g.lineTo(x + w + 3, y); g.fill(); }); // castle
      g.fillStyle = 'rgba(255,190,120,0.7)'; [[1360, 230], [1384, 250], [1362, 260]].forEach(([x, y]) => g.fillRect(x, y, 3, 5));
      const hz = g.createLinearGradient(0, 380, 0, 520); hz.addColorStop(0, 'rgba(240,150,120,0)'); hz.addColorStop(1, 'rgba(240,150,120,0.45)'); g.fillStyle = hz; g.fillRect(LX, 380, LW, 200);
    }, [0.15, 0.06]);
    L.oMid = mkLayer(g => {
      const R = rng(61); hill(g, 520, 70, 0.006, 7, '#3b2233');
      for (let i = 0; i < 90; i++) { const x = LX + R() * LW, y = 520 - 70 * (vnoise(x * 0.006, 7) * 0.7 + vnoise(x * 0.018, 8) * 0.3) + 6 + R() * 40; grave(g, x, y, 0.6 + R() * 0.5, R, '#2c1828'); }
      tree(g, 200, 470, 50, -Math.PI / 2 - 0.1, 6, 6, R, '#2a1626'); tree(g, 1030, 455, 44, -Math.PI / 2 + 0.15, 5, 6, R, '#2a1626');
      // broken chapel arch
      g.fillStyle = '#2d1929';
      g.fillRect(744, 372, 20, 118); g.fillRect(740, 368, 28, 8); // left pillar
      g.beginPath(); g.moveTo(846, 490); g.lineTo(846, 430); g.lineTo(852, 418); g.lineTo(858, 428); g.lineTo(866, 412); g.lineTo(866, 490); g.fill(); // broken right pillar
      g.beginPath(); g.moveTo(764, 396); g.lineTo(846, 440); g.lineTo(846, 452); g.lineTo(764, 412); g.fill(); // fallen lintel
      [[800, 486, 14], [822, 490, 9], [880, 488, 11]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2); g.fill(); });
      const hz = g.createLinearGradient(0, 430, 0, 600); hz.addColorStop(0, 'rgba(220,130,120,0.18)'); hz.addColorStop(1, 'rgba(220,130,120,0)'); g.fillStyle = hz; g.fillRect(LX, 430, LW, 170);
    });
    L.oNear = mkLayer(g => {
      const R = rng(71); hill(g, 640, 60, 0.004, 11, '#170e16');
      for (let i = 0; i < 26; i++) { const x = LX + R() * LW; if (x > 470 && x < 820) continue; grave(g, x, 650 + R() * 160, 1.6 + R() * 1.8, R, '#100a10'); }
      // the Headsman's Grave: a cracked slab with an empty slot
      g.save(); g.translate(1010, 660); g.rotate(-0.05); g.fillStyle = '#1d1219'; g.beginPath(); g.moveTo(-70, 30); g.lineTo(-62, -120); g.quadraticCurveTo(0, -170, 62, -120); g.lineTo(70, 30); g.fill();
      g.fillStyle = '#060406'; g.fillRect(-5, -150, 10, 70); g.strokeStyle = '#2a1b25'; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, -100); g.lineTo(-10, -70); g.lineTo(-24, -20); g.stroke(); g.restore();
      for (let i = 0; i < 260; i++) { const x = LX + R() * LW, y = 610 + R() * 300; g.strokeStyle = 'rgba(40,24,32,0.9)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 10, y - 8 - R() * 18); g.stroke(); }
    });
    L.fog = (() => { const c = canvas(2048, 260), g = c.getContext('2d'), R = rng(81);
      for (let i = 0; i < 70; i++) { const x = R() * 2048, y = 80 + R() * 110, rx = 120 + R() * 260, ry = 30 + R() * 50;
        for (const ox of [0, -2048, 2048]) { const fg = g.createRadialGradient(x + ox, y, 0, x + ox, y, rx); fg.addColorStop(0, 'rgba(255,255,255,0.22)'); fg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fg; g.save(); g.translate(x + ox, y); g.scale(1, ry / rx); g.translate(-(x + ox), -y); g.beginPath(); g.arc(x + ox, y, rx, 0, 7); g.fill(); g.restore(); } }
      return c; })();
  }
  const fogCache = new Map();
  function fog(t, y, speed, a, tint = '#f0c8c8', h = 260) {
    let s = fogCache.get(tint);
    if (!s) { s = canvas(2048, 260); const sc = s.getContext('2d'); sc.drawImage(L.fog, 0, 0); sc.globalCompositeOperation = 'source-in'; sc.fillStyle = tint; sc.fillRect(0, 0, 2048, 260); fogCache.set(tint, s); }
    const off = ((t * speed) % 2048 + 2048) % 2048;
    ctx.save(); ctx.globalAlpha = a; for (let x = -off; x < W; x += 2048) ctx.drawImage(s, 0, 0, 2048, 260, x, y, 2048, h); ctx.restore();
  }
  function barrow(t, cam, o = {}) {
    const { mood = 'dusk', fogA = 0.5, wisps = true } = o;
    layer(L.oSky, cam, 0.03);
    withCam(cam, 0.06, () => { const dx = (t * 6) % LW; ctx.drawImage(L.oClouds, LX - dx, LY, LW, LH); ctx.drawImage(L.oClouds, LX - dx + LW, LY, LW, LH); });
    if (o.rift) withCam(cam, 0.08, () => drawRift(t, o.rift));
    layer(L.oFar, cam, 0.15);
    withCam(cam, 0.2, () => fog(t, 380, 12, fogA * 0.7, '#f3b6a8'));
    layer(L.oMid, cam, 0.4);
    withCam(cam, 0.5, () => fog(t, 450, 22, fogA * 0.8, '#e6b0b8'));
    if (o.mid) o.mid(t);
    layer(L.oNear, cam, 0.8);
    if (wisps) motes(t, { n: 26, vy: -8, vx: 6, wob: 30, size: 2, color: '#ffd9a0', a: 0.55, seed: 13, y0: 300, y1: 700 });
    if (mood === 'blood') { grade('#ff3030', 0.55, 'multiply'); grade('#5a0008', 0.35, 'screen'); }
    if (mood === 'still') { desat(1); grade('#9a9aa6', 0.4, 'multiply'); }
    if (mood === 'ash') { desat(0.6); grade('#d8c8c8', 0.3, 'multiply'); }
  }
  function frontFog(t, a = 0.5, tint = '#e0b0b8', y = 560, speed = 40) { fog(t, y, speed, a, tint, 300); }

  /* ---------- paper / ink for the exposition ---------- */
  function buildPaper() {
    L.paper = (() => { const c = canvas(W, H), g = c.getContext('2d'); g.fillStyle = '#e9e0cf'; g.fillRect(0, 0, W, H);
      const id = g.getImageData(0, 0, W, H), R = rng(91); for (let i = 0; i < id.data.length; i += 4) { const v = (R() - 0.5) * 18; id.data[i] += v; id.data[i + 1] += v; id.data[i + 2] += v * 0.9; } g.putImageData(id, 0, 0);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(120,80,40,0)'); vg.addColorStop(1, 'rgba(110,70,40,0.35)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      return c; })();
  }
  function paper() { ctx.drawImage(L.paper, 0, 0, W, H); }
  function inkStroke(pts, p, lw = 6, col = '#a3121b') { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; strokePartial(pts, clamp(p)); ctx.restore(); }

  /* ---------- sigils ---------- */
  function sigilAxe(x, y, r, p, t, col = '#ff3a3a', a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18 * K;
    const seg = (f0, f1) => clamp((p - f0) / (f1 - f0));
    ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * seg(0, 0.35)); ctx.stroke();
    ctx.lineWidth = r * 0.025; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, Math.PI / 2, Math.PI / 2 + Math.PI * 2 * seg(0.1, 0.45)); ctx.stroke();
    const tk = Math.floor(24 * seg(0.2, 0.6)); for (let i = 0; i < tk; i++) { const an = i / 24 * Math.PI * 2 + t * 0.2; ctx.lineWidth = r * (i % 3 ? 0.02 : 0.04); ctx.beginPath(); ctx.moveTo(Math.cos(an) * r * 0.86, Math.sin(an) * r * 0.86); ctx.lineTo(Math.cos(an) * r * (i % 3 ? 0.93 : 0.97), Math.sin(an) * r * (i % 3 ? 0.93 : 0.97)); ctx.stroke(); }
    const h = seg(0.45, 0.7), b = seg(0.6, 0.95);
    ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(-r * 0.45, r * 0.5); ctx.lineTo(-r * 0.45 + r * 0.8 * h, r * 0.5 - r * 0.95 * h); ctx.stroke(); // handle
    if (b > 0) { ctx.beginPath(); ctx.moveTo(r * 0.05, -r * 0.15); ctx.quadraticCurveTo(r * 0.55, -r * 0.05, r * 0.5, r * 0.25 * b); ctx.moveTo(r * 0.05, -r * 0.15); ctx.quadraticCurveTo(r * 0.1, -r * 0.6 * b, r * 0.45 * b, -r * 0.62 * b); ctx.stroke(); }
    ctx.restore();
  }
  function sigilPaw(x, y, r, lit, total = 9, p = 1, a = 1, dimAt = -1, dimP = 0) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a * p; ctx.fillStyle = '#bfe3ff'; ctx.shadowColor = '#8fd0ff'; ctx.shadowBlur = 14 * K;
    ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 0.32, r * 0.26, 0, 0, 7); ctx.fill();
    [[-0.34, -0.22], [-0.12, -0.38], [0.12, -0.38], [0.34, -0.22]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.ellipse(dx * r, dy * r, r * 0.11, r * 0.14, dx, 0, 7); ctx.fill(); });
    for (let i = 0; i < total; i++) {
      const an = -Math.PI / 2 + (i / total) * Math.PI * 2, on = i < lit;
      let al = on ? 1 : 0.18; if (i === dimAt) al = lerp(1, 0.18, dimP);
      ctx.globalAlpha = a * p * al; ctx.beginPath(); ctx.arc(Math.cos(an) * r * 0.78, Math.sin(an) * r * 0.78, r * 0.07, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- typography cards ---------- */
  function locationCard(lt, d, l1, l2) {
    const pin = ease.out(inv(0, 0.8, lt)), pout = inv(d - 0.6, d, lt), a = 1 - pout;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#e8343c'; ctx.fillRect(64, 70, 46 * pin, 3);
    txt(l1, 64, 108, { font: '800 30px ' + FONT.disp, align: 'left', ls: 4 * pin, a: pin, stroke: 'rgba(0,0,0,0.5)', lw: 4 });
    txt(l2, 64, 134, { font: '600 15px ' + FONT.sub, align: 'left', fill: '#d9d4d0', ls: 2, a: inv(0.3, 1.1, lt), stroke: 'rgba(0,0,0,0.6)', lw: 3 });
    ctx.restore();
  }
  function infoCard(lt, d, o) { // fiend / hunter profile slide-in
    const { cls, name, sub, color = '#e8343c', side = 'right', threat = 0 } = o;
    const pin = ease.out5(inv(0, 0.6, lt)), pout = ease.in(inv(d - 0.5, d, lt)), off = (1 - pin + pout) * 420;
    const x = side === 'right' ? W - 470 + off : 50 - off, y = 470;
    ctx.save();
    ctx.globalAlpha = 0.86; ctx.fillStyle = '#07070a'; ctx.beginPath(); ctx.moveTo(x + 18, y); ctx.lineTo(x + 420, y); ctx.lineTo(x + 402, y + 150); ctx.lineTo(x, y + 150); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.fillRect(x + 18, y, 402, 3);
    txt(cls, x + 30, y + 30, { font: '700 13px ' + FONT.sub, align: 'left', fill: color, ls: 3 });
    txt(name, x + 28, y + 74, { font: '900 40px ' + FONT.disp, align: 'left', ls: 1.5 });
    const lines = Array.isArray(sub) ? sub : [sub];
    lines.forEach((s, i) => txt(s, x + 30, y + 104 + i * 21, { font: '500 15px ' + FONT.sub, align: 'left', fill: '#c9c4c6' }));
    if (threat) { for (let i = 0; i < 5; i++) { ctx.fillStyle = i < threat ? color : 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 300 + i * 18, y + 20, 12, 12); } }
    ctx.restore();
  }
  function logo(x, y, s, p = 1, o = {}) {
    const a = o.a ?? 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
    const sl = ease.out5(inv(0, 0.5, p));
    txt('ルインブレイカー', 0, -118, { font: '400 30px ' + FONT.jp, fill: '#e8343c', ls: 10 * sl, a: inv(0.2, 0.7, p) });
    const pp = ease.out(inv(0.1, 0.6, p));
    txt('RUINBREAKER', 0, 20, { font: '900 132px ' + FONT.disp, fill: o.fill || '#f4efe9', ls: lerp(40, 6, pp), a: pp, stroke: o.stroke || null, lw: 10 });
    const cut = ease.out5(inv(0.45, 0.75, p));
    if (cut > 0) { ctx.save(); ctx.globalCompositeOperation = o.cutComp || 'source-over'; ctx.fillStyle = '#e8343c'; ctx.beginPath(); ctx.moveTo(-430, 6); ctx.lineTo(-430 + 880 * cut, -10); ctx.lineTo(-430 + 880 * cut, -2); ctx.lineTo(-430, 14); ctx.fill(); ctx.restore(); }
    txt('SEASON 1', 0, 62, { font: '700 16px ' + FONT.sub, fill: o.sub || '#bdb6b0', ls: 8, a: inv(0.6, 1, p) });
    ctx.restore();
  }

  /* ---------- subtitles ---------- */
  const SPEAKER = { TAKUTO: '#ff6b6b', NEMU: '#a9c7ff', SIEG: '#8fb4ff', AKURO: '#ff3b3b', SABLE: '#d0d8ff', NARR: '#e9e2da', '???': '#c8c8c8' };
  function subtitle(s, a = 1, t = 0) {
    if (!s) return;
    const who = s.who, isAkuro = who === 'AKURO', mono = s.mono;
    const font = (mono ? 'italic ' : '') + '600 30px ' + FONT.sub;
    const maxW = 1040, words = s.text.split(' '), lines = []; let cur = '';
    words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (measure(test, font) > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
    if (cur) lines.push(cur);
    const base = H - 46 - (lines.length - 1) * 40;
    ctx.save();
    const jx = isAkuro ? (hash(twos(t, 24), 1) - 0.5) * 2 : 0;
    if (who && who !== 'NARR') txt(who === 'SABLE' ? 'MR. SABLE' : who, W / 2 + jx, base - 40, { font: '800 14px ' + FONT.sub, fill: SPEAKER[who] || '#ddd', ls: 4, stroke: 'rgba(0,0,0,0.85)', lw: 4, a });
    lines.forEach((l, i) => txt(l, W / 2 + jx, base + i * 40, { font, fill: isAkuro ? '#ffd2d2' : '#ffffff', stroke: isAkuro ? 'rgba(90,0,0,0.95)' : 'rgba(0,0,0,0.92)', lw: 7, a }));
    ctx.restore();
  }

  function init(c2d, k) { ctx = c2d; K = k; }
  function setCtx(c2d, k) { ctx = c2d; if (k) K = k; }
  function build() { initPost(); buildEarth(); buildCrack(); buildBarrow(); buildPaper(); }

  return {
    W, H, FONT, A, clamp, lerp, inv, ease, hash, rng, vnoise, twos, canvas, init, setCtx, build, loadAssets, hasFilter,
    get ctx() { return ctx; }, get K() { return K; },
    fig, cover, duo, glowOf, fill, vgrad, radial, txt, measure, rain, splashes, motes, focusLines, dashLines,
    grain, vignette, impact, desat, grade, letterbox, earth, earthLive, drawCat, drawBag, drawTrain, drawCrack, drawRift, riftTunnel,
    barrow, fog, frontFog, paper, inkStroke, strokePartial, sigilAxe, sigilPaw, locationCard, infoCard, logo, subtitle, withCam, layer, L,
  };
})();
