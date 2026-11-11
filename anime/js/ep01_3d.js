/* RUINBREAKER 3D — the shots of Episode 1 restaged in the cel-shaded three.js world (stage3d.js).
   Timing, dialogue, score and sound stay in ep01.js; each shot there calls one of these when the page runs in 3D.
   Direction follows the make-an-anime camera rules: one primary move per shot that starts after a short hold
   and settles before the cut, locked-off framing for comedy and dialogue, a camera that travels with a runner,
   partial arcs (never full spins), and hits sold by the cut, a jolt, a brief flash and the sound. */
'use strict';

const EP3D = (() => {
  const G = GFX, V = VOICE, X = VFX, { clamp, lerp, inv, ease, hash, W, H } = G;
  const PI = Math.PI, HALF = PI / 2;
  const PS = () => S3.POSES;

  /* ---------- camera ---------- */
  const C = (pos, look, fov = 32, roll = 0) => ({ pos, look, fov, roll });
  // hold, ease into one move, settle before the cut
  function move(lt, d, a, b, o = {}) {
    const h = Math.min(0.45, d * 0.1), t0 = o.t0 ?? h, t1 = o.t1 ?? d - h;
    const k = (ease[o.e || 'io'] || (x => x))(clamp((lt - t0) / Math.max(0.01, t1 - t0)));
    return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov ?? 32, b.fov ?? a.fov ?? 32, k), roll: lerp(a.roll || 0, b.roll || 0, k) };
  }
  function sway(c, t, amt = 0.008) { c.pos = c.pos.map((v, i) => v + (Math.sin(t * (0.8 + i * 0.31) + i * 2) + 0.5 * Math.sin(t * (1.9 + i * 0.4))) * amt); return c; }
  function jolt(c, t, amt) { if (amt <= 0) return c; const k = G.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); c.look = c.look.map((v, i) => v + (hash(k, i + 5) - 0.5) * amt * 0.6); return c; }
  // orbit a point: angle 0 = camera on +z looking -z
  const orbit = (cx, cy, cz, r, ang, h, fov = 32) => C([cx + Math.sin(ang) * r, cy + h, cz + Math.cos(ang) * r], [cx, cy, cz], fov);

  /* ---------- acting helpers ---------- */
  // eyes that wander: hold a target, then snap (saccade) to the next one; now and then a bigger look-away
  function gz(t, seed, bias = [0, 0], spread = 0.28) {
    const k = Math.floor(t / 1.7 + hash(seed, 7) * 5), away = hash(k, seed + 1) > 0.82;
    return [bias[0] + (hash(k, seed) - 0.5) * spread * (away ? 2.6 : 1), bias[1] + (hash(k, seed + 3) - 0.5) * spread * (away ? 1.2 : 0.5)];
  }
  const nemTalk = t => Math.max(V.amp('NEMU', t), V.amp('???', t));
  const TK = (p, t, o = {}) => ['takuto', p, { talk: V.amp('TAKUTO', t), gaze: o.gaze || gz(t, 11, o.look), ...o }];
  const NM = (p, t, o = {}) => ['nemu', p, { talk: o.talk ?? nemTalk(t), gaze: o.gaze || gz(t, 23, o.look), ...o }];
  const SG = (p, t, o = {}) => ['sieg', p, { talk: V.amp('SIEG', t), gaze: o.gaze || gz(t, 37, o.look), ...o }];
  const SB = (p, o = {}) => ['shield', p, o];
  const P = (...parts) => Object.assign({}, ...parts);
  function headOf(name, pose, t, o) { S3.place(name, pose, t, o); return S3.jointPos(name, 'head', 0.115); }
  // a close-up framed on a face: dist in metres in front of the face, side offset, height offset
  function faceCam(hp, ry, dist, o = {}) {
    const fx = Math.sin(ry + (o.ang || 0)), fz = Math.cos(ry + (o.ang || 0));
    return C([hp[0] + fx * dist, hp[1] + (o.dy || 0), hp[2] + fz * dist], [hp[0] + (o.lx || 0), hp[1] + (o.ly || 0), hp[2]], o.fov || 26, o.roll || 0);
  }
  const mixHex = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = s => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, k)); return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); };
  const proj = p => S3.project(p[0], p[1], p[2]);
  function eyeGlow(name, a, r = 26) { S3.eyePos(name).forEach(e => { const [x, y] = proj(e); G.radial(x, y, r, 'rgba(255,60,50,' + a.toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter'); G.radial(x, y, r * 0.25, 'rgba(255,220,200,' + a.toFixed(2) + ')', 'rgba(255,80,60,0)', 1, 'lighter'); }); }
  function rift(t, az, el, o = {}) { const [x, y] = S3.skyPoint(az, el), k = 32 / (S3.camera.fov || 32); G.drawRift(t, { cx: x, cy: y, w: (o.w || 560) * k, h: (o.h || 170) * k, open: o.open ?? 1, eye: o.eye || 0, close: o.close || 0 }); }
  function crack(t, p, az, el, glow = 1) { const [x, y] = S3.skyPoint(az, el), c = G.ctx; c.save(); c.translate(x - 640, y - 150); G.drawCrack(t, p, glow); c.restore(); }
  // foreground grass blades for depth (rule: overlap sells the depth)
  function fgGrass(t, a = 1, col = '18,10,16') {
    const c = G.ctx; c.save(); c.strokeStyle = 'rgba(' + col + ',' + (0.85 * a) + ')'; c.lineCap = 'round';
    for (let i = 0; i < 46; i++) { const x = hash(i, 51) * (W + 80) - 40, h = 26 + hash(i, 52) * 60, sw = Math.sin(t * 1.4 + i * 0.7) * 7 * (h / 100); c.lineWidth = 3 + hash(i, 53) * 4; c.beginPath(); c.moveTo(x, H + 4); c.quadraticCurveTo(x + sw * 0.4, H - h * 0.5, x + sw, H - h); c.stroke(); }
    c.restore();
  }
  const rainFX = (t, a = 1) => { G.rain(t, { n: 140, a: 0.22 * a, len: 36, speed: 1700, seed: 4 }); };
  const NIGHT_POST = () => POST.set({ lift: [0.02, 0.03, 0.06], gain: [0.95, 1, 1.08], sat: 1.05, bloom: 0.5, thr: 0.68 });
  const DUSK_POST = () => POST.set({ bloom: 0.45, thr: 0.7, sat: 1.1 });
  const BLOOD_POST = () => POST.set({ bloom: 0.7, thr: 0.6, gain: [1.1, 0.92, 0.9], sat: 1.1, ca: 0.002 });
  const F = spec => S3.frame(spec);
  let tmp = null; const tmpCtx = () => { const sc = G.ctx.canvas; if (!tmp || tmp.width !== sc.width || tmp.height !== sc.height) { tmp = G.canvas(sc.width, sc.height); } const g = tmp.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, tmp.width, tmp.height); return g; };

  // the duel line: Takuto comes from -x, the Shieldbearer stands at +x facing him; the sun is behind (-z)
  const FACE_R = HALF, FACE_L = -HALF;

  /* =================================================================== COLD OPEN */
  function coldEyes(lt, d, t) {
    const pose = { ...PS().shoulder }, hp = headOf('takuto', pose, t);
    const cam = move(lt, d, faceCam(hp, 0, 1.35, { fov: 22, dy: -0.01 }), faceCam(hp, 0, 1.1, { fov: 22, dy: -0.01 }), { e: 'linear', t0: 0, t1: d });
    F({ env: 'void', t, cam, cast: [TK(pose, t, { gaze: [0, 0], blink: 0, axeGlow: 0.6 })], rim: '#ff2a1a', rimK: 0.8 });
    eyeGlow('takuto', 0.7, 30); G.motes(t, { n: 50, vy: -70, color: '#ff6a3a', size: 2.6, seed: 21 }); POST.set({ bloom: 0.9, thr: 0.5 });
  }
  function coldHero(lt, d, t) {
    const raise = ease.out(inv(1.5, 3.5, lt)), pose = P(PS().shoulder, { ry: 0.22, headX: lerp(0.4, 0, raise), lean: lerp(0.15, 0.03, raise) });
    const cam = move(lt, d, C([0.4, 0.55, 4.4], [0, 1.25, 0], 30), C([0.3, 0.7, 3.0], [0, 1.4, 0], 30), { e: 'io' });
    F({ env: 'barrow', t, cam: sway(cam, t), cast: [TK(pose, t, { gaze: [0, raise * 0.05 - 0.05], wind: 2.6, axeGlow: 0.85 + 0.15 * Math.sin(t * 6) })], envOpts: { mood: 'blood' } });
    if (raise > 0.6) eyeGlow('takuto', 0.6 * raise, 16);
    G.motes(t, { n: 120, vy: -90, vx: 20, color: '#ff7a3a', size: 2.4, seed: 5 }); fgGrass(t, 1, '20,4,6');
    G.fill('#000', 1 - inv(0, 0.4, lt)); BLOOD_POST();
  }

  /* =================================================================== EARTH — Crossing No. 4, 2:14 a.m. */
  const TK_EARTH = { x: -1.0, z: 4.2, ry: PI };
  const earthTK = (extra = {}) => P(PS().idleAxe, { uaR: [0.08, 0.12], elR: 0.2, uaL: [0.05, 0.12], elL: 0.35 }, TK_EARTH, extra);
  function earthWide(lt, d, t) { // the freight passes; he waits at the crossing with the cat food
    const tx = lt > 0.4 && lt < 7.8 ? -70 + 25 * (lt - 0.4) : null, gate = ease.io(inv(7.0, 8.5, lt));
    const cam = move(lt, d, C([-4.4, 1.25, 9.6], [0.2, 1.4, 0], 34), C([-3.5, 1.35, 8.9], [0.4, 1.4, 0], 34), { e: 'linear', t0: 0, t1: d });
    F({ env: 'earth', t, cam, cast: [TK(earthTK(), t, { weapon: false, bag: true, gaze: [0.3, -0.1] })], envOpts: { lamps: lt < 7.6, gate, train: tx, cat: true } });
    rainFX(t); G.splashes(t, { n: 30 }); if (tx != null) POST.set({ dir: [0.003, 0] });
    G.locationCard(lt - 1.0, 5.2, 'NERIMA, TOKYO', 'Crossing No. 4  ·  2:14 a.m.');
    G.fill('#000', 1 - inv(0, 1.2, lt)); NIGHT_POST();
  }
  function earthCat(lt, d, t) { // over his shoulder to the cat across the tracks; push in
    const cam = move(lt, d, C([-0.55, 1.68, 5.25], [3.2, 0.9, -1.6], 34), C([-0.55, 1.66, 5.25], [5.1, 0.35, -2.95], 14), { t0: 0.2, t1: 2.4 });
    F({ env: 'earth', t, cam: sway(cam, t, 0.004), cast: [TK(earthTK(), t, { weapon: false, bag: true, gaze: [0.4, -0.2] })], envOpts: { gate: 1, cat: true } });
    rainFX(t, 0.8); NIGHT_POST();
  }
  function earthFace(lt, d, t) { // he looks at the cat; two years of habit
    const pose = earthTK({ headY: 0.18, headX: 0.06 }), hp = headOf('takuto', pose, t);
    const cam = move(lt, d, faceCam(hp, PI, 0.95, { ang: 0.35, fov: 26 }), faceCam(hp, PI, 0.8, { ang: 0.32, fov: 26 }));
    F({ env: 'earth', t, cam: sway(cam, t, 0.003), cast: [TK(pose, t, { weapon: false, bag: true, gaze: lt < 3 ? [0.55, 0.15] : gz(t, 12, [0.3, 0.3]) })], envOpts: { gate: 1, cat: true }, rim: '#a8c0ff', rimK: 0.8 });
    rainFX(t, 0.6); NIGHT_POST();
  }
  function earthFeed(lt, d, t) { // low, locked: he crouches with the cat while it eats
    const pose = P(PS().kneel, { x: 4.45, z: -2.55, ry: 2.1, headX: 0.35, uaL: [0.6, 0.1], elL: 0.4 });
    F({ env: 'earth', t, cam: sway(C([6.6, 1.0, -0.4], [4.8, 0.5, -2.7], 34), t, 0.003), cast: [TK(pose, t, { weapon: false, gaze: [0.1, 0.5] })], envOpts: { gate: 1, cat: true, catRy: -0.95, catEat: true } });
    rainFX(t, 0.7); G.splashes(t, { n: 30, y0: 520, y1: 720, a: 0.4 }); NIGHT_POST();
  }
  function earthAlert(lt, d, t) { // the cat looks up first; then he does
    const up = ease.out(inv(2.0, 2.8, lt)), pose = P(PS().kneel, { x: 4.45, z: -2.55, ry: 2.1, headX: lerp(0.35, -0.45, up), uaL: [0.6, 0.1], elL: 0.4 });
    F({ env: 'earth', t, cam: C([6.8, 1.15, -0.7], [4.7, 0.75, -2.65], 34), cast: [TK(pose, t, { weapon: false, gaze: [0.1, lerp(0.5, -0.6, up)] })], envOpts: { gate: 1, cat: true, catRy: lt > 1.0 ? 2.6 : -0.95, catUp: lt > 1.0 } });
    rainFX(t, 0.7); NIGHT_POST();
  }
  function earthSky(lt, d, t) { // tilt up from him to the sky as it cracks
    const p = inv(0.8, 6.2, lt), pose = P(PS().kneel, { x: 4.45, z: -2.55, ry: 2.1, headX: -0.5 });
    const cam = move(lt, d, C([3.0, 0.55, -0.4], [4.3, 1.0, -2.4], 34), C([3.0, 0.55, -0.4], [2.0, 9, -22], 40), { t0: 0.3, t1: 3.2 });
    F({ env: 'earth', t, cam: jolt(cam, t, p * 0.02), cast: [TK(pose, t, { weapon: false, gaze: [0, -0.7] })], envOpts: { gate: 1, cat: true, catUp: true, catRy: 2.6, lamps: lt > 3.5 } });
    crack(t, p, -0.15, 0.32, 0.6 + p);
    G.radial(640, 160, 700, 'rgba(255,30,40,' + (0.3 * p).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter');
    rainFX(t, 0.8); NIGHT_POST(); POST.set({ bloom: 0.8 + p * 0.5, thr: 0.45, ca: 0.002 + p * 0.002 });
  }
  function earthSmash(lt, d, t) { // smash zoom into his eyes under the flashing lamps
    const pose = P(PS().kneel, { x: 4.45, z: -2.55, ry: 2.1, headX: -0.3 }), hp = headOf('takuto', pose, t), lamp = Math.floor(t / 0.5) % 2 === 0;
    const cam = move(lt, d, faceCam(hp, 2.1, 1.4, { fov: 30, ang: -0.2 }), faceCam(hp, 2.1, 0.62, { fov: 22, ang: -0.1 }), { e: 'in', t0: 0, t1: d });
    F({ env: 'earth', t, cam, cast: [TK(pose, t, { weapon: false, gaze: [0, -0.4], blink: 0 })], envOpts: { gate: 1, cat: true, catUp: true, lamps: true }, rim: lamp ? '#ff3b2f' : '#a8c0ff', rimK: lamp ? 0.9 : 0.4 });
    rainFX(t, 0.6); NIGHT_POST(); POST.set({ radial: 0.03 * lt });
  }
  // Nemu falls out of the rift onto the tracks
  const NEMU_TRACK = { x: 0.6, z: 0.15 };
  function nemuFall(lt) { const f = inv(1.0, 3.6, lt); return lt < 3.6 ? P(PS().leap, { x: lerp(0.9, NEMU_TRACK.x, f), z: NEMU_TRACK.z, y: lerp(16, 0.1, f * f), pitch: f * 9, ry: 0.4 }) : P(PS().lying, NEMU_TRACK, { y: 0.13, pitch: -HALF, ry: HALF + 0.2 }); }
  function earthRift(lt, d, t) {
    const open = ease.out(inv(0, 1.2, lt)), cast = [TK(P(PS().kneel, { x: 4.45, z: -2.55, ry: 1.2, headX: -0.3 }), t, { weapon: false, gaze: [0.2, -0.5] })];
    if (lt > 1.0) cast.push(NM(nemuFall(lt), t, { blink: 1 }));
    const cam = jolt(C([5.2, 1.0, 3.6], [1.2, 1.6, -1.0], 40), t, (1 - inv(0, 2, lt)) * 0.06 + (lt > 3.6 && lt < 4.1 ? 0.08 : 0));
    F({ env: 'earth', t, cam, cast, envOpts: { gate: 0, cat: true, catUp: true, lamps: true } });
    rift(t, -0.25, 0.4, { open });
    if (lt > 3.6) { const [x, y] = proj([NEMU_TRACK.x, 0.1, NEMU_TRACK.z]); X.debris(lt - 3.6, { x, y, n: 14, speed: 300, size: 5, seed: 31, dust: '#6a6a74' }); }
    rainFX(t); NIGHT_POST(); POST.set({ bloom: 1.0, thr: 0.45, ca: 0.003 * (1 - inv(0, 2, lt)) + 0.001 }); if (lt < 0.25) POST.set({ flash: 0.7 * (1 - lt / 0.25), flashCol: [1, 0.3, 0.3] });
  }
  const SB_TRACK = { x: 2.4, z: -1.2 };
  function earthLand(lt, d, t) { // the Shieldbearer drops out of the rift behind her
    const land = 3.5, f = ease.in(inv(0.4, land, lt)), sq = lt > land ? 0.12 * Math.exp(-(lt - land) * 9) * Math.cos((lt - land) * 30) : 0;
    const sb = P(PS().sbIdle, SB_TRACK, { ry: -0.6, y: lt < land ? lerp(18, 0, f) : 0, crouch: Math.max(0, sq) * 2, jaw: lt > land + 0.6 && lt < land + 1.8 ? 0.8 : 0, headX: lt > land + 0.5 ? 0.2 : 0 });
    const cam = jolt(C([5.6, 1.1, 5.2], [1.6, 1.8, -0.8], 38), t, lt > land && lt < land + 0.7 ? 0.3 * (1 - inv(land, land + 0.7, lt)) : 0.01);
    F({ env: 'earth', t, cam, cast: [NM(nemuFall(9), t, { blink: 1 }), SB(sb)], envOpts: { gate: 0, cat: true, catUp: true, lamps: true } });
    rift(t, -0.3, 0.42, { open: 1 });
    if (lt > land) { const [x, y] = proj([SB_TRACK.x, 0.05, SB_TRACK.z]); X.debris(lt - land, { x, y, n: 30, speed: 600, size: 9, seed: 33 }); X.ring(lt - land, { x, y, r1: 700, dur: 0.6 }); }
    rainFX(t); NIGHT_POST(); POST.set({ bloom: 0.9, thr: 0.5 });
  }
  function earthRaise(lt, d, t) { // from her eye line: it lifts the shield; a headlight grows on the right
    const raise = ease.io(inv(0.5, 3.0, lt)), hl = inv(1.8, 5, lt);
    const sb = P(PS().sbIdle, SB_TRACK, { ry: -0.6 }, S3.blend(PS().sbIdle, PS().sbRaise, raise));
    const sbp = P(sb, SB_TRACK, { ry: -0.6 });
    const cam = move(lt, d, C([-0.6, 0.35, 1.3], [2.0, 2.0, -1.1], 40), C([-0.7, 0.32, 1.25], [2.1, 2.6, -1.1], 40));
    F({ env: 'earth', t, cam: sway(cam, t, 0.006), cast: [NM(P(nemuFall(9), { headX: -0.4 }), t), SB(sbp)], envOpts: { gate: 0, lamps: true, train: lt > 1.8 ? 160 - 30 * (lt - 1.8) : null, trainDir: -1 } });
    rift(t, 0.1, 0.55, { open: 1 });
    G.radial(1300, 430, 200 + hl * 700, 'rgba(255,245,215,' + (hl * 0.85).toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter');
    rainFX(t); NIGHT_POST(); POST.set({ bloom: 1.0 + hl * 0.8, thr: 0.5 });
  }
  function earthDive(lt, d, t) { // one runner, camera travels with him; he dives as the shield and the train come down
    const run = clamp(lt / 2.3), x = lerp(-5.5, -0.2, run), z = lerp(3.4, 0.9, run);
    const pose = lt < 2.3 ? P(S3.run(lt * 15, 1.1), { x, z, ry: 1.95, lean: 0.45 }) : S3.seq(lt, [[2.3, P(PS().leap, { x: -0.2, z: 0.9, ry: 1.95 })], [3.0, P(PS().leap, { x: 0.5, z: 0.3, y: 0.6, ry: 1.95, pitch: 0.9 }), 'out'], [3.7, P(PS().crouch, { x: 0.9, z: 0.1, ry: 1.95, pitch: 1.2 })]]);
    const slam = ease.in(inv(2.0, 3.7, lt)), sb = P(S3.blend(PS().sbRaise, PS().sbSlam, slam), SB_TRACK, { ry: -0.6 });
    const camx = lerp(-4.2, 0.4, ease.io(clamp(lt / 3.4)));
    const cam = jolt(C([camx - 0.6, 1.0, 5.2], [camx + 1.2, 1.1, 0.6], lerp(36, 30, inv(2, 3.7, lt))), t, 0.02 + lt * 0.01);
    F({ env: 'earth', t, cam, cast: [TK(pose, t, { weapon: false, gaze: [0.3, 0] }), NM(P(nemuFall(9), { headX: -0.4 }), t), SB(sb)], envOpts: { gate: 0, lamps: true, train: 160 - 30 * (lt + 3.2), trainDir: -1 } });
    G.radial(1300, 430, 900, 'rgba(255,245,215,' + (0.6 + inv(0, 3.7, lt) * 0.4).toFixed(2) + ')', 'rgba(255,240,200,0)', 1, 'lighter');
    rainFX(t); G.splashes(t, { n: 50 }); NIGHT_POST(); POST.set({ dir: lt < 2.3 ? [0.006, 0] : [0, 0], radial: inv(2.6, 3.7, lt) * 0.06, bloom: 1.2, thr: 0.45 });
    G.fill('#fff', inv(3.55, 3.8, lt));
  }
  function earthAfter(lt, d, t) { // the crossing, empty. A bag on the road.
    F({ env: 'earth', t, cam: C([-3.9, 1.3, 9.2], [0.4, 1.2, 0], 34), cast: [], envOpts: { lamps: lt < 3.5, gate: 0, cat: true, catUp: true, catRy: 1.2, bag: true, train: lt < 2.6 ? 60 + 25 * lt : null } });
    rift(t, -0.25, 0.4, { open: 1, close: inv(1.2, 5.0, lt) });
    rainFX(t); NIGHT_POST(); G.fill('#fff', 1 - inv(0, 0.9, lt)); G.fill('#000', inv(6.3, 7.5, lt));
  }

  /* =================================================================== PART A — the Barrow Fields */
  const LIE = { y: 0.13, pitch: -HALF, ...{} };
  const tkLying = (extra = {}) => P(PS().lying, LIE, { uaR: [0.3, 0.9], elR: 0.2, weapon: 0.9 }, extra);
  function barrowOpen(lt, d, t) { // crane down from the two moons to the boy in the grass
    const cam = move(lt, d, C([2.0, 1.4, 7.5], [-30, 40, -200], 40), C([1.6, 2.4, 3.2], [0, 0.2, -0.8], 34), { t0: 0.8, t1: d - 0.4 });
    F({ env: 'barrow', t, cam, cast: [TK(tkLying(), t, { blink: 1 })] });
    X.shafts(t, { x: 1050, y: -60, ang: 2.05, spread: 0.9, n: 8, color: 'rgba(255,190,140,1)', a: 0.08 });
    G.fill('#000', 1 - inv(0.2, 2.5, lt)); DUSK_POST(); POST.set({ bloom: 0.8, thr: 0.5 });
  }
  function barrowWake(lt, d, t) { // looking down at his face as his eyes open
    const open = ease.out(inv(0.3, 1.6, lt));
    const cam = move(lt, d, C([0, 1.0, -0.98], [0, 0.24, -1.64], 26), C([0, 0.94, -1.05], [0, 0.24, -1.64], 26));
    F({ env: 'barrow', t, cam, cast: [TK(tkLying(), t, { blink: 1 - open, gaze: lt < 2.4 ? [0, -0.1] : [-0.5, 0.2] })] });
    G.fill('#000', 0.6 * (1 - inv(0, 1.2, lt))); DUSK_POST();
  }
  function barrowHand(lt, d, t) { // insert: his hand closed around the axe
    const pose = tkLying({ uaR: [0.3 + 0.02 * Math.sin(t * 5) * inv(0, 2, lt), 0.9] });
    S3.place('takuto', pose, t); const h = S3.jointPos('takuto', 'handR');
    const cam = move(lt, d, C([h[0] - 0.5, h[1] + 0.45, h[2] + 0.55], [h[0] - 0.05, h[1], h[2] - 0.15], 30), C([h[0] - 0.42, h[1] + 0.38, h[2] + 0.47], [h[0] - 0.05, h[1], h[2] - 0.15], 30));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { blink: 0 })] }); DUSK_POST();
  }
  function barrowRise(lt, d, t) { // he gets up and looks around
    const look = lt > 2.6 ? Math.sin((lt - 2.6) * 1.4) * 0.55 : 0;
    const pose = S3.seq(lt, [[0.2, tkLying()], [1.0, P(PS().sit, { pitch: -0.4, weapon: 0.9 })], [1.7, P(PS().kneel, { weapon: 1.2 })], [2.5, P(PS().drag)]]);
    pose.headY = (pose.headY || 0) + look; pose.ry = 0.35;
    const cam = move(lt, d, C([3.4, 1.15, 6.0], [0, 0.9, -0.6], 32), C([3.0, 1.2, 5.3], [0, 1.0, -0.6], 32));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { gaze: [look * 0.8, 0] })] });
    fgGrass(t); G.locationCard(lt - 0.8, 5.8, 'THE BARROW FIELDS', 'Ashen March frontier  ·  dusk'); DUSK_POST();
  }
  const NEMU_BEHIND = { x: 2.35, z: -1.2, ry: -0.2 };
  function nemuWake(lt, d, t, o = {}) { // she sits up behind a gravestone, mid-yawn
    const rise = ease.out(inv(0, 1.4, lt)), yawn = lt < 3 ? Math.sin(Math.min(1, lt / 3) * PI) : 0;
    const pose = P(S3.blend(P(PS().lying, LIE), P(PS().sit, { uaL: [2.8, 0.3], elL: 0.6, uaR: [2.6, 0.3], elR: 0.8 }), rise), NEMU_BEHIND, { pitch: lerp(-HALF, 0, rise), y: lerp(0.13, 0, rise), headZ: 0.12 * yawn });
    if (lt > 3) Object.assign(pose, S3.blend(pose, P(PS().sit, NEMU_BEHIND), inv(3, 4, lt)));
    const cam = move(lt, d, C([2.9, 0.95, 1.5], [2.3, 0.65, -1.2], 30), C([2.8, 0.92, 1.35], [2.3, 0.7, -1.2], 30));
    F({ env: 'barrow', t, cam, cast: [NM(pose, t, { talk: Math.max(yawn * 0.8, nemTalk(t)), blink: yawn > 0.3 ? 1 : undefined, ears: -0.2 * yawn }), TK(P(PS().drag, { x: -0.9, z: 0.6, ry: 1.2 }), t)], envOpts: o.mood ? { mood: o.mood } : {} });
    fgGrass(t); DUSK_POST();
  }
  // the dialogue set-up: Takuto left, Nemu right, facing each other three-quarter to camera
  const TK2 = { x: -0.85, z: 0.3, ry: 0.95 }, NM2 = { x: 0.85, z: 0.0, ry: -0.95 };
  function pair(t, o = {}) {
    const tkp = P(o.tkPose || PS().drag, TK2, o.tk || {}), nmp = P(o.nmPose || {}, NM2, o.nm || {});
    return [TK(tkp, t, { look: [0.55, 0.05], ...(o.tkO || {}) }), NM(nmp, t, { look: [-0.5, -0.1], ears: o.ears || 0, ...(o.nmO || {}) })];
  }
  function twoShot(lt, d, t, o = {}) {
    const mood = o.mood, push = o.push ?? 0.03, ang = o.ang || 0;
    const a = orbit(0, 1.15, 0.15, 4.7, ang, 0.2, 30), b = orbit(0, 1.15, 0.15, 4.7 * (1 - push * 4), ang + (o.arc || 0), 0.2, 30);
    F({ env: 'barrow', t, cam: sway(move(lt, d, a, b, { e: 'io', t0: 0, t1: d }), t, 0.004), cast: pair(t, o), envOpts: { mood, fog: o.fog || 1 } });
    if (mood === 'ash') G.motes(t, { n: 120, vy: 30, vx: 8, wob: 40, size: 2.2, color: '#d9d0d0', a: 0.5, glow: false, seed: 27 });
    fgGrass(t); DUSK_POST(); if (mood === 'ash') POST.set({ sat: 0.8 });
  }
  function otsNemu(lt, d, t, o = {}) { // over Takuto's shoulder onto Nemu (same side of the line)
    const cam = move(lt, d, C([-1.75, 1.62, 1.65], [0.7, 1.32, -0.05], 30), C([-1.62, 1.6, 1.52], [0.75, 1.34, -0.05], 30));
    F({ env: 'barrow', t, cam: sway(cam, t, 0.003), cast: pair(t, { tk: { ry: 1.25 }, ...o }), envOpts: { mood: o.mood } });
    DUSK_POST();
  }
  function closeOn(name, lt, d, t, o = {}) { // a locked or slowly pushing close-up on one face
    const base = name === 'takuto' ? P(o.pose || PS().drag, o.at || TK2) : name === 'nemu' ? P(o.pose || {}, o.at || NM2) : P(o.pose || {}, o.at);
    const hp = headOf(name, base, t, {});
    const ry = base.ry || 0, a = faceCam(hp, ry, o.d0 ?? 0.95, { ang: o.ang ?? (name === 'nemu' ? 0.45 : -0.45), fov: o.fov || 26, dy: o.dy ?? -0.02 });
    const b = faceCam(hp, ry, (o.d1 ?? (o.d0 ?? 0.95) * (o.locked ? 1 : 0.9)), { ang: o.ang ?? (name === 'nemu' ? 0.45 : -0.45), fov: o.fov || 26, dy: o.dy ?? -0.02 });
    const cam = move(lt, d, a, b, { e: o.e || 'io', t0: o.t0, t1: o.t1 });
    const mk = name === 'takuto' ? TK : name === 'nemu' ? NM : SG;
    const extra = o.cast ? o.cast(t) : [];
    F({ env: o.env || 'barrow', t, cam: o.still ? cam : sway(cam, t, 0.002), cast: [mk(base, t, o.opts || {}), ...extra], envOpts: o.envOpts || {}, rim: o.rim, rimK: o.rimK });
    if (o.after) o.after(lt, d, t);
    (o.env === 'void' ? BLOOD_POST : DUSK_POST)();
  }
  const tkClose = (o = {}) => (lt, d, t) => closeOn('takuto', lt, d, t, o);
  const nmClose = (o = {}) => (lt, d, t) => closeOn('nemu', lt, d, t, o);
  function tkAxe(lt, d, t) { // he lifts the axe a little to look at it
    const lift = lt > 0.5 && lt < 3.0 ? Math.sin((lt - 0.5) / 2.5 * PI) : 0;
    closeOn('takuto', lt, d, t, { pose: P(PS().drag, { uaR: [0.12 + lift * 0.7, 0.15], elR: 0.2 + lift * 1.2, weapon: 1.4 - lift * 1.1, headX: 0.1 * lift }), d0: 1.5, fov: 30, dy: -0.15, opts: { gaze: lift > 0.3 ? [-0.3, 0.5] : gz(t, 11, [0.5, 0]) } });
  }
  function headsmanGrave(lt, d, t) {
    const cam = move(lt, d, C([2.6, 1.7, -0.4], [4.5, 1.5, -3.0], 30), C([3.4, 1.9, -0.8], [4.5, 1.7, -3.0], 26), { e: 'io', t0: 0, t1: d });
    F({ env: 'barrow', t, cam, cast: [] });
    X.shafts(t, { x: 900, y: -100, ang: 1.9, spread: 0.4, n: 4, a: 0.1 }); DUSK_POST();
  }
  function nemuSigil(lt, d, t) { // she raises her hand; Nine Lives answers
    closeOn('nemu', lt, d, t, { pose: P(S3.blend({}, PS().raiseHand, ease.out(inv(0.3, 1.0, lt))), { headX: -0.05 }), d0: 1.6, fov: 30, dy: -0.18, ang: 0.3,
      after: (lt2, d2, t2) => { const hp = S3.jointPos('nemu', 'handR'), [x, y] = proj(hp); G.sigilPaw(x, y - 40, 100, 3, 9, ease.out(inv(0.6, 2, lt2)), 0.95); G.radial(x, y - 40, 200, 'rgba(140,200,255,0.25)', 'rgba(0,0,0,0)', inv(0.6, 2, lt2), 'lighter'); POST.set({ bloom: 0.9, thr: 0.5 }); } });
  }
  function riftThin(lt, d, t) { // tilt up from the pair to a hairline crack in the sky
    const cam = move(lt, d, C([0.4, 0.6, 3.8], [0, 1.4, 0], 34), C([0.4, 0.6, 3.8], [0.2, 7.5, -14], 38));
    F({ env: 'barrow', t, cam, cast: pair(t, { tk: { headX: -0.4 }, nm: { headX: -0.4 } }) });
    rift(t, 0.05, 0.42, { open: 0.04, w: 300, h: 60 }); G.fill('#200810', 0.12); DUSK_POST();
  }
  function bellsTurn(lt, d, t) { // both turn toward a bell that should not be there; the fog rolls in
    const turn = ease.io(inv(0.6, 1.6, lt));
    const cam = move(lt, d, C([0.2, 1.3, 4.8], [0, 1.2, 0], 30), C([0.2, 1.3, 4.5], [0, 1.2, 0], 30), { e: 'linear', t0: 0, t1: d });
    F({ env: 'barrow', t, cam, cast: pair(t, { tk: { headY: -0.75 * turn }, nm: { headY: 0.6 * turn }, ears: 0.35 * turn, tkO: { gaze: turn > 0.5 ? [-0.6, 0] : undefined }, nmO: { gaze: turn > 0.5 ? [0.6, 0] : undefined } }), envOpts: { fog: lerp(1, 3.5, lt / d) } });
    fgGrass(t); DUSK_POST();
  }
  function sbRise(lt, d, t) { // it climbs out of the ground
    const rise = ease.out(inv(0.6, 6.5, lt)), sb = P(PS().sbIdle, { x: 0.4, z: -5.5, y: lerp(-2.8, 0, rise), jaw: lt > 6.0 ? 0.9 : 0, headX: lerp(0.4, -0.1, rise) });
    const cam = jolt(C([0.1, 0.45, 1.6], [0.4, 1.9, -5.5], 38), t, 0.015 + lt * 0.004);
    F({ env: 'barrow', t, cam, cast: [SB(sb)], envOpts: { fog: 3.2 } });
    const [x, y] = proj([0.4, 0, -5.5]); if (lt > 0.6 && lt < 6.5) X.debris((lt - 0.6) % 1.2, { x, y, n: 10, speed: 220, size: 6, seed: 50 + Math.floor(lt / 1.2) });
    if (lt > 6.0) { const [hx, hy] = proj([0.4, 2.4, -5.5]); X.ring(lt - 6.0, { x: hx, y: hy, r1: 800, dur: 0.7, flat: 0.8 }); POST.set({ ca: 0.006 * (1 - inv(6, 6.8, lt)) }); }
    DUSK_POST();
  }

  /* =================================================================== PART B — the Shieldbearer */
  function sbWalk(lt, d, t) { // it walks out of the fog toward the lens
    const k = ease.io(clamp(lt / d)), walking = lt < 6, z = lerp(-13, -6.5, Math.min(1, lt / 6));
    const steps = [0.9, 2.3, 3.7, 5.1], stp = steps.reduce((m, s) => Math.max(m, lt > s && lt < s + 0.35 ? 1 - (lt - s) / 0.35 : 0), 0);
    const sb = P(PS().sbIdle, walking ? S3.walk(lt * PI / 1.4, 0.8) : {}, { x: 0.3, z, uaR: [0.55, 0.12], elR: 1.1, jaw: lt > 6.4 && lt < 7.6 ? 1 : 0, headX: lt > 6.4 && lt < 7.6 ? -0.25 : 0.05 });
    const cam = jolt(C([0.9, 0.55, 1.4], [0.3, 1.9, z], 36), t, stp * 0.08 + (lt > 6.4 && lt < 7.4 ? 0.06 : 0.008));
    F({ env: 'barrow', t, cam, cast: [SB(sb)], envOpts: { fog: lerp(2.6, 1.3, k) } });
    if (lt > 6.4) { const [hx, hy] = proj([0.3, 2.4, z]); X.ring(lt - 6.4, { x: hx, y: hy, r1: 900, dur: 0.8, flat: 0.9 }); POST.set({ ca: 0.008 * (1 - inv(6.4, 7.4, lt)) }); }
    X.holo(lt - 1.2, 4.8, { x: 930, y: 230, w: 540, title: 'FIEND DETECTED', lines: [{ t: 'Skeletal Shieldbearer', big: true }, 'Class: Lesser  ·  Threat ▰▰▱▱▱', { t: 'Its shield has never been broken.', col: '#ffb0b0' }] });
    DUSK_POST();
  }
  // they face the monster (which stands behind the camera): Takuto screen-left, Nemu screen-right
  const TKF = { x: 0.55, z: 0.5, ry: PI }, NMF = { x: -0.7, z: 0.95, ry: PI - 0.15 };
  function faceOff(lt, d, t, o = {}) {
    const tk = P(PS().ready, TKF, { headY: V.amp('NEMU', t) > 0 ? -0.35 : 0 }, o.tk || {}), nm = P(NMF, { headY: V.amp('TAKUTO', t) > 0 ? 0.4 : 0, uaL: [0.6, 0.3], elL: 1.2, uaR: [0.6, 0.3], elR: 1.2 }, o.nm || {});
    const cam = move(lt, d, C([-0.1, 1.15, -2.6], [0, 1.2, 0.7], 32), C([-0.1, 1.15, -2.3], [0, 1.2, 0.7], 32));
    F({ env: 'barrow', t, cam: sway(cam, t, 0.004), cast: [TK(tk, t, { look: [0, 0] }), NM(nm, t, { look: [0.2, 0], ears: -0.35 })] });
    DUSK_POST();
  }
  function tkVow(lt, d, t) { // low angle, slow push: "Then stay behind me."
    const pose = P(PS().ready, TKF), hp = headOf('takuto', pose, t);
    const cam = move(lt, d, faceCam(hp, PI, 1.25, { ang: 0.25, dy: -0.35, ly: 0.02, fov: 28 }), faceCam(hp, PI, 0.9, { ang: 0.22, dy: -0.28, ly: 0.02, fov: 28 }));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { gaze: [0, 0.1] })] }); DUSK_POST();
  }
  const hitstop = (lt, hits, len = 0.11) => hits.reduce((a, h) => a - Math.max(0, Math.min(lt - h, len)), lt);
  const SBX = 3.0;
  function sparksAt(lt, h, p, o = {}) { if (lt <= h) return; const [x, y] = proj(p); X.sparks(lt - h, { x, y, n: o.n || 70, ang: o.ang ?? PI * 1.1, spread: o.spread || 2.2, speed: o.speed || 1300, color: o.color }); if (o.ring !== false) X.ring(lt - h, { x, y, r1: 600, dur: 0.45, flat: 1 }); }
  function exchange1(lt, d, t) { // sprint, leap, chop, CLANG on the shield, flip back, slide
    const hit = 2.42, a = hitstop(lt, [hit]);
    const pose = a < 1.3 ? P(S3.run(a * 15, 1.15), { x: lerp(-6, 0.3, a / 1.3), ry: FACE_R }) :
      S3.seq(a, [[1.3, P(PS().ready, { x: 0.3, ry: FACE_R })], [1.45, P(PS().crouch, { x: 0.5, ry: FACE_R })], [1.75, P(PS().leap, { x: 1.1, y: 1.1, ry: FACE_R }), 'out'], [2.15, P(PS().windup, { x: 1.6, y: 1.4, ry: FACE_R, weapon: 2.0 })], [2.42, P(PS().chop, { x: 1.9, y: 0.7, ry: FACE_R, weapon: 1.7 }), 'in'], [2.6, P(PS().chop, { x: 1.8, y: 0.8, ry: FACE_R, weapon: 1.7 })], [3.15, P(PS().leap, { x: 0.5, y: 1.5, ry: FACE_R, pitch: -3.6 }), 'out'], [3.5, P(PS().slide, { x: -0.5, ry: FACE_R, pitch: -6.28 }), 'in'], [3.9, P(PS().slide, { x: -1.0, ry: FACE_R, pitch: -6.28 }), 'out'], [4.6, P(PS().ready, { x: -1.1, ry: FACE_R, pitch: -6.28 })]]);
    pose.pitch = (pose.pitch || 0) % (2 * PI);
    const sb = P(PS().sbBrace, { x: SBX, ry: FACE_L, shield: [a > hit ? -0.3 * Math.exp(-(a - hit) * 7) : 0, 0] });
    const camx = a < 1.3 ? lerp(-5.0, 0.4, a / 1.3) : lerp(0.4, 0.9, ease.out(clamp((a - 1.3) / 1.5)));
    const cam = jolt(C([camx, 1.25, 6.4], [camx + 0.6, 1.3, 0], 34), t, lt > hit && lt < hit + 0.45 ? 0.25 * (1 - (lt - hit) / 0.45) : 0.01);
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { gaze: [0, 0], axeGlow: 0 }), SB(sb)] });
    sparksAt(lt, hit, [2.35, 1.6, 0.2]);
    if (lt > hit && lt < hit + 0.08) { G.impact('inv'); POST.set({ ca: 0.014 }); }
    fgGrass(t); DUSK_POST(); POST.set({ dir: a < 1.3 ? [0.004, 0] : [0, 0] });
  }
  function slideBack(lt, d, t) { // he skids back on one knee; the shield has not moved
    const slide = ease.out(inv(0.1, 1.4, lt)), pose = P(PS().slide, { x: lerp(-0.6, -1.7, slide), ry: FACE_R, lean: 0.3 });
    const cam = jolt(C([-3.0, 0.5, 2.4], [-0.6, 0.8, 0], 30), t, 0.05 * (1 - inv(0, 1, lt)));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { gaze: [0.4, 0] }), SB(P(PS().sbBrace, { x: SBX, ry: FACE_L }))] });
    const [x, y] = proj([lerp(-0.6, -1.7, slide), 0, 0]); X.debris(lt - 0.1, { x, y, n: 8, speed: 200, size: 5, seed: 71 });
    fgGrass(t); DUSK_POST();
  }
  function panicPair(lt, d, t) { // "Then what do I hit?!" "Nothing! We run!"
    const cam = move(lt, d, C([-1.0, 1.15, 5.6], [-2.0, 1.0, 0.6], 30), C([-1.1, 1.15, 5.2], [-2.0, 1.0, 0.6], 30));
    F({ env: 'barrow', t, cam: sway(cam, t, 0.004), cast: [TK(P(PS().ready, { x: -1.2, ry: FACE_R, headY: V.amp('TAKUTO', t) > 0 ? -0.6 : 0 }), t, { look: [-0.3, 0] }), NM(P(PS().raiseHand, { x: -3.1, z: 1.6, ry: 0.9, uaL: [1.9, 0.25], elL: 1.2 }), t, { ears: -0.4, look: [0.5, 0] })] });
    fgGrass(t); DUSK_POST();
  }
  function exchange2(lt, d, t) { // duck the claw, counter into the shield, the bash launches him
    const clang = 2.05, bash = 2.78, a = hitstop(lt, [clang, bash], 0.1);
    const swipe = ease.in(clamp((a - 1.25) / 0.35)), lunge = ease.in(clamp((a - 2.45) / 0.33)) * (1 - ease.out(clamp((a - 3.3) / 0.8)));
    const sbBase = a < 1.2 ? P(PS().sbIdle, S3.walk(a * 4, 0.6)) : S3.blend(S3.blend(PS().sbClawUp, PS().sbClawDown, swipe), PS().sbSlam, lunge);
    const sb = P(sbBase, { x: lerp(3.4, 2.9, clamp(a / 1.2)) - lunge * 0.5, ry: FACE_L, jaw: a > 2.4 && a < 3.2 ? 1 : 0 });
    const pose = S3.seq(a, [[0, P(PS().ready, { x: 0.6, ry: FACE_R })], [1.15, P(PS().ready, { x: 0.7, ry: FACE_R })], [1.32, P(PS().duck, { x: 0.9, ry: FACE_R }), 'out'], [1.65, P(PS().duck, { x: 1.0, ry: FACE_R })], [1.8, P(PS().crouch, { x: 1.2, ry: FACE_R })], [2.05, P(PS().windup, { x: 1.6, y: 0.3, ry: FACE_R, weapon: 2.0 }), 'out'], [2.25, P(PS().block, { x: 1.4, ry: FACE_R })], [2.78, P(PS().block, { x: 1.5, ry: FACE_R })], [3.0, P(PS().hit, { x: -0.4, y: 1.0, ry: FACE_R, pitch: -1.6 }), 'out'], [3.8, P(PS().hit, { x: -7, y: 0.6, ry: FACE_R, pitch: -5.5 })]]);
    const cam = jolt(C([1.0, 1.3, 6.6], [1.2, 1.3, 0], 34), t, (lt > clang && lt < clang + 0.3 ? 0.12 : 0) + (lt > bash && lt < bash + 0.5 ? 0.3 * (1 - (lt - bash) / 0.5) : 0.01));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { gaze: [0, 0] }), SB(sb)] });
    sparksAt(lt, clang, [2.0, 1.5, 0.2], { n: 50, ang: -PI * 0.6, spread: 2, speed: 1000, ring: false });
    sparksAt(lt, bash, [1.8, 1.2, 0.3], { n: 40, ang: PI, spread: 1.4, speed: 900 });
    if (lt > bash && lt < bash + 0.08) { G.impact('inv'); POST.set({ ca: 0.016 }); }
    fgGrass(t); DUSK_POST(); POST.set({ dir: a > 2.85 && a < 3.6 ? [-0.008, 0] : [0, 0] });
  }
  const CRASH = [6.6, 0, 0.3];
  const slumped = (extra = {}) => P(PS().sit, { x: 6.05, z: 0.35, ry: -HALF - 0.25, lean: -0.25, headX: 0.25, headZ: 0.15, uaR: [0.1, 0.4], elR: 0.2, weapon: 1.2 }, extra);
  function crash(lt, d, t) { // he hits a gravestone
    const fly = ease.out(clamp(lt / 0.5));
    const pose = lt < 0.5 ? P(PS().hit, { x: lerp(1.5, 6.0, fly), y: lerp(1.0, 0.5, fly), ry: FACE_R, pitch: -1.6 - fly * 1.2 }) : slumped();
    const cam = jolt(C([8.6, 1.0, 4.4], [6.2, 0.7, 0.3], 32), t, lt > 0.45 && lt < 1.1 ? 0.3 * (1 - (lt - 0.45) / 0.65) : 0.02);
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { blink: lt > 0.5 ? 1 : 0 })] });
    if (lt > 0.45) { const [x, y] = proj([6.5, 0.8, 0.3]); X.debris(lt - 0.45, { x, y, n: 46, speed: 760, size: 13, seed: 91 }); X.ring(lt - 0.45, { x, y, r1: 600, dur: 0.5, flat: 0.8 }); }
    if (lt > 0.45 && lt < 0.53) { G.impact('inv'); POST.set({ ca: 0.014 }); }
    DUSK_POST();
  }
  function dazed(lt, d, t) { // his point of view: double vision, it comes closer
    const adv = ease.io(clamp(lt / d)), wob = Math.sin(t * 1.3) * 0.02;
    const sb = P(PS().sbIdle, S3.walk(lt * 2.2, 0.6), { x: lerp(1.2, 3.8, adv), z: 0.2, ry: FACE_R });
    const cam = C([6.0, 0.75, 0.35], [3.0, 1.3, 0.1], 34, -0.12 + wob);
    F({ env: 'barrow', t, cam, cast: [SB(sb)], envOpts: { mood: 'ash' } });
    const c = G.ctx, sc = c.canvas; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.35; c.drawImage(sc, 18 + Math.sin(t * 2) * 14, 0); c.restore();
    G.fill('#000', 0.25 + 0.2 * Math.sin(t * 2.4)); POST.set({ vig: 0.8, sat: 0.6, radial: 0.015 + 0.01 * Math.sin(t * 2) });
  }
  function guillotine(lt, d, t) { // from the ground: the shield goes up
    const up = ease.io(inv(0.3, 4, lt)), sb = P(S3.blend(PS().sbIdle, PS().sbRaise, up), { x: 4.7, z: 0.15, ry: FACE_R, jaw: up * 0.8 });
    F({ env: 'barrow', t, cam: jolt(C([6.0, 0.45, 0.6], [4.6, 2.4, 0.1], 42), t, 0.02), cast: [SB(sb)] });
    G.fill('#2a0a12', 0.25); DUSK_POST();
  }
  const NEMU_STAND = { x: -1.3, z: 1.0, ry: 1.1 };
  function nemuSprint(lt, d, t) { // one runner: the camera travels with her
    const run = clamp(lt / 1.6), x = lerp(-9, -1.3, run);
    const pose = lt < 1.6 ? P(S3.run(lt * 17, 1.2), { x, z: 1.0, ry: FACE_R, lean: 0.5 }) : S3.seq(lt, [[1.6, P(PS().crouch, NEMU_STAND)], [1.9, P(PS().throw, NEMU_STAND), 'out'], [2.6, P(PS().throw, NEMU_STAND)]]);
    const camx = lerp(-8.3, -0.6, ease.out(clamp(lt / 1.9)));
    F({ env: 'barrow', t, cam: jolt(C([camx, 1.0, 5.4], [camx + 0.4, 1.0, 0.8], 34), t, 0.02), cast: [NM(pose, t, { ears: -0.4, gaze: [0, 0] }), SB(P(PS().sbRaise, { x: 4.7, z: 0.15, ry: FACE_R }))] });
    if (lt > 1.9) { const f = clamp((lt - 1.9) / 0.6), p0 = proj([-1.0, 1.6, 1.0]), p1 = proj([4.4, 2.8, 0.15]), c = G.ctx; c.fillStyle = '#1a1214'; c.beginPath(); c.arc(lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f) - Math.sin(f * PI) * 60, 6, 0, 7); c.fill(); }
    fgGrass(t); DUSK_POST(); POST.set({ dir: lt < 1.6 ? [0.005, 0] : [0, 0] });
  }
  function nemuTaunt(lt, d, t) { // "Hey! Ugly! Over here!"
    const k = ease.out5(inv(0, 0.6, lt)), thr = inv(2.3, 2.6, lt);
    const pose = P(S3.blend(PS().crouch, S3.blend({ uaL: [0.6, 0.3], elL: 1.0, uaR: [0.6, 0.3], elR: 1.0 }, PS().throw, ease.in(thr)), k), { x: lerp(-2.6, NEMU_STAND.x, k), z: NEMU_STAND.z, ry: NEMU_STAND.ry });
    const cam = C([-0.4, 1.15, 4.4], [-1.3, 1.1, 1.0], 30);
    F({ env: 'barrow', t, cam: sway(cam, t, 0.004), cast: [NM(pose, t, { ears: -0.4, look: [0.3, 0] })] });
    if (lt > 2.5) { const f = inv(2.5, 3.2, lt), p0 = proj([-1.0, 1.7, 1.0]), c = G.ctx; c.fillStyle = '#2a2026'; c.beginPath(); c.arc(lerp(p0[0], W + 40, f), p0[1] - Math.sin(f * PI) * 140, 10, 0, 7); c.fill(); }
    fgGrass(t); DUSK_POST();
  }
  function blowDown(lt, d, t) { // the shield comes down on her
    if (lt >= 1.0) { G.fill('#fff'); G.fill('#000', inv(1.4, 4, lt)); return; }
    const f = ease.in(inv(0, 1.0, lt)), sb = P(S3.blend(PS().sbRaise, PS().sbSlam, f), { x: 0.4, z: 0.7, ry: -HALF - 0.4 });
    F({ env: 'barrow', t, cam: jolt(C([-2.9, 0.55, 2.3], [-0.2, 2.0, 0.7], 40), t, 0.04), cast: [NM(P(NEMU_STAND, { ry: 2.2, headX: -0.4 }), t, { ears: -0.5, gaze: [0, -0.6] }), SB(sb)] });
    POST.set({ dir: [0, 0.006 * f] }); DUSK_POST();
  }
  function stillness(lt, d, t) { // overhead: she lies still in the ash. One paw print goes dark.
    F({ env: 'barrow', t: 3.0, cam: C([-1.25, 3.1, 1.25], [-1.3, 0, 0.3], 30, 0.3), cast: [NM(P(PS().lying, { x: -1.3, z: 1.4, y: 0.13, pitch: -HALF, ry: 0.6 }), 3.0, { blink: 1, talk: 0, breath: 0 })], envOpts: { mood: 'ash' } });
    const [x, y] = proj([-1.3, 0.1, 0.7]); G.sigilPaw(x, y - 120, 70, 3, 9, inv(1.0, 2, lt), 0.9, 2, inv(4.0, 4.6, lt));
    G.fill('#000', 0.3); G.fill('#000', 1 - inv(0, 1.2, lt)); POST.set({ sat: 0.5, vig: 0.7 });
  }
  function tremble(lt, d, t) { // close on him as something wakes up
    const k = inv(3, 10, lt);
    closeOn('takuto', lt, d, t, { pose: slumped({ headX: 0.05, headY: -0.3, headZ: 0.04 * k * Math.sin(t * 40) }), at: {}, d0: 0.72, d1: 0.5, fov: 24, ang: 0.15, e: 'in', t0: 0, t1: d, rim: mixHex('#ffae6a', '#ff2a1a', k), rimK: 0.8 + k * 0.6, envOpts: { mood: k > 0.5 ? 'blood' : undefined },
      opts: { gaze: [0.1 * Math.sin(t * 30) * k, 0.1] }, after: () => { if (lt > 4) eyeGlow('takuto', 0.35 * inv(4, 10, lt), 18); G.fill('#ff0000', 0.18 * k, 'multiply'); } });
  }
  function worldStops(lt, d, t) { // time stops: a slow partial arc around him, colour drains away
    const T0 = 3.1, pose = P(PS().kneel, { x: 5.6, z: 0.4, ry: -HALF - 0.15, lean: 0.4 }), ang = lerp(-0.9, -0.35, ease.io(clamp(lt / d)));
    F({ env: 'barrow', t: T0, cam: orbit(5.6, 0.9, 0.4, 3.4, ang + 0.6, 0.3, 32), cast: [TK(pose, T0, { axeGlow: 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 5)) * inv(0, 4, lt), gaze: [0, 0], blink: 0 }), SB(P(PS().sbSlam, { x: 0.4, z: 0.7, ry: -HALF - 0.4 })), NM(P(PS().lying, { x: -1.3, z: 1.4, y: 0.13, pitch: -HALF, ry: 0.6 }), T0, { blink: 1, talk: 0 })], envOpts: { mood: 'still' } });
    G.desat(0.7); const c = G.ctx; c.save(); c.translate(0, 220); G.drawCrack(t, inv(1, 7.5, lt), 1.3); c.restore();
    POST.set({ sat: 0.25, con: 1.2, bloom: 0.8, thr: 0.4 });
  }
  function mindscapeTK(lt, d, t) { // Takuto, small, in the red dark (drawn over the 2D vision of Akuro)
    F({ env: 'void', only: 'cast', t, cam: C([1.6, 1.0, 5.4], [1.6, 1.0, 0], 30), cast: [TK(P(PS().drag, { x: -0.6, ry: 0.5 }), t, { wind: 1.5, gaze: [0.4, -0.3], axeGlow: 0.5 })], rim: '#ff2a1a', rimK: 1.3 });
  }
  function eyesRed(lt, d, t) {
    closeOn('takuto', lt, d, t, { env: 'void', pose: PS().drag, at: { ry: 0 }, d0: 1.3, d1: 1.1, fov: 22, ang: 0, dy: -0.01, rim: '#ff2a1a', rimK: 0.8, opts: { gaze: [0, 0], blink: 0, axeGlow: 1 }, after: () => { eyeGlow('takuto', 0.95, 32); G.motes(t, { n: 50, vy: -70, color: '#ff6a3a', size: 2.6, seed: 21 }); POST.set({ bloom: 0.9, thr: 0.5 }); } });
  }
  function awaken(lt, d, t) { // close on the hand and the axe as the Brand wakes
    const pose = P(PS().drag, { x: 5.6, z: 0.4, ry: -HALF - 0.15, uaR: [0.25 + Math.sin(t * 30) * 0.004 * (1 - inv(4, 5, lt)), 0.15] });
    S3.place('takuto', pose, t); const h = S3.jointPos('takuto', 'handR'), tip = S3.weaponTip('takuto', -0.9);
    const cam = jolt(move(lt, d, C([3.3, 1.35, 2.7], [5.5, 0.95, 0.4], 30), C([3.7, 1.3, 2.3], [5.5, 0.95, 0.4], 28), { e: 'linear', t0: 0, t1: d }), t, lt < 1.2 ? 0.05 * (1 - lt / 1.2) : lt < 4.3 ? 0.006 + lt * 0.003 : 0.006);
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { axeGlow: inv(0.5, 4, lt) })], envOpts: { mood: 'blood' } });
    const [sx, sy] = proj(h); G.radial(sx, sy, 300, 'rgba(255,40,20,0.28)', 'rgba(255,0,0,0)', inv(0, 1.5, lt), 'lighter');
    if (lt < 4.4) X.converge(t, { x: sx, y: sy, r: 600, n: 110, a: inv(0, 1.5, lt) });
    G.sigilAxe(sx, sy, 90, inv(0.4, 4.2, lt), t, '#ff4a3a', 1 - inv(5, 6, lt));
    if (lt > 4.3 && lt < 4.6) POST.set({ flash: inv(4.3, 4.6, lt) });
    if (lt > 4.6) { POST.set({ flash: 1 - inv(4.6, 5.4, lt) }); G.fill('#100004', 0.55 * inv(4.6, 5.2, lt));
      X.holo(lt - 4.8, 5.5, { x: 640, y: 360, w: 820, title: 'BRAND AWAKENED', color: '#ff2a3a', lh: 48, lines: [{ t: 'ルインブレイカー', c: true, huge: true }, { t: 'R U I N B R E A K E R', c: true, big: true, col: '#ffd6d6' }, { t: 'Rank: unreadable', c: true, col: '#ff9a9a' }, { t: 'Whatever it strikes, breaks.', c: true }], cps: 30 }); }
    BLOOD_POST(); POST.set({ bloom: 1.3, thr: 0.4, ca: 0.003 + (lt > 4.3 && lt < 5 ? 0.01 : 0) });
    if (lt > 4.3) X.ring(lt - 4.3, { x: 640, y: 360, r1: 900, dur: 0.8, flat: 1, color: '#ff8a7a' });
  }
  function power(lt, d, t) { // low hero angle: he stands, the axe burning
    const rise = ease.out(inv(0, 2.5, lt)), pose = P(S3.blend(PS().kneel, PS().drag, rise), { x: 5.6, z: 0.4, ry: -HALF - 0.6, headX: lerp(0.35, 0, rise) });
    const cam = jolt(move(lt, d, C([3.6, 0.45, 2.6], [5.6, 1.2, 0.4], 32), C([4.1, 0.5, 2.2], [5.6, 1.35, 0.4], 30)), t, 0.01 + (1 - rise) * 0.03);
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { wind: 3.2, axeGlow: 1, gaze: [0, 0] })], envOpts: { mood: 'blood' } });
    eyeGlow('takuto', 0.9 * rise, 14);
    const tp = proj(S3.weaponTip('takuto', 1.0)); for (let i = 0; i < 3; i++) X.bolt(t + i, tp[0], tp[1], tp[0] + (hash(i + G.twos(t, 8), 2) - 0.5) * 300, tp[1] + (hash(i + G.twos(t, 8), 3) - 0.3) * 260, { color: '#ff9a8a', a: 0.6, seed: i * 9 });
    const c = G.ctx; for (let i = 0; i < 14; i++) { const ph = (t * 0.25 + hash(i, 3)) % 1, x = 200 + hash(i, 4) * 880, y = 700 - ph * 500; c.save(); c.translate(x, y); c.rotate(t * (hash(i, 5) - 0.5) * 2); c.globalAlpha = Math.sin(ph * PI) * 0.9; c.fillStyle = '#2a1418'; const r = 4 + hash(i, 6) * 12; c.fillRect(-r, -r * 0.6, r * 2, r * 1.2); c.restore(); }
    G.motes(t, { n: 140, vy: -130, vx: 25, color: '#ff7a3a', size: 2.6, seed: 17 }); BLOOD_POST();
  }
  function sbBraces(lt, d, t) {
    const br = ease.out(inv(0.5, 1.5, lt)), sb = P(S3.blend(PS().sbIdle, PS().sbBrace, br), { x: 2.6, z: 0.1, ry: -HALF + 0.35, jaw: lt > 2 && lt < 3.4 ? 1 : 0 });
    F({ env: 'barrow', t, cam: jolt(C([-0.9, 1.0, 4.8], [2.6, 1.5, 0.1], 32), t, lt > 0.5 && lt < 1.2 ? 0.08 : 0.01), cast: [SB(sb)], envOpts: { mood: 'blood' } });
    BLOOD_POST();
  }
  function climax(lt, d, t, H1) { // vanish, zig-zag, leap over the sweep in slow motion, crescent strike
    const a = lt < 1.5 ? lt : lt < 3.5 ? 1.5 + (lt - 1.5) * 0.25 : lt < H1 ? 2.0 + (lt - 3.5) * 1.0 : lt < H1 + 0.18 ? 2.35 : 2.35 + (lt - H1 - 0.18);
    const sweep = ease.in(clamp((a - 1.3) / 0.35)), SX = 2.6;
    const sb = P(PS().sbBrace, { x: SX, ry: FACE_L, shield: [sweep * 1.1 * (1 - clamp((a - 2.1) / 0.3)), 0], twist: sweep * 0.5, jaw: a > 1.3 && a < 2.1 ? 1 : 0, headX: a > 2.0 ? -0.3 : 0 });
    const keys = [[0, P(PS().crouch, { x: -4, ry: FACE_R })], [0.7, P(PS().crouch, { x: -4, ry: FACE_R })], [0.75, P(PS().ready, { x: -1.6, ry: FACE_R }), 'out'], [0.95, P(PS().ready, { x: -1.6, ry: FACE_R })], [1.0, P(PS().ready, { x: -2.8, ry: FACE_R }), 'out'], [1.15, P(PS().ready, { x: -2.8, ry: FACE_R })], [1.25, P(PS().crouch, { x: 0.3, ry: FACE_R }), 'out'], [1.45, P(PS().crouch, { x: 0.4, ry: FACE_R })],
      [1.8, P(PS().leap, { x: 1.2, y: 2.0, ry: FACE_R, pitch: -1.6 }), 'out'], [2.0, P(PS().windup, { x: 1.9, y: 2.6, ry: FACE_R, pitch: -6.28, weapon: 2.0 })], [2.35, P(PS().chop, { x: 2.4, y: 1.1, ry: FACE_R, pitch: -6.28, weapon: 1.7 }), 'in'], [2.6, P(PS().slide, { x: 4.0, ry: FACE_R, pitch: -6.28 }), 'in'], [3.2, P(PS().slide, { x: 4.5, ry: FACE_R, pitch: -6.28 }), 'out']];
    const pose = S3.seq(a, keys); pose.pitch = (pose.pitch || 0) % (2 * PI);
    const vis = !(a > 0.7 && a < 0.75) && !(a > 0.95 && a < 1.0) && !(a > 1.15 && a < 1.25);
    // camera: side wide; through the slow motion a partial arc toward his front; snap back for the strike
    const arc = lt < 1.5 ? 0 : lt < 3.5 ? ease.io((lt - 1.5) / 2) * 0.7 : lerp(0.7, 0, ease.out(clamp((lt - 3.5) / 0.35)));
    const cx = lerp(0, 1.6, clamp(a / 2.4)), cy = 1.4 + clamp((a - 1.45) / 0.8) * 0.8 * (1 - clamp((a - 2.35) / 0.4));
    const cam = jolt(orbit(cx, cy, 0, lerp(7.2, 5.0, arc / 0.7), arc, -0.1, lerp(34, 30, arc / 0.7)), t, (lt > H1 && lt < H1 + 0.8 ? 0.35 * (1 - (lt - H1) / 0.8) : 0.012) + (lt < 0.8 ? lt * 0.02 : 0));
    S3.crack(clamp((lt - H1) / 0.9));
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { axeGlow: 1, visible: vis, gaze: [0, 0] }), SB(sb)], envOpts: { mood: 'blood' } });
    if (a > 1.45 && a < 2.4) [0.06, 0.12, 0.18].forEach((dt, i) => { const gp = S3.seq(a - dt * (lt > 1.5 && lt < 3.5 ? 1 : 2), keys); gp.pitch = (gp.pitch || 0) % (2 * PI); F({ env: 'barrow', only: 'cast', t, cam, cast: [TK(gp, t, { axeGlow: 1 })], alpha: 0.28 - i * 0.07 }); });
    [[0.7, -4, -1.6], [0.95, -1.6, -2.8], [1.15, -2.8, 0.3]].forEach(([t0, x0, x1]) => { const f = clamp((a - t0) / 0.12); if (f > 0 && f < 1.6) { const p0 = proj([x0, 1.0, 0]), p1 = proj([lerp(x0, x1, Math.min(1, f)), 1.0, 0]), c = G.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,60,40,' + (1 - f / 1.6) + ')'; c.lineWidth = 22 * (1 - f / 1.6); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); c.restore(); } });
    const hitP = proj([2.3, 1.6, 0.3]);
    if (lt > 3.5) X.slash(lt - 3.55, { x: hitP[0] - 20, y: hitP[1] - 120, r: 380, a0: -2.4, a1: 0.95, dur: 0.22, hold: 0.9, w: 130, flat: 0.75, rot: 0.15 });
    if (lt > H1) { X.ring(lt - H1, { x: hitP[0], y: hitP[1], r1: 1300, dur: 0.9, flat: 1, color: '#ffd0c0' }); X.sparks(lt - H1, { x: hitP[0], y: hitP[1], n: 120, ang: -0.4, spread: 3.2, speed: 1700, color: '#ffc29a' }); const gp = proj([SX, 0, 0]); X.debris(lt - H1, { x: gp[0], y: gp[1], n: 46, speed: 1000, size: 13, seed: 99 }); }
    if (lt > H1 && lt < H1 + 0.06) { G.fill('#fff'); POST.set({ ca: 0.02 }); }
    else if (lt > H1 + 0.06 && lt < H1 + 0.12) { G.impact('inv'); POST.set({ ca: 0.02 }); }
    if (lt > 1.5 && lt < 3.5) POST.set({ sat: 0.6, radial: 0.012, ca: 0.005 });
    BLOOD_POST(); POST.set({ bloom: 1.2, thr: 0.45, dir: a < 1.3 && a > 0.7 ? [0.01, 0] : [0, 0] });
  }
  function shatter(lt, d, t) { // it falls apart along the line of the cut
    const sep = ease.out(inv(0.1, 2.2, lt)), fade = inv(1.4, 3.8, lt);
    const cam = jolt(C([1.6, 1.3, 6.2], [2.6, 1.4, 0], 34), t, 0.15 * (1 - inv(0, 1.2, lt)));
    S3.crack(1 - inv(0, 0.6, lt));
    F({ env: 'barrow', t, cam, cast: [TK(P(PS().drag, { x: 4.6, z: -0.3, ry: -0.4 + PI }), t, { axeGlow: 0.8 * (1 - inv(0, 3, lt)) })], envOpts: { mood: 'blood' } });
    const g = tmpCtx(); F({ env: 'barrow', only: 'cast', t: 4, cam, cast: [SB(P(PS().sbBrace, { x: 2.6, ry: FACE_L }))], ctx: g, envOpts: { mood: 'blood' } });
    const c = G.ctx, K = G.K, s0 = [380, -60], s1 = [1100, 900], nx = 0.78, ny = -0.62;
    [1, -1].forEach(sgn => { c.save(); c.beginPath(); if (sgn > 0) { c.moveTo(s0[0] - 1240, s0[1] - 1560); c.lineTo(s1[0] + 1240, s1[1] + 1560); c.lineTo(s1[0] + 4000, -3000); } else { c.moveTo(s0[0] - 1240, s0[1] - 1560); c.lineTo(s1[0] + 1240, s1[1] + 1560); c.lineTo(-3000, 3000); }
      c.closePath(); c.clip(); c.translate(sgn * nx * 70 * sep, sgn * ny * 70 * sep + sep * 40); c.globalAlpha = 1 - fade; c.drawImage(tmp, 0, 0, W, H); c.restore(); });
    const sl = 1 - inv(0.6, 2.4, lt); c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[48, 'rgba(255,30,20,0.25)'], [18, 'rgba(255,60,40,0.6)'], [5, 'rgba(255,245,235,1)']].forEach(([lw, col]) => { c.globalAlpha = sl; c.strokeStyle = col; c.lineWidth = lw * (0.6 + sl * 0.4); c.beginPath(); c.moveTo(s0[0], s0[1]); c.lineTo(s1[0], s1[1]); c.stroke(); }); c.restore();
    for (let i = 0; i < 60; i++) { const a = hash(i, 3) * PI * 2, v = 300 + hash(i, 4) * 800, x = 760 + Math.cos(a) * v * lt, y = 420 + Math.sin(a) * v * lt + 500 * lt * lt, r = 6 + hash(i, 5) * 20; if (y > H + 50) continue; c.save(); c.translate(x, y); c.rotate(lt * (hash(i, 6) - 0.5) * 12); c.globalAlpha = 1 - inv(1.2, 2.6, lt); c.fillStyle = hash(i, 7) < 0.5 ? '#6a5a50' : '#3a302c'; c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(r * 0.6, -r); c.lineTo(r, r * 0.5); c.lineTo(-r * 0.2, r); c.fill(); c.restore(); }
    G.motes(t, { n: 180, vy: -40 - 60 * fade, vx: 30, wob: 60, size: 2.6, color: '#2a2224', a: inv(0.8, 2, lt) * (1 - inv(4.5, 6, lt)), glow: false, seed: 23, x0: 500, x1: 1100, y0: 100, y1: 700 });
    X.ring(lt, { x: 760, y: 420, r1: 1200, dur: 1.0, flat: 1, color: '#ffd0c0' });
    BLOOD_POST(); POST.set({ bloom: 1.3, thr: 0.4, flash: 0.8 * (1 - inv(0, 0.3, lt)) });
  }
  function ashFall(lt, d, t) { // ash comes down like snow; the glow goes out of the axe
    const settle = ease.io(inv(0, 4, lt)), pose = P(PS().drag, { x: 4.6, z: -0.3, ry: -0.7, headX: 0.15 * settle, uaR: [0.12 - 0.05 * settle, 0.15] });
    const cam = move(lt, d, C([3.1, 1.25, 3.6], [4.6, 1.15, -0.3], 32), C([3.3, 1.3, 3.1], [4.6, 1.2, -0.3], 32), { e: 'linear', t0: 0, t1: d });
    F({ env: 'barrow', t, cam, cast: [TK(pose, t, { axeGlow: 0.8 * (1 - settle), breath: 2.2, gaze: gz(t, 13, [-0.2, 0.3]) })], envOpts: { mood: 'ash' } });
    G.motes(t, { n: 160, vy: 30, vx: 8, wob: 40, size: 2.2, color: '#d9d0d0', a: 0.55, glow: false, seed: 27 }); fgGrass(t);
    DUSK_POST(); POST.set({ sat: 0.75, bloom: 0.6 });
  }
  function tkClaps(lt, d, t) { // "Takuto. Kirishima Takuto." — then slow clapping off to the right
    const turn = ease.io(inv(3.6, 4.4, lt));
    closeOn('takuto', lt, d, t, { pose: P(PS().drag, { headY: -0.6 * turn }), d0: 1.0, fov: 28, envOpts: { mood: 'ash' }, opts: { gaze: turn > 0.3 ? [-0.7, 0] : gz(t, 11, [0.5, 0]) }, locked: true });
  }
  const SIEGP = (extra = {}) => P({ uaL: [0.25, 0.1], elL: 1.35, weapon: 0 }, extra);
  function siegWalk(lt, d, t) { // Sieg Valen walks in from the right
    const k = ease.out(inv(0, 3.2, lt)), walking = 1 - inv(2.6, 3.4, lt);
    const pose = SIEGP(P(S3.walk(t * 4.2, walking), { x: lerp(7.5, 3.3, k), z: 0.9, ry: -HALF - 0.5, uaL: [0.25, 0.1], elL: 1.35 }));
    const cam = move(lt, d, C([2.0, 1.4, 5.8], [5.5, 1.4, 0.9], 32), C([1.6, 1.4, 5.6], [3.6, 1.5, 0.9], 32), { t0: 0, t1: 3.4 });
    F({ env: 'barrow', t, cam, cast: [SG(pose, t, { look: [0.4, 0] })], envOpts: { mood: 'ash' } });
    fgGrass(t);
    X.holo(lt - 1.2, 6.4, { x: 330, y: 220, w: 460, title: 'HUNTER', color: '#5f9dff', accent: '#d6e6ff', lines: [{ t: 'Sieg Valen', big: true }, 'Rank A  ·  "The Laughing Blade"', { t: 'Brand: Afterimage', col: '#bcd4ff' }] });
    DUSK_POST(); POST.set({ sat: 0.85 });
  }
  const sgClose = (o = {}) => (lt, d, t) => closeOn('sieg', lt, d, t, { pose: SIEGP(o.pose || {}), at: { x: 3.3, z: 0.9, ry: -HALF - 0.5 }, ang: -0.35, envOpts: { mood: 'ash' }, ...o, opts: { look: [0.5, 0], ...(o.opts || {}) } });
  function siegLaugh(lt, d, t) {
    const laugh = V.amp('SIEG', t) > 0 && lt < 2 ? 1 : 0;
    sgClose({ pose: { headX: laugh ? -0.25 + Math.sin(t * 20) * 0.04 : 0.03, weapon: Math.sin(t * 0.8) * 0.05 }, d0: 2.2, dy: -0.35, fov: 30 })(lt, d, t);
  }
  function riftEye(lt, d, t) { // the three of them under the open rift; something inside looks back
    const cam = move(lt, d, C([1.0, 0.7, 4.8], [1.5, 2.0, 0], 34), C([1.0, 0.6, 4.8], [1.2, 6.0, -12], 40));
    F({ env: 'barrow', t, cam, cast: [TK(P(PS().drag, { x: 0.6, z: 0.2, ry: PI + 0.2, headX: -0.4 }), t), NM(P({ x: -0.4, z: 0.6, ry: PI - 0.2, headX: -0.4 }), t), SG(SIEGP({ x: 2.2, z: 0.4, ry: PI - 0.4, headX: -0.4 }), t)], envOpts: { mood: 'ash' } });
    rift(t, -0.05, 0.42, { open: 1, w: 520, h: 150, eye: inv(3.5, 4.5, lt) * (lt > 6.4 && lt < 6.6 ? 0.1 : 1) });
    DUSK_POST(); POST.set({ bloom: 1.0, thr: 0.45 });
  }
  function akuroLast(lt, d, t) { // "We're going to have so much fun, you and I."
    const amp = V.amp('AKURO', t);
    closeOn('takuto', lt, d, t, { pose: PS().drag, at: { x: 0.6, z: 0.2, ry: 0.3 }, d0: 1.1, d1: 0.9, fov: 26, ang: -0.3, rim: mixHex('#ffae6a', '#ff2a1a', 0.4 + amp * 0.6), rimK: 0.9 + amp, envOpts: { mood: 'ash' },
      after: (lt2, d2) => { const h = proj(S3.jointPos('takuto', 'handR')); G.sigilAxe(h[0], h[1], 80, 1, t, '#ff4a3a', 0.25 + 0.2 * Math.sin(t * 2.5) + amp * 0.5); G.fill('#000', inv(d2 - 2.4, d2 - 0.5, lt2)); POST.set({ bloom: 0.9 + amp, thr: 0.45 }); } });
  }
  function sableTag(lt, d, t) { // after the credits: a man made of static by the broken gate
    const cam = move(lt, d, C([-3.0, 1.4, 8.4], [2.0, 1.3, -1.0], 30), C([-2.6, 1.4, 7.6], [2.2, 1.4, -1.0], 26), { e: 'linear', t0: 0, t1: d });
    F({ env: 'earth', t, cam, cast: [], envOpts: { gate: 1, cat: true, catUp: true, catRy: 0.6, lamps: lt > 9.5, bag: true } });
    F({ env: 'earth', only: 'cast', t, cam, cast: [['sable', { x: 2.4, z: -1.6, ry: -0.5, uaR: [lt > 9 ? 0.4 + Math.sin(t * 4) * 0.15 : 0.05, 0.15], elR: 0.3 }, {}]], alpha: ease.out(inv(1.5, 3.5, lt)), envOpts: { lamps: lt > 9.5 } });
    const e = proj(S3.jointPos('sable', 'head', 0.16)); G.radial(e[0] - 4, e[1], 26, 'rgba(230,240,255,0.95)', 'rgba(150,170,255,0)', inv(3.5, 4.2, lt) * (0.7 + 0.3 * Math.sin(t * 25)), 'lighter');
    rainFX(t, 0.5); NIGHT_POST(); G.fill('#000', 1 - inv(0, 1.5, lt)); G.fill('#000', inv(d - 1.5, d, lt));
  }

  return { coldEyes, coldHero, earthWide, earthCat, earthFace, earthFeed, earthAlert, earthSky, earthSmash, earthRift, earthLand, earthRaise, earthDive, earthAfter,
    barrowOpen, barrowWake, barrowHand, barrowRise, nemuWake, twoShot, otsNemu, tkClose, nmClose, tkAxe, headsmanGrave, nemuSigil, riftThin, bellsTurn, sbRise,
    sbWalk, faceOff, tkVow, exchange1, slideBack, panicPair, exchange2, crash, dazed, guillotine, nemuSprint, nemuTaunt, blowDown, stillness, tremble, worldStops,
    mindscapeTK, eyesRed, awaken, power, sbBraces, climax, shatter, ashFall, tkClaps, siegWalk, sgClose, siegLaugh, riftEye, akuroLast, sableTag, slumped };
})();
