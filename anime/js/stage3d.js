/* RUINBREAKER 3D — cel-shaded three.js stage: toon materials with ink outlines, jointed anime
   characters (Takuto, Nemu, Sieg, the Shieldbearer, Mr. Sable), the Headsman's Axe, environments
   (the Barrow Fields, Crossing No. 4, the mindscape), and a pose/animation system. */
'use strict';

const S3 = (() => {
  const G = GFX, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  let R = null, cam = null, ok = false, tried = false, rimOn = true, ramp = null, curW = 0, curH = 0;
  const scenes = {}, chars = {};
  const OUTLINE = new THREE.Color('#1c1016');

  /* ---------- materials ---------- */
  function init() {
    if (tried) return ok; tried = true;
    try {
      if (THREE.ColorManagement) { if ('enabled' in THREE.ColorManagement) THREE.ColorManagement.enabled = true; else THREE.ColorManagement.legacyMode = false; } // author colours in sRGB, light in linear
      const c = document.createElement('canvas');
      R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, premultipliedAlpha: false }); R.setClearColor(0x000000, 0); R.localClippingEnabled = true;
      R.setPixelRatio(1); R.outputEncoding = THREE.sRGBEncoding;
      cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.05, 900);
      const d = new Uint8Array([118, 112, 128, 255, 255, 255, 255, 255]);
      ramp = new THREE.DataTexture(d, 2, 1, THREE.RGBAFormat); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
      ok = true; return true;
    } catch (e) { console.warn('3D unavailable', e); ok = false; return false; }
  }
  const RIM = { uRim: { value: new THREE.Color('#ffb070') }, uRimK: { value: 0.7 }, uRimDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() } };
  function toon(color, o = {}) {
    const m = new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: ramp, emissive: new THREE.Color(o.emissive || '#000000'), emissiveIntensity: o.ei ?? 1, transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide, map: o.map || null });
    if (o.rim ?? rimOn) m.onBeforeCompile = sh => { // anime rim light on the edges that face away from the camera toward the key light
      Object.assign(sh.uniforms, RIM);
      sh.fragmentShader = 'uniform vec3 uRim; uniform float uRimK; uniform vec3 uRimDir;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
        { vec3 nn = normalize(normal); float fr = 1.0 - abs(dot(nn, normalize(vViewPosition)));
          float side = smoothstep(-0.15, 0.45, dot(nn, uRimDir));
          gl_FragColor.rgb += uRim * uRimK * smoothstep(0.52, 0.6, fr) * side; }`);
    };
    return m;
  }
  const basic = (color, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side || THREE.FrontSide, map: o.map || null, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: o.depthWrite ?? !o.add, fog: o.fog ?? true });
  function inkMat(w) { // inverted-hull outline: push vertices out along normals, draw back faces in ink
    const m = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${w.toFixed(4)};`); };
    return m;
  }
  const INK = { s: null, m: null, l: null };
  function part(geo, mat, ink = 's') { // mesh + outline
    const g = new THREE.Group(), m = new THREE.Mesh(geo, mat); g.add(m);
    if (ink) { if (!INK[ink]) INK[ink] = inkMat({ s: 0.006, m: 0.012, l: 0.022 }[ink]); const o = new THREE.Mesh(geo, INK[ink]); g.add(o); }
    g.userData.mesh = m; return g;
  }
  const cap = (r, l, mat, ink) => part(new THREE.CapsuleGeometry(r, l, 4, 12), mat, ink);
  const box = (x, y, z, mat, ink) => part(new THREE.BoxGeometry(x, y, z), mat, ink);
  const sph = (r, mat, ink, sx = 1, sy = 1, sz = 1) => { const p = part(new THREE.SphereGeometry(r, 20, 16), mat, ink); p.scale.set(sx, sy, sz); return p; };
  const cone = (r, h, mat, ink, seg = 8) => part(new THREE.ConeGeometry(r, h, seg), mat, ink);
  const cyl = (rt, rb, h, mat, ink, seg = 16, open = false, ts = 0, tl = Math.PI * 2) => part(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open, ts, tl), mat, ink);
  const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
  function canvasTex(w, h, draw) { const c = G.canvas(w, h), g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData = { c, g }; return t; }

  /* ---------- heads: a painted anime face wrapped on a V-jawed skull, eyes that blink, look and talk ---------- */
  // texture layout follows SphereGeometry UVs: the face centre sits at u = 0.25 (+z), v = 0.5 (equator)
  function animeHead(J, st) {
    const TW = st.tex || 1024, TH = TW / 2, S = TW / 1024, r = st.r || 0.125;
    const base = G.canvas(TW, TH), bg = base.getContext('2d');
    const tex = canvasTex(TW, TH, () => {}), g = tex.userData.g;
    const fx = TW * 0.25, fy = TH * 0.5;
    // skin, shading toward the back, and the painted hairline
    bg.fillStyle = st.skin; bg.fillRect(0, 0, TW, TH);
    if (st.blush) { const gr = bg.createRadialGradient(0, 0, 0, 0, 0, 30 * S); gr.addColorStop(0, st.blush); gr.addColorStop(1, 'rgba(0,0,0,0)'); [-1, 1].forEach(k => { bg.save(); bg.translate(fx + k * 40 * S, fy + 34 * S); bg.scale(1.4, 0.7); bg.fillStyle = gr; bg.fillRect(-30 * S, -30 * S, 60 * S, 60 * S); bg.restore(); }); }
    bg.fillStyle = st.hair; bg.beginPath(); bg.moveTo(0, 0);
    for (let i = 0; i <= 128; i++) { // hairline height per column (v): low at the nape, high at the forehead, jagged bangs in front
      const u = i / 128, du = Math.abs(((u - 0.25 + 1.5) % 1) - 0.5) * 2; // 0 at the face centre, 1 at the back
      let v = st.nape * du + st.brow * (1 - du);
      if (du < st.bangW) { const k = (u * 128) % 1, tooth = Math.abs(Math.sin(u * Math.PI * st.teeth)); v = st.brow + (st.bangLen - st.brow) * Math.pow(tooth, 0.7) * (1 - du / st.bangW); }
      if (du > 0.45 && du < 0.62 && st.side) v = Math.max(v, st.side); // side locks over the ears
      bg.lineTo(u * TW, v * TH);
    }
    bg.lineTo(TW, 0); bg.closePath();
    bg.save(); bg.strokeStyle = 'rgba(120,50,70,0.32)'; bg.lineWidth = 22 * S; bg.stroke(); bg.restore(); bg.fill();
    bg.strokeStyle = 'rgba(30,16,26,0.75)'; bg.lineWidth = 3 * S; bg.stroke();
    const hairHi = G.mixHex ? null : null;
    bg.fillStyle = 'rgba(255,255,255,0.10)'; bg.fillRect(0, TH * 0.08, TW, TH * 0.05); // sheen band
    // the moving parts
    const stt = { gx: 9, gy: 9, b: 9, m: 9 };
    const eye = (cx, cy, open, gx, gy, k) => {
      const ew = st.eyeW * S, eh = st.eyeH * S;
      g.save(); g.translate(cx, cy);
      if (open < 0.15) { g.strokeStyle = st.lash; g.lineWidth = 4 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ew, -2 * S); g.quadraticCurveTo(0, 6 * S, ew, -2 * S * k); g.stroke(); g.restore(); return; }
      const top = -eh * open, bot = eh * 0.75;
      g.beginPath(); g.moveTo(-ew, 0); g.bezierCurveTo(-ew * 0.7, top, ew * 0.5, top * 1.05, ew * 1.05, top * 0.55); g.lineTo(ew, bot * 0.4); g.bezierCurveTo(ew * 0.5, bot, -ew * 0.6, bot, -ew, 0); g.closePath();
      g.fillStyle = '#fbf7f4'; g.fill(); g.save(); g.clip();
      const ix = gx * ew * 0.45, iy = gy * eh * 0.25 + eh * 0.05, ir = ew * 0.62;
      const ig = g.createLinearGradient(0, iy - ir * 1.2, 0, iy + ir * 1.2); ig.addColorStop(0, st.iris3 || '#120808'); ig.addColorStop(0.45, st.iris); ig.addColorStop(1, st.iris2);
      g.fillStyle = ig; g.beginPath(); g.ellipse(ix, iy, ir, ir * 1.22, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(10,4,6,0.85)'; g.beginPath(); g.ellipse(ix, iy + ir * 0.05, ir * 0.42, ir * 0.55, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-ew * 1.2, top - 2, ew * 2.4, eh * 0.35); // lid shadow
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ix - ir * 0.38, iy - ir * 0.45, ir * 0.3, ir * 0.36, -0.4, 0, 7); g.fill();
      g.beginPath(); g.arc(ix + ir * 0.35, iy + ir * 0.5, ir * 0.13, 0, 7); g.fill(); g.restore();
      g.strokeStyle = st.lash; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 5.5 * S;
      g.beginPath(); g.moveTo(-ew * 1.08, 2 * S); g.bezierCurveTo(-ew * 0.7, top - 1, ew * 0.5, top * 1.05 - 1, ew * 1.15, top * 0.5); g.stroke(); // heavy upper lash
      g.lineWidth = 2 * S; g.beginPath(); g.moveTo(ew * 0.9, bot * 0.45); g.quadraticCurveTo(0, bot * 1.05, -ew * 0.55, bot * 0.8); g.stroke();
      g.restore();
    };
    function draw(gx, gy, blink, mouth) {
      const q = v => Math.round(v * 10) / 10; gx = q(gx); gy = q(gy); blink = q(blink); mouth = q(mouth);
      if (stt.gx === gx && stt.gy === gy && stt.b === blink && stt.m === mouth) return;
      Object.assign(stt, { gx, gy, b: blink, m: mouth });
      g.drawImage(base, 0, 0);
      const ex = st.eyeX * S, ey = fy + st.eyeY * S, open = st.sleepy ? Math.min(0.35, 1 - blink) : 1 - blink;
      g.save(); g.translate(fx - ex, ey); g.scale(-1, 1); eye(0, 0, st.winkL ? 0 : open, -gx, gy, 1); g.restore();
      eye(fx + ex, ey, open, gx, gy, 1);
      g.strokeStyle = st.brow2 || st.lash; g.lineWidth = 3.2 * S; g.lineCap = 'round'; // brows ride over the bangs, as anime does
      [-1, 1].forEach(k => { g.beginPath(); g.moveTo(fx + k * (ex - st.eyeW * 0.8 * S), ey - st.eyeH * S - 10 * S + st.browTilt * S); g.quadraticCurveTo(fx + k * ex, ey - st.eyeH * S - 16 * S, fx + k * (ex + st.eyeW * 0.9 * S), ey - st.eyeH * S - 12 * S - st.browTilt * S); g.stroke(); });
      g.strokeStyle = 'rgba(120,60,50,0.55)'; g.lineWidth = 2 * S; g.beginPath(); g.moveTo(fx + 2 * S, fy + 38 * S); g.lineTo(fx - 1 * S, fy + 42 * S); g.stroke(); // nose
      if (st.mouth) { const mo = Math.max(0, mouth), my = fy + 58 * S;
        if (mo < 0.08) { g.strokeStyle = '#4a1a1e'; g.lineWidth = 2.5 * S; g.beginPath(); g.moveTo(fx - 12 * S, my); g.quadraticCurveTo(fx, my + (st.smirk ? -1 : 3) * S, fx + 13 * S, my - (st.smirk ? 4 : 0) * S); g.stroke(); }
        else { g.fillStyle = '#6a1f26'; g.beginPath(); g.ellipse(fx, my + 2 * S, (9 + mo * 3) * S, (2 + mo * 9) * S, 0, 0, 7); g.fill(); g.strokeStyle = '#3a1014'; g.lineWidth = 2 * S; g.stroke(); g.fillStyle = '#d06070'; g.beginPath(); g.ellipse(fx, my + (3 + mo * 5) * S, 5 * S, mo * 3 * S, 0, 0, 7); g.fill(); } }
      tex.needsUpdate = true;
    }
    draw(0, 0, 0, 0);
    // skull: a sphere pulled into a V jaw
    const geo = new THREE.SphereGeometry(r, 64, 40), P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) { let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const k = Math.pow(Math.max(0, -y / r), 1.4);
      x *= 1 - 0.22 * k; z *= 1 - 0.1 * k; if (z > 0) z *= 1 + 0.04 * k; y -= 0.08 * r * k; x *= 0.92; P.setXYZ(i, x, y, z); }
    geo.computeVertexNormals();
    const head = part(geo, toon('#ffffff', { map: tex }), 's'); head.position.set(0, 0.12, 0); J.head.add(head);
    // hair locks: crown spikes swept back and up, bangs that stop above the eyes, optional long side locks
    const mat = toon(st.hair), Rr = G.rng(st.seed || 1), H0 = V3(0, 0.12, 0), sp = (th, ph, rr) => V3(Math.sin(ph) * Math.sin(th) * rr * 0.92, Math.cos(ph) * rr, Math.sin(ph) * Math.cos(th) * rr).add(H0);
    const lock = (a, b, rad, tw) => { const len = a.distanceTo(b), c = cone(rad, len, mat, 's', 5); c.position.copy(a).lerp(b, 0.5); c.quaternion.setFromUnitVectors(V3(0, 1, 0), b.clone().sub(a).normalize()); if (tw) c.scale.x = tw; J.head.add(c); return c; };
    for (let i = 0; i < st.spikes; i++) { // crown and back
      const th = Math.PI + (Rr() - 0.5) * Math.PI * 1.85, fwd = Math.cos(th), ph = 0.1 + Rr() * (Math.abs(Math.sin(th)) > 0.6 ? 1.15 : 1.55);
      if (fwd > 0.2 && ph > 0.45) continue;
      const a = sp(th, ph, r * 0.9), out = a.clone().sub(H0).normalize(); out.y += st.up; out.z -= st.back; out.normalize();
      lock(a, a.clone().add(out.multiplyScalar(st.len * (0.6 + Rr() * 0.7))), st.thick * (0.8 + Rr() * 0.5));
    }
    for (let i = 0; i < st.bangs; i++) { // bangs: from the upper forehead down to just above the brows
      const th = (i / (st.bangs - 1) - 0.5) * st.bangSpan, a = sp(th, 0.5, r * 1.04), b = sp(th + (Rr() - 0.5) * 0.15, st.bangPh + Rr() * 0.1, r * 1.09);
      lock(a, b, st.thick * 0.85, 1.15);
    }
    (st.sideLocks || []).forEach(([th, ph1, len]) => { const a = sp(th, 0.9, r * 1.08), b = sp(th * 1.02, ph1, r * 1.12); b.y -= len; lock(a, b, st.thick * 0.9, 1.3); });
    // a few big swept locks give the silhouette
    (st.sweep || []).forEach(([th, ph, dx, dy, dz, rad]) => { const a = sp(th, ph, r * 0.95); lock(a, a.clone().add(V3(dx, dy, dz)), rad); });
    return { draw, head };
  }
  /* ---------- humanoid skeleton ---------- */
  function skeleton(o) {
    const { leg = 0.9, torso = 0.5, arm = 0.56, sw = 0.19, hw = 0.1, head = 0.12 } = o;
    const J = {}, mk = (n, parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); (parent ? J[parent] : J.root).add(g); J[n] = g; return g; };
    J.root = new THREE.Group();
    mk('hips', null, 0, leg, 0); mk('spine', 'hips', 0, 0.02, 0); mk('chest', 'spine', 0, torso * 0.55, 0); mk('neck', 'chest', 0, torso * 0.45, 0); mk('head', 'neck', 0, 0.07, 0);
    ['L', 'R'].forEach((s, i) => { const k = i ? -1 : 1;
      mk('sh' + s, 'chest', sw * k, torso * 0.36, 0); mk('ua' + s, 'sh' + s, 0, 0, 0); mk('el' + s, 'ua' + s, 0, -arm * 0.52, 0); mk('hand' + s, 'el' + s, 0, -arm * 0.48, 0);
      mk('th' + s, 'hips', hw * k, -0.02, 0); mk('kn' + s, 'th' + s, 0, -leg * 0.5, 0); mk('an' + s, 'kn' + s, 0, -leg * 0.47, 0); });
    J.dims = { leg, torso, arm, sw, hw, head };
    return J;
  }
  const limb = (J, from, len, r0, r1, mat, ink = 's') => { const p = part(new THREE.CylinderGeometry(r1, r0, len, 12), mat, ink); p.position.y = -len / 2; J[from].add(p); const k = sph(r0 * 1.02, mat, ink); J[from].add(k); return p; };
  /* ---------- the Headsman's Axe ---------- */
  function axe() {
    const g = new THREE.Group(), steel = toon('#c4c7d0'), dark = toon('#33363e'), red = toon('#9a2430');
    const handle = cyl(0.018, 0.018, 1.28, dark, 's', 10); at(handle, 0, 0.42, 0); g.add(handle);
    const grip = cyl(0.026, 0.026, 0.16, red, 's', 10); at(grip, 0, 0.82, 0); g.add(grip);
    const coll = cyl(0.03, 0.03, 0.06, steel, 's', 10); at(coll, 0, 0.92, 0); g.add(coll);
    const butt = cyl(0.026, 0.022, 0.05, steel, 's', 10); at(butt, 0, -0.22, 0); g.add(butt);
    const sh = new THREE.Shape(), C = 0.0, Rin = 0.17, Rout = 0.36, A = 1.75, N = 40;
    for (let i = 0; i <= N; i++) { const a = -A + 2 * A * i / N, k = Math.abs(a) / A, r = Rin + (Rout - Rin) * Math.pow(Math.max(0, 1 - k * k), 0.55); const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
    for (let i = N; i >= 0; i--) { const a = -A + 2 * A * i / N; sh.lineTo(Math.cos(a) * Rin, Math.sin(a) * Rin); }
    const blade = part(new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), steel, 'm');
    blade.rotation.z = Math.PI / 2; blade.position.set(0, 0.9 + C, -0.011); g.add(blade);
    const plate = box(0.1, 0.12, 0.05, toon('#5c5f69')); at(plate, 0, 1.07, 0); g.add(plate);
    const spike = cone(0.02, 0.12, steel); at(spike, 0, 1.33, 0); g.add(spike);
    const glow = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), basic('#ff3a2a', { add: true, transparent: true, opacity: 0 }));
    glow.rotation.z = Math.PI / 2; glow.position.set(0, 0.9, -0.015); glow.scale.setScalar(1.06); g.add(glow); g.userData.glow = glow;
    return g;
  }
  function glaive() {
    const g = new THREE.Group(), pole = cyl(0.016, 0.016, 1.7, toon('#221f28'), 's', 8); at(pole, 0, 0.55, 0); g.add(pole);
    const pom = cone(0.03, 0.08, toon('#a3202a')); at(pom, 0, -0.33, 0, Math.PI, 0, 0); g.add(pom);
    const guard = cyl(0.035, 0.035, 0.04, toon('#c9a659'), 's', 8); at(guard, 0, 1.4, 0); g.add(guard);
    const sh = new THREE.Shape(); sh.moveTo(-0.03, 0); sh.quadraticCurveTo(-0.11, 0.3, -0.07, 0.62); sh.quadraticCurveTo(0.0, 0.42, 0.04, 0.05); sh.lineTo(-0.03, 0);
    const bl = part(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), toon('#9fb0c8'), 'm'); at(bl, 0, 1.42, -0.006); g.add(bl);
    return g;
  }

  /* ---------- characters ---------- */
  function takuto() {
    const J = skeleton({ leg: 0.92, torso: 0.52, arm: 0.58, sw: 0.2, head: 0.125 });
    const red = toon('#b4283a'), redD = toon('#7e1a28'), black = toon('#1f1d24'), skin = toon('#f6e2d6'), teal = toon('#3ec9c0'), pants = toon('#2c2c34'), boot = toon('#18171c');
    const f = animeHead(J, { tex: 2048, r: 0.12, skin: '#e9c3ac', hair: '#dcdbea', lash: '#24121a', brow2: '#9a96a8', iris: '#b0202c', iris2: '#ff7a70', iris3: '#2a0408', eyeX: 47, eyeY: 12, eyeW: 24, eyeH: 24, browTilt: 5, nape: 0.8, brow: 0.27, bangW: 0.34, bangLen: 0.44, teeth: 22, side: 0.64, spikes: 30, up: 0.5, back: 0.75, len: 0.13, thick: 0.046, bangs: 9, bangSpan: 1.7, bangPh: 1.22, sweep: [[0.9, 0.7, 0.12, 0.08, -0.06, 0.04], [-0.9, 0.7, -0.12, 0.09, -0.05, 0.04], [0.2, 0.25, 0.04, 0.15, 0.02, 0.04], [-0.4, 0.3, -0.05, 0.14, 0.0, 0.04]], seed: 3 });
    const collar = cyl(0.078, 0.07, 0.12, black, 's', 16); at(collar, 0, 0.0, 0.0); J.neck.add(collar); // tall collar hides the mouth
    [-0.045, 0.045].forEach(x => { const b = box(0.03, 0.02, 0.015, toon('#8a8c94')); at(b, x, 0.03, 0.072); J.neck.add(b); });
    const torso = cyl(0.17, 0.15, 0.36, red, 'm', 16); at(torso, 0, 0.05, 0); torso.scale.z = 0.72; J.chest.add(torso);
    const inner = box(0.12, 0.34, 0.05, black); at(inner, 0, 0.04, 0.1); J.chest.add(inner);
    const belt = box(0.13, 0.04, 0.03, toon('#55545c')); at(belt, 0, -0.06, 0.13); J.chest.add(belt);
    const skirt = cyl(0.16, 0.24, 0.42, red, 'm', 18, true, 0.5, Math.PI * 2 - 1.0); at(skirt, 0, -0.2, 0); skirt.scale.z = 0.8; skirt.material = red; J.hips.add(skirt); J.skirt = skirt;
    skirt.userData.mesh.material = toon('#b4283a', { side: THREE.DoubleSide });
    ['L', 'R'].forEach((s, i) => {
      limb(J, 'ua' + s, 0.3, 0.06, 0.055, red); limb(J, 'el' + s, 0.28, 0.055, 0.045, red);
      const strap = cyl(0.062, 0.062, 0.03, teal, 's'); at(strap, 0, -0.12, 0); J['ua' + s].add(strap);
      const hand = sph(0.045, black, 's', 1, 1.2, 0.8); at(hand, 0, -0.03, 0); J['hand' + s].add(hand);
      limb(J, 'th' + s, 0.46, 0.085, 0.07, pants); limb(J, 'kn' + s, 0.43, 0.065, 0.055, pants);
      const b = box(0.11, 0.12, 0.2, boot, 's'); at(b, 0, -0.03, 0.04); J['an' + s].add(b);
    });
    const ax = axe(); J.handR.add(ax); ax.position.set(0, -0.02, 0); J.weapon = ax;
    const bag = new THREE.Group(); const bb = sph(0.12, toon('#efefec'), 's', 1, 1.15, 0.7); bb.position.y = -0.17; bag.add(bb); [-0.04, 0.04].forEach(x => { const hdl = cyl(0.006, 0.006, 0.1, toon('#efefec'), null, 6); hdl.position.set(x, -0.04, 0); bag.add(hdl); }); bag.visible = false; J.handL.add(bag); J.bag = bag;
    const ch = { J, face: f, kind: 'takuto', height: 1.78 }; return ch;
  }
  function nemu() {
    const J = skeleton({ leg: 0.78, torso: 0.42, arm: 0.48, sw: 0.16, hw: 0.09, head: 0.13 });
    const hair = toon('#26232c'), skin = toon('#e6b48e'), top = toon('#d6dad8'), pants = toon('#3b4049'), shoe = toon('#efece8');
    const f = animeHead(J, { r: 0.125, skin: '#eebd98', hair: '#25222c', lash: '#1a1016', iris: '#c07a2a', iris2: '#ffd070', eyeX: 46, eyeY: 12, eyeW: 22, eyeH: 26, browTilt: -2, sleepy: true, blush: 'rgba(255,110,110,0.35)', mouth: true, nape: 0.86, brow: 0.27, bangW: 0.4, bangLen: 0.47, teeth: 26, side: 0.8, spikes: 24, up: -0.6, back: 0.2, len: 0.09, thick: 0.05, bangs: 11, bangSpan: 1.9, bangPh: 1.3, sideLocks: [[1.25, 1.75, 0.06], [-1.25, 1.75, 0.06]], seed: 5 });
    [[-0.09, 0.3], [0.09, -0.3]].forEach(([x, rz]) => { const e = cone(0.05, 0.12, hair, 's', 4); at(e, x, 0.27, -0.01, 0, 0, rz); J.head.add(e); const inr = cone(0.028, 0.07, toon('#d98a9a'), null, 4); at(inr, x, 0.26, 0.012, 0, 0, rz); J.head.add(inr); J['ear' + (x < 0 ? 'L' : 'R')] = e; });
    const torso = cyl(0.14, 0.13, 0.2, top, 'm', 14); at(torso, 0, 0.12, 0); torso.scale.z = 0.75; J.chest.add(torso);
    const belly = cyl(0.11, 0.12, 0.16, skin, 's', 14); at(belly, 0, -0.06, 0); belly.scale.z = 0.72; J.chest.add(belly);
    ['L', 'R'].forEach(s => {
      limb(J, 'ua' + s, 0.25, 0.07, 0.06, top); limb(J, 'el' + s, 0.23, 0.05, 0.04, skin);
      limb(J, 'th' + s, 0.4, 0.11, 0.1, pants); limb(J, 'kn' + s, 0.36, 0.1, 0.09, pants);
      const b = box(0.1, 0.08, 0.18, shoe, 's'); at(b, 0, -0.02, 0.04); J['an' + s].add(b);
    });
    const waist = cyl(0.14, 0.15, 0.1, pants, 's', 14); at(waist, 0, -0.03, 0); J.hips.add(waist);
    J.tail = []; let prev = J.hips; // segmented tail
    for (let i = 0; i < 9; i++) { const g = new THREE.Group(); g.position.set(0, i ? 0.07 : 0.0, i ? 0 : -0.12); prev.add(g); const seg = cap(0.022, 0.05, hair, 's'); seg.position.y = 0.035; g.add(seg); J.tail.push(g); prev = g; }
    J.tail[0].rotation.x = -1.9;
    return { J, face: f, kind: 'nemu', height: 1.55 };
  }
  function sieg() {
    const J = skeleton({ leg: 0.98, torso: 0.56, arm: 0.62, sw: 0.22, head: 0.125 });
    const coat = toon('#2a3352'), shirt = toon('#5a5c3e'), skin = toon('#d6a48c'), pants = toon('#262a38'), boot = toon('#5a4232'), fur = toon('#cbb07a'), band = toon('#1c1a20');
    const f = animeHead(J, { r: 0.12, skin: '#d29c82', hair: '#e2e1da', lash: '#22121a', brow2: '#a8a49a', iris: '#a02236', iris2: '#ff8090', eyeX: 46, eyeY: 12, eyeW: 22, eyeH: 21, browTilt: 1, winkL: true, mouth: true, smirk: true, nape: 0.78, brow: 0.27, bangW: 0.3, bangLen: 0.42, teeth: 18, side: 0.6, spikes: 36, up: 0.9, back: 0.35, len: 0.17, thick: 0.044, bangs: 6, bangSpan: 1.3, bangPh: 1.2, seed: 9 });
    const hb = cyl(0.138, 0.138, 0.04, band, 's', 20, true); at(hb, 0, 0.2, 0, -0.15, 0, 0); hb.userData.mesh.material = toon('#1c1a20', { side: THREE.DoubleSide }); J.head.add(hb);
    const torso = cyl(0.18, 0.16, 0.4, coat, 'm', 16); at(torso, 0, 0.05, 0); torso.scale.z = 0.72; J.chest.add(torso);
    const sh2 = box(0.13, 0.36, 0.05, shirt); at(sh2, 0, 0.04, 0.11); J.chest.add(sh2);
    for (let i = 0; i < 26; i++) { const a = -Math.PI * 0.95 + i / 25 * Math.PI * 1.9 - Math.PI / 2, c = cone(0.035, 0.09, fur, 's', 5); at(c, Math.cos(a) * 0.17, 0.22, Math.sin(a) * 0.12 - 0.01, 0, 0, Math.cos(a) * -1.1); J.chest.add(c); }
    const skirt = cyl(0.17, 0.27, 0.7, coat, 'm', 18, true, 0.55, Math.PI * 2 - 1.1); at(skirt, 0, -0.33, 0); skirt.scale.z = 0.8; skirt.userData.mesh.material = toon('#2a3352', { side: THREE.DoubleSide }); J.hips.add(skirt); J.skirt = skirt;
    const belt = cyl(0.16, 0.16, 0.04, toon('#7a5a3a'), 's', 16); at(belt, 0, 0.02, 0, 0.15, 0, 0.1); belt.scale.z = 0.75; J.hips.add(belt);
    ['L', 'R'].forEach(s => {
      limb(J, 'ua' + s, 0.32, 0.065, 0.058, coat); limb(J, 'el' + s, 0.3, 0.05, 0.042, skin);
      const hand = sph(0.045, toon('#1d1c22'), 's', 1, 1.2, 0.8); at(hand, 0, -0.03, 0); J['hand' + s].add(hand);
      limb(J, 'th' + s, 0.49, 0.085, 0.07, pants); limb(J, 'kn' + s, 0.46, 0.065, 0.058, boot);
      const b = box(0.11, 0.1, 0.21, boot, 's'); at(b, 0, -0.03, 0.04); J['an' + s].add(b);
    });
    const gl = glaive(); J.handL.add(gl); gl.position.set(0, 0, 0); J.weapon = gl;
    return { J, face: f, kind: 'sieg', height: 1.88 };
  }
  function shieldbearer() { // an armoured skeleton: horned skull, open ribcage, layered pauldrons, a riveted iron tower shield
    const J = skeleton({ leg: 1.1, torso: 0.78, arm: 0.9, sw: 0.42, hw: 0.2, head: 0.17 });
    const iron = toon('#35313c'), ironD = toon('#1c1a21'), bone = toon('#dcd2bd'), boneD = toon('#9a8f7c'), cloth = toon('#22171b', { side: THREE.DoubleSide }), rust = toon('#5c3626'), black = toon('#050304', { rim: false });
    // skull
    const cran = sph(0.15, bone, 's', 0.92, 1.0, 1.05); J.head.add(at(cran, 0, 0.16, 0.06));
    [-1, 1].forEach(k => { const ch = sph(0.05, bone, 's', 1.2, 0.8, 1); J.head.add(at(ch, k * 0.075, 0.1, 0.15)); const so = sph(0.042, black, null, 1.1, 0.9, 0.6); J.head.add(at(so, k * 0.055, 0.15, 0.185)); });
    const nose = cone(0.025, 0.05, black, null, 3); J.head.add(at(nose, 0, 0.1, 0.205, Math.PI, 0, 0));
    for (let i = 0; i < 8; i++) { const tth = box(0.016, 0.03, 0.014, bone, null); J.head.add(at(tth, -0.056 + i * 0.016, 0.055, 0.19)); }
    const jaw = new THREE.Group(); at(jaw, 0, 0.06, 0.06); J.head.add(jaw); const jw = box(0.15, 0.045, 0.13, bone, 's'); at(jw, 0, -0.04, 0.06); jaw.add(jw);
    for (let i = 0; i < 8; i++) { const tth = box(0.015, 0.026, 0.013, bone, null); jaw.add(at(tth, -0.052 + i * 0.015, -0.005, 0.125)); } J.jaw = jaw;
    [-1, 1].forEach(k => { let prev = J.head, pos = V3(k * 0.11, 0.24, 0.02); for (let i = 0; i < 4; i++) { const r0 = 0.045 - i * 0.01, c = cone(r0, 0.13, boneD, 's', 8); const g = new THREE.Group(); g.position.copy(pos); g.rotation.set(-0.5 - i * 0.35, 0, k * (-0.7 + i * 0.3)); prev.add(g); c.position.y = 0.06; g.add(c); prev = g; pos = V3(0, 0.11, 0); } });
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), iron); helm.scale.set(1, 0.95, 1.1); J.head.add(at(helm, 0, 0.16, 0.0, -0.35, 0, 0));
    const hood = cyl(0.2, 0.3, 0.32, cloth, 'm', 14, true, Math.PI * 0.6, Math.PI * 0.8); J.head.add(at(hood, 0, 0.08, -0.03));
    const eyesM = basic('#ff2a1a'); [-0.055, 0.055].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), eyesM); at(e, x, 0.15, 0.2); J.head.add(e); const gl = glowSprite('#ff3a20', 0.16, 0.9); at(gl, x, 0.15, 0.22); J.head.add(gl); });
    const eyeLight = new THREE.PointLight('#ff2a1a', 1.2, 2.5); at(eyeLight, 0, 0.15, 0.4); J.head.add(eyeLight); J.eyeLight = eyeLight;
    // torso: curved breastplate, gorget, open ribcage over a spine, belt
    const plate = new THREE.LatheGeometry([[0.2, -0.05], [0.36, 0.0], [0.43, 0.18], [0.44, 0.38], [0.38, 0.52], [0.2, 0.58]].map(([x, y]) => new THREE.Vector2(x, y)), 18);
    const bp = part(plate, iron, 'l'); bp.scale.z = 0.7; J.chest.add(at(bp, 0, -0.08, 0));
    const gorget = cyl(0.2, 0.26, 0.12, ironD, 'm', 16); J.chest.add(at(gorget, 0, 0.5, 0));
    const spineC = cyl(0.04, 0.04, 0.5, boneD, 's', 8); J.spine.add(at(spineC, 0, 0.12, -0.05));
    for (let i = 0; i < 5; i++) { const rib = part(new THREE.TorusGeometry(0.24 - i * 0.02, 0.022, 6, 18, Math.PI), bone, 's'); rib.scale.z = 0.62; J.spine.add(at(rib, 0, 0.32 - i * 0.07, 0, -0.25, 0, Math.PI)); }
    const belt = cyl(0.3, 0.3, 0.09, rust, 's', 16); belt.scale.z = 0.7; J.hips.add(at(belt, 0, 0.04, 0)); const buckle = sph(0.06, bone, 's', 1, 1, 0.5); J.hips.add(at(buckle, 0, 0.04, 0.21));
    const tasset = cyl(0.3, 0.4, 0.35, ironD, 'm', 12, true, -Math.PI * 0.35, Math.PI * 0.7); J.hips.add(at(tasset, 0, -0.14, 0)); tasset.userData.mesh.material = toon('#1c1a21', { side: THREE.DoubleSide });
    // tattered cape
    const capeTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); const R = G.rng(12); for (let x = w; x >= 0; x -= 14) g.lineTo(x, h * (0.72 + R() * 0.28)); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(R() * w, h * (0.3 + R() * 0.6), 4 + R() * 10, 8 + R() * 30, 0, 0, 7); g.fill(); } });
    const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 1.5, 14, 1, true, Math.PI * 0.62, Math.PI * 0.76), toon('#2a1c22', { map: capeTex, side: THREE.DoubleSide, transparent: true })); cape.material.alphaTest = 0.5; cape.material.transparent = false;
    const capeG = new THREE.Group(); capeG.add(cape); cape.position.y = -0.7; J.chest.add(at(capeG, 0, 0.5, -0.06)); J.skirt = capeG;
    ['L', 'R'].forEach((sd, i) => { const k = i ? -1 : 1;
      for (let l = 0; l < 3; l++) { const pd = new THREE.Mesh(new THREE.SphereGeometry(0.22 - l * 0.03, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), l % 2 ? ironD : iron); pd.scale.set(1.1, 0.75, 1.0); J['sh' + sd].add(at(pd, k * l * 0.04, 0.06 - l * 0.08, 0)); const o = new THREE.Mesh(pd.geometry, inkMat(0.012)); o.scale.copy(pd.scale); J['sh' + sd].add(at(o, k * l * 0.04, 0.06 - l * 0.08, 0)); }
      for (let q = 0; q < 3; q++) { const sp = cone(0.035, 0.24 - q * 0.04, boneD, 's', 6); J['sh' + sd].add(at(sp, k * (0.06 + q * 0.06), 0.18, -0.04 + q * 0.04, -0.2, 0, -k * (0.35 + q * 0.25))); }
      limb(J, 'ua' + sd, 0.47, 0.12, 0.1, iron, 'm'); const band = cyl(0.125, 0.125, 0.05, rust, 's', 12); J['ua' + sd].add(at(band, 0, -0.3, 0));
      [-0.03, 0.03].forEach(dx => { const bn = cyl(0.026, 0.02, 0.4, bone, 's', 8); J['el' + sd].add(at(bn, dx, -0.2, 0)); });
      const elb = sph(0.075, ironD, 's'); J['el' + sd].add(elb); const gaunt = cyl(0.09, 0.07, 0.16, ironD, 'm', 10); J['el' + sd].add(at(gaunt, 0, -0.36, 0));
      limb(J, 'th' + sd, 0.56, 0.16, 0.13, iron, 'm'); const kneeCop = sph(0.11, ironD, 'm', 1, 1, 1.1); J['kn' + sd].add(at(kneeCop, 0, 0, 0.05));
      limb(J, 'kn' + sd, 0.52, 0.13, 0.1, ironD, 'm'); const ft = box(0.2, 0.12, 0.34, iron, 'm'); at(ft, 0, -0.04, 0.07); J['an' + sd].add(ft); const toe = cone(0.07, 0.14, ironD, 's', 6); J['an' + sd].add(at(toe, 0, -0.04, 0.27, Math.PI / 2, 0, 0)); });
    for (let q = 0; q < 4; q++) { const cl = cone(0.022, 0.28, bone, 's', 6); J.handL.add(at(cl, -0.06 + q * 0.04, -0.17, 0.05, 0.35, 0, 0)); }
    // the tower shield: riveted black iron, a bone skull emblem, rust streaks and a pointed foot
    const tex = canvasTex(512, 896, (g, w, h) => { const R = G.rng(21); g.fillStyle = '#3a3640'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) { const y0 = i * h / 4; const gr = g.createLinearGradient(0, y0, 0, y0 + h / 4); gr.addColorStop(0, '#4a4550'); gr.addColorStop(1, '#2a272f'); g.fillStyle = gr; g.fillRect(10, y0 + 6, w - 20, h / 4 - 12); }
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; for (let i = 0; i < 80; i++) { const x = R() * w, y = R() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 60, y + (R() - 0.5) * 20); g.stroke(); }
      for (let i = 0; i < 26; i++) { const x = R() * w; const gr = g.createLinearGradient(0, 0, 0, h); g.fillStyle = 'rgba(120,60,30,' + (0.12 + R() * 0.2) + ')'; g.fillRect(x, R() * h * 0.6, 3 + R() * 8, 80 + R() * 260); }
      g.fillStyle = '#8a8490'; for (let i = 0; i <= 4; i++) for (let x = 24; x < w; x += 44) { g.beginPath(); g.arc(x, i * h / 4 + (i === 0 ? 14 : i === 4 ? -14 : 0), 6, 0, 7); g.fill(); }
      g.save(); g.translate(w / 2, h * 0.42); g.fillStyle = '#d6ccb6'; g.beginPath(); g.ellipse(0, 0, 90, 100, 0, 0, 7); g.fill(); g.fillRect(-60, 50, 120, 70); g.fillStyle = '#1a1416'; g.beginPath(); g.ellipse(-36, -4, 26, 30, 0.2, 0, 7); g.ellipse(36, -4, 26, 30, -0.2, 0, 7); g.fill(); g.beginPath(); g.moveTo(0, 30); g.lineTo(-12, 56); g.lineTo(12, 56); g.fill(); for (let t2 = -50; t2 <= 50; t2 += 20) g.fillRect(t2 - 2, 78, 4, 40); g.restore();
      g.fillStyle = 'rgba(160,30,20,0.5)'; g.beginPath(); g.arc(w / 2 - 36, h * 0.42 - 4, 10, 0, 7); g.arc(w / 2 + 36, h * 0.42 - 4, 10, 0, 7); g.fill(); });
    const shp = new THREE.Shape(); shp.moveTo(-0.52, 0.45); shp.lineTo(0.52, 0.45); shp.lineTo(0.5, -1.05); shp.lineTo(0, -1.38); shp.lineTo(-0.5, -1.05); shp.closePath();
    const sgeo = new THREE.ExtrudeGeometry(shp, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 2 });
    sgeo.computeBoundingBox(); const bb = sgeo.boundingBox, uv = sgeo.attributes.uv, pos = sgeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
    const shield = new THREE.Group(); at(shield, 0.1, -0.15, 0.32); J.handR.add(shield); J.shield = shield;
    const sb = part(sgeo, toon('#ffffff', { map: tex }), 'l'); at(sb, 0, 0, -0.035); shield.add(sb);
    const rimBand = part(new THREE.TorusGeometry(0.01, 0.01, 4, 4), ironD, null); shield.add(rimBand);
    for (let q = 0; q < 6; q++) { const sp = cone(0.045, 0.22, boneD, 's', 6); at(sp, (q % 2 ? 1 : -1) * 0.53, 0.3 - Math.floor(q / 2) * 0.6, 0.0, 0, 0, (q % 2 ? -1 : 1) * 1.35); shield.add(sp); }
    const boss = sph(0.08, ironD, 's', 1, 1, 0.5); shield.add(at(boss, 0, -0.95, 0.06));
    J.cracks = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.75), basic('#ff4a2a', { add: true, transparent: true, opacity: 0 })); at(J.cracks, 0, -0.45, 0.075); shield.add(J.cracks);
    return { J, kind: 'shield', height: 2.7 };
  }
  function tofu() { // Valentine's Brand-reading cube: a little box robot with a screen face
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const cube = box(0.42, 0.42, 0.42, toon('#eceae4'), 'm'); body.add(cube); const rimB = box(0.44, 0.06, 0.44, toon('#c8c4bc'), 's'); body.add(at(rimB, 0, -0.17, 0));
    const scr = canvasTex(128, 128, () => {}), sm = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), new THREE.MeshBasicMaterial({ map: scr })); body.add(at(sm, 0, 0.02, 0.212));
    const ant = cyl(0.008, 0.008, 0.16, toon('#8a8a92'), null, 6); body.add(at(ant, 0.1, 0.29, 0)); const bulb = sph(0.025, basic('#ff6ab0'), null); body.add(at(bulb, 0.1, 0.38, 0));
    const face = (mode, t) => { const g = scr.userData.g; g.fillStyle = '#10141c'; g.fillRect(0, 0, 128, 128); g.fillStyle = mode === 'error' ? '#ff4050' : '#6ae8ff'; g.strokeStyle = g.fillStyle; g.lineWidth = 8; g.lineCap = 'round';
      if (mode === 'error') { g.font = '700 30px monospace'; g.textAlign = 'center'; g.fillText('ERR', 64, 74); if (Math.floor(t * 6) % 2) g.fillRect(14, 96, 100, 6); }
      else if (mode === 'scan') { const y = 20 + ((t * 120) % 88); g.fillRect(14, y, 100, 4); g.fillRect(36, 40, 14, 14); g.fillRect(78, 40, 14, 14); }
      else { const bl = (t % 3.2) < 0.12; if (bl) { g.fillRect(30, 50, 22, 5); g.fillRect(76, 50, 22, 5); } else { g.fillRect(34, 40, 14, 20); g.fillRect(80, 40, 14, 20); } g.beginPath(); g.arc(64, 74, 16, 0.2, Math.PI - 0.2); g.stroke(); }
      scr.needsUpdate = true; };
    return { J: { root, body }, kind: 'tofu', simple: true, face, lastFace: '' };
  }
  // creatures from the series art: a cut-out card that faces the camera, breathes, sways, lunges and flinches
  const SPRITE_H = { m_golem: 5.2, m_hydra: 6.0, m_morvudd: 7.0, m_plume: 3.2, m_redgiant: 4.6, m_tyr: 6.2, m_wolf: 2.35 };
  function loadSprites(names, base = 'sprites/') { return Promise.all(names.filter(n => !chars[n]).map(n => new Promise(res => { const im = new Image(); im.onload = () => { chars[n] = spriteChar(n, im); res(); }; im.onerror = () => res(); im.src = base + n + '.webp'; }))); }
  function spriteChar(name, im) {
    const tex = new THREE.Texture(im); tex.needsUpdate = true; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    const hgt = SPRITE_H[name] || 3, wid = hgt * im.width / im.height;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, fog: true });
    const root = new THREE.Group(), body = new THREE.Group(), plane = new THREE.Mesh(new THREE.PlaneGeometry(wid, hgt), mat); plane.position.y = hgt / 2; body.add(plane); root.add(body);
    const head = new THREE.Group(); head.position.y = hgt * 0.82; body.add(head); const chest = new THREE.Group(); chest.position.y = hgt * 0.6; body.add(chest);
    return { J: { root, body, head, chest, handR: chest, handL: chest, hips: body }, kind: name, sprite: true, mat, hgt, shadowR: wid * 0.4 };
  }
  function sable() {
    const J = skeleton({ leg: 0.96, torso: 0.56, arm: 0.6, sw: 0.21 });
    const suit = toon('#121218'), shirt = toon('#d8d8dc'), skinB = toon('#0a0a0e');
    const head = sph(0.125, skinB, 's', 0.92, 1.12, 0.95); J.head.add(at(head, 0, 0.12, 0));
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), basic('#eef4ff')); at(eye, -0.05, 0.16, 0.11); J.head.add(eye);
    const grin = canvasTex(128, 64, g => { g.strokeStyle = '#cfe0ff'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(10, 20); g.quadraticCurveTo(64, 62, 118, 16); g.stroke(); for (let i = 0; i < 8; i++) { g.beginPath(); const x = 16 + i * 13; g.moveTo(x, 22 + Math.sin(i) * 8); g.lineTo(x + 6, 34 + Math.cos(i) * 6); g.stroke(); } });
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.085), basic('#ffffff', { map: grin, transparent: true, add: true })); at(gm, 0, 0.06, 0.12); J.head.add(gm); J.grin = gm;
    const torso = cyl(0.18, 0.15, 0.42, suit, 'm', 16); at(torso, 0, 0.05, 0); torso.scale.z = 0.7; J.chest.add(torso);
    const sh2 = box(0.08, 0.3, 0.04, shirt); at(sh2, 0, 0.08, 0.11); J.chest.add(sh2); const tie = box(0.03, 0.26, 0.02, suit); at(tie, 0, 0.06, 0.135); J.chest.add(tie);
    ['L', 'R'].forEach(s => { limb(J, 'ua' + s, 0.31, 0.06, 0.055, suit); limb(J, 'el' + s, 0.29, 0.055, 0.045, suit); const h = sph(0.045, skinB, 's', 1, 1.2, 0.8); at(h, 0, -0.03, 0); J['hand' + s].add(h);
      limb(J, 'th' + s, 0.48, 0.085, 0.072, suit); limb(J, 'kn' + s, 0.45, 0.07, 0.06, suit); const b = box(0.1, 0.07, 0.24, toon('#08080a'), 's'); at(b, 0, -0.02, 0.05); J['an' + s].add(b); });
    const l = new THREE.PointLight('#a8b8ff', 0.8, 1.6); at(l, 0, 0.2, 0.3); J.head.add(l);
    return { J, kind: 'sable', height: 1.85 };
  }

  /* ---------- VRM characters: CC0 VRoid models recoloured as the cast (anime faces, expressions, spring-bone hair) ---------- */
  const VRM_CAST = { takuto: { file: 'takuto.glb', scale: 1.07, seed: 6, expr: { angry: 0.12 } }, nemu: { file: 'nemu.glb', scale: 1.02, seed: 4, sleepy: 0.32 }, sieg: { file: 'sieg.glb', scale: 1.04, seed: 9, expr: { happy: 0.12 } }, sable: { file: 'sable.glb', scale: 1.08, seed: 13, expr: { happy: 0.35 } }, rin: { file: 'rin.glb', scale: 1.06, seed: 21, expr: { angry: 0.2 } }, valentine: { file: 'valentine.glb', scale: 1.08, seed: 17, expr: { happy: 0.3 } }, clerk: { file: 'clerk.glb', scale: 1.02, seed: 19, expr: { happy: 0.2 } }, wick: { file: 'wick.glb', scale: 1.04, seed: 23 }, haruki: { file: 'haruki.glb', scale: 1.04, seed: 29, expr: { relaxed: 0.2 } }, gideon: { file: 'gideon.glb', scale: 1.07, seed: 31, expr: { happy: 0.2 } }, lucien: { file: 'lucien.glb', scale: 1.08, seed: 37, expr: { happy: 0.3 } }, vesper: { file: 'vesper.glb', scale: 1.06, seed: 41 } };
  const EU = new THREE.Euler(), HP = Math.PI / 2;
  async function preload(base = 'models/', progress) {
    if (!window.THREE_VRM || !init()) return false;
    const { GLTFLoader, VRMLoaderPlugin, VRMUtils } = THREE_VRM, L = new GLTFLoader(); L.register(p => new VRMLoaderPlugin(p));
    const keys = (window.RB_CAST || ['takuto', 'nemu', 'sieg', 'sable']).filter(k => VRM_CAST[k]);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], spec = VRM_CAST[k];
      let g;
      if (window.RB_MODELS_B64) { // hosts that only serve web types get the model as base64 text
        const txt = await (await fetch(base + spec.file + '.b64.txt')).text(), bin = atob(txt.trim()), u8 = new Uint8Array(bin.length);
        for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
        g = await L.parseAsync(u8.buffer, base); if (progress) progress((i + 1) / keys.length);
      } else g = await L.loadAsync(base + spec.file, e => { if (progress && e.total) progress((i + e.loaded / e.total) / keys.length); });
      const vrm = g.userData.vrm; VRMUtils.rotateVRM0(vrm);
      const nr = vrm.humanoid.normalizedHumanBonesRoot; if (nr && !nr.parent) vrm.scene.add(nr);
      vrm.scene.traverse(o => { o.frustumCulled = false; });
      chars[k] = vrmChar(k, vrm, spec);
    }
    if (progress) progress(1);
    return true;
  }
  function vrmChar(kind, vrm, spec) {
    const N = b => vrm.humanoid.getNormalizedBoneNode(b);
    const root = new THREE.Group(), body = new THREE.Group(); body.scale.setScalar(spec.scale); body.add(vrm.scene); root.add(body);
    const J = { root, vrm, head: N('head'), hips: N('hips'), chest: N('chest') || N('spine'), dims: {} };
    // grips: a frame under each hand that matches the simple rig's hand frame, so props and poses carry over
    const grip = (bone, rz) => { const g = new THREE.Group(); g.quaternion.setFromEuler(EU.set(0, Math.PI, 0)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz))); N(bone).add(g); const inner = new THREE.Group(); inner.position.y = -0.075; g.add(inner); return inner; };
    J.handR = grip('rightHand', -HP); J.handL = grip('leftHand', HP);
    const back = new THREE.Group(); back.rotation.y = Math.PI; N('hips').add(back);
    if (kind === 'takuto') {
      const ax = axe(); J.handR.add(ax); J.weapon = ax;
      const bag = new THREE.Group(); const bb = sph(0.12, toon('#efefec'), 's', 1, 1.15, 0.7); bb.position.y = -0.17; bag.add(bb); bag.visible = false; J.handL.add(bag); J.bag = bag;
    }
    if (kind === 'sieg') { const gl = glaive(); J.handL.add(gl); J.weapon = gl; }
    if (kind === 'rin') { // a long red scarf, and a dagger
      const red = toon('#b4182a', { side: THREE.DoubleSide }), neck = N('neck'), nb = new THREE.Group(); nb.rotation.y = Math.PI; neck.add(nb);
      const ring = part(new THREE.TorusGeometry(0.075, 0.035, 8, 18), red, 's'); ring.rotation.x = Math.PI / 2; ring.scale.set(1, 1.1, 1); nb.add(at(ring, 0, 0.0, 0.0));
      J.scarf = []; let prev = nb; for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(i ? 0 : 0.03, i ? -0.1 : -0.02, i ? 0 : -0.07); prev.add(g); const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.11), red); pl.position.y = -0.05; g.add(pl); J.scarf.push(g); prev = g; }
      const dg = new THREE.Group(), bl = new THREE.Shape(); bl.moveTo(-0.018, 0); bl.lineTo(0.018, 0); bl.lineTo(0.004, 0.26); bl.closePath(); const blade = part(new THREE.ExtrudeGeometry(bl, { depth: 0.006, bevelEnabled: false }), toon('#c8ccd8'), 's'); blade.position.set(0, 0.07, -0.003); dg.add(blade); const hilt = cyl(0.014, 0.014, 0.1, toon('#3a1a20'), 's', 6); dg.add(hilt); const gd = box(0.07, 0.015, 0.02, toon('#c8a050'), 's'); dg.add(at(gd, 0, 0.055, 0)); J.handR.add(dg); J.weapon = dg; }
    if (kind === 'wick') { const raw = vrm.humanoid.getRawBoneNode('head'); if (raw) raw.scale.setScalar(0.001); const hb = new THREE.Group(); hb.position.y = 0.08; N('head').add(hb); const fl = []; for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.11 - i * 0.015, 0.34 + i * 0.05, 10), basic(['#1a4aff', '#2a7aff', '#4ab0ff', '#9ae0ff', '#e8f8ff'][i], { add: true, transparent: true, opacity: 0.85 })); f.position.y = 0.1 + i * 0.02; hb.add(f); fl.push(f); } const gl = glowSprite('#4a9aff', 0.9, 0.8); gl.position.y = 0.12; hb.add(gl); const pl = new THREE.PointLight('#4a9aff', 1.2, 3); pl.position.y = 0.15; hb.add(pl); [-0.04, 0.04].forEach(x => { const e = sph(0.018, basic('#ffffff'), null); e.position.set(x, 0.08, 0.08); hb.add(e); }); J.flame = fl; }
    if (kind === 'haruki') { const ring = part(new THREE.TorusGeometry(0.11, 0.05, 8, 18), toon('#f4f4f8'), 's'); ring.rotation.x = Math.PI / 2; const nb = new THREE.Group(); nb.rotation.y = Math.PI; N('neck').add(nb); nb.add(at(ring, 0, -0.02, 0)); }
    if (kind === 'gideon') { const hb = new THREE.Group(); hb.rotation.y = Math.PI; N('head').add(hb); const brim = cyl(0.17, 0.17, 0.015, toon('#1e1a1c'), 's', 24); hb.add(at(brim, 0, 0.17, -0.01)); const crown = cyl(0.11, 0.115, 0.2, toon('#1e1a1c'), 's', 20); hb.add(at(crown, 0, 0.27, -0.01)); const band = cyl(0.117, 0.117, 0.03, toon('#b08a3a'), null, 20); hb.add(at(band, 0, 0.19, -0.01)); const mask = cyl(0.06, 0.06, 0.02, toon('#b88a40'), 's', 12); hb.add(at(mask, 0, 0.0, 0.1, Math.PI / 2, 0, 0)); const gear = part(new THREE.TorusGeometry(0.05, 0.008, 6, 12), toon('#8a6a30'), null); hb.add(at(gear, 0, 0.0, 0.112)); }
    if (kind === 'lucien') { const cape = cyl(0.22, 0.38, 1.1, toon('#f2f0ea', { side: THREE.DoubleSide }), 'm', 14, true, Math.PI * 0.65, Math.PI * 0.7); const cb = new THREE.Group(); cb.rotation.y = Math.PI; N('chest').add(cb); cb.add(at(cape, 0, -0.45, -0.06)); }
    if (kind === 'vesper') { const hb = new THREE.Group(); hb.rotation.y = Math.PI; N('head').add(hb); const hood = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), toon('#f0f0f4', { side: THREE.DoubleSide })); hood.scale.set(1, 1.12, 1.15); hb.add(at(hood, 0, 0.07, -0.02, -0.35, 0, 0)); const tip = cone(0.06, 0.16, toon('#f0f0f4'), 's', 10); hb.add(at(tip, 0, 0.12, -0.15, -1.9, 0, 0)); }
    if (kind === 'valentine') { const mask = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 12, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.3, Math.PI * 0.32), toon('#f6f2f4', { side: THREE.DoubleSide })); const hb = new THREE.Group(); hb.rotation.y = Math.PI; N('head').add(hb); mask.rotation.y = -Math.PI / 2; mask.position.set(0, 0.06, 0.012); mask.scale.set(1.0, 1.0, 1.08); hb.add(mask); const gem = sph(0.012, basic('#ff5aa8'), null); hb.add(at(gem, 0, 0.1, 0.105)); }
    if (kind === 'nemu') { J.tail = []; let prev = back; const hm = toon('#25222c'); for (let i = 0; i < 10; i++) { const g = new THREE.Group(); g.position.set(0, i ? 0.065 : -0.03, i ? 0 : -0.1); prev.add(g); const seg = cap(0.02 - i * 0.0008, 0.05, hm, 's'); seg.position.y = 0.03; g.add(seg); J.tail.push(g); prev = g; } J.tail[0].rotation.x = -2.1; }
    const mats = []; vrm.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.isMToonMaterial && !mats.includes(m)) { mats.push(m); if (m.color) m.color.multiplyScalar(0.84); if (m.outlineWidthFactor != null) m.outlineWidthFactor *= 1.7; if (m.shadingToonyFactor != null) m.shadingToonyFactor = Math.max(m.shadingToonyFactor, 0.93); if (m.outlineColorFactor) m.outlineColorFactor.set('#1a0f16'); } }); });
    return { J, kind, vrm, spec, mats, isVRM: true, headR: 0.1 };
  }
  function setPoseVRM(ch, p, t, o) {
    const J = ch.J, vrm = ch.vrm, hu = vrm.humanoid;
    J.root.position.set(p.x, p.y - p.crouch, p.z); J.root.rotation.set(p.pitch, p.ry, p.bank, 'YXZ');
    // rotations are written in the episode's frame (faces +z, left = +x) and mirrored into VRM0 model space
    const put = (b, x, y, z) => { const n = hu.getNormalizedBoneNode(b); if (!n) return; n.quaternion.setFromEuler(EU.set(x, y, z, 'XYZ')); const q = n.quaternion; q.set(-q.x, q.y, -q.z, q.w); };
    const br = 0.018 * Math.sin(t * 2.0) * (o.breath ?? 1), tb = (o.talk || 0) * 0.05 * Math.sin(t * 11);
    put('hips', p.lean * 0.5 + p.flip, p.twist * 0.5, p.roll); put('spine', p.lean * 0.45 + br, p.twist * 0.5, 0); put('chest', p.lean * 0.1 - br * 0.6, 0, 0);
    put('neck', p.headX * 0.4, p.headY * 0.4, p.headZ * 0.4); put('head', p.headX * 0.6 + tb, p.headY * 0.6, p.headZ * 0.6);
    put('leftShoulder', 0, 0, 0); put('rightShoulder', 0, 0, 0);
    put('leftUpperArm', -p.uaL[0], 0, -HP + 0.08 + p.uaL[1]); put('rightUpperArm', -p.uaR[0], 0, HP - 0.08 - p.uaR[1]);
    put('leftLowerArm', 0, -p.elL, 0); put('rightLowerArm', 0, p.elR, 0);
    put('leftUpperLeg', -p.thL[0], 0, p.thL[1]); put('rightUpperLeg', -p.thR[0], 0, -p.thR[1]);
    put('leftLowerLeg', p.knL, 0, 0); put('rightLowerLeg', p.knR, 0, 0);
    put('leftFoot', (p.thL[0] - p.knL) * 0.7, 0, 0); put('rightFoot', (p.thR[0] - p.knR) * 0.7, 0, 0);
    const holdR = J.weapon && J.weapon.visible && ch.kind !== 'sieg', holdL = (ch.kind === 'sieg' && J.weapon && J.weapon.visible) || (J.bag && J.bag.visible);
    const curl = (side, c) => ['Index', 'Middle', 'Ring', 'Little'].forEach(f => ['Proximal', 'Intermediate', 'Distal'].forEach(sg => put(side + f + sg, 0, 0, side === 'right' ? c : -c)));
    curl('right', holdR ? 1.25 : 0.3); curl('left', holdL ? 1.25 : 0.3);
    put('rightThumbProximal', 0, holdR ? 0.5 : 0.1, 0); put('leftThumbProximal', 0, holdL ? -0.5 : -0.1, 0);
    // face
    const em = vrm.expressionManager, talk = Math.min(1, (o.talk || 0) * 1.2);
    let blink = o.blink ?? RIG.blink(t, ch.spec.seed); if (ch.spec.sleepy && o.blink == null) blink = Math.max(blink, ch.spec.sleepy);
    if (em) {
      em.setValue('blink', Math.min(1, blink)); em.setValue('aa', talk * 0.7); em.setValue('oh', talk * 0.35 * (0.5 + 0.5 * Math.sin(t * 13))); em.setValue('ih', talk * 0.25 * (0.5 + 0.5 * Math.sin(t * 9 + 1)));
      const ex = Object.assign({}, ch.spec.expr || {}, o.expr || {}); ['angry', 'happy', 'sad', 'relaxed', 'Surprised'].forEach(k => { if (em.getExpression(k)) em.setValue(k, ex[k] || 0); });
    }
    const gz = o.gaze || [0, 0]; if (vrm.lookAt) { vrm.lookAt.target = null; vrm.lookAt.yaw = -gz[0] * 16; vrm.lookAt.pitch = -gz[1] * 10; }
    let dt = t - (ch.lastT ?? -9); ch.lastT = t; if (dt < 0 || dt > 0.25) { if (vrm.springBoneManager) vrm.springBoneManager.reset(); dt = 0; }
    vrm.update(Math.min(dt, 1 / 30));
    // keep feet, knees or seat on the ground (anime models have their own leg lengths)
    if (o.ground !== false && Math.abs(p.pitch) < 0.35 && p.y < 0.05) {
      J.root.updateMatrixWorld(true); const v = new THREE.Vector3(), sc = ch.spec.scale * (o.scale || 1); let m = Infinity;
      [['leftFoot', 0.075], ['rightFoot', 0.075], ['leftToes', 0.025], ['rightToes', 0.025], ['leftLowerLeg', 0.055], ['rightLowerLeg', 0.055], ['hips', 0.09]].forEach(([b, off]) => { const n = hu.getNormalizedBoneNode(b); if (n) { n.getWorldPosition(v); m = Math.min(m, v.y - off * sc); } });
      if (isFinite(m)) J.root.position.y += p.y - m;
    }
    if (J.tail) J.tail.forEach((g, i) => { if (i) { g.rotation.x = 0.16 + Math.sin(t * 2.4 - i * 0.6) * 0.14; g.rotation.z = Math.sin(t * 1.7 - i * 0.5) * 0.12; } });
    if (J.flame) J.flame.forEach((f, i) => { f.scale.set(1 + 0.12 * Math.sin(t * 13 + i), 1 + 0.2 * Math.sin(t * 9 + i * 2), 1 + 0.12 * Math.cos(t * 11 + i)); f.rotation.y = t * (1 + i * 0.4); });
    if (J.scarf) J.scarf.forEach((g, i) => { g.rotation.x = (i ? 0.08 : -0.3) + Math.sin(t * 2.2 - i * 0.7) * 0.12 * (1 + (o.wind || 0)) + Math.min(0.9, Math.abs(o.vx || 0) * 0.2); g.rotation.z = Math.sin(t * 1.6 - i * 0.6) * 0.1; });
    if (J.weapon) { J.weapon.rotation.x = (J.weapon.userData.base ?? Math.PI / 2) + p.weapon; if (J.weapon.userData.glow) J.weapon.userData.glow.material.opacity = o.axeGlow || 0; }
  }

  /* ---------- poses ---------- */
  // pose fields (radians; forward-positive for limbs): x,z,ry (place/facing), y (lift), lean, twist, headX, headY, headZ,
  // uaL/uaR [fwd, out], elL/elR, thL/thR [fwd, out], knL/knR, crouch, jaw, shield [fwd, lift]
  const P0 = { x: 0, y: 0, z: 0, ry: 0, pitch: 0, bank: 0, lean: 0.03, twist: 0, roll: 0, headX: 0, headY: 0, headZ: 0, uaL: [0, 0.12], uaR: [0, 0.12], elL: 0.15, elR: 0.15, thL: [0, 0.04], thR: [0, 0.04], knL: 0.05, knR: 0.05, crouch: 0, jaw: 0, shield: [0, 0], weapon: 0, flip: 0 };
  function setPose(ch, p, t, o = {}) {
    p = { ...P0, ...p }; if (ch.isVRM) return setPoseVRM(ch, p, t, o);
    if (ch.sprite) { const J = ch.J; J.root.position.set(p.x, p.y, p.z); const br = 1 + 0.012 * Math.sin(t * 1.6), ln = o.lunge || 0, sq = o.squash || 0; J.body.scale.set((1 + ln * 0.08) * (1 + sq * 0.1), br * (1 + ln * 0.06) * (1 - sq * 0.12), 1); J.body.rotation.z = Math.sin(t * 0.9) * 0.015 + (o.tilt || 0); J.body.position.set((o.shake || 0) * Math.sin(t * 60) * 0.08, 0, 0); ch.mat.color.set(o.tint || '#ffffff'); if (o.flash) ch.mat.color.lerp(new THREE.Color('#ffffff'), 1).multiplyScalar(1 + o.flash * 2); ch.mat.opacity = o.alpha ?? 1; ch.mat.transparent = true; ch.mat.clippingPlanes = o.water != null ? [new THREE.Plane(new THREE.Vector3(0, 1, 0), -o.water)] : null; J.root.userData.facing = true; return; }
    if (ch.simple) { ch.J.root.position.set(p.x, p.y + 0.21 + Math.sin(t * 3) * 0.03, p.z); ch.J.root.rotation.set(0, p.ry, 0); ch.J.body.rotation.z = Math.sin(t * 2) * 0.05; const fm = (o.face || 'idle') + Math.floor(t * 12); if (fm !== ch.lastFace) { ch.lastFace = fm; ch.face(o.face || 'idle', t); } return; }
    const J = ch.J;
    J.root.position.set(p.x, p.y - p.crouch, p.z); J.root.rotation.set(p.pitch, p.ry, p.bank, 'YXZ');
    J.hips.rotation.set(p.lean * 0.5 + p.flip, p.twist * 0.5, p.roll);
    J.spine.rotation.set(p.lean * 0.5, p.twist * 0.5, 0); J.chest.scale.y = 1 + 0.012 * Math.sin(t * 2.0) * (o.breath ?? 1);
    const tb = (o.talk || 0) * 0.05 * Math.sin(t * 11); J.head.rotation.set(p.headX + tb, p.headY, p.headZ);
    const arm = (s, ua, el, k) => { J['ua' + s].rotation.set(-ua[0], 0, ua[1] * k); J['el' + s].rotation.set(-el, 0, 0); };
    arm('L', p.uaL, p.elL, 1); arm('R', p.uaR, p.elR, -1);
    const leg = (s, th, kn, k) => { J['th' + s].rotation.set(-th[0], 0, th[1] * k); J['kn' + s].rotation.set(kn, 0, 0); J['an' + s].rotation.set(-th[0] * 0.3 + kn * -0.4, 0, 0); };
    leg('L', p.thL, p.knL, 1); leg('R', p.thR, p.knR, -1);
    if (J.jaw) J.jaw.rotation.x = p.jaw * 0.5;
    if (J.shield) { J.shield.rotation.set(p.uaR[0] + p.elR + p.shield[0], 0, 0); J.shield.position.y = -0.15 + p.shield[1]; } // shield[0] = 0 hangs upright in front; pi points it up
    if (J.weapon) J.weapon.rotation.x = (J.weapon.userData.base ?? Math.PI / 2) + p.weapon;
    if (J.skirt) J.skirt.rotation.x = Math.sin(t * 2.3) * 0.03 + (o.wind || 0) * 0.08 * Math.sin(t * 6) - Math.min(0.5, Math.abs(o.vx || 0) * 0.15);
    if (J.tail) J.tail.forEach((g, i) => { if (i) { g.rotation.x = 0.18 + Math.sin(t * 2.4 - i * 0.6) * 0.15; g.rotation.z = Math.sin(t * 1.7 - i * 0.5) * 0.12; } });
    if (J.earL) { const tw = Math.max(0, Math.sin(t * 0.9) - 0.9) * 8; J.earL.rotation.z = 0.3 + tw * 0.3 + (o.ears || 0); J.earR.rotation.z = -0.3 - tw * 0.3 - (o.ears || 0); }
    if (ch.face) { const g = o.gaze || [0, 0]; ch.face.draw(g[0], g[1], o.blink ?? RIG.blink(t, ch.kind.length), o.talk || 0); }
    if (ch.J.weapon && ch.J.weapon.userData.glow) ch.J.weapon.userData.glow.material.opacity = o.axeGlow || 0;
  }
  const lerpA = (a, b, k) => Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k;
  function blend(a, b, k) { const o = {}; for (const key in P0) { const va = a[key] ?? P0[key], vb = b[key] ?? P0[key]; o[key] = lerpA(va, vb, k); } return o; }
  function seq(t, keys) { // [[time, pose, ease]]
    if (t <= keys[0][0]) return { ...P0, ...keys[0][1] };
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const k = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]); return blend({ ...P0, ...keys[i - 1][1] }, { ...P0, ...keys[i][1] }, (G.ease[keys[i][2] || 'io'])(Math.max(0, Math.min(1, k)))); }
    return { ...P0, ...keys[keys.length - 1][1] };
  }
  const POSES = {
    idleAxe: { uaR: [0.35, 0.35], elR: 1.9, uaL: [0.05, 0.2], elL: 0.4, weapon: 0 },
    ready: { lean: 0.25, crouch: 0.12, thL: [0.5, 0.1], knL: 0.8, thR: [-0.3, 0.1], knR: 0.6, uaR: [1.2, 0.2], elR: 0.6, uaL: [0.9, 0.2], elL: 1.0, weapon: -0.4 },
    crouch: { lean: 0.5, crouch: 0.32, thL: [1.3, 0.1], knL: 2.0, thR: [0.2, 0.15], knR: 1.6, uaR: [1.1, 0.3], elR: 0.6, uaL: [0.7, 0.3], elL: 0.8 },
    windup: { lean: -0.2, uaR: [3.0, 0.2], elR: 0.5, uaL: [2.8, 0.1], elL: 0.6, weapon: 0.8, thL: [0.5, 0.05], knL: 0.9, thR: [-0.2, 0.05], knR: 0.7, headX: -0.15 },
    chop: { lean: 0.6, uaR: [1.0, 0.1], elR: 0.1, uaL: [0.9, 0.05], elL: 0.15, weapon: -0.6, thL: [0.9, 0.1], knL: 1.1, thR: [-0.5, 0.1], knR: 0.7, headX: 0.2, crouch: 0.1 },
    leap: { lean: 0.15, thL: [1.0, 0.1], knL: 1.6, thR: [0.3, 0.1], knR: 1.8, uaR: [1.8, 0.3], elR: 0.9, uaL: [1.2, 0.4], elL: 0.6 },
    hit: { lean: -0.7, uaR: [2.2, 0.8], elR: 0.3, uaL: [2.4, 0.9], elL: 0.2, thL: [0.6, 0.3], knL: 0.5, thR: [-0.4, 0.3], knR: 0.3, headX: -0.4 },
    duck: { lean: 0.9, crouch: 0.42, thL: [1.5, 0.15], knL: 2.3, thR: [0.4, 0.2], knR: 2.0, uaR: [0.6, 0.3], elR: 1.2, uaL: [0.4, 0.3], elL: 1.0, headX: 0.3 },
    block: { lean: 0.1, crouch: 0.1, uaR: [1.5, 0.1], elR: 1.4, uaL: [1.4, 0.1], elL: 1.5, weapon: 1.2, thL: [0.4, 0.1], knL: 0.6, thR: [-0.3, 0.1], knR: 0.5 },
    slide: { lean: 0.35, crouch: 0.35, thL: [1.4, 0.2], knL: 1.2, thR: [-0.9, 0.2], knR: 2.3, uaR: [0.9, 0.5], elR: 0.5, uaL: [-0.6, 0.6], elL: 0.3 },
    stretch: { uaL: [2.9, 0.3], elL: 0.8, uaR: [1.6, 0.3], elR: 2.2, headX: -0.2, lean: -0.08 },
    throw: { lean: 0.3, uaR: [2.6, 0.3], elR: 0.3, uaL: [-0.6, 0.3], elL: 0.4, thL: [0.6, 0.1], knL: 0.5, thR: [-0.4, 0.1], knR: 0.4 },
    shoulder: { uaR: [0.5, 0.25], elR: 2.3, weapon: 0, uaL: [0.05, 0.15], elL: 0.3 },
    drag: { uaR: [0.12, 0.15], elR: 0.2, weapon: 1.4, uaL: [0.05, 0.12], elL: 0.25 },
    sit: { crouch: 0.52, lean: -0.05, thL: [1.5, 0.15], knL: 1.6, thR: [1.5, 0.2], knR: 1.5, uaL: [-0.3, 0.3], elL: 0.3, uaR: [-0.3, 0.3], elR: 0.3 },
    kneel: { crouch: 0.45, lean: 0.25, thL: [1.4, 0.1], knL: 2.3, thR: [0.1, 0.1], knR: 2.2, uaR: [0.7, 0.2], elR: 0.9, uaL: [0.4, 0.2], elL: 0.5 },
    point: { uaR: [1.5, 0.1], elR: 0.1, headX: 0.05 },
    raiseHand: { uaR: [1.9, 0.25], elR: 1.2, uaL: [0.1, 0.15], elL: 0.3 },
    sbIdle: { uaR: [0.55, 0.12], elR: 1.1, uaL: [0.25, 0.35], elL: 0.5, lean: 0.12 },
    sbRaise: { uaR: [2.9, 0.12], elR: 0.5, shield: [2.84, 0], uaL: [0.6, 0.4], elL: 0.4, lean: -0.12, headX: 0.25 },
    sbSlam: { uaR: [0.9, 0.12], elR: 0.15, shield: [0.4, 0], uaL: [0.4, 0.4], elL: 0.4, lean: 0.45, headX: 0.2, crouch: 0.15 },
    sbBrace: { crouch: 0.3, lean: 0.3, uaR: [1.0, 0.1], elR: 1.5, shield: [0, 0], uaL: [0.4, 0.3], elL: 0.6, thL: [0.6, 0.12], knL: 0.8, thR: [-0.4, 0.12], knR: 0.5 },
    sbClawUp: { uaL: [2.4, 0.9], elL: 0.4, uaR: [0.55, 0.12], elR: 1.1, lean: -0.05 },
    sbClawDown: { uaL: [0.9, -0.3], elL: 0.1, uaR: [0.55, 0.12], elR: 1.1, lean: 0.35, twist: 0.4 },
    lying: { lean: 0, uaR: [0.2, 0.6], elR: 0.3, uaL: [0.3, 0.5], elL: 0.2, thL: [0.1, 0.1], knL: 0.2, thR: [0.2, 0.15], knR: 0.4 },
  };
  function run(ph, k = 1) { const s = Math.sin(ph), c = Math.cos(ph); return { lean: 0.32 * k, crouch: 0.04 + 0.04 * Math.abs(c), thL: [0.9 * s * k, 0.05], thR: [-0.9 * s * k, 0.05], knL: (0.4 + 1.3 * Math.max(0, -s)) * k, knR: (0.4 + 1.3 * Math.max(0, s)) * k, uaL: [-0.9 * s * k, 0.15], uaR: [0.9 * s * k, 0.15], elL: 1.4, elR: 1.4 }; }
  function walk(ph, k = 1) { const s = Math.sin(ph); return { lean: 0.06, crouch: 0.02 * Math.abs(Math.cos(ph)), thL: [0.45 * s * k, 0.04], thR: [-0.45 * s * k, 0.04], knL: 0.15 + 0.5 * Math.max(0, -s) * k, knR: 0.15 + 0.5 * Math.max(0, s) * k, uaL: [-0.35 * s * k, 0.12], uaR: [0.35 * s * k, 0.12], elL: 0.3, elR: 0.3, headZ: 0.02 * s }; }

  /* ---------- environments ---------- */
  function sky(stops, paint) { // gradient dome with painted clouds (u = 0.75 faces -z, v = 0.5 is the horizon)
    const tex = paint ? canvasTex(2048, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); paint(g, w, h); })
      : canvasTex(32, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
    return dome;
  }
  // painted anime clouds: each cloud is a cluster of puffs with a lit underside and a soft top
  function paintClouds(g, w, h, o) {
    const R = G.rng(o.seed || 5), sunU = o.sunU ?? 0.75;
    if (o.stars) { g.fillStyle = '#ffffff'; for (let i = 0; i < o.stars; i++) { g.globalAlpha = 0.3 + R() * 0.7; const r = R() < 0.06 ? 1.6 : 0.8; g.beginPath(); g.arc(R() * w, R() * h * 0.36, r, 0, 7); g.fill(); } g.globalAlpha = 1; }
    if (o.glow) { const gr = g.createRadialGradient(sunU * w, h * 0.52, 0, sunU * w, h * 0.52, w * 0.22); gr.addColorStop(0, o.glow); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    const mix = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = sh => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k); return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')'; };
    const cl = G.canvas(w, h), cg = cl.getContext('2d'), g0 = g; g = cg;
    for (let layer = 0; layer < o.layers.length; layer++) {
      const L = o.layers[layer];
      for (let n = 0; n < L.n; n++) {
        const cx = R() * w, cy = h * (L.v0 + R() * (L.v1 - L.v0)), cw = w * (L.w0 + R() * (L.w1 - L.w0)), ch = cw * L.aspect;
        const du = Math.min(Math.abs(cx / w - sunU), 1 - Math.abs(cx / w - sunU)), sunK = Math.exp(-Math.pow(du / 0.16, 2));
        const lit = mix(L.lit, L.sunLit, sunK), body = L.body, top = L.top;
        const puffs = []; for (let k = 0; k < 9; k++) { const a = k / 8, x = (a - 0.5) * cw + (R() - 0.5) * cw * 0.15, y = -Math.sin(a * Math.PI) * ch * (0.5 + R() * 0.5), r = ch * (0.35 + R() * 0.45) * (0.6 + Math.sin(a * Math.PI) * 0.6); puffs.push([x, y, r]); }
        [-w, 0, w].forEach(off => {
          if (cx + off < -cw || cx + off > w + cw) return;
          g.save(); g.translate(cx + off, cy);
          g.fillStyle = lit; puffs.forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x + (sunU * w - cx) * 0.004, y + r * 0.18, r * 1.25, r * 0.85, 0, 0, 7); g.fill(); });
          g.fillStyle = body; puffs.forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y - r * 0.05, r * 1.18, r * 0.78, 0, 0, 7); g.fill(); });
          g.fillStyle = top; puffs.forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x - r * 0.1, y - r * 0.3, r * 0.9, r * 0.45, 0, 0, 7); g.fill(); });
          g.restore(); });
      }
    }
    g0.save(); g0.globalAlpha = o.alpha ?? 0.85; g0.filter = 'blur(' + (o.blur ?? 2) + 'px)'; g0.drawImage(cl, 0, 0); g0.restore();
  }
  function glowSprite(color, size, opacity = 1) { const tex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.setScalar(size); return s; }
  function moon(color, size, glowC) { const tex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(100, 100, 10, 128, 128, 120); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(180,150,160,1)'); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = 'rgba(120,90,110,0.22)'; const r = G.rng(4); for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(40 + r() * 176, 40 + r() * 176, 8 + r() * 22, 0, 7); g.fill(); } });
    const grp = new THREE.Group(), m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false, depthWrite: false })); m.scale.setScalar(size); grp.add(m); grp.add(glowSprite(glowC, size * 3, 0.5)); return grp; }
  function ground(size, color, amp, seed) { const geo = new THREE.PlaneGeometry(size, size, 80, 80); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z); pos.setY(i, (G.vnoise(x * 0.08, seed) + G.vnoise(z * 0.08, seed + 3) - 1) * amp * G.ease.io(Math.max(0, Math.min(1, (d - 11) / 14))) + (d > 11 ? (G.vnoise(x * 0.5, seed + 5) - 0.5) * 0.06 : 0)); } geo.computeVertexNormals(); return new THREE.Mesh(geo, toon(color)); }
  function buildBarrow() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#9a5a6e', 0.022);
    const domeMark = 1; const dome = sky([[0, '#120d24'], [0.3, '#2e1d43'], [0.44, '#6a3255'], [0.5, '#c2585a'], [0.53, '#ee9a62'], [0.56, '#f7c77e'], [1, '#2a1622']], (g, w, h) => paintClouds(g, w, h, { seed: 5, stars: 380, glow: 'rgba(255,180,120,0.38)', layers: [
      { n: 16, v0: 0.24, v1: 0.34, w0: 0.05, w1: 0.12, aspect: 0.05, body: '#2c1c3e', top: '#33214a', lit: '#6a3a5e', sunLit: '#d08a6a' },
      { n: 22, v0: 0.36, v1: 0.45, w0: 0.03, w1: 0.08, aspect: 0.11, body: '#4a2448', top: '#552a52', lit: '#a0485e', sunLit: '#ffb07a' },
      { n: 18, v0: 0.45, v1: 0.495, w0: 0.06, w1: 0.16, aspect: 0.05, body: '#6e3050', top: '#7a3858', lit: '#d0686a', sunLit: '#ffd59a' }] }));
    sc.add(dome); dome.userData.far = true; sc.userData.skyMat = dome.material;
    const m1 = moon('#f6ece2', 70, '#ffd8c8'); m1.position.set(-120, 120, -300); sc.add(m1); const m2 = moon('#e8705e', 22, '#ff5a40'); m2.position.set(150, 160, -320); sc.add(m2); m1.userData.far = m2.userData.far = true;
    const sun = glowSprite('#ffb070', 260, 0.55); sun.position.set(0, 10, -380); sc.add(sun); sun.userData.far = true;
    sc.add(new THREE.HemisphereLight('#c0a8e0', '#2a1626', 0.62)); const key = new THREE.DirectionalLight('#ffb27a', 0.95); key.position.set(-3, 3, -10); sc.add(key);
    const fill = new THREE.DirectionalLight('#9a86c8', 0.3); fill.position.set(4, 3, 8); sc.add(fill); sc.userData.key = key; sc.userData.hemi = sc.children.find(c => c.isHemisphereLight);
    sc.userData.rim = '#ffae6a'; sc.userData.rimK = 0.85; sc.userData.rimDir = V3(-0.3, 0.35, -1);
    sc.add(ground(240, '#2c1e2c', 2.2, 7));
    const R = G.rng(61), graveM = toon('#5a4a54'), graveD = toon('#3e323a');
    const slab = new THREE.BoxGeometry(0.5, 0.8, 0.12), crossV = new THREE.BoxGeometry(0.1, 0.9, 0.1), crossH = new THREE.BoxGeometry(0.5, 0.1, 0.1);
    for (let i = 0; i < 160; i++) { const a = R() * Math.PI * 2, d = 3.5 + Math.pow(R(), 0.7) * 60, x = Math.cos(a) * d, z = Math.sin(a) * d - 6; if (Math.abs(x) < 9 && z > -9 && z < 8) continue;
      const g = new THREE.Group(); if (R() < 0.6) { const s = new THREE.Mesh(slab, R() < 0.5 ? graveM : graveD); s.position.y = 0.38; g.add(s); const o = new THREE.Mesh(slab, inkMat(0.012)); o.position.y = 0.38; g.add(o); } else { const v = new THREE.Mesh(crossV, graveM); v.position.y = 0.44; const h = new THREE.Mesh(crossH, graveM); h.position.y = 0.62; g.add(v, h); }
      g.position.set(x, -0.05 + (G.vnoise(x * 0.08, 7) + G.vnoise(z * 0.08, 10) - 1) * 2.2 * G.ease.io(Math.max(0, Math.min(1, (Math.hypot(x, z) - 11) / 14))), z); g.rotation.set((R() - 0.5) * 0.3, R() * 0.8, (R() - 0.5) * 0.3); g.scale.setScalar(0.8 + R() * 0.9); sc.add(g); }
    const bark = toon('#24161e'); for (let i = 0; i < 14; i++) { const t = tree(bark, G.rng(100 + i)); t.position.set((R() - 0.5) * 70, -0.2, -10 - R() * 45); t.scale.setScalar(1.2 + R() * 1.4); sc.add(t); }
    sc.userData.graves = {};
    [['nemu', 1.7, -0.9, 0.25, 1], ['crash', 6.6, 0.3, -0.2, 1.25], ['left', -3.0, -1.8, 0.5, 1.1], ['back', 2.7, -4.3, -0.3, 1.3], ['near', -1.2, 2.6, 0.2, 0.9]].forEach(([k, x, z, ry, sc2]) => {
      const g = new THREE.Group(), shp = new THREE.Shape(); shp.moveTo(-0.28, 0); shp.lineTo(-0.28, 0.82); shp.absarc(0, 0.82, 0.28, Math.PI, 0, true); shp.lineTo(0.28, 0); shp.lineTo(-0.28, 0); const sl = part(new THREE.ExtrudeGeometry(shp, { depth: 0.14, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 }), toon('#5e4e58'), 'm'); sl.position.z = -0.07; g.add(sl);
      g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(sc2); sc.add(g); sc.userData.graves[k] = g; });
    const gm = toon('#2a1c26'), gR = G.rng(77); sc.userData.tufts = [];
    for (let i = 0; i < 260; i++) { const a = gR() * Math.PI * 2, d = 1.5 + gR() * 14, x = Math.cos(a) * d, z = Math.sin(a) * d; const c = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.25 + gR() * 0.35, 3), gm); c.position.set(x, 0.12, z); c.rotation.set((gR() - 0.5) * 0.6, gR() * 3, (gR() - 0.5) * 0.6); sc.add(c); sc.userData.tufts.push(c); }
    const hg = new THREE.Group(); const hs = box(1.2, 1.9, 0.35, toon('#4a3a44'), 'm'); hs.position.y = 0.9; hg.add(hs); const slot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.03), basic('#0a0406')); slot.position.set(0, 1.86, 0); hg.add(slot); const chains = toon('#6a6870'); for (let i = 0; i < 6; i++) { const r2 = part(new THREE.TorusGeometry(0.05, 0.012, 6, 10), chains, 's'); r2.position.set(-0.5 + i * 0.2, 1.4 - Math.sin(i / 5 * Math.PI) * 0.25, 0.2); r2.rotation.y = i % 2 ? 0 : Math.PI / 2; hg.add(r2); } hg.position.set(4.5, 0, -3); hg.rotation.y = -0.4; sc.add(hg); sc.userData.headsman = hg; // the Headsman's grave
    sc.userData.motes = motes(260, '#ffd9a0', 30, 6); sc.add(sc.userData.motes);
    { const fire = new THREE.Group(); for (let i = 0; i < 5; i++) { const lg = cyl(0.05, 0.05, 0.7, toon('#3a2418'), 's', 6); lg.rotation.set(Math.PI / 2 - 0.25, i * 1.26, 0); lg.position.y = 0.08; fire.add(lg); }
      const fl = []; for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16 - i * 0.025, 0.55 + i * 0.1, 8), basic(['#ff6a1a', '#ff9a2a', '#ffc85a', '#fff2b0'][i], { add: true, transparent: true, opacity: 0.85 })); f.position.y = 0.3 + i * 0.04; fire.add(f); fl.push(f); }
      const gl = glowSprite('#ff8a3a', 2.2, 0.8); gl.position.y = 0.4; fire.add(gl); const pl = new THREE.PointLight('#ff8a3a', 2.0, 7); pl.position.y = 0.6; fire.add(pl);
      fire.position.set(-0.4, 0, 2.2); fire.visible = false; sc.add(fire); sc.userData.fire = { g: fire, fl, pl }; }
    mountains(sc, 320, '#4a2e48', 0, 61, 70).userData.far = true; mountains(sc, 260, '#331f36', 0, 62, 44).userData.far = true;
    const castle = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#22142a'; g.beginPath(); g.moveTo(0, h); g.lineTo(40, 330); g.lineTo(120, 300); g.lineTo(180, 360); g.lineTo(260, 320); g.lineTo(330, 340); g.lineTo(420, 300); g.lineTo(512, 360); g.lineTo(512, h); g.fill();
      [[150, 140, 40, 170], [210, 80, 50, 230], [280, 160, 36, 150], [330, 190, 60, 120], [110, 200, 50, 100]].forEach(([x, y, cw, ch]) => { g.fillRect(x, y, cw, ch + 30); g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + cw / 2, y - cw * 0.9); g.lineTo(x + cw + 6, y); g.fill(); });
      g.fillStyle = '#ffb070'; const R = G.rng(3); for (let i = 0; i < 14; i++) g.fillRect(120 + R() * 260, 120 + R() * 180, 3, 5); });
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: castle, transparent: true, fog: false, depthWrite: false })); cs.position.set(-110, 18, -210); cs.lookAt(0, 18, 0); sc.add(cs); cs.userData.far = true;
    return sc; } finally { rimOn = true; }
  }
  function tree(mat, R) { const g = new THREE.Group(); const br = (len, r, depth) => { const grp = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r, len, 6), mat); c.position.y = len / 2; grp.add(c); if (depth > 0) for (let i = 0; i < 2 + (R() < 0.3 ? 1 : 0); i++) { const ch = br(len * (0.6 + R() * 0.2), r * 0.6, depth - 1); ch.position.y = len * (0.7 + R() * 0.3); ch.rotation.set((R() - 0.5) * 1.3, R() * 6, (R() - 0.5) * 1.3); grp.add(ch); } return grp; }; g.add(br(1.6, 0.12, 4)); return g; }
  function motes(n, color, spread, h) { const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = G.rng(9); for (let i = 0; i < n; i++) { p[i * 3] = (R() - 0.5) * spread; p[i * 3 + 1] = R() * h; p[i * 3 + 2] = (R() - 0.5) * spread - 4; } geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(color), size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); m.userData.base = p.slice(); return m; }
  function buildEarth() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#141a2c', 0.035);
    const earthSky = sky([[0, '#05070e'], [0.38, '#0e1424'], [0.48, '#2b2236'], [0.52, '#4a2f39'], [1, '#0a0b10']], (g, w, h) => paintClouds(g, w, h, { seed: 8, stars: 120, sunU: 0.25, layers: [
      { n: 18, v0: 0.22, v1: 0.34, w0: 0.05, w1: 0.12, aspect: 0.08, body: '#111726', top: '#141a2c', lit: '#22223a', sunLit: '#2c2a44' },
      { n: 24, v0: 0.36, v1: 0.48, w0: 0.04, w1: 0.1, aspect: 0.12, body: '#1a1a2a', top: '#1e1e30', lit: '#4a3046', sunLit: '#5e3a4c' }] })); sc.add(earthSky); earthSky.userData.far = true;
    sc.add(new THREE.HemisphereLight('#6a78a8', '#14141c', 0.6)); const key = new THREE.DirectionalLight('#9fb6ff', 0.55); key.position.set(4, 6, 5); sc.add(key);
    sc.userData.rim = '#a8c0ff'; sc.userData.rimK = 0.6; sc.userData.rimDir = V3(0.6, 0.3, -1);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), toon('#1c1d24')); road.rotation.x = -Math.PI / 2; sc.add(road);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), toon('#121319')); side.rotation.x = -Math.PI / 2; side.position.y = -0.02; sc.add(side);
    const stop = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.25), basic('#d8d8d0')); stop.rotation.x = -Math.PI / 2; stop.position.set(0, 0.01, 3.5); sc.add(stop);
    const ballast = new THREE.Mesh(new THREE.BoxGeometry(200, 0.1, 4), toon('#2a2724')); ballast.position.set(0, 0.03, 0); sc.add(ballast);
    [-0.75, 0.75].forEach(z => { const r = new THREE.Mesh(new THREE.BoxGeometry(200, 0.12, 0.08), toon('#6c7078')); r.position.set(0, 0.12, z); sc.add(r); });
    for (let x = -60; x < 60; x += 0.6) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 2.2), toon('#3a342e')); s.position.set(x, 0.07, 0); sc.add(s); }
    const R = G.rng(31), winTex = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#0e1118'; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 22) for (let x = 8; x < w; x += 20) if (R() < 0.35) { g.fillStyle = R() < 0.2 ? '#9fc4ff' : '#ffcf86'; g.fillRect(x, y, 10, 12); } });
    winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
    for (let i = 0; i < 30; i++) { const w = 4 + R() * 6, h = 6 + R() * 22, x = (R() < 0.5 ? -1 : 1) * (8 + R() * 40), z = -6 - R() * 50; const t2 = winTex.clone(); t2.needsUpdate = true; t2.repeat.set(w / 4, h / 8); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshBasicMaterial({ map: t2 })); b.position.set(x, h / 2, z); sc.add(b); b.userData.far = true; }
    const signal = (x, z, s, ry) => { const g = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 8), toon('#1a1b20')); pole.position.y = 1.8; g.add(pole);
      const xb = canvasTex(256, 64, (gg) => { for (let k = 0; k < 8; k++) { gg.fillStyle = k % 2 ? '#e2c43a' : '#141414'; gg.fillRect(k * 32, 0, 32, 64); } });
      [0.62, -0.62].forEach(rz => { const p = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 0.03), new THREE.MeshBasicMaterial({ map: xb })); p.position.set(0, 3.3, 0.05); p.rotation.z = rz; g.add(p); });
      const lamps = []; [-0.25, 0.25].forEach(lx => { const hsg = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16), toon('#121318')); hsg.rotation.x = Math.PI / 2; hsg.position.set(lx, 2.75, 0.05); g.add(hsg); const lm = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), basic('#3a1a1c')); lm.position.set(lx, 2.75, 0.1); g.add(lm); const gl = glowSprite('#ff3b2f', 1.6, 0); gl.position.set(lx, 2.75, 0.2); g.add(gl); const pl = new THREE.PointLight('#ff3b2f', 0, 6); pl.position.set(lx, 2.6, 0.5); g.add(pl); lamps.push({ lm, gl, pl }); });
      const arm = new THREE.Group(); arm.position.set(0.15, 1.0, 0.2); g.add(arm); const ab = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 0.06), new THREE.MeshBasicMaterial({ map: (() => { const t3 = xb.clone(); t3.needsUpdate = true; t3.wrapS = THREE.RepeatWrapping; t3.repeat.set(6, 1); return t3; })() })); ab.position.x = 2.5; arm.add(ab);
      g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.setScalar(s); sc.add(g); return { g, lamps, arm }; };
    sc.userData.sig = [signal(-4.4, 2.0, 1, 0), signal(4.6, -1.45, 0.85, Math.PI)];
    const vm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.7), basic('#56607a')); vm.position.set(6.2, 0.9, -3.4); sc.add(vm); const vg = glowSprite('#b8d0ff', 5, 0.35); vg.position.set(6.2, 1.1, -2.9); sc.add(vg); const vl = new THREE.PointLight('#b8d0ff', 0.6, 6); vl.position.set(6.2, 1.2, -2.6); sc.add(vl);
    [[1.6, '#ff4a5a', '居酒屋'], [-1.4, '#5ad0ff', 'カラオケ']].forEach(([dx, col, txt], i) => { const t4 = canvasTex(64, 256, (g) => { g.fillStyle = '#120c14'; g.fillRect(0, 0, 64, 256); g.font = '400 44px ' + G.FONT.jp; g.textAlign = 'center'; g.fillStyle = col; [...txt].forEach((ch, k) => g.fillText(ch, 32, 52 + k * 50)); }); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 3.2), basic('#ffffff', { map: t4 })); s.position.set(9 + dx, 5, -6 - i); sc.add(s); const gg = glowSprite(col, 5, 0.5); gg.position.copy(s.position); sc.add(gg); });
    sc.userData.rain = rain(); sc.add(sc.userData.rain);
    { const poleM = toon('#3a3a40'), poles = []; for (let z = 14; z > -60; z -= 12) [-5.6, 5.6].forEach(x => { if (Math.abs(z - 2) < 3 && x < 0) return; const g = new THREE.Group(); const p2 = cyl(0.13, 0.17, 9, poleM, 's', 8); p2.position.y = 4.5; g.add(p2); [7.6, 8.4].forEach(y => { const arm = box(1.8, 0.1, 0.1, poleM, 's'); arm.position.y = y; g.add(arm); }); if ((z / 12 | 0) % 2) { const tr = cyl(0.25, 0.25, 0.7, toon('#5a5a62'), 's', 10); tr.position.set(0.35, 6.6, 0); g.add(tr); } g.position.set(x, 0, z); sc.add(g); poles.push([x, z]); });
      const pts = []; [-5.6, 5.6].forEach(x => { const row = poles.filter(p2 => p2[0] === x).sort((a, b) => b[1] - a[1]); for (let i = 0; i < row.length - 1; i++) [[-0.8, 7.6], [0.8, 7.6], [-0.6, 8.4], [0.6, 8.4]].forEach(([dx, y]) => { const a = V3(x + dx, y, row[i][1]), b = V3(x + dx, y, row[i + 1][1]); for (let k = 0; k < 10; k++) { const f0 = k / 10, f1 = (k + 1) / 10, s0 = Math.sin(f0 * Math.PI) * 0.45, s1 = Math.sin(f1 * Math.PI) * 0.45; pts.push(a.clone().lerp(b, f0).setY(y - s0), a.clone().lerp(b, f1).setY(y - s1)); } }); });
      for (let i = 0; i < 6; i++) { const z = 10 - i * 12, a = V3(-5.6, 7.6, z), b = V3(5.6, 7.6, z - 6); for (let k = 0; k < 10; k++) { const f0 = k / 10, f1 = (k + 1) / 10; pts.push(a.clone().lerp(b, f0).setY(7.6 - Math.sin(f0 * Math.PI) * 0.8), a.clone().lerp(b, f1).setY(7.6 - Math.sin(f1 * Math.PI) * 0.8)); } }
      const wires = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#0a0a10' })); sc.add(wires); }
    const train = new THREE.Group(); const pal = ['#4b2e26', '#232c3a', '#3c3a35', '#53382a']; for (let i = 0; i < 18; i++) { const car = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.4, 2.6), toon(pal[i % 4])); car.position.set(-i * 6, 1.5, 0); train.add(car); } const loco = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 2.8), toon('#1d2129')); loco.position.set(6, 1.7, 0); train.add(loco); const hl = glowSprite('#fff0c8', 5, 1); hl.position.set(9.1, 1.4, 0); train.add(hl); train.visible = false; sc.add(train); sc.userData.train = train;
    const bag = new THREE.Group(); const bb = sph(0.13, toon('#eeeeec'), 's', 1, 0.8, 0.7); bb.position.y = 0.1; bag.add(bb); const bk = sph(0.05, toon('#3a3a52'), null); bk.position.set(0.05, 0.12, 0.05); bag.add(bk); bag.position.set(-0.6, 0, 1.6); bag.rotation.z = 1.2; sc.add(bag); sc.userData.bag = bag;
    const dish = cyl(0.09, 0.07, 0.03, toon('#c9ccd4'), 's', 16); dish.position.set(4.92, 0.015, -2.82); sc.add(dish); sc.userData.dish = dish;
    const cat = catModel(); cat.position.set(5.2, 0, -3.0); cat.rotation.y = -0.6; sc.add(cat); sc.userData.cat = cat;
    return sc; } finally { rimOn = true; }
  }
  function catModel() { const m = toon('#24232c'), g = new THREE.Group(); const b = sph(0.14, m, 's', 0.8, 1, 1.3); b.position.y = 0.16; g.add(b); const h = sph(0.09, m, 's'); h.position.set(0, 0.34, 0.1); g.add(h); g.userData.head = h; [-0.05, 0.05].forEach(x => { const e = cone(0.035, 0.08, m, 's', 4); e.position.set(x, 0.42, 0.1); h.parent.add(e); }); [-0.035, 0.035].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), basic('#c8f08a')); e.position.set(x, 0.35, 0.18); g.add(e); }); const tl = cap(0.02, 0.22, m); tl.position.set(0, 0.2, -0.18); tl.rotation.x = -0.8; g.add(tl); g.userData.tail = tl; return g; }
  function rain() { const n = 2400, geo = new THREE.BufferGeometry(), p = new Float32Array(n * 6), R = G.rng(3); for (let i = 0; i < n; i++) { const x = (R() - 0.5) * 30, y = R() * 14, z = (R() - 0.5) * 30; p.set([x, y, z, x + 0.05, y - 0.45, z], i * 6); } geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#9fb2d0', transparent: true, opacity: 0.35 })); l.userData.base = p.slice(); return l; }
  function buildVoid() { rimOn = false; try { const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#200004', 0.05); sc.add(sky([[0, '#000000'], [0.5, '#3a0008'], [1, '#000000']])); sc.add(new THREE.HemisphereLight('#ffb0a0', '#100000', 0.5)); const key = new THREE.DirectionalLight('#ff2a1a', 0.75); key.position.set(0, 2, -4); sc.add(key); sc.userData.rim = '#ff3a2a'; sc.userData.rimK = 1.1; sc.userData.rimDir = V3(0, 0.2, -1);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), basic('#0a0002')); floor.rotation.x = -Math.PI / 2; sc.add(floor);
    sc.userData.motes = motes(400, '#ff4a3a', 24, 8); sc.add(sc.userData.motes); return sc; } finally { rimOn = true; } }


  /* ---------- shared set dressing ---------- */
  function texNoise(w, h, base, spots, seed, draw) { const t = canvasTex(w, h, (g) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const R = G.rng(seed); spots.forEach(([col, n, r0, r1, a]) => { g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = a * (0.4 + R() * 0.6); g.beginPath(); g.ellipse(R() * w, R() * h, r0 + R() * (r1 - r0), (r0 + R() * (r1 - r0)) * (0.5 + R() * 0.6), R() * 3, 0, 7); g.fill(); } }); g.globalAlpha = 1; if (draw) draw(g, w, h, R); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  function crowdFigure(robe, R, o = {}) { // background townsfolk and hunters: simple, readable at a distance
    const g = new THREE.Group(), skin = toon(['#f0d0b8', '#d8a888', '#b88060'][Math.floor(R() * 3)]), rb = toon(robe), hair = toon(['#2a2228', '#5a3a28', '#c8b090', '#1a1a2a', '#7a2a20'][Math.floor(R() * 5)]);
    const body = cyl(0.17, 0.26, 1.05, rb, 'm', 10); body.position.y = 0.55; g.add(body);
    const sh = sph(0.2, rb, 's', 1.15, 0.6, 0.85); sh.position.y = 1.1; g.add(sh);
    const head = sph(0.115, skin, 's', 0.92, 1.05, 0.95); head.position.y = 1.33; g.add(head);
    const hr = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hr.position.set(0, 1.35, -0.01); g.add(hr);
    [-1, 1].forEach(k => { const a = cyl(0.05, 0.045, 0.55, rb, 's', 8); a.position.set(k * 0.22, 0.85, 0); a.rotation.z = k * 0.12; g.add(a); });
    if (o.hood) { const hd = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), rb); hd.position.set(0, 1.36, -0.02); g.add(hd); }
    if (o.weapon) { const sw = cyl(0.015, 0.015, 1.1, toon('#8a8c94'), 's', 6); sw.position.set(0.18, 0.9, -0.12); sw.rotation.z = 0.3; g.add(sw); }
    g.userData.ph = R() * 6; g.scale.setScalar(0.92 + R() * 0.16); return g;
  }
  function addCrowd(sc, list) { sc.userData.crowd = sc.userData.crowd || []; list.forEach(([x, z, ry, col, o], i) => { const f = crowdFigure(col, G.rng(500 + i + Math.round(x * 10 + z)), o || {}); f.position.set(x, 0, z); f.rotation.y = ry; sc.add(f); sc.userData.crowd.push(f); }); }
  function gableHouse(w, d, h, R, wall, beam, roofC) {
    const g = new THREE.Group(); const plaster = canvasTex(256, 256, (c) => { c.fillStyle = wall; c.fillRect(0, 0, 256, 256); c.fillStyle = beam; c.fillRect(0, 0, 256, 14); c.fillRect(0, 120, 256, 12); c.fillRect(0, 242, 256, 14); c.fillRect(0, 0, 14, 256); c.fillRect(242, 0, 14, 256); c.fillRect(121, 0, 12, 256); c.save(); c.translate(128, 64); c.rotate(0.8); c.fillRect(-90, -6, 180, 12); c.restore(); c.save(); c.translate(128, 64); c.rotate(-0.8); c.fillRect(-90, -6, 180, 12); c.restore();
      const Rr = G.rng(9); c.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 60; i++) c.fillRect(Rr() * 256, Rr() * 256, 2 + Rr() * 8, 2 + Rr() * 8); });
    plaster.wrapS = plaster.wrapT = THREE.RepeatWrapping; const pt = plaster.clone(); pt.needsUpdate = true; pt.repeat.set(w / 2.4, h / 2.4);
    const body = part(new THREE.BoxGeometry(w, h, d), toon('#ffffff', { map: pt }), 'm'); body.position.y = h / 2; g.add(body);
    const tri = new THREE.Shape(); tri.moveTo(-w / 2 - 0.3, 0); tri.lineTo(w / 2 + 0.3, 0); tri.lineTo(0, w * 0.55); tri.closePath();
    const roof = part(new THREE.ExtrudeGeometry(tri, { depth: d + 0.6, bevelEnabled: false }), toon(roofC), 'm'); roof.position.set(0, h, -d / 2 - 0.3); g.add(roof);
    if (R() < 0.7) { const ch = box(0.4, 1.0, 0.4, toon('#6a5a52'), 's'); ch.position.set(w * 0.25, h + w * 0.35, 0); g.add(ch); }
    const winM = basic('#ffd69a'); for (let i = 0; i < Math.floor(w / 1.4); i++) for (let j = 0; j < Math.floor(h / 2.2); j++) { if (R() < 0.35) continue; const wn = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), R() < 0.5 ? winM : basic('#3a3440')); wn.position.set(-w / 2 + 0.9 + i * 1.4, 1.4 + j * 2.2, d / 2 + 0.01); g.add(wn); }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.7), toon('#4a3020')); door.position.set(w * (R() - 0.5) * 0.5, 0.85, d / 2 + 0.012); g.add(door);
    return g;
  }
  function mountains(sc, r, col, n, seed, hmax) { const tex = canvasTex(2048, 256, (g, w, h) => { const R = G.rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, h); let y = h * 0.5; for (let x = 0; x <= w; x += 16) { y = Math.max(h * 0.08, Math.min(h * 0.9, y + (R() - 0.5) * 40 + (h * 0.5 - y) * 0.05)); g.lineTo(x, y); } g.lineTo(w, h); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hmax, 64, 1, true), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.BackSide, depthWrite: false, fog: false })); m.position.y = hmax / 2 - 2; sc.add(m); return m; }
  function daySky(sc, warm) { const dome = sky(warm ? [[0, '#3c6db8'], [0.36, '#78a8dc'], [0.48, '#f2d6b0'], [0.52, '#f6c08a'], [1, '#6a7a88']] : [[0, '#2f6ec8'], [0.35, '#6aa6e4'], [0.48, '#c8e2f4'], [0.52, '#e8f2f6'], [1, '#7a8a96']],
      (g, w, h) => paintClouds(g, w, h, { seed: 31, alpha: 0.95, blur: 1.5, sunU: 0.6, glow: warm ? 'rgba(255,220,160,0.35)' : 'rgba(255,255,240,0.25)', layers: [
        { n: 14, v0: 0.18, v1: 0.3, w0: 0.04, w1: 0.1, aspect: 0.08, body: '#f2f6fa', top: '#ffffff', lit: '#b8c6d8', sunLit: warm ? '#f0c8a0' : '#dfe6ee' },
        { n: 22, v0: 0.34, v1: 0.46, w0: 0.03, w1: 0.08, aspect: 0.32, body: '#eef3f8', top: '#ffffff', lit: '#9eaec6', sunLit: warm ? '#f2b890' : '#c8d2e0' },
        { n: 16, v0: 0.44, v1: 0.5, w0: 0.05, w1: 0.12, aspect: 0.2, body: '#e6edf4', top: '#fafcff', lit: '#9aaabe', sunLit: warm ? '#f0b088' : '#c0cad8' }] }));
    sc.add(dome); return dome; }

  /* ---------- Ashford: a frontier town street that ends at the Hunters' Guild ---------- */
  function buildTown() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#c8d8e6', 0.012); const skyD = daySky(sc, true);
    const hemi = new THREE.HemisphereLight('#cfe2ff', '#6a5a4a', 0.65); sc.add(hemi); const key = new THREE.DirectionalLight('#fff0d8', 1.0); key.position.set(8, 10, 4); sc.add(key);
    const moonsG = new THREE.Group(); const m1 = moon('#f6ece2', 40, '#ffd8c8'); m1.position.set(-80, 110, -260); moonsG.add(m1); const m2 = moon('#e8705e', 14, '#ff5a40'); m2.position.set(90, 140, -280); moonsG.add(m2); moonsG.visible = false; sc.add(moonsG); const lampL = [];
    sc.userData.dayLights = { key, hemi, key0: '#fff0d8', k0: 1.0, h0: 0.65, hc0: '#cfe2ff', f0: '#c8d8e6', sky: skyD.material, moons: moonsG, lamps: lampL, rim0: '#ffe2b8' };
    sc.userData.rim = '#ffe2b8'; sc.userData.rimK = 0.6; sc.userData.rimDir = V3(0.7, 0.5, -0.5);
    mountains(sc, 300, '#7f93ab', 0, 41, 60); mountains(sc, 240, '#5f7088', 0, 42, 38);
    const stones = texNoise(512, 512, '#8a8072', [['#a09484', 260, 10, 22, 0.7], ['#6a6258', 200, 8, 18, 0.6], ['#504a42', 120, 2, 5, 0.5]], 3, (g, w, h) => { g.strokeStyle = 'rgba(40,34,30,0.5)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32 % 2) * 24; x < w; x += 48) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } });
    stones.repeat.set(4, 24); const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 90), toon('#ffffff', { map: stones })); road.rotation.x = -Math.PI / 2; road.position.z = -20; sc.add(road);
    const dirt = texNoise(256, 256, '#7a6a52', [['#8a7a60', 200, 6, 16, 0.6], ['#5a4e3c', 120, 4, 10, 0.5], ['#6a7a42', 60, 6, 14, 0.4]], 4); dirt.repeat.set(30, 30); const gnd = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), toon('#ffffff', { map: dirt })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -0.01; sc.add(gnd);
    const R = G.rng(77), walls = ['#e8dcc4', '#efe4d0', '#dcc8a8', '#e2d4bc'], roofs = ['#8a3a2a', '#6a3a30', '#4a5a6a', '#7a4a2a'];
    for (let side = -1; side <= 1; side += 2) for (let z = 8; z > -44; z -= 6.5 + R() * 2) { const w = 5 + R() * 2, d = 5, h = 4.5 + R() * 3.5; const hs = gableHouse(w, d, h, R, walls[Math.floor(R() * 4)], '#4a3424', roofs[Math.floor(R() * 4)]); hs.position.set(side * (4.5 + d / 2 + 0.8), 0, z); hs.rotation.y = -side * Math.PI / 2; sc.add(hs); }
    // market stalls with striped awnings
    const stripes = (a, b) => canvasTex(128, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, 64); } });
    [[-3.6, 2, '#c84a3a'], [3.6, -4, '#3a6ac8'], [-3.6, -10, '#d8a83a'], [3.6, -16, '#4a8a4a']].forEach(([x, z, c]) => { const g = new THREE.Group(); const tb = box(1.8, 0.9, 1.0, toon('#6a4a30'), 's'); tb.position.y = 0.45; g.add(tb); const aw = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), toon('#ffffff', { map: stripes(c, '#f4ead8'), side: THREE.DoubleSide })); aw.position.set(0, 2.0, 0.3); aw.rotation.x = -1.0; g.add(aw); [-0.9, 0.9].forEach(px => { const p2 = cyl(0.04, 0.04, 2.1, toon('#4a3424'), 's', 6); p2.position.set(px, 1.05, -0.3); g.add(p2); }); for (let i = 0; i < 6; i++) { const fr = sph(0.09, toon(['#d84a3a', '#e8b83a', '#8ab83a'][i % 3]), null); fr.position.set(-0.6 + i * 0.24, 0.95, 0.1); g.add(fr); } g.position.set(x, 0, z); g.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; sc.add(g); });
    // fountain in the square
    const fb = cyl(1.6, 1.7, 0.6, toon('#9a9488'), 'm', 24); fb.position.set(0, 0.3, -24); sc.add(fb); const wt = new THREE.Mesh(new THREE.CircleGeometry(1.45, 24), basic('#7ab8d8')); wt.rotation.x = -Math.PI / 2; wt.position.set(0, 0.55, -24); sc.add(wt); const col = cyl(0.2, 0.3, 1.6, toon('#a8a296'), 's', 12); col.position.set(0, 1.1, -24); sc.add(col);
    // lantern posts
    for (let z = 4; z > -40; z -= 8) [-4.2, 4.2].forEach(x => { const p2 = cyl(0.05, 0.06, 3, toon('#2a2a30'), 's', 6); p2.position.set(x, 1.5, z); sc.add(p2); const lt = box(0.25, 0.35, 0.25, basic('#ffd890'), null); lt.position.set(x, 3.1, z); sc.add(lt); if (z % 16 === 4 || z === -28) { const pl = new THREE.PointLight('#ffb870', 1.4, 9); pl.position.set(x, 3.0, z); pl.visible = false; sc.add(pl); lampL.push(pl); const gl = glowSprite('#ffc888', 1.6, 0.6); gl.position.set(x, 3.1, z); gl.visible = false; sc.add(gl); lampL.push(gl); } });
    // the Guild: a stone hall with steps, columns and a red banner
    const gld = new THREE.Group(); const stoneT = texNoise(256, 256, '#a49a8a', [['#b8ae9c', 120, 10, 24, 0.6], ['#8a8274', 90, 8, 20, 0.6]], 7, (g, w, h) => { g.strokeStyle = 'rgba(50,44,40,0.45)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32 % 2) * 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } } }); stoneT.repeat.set(4, 3);
    const hall = part(new THREE.BoxGeometry(16, 10, 10), toon('#ffffff', { map: stoneT }), 'l'); hall.position.y = 5; gld.add(hall);
    const pedi = new THREE.Shape(); pedi.moveTo(-8.5, 0); pedi.lineTo(8.5, 0); pedi.lineTo(0, 4); pedi.closePath(); const pd = part(new THREE.ExtrudeGeometry(pedi, { depth: 10.6, bevelEnabled: false }), toon('#5a3a32'), 'l'); pd.position.set(0, 10, -5.3); gld.add(pd);
    for (let i = 0; i < 6; i++) { const c = cyl(0.4, 0.45, 7, toon('#c8c0b0'), 'm', 16); c.position.set(-6.5 + i * 2.6, 3.5 + 0.9, 6); gld.add(c); }
    for (let i = 0; i < 3; i++) { const st = box(16 - i * 0.6, 0.3, 2.2 - i * 0.5, toon('#b0a898'), 's'); st.position.set(0, 0.15 + i * 0.3, 6.6 - i * 0.25); gld.add(st); }
    const ban = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#9a1e28'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0b860'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 60); g.fillStyle = '#e0b860'; g.beginPath(); g.moveTo(w / 2, 120); g.lineTo(w / 2 + 50, 220); g.lineTo(w / 2, 320); g.lineTo(w / 2 - 50, 220); g.closePath(); g.fill(); g.fillStyle = '#9a1e28'; g.fillRect(w / 2 - 6, 140, 12, 160); g.beginPath(); g.moveTo(0, h - 46); g.lineTo(w / 2, h); g.lineTo(w, h - 46); g.fillStyle = '#9a1e28'; g.fill(); });
    [-4, 4].forEach(x => { const b = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.4), toon('#ffffff', { map: ban, side: THREE.DoubleSide })); b.position.set(x, 6.5, 5.15); gld.add(b); });
    const sign = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = '#3a2618'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8a050'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#e8c870'; g.font = '700 84px ' + G.FONT.disp; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("HUNTERS' GUILD", w / 2, h / 2 + 4); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.1), basic('#ffffff', { map: sign })); sg.position.set(0, 8.6, 5.1); gld.add(sg);
    const dr = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.5), toon('#3a2214')); dr.position.set(0, 3.15, 5.02); gld.add(dr);
    gld.position.set(0, 0, -40); sc.add(gld); sc.userData.guild = gld;
    addCrowd(sc, [[-2.6, -6, 0.4, '#6a4a3a'], [-2.2, -6.8, 2.6, '#3a5a6a'], [2.8, -12, -1.2, '#7a6a3a', { weapon: true }], [2.2, -20, 2.8, '#4a3a5a', { hood: true }], [-3.0, -22, 1.2, '#5a6a4a'], [-3.4, -28, 0.9, '#6a3a3a', { weapon: true }], [3.6, -27, -0.9, '#3a4a6a'], [3.0, 4, -2.0, '#8a6a4a'], [-3.2, -15, 1.6, '#5a4a6a', { hood: true }]]);
    return sc; } finally { rimOn = true; } }

  /* ---------- the Guild hall: timber, stone, a quest board, lanterns and light through tall windows ---------- */
  function buildGuild() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.background = new THREE.Color('#1a1210'); sc.fog = new THREE.FogExp2('#3a2a20', 0.02);
    sc.add(new THREE.HemisphereLight('#ffd8b0', '#3a2a20', 0.38)); const key = new THREE.DirectionalLight('#ffe8c0', 0.45); key.position.set(6, 8, 3); sc.add(key);
    sc.userData.rim = '#ffd8a0'; sc.userData.rimK = 0.7; sc.userData.rimDir = V3(0.8, 0.5, 0.2);
    const planks = texNoise(512, 512, '#6a4a30', [['#7a5a3a', 140, 10, 30, 0.5], ['#5a3a24', 120, 8, 26, 0.5]], 5, (g, w, h) => { g.strokeStyle = 'rgba(30,18,10,0.7)'; g.lineWidth = 3; for (let x = 0; x < w; x += 42) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let i = 0; i < 30; i++) { g.beginPath(); const x = Math.floor(Math.random() * 12) * 42, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + 42, y); g.stroke(); } }); planks.repeat.set(5, 4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), toon('#ffffff', { map: planks })); floor.rotation.x = -Math.PI / 2; sc.add(floor);
    const wallT = texNoise(256, 256, '#8a7a68', [['#9a8a76', 90, 12, 26, 0.6], ['#7a6a58', 80, 10, 22, 0.6]], 6, (g, w, h) => { g.strokeStyle = 'rgba(40,30,24,0.45)'; g.lineWidth = 2; for (let y = 0; y < h; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 28 % 2) * 30; x < w; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } } }); wallT.repeat.set(5, 2);
    const wm = toon('#ffffff', { map: wallT, side: THREE.DoubleSide });
    [[0, 4, -9, 0, 22], [0, 4, 9, Math.PI, 22], [-11, 4, 0, Math.PI / 2, 18], [11, 4, 0, -Math.PI / 2, 18]].forEach(([x, y, z, ry, w]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 8), wm); m.position.set(x, y, z); m.rotation.y = ry; sc.add(m); });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), toon('#3a2618', { side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 8; sc.add(ceil);
    for (let x = -10; x <= 10; x += 4) { const b = box(0.35, 0.45, 18, toon('#3a2414'), 's'); b.position.set(x, 7.7, 0); sc.add(b); }
    for (let x = -9; x <= 9; x += 6) [-8.8, 8.8].forEach(z => { const p2 = box(0.5, 8, 0.5, toon('#4a2c18'), 's'); p2.position.set(x, 4, z); sc.add(p2); });
    // reception counter, the clerk's station and the appraiser's pedestal
    const ctr = box(9, 1.15, 1.1, toon('#5a3420'), 'm'); ctr.position.set(-1.5, 0.58, -5.5); sc.add(ctr); const top = box(9.3, 0.08, 1.3, toon('#7a4a2a'), 's'); top.position.set(-1.5, 1.2, -5.5); sc.add(top);
    [[-5.4, 0], [-4.9, 1], [4.2, 2]].forEach(([x, i]) => { const bk = box(0.35, 0.22, 0.26, toon(['#7a2a2a', '#2a4a6a', '#5a6a2a'][i]), 's'); bk.position.set(x, 1.35, -5.7); sc.add(bk); });
    const shelf = box(9, 3, 0.6, toon('#4a2c18'), 'm'); shelf.position.set(-1.5, 2.6, -8.6); sc.add(shelf);
    const ped = cyl(0.5, 0.6, 1.0, toon('#6a6070'), 'm', 16); ped.position.set(6, 0.5, -4.5); sc.add(ped);
    // quest board
    const board = canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#6a4a2a'; g.fillRect(0, 0, w, h); const R = G.rng(8); for (let i = 0; i < 22; i++) { const x = 20 + R() * (w - 90), y = 20 + R() * (h - 90); g.save(); g.translate(x, y); g.rotate((R() - 0.5) * 0.2); g.fillStyle = R() < 0.2 ? '#e8c8b0' : '#efe6d0'; g.fillRect(0, 0, 60 + R() * 20, 70 + R() * 20); g.fillStyle = 'rgba(40,30,20,0.6)'; for (let l = 0; l < 6; l++) g.fillRect(8, 14 + l * 9, 30 + R() * 30, 2); g.fillStyle = '#9a2020'; g.beginPath(); g.arc(30, 6, 4, 0, 7); g.fill(); g.restore(); } });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.1), toon('#ffffff', { map: board })); bd.position.set(-10.9, 3, 1); bd.rotation.y = Math.PI / 2; sc.add(bd);
    // tables, benches, lanterns, windows and light shafts
    [[-5, 2], [-1, 3.5], [3, 1.5], [-4, 6], [2, 6]].forEach(([x, z]) => { const t2 = cyl(0.9, 0.9, 0.08, toon('#6a4228'), 's', 16); t2.position.set(x, 0.85, z); sc.add(t2); const lg = cyl(0.12, 0.18, 0.85, toon('#4a2c18'), 's', 8); lg.position.set(x, 0.42, z); sc.add(lg); const mug = cyl(0.06, 0.06, 0.14, toon('#c8b080'), 's', 8); mug.position.set(x + 0.3, 0.96, z); sc.add(mug); });
    for (let i = 0; i < 4; i++) { const x = -7 + i * 5; const ch = new THREE.Group(); const ring = part(new THREE.TorusGeometry(0.8, 0.05, 6, 20), toon('#2a1a10'), 's'); ring.rotation.x = Math.PI / 2; ch.add(ring); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, cd = cyl(0.04, 0.04, 0.18, basic('#ffe8c0'), null, 6); cd.position.set(Math.cos(a) * 0.8, 0.1, Math.sin(a) * 0.8); ch.add(cd); } ch.position.set(x, 6.2, 1); sc.add(ch); const pl = new THREE.PointLight('#ffb870', 0.55, 9); pl.position.set(x, 5.8, 1); sc.add(pl); const gl = glowSprite('#ffc888', 2.2, 0.45); gl.position.set(x, 6.3, 1); sc.add(gl); }
    for (let i = 0; i < 4; i++) { const z = -6 + i * 4; const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.4), basic('#d8c8a0')); wn.position.set(10.95, 4.6, z); wn.rotation.y = -Math.PI / 2; sc.add(wn); const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 9), basic('#ffe0a8', { add: true, transparent: true, opacity: 0.09, fog: false })); shaft.position.set(7.5, 3.2, z - 0.6); shaft.rotation.set(0, -Math.PI / 2, 0.75); sc.add(shaft); }
    const ban = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#8a1e26'; g.fillRect(0, 0, w, h); g.fillStyle = '#e0b860'; g.beginPath(); g.moveTo(w / 2, 60); g.lineTo(w / 2 + 26, 110); g.lineTo(w / 2, 160); g.lineTo(w / 2 - 26, 110); g.fill(); });
    [-6, 3].forEach(x => { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), toon('#ffffff', { map: ban })); b.position.set(x, 5.6, -8.95); sc.add(b); });
    addCrowd(sc, [[-5.8, 2.6, 2.2, '#5a4a3a', { weapon: true }], [-4.2, 1.4, -0.8, '#3a4a5a'], [-1.8, 4.2, 2.8, '#6a3a3a', { hood: true }], [3.8, 2.0, -1.8, '#4a5a3a', { weapon: true }], [2.4, 6.8, 3.0, '#5a5a6a'], [-4.6, 6.6, 0.6, '#7a5a3a'], [-8.5, 0.5, 1.57, '#4a3a2a'], [-8.6, 2.0, 1.4, '#3a3a4a', { hood: true }]]);
    return sc; } finally { rimOn = true; } }

  /* ---------- the training yard behind the Guild ---------- */
  function buildYard() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#d8dce0', 0.01); daySky(sc, false);
    sc.add(new THREE.HemisphereLight('#d8e8ff', '#7a6a50', 0.65)); const key = new THREE.DirectionalLight('#fff4e0', 1.0); key.position.set(-6, 10, -4); sc.add(key);
    sc.userData.rim = '#fff0d8'; sc.userData.rimK = 0.65; sc.userData.rimDir = V3(-0.6, 0.6, -0.6);
    mountains(sc, 300, '#8aa0b8', 0, 51, 60);
    const sand = texNoise(512, 512, '#c8b088', [['#d8c098', 300, 6, 16, 0.6], ['#b09870', 240, 4, 12, 0.6], ['#a08860', 80, 1, 3, 0.7]], 9); sand.repeat.set(6, 6);
    const ar = new THREE.Mesh(new THREE.CircleGeometry(13, 48), toon('#ffffff', { map: sand })); ar.rotation.x = -Math.PI / 2; sc.add(ar);
    const grass = texNoise(256, 256, '#5a7a3a', [['#6a8a42', 220, 4, 10, 0.6], ['#4a6a2e', 160, 3, 8, 0.6]], 10); grass.repeat.set(40, 40); const gg = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), toon('#ffffff', { map: grass })); gg.rotation.x = -Math.PI / 2; gg.position.y = -0.01; sc.add(gg);
    const wood = toon('#7a5a3a'); for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; if (Math.abs(Math.sin(a)) < 0.12 && Math.cos(a) > 0) continue; const p2 = cyl(0.07, 0.08, 1.1, wood, 's', 6); p2.position.set(Math.cos(a) * 13, 0.55, Math.sin(a) * 13); sc.add(p2); }
    for (let k = 0; k < 2; k++) { const rail = part(new THREE.TorusGeometry(13, 0.04, 4, 64), wood, 's'); rail.rotation.x = Math.PI / 2; rail.position.y = 0.5 + k * 0.45; sc.add(rail); }
    [[-6, -9], [-3, -11], [8, -8]].forEach(([x, z]) => { const d = new THREE.Group(); const post = cyl(0.06, 0.06, 1.6, wood, 's', 6); post.position.y = 0.8; d.add(post); const sack = cyl(0.25, 0.3, 0.8, toon('#c8b080'), 'm', 10); sack.position.y = 1.3; d.add(sack); const hd = sph(0.2, toon('#c8b080'), 's'); hd.position.y = 1.9; d.add(hd); const arm = cyl(0.04, 0.04, 1.0, wood, 's', 6); arm.position.y = 1.5; arm.rotation.z = Math.PI / 2; d.add(arm); d.position.set(x, 0, z); sc.add(d); });
    const rack = new THREE.Group(); const rb = box(3, 0.1, 0.4, wood, 's'); rb.position.y = 1.2; rack.add(rb); for (let i = 0; i < 5; i++) { const w2 = cyl(0.02, 0.02, 1.8, toon('#9a9ca4'), 's', 6); w2.position.set(-1.2 + i * 0.6, 0.9, 0); w2.rotation.z = 0.15; rack.add(w2); } rack.position.set(9, 0, 6); rack.rotation.y = -0.8; sc.add(rack);
    const wallT = texNoise(256, 256, '#a49a8a', [['#b8ae9c', 120, 10, 24, 0.6]], 11, (g, w, h) => { g.strokeStyle = 'rgba(50,44,40,0.45)'; g.lineWidth = 2; for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }); wallT.repeat.set(10, 2);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(60, 9, 2), toon('#ffffff', { map: wallT })); wall.position.set(0, 4.5, -18); sc.add(wall);
    for (let i = 0; i < 3; i++) { const bench = box(6, 0.3, 0.8, wood, 's'); bench.position.set(-3, 0.5 + i * 0.5, 15 + i * 0.8); sc.add(bench); }
    addCrowd(sc, [[-5, 15.2, Math.PI, '#5a4a3a', { weapon: true }], [-3.5, 15.9, Math.PI, '#3a5a6a'], [-1.6, 15.3, Math.PI, '#6a4a5a', { hood: true }], [0.4, 16.0, Math.PI, '#7a6a3a'], [-6.2, 16.6, Math.PI, '#4a4a5a'], [12.5, 2, -1.8, '#6a3a3a', { weapon: true }], [12.2, -1.5, -1.4, '#3a4a6a']]);
    return sc; } finally { rimOn = true; } }


  /* ---------- painted background plates: the "2D that looks 3D" layer ----------
     Each location has painted plates with the direction the painter looked (yaw: 0 = +z, PI = -z).
     'full' locations replace the 3D set entirely (characters and hero props render over the painting);
     'sky' locations keep the 3D ground and props and swap only the sky and far scenery for the painting. */
  const PLATE_SETS = {
    town: { mode: 'full', plates: [['ashford_street', Math.PI], ['ashford_gate', 0], ['ashford_houses', Math.PI / 2], ['ashford_houses', -Math.PI / 2]], moods: { dusk: [['ashford_dusk', 0]], night: [['ashford_night', Math.PI], ['ashford_night', 0]] }, light: 'day' },
    guild: { mode: 'full', plates: [['guild_hall', Math.PI], ['guild_door', 0], ['guild_board', -Math.PI / 2], ['guild_hall', Math.PI / 2]], light: 'interior' },
    yard: { mode: 'full', plates: [['yard_wall', Math.PI], ['yard_hills', 0], ['yard_hills', Math.PI / 2], ['yard_wall', -Math.PI / 2]], light: 'day' },
    barrow: { mode: 'sky', plates: [['barrow_dusk', Math.PI]], moods: { night: [['barrow_night', Math.PI]], blood: [['barrow_blood', Math.PI]] } },
    earth: { mode: 'sky', plates: [['nerima_night', Math.PI], ['nerima_street', 0]] },
  };
  const plateImg = {}; let plateBase = 'plates/';
  function loadPlates(ids, base = 'plates/') { plateBase = base; return Promise.all(ids.filter(id => !plateImg[id]).map(id => new Promise(res => { const im = new Image(); im.onload = () => { const c = G.canvas(im.width, im.height), g = c.getContext('2d'); g.filter = 'blur(5px)'; g.drawImage(im, 0, 0); const row = g.getImageData(0, Math.floor(im.height * 0.56), im.width, 1).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < row.length; i += 4) { r += row[i]; gg += row[i + 1]; b += row[i + 2]; } const n2 = row.length / 4; plateImg[id] = { im, blur: c, horizon: '#' + [r, gg, b].map(v => Math.round(v / n2).toString(16).padStart(2, '0')).join('') }; res(); }; im.onerror = () => res(); im.src = base + id + '.webp'; }))); }
  function plateFor(spec) {
    const eo = spec.envOpts || {}, pls = spec.plates || eo.plates;
    const set = pls ? { mode: spec.plateMode || eo.plateMode || 'full', plates: pls.map(p => Array.isArray(p) ? p : [p, 0]), light: spec.light || eo.light || 'day' } : PLATE_SETS[spec.env];
    if (!set || spec.noPlate) return null;
    const mood = (spec.envOpts || {}).mood, list = (set.moods && set.moods[mood]) || set.plates;
    const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const yaw = Math.atan2(dir.x, dir.z), pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    let best = null, bd = 9; list.forEach(([id, py]) => { const d = Math.abs(Math.atan2(Math.sin(yaw - py), Math.cos(yaw - py))); if (d < bd && plateImg[id]) { bd = d; best = [id, py]; } });
    if (!best) return null;
    return { set, id: best[0], dyaw: Math.atan2(Math.sin(yaw - best[1]), Math.cos(yaw - best[1])), pitch };
  }
  function drawPlate(ctx, pl, w, h) {
    const P = plateImg[pl.id], near = (cam.fov < 29) || spec_close, src = near ? P.blur : P.im, iw = P.im.width, ih = P.im.height;
    const zoom = 1.18 * Math.pow(34 / cam.fov, 0.55), s = Math.max(w / iw, h / ih) * zoom;
    const hfov = 2 * Math.atan(Math.tan(cam.fov * Math.PI / 360) * (w / h));
    let dx = -pl.dyaw / hfov * w * 0.7, dy = pl.pitch / (cam.fov * Math.PI / 180) * h * 0.7;
    const mx = (iw * s - w) / 2, my = (ih * s - h) / 2; dx = Math.max(-mx, Math.min(mx, dx)); dy = Math.max(-my, Math.min(my, dy));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(src, (w - iw * s) / 2 + dx, (h - ih * s) / 2 + dy, iw * s, ih * s); ctx.restore();
  }
  let spec_close = false;
  const STAGES = {};
  function stageScene(light) { // lights only: for locations that exist purely as paintings
    if (STAGES[light]) return STAGES[light];
    const sc = new THREE.Scene(), L = { day: ['#d8e8ff', '#7a6a50', 0.6, '#fff2dc', 1.0, '#ffe8c8'], dusk: ['#e0b0c0', '#4a2a30', 0.5, '#ffb27a', 0.85, '#ffb070'], night: ['#4a5a98', '#10121c', 0.3, '#8a9ad8', 0.3, '#a8c0ff'], interior: ['#ffd8b0', '#3a2a20', 0.4, '#ffe0b8', 0.5, '#ffd8a0'], storm: ['#a8b0c0', '#2a2a30', 0.45, '#d0d8f0', 0.6, '#c8d8ff'], fire: ['#ff9a70', '#2a1010', 0.45, '#ff7a3a', 0.9, '#ff6a3a'], ice: ['#c8e0ff', '#506080', 0.6, '#e0f0ff', 0.8, '#bfe6ff'], gold: ['#fff0c8', '#7a6a40', 0.6, '#fff2c0', 1.0, '#ffe08a'] }[light] || ['#d8e8ff', '#7a6a50', 0.6, '#fff2dc', 1.0, '#ffe8c8'];
    sc.add(new THREE.HemisphereLight(L[0], L[1], L[2])); const key = new THREE.DirectionalLight(L[3], L[4]); key.position.set(5, 8, 4); sc.add(key);
    sc.userData.rim = L[5]; sc.userData.rimK = 0.7; sc.userData.rimDir = V3(0.6, 0.4, -0.6); sc.userData.stage = true;
    STAGES[light] = sc; return sc;
  }
  // a seated character gets something to sit on: a low wooden crate under the hips (painted-only sets have no furniture)
  function seatFor(c, pose = {}) {
    if (c.sprite) return; const sit = (pose.crouch || 0) >= 0.45 && pose.thL && pose.thL[0] >= 1.2 && (pose.lean || 0) > -0.4; // lying down: no crate
    if (!c.seat) { if (!sit) return; const g = new THREE.Group(), box = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.46), toon('#5a4232')), lid = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.5), toon('#6e5240'));
      box.position.y = 0.22; lid.position.y = 0.465; g.add(box, lid); g.position.set(0, 0, 0.16); c.J.root.add(g); c.seat = g; }
    c.seat.visible = sit;
  }
  function contactShadows(ctx, cast) { ctx.save(); ctx.setTransform(G.K, 0, 0, G.K, 0, 0); cast.forEach(([n, pose, o = {}]) => { const c = chars[n]; if (!c || o.visible === false || (pose && pose.y > 0.4)) return; const p = c.J.root.position; const a = project(p.x, 0, p.z), b = project(p.x + (c.shadowR || 0.35), 0, p.z), r = Math.abs(b[0] - a[0]) + 4; if (a[1] < 0 || a[1] > G.H + 40) return; const gr = ctx.createRadialGradient(a[0], a[1], 0, a[0], a[1], r); gr.addColorStop(0, 'rgba(10,6,12,0.45)'); gr.addColorStop(1, 'rgba(10,6,12,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(a[0], a[1], r, r * 0.32, 0, 0, 7); ctx.fill(); }); ctx.restore(); }

  /* ---------- per-frame updates ---------- */
  function animateEnv(name, t, o = {}, sc0) {
    const sc = sc0 || scenes[name]; if (!sc) return; // painted-only locations render on a shared stage scene
    if (sc.userData.crowd) sc.userData.crowd.forEach(f => { f.rotation.z = Math.sin(t * 1.3 + f.userData.ph) * 0.02; f.position.y = Math.abs(Math.sin(t * 2 + f.userData.ph)) * 0.01; });
    if (sc.userData.motes) { const m = sc.userData.motes, a = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3] = b[i * 3] + Math.sin(t * 0.5 + i) * 0.3; a.array[i * 3 + 1] = (b[i * 3 + 1] + t * (name === 'void' ? 0.6 : 0.15)) % 8; } a.needsUpdate = true; }
    if (sc.userData.rain) { const r = sc.userData.rain, a = r.geometry.attributes.position, b = r.userData.base; for (let i = 0; i < a.count / 2; i++) { const dy = ((t * 14 + i * 0.37) % 14); a.array[i * 6 + 1] = (b[i * 6 + 1] - dy + 14) % 14; a.array[i * 6 + 4] = a.array[i * 6 + 1] - 0.45; } a.needsUpdate = true; r.position.set(cam.position.x, 0, cam.position.z - 6); }
    if (sc.userData.sig) { const on = Math.floor(t / 0.5) % 2; sc.userData.sig.forEach((s, si) => { s.lamps.forEach((l, i) => { const lit = o.lamps && (i % 2) === on; l.lm.material.color.set(lit ? '#ff3b2f' : '#3a1a1c'); l.gl.material.opacity = lit ? 0.9 : 0; l.pl.intensity = lit ? 2.2 : 0; }); s.arm.rotation.z = (o.gate ?? 0) * 1.45; }); }
    if (sc.userData.train) { const tr = sc.userData.train; tr.visible = o.train != null; if (o.train != null) { tr.position.set(o.train, 0, 0); tr.rotation.y = o.trainDir === -1 ? Math.PI : 0; } }
    if (sc.userData.bag) sc.userData.bag.visible = !!o.bag;
    if (sc.fog) { sc.userData.fog0 = sc.userData.fog0 || sc.fog.density; sc.fog.density = sc.userData.fog0 * (o.fog ?? 1); }
    if (sc.userData.cat) { const c = sc.userData.cat; c.visible = o.cat !== false; if (o.catPos) { c.position.set(...o.catPos); } if (o.catRy != null) c.rotation.y = o.catRy; c.userData.tail.rotation.z = Math.sin(t * 1.5) * 0.4; c.userData.head.position.y = 0.34 + (o.catUp ? 0.06 : 0) - (o.catEat ? 0.1 + Math.abs(Math.sin(t * 5)) * 0.04 : 0); c.userData.head.position.z = 0.1 + (o.catEat ? 0.06 : 0); }
    if (sc.userData.fire) { const F = sc.userData.fire; F.g.visible = !!o.fire; if (o.fire) { F.fl.forEach((f, i) => { f.scale.set(1 + 0.15 * Math.sin(t * 13 + i), 1 + 0.25 * Math.sin(t * 9.3 + i * 2), 1 + 0.15 * Math.cos(t * 11 + i)); f.rotation.y = t * (1 + i * 0.3); }); F.pl.intensity = 1.8 + 0.4 * Math.sin(t * 17) + 0.2 * Math.sin(t * 7); } }
    if (sc.userData.key && name === 'barrow' && o.mood === 'night') { sc.userData.key.color.set('#7a8ad0'); sc.userData.key.intensity = 0.45; sc.fog.color.set('#1c1a34'); sc.userData.hemi.color.set('#5a62a0'); sc.userData.hemi.intensity = 0.4; sc.userData.rim = '#ffa060'; if (sc.userData.skyMat) sc.userData.skyMat.color.set('#46508a'); }
    else if (sc.userData.key && name === 'barrow') { sc.userData.key.intensity = 0.95; sc.userData.hemi.intensity = 0.62; }
    if (sc.userData.dayLights && o.mood === 'dusk') { const D = sc.userData.dayLights; D.key.color.set('#ffb27a'); D.key.intensity = 0.85; D.hemi.intensity = 0.5; D.hemi.color.set('#e0b0c0'); if (sc.fog) sc.fog.color.set('#d8a890'); if (D.sky) D.sky.color.set('#ffb8a0'); if (D.moons) D.moons.visible = false; if (D.lamps) D.lamps.forEach(l => { l.visible = true; }); sc.userData.rim = '#ffb070'; }
    else     if (sc.userData.dayLights) { const D = sc.userData.dayLights, night = o.mood === 'night'; D.key.color.set(night ? '#6a7ac0' : D.key0); D.key.intensity = night ? 0.18 : D.k0; D.hemi.intensity = night ? 0.22 : D.h0; D.hemi.color.set(night ? '#4a5a98' : D.hc0); if (sc.userData.crowd) sc.userData.crowd.forEach(f => { f.visible = !night; }); if (sc.fog) sc.fog.color.set(night ? '#1a2038' : D.f0); if (D.sky) D.sky.color.set(night ? '#2a3466' : '#ffffff'); if (D.moons) D.moons.visible = night; if (D.lamps) D.lamps.forEach(l => { l.visible = night; }); sc.userData.rim = night ? '#ffc890' : D.rim0; }
    if (sc.userData.key && name === 'barrow' && o.mood !== 'night') { const k = sc.userData.key; sc.userData.rim = { blood: '#ff3a2a', ash: '#f0dcd0', still: '#d8d8e0' }[o.mood] || '#ffae6a'; if (sc.userData.skyMat) sc.userData.skyMat.color.set({ blood: '#ff7a6e', ash: '#b4aab4' }[o.mood] || '#ffffff'); if (o.mood === 'blood') { k.color.set('#ff3a2a'); sc.fog.color.set('#5a0a10'); sc.userData.hemi.color.set('#ff6a5a'); } else if (o.mood === 'ash') { k.color.set('#e0c8c0'); sc.fog.color.set('#8a7a80'); sc.userData.hemi.color.set('#d8c8c8'); } else { k.color.set('#ffb890'); sc.fog.color.set('#b0707a'); sc.userData.hemi.color.set('#ffc8b0'); } }
  }

  /* ---------- rendering ---------- */
  const BUILD = { town: () => buildTown(), guild: () => buildGuild(), yard: () => buildYard() };
  function ensure() {
    if (!scenes.barrow) { scenes.barrow = buildBarrow(); scenes.earth = buildEarth(); scenes.void = buildVoid(); }
    if (!chars.shield) { chars.takuto = chars.takuto || takuto(); chars.nemu = chars.nemu || nemu(); chars.sieg = chars.sieg || sieg(); chars.shield = shieldbearer(); chars.sable = chars.sable || sable(); chars.tofu = tofu(); }
  }
  // draw a 3D frame into the 2D scene canvas. spec: { env, t, cam:{pos,look,fov,roll}, cast:[[charName, pose, opts]], envOpts }
  function frame(spec) {
    if (!init()) return false; ensure();
    const ctx = G.ctx, K = G.K, w = Math.round(G.W * K), h = Math.round(G.H * K);
    if (w !== curW || h !== curH) { R.setSize(w, h, false); curW = w; curH = h; }
    if (!scenes[spec.env] && BUILD[spec.env]) scenes[spec.env] = BUILD[spec.env]();
    const sc = scenes[spec.env] || stageScene(spec.light || (spec.envOpts || {}).light || 'day');
    Object.values(chars).forEach(c => { if (c.J.root.parent) c.J.root.parent.remove(c.J.root); });
    (spec.cast || []).forEach(([n, pose, o = {}]) => { const c = chars[n]; sc.add(c.J.root); setPose(c, pose, spec.t, o); seatFor(c, pose); c.J.root.visible = o.visible !== false; c.J.root.scale.setScalar(o.scale || 1); if (c.J.weapon) c.J.weapon.visible = o.weapon !== false; if (c.J.bag) c.J.bag.visible = !!o.bag; if (c.J.shield && n === 'shield') c.J.shield.visible = o.shieldOn !== false; });
    const cm0 = spec.cam; cam.fov = cm0.fov || 32; cam.updateProjectionMatrix(); cam.position.set(...cm0.pos); cam.up.set(Math.sin(cm0.roll || 0), Math.cos(cm0.roll || 0), 0); cam.lookAt(...cm0.look); cam.updateMatrixWorld();
    spec_close = Math.hypot(cm0.pos[0] - cm0.look[0], cm0.pos[1] - cm0.look[1], cm0.pos[2] - cm0.look[2]) < 2.4;
    const pl = spec.only === 'cast' ? null : plateFor(spec);
    const castOnly = spec.only === 'cast' || (pl && pl.set.mode === 'full');
    const hidden = []; if (castOnly) sc.children.forEach(ch => { if (!ch.isLight && !ch.userData.keep && !(spec.cast || []).some(([n]) => chars[n].J.root === ch) && ch.visible) { ch.visible = false; hidden.push(ch); } });
    else if (pl && pl.set.mode === 'sky') sc.children.forEach(ch => { if (ch.userData.far && ch.visible) { ch.visible = false; hidden.push(ch); } });
    const cm = spec.cam; cam.fov = cm.fov || 32; cam.updateProjectionMatrix(); cam.position.set(...cm.pos); cam.up.set(Math.sin(cm.roll || 0), Math.cos(cm.roll || 0), 0); cam.lookAt(...cm.look);
    animateEnv(spec.env, spec.t, spec.envOpts || {}, sc);
    (spec.cast || []).forEach(([n]) => { const c = chars[n]; if (c && c.sprite) { const r = c.J.root; r.rotation.set(0, Math.atan2(cam.position.x - r.position.x, cam.position.z - r.position.z), 0); } });
    (spec.cast || []).forEach(([n]) => { const c = chars[n]; if (c && c.mats) c.mats.forEach(m => { if (m.parametricRimColorFactor) { m.parametricRimColorFactor.copy(RIM.uRim.value).multiplyScalar(Math.min(1, RIM.uRimK.value * 0.55)); m.parametricRimFresnelPowerFactor = 4.5; m.parametricRimLiftFactor = 0; } }); });
    cam.updateMatrixWorld(); const ud = sc.userData;
    RIM.uRim.value.set(spec.rim || ud.rim || '#ffb070'); RIM.uRimK.value = spec.rimK ?? ud.rimK ?? 0.7; RIM.uRimDir.value.copy(spec.rimDir ? V3(...spec.rimDir) : (ud.rimDir || V3(0, 0.3, -1))).normalize().transformDirection(cam.matrixWorldInverse);
    let fog0 = null; if (pl && sc.fog) { fog0 = sc.fog.color.getHex(); sc.fog.color.set(plateImg[pl.id].horizon); }
    R.render(sc, cam); hidden.forEach(ch => { ch.visible = true; }); if (fog0 != null) sc.fog.color.setHex(fog0);
    if (pl) { drawPlate(spec.ctx || ctx, pl, w, h); if (pl.set.mode === 'full') contactShadows(spec.ctx || ctx, spec.cast || []); }
    if (spec.under) { const u = spec.ctx || ctx; u.save(); u.setTransform(G.K, 0, 0, G.K, 0, 0); spec.under(u); u.restore(); } // 2D art that belongs behind the characters (a distant horde, eyes in the trees)
    const tg = spec.ctx || ctx; tg.save(); tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalAlpha = spec.alpha ?? 1; tg.drawImage(R.domElement, 0, 0, tg.canvas.width, tg.canvas.height); tg.restore();
    return true;
  }
  // project a world point to logical screen px (for 2D effects over the 3D frame)
  function project(x, y, z) { const v = V3(x, y, z).project(cam); return [(v.x * 0.5 + 0.5) * G.W, (-v.y * 0.5 + 0.5) * G.H]; }
  function jointPos(name, joint, dy = 0) { const c = chars[name]; if (!c) return [0, 0, 0]; c.J.root.updateMatrixWorld(true); if (c.isVRM && joint === 'head') dy *= 0.6; const v = V3(0, dy, 0); c.J[joint].localToWorld(v); return [v.x, v.y, v.z]; }
  function weaponTip(name, dist = 1.1) { const c = chars[name]; c.J.root.updateMatrixWorld(true); const v = V3(0, dist, 0); c.J.weapon.localToWorld(v); return [v.x, v.y, v.z]; }
  function place(name, pose, t, o = {}) { if (!init()) return; ensure(); const c = chars[name]; setPose(c, pose, t, o); c.J.root.scale.setScalar(o.scale || 1); c.J.root.updateMatrixWorld(true); }
  function eyePos(name) { const c = chars[name]; c.J.root.updateMatrixWorld(true); if (c.isVRM) { const hu = c.vrm.humanoid, out = []; ['leftEye', 'rightEye'].forEach(b => { const n = hu.getNormalizedBoneNode(b); if (n) { const v = new THREE.Vector3(); n.getWorldPosition(v); out.push([v.x, v.y, v.z]); } }); if (out.length === 2) return out; } const r = c.headR || 0.12; return [-1, 1].map(k => { const v = V3(k * r * 0.92 * Math.sin(0.29), 0.12 - r * Math.sin(0.07), r * Math.cos(0.29) * 0.98); c.J.head.localToWorld(v); return [v.x, v.y, v.z]; }); }
  function skyPoint(az, el) { const d = V3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(300).add(cam.position); return project(d.x, d.y, d.z); }
  function crack(op) { if (chars.shield) chars.shield.J.cracks.material.opacity = op; }
  return { init, preload, loadPlates, loadSprites, SPRITE_H, plateImage: id => plateImg[id] && plateImg[id].im, PLATE_SETS, frame, place, project, jointPos, weaponTip, seq, run, walk, POSES, crack, eyePos, skyPoint, get camera() { return cam; }, get ok() { return init(); }, chars, scenes, setPose, P0, blend };
})();
