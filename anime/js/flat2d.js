/* RUINBREAKER — 2D mode: characters are the series' own illustrations, animated as cut-out puppets.
   The director still stages every shot in a 3D space (marks, camera, blocking); this module draws each character as
   their 2D art at the projected spot and size, so the whole frame is 2D: a painted background, drawn characters and
   drawn effects. Lip flaps follow the voice, figures breathe and blink, lean into attacks, bob when running, and show
   anime expression marks (an anger vein, a sweat drop, shock lines). Turn it on with window.RB_FLAT = true. */
'use strict';

const FLAT2D = (() => {
  const G = GFX, PI = Math.PI;
  // art: which illustration; rig: which POSE helper; h: height in metres; cover: how much of the body the art shows,
  // from the top of the head down (1 = head to feet); face: which way the art looks (-1 left, 1 right, 0 front)
  const CAST = {
    takuto: { face0: 0.14, art: 'takuto', rig: 'takuto', h: 1.72, cover: 0.56, face: 0, who: 'TAKUTO' },
    nemu: { face0: 0.2, art: 'nemu', rig: 'nemu', h: 1.5, cover: 1.0, face: -1, who: 'NEMU' },
    sieg: { face0: 0.17, art: 'sieg', rig: 'sieg', h: 1.8, cover: 0.7, face: 0, who: 'SIEG' },
    rin: { face0: 0.1, art: 'rin', rig: 'generic', h: 1.6, cover: 1.0, face: 0, who: 'RIN' },
    wick: { face0: 0.27, art: 'wick', rig: 'generic', h: 1.7, cover: 0.9, face: -1, who: 'WICK' },
    haruki: { face0: 0.1, art: 'haruki', rig: 'generic', h: 1.74, cover: 0.78, face: 0, who: 'HARUKI' },
    sable: { face0: 0.12, art: 'sable', rig: 'sable', h: 1.86, cover: 0.7, face: 0, who: 'SABLE' },
    shield: { face0: 0.1, art: 'shield', rig: 'shield', h: 2.2, cover: 1.0, face: 0, who: '' },
    gideon: { face0: 0.16, art: 'gideon_c', rig: 'generic', h: 1.75, cover: 0.95, face: -1, who: 'GIDEON' },
    valentine: { face0: 0.15, art: 'valentine_c', rig: 'generic', h: 1.7, cover: 1.0, face: 0, who: 'VALENTINE' },
    lucien: { face0: 0.13, art: 'lucien_c', rig: 'generic', h: 1.84, cover: 0.62, face: 0, who: 'LUCIEN' },
    vesper: { face0: 0.12, art: 'vesper_c', rig: 'generic', h: 1.72, cover: 1.0, face: 0, who: 'VESPER' },
    clerk: { face0: 0.12, art: 'clerk_c', rig: 'generic', h: 1.58, cover: 1.0, face: 0, who: 'CLERK', alt: 'EXAMINER' },
    tofu: { art: null, h: 0.5, cover: 1.0, face: 0, who: '' },
  };
  const has = n => !!CAST[n];
  const last = {}; // where each character was last drawn, in world terms: for effects that start from a hand or a head
  let off = null, offCtx = null;

  function amp(c, t) { if (!c.who || typeof VOICE === 'undefined') return 0; return Math.max(VOICE.amp(c.who, t), c.alt ? VOICE.amp(c.alt, t) : 0); }
  // a 3D pose (from the director's moves) read as a 2D figure's lean, bob and squash
  function read(pose = {}, t) {
    let lean = (pose.lean || 0) * 0.6 - (pose.pitch || 0) * 0.45, sy = 1, bob = 0;
    if (pose.weapon >= 1.65 && pose.weapon < 1.9) lean += 0.22; // the chop: lean in
    else if (pose.weapon >= 1.9) lean -= 0.12;                    // the wind-up: lean back
    if (pose.crouch > 0.3) sy = 1 - Math.min(0.3, pose.crouch * 0.28);
    if (pose.thL && pose.thR && pose.thL[0] > 0.3 && pose.thR[0] < 0.3 && !(pose.crouch > 0.3)) bob = Math.abs(Math.sin(t * 9)) * 0.03; // running
    return { lean: Math.max(-0.5, Math.min(0.5, lean)), sy, bob, y: pose.y || 0 };
  }
  function marks(kind, x, y, s, t) { // anime expression marks beside the head
    const c = G.ctx; c.save(); c.lineCap = 'round';
    if (kind === 'angry') { c.strokeStyle = '#e8343c'; c.lineWidth = 3.2 * s; for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; c.beginPath(); c.arc(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 7 * s, a + PI * 0.75, a + PI * 1.25); c.stroke(); } }
    else if (kind === 'Surprised') { c.strokeStyle = '#1a0f16'; c.lineWidth = 2.6 * s; [-0.5, 0, 0.5].forEach(a => { c.beginPath(); c.moveTo(x + Math.sin(a) * 10 * s, y - Math.cos(a) * 10 * s); c.lineTo(x + Math.sin(a) * 26 * s, y - Math.cos(a) * 26 * s); c.stroke(); }); }
    else if (kind === 'sad' || kind === 'tired') { const k = (t * 0.6) % 1; c.fillStyle = 'rgba(140,200,255,0.9)'; c.strokeStyle = '#2a4a6a'; c.lineWidth = 1.5 * s; c.beginPath(); const yy = y + k * 10 * s; c.moveTo(x, yy - 12 * s); c.quadraticCurveTo(x + 9 * s, yy + 2 * s, x, yy + 6 * s); c.quadraticCurveTo(x - 9 * s, yy + 2 * s, x, yy - 12 * s); c.fill(); c.stroke(); }
    else if (kind === 'happy') { c.fillStyle = 'rgba(255,240,180,0.95)'; [[0, 0, 7], [14, 10, 4], [-10, 12, 3]].forEach(([dx, dy, r]) => { c.beginPath(); for (let j = 0; j < 8; j++) { const a = j * PI / 4, rr = j % 2 ? r * 0.35 : r; c.lineTo(x + dx * s + Math.cos(a) * rr * s, y + dy * s + Math.sin(a) * rr * s); } c.fill(); }); }
    c.restore();
  }
  function tofu(x, y, s, o, t) { // the appraisal cube, drawn
    const c = G.ctx, w = 46 * s, bob = Math.sin(t * 2) * 3 * s; c.save(); c.globalAlpha = o.alpha ?? 1;
    c.fillStyle = '#f4efe9'; c.strokeStyle = '#1a0f16'; c.lineWidth = 3 * s; c.beginPath(); c.roundRect(x - w / 2, y - w + bob, w, w, 6 * s); c.fill(); c.stroke();
    c.fillStyle = '#1a0f16'; const face = o.face || (o.screen === 'scan' ? 'scan' : 'idle');
    if (face === 'scan') { c.fillStyle = '#ff7ab6'; c.fillRect(x - w * 0.3, y - w * 0.55 + bob, w * 0.6, 3 * s); }
    else { [-1, 1].forEach(k => { c.beginPath(); c.arc(x + k * w * 0.18, y - w * 0.58 + bob, 3 * s, 0, 7); c.fill(); }); c.beginPath(); c.arc(x, y - w * 0.42 + bob, 5 * s, 0.1, PI - 0.1); c.stroke(); }
    c.restore();
  }
  function ensureOff() {
    const main = G.ctx.canvas; if (!off || off.width !== main.width || off.height !== main.height) { off = document.createElement('canvas'); off.width = main.width; off.height = main.height; offCtx = off.getContext('2d'); }
    offCtx.setTransform(1, 0, 0, 1, 0, 0); offCtx.clearRect(0, 0, off.width, off.height); offCtx.setTransform(G.K, 0, 0, G.K, 0, 0); return offCtx;
  }
  // draw the characters of one shot. cast: [[name, pose, opts]] with world marks in the pose; spec.t is the time
  function draw(cast, spec = {}) {
    const t = spec.t || 0, list = [];
    cast.forEach(([n, pose = {}, o = {}]) => {
      const c = CAST[n]; if (!c || o.visible === false) return;
      const x = pose.x ?? 0, z = pose.z ?? 0, r = read(pose, t), y0 = r.y;
      // the art is hung so its face lands at eye height: art whose face sits lower (a raised arm, a hat) reaches above the head
      const f0 = c.face0 || 0.12, full = c.cover >= 0.9, topW = full ? y0 + c.h * 0.93 / (1 - f0) : y0 + c.h * 0.93 + f0 * c.cover * c.h, botW = full ? y0 : topW - c.cover * c.h; // full figures keep their feet on the ground
      const foot = S3.project(x, y0, z), top = S3.project(x, topW, z), bot = S3.project(x, botW, z), cp = S3.camera.position, dist = Math.hypot(cp.x - x, cp.z - z);
      if (!isFinite(foot[1]) || !isFinite(top[1]) || top[1] > foot[1]) return; // behind the camera
      list.push({ n, c, pose, o, r, x, z, y0, foot, top, bot, dist });
    });
    list.sort((a, b) => b.dist - a.dist);
    const cx = list.length ? list.reduce((s, e) => s + e.foot[0], 0) / list.length : 640;
    list.forEach(e => {
      const { n, c, o, r, foot, top, bot } = e, span = bot[1] - top[1], ht = span / c.cover, cover = c.cover, others = list.filter(q => q !== e);
      const towards = others.length ? Math.sign(others.reduce((s, q) => s + q.foot[0], 0) / others.length - foot[0]) || 1 : Math.sign(cx - foot[0]) || 1;
      last[n] = { x: e.x, y: e.y0, z: e.z, h: c.h, dir: towards };
      if (!c.art) { tofu(foot[0], foot[1] - r.bob * ht, ht / 60, o, t); return; }
      const A = G.A[c.art]; if (!A) return;
      const def = RIG.def && RIG.def(c.art), root = def ? def.root : [A.ox + A.w / (2 * A.s), A.oy + A.h / A.s];
      const artH = root[1], sc = span / artH * r.sy, flip = c.face !== 0 && towards !== c.face;
      const talk = Math.min(1, amp(c, t) * 1.4), fn = POSE[c.rig] || POSE.generic, lean = r.lean * towards;
      const pz = fn(t, { talk, seed: n.length });
      const place = { x: foot[0], y: top[1] + artH * sc - r.bob * ht, ax: root[0], ay: root[1], sc, flip, rot: lean };
      const cropped = cover < 0.92, alpha = (o.alpha ?? 1) * (spec.alpha ?? 1);
      if (cover >= 0.9 && alpha > 0.2) { const g = G.ctx; g.save(); g.globalAlpha = 0.35 * alpha; g.fillStyle = '#100808'; g.beginPath(); g.ellipse(foot[0], foot[1], ht * 0.16, ht * 0.035, 0, 0, 7); g.fill(); g.restore(); }
      if (cropped) { // a half-figure fades out at its lower edge instead of ending in a hard cut
        const main = G.ctx, oc = ensureOff(); G.setCtx(oc); RIG.draw(c.art, place, pz, { a: 1 }); G.setCtx(main);
        const bottom = place.y, fadeH = ht * cover * 0.22; oc.save(); oc.globalCompositeOperation = 'destination-out';
        const gr = oc.createLinearGradient(0, bottom - fadeH, 0, bottom); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); oc.fillStyle = gr; oc.fillRect(-200, bottom - fadeH, 1680, fadeH + 400); oc.restore();
        main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalAlpha = alpha; main.drawImage(off, 0, 0); main.restore();
      } else { const g = G.ctx; g.save(); g.globalAlpha = alpha; RIG.draw(c.art, place, pz, {}); g.restore(); }
      if (o.flash) { const g = G.ctx; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, o.flash) * 0.6; g.fillStyle = '#ffffff'; g.fillRect(place.x - ht * 0.4, top[1], ht * 0.8, ht); g.restore(); }
      const ex = o.expr && Object.entries(o.expr).sort((a, b) => b[1] - a[1])[0];
      if (ex && ex[1] >= 0.45) marks(ex[0], foot[0] + towards * ht * 0.16, top[1] + span * 0.05, Math.min(1.3, Math.max(0.6, ht / 420)), t);
    });
  }
  // where a hand, a head or the chest is, for effects drawn over the figures
  function joint(n, j, dy = 0) {
    const L = last[n]; if (!L) return [0, 1, 0];
    const k = { head: 0.92, chest: 0.72, hips: 0.52, handR: 0.56, handL: 0.56 }[j] ?? 0.6, side = j === 'handR' ? 0.22 : j === 'handL' ? -0.22 : 0;
    return [L.x + side * L.dir, L.y + L.h * k + dy, L.z];
  }
  const weaponTip = (n, d = 1.1) => { const L = last[n]; if (!L) return [0, 1, 0]; return [L.x + L.dir * (0.35 + d * 0.15), L.y + L.h * 0.62 + d * 0.25, L.z]; };
  const eyes = n => { const h = joint(n, 'head', 0); return [[h[0] - 0.05, h[1], h[2]], [h[0] + 0.05, h[1], h[2]]]; };
  // the director places a character to frame its close-ups before anything is drawn: remember the spot
  const note = (n, pose = {}) => { const c = CAST[n]; if (!c) return; const L = last[n] || {}; last[n] = { x: pose.x ?? L.x ?? 0, y: (pose.y || 0), z: pose.z ?? L.z ?? 0, h: c.h, dir: L.dir || 1 }; };
  return { CAST, has, draw, joint, weaponTip, eyes, note };
})();
