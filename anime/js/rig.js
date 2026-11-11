/* RUINBREAKER — 2D puppet rigs (Live2D-style cutout animation) rendered with WebGL.
   Each character is a deformable mesh over its art with bones (head, arms, legs, tail...),
   soft weights painted from simple shapes, secondary sway for hair/cloth, eyelid blinks and
   a mouth that opens with the voice track. Falls back to static art if WebGL is missing. */
'use strict';

const RIG = (() => {
  const G = GFX;
  let gl = null, glc = null, prog = null, ok = false, isGL2 = false, K = 1, maxSize = 4096;
  const U = {}, Abuf = {};
  const compiled = {};
  let DEFS = {};

  /* ---------- GL setup ---------- */
  const VS = `attribute vec2 aPos; attribute vec2 aUV; attribute vec2 aUV2; uniform vec2 uRes; varying vec2 vUV; varying vec2 vUV2;
    void main(){ vUV = aUV; vUV2 = aUV2; gl_Position = vec4(aPos.x / uRes.x * 2.0 - 1.0, 1.0 - aPos.y / uRes.y * 2.0, 0.0, 1.0); }`;
  const FS = `precision mediump float;
    varying vec2 vUV; varying vec2 vUV2;
    uniform sampler2D uTex; uniform sampler2D uGlow; uniform int uMode;
    uniform vec4 uMul; uniform vec4 uScr; uniform vec4 uSil; uniform float uAlpha; uniform vec3 uGlowCol;
    uniform vec4 uDuoA; uniform vec4 uDuoB;
    uniform vec4 uEye0; uniform vec4 uEye1; uniform float uBlink; uniform vec3 uSkin; uniform vec3 uLash;
    uniform vec4 uMouth; uniform float uOpen; uniform vec3 uMouthCol;
    vec3 lid(vec3 rgb, vec2 uv, vec4 box){
      if (box.z <= box.x) return rgb;
      vec2 l = (uv - box.xy) / (box.zw - box.xy);
      vec2 d = l - 0.5; float e = dot(d, d) * 4.0;
      if (e > 1.0) return rgb;
      float soft = smoothstep(1.0, 0.7, e);
      float line = 0.12 + 0.66 * uBlink + 0.14 * (1.0 - 4.0 * d.x * d.x) * uBlink;
      vec3 o = rgb;
      if (l.y < line - 0.07 || uBlink > 0.92) o = uSkin;
      if (abs(l.y - line) < 0.07 && uBlink > 0.25) o = uLash;
      return mix(rgb, o, soft * smoothstep(0.0, 0.15, uBlink));
    }
    void main(){
      if (uMode == 1) {
        float g = (vUV2.x < 0.0 || vUV2.y < 0.0 || vUV2.x > 1.0 || vUV2.y > 1.0) ? 0.0 : texture2D(uGlow, vUV2).a;
        float ga = g * uAlpha; gl_FragColor = vec4(uGlowCol * ga, ga); return;
      }
      if (vUV.x < 0.0 || vUV.y < 0.0 || vUV.x > 1.0 || vUV.y > 1.0) { gl_FragColor = vec4(0.0); return; }
      vec4 c = texture2D(uTex, vUV);
      float a = c.a; if (a < 0.002) { gl_FragColor = vec4(0.0); return; }
      vec3 rgb = c.rgb / a;
      if (uBlink > 0.0) { rgb = lid(rgb, vUV, uEye0); rgb = lid(rgb, vUV, uEye1); }
      if (uOpen > 0.02 && uMouth.z > uMouth.x) {
        vec2 l = (vUV - uMouth.xy) / (uMouth.zw - uMouth.xy); vec2 d = l - vec2(0.5, 0.35);
        float ry = 0.06 + 0.5 * uOpen; float m = (d.x * d.x) / 0.2 + (d.y * d.y) / (ry * ry * 0.9);
        if (m < 1.0 && l.y > 0.1) { vec3 mc = mix(uMouthCol, uMouthCol * 1.8 + vec3(0.12, 0.02, 0.02), smoothstep(0.1, 0.5, d.y / max(ry, 0.01))); rgb = mix(rgb, mc, smoothstep(1.0, 0.7, m)); }
      }
      if (uDuoA.a > 0.5) { float l = smoothstep(0.06, 0.94, dot(rgb, vec3(0.299, 0.587, 0.114))); rgb = mix(uDuoA.rgb, uDuoB.rgb, l); }
      rgb = mix(rgb, rgb * uMul.rgb, uMul.a);
      rgb = mix(rgb, 1.0 - (1.0 - rgb) * (1.0 - uScr.rgb), uScr.a);
      rgb = mix(rgb, uSil.rgb, uSil.a);
      a = clamp((a - 0.1) / 0.9, 0.0, 1.0) * uAlpha;
      gl_FragColor = vec4(rgb * a, a);
    }`;
  function init() {
    try {
      glc = document.createElement('canvas'); glc.width = 512; glc.height = 512;
      const opt = { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: false, depth: false, stencil: false };
      gl = glc.getContext('webgl2', opt); isGL2 = !!gl;
      if (!gl) gl = glc.getContext('webgl', opt) || glc.getContext('experimental-webgl', opt);
      if (!gl) return false;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      ['uRes', 'uTex', 'uGlow', 'uMode', 'uMul', 'uScr', 'uSil', 'uAlpha', 'uGlowCol', 'uDuoA', 'uDuoB', 'uEye0', 'uEye1', 'uBlink', 'uSkin', 'uLash', 'uMouth', 'uOpen', 'uMouthCol'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
      ['aPos', 'aUV', 'aUV2'].forEach(n => Abuf[n] = gl.getAttribLocation(prog, n));
      gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uGlow, 1);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      maxSize = Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096, (gl.getParameter(gl.MAX_VIEWPORT_DIMS) || [4096])[0]);
      glc.addEventListener('webglcontextlost', e => { e.preventDefault(); ok = false; });
      ok = true; return true;
    } catch (e) { console.warn('WebGL rigs unavailable, using static art', e); ok = false; return false; }
  }
  function setK(k) { K = k; }
  function define(defs) { Object.assign(DEFS, defs); }

  /* ---------- shapes -> soft weights (original-art coordinates) ---------- */
  function sdPoly(x, y, pts) {
    let inside = false, d = 1e9;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
      const dx = xj - xi, dy = yj - yi, l2 = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / (l2 || 1)));
      d = Math.min(d, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
    }
    return inside ? -d : d;
  }
  function sd(shape, x, y) {
    const k = shape[0];
    if (k === 'e') { const [, cx, cy, rx, ry] = shape, q = Math.hypot((x - cx) / rx, (y - cy) / ry); return (q - 1) * Math.min(rx, ry); }
    if (k === 'r') { const [, x0, y0, x1, y1] = shape; return sdPoly(x, y, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]); }
    return sdPoly(x, y, shape[1]);
  }
  const feather = s => s[0] === 'p' ? s[2] : s[5];
  function wShapes(list, x, y) {
    let w = 0;
    for (const s of list) { const f = Math.max(1, feather(s)), d = sd(s, x, y), v = 1 - smooth(-f / 2, f / 2, d); if (v > w) w = v; }
    return w;
  }
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  /* ---------- compile a rig for an asset ---------- */
  function compile(name) {
    if (compiled[name] !== undefined) return compiled[name];
    const a = G.A[name], def = DEFS[name];
    if (!a || !def) { compiled[name] = null; return null; }
    const R = { name, def, ox: a.ox, oy: a.oy, s: a.s, w: a.w, h: a.h };
    const P = Math.round((def.pad ?? 0.05) * Math.max(a.w, a.h));
    R.P = P;
    // textures
    R.tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a.img);
    if (isGL2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (!def.noGlow) { // padded, blurred silhouette for rim light / aura that follows the pose
      const gw = Math.ceil((a.w + 2 * P) / 12), gh = Math.ceil((a.h + 2 * P) / 12), c1 = G.canvas(gw, gh), x1 = c1.getContext('2d');
      x1.drawImage(a.img, P / 12, P / 12, a.w / 12, a.h / 12);
      const c2 = G.canvas(gw * 3, gh * 3), x2 = c2.getContext('2d'); x2.imageSmoothingQuality = 'high'; x2.drawImage(c1, 0, 0, gw * 3, gh * 3);
      x2.globalCompositeOperation = 'source-in'; x2.fillStyle = '#fff'; x2.fillRect(0, 0, gw * 3, gh * 3);
      R.glow = gl.createTexture(); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, R.glow);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.activeTexture(gl.TEXTURE0);
    }
    // mesh over the padded rect
    const cols = def.grid || 34, rows = Math.max(8, Math.round(cols * (a.h + 2 * P) / (a.w + 2 * P)));
    const nv = (cols + 1) * (rows + 1); R.nv = nv;
    R.bx = new Float32Array(nv); R.by = new Float32Array(nv);
    const uv = new Float32Array(nv * 2), uv2 = new Float32Array(nv * 2);
    for (let j = 0, v = 0; j <= rows; j++) for (let i = 0; i <= cols; i++, v++) {
      const x = -P + (a.w + 2 * P) * i / cols, y = -P + (a.h + 2 * P) * j / rows;
      R.bx[v] = x; R.by[v] = y; uv[v * 2] = x / a.w; uv[v * 2 + 1] = y / a.h; uv2[v * 2] = (x + P) / (a.w + 2 * P); uv2[v * 2 + 1] = (y + P) / (a.h + 2 * P);
    }
    const idx = new Uint16Array(cols * rows * 6);
    for (let j = 0, k = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const v = j * (cols + 1) + i; idx.set([v, v + 1, v + cols + 1, v + 1, v + cols + 2, v + cols + 1], k); k += 6; }
    R.ni = idx.length;
    R.bufPos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, R.bufPos); gl.bufferData(gl.ARRAY_BUFFER, nv * 8, gl.DYNAMIC_DRAW);
    R.bufUV = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, R.bufUV); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    R.bufUV2 = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, R.bufUV2); gl.bufferData(gl.ARRAY_BUFFER, uv2, gl.STATIC_DRAW);
    R.bufIdx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, R.bufIdx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    // bones (parents listed before children; earlier siblings win where regions overlap)
    const bones = [{ name: 'root', p: def.root || [a.ox + a.w / a.s / 2, a.oy + a.h / a.s], parent: -1, regions: null }];
    (def.bones || []).forEach(b => bones.push({ name: b[0], parent: Math.max(0, bones.findIndex(x => x.name === (b[1] || 'root'))), p: b[2], regions: b[3] }));
    R.bones = bones; R.nb = bones.length; R.bi = Object.fromEntries(bones.map((b, i) => [b.name, i]));
    R.W = weightsFor(R, (x, y) => [x, y], nv, v => [R.ox + R.bx[v] / R.s, R.oy + R.by[v] / R.s]);
    // secondary sway fields
    R.sway = (def.sway || []).map(f => {
      const wv = new Float32Array(nv), dv = new Float32Array(nv);
      for (let v = 0; v < nv; v++) {
        const x = R.ox + R.bx[v] / R.s, y = R.oy + R.by[v] / R.s;
        let w = wShapes(f.s, x, y); if (f.sub) w *= 1 - wShapes(f.sub, x, y);
        const dist = Math.hypot(x - f.a[0], y - f.a[1]); dv[v] = dist;
        wv[v] = w * Math.pow(Math.min(1, dist / (f.fall || 100)), f.pow || 1.2);
      }
      return { f, wv, dv };
    });
    const box = b => b ? [(b[0] - a.ox) * a.s / a.w, (b[1] - a.oy) * a.s / a.h, (b[2] - a.ox) * a.s / a.w, (b[3] - a.oy) * a.s / a.h] : [0, 0, 0, 0];
    R.eye0 = box(def.eyes && def.eyes[0]); R.eye1 = box(def.eyes && def.eyes[1]); R.mouth = box(def.mouth);
    R.cur = new Float32Array(nv * 2); R.scr = new Float32Array(nv * 2); R.mats = new Float32Array(R.nb * 6);
    compiled[name] = R; return R;
  }
  function weightsFor(R, _, n, coord) {
    const nb = R.nb, W = new Float32Array(n * nb), share = new Float32Array(nb);
    const raw = R.bones.map(b => b.regions);
    for (let v = 0; v < n; v++) {
      const [x, y] = coord(v); share.fill(0); share[0] = 1;
      for (let b = 1; b < nb; b++) { const r = wShapes(raw[b], x, y); if (r <= 0) continue; const p = R.bones[b].parent, w = r * share[p]; share[b] = w; share[p] -= w; }
      W.set(share, v * nb);
    }
    return W;
  }

  /* ---------- posing ---------- */
  function matsFor(R, pose) {
    const B = pose.bones || {}, M = R.mats;
    for (let i = 0; i < R.nb; i++) {
      const b = R.bones[i], q = B[b.name] || {};
      const px = (b.p[0] - R.ox) * R.s, py = (b.p[1] - R.oy) * R.s, r = q.r || 0, c = Math.cos(r), s = Math.sin(r), sx = q.sx ?? 1, sy = q.sy ?? 1;
      const tx = (q.x || 0) * R.s, ty = (q.y || 0) * R.s;
      // local = T(p+t) R S T(-p)
      const la = c * sx, lb = s * sx, lc = -s * sy, ld = c * sy, le = px + tx - (la * px + lc * py), lf = py + ty - (lb * px + ld * py);
      if (b.parent < 0) M.set([la, lb, lc, ld, le, lf], 0);
      else {
        const o = b.parent * 6, A0 = M[o], A1 = M[o + 1], A2 = M[o + 2], A3 = M[o + 3], A4 = M[o + 4], A5 = M[o + 5];
        M.set([A0 * la + A2 * lb, A1 * la + A3 * lb, A0 * lc + A2 * ld, A1 * lc + A3 * ld, A0 * le + A2 * lf + A4, A1 * le + A3 * lf + A5], i * 6);
      }
    }
    return M;
  }
  function skin(R, pose) {
    const M = matsFor(R, pose), nb = R.nb, W = R.W, out = R.cur, t = pose.t || 0, wind = pose.wind ?? 1;
    for (let v = 0; v < R.nv; v++) {
      const x = R.bx[v], y = R.by[v]; let X = 0, Y = 0;
      for (let b = 0; b < nb; b++) { const w = W[v * nb + b]; if (w <= 0.0005) continue; const o = b * 6; X += w * (M[o] * x + M[o + 2] * y + M[o + 4]); Y += w * (M[o + 1] * x + M[o + 3] * y + M[o + 5]); }
      out[v * 2] = X; out[v * 2 + 1] = Y;
    }
    for (const sw of R.sway) { // hair, cloth, tails: travelling waves away from the anchor
      const f = sw.f, amp = (f.amp || 4) * R.s * wind * (pose.sway?.[f.id] ?? 1), fr = f.freq || 1, ph = f.ph ?? 0.025, dir = f.dir || [1, 0];
      for (let v = 0; v < R.nv; v++) {
        const w = sw.wv[v]; if (w <= 0.001) continue;
        const k = 2 * Math.PI * fr * t - sw.dv[v] * ph + (f.seed || 0), s1 = Math.sin(k) + 0.35 * Math.sin(k * 2.3 + 1.7);
        let dx = dir[0], dy = dir[1];
        if (f.radial) { const ax = (f.a[0] - R.ox) * R.s, ay = (f.a[1] - R.oy) * R.s, ex = R.bx[v] - ax, ey = R.by[v] - ay, l = Math.hypot(ex, ey) || 1; dx = ex / l; dy = ey / l; }
        out[v * 2] += amp * w * (s1 * dx - 0.3 * Math.cos(k) * dy); out[v * 2 + 1] += amp * w * (s1 * dy + 0.3 * Math.cos(k) * dx);
      }
    }
    return M;
  }
  // screen position of an original-art point under the current pose (for glows, effects, overlays)
  function point(name, place, pose, x, y) {
    const R = compile(name);
    if (!R) { const s = place.sc; return [place.x + (x - place.ax) * s, place.y + (y - place.ay) * s]; }
    const M = matsFor(R, pose), share = new Float32Array(R.nb); share[0] = 1;
    for (let b = 1; b < R.nb; b++) { const r = wShapes(R.bones[b].regions, x, y); if (r <= 0) continue; const p = R.bones[b].parent, w = r * share[p]; share[b] = w; share[p] -= w; }
    const ax = (x - R.ox) * R.s, ay = (y - R.oy) * R.s; let X = 0, Y = 0;
    for (let b = 0; b < R.nb; b++) { const w = share[b]; if (!w) continue; const o = b * 6; X += w * (M[o] * ax + M[o + 2] * ay + M[o + 4]); Y += w * (M[o + 1] * ax + M[o + 3] * ay + M[o + 5]); }
    return toScreen(R, place, X, Y);
  }
  function toScreen(R, place, X, Y) {
    const ox = R.ox + X / R.s - place.ax, oy = R.oy + Y / R.s - place.ay, sc = place.sc, r = place.rot || 0;
    const c = Math.cos(r), s = Math.sin(r), fl = place.flip ? -1 : 1;
    const lx = ox * sc * fl, ly = oy * sc;
    return [place.x + lx * c - ly * s, place.y + lx * s + ly * c];
  }

  /* ---------- draw ---------- */
  const hex = (h, def = [1, 1, 1]) => { if (!h) return def; h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
  function draw(name, place, pose = {}, fx = {}) {
    const ctx = G.ctx;
    const R = ok ? compile(name) : null;
    if (!R) { // static fallback
      G.fig(name, place.x, place.y, place.ax, place.ay, place.sc, { ...fx, rot: place.rot, src: fx.src });
      return;
    }
    skin(R, pose);
    const n = R.nv, cur = R.cur, scr = R.scr;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    { const sc = place.sc, rr = place.rot || 0, c = Math.cos(rr), s = Math.sin(rr), fl = place.flip ? -1 : 1, is = 1 / R.s, bx = R.ox - place.ax, by = R.oy - place.ay;
      for (let v = 0; v < n; v++) {
        const lx = (bx + cur[v * 2] * is) * sc * fl, ly = (by + cur[v * 2 + 1] * is) * sc, sx = place.x + lx * c - ly * s, sy = place.y + lx * s + ly * c;
        scr[v * 2] = sx; scr[v * 2 + 1] = sy; if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
      } }
    const m = 40 + (fx.smear ? Math.hypot(fx.smear.dx, fx.smear.dy) : 0), W = G.W, H = G.H;
    let cx0 = Math.max(x0, -m), cy0 = Math.max(y0, -m), cx1 = Math.min(x1, W + m), cy1 = Math.min(y1, H + m);
    if (fx.clip) { cx0 = Math.max(cx0, fx.clip[0]); cy0 = Math.max(cy0, fx.clip[1]); cx1 = Math.min(cx1, fx.clip[0] + fx.clip[2]); cy1 = Math.min(cy1, fx.clip[1] + fx.clip[3]); }
    if (cx1 <= cx0 || cy1 <= cy0) return;
    const kk = Math.min(K, maxSize / (cx1 - cx0), maxSize / (cy1 - cy0));
    const dw = Math.max(1, Math.ceil((cx1 - cx0) * kk)), dh = Math.max(1, Math.ceil((cy1 - cy0) * kk));
    if (glc.width < dw || glc.height < dh) { glc.width = Math.min(maxSize, Math.max(glc.width, dw + 64)); glc.height = Math.min(maxSize, Math.max(glc.height, dh + 64)); }
    const dev = R.dev || (R.dev = new Float32Array(n * 2));
    for (let v = 0; v < n; v++) { dev[v * 2] = (scr[v * 2] - cx0) * kk; dev[v * 2 + 1] = (scr[v * 2 + 1] - cy0) * kk; }
    gl.useProgram(prog);
    gl.viewport(0, 0, dw, dh); gl.uniform2f(U.uRes, dw, dh);
    gl.bindBuffer(gl.ARRAY_BUFFER, R.bufPos); gl.bufferSubData(gl.ARRAY_BUFFER, 0, dev); gl.enableVertexAttribArray(Abuf.aPos); gl.vertexAttribPointer(Abuf.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, R.bufUV); gl.enableVertexAttribArray(Abuf.aUV); gl.vertexAttribPointer(Abuf.aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, R.bufUV2); gl.enableVertexAttribArray(Abuf.aUV2); gl.vertexAttribPointer(Abuf.aUV2, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, R.bufIdx);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.tex);
    if (R.glow) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, R.glow); gl.activeTexture(gl.TEXTURE0); }
    const sy0 = glc.height - dh, blit = (dx = 0, dy = 0) => ctx.drawImage(glc, 0, sy0, dw, dh, cx0 + dx, cy0 + dy, dw / kk, dh / kk);
    const alpha = fx.a ?? 1;
    if (fx.glow && R.glow) {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(U.uMode, 1); gl.uniform3fv(U.uGlowCol, hex(fx.glow.c)); gl.uniform1f(U.uAlpha, 1);
      gl.drawElements(gl.TRIANGLES, R.ni, gl.UNSIGNED_SHORT, 0);
      ctx.save(); ctx.globalCompositeOperation = fx.glow.comp || 'lighter'; ctx.globalAlpha = (fx.glow.a ?? 0.8) * alpha; blit(); ctx.restore();
      if (fx.glowOnly) return;
    }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(U.uMode, 0);
    const mul = hex(fx.mul), scrc = hex(fx.scr, [0, 0, 0]), sil = hex(fx.sil, [0, 0, 0]);
    gl.uniform4f(U.uMul, mul[0], mul[1], mul[2], fx.mul ? (fx.mulA ?? 1) : 0);
    gl.uniform4f(U.uScr, scrc[0], scrc[1], scrc[2], fx.scr ? (fx.scrA ?? 1) : 0);
    gl.uniform4f(U.uSil, sil[0], sil[1], sil[2], fx.sil ? (fx.silA ?? 1) : 0);
    if (fx.duo) { const d0 = hex(fx.duo[0]), d1 = hex(fx.duo[1]); gl.uniform4f(U.uDuoA, d0[0], d0[1], d0[2], 1); gl.uniform4f(U.uDuoB, d1[0], d1[1], d1[2], 1); }
    else { gl.uniform4f(U.uDuoA, 0, 0, 0, 0); gl.uniform4f(U.uDuoB, 0, 0, 0, 0); }
    gl.uniform1f(U.uAlpha, 1);
    gl.uniform4fv(U.uEye0, R.eye0); gl.uniform4fv(U.uEye1, R.eye1); gl.uniform1f(U.uBlink, pose.blink || 0);
    gl.uniform3fv(U.uSkin, hex(R.def.skin || '#f0d8cc')); gl.uniform3fv(U.uLash, hex(R.def.lash || '#2a1c1e'));
    gl.uniform4fv(U.uMouth, R.mouth); gl.uniform1f(U.uOpen, pose.open || 0); gl.uniform3fv(U.uMouthCol, hex(R.def.mouthCol || '#3a1518'));
    gl.drawElements(gl.TRIANGLES, R.ni, gl.UNSIGNED_SHORT, 0);
    ctx.save(); if (fx.comp) ctx.globalCompositeOperation = fx.comp;
    if (fx.clip) { ctx.beginPath(); ctx.rect(fx.clip[0], fx.clip[1], fx.clip[2], fx.clip[3]); ctx.clip(); }
    if (fx.smear) { const nS = fx.smear.n || 4; for (let i = nS; i >= 1; i--) { ctx.globalAlpha = alpha * (fx.smear.a ?? 0.5) * (1 - i / (nS + 1)); blit(-fx.smear.dx * i / nS, -fx.smear.dy * i / nS); } }
    ctx.globalAlpha = alpha; blit();
    ctx.restore();
  }
  // full-frame art (a "living painting"): covers a rect like object-fit: cover
  function cover(name, rx, ry, rw, rh, fxp, fyp, zoom, pose = {}, fx = {}) {
    const a = G.A[name]; if (!a) return;
    const s = Math.max(rw / a.w, rh / a.h) * zoom, vw = rw / s, vh = rh / s;
    const sx = Math.max(0, Math.min(a.w - vw, fxp * a.w - vw / 2)), sy = Math.max(0, Math.min(a.h - vh, fyp * a.h - vh / 2));
    const ax = a.ox + (sx + vw / 2) / a.s, ay = a.oy + (sy + vh / 2) / a.s;
    draw(name, { x: rx + rw / 2, y: ry + rh / 2, ax, ay, sc: s * a.s }, pose, { ...fx, clip: [rx, ry, rw, rh] });
  }
  // deterministic blinking: a quick close/open every few seconds
  function blink(t, seed = 0) {
    const per = 3.1 + 1.7 * G.hash(Math.floor((t + seed * 1.7) / 3.7), seed + 3), ph = ((t + seed * 1.7) % per);
    if (ph > 0.17) return 0; return Math.sin(ph / 0.17 * Math.PI);
  }

  return { init, setK, define, draw, cover, point, blink, compile, get ok() { return ok; } };
})();
