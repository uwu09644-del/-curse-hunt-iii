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
      R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, premultipliedAlpha: false }); R.setClearColor(0x000000, 0);
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
  function shieldbearer() {
    const J = skeleton({ leg: 1.1, torso: 0.78, arm: 0.9, sw: 0.42, hw: 0.2, head: 0.17 });
    const armor = toon('#2c2a33'), armorD = toon('#1a1920'), bone = toon('#cfc5b2'), cloth = toon('#1e181c'), wood = toon('#4a4038');
    const hood = sph(0.26, cloth, 'm', 1, 1.1, 1); J.head.add(at(hood, 0, 0.12, -0.04));
    const skull = sph(0.16, bone, 's', 0.9, 1.05, 0.95); J.head.add(at(skull, 0, 0.12, 0.08));
    const jaw = new THREE.Group(); at(jaw, 0, 0.04, 0.1); J.head.add(jaw); const jw = box(0.16, 0.06, 0.12, bone); at(jw, 0, -0.03, 0.02); jaw.add(jw); J.jaw = jaw;
    const eyesM = basic('#ff2a1a'); [-0.055, 0.055].forEach(x => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), toon('#050304')); at(s, x, 0.15, 0.2); J.head.add(s); const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), eyesM); at(e, x, 0.15, 0.22); J.head.add(e); });
    const eyeLight = new THREE.PointLight('#ff2a1a', 1.2, 2.5); at(eyeLight, 0, 0.15, 0.4); J.head.add(eyeLight); J.eyeLight = eyeLight;
    const chest = cyl(0.42, 0.33, 0.8, armor, 'l', 10); at(chest, 0, 0.1, 0); chest.scale.z = 0.7; J.chest.add(chest);
    for (let i = 0; i < 5; i++) { const rib = part(new THREE.TorusGeometry(0.2 - i * 0.012, 0.018, 6, 16, Math.PI), bone, 's'); at(rib, 0, 0.3 - i * 0.09, 0.2, 0, 0, Math.PI); rib.scale.z = 0.4; J.chest.add(rib); }
    const cape = cyl(0.45, 0.62, 1.1, cloth, 'm', 12, true, Math.PI * 0.7, Math.PI * 0.6); at(cape, 0, -0.25, -0.05); cape.userData.mesh.material = toon('#2a2428', { side: THREE.DoubleSide }); J.chest.add(cape); J.skirt = cape;
    ['L', 'R'].forEach((s, i) => {
      const pd = sph(0.2, armorD, 'm', 1.1, 0.8, 1); at(pd, 0, 0.03, 0); J['sh' + s].add(pd);
      for (let k = 0; k < 4; k++) { const sp = cone(0.04, 0.2, armor, 's', 5); at(sp, (i ? -1 : 1) * (0.05 + k * 0.04), 0.14, -0.05 + k * 0.03, 0, 0, (i ? 1 : -1) * (0.3 + k * 0.2)); J['sh' + s].add(sp); }
      limb(J, 'ua' + s, 0.47, 0.12, 0.11, armor, 'm'); limb(J, 'el' + s, 0.43, 0.11, 0.09, armorD, 'm');
      limb(J, 'th' + s, 0.56, 0.15, 0.13, armor, 'm'); limb(J, 'kn' + s, 0.52, 0.13, 0.11, armorD, 'm');
      const ft = box(0.2, 0.12, 0.32, armorD, 'm'); at(ft, 0, -0.04, 0.06); J['an' + s].add(ft);
    });
    for (let k = 0; k < 4; k++) { const cl = cone(0.025, 0.2, bone, 's', 5); at(cl, -0.05 + k * 0.035, -0.12, 0.05, 0.3, 0, 0); J.handL.add(cl); }
    const planks = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#4a4038'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#3e352e' : '#544a40'; g.fillRect(i * 51, 0, 50, h); g.fillStyle = '#2a221d'; g.fillRect(i * 51 + 49, 0, 3, h); } g.strokeStyle = 'rgba(20,14,12,0.6)'; for (let i = 0; i < 40; i++) { g.beginPath(); const x = Math.random() * w; g.moveTo(x, Math.random() * h); g.lineTo(x + (Math.random() - 0.5) * 6, Math.random() * h); g.stroke(); } g.fillStyle = '#6a6870'; g.fillRect(0, 0, w, 18); g.fillRect(0, h - 18, w, 18); g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h); });
    const shield = new THREE.Group(); at(shield, 0.1, -0.15, 0.32); J.handR.add(shield); J.shield = shield;
    const sb = box(1.0, 1.75, 0.1, toon('#ffffff', { map: planks }), 'l'); at(sb, 0, -0.45, 0); shield.add(sb);
    for (let k = 0; k < 6; k++) { const sp = cone(0.05, 0.22, armor, 's', 5); at(sp, -0.5 + (k % 2), -1.2 + Math.floor(k / 2) * 0.7, 0.06, 0, 0, (k % 2 ? -1 : 1) * 1.3); shield.add(sp); }
    J.cracks = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.75), basic('#ff4a2a', { add: true, transparent: true, opacity: 0 })); at(J.cracks, 0, -0.45, 0.056); shield.add(J.cracks);
    return { J, kind: 'shield', height: 2.7 };
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
  const VRM_CAST = { takuto: { file: 'takuto.glb', scale: 1.07, seed: 6, expr: { angry: 0.12 } }, nemu: { file: 'nemu.glb', scale: 1.02, seed: 4, sleepy: 0.32 }, sieg: { file: 'sieg.glb', scale: 1.04, seed: 9, expr: { happy: 0.12 } } };
  const EU = new THREE.Euler(), HP = Math.PI / 2;
  async function preload(base = 'models/', progress) {
    if (!window.THREE_VRM || !init()) return false;
    const { GLTFLoader, VRMLoaderPlugin, VRMUtils } = THREE_VRM, L = new GLTFLoader(); L.register(p => new VRMLoaderPlugin(p));
    const keys = Object.keys(VRM_CAST);
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
    if (kind === 'nemu') { J.tail = []; let prev = back; const hm = toon('#25222c'); for (let i = 0; i < 10; i++) { const g = new THREE.Group(); g.position.set(0, i ? 0.065 : -0.03, i ? 0 : -0.1); prev.add(g); const seg = cap(0.02 - i * 0.0008, 0.05, hm, 's'); seg.position.y = 0.03; g.add(seg); J.tail.push(g); prev = g; } J.tail[0].rotation.x = -2.1; }
    const mats = []; vrm.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.isMToonMaterial && !mats.includes(m)) { mats.push(m); if (m.color) m.color.multiplyScalar(0.84); } }); });
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
    if (J.weapon) { J.weapon.rotation.x = (J.weapon.userData.base ?? Math.PI / 2) + p.weapon; if (J.weapon.userData.glow) J.weapon.userData.glow.material.opacity = o.axeGlow || 0; }
  }

  /* ---------- poses ---------- */
  // pose fields (radians; forward-positive for limbs): x,z,ry (place/facing), y (lift), lean, twist, headX, headY, headZ,
  // uaL/uaR [fwd, out], elL/elR, thL/thR [fwd, out], knL/knR, crouch, jaw, shield [fwd, lift]
  const P0 = { x: 0, y: 0, z: 0, ry: 0, pitch: 0, bank: 0, lean: 0.03, twist: 0, roll: 0, headX: 0, headY: 0, headZ: 0, uaL: [0, 0.12], uaR: [0, 0.12], elL: 0.15, elR: 0.15, thL: [0, 0.04], thR: [0, 0.04], knL: 0.05, knR: 0.05, crouch: 0, jaw: 0, shield: [0, 0], weapon: 0, flip: 0 };
  function setPose(ch, p, t, o = {}) {
    p = { ...P0, ...p }; if (ch.isVRM) return setPoseVRM(ch, p, t, o); const J = ch.J;
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
  function sky(stops, extras) { // gradient dome + painted extras
    const tex = canvasTex(32, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
    return dome;
  }
  function glowSprite(color, size, opacity = 1) { const tex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.setScalar(size); return s; }
  function moon(color, size, glowC) { const tex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(100, 100, 10, 128, 128, 120); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(180,150,160,1)'); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = 'rgba(120,90,110,0.22)'; const r = G.rng(4); for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(40 + r() * 176, 40 + r() * 176, 8 + r() * 22, 0, 7); g.fill(); } });
    const grp = new THREE.Group(), m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false, depthWrite: false })); m.scale.setScalar(size); grp.add(m); grp.add(glowSprite(glowC, size * 3, 0.5)); return grp; }
  function ground(size, color, amp, seed) { const geo = new THREE.PlaneGeometry(size, size, 80, 80); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z); pos.setY(i, (G.vnoise(x * 0.08, seed) + G.vnoise(z * 0.08, seed + 3) - 1) * amp * G.ease.io(Math.max(0, Math.min(1, (d - 11) / 14))) + (d > 11 ? (G.vnoise(x * 0.5, seed + 5) - 0.5) * 0.06 : 0)); } geo.computeVertexNormals(); return new THREE.Mesh(geo, toon(color)); }
  function buildBarrow() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#9a5a6e', 0.022);
    sc.add(sky([[0, '#120d24'], [0.35, '#2e1d43'], [0.5, '#6a3255'], [0.56, '#c2585a'], [0.6, '#ee9a62'], [0.62, '#f7c77e'], [1, '#2a1622']]));
    const m1 = moon('#f6ece2', 70, '#ffd8c8'); m1.position.set(-120, 120, -300); sc.add(m1); const m2 = moon('#e8705e', 22, '#ff5a40'); m2.position.set(150, 160, -320); sc.add(m2);
    const sun = glowSprite('#ffb070', 260, 0.55); sun.position.set(0, 10, -380); sc.add(sun);
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
    return sc; } finally { rimOn = true; }
  }
  function tree(mat, R) { const g = new THREE.Group(); const br = (len, r, depth) => { const grp = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r, len, 6), mat); c.position.y = len / 2; grp.add(c); if (depth > 0) for (let i = 0; i < 2 + (R() < 0.3 ? 1 : 0); i++) { const ch = br(len * (0.6 + R() * 0.2), r * 0.6, depth - 1); ch.position.y = len * (0.7 + R() * 0.3); ch.rotation.set((R() - 0.5) * 1.3, R() * 6, (R() - 0.5) * 1.3); grp.add(ch); } return grp; }; g.add(br(1.6, 0.12, 4)); return g; }
  function motes(n, color, spread, h) { const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), R = G.rng(9); for (let i = 0; i < n; i++) { p[i * 3] = (R() - 0.5) * spread; p[i * 3 + 1] = R() * h; p[i * 3 + 2] = (R() - 0.5) * spread - 4; } geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(color), size: 0.06, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); m.userData.base = p.slice(); return m; }
  function buildEarth() { rimOn = false; try {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2('#141a2c', 0.035);
    sc.add(sky([[0, '#05070e'], [0.4, '#0e1424'], [0.52, '#2b2236'], [0.58, '#4a2f39'], [1, '#0a0b10']]));
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
    for (let i = 0; i < 30; i++) { const w = 4 + R() * 6, h = 6 + R() * 22, x = (R() < 0.5 ? -1 : 1) * (8 + R() * 40), z = -6 - R() * 50; const t2 = winTex.clone(); t2.needsUpdate = true; t2.repeat.set(w / 4, h / 8); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshBasicMaterial({ map: t2 })); b.position.set(x, h / 2, z); sc.add(b); }
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

  /* ---------- per-frame updates ---------- */
  function animateEnv(name, t, o = {}) {
    const sc = scenes[name];
    if (sc.userData.motes) { const m = sc.userData.motes, a = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3] = b[i * 3] + Math.sin(t * 0.5 + i) * 0.3; a.array[i * 3 + 1] = (b[i * 3 + 1] + t * (name === 'void' ? 0.6 : 0.15)) % 8; } a.needsUpdate = true; }
    if (sc.userData.rain) { const r = sc.userData.rain, a = r.geometry.attributes.position, b = r.userData.base; for (let i = 0; i < a.count / 2; i++) { const dy = ((t * 14 + i * 0.37) % 14); a.array[i * 6 + 1] = (b[i * 6 + 1] - dy + 14) % 14; a.array[i * 6 + 4] = a.array[i * 6 + 1] - 0.45; } a.needsUpdate = true; r.position.set(cam.position.x, 0, cam.position.z - 6); }
    if (sc.userData.sig) { const on = Math.floor(t / 0.5) % 2; sc.userData.sig.forEach((s, si) => { s.lamps.forEach((l, i) => { const lit = o.lamps && (i % 2) === on; l.lm.material.color.set(lit ? '#ff3b2f' : '#3a1a1c'); l.gl.material.opacity = lit ? 0.9 : 0; l.pl.intensity = lit ? 2.2 : 0; }); s.arm.rotation.z = (o.gate ?? 0) * 1.45; }); }
    if (sc.userData.train) { const tr = sc.userData.train; tr.visible = o.train != null; if (o.train != null) { tr.position.set(o.train, 0, 0); tr.rotation.y = o.trainDir === -1 ? Math.PI : 0; } }
    if (sc.userData.bag) sc.userData.bag.visible = !!o.bag;
    if (sc.fog) { sc.userData.fog0 = sc.userData.fog0 || sc.fog.density; sc.fog.density = sc.userData.fog0 * (o.fog ?? 1); }
    if (sc.userData.cat) { const c = sc.userData.cat; c.visible = o.cat !== false; if (o.catPos) { c.position.set(...o.catPos); } if (o.catRy != null) c.rotation.y = o.catRy; c.userData.tail.rotation.z = Math.sin(t * 1.5) * 0.4; c.userData.head.position.y = 0.34 + (o.catUp ? 0.06 : 0) - (o.catEat ? 0.1 + Math.abs(Math.sin(t * 5)) * 0.04 : 0); c.userData.head.position.z = 0.1 + (o.catEat ? 0.06 : 0); }
    if (sc.userData.key && name === 'barrow') { const k = sc.userData.key; sc.userData.rim = { blood: '#ff3a2a', ash: '#f0dcd0', still: '#d8d8e0' }[o.mood] || '#ffae6a'; if (o.mood === 'blood') { k.color.set('#ff3a2a'); sc.fog.color.set('#5a0a10'); sc.userData.hemi.color.set('#ff6a5a'); } else if (o.mood === 'ash') { k.color.set('#e0c8c0'); sc.fog.color.set('#8a7a80'); sc.userData.hemi.color.set('#d8c8c8'); } else { k.color.set('#ffb890'); sc.fog.color.set('#b0707a'); sc.userData.hemi.color.set('#ffc8b0'); } }
  }

  /* ---------- rendering ---------- */
  function ensure() {
    if (!scenes.barrow) { scenes.barrow = buildBarrow(); scenes.earth = buildEarth(); scenes.void = buildVoid(); }
    if (!chars.shield) { chars.takuto = chars.takuto || takuto(); chars.nemu = chars.nemu || nemu(); chars.sieg = chars.sieg || sieg(); chars.shield = shieldbearer(); chars.sable = sable(); }
  }
  // draw a 3D frame into the 2D scene canvas. spec: { env, t, cam:{pos,look,fov,roll}, cast:[[charName, pose, opts]], envOpts }
  function frame(spec) {
    if (!init()) return false; ensure();
    const ctx = G.ctx, K = G.K, w = Math.round(G.W * K), h = Math.round(G.H * K);
    if (w !== curW || h !== curH) { R.setSize(w, h, false); curW = w; curH = h; }
    const sc = scenes[spec.env];
    Object.values(chars).forEach(c => { if (c.J.root.parent) c.J.root.parent.remove(c.J.root); });
    (spec.cast || []).forEach(([n, pose, o = {}]) => { const c = chars[n]; sc.add(c.J.root); setPose(c, pose, spec.t, o); c.J.root.visible = o.visible !== false; c.J.root.scale.setScalar(o.scale || 1); if (c.J.weapon) c.J.weapon.visible = o.weapon !== false; if (c.J.bag) c.J.bag.visible = !!o.bag; if (c.J.shield && n === 'shield') c.J.shield.visible = o.shieldOn !== false; });
    const hidden = []; if (spec.only === 'cast') sc.children.forEach(ch => { if (!ch.isLight && !(spec.cast || []).some(([n]) => chars[n].J.root === ch) && ch.visible) { ch.visible = false; hidden.push(ch); } });
    const cm = spec.cam; cam.fov = cm.fov || 32; cam.updateProjectionMatrix(); cam.position.set(...cm.pos); cam.up.set(Math.sin(cm.roll || 0), Math.cos(cm.roll || 0), 0); cam.lookAt(...cm.look);
    animateEnv(spec.env, spec.t, spec.envOpts || {});
    (spec.cast || []).forEach(([n]) => { const c = chars[n]; if (c && c.mats) c.mats.forEach(m => { if (m.parametricRimColorFactor) { m.parametricRimColorFactor.copy(RIM.uRim.value).multiplyScalar(Math.min(1, RIM.uRimK.value * 0.55)); m.parametricRimFresnelPowerFactor = 4.5; m.parametricRimLiftFactor = 0; } }); });
    cam.updateMatrixWorld(); const ud = sc.userData;
    RIM.uRim.value.set(spec.rim || ud.rim || '#ffb070'); RIM.uRimK.value = spec.rimK ?? ud.rimK ?? 0.7; RIM.uRimDir.value.copy(spec.rimDir ? V3(...spec.rimDir) : (ud.rimDir || V3(0, 0.3, -1))).normalize().transformDirection(cam.matrixWorldInverse);
    R.render(sc, cam); hidden.forEach(ch => { ch.visible = true; });
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
  return { init, preload, frame, place, project, jointPos, weaponTip, seq, run, walk, POSES, crack, eyePos, skyPoint, get camera() { return cam; }, get ok() { return init(); }, chars, scenes, setPose, P0, blend };
})();
