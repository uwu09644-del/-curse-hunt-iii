/* RUINBREAKER — full-body action figures for fight cuts.
   Side-view silhouettes with real joints (two-bone legs and arms, flipping torso, flowing coat and hair),
   rim light from the sky, afterimages, and the Headsman's Axe in hand. Keyframed with easing,
   with procedural run cycles. Units: a standing figure is ~260 px tall at scale 1. */
'use strict';

const FIGHT = (() => {
  const G = GFX, { lerp, clamp, ease } = G;
  const D = { torso: 76, neck: 7, head: 19, thigh: 66, shin: 64, foot: 22, ua: 47, fa: 45 };
  const BASE = { x: 0, y: 0, f: 1, lean: 0.06, rot: 0, head: 0, aF: 0.18, kF: 0.12, aB: -0.14, kB: 0.1, sF: -0.35, eF: -1.2, sB: 0.15, eB: -0.5, axe: -2.2, vx: 0, crouch: 0, tail: 0 };
  const POSES = {
    stand: {},
    ready: { lean: 0.22, aF: 0.45, kF: 0.6, aB: -0.35, kB: 0.5, crouch: 18, sF: 0.5, eF: -1.4, axe: -0.6 },
    crouch: { lean: 0.45, aF: 1.1, kF: 1.9, aB: -0.2, kB: 1.5, crouch: 58, sF: 0.6, eF: -1.0, sB: -0.4, axe: -0.3 },
    leap: { lean: 0.15, aF: 0.9, kF: 1.5, aB: 0.1, kB: 1.7, sF: -0.6, eF: -1.4, axe: -2.6 },
    windup: { lean: -0.12, aF: 0.6, kF: 1.2, aB: -0.3, kB: 1.4, sF: -2.9, eF: -0.4, sB: -2.6, eB: -0.5, axe: -4.2, head: -0.15 },
    chop: { lean: 0.55, aF: 0.95, kF: 1.2, aB: -0.5, kB: 0.8, sF: 1.0, eF: 0.15, sB: 0.8, eB: 0.2, axe: 0.9, head: 0.15 },
    duck: { lean: 0.85, aF: 1.3, kF: 2.2, aB: -0.1, kB: 1.9, crouch: 78, sF: 0.2, eF: -1.6, axe: 0.2, head: 0.3 },
    slide: { lean: 0.3, aF: 1.3, kF: 1.2, aB: -0.9, kB: 2.3, crouch: 70, sF: 0.9, eF: -0.6, sB: -1.2, eB: -0.3, axe: 0.4 },
    hit: { lean: -0.6, aF: 0.6, kF: 0.6, aB: 1.2, kB: 0.4, sF: -1.8, eF: 0.4, sB: -2.4, eB: 0.2, axe: -3.6, head: -0.5 },
    block: { lean: 0.1, aF: 0.4, kF: 0.6, aB: -0.4, kB: 0.6, crouch: 22, sF: -1.3, eF: -1.6, sB: -1.1, eB: -1.9, axe: -1.6 },
    spin: { lean: 0.2, aF: 1.4, kF: 2.4, aB: 1.2, kB: 2.4, sF: -0.4, eF: -0.6, sB: -0.2, eB: -0.8, axe: -1.0, crouch: 0 },
    nemuDash: { lean: 0.55, aF: 0.9, kF: 0.9, aB: -0.9, kB: 1.6, sF: -1.2, eF: -0.4, sB: 1.2, eB: -0.6, tail: 0.8 },
    nemuThrow: { lean: 0.25, aF: 0.6, kF: 0.6, aB: -0.6, kB: 0.4, sF: 1.6, eF: 0.2, sB: -1.0, eB: -0.6, tail: 0.3 },
  };
  const mk = name => ({ ...BASE, ...(POSES[name] || {}) });
  function blend(a, b, k) { const o = {}; for (const key in a) o[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : a[key]; return o; }
  // keys: [[t, poseNameOrObject, {x,y,rot,...overrides}, easeName]]
  function seq(t, keys) {
    const P = keys.map(([kt, p, ov, e]) => [kt, { ...(typeof p === 'string' ? mk(p) : { ...BASE, ...p }), ...(ov || {}) }, e]);
    if (t <= P[0][0]) return P[0][1];
    for (let i = 1; i < P.length; i++) if (t <= P[i][0]) { const k = (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]), ef = ease[P[i][2] || 'io'] || ease.io; return blend(P[i - 1][1], P[i][1], ef(clamp(k))); }
    return P[P.length - 1][1];
  }
  function run(ph, o = {}) { // side-view sprint
    const s = Math.sin(ph), c = Math.cos(ph);
    return { ...BASE, lean: 0.32, aF: 0.85 * s, kF: 0.35 + 1.35 * Math.max(0, -c * 0.5 + 0.5) * (s > 0 ? 0.5 : 1.2), aB: -0.85 * s, kB: 0.35 + 1.35 * Math.max(0, c * 0.5 + 0.5) * (s < 0 ? 0.5 : 1.2),
      sF: -0.9 * s - 0.2, eF: -1.5, sB: 0.9 * s, eB: -1.3, crouch: 6 + 8 * Math.abs(c), axe: -1.9 + 0.2 * s, ...o };
  }

  /* ---------- kinematics ---------- */
  function joints(p, s) {
    const f = p.f, P = [0, -(D.thigh + D.shin) * 0.97 + p.crouch];
    const dir = (a, l) => [Math.sin(a) * l * f, -Math.cos(a) * l];
    const down = (a, l) => [Math.sin(a) * l * f, Math.cos(a) * l];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const C = add(P, dir(p.lean, D.torso)), N = add(C, dir(p.lean, D.neck)), Hd = add(N, dir(p.lean + p.head, D.head));
    const S = add(C, down(p.lean, 6));
    const leg = (a, k) => { const K = add(P, down(a, D.thigh)), A = add(K, down(a - k, D.shin)); return [K, A, add(A, [Math.cos(a - k) * D.foot * f, Math.sin(a - k) * D.foot * 0.3])]; };
    const arm = (sa, eb) => { const E = add(S, down(sa, D.ua)), Wr = add(E, down(sa + eb, D.fa)); return [E, Wr]; };
    return { P, C, N, Hd, S, LF: leg(p.aF, p.kF), LB: leg(p.aB, p.kB), AF: arm(p.sF, p.eF), AB: arm(p.sB, p.eB) };
  }

  /* ---------- drawing ---------- */
  function limb(c, a, b, w0, w1) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    c.beginPath(); c.moveTo(a[0] + nx * w0, a[1] + ny * w0); c.lineTo(b[0] + nx * w1, b[1] + ny * w1); c.arc(b[0], b[1], w1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI);
    c.lineTo(a[0] - nx * w0, a[1] - ny * w0); c.arc(a[0], a[1], w0, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI); c.closePath(); c.fill();
  }
  function body(c, p, J, t, style, back) {
    const f = p.f, flap = Math.sin(t * 13) * 0.5 + 0.5, vx = clamp(Math.abs(p.vx) / 900, 0, 1);
    const L = back ? J.LB : J.LF, A = back ? J.AB : J.AF;
    if (back) { // back leg + back arm
      limb(c, J.P, L[0], style.thighW, style.kneeW); limb(c, L[0], L[1], style.kneeW, style.ankleW); limb(c, L[1], L[2], style.ankleW * 1.15, style.ankleW * 0.9);
      limb(c, J.S, A[0], style.armW * 0.9, style.armW * 0.8); limb(c, A[0], A[1], style.armW * 0.8, style.armW * 0.62);
      return;
    }
    // coat / torso
    if (style.coat) {
      const tailLen = 92 + 30 * vx, tailAng = p.lean + (0.25 + 0.9 * vx + 0.15 * flap * vx) * -1, tb = [J.P[0] + Math.sin(tailAng) * tailLen * f - 14 * f, J.P[1] + Math.cos(tailAng) * tailLen];
      c.beginPath(); c.moveTo(J.S[0] - 21 * f, J.S[1] - 6); c.lineTo(J.S[0] + 19 * f, J.S[1] - 3);
      c.lineTo(J.P[0] + 21 * f, J.P[1] + 10); c.quadraticCurveTo(J.P[0] + 6 * f, J.P[1] + 40, tb[0] + 26 * f, tb[1]); c.lineTo(tb[0], tb[1] + 6);
      c.quadraticCurveTo(J.P[0] - 34 * f, J.P[1] + 20, J.P[0] - 23 * f, J.P[1] - 4); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(J.N[0] - 12 * f, J.N[1] + 10); c.lineTo(J.N[0] - 10 * f, J.N[1] - 16); c.lineTo(J.N[0] + 12 * f, J.N[1] - 10); c.lineTo(J.N[0] + 14 * f, J.N[1] + 12); c.closePath(); c.fill(); // high collar
    } else {
      limb(c, J.P, J.C, 15, 13);
      c.beginPath(); c.ellipse(J.P[0], J.P[1] + 6, 24, 16, p.lean, 0, 7); c.fill(); // baggy pants top
    }
    // head + hair
    c.beginPath(); c.arc(J.Hd[0], J.Hd[1], D.head, 0, 7); c.fill();
    if (style.hair === 'spiky') {
      for (let i = 0; i < 7; i++) {
        const a = -2.4 + i * 0.42 + (p.lean + p.head) + Math.sin(t * 7 + i) * 0.08 * (0.3 + vx), back = -f * (0.35 + 0.6 * vx), len = 18 + (i % 2) * 10 + vx * 10;
        const bx = J.Hd[0] + Math.cos(a) * 12 * f, by = J.Hd[1] + Math.sin(a) * 12, tx = bx + (Math.cos(a) * f * 0.5 + back) * len, ty = by + Math.sin(a) * len * 0.7 - 4;
        c.beginPath(); c.moveTo(bx - 5, by); c.lineTo(tx, ty); c.lineTo(bx + 5, by + 3); c.closePath(); c.fill();
      }
    } else if (style.hair === 'cat') {
      [[-0.5, 1], [0.35, 1]].forEach(([o]) => { const a = -Math.PI / 2 + o + p.head, bx = J.Hd[0] + Math.cos(a) * 14 * f, by = J.Hd[1] + Math.sin(a) * 14; c.beginPath(); c.moveTo(bx - 7, by + 2); c.lineTo(bx + Math.cos(a) * 16 * f, by + Math.sin(a) * 16); c.lineTo(bx + 7, by + 2); c.closePath(); c.fill(); });
      c.beginPath(); c.ellipse(J.Hd[0] - 4 * f, J.Hd[1] + 4, 19, 15, 0, 0, 7); c.fill();
      c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); const tw = Math.sin(t * 6) * 10, ta = p.tail; c.moveTo(J.P[0] - 10 * f, J.P[1]); c.bezierCurveTo(J.P[0] - (40 + 20 * ta) * f, J.P[1] + 10, J.P[0] - (60 + 30 * ta) * f, J.P[1] - 30 + tw, J.P[0] - (52 + 34 * ta) * f, J.P[1] - 60 + tw); c.strokeStyle = c.fillStyle; c.stroke();
    }
    // front leg + arm
    limb(c, J.P, L[0], style.thighW, style.kneeW); limb(c, L[0], L[1], style.kneeW, style.ankleW); limb(c, L[1], L[2], style.ankleW * 1.25, style.ankleW);
    limb(c, J.S, A[0], style.armW, style.armW * 0.88); limb(c, A[0], A[1], style.armW * 0.88, style.armW * 0.68);
  }
  const STYLES = {
    takuto: { coat: true, hair: 'spiky', thighW: 15, kneeW: 12, ankleW: 10, armW: 12, axe: true, rim: '#ff5236' },
    nemu: { coat: false, hair: 'cat', thighW: 17, kneeW: 15, ankleW: 10, armW: 9, axe: false, rim: '#9fd0ff' },
  };
  // draw a figure. o: { x, y (ground), s, t, pose, style, ink, rim, light:[dx,dy], glow, axeGlow, alpha }
  function draw(o) {
    const c = G.ctx, st = STYLES[o.style || 'takuto'], p = o.pose, s = o.s || 1, J = joints(p, s);
    const ink = o.ink || '#07030a', rim = o.rim || st.rim, light = o.light || [-1, -0.6];
    const pass = (col, dx, dy) => {
      c.save(); c.translate(o.x + p.x + dx, o.y + p.y + dy); c.scale(s, s);
      const pv = J.P; c.translate(pv[0], pv[1]); c.rotate(p.rot * p.f); c.translate(-pv[0], -pv[1]);
      c.fillStyle = col; c.strokeStyle = col; c.globalAlpha = o.alpha ?? 1;
      body(c, p, J, o.t, st, true);
      body(c, p, J, o.t, st, false);
      c.restore();
    };
    if (o.glow) { c.save(); c.shadowColor = o.glow; c.shadowBlur = 26 * G.K * s; pass(o.glow, 0, 0); c.restore(); }
    pass(rim, light[0] * 2.6 * s, light[1] * 2.6 * s);
    pass(ink, 0, 0);
    if (st.axe) { // the Headsman's Axe in the front hand
      const pv = J.P, ang = p.rot * p.f, cs = Math.cos(ang), sn = Math.sin(ang), wr = J.AF[1];
      const rx = pv[0] + (wr[0] - pv[0]) * cs - (wr[1] - pv[1]) * sn, ry = pv[1] + (wr[0] - pv[0]) * sn + (wr[1] - pv[1]) * cs;
      const gx = o.x + p.x + rx * s, gy = o.y + p.y + ry * s, axS = 0.17 * s, aa = (p.f > 0 ? p.axe : Math.PI - p.axe) + ang;
      G.fig('axe', gx, gy, 0, 0, axS, { sil: ink, silA: 1, rot: aa, glow: { c: o.axeGlow ? '#ff3a2a' : rim, a: o.axeGlow ?? 0.7, r: 14 }, a: o.alpha ?? 1 });
      return { grip: [gx, gy], axeAng: aa, axeTip: [gx + Math.cos(aa) * 120 * s, gy + Math.sin(aa) * 120 * s], head: [o.x + p.x + J.Hd[0] * s, o.y + p.y + J.Hd[1] * s] };
    }
    return { head: [o.x + p.x + J.Hd[0] * s, o.y + p.y + J.Hd[1] * s] };
  }
  function afterimages(o, poseAt, n = 4, dt = 0.05, col = '#ff2a1a') {
    const c = G.ctx; c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = n; i >= 1; i--) draw({ ...o, pose: poseAt(o.t - i * dt), ink: col, rim: col, alpha: 0.28 * (1 - i / (n + 1)), glow: null, axeGlow: 0 });
    c.restore();
  }
  // a dramatic duel backdrop: big low moon, layered silhouettes, haze
  function backdrop(t, o = {}) {
    const { mood = 'dusk', cx = 640, moonY = 420, R = 270, camx = 0 } = o, c = G.ctx;
    const pal = mood === 'blood' ? [['#120004', 0], ['#4a0610', 0.45], ['#b0161e', 0.75], ['#ff6040', 1]] : [['#170d24', 0], ['#5a2a48', 0.42], ['#d06a52', 0.74], ['#ffc07a', 1]];
    const g = c.createLinearGradient(0, 0, 0, 600); pal.forEach(([col, k]) => g.addColorStop(k, col)); c.fillStyle = g; c.fillRect(-60, -60, G.W + 120, 700);
    G.radial(cx - camx * 0.1, moonY, R * 2.6, mood === 'blood' ? 'rgba(255,60,40,0.55)' : 'rgba(255,200,150,0.5)', 'rgba(0,0,0,0)', 1, 'lighter');
    c.fillStyle = mood === 'blood' ? '#ff8a6a' : '#fff1dc'; c.beginPath(); c.arc(cx - camx * 0.1, moonY, R, 0, 7); c.fill();
    c.fillStyle = mood === 'blood' ? 'rgba(160,20,30,0.35)' : 'rgba(200,150,140,0.28)'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(cx - camx * 0.1 + (G.hash(i, 3) - 0.5) * R * 1.3, moonY + (G.hash(i, 4) - 0.5) * R * 1.2, R * (0.08 + G.hash(i, 5) * 0.15), 0, 7); c.fill(); }
    for (let i = 0; i < 6; i++) { const y = 140 + i * 55 + Math.sin(t * 0.2 + i) * 4, x = ((t * (8 + i * 3) + i * 300) % (G.W + 600)) - 300 - camx * 0.15; c.fillStyle = mood === 'blood' ? 'rgba(40,0,6,0.35)' : 'rgba(60,24,50,0.32)'; c.beginPath(); c.ellipse(x, y, 260 + i * 40, 10 + i * 3, 0, 0, 7); c.fill(); }
    G.withCam({ x: camx, y: 0, z: 1 }, 0.25, () => c.drawImage(G.L.oFar, -160, -90, 1600, 900));
    G.desat(0); G.fill(mood === 'blood' ? '#200208' : '#1a0c18', 0.55, 'multiply');
    G.withCam({ x: camx, y: 0, z: 1 }, 0.5, () => c.drawImage(G.L.oMid, -160, -90, 1600, 900));
    c.fillStyle = '#07030a'; c.fillRect(-60, 600, G.W + 120, 200); // ground
    const hz = c.createLinearGradient(0, 520, 0, 620); hz.addColorStop(0, 'rgba(255,150,120,0)'); hz.addColorStop(1, mood === 'blood' ? 'rgba(255,40,30,0.35)' : 'rgba(255,170,130,0.3)'); c.fillStyle = hz; c.fillRect(-60, 520, G.W + 120, 100);
  }
  function dust(dt, x, y, n = 8, seed = 1, dir = 0) {
    if (dt < 0 || dt > 1.2) return; const c = G.ctx; c.save();
    for (let i = 0; i < n; i++) { const a = -Math.PI * (0.15 + 0.7 * G.hash(i, seed)) + dir, v = 60 + 120 * G.hash(i, seed + 1), r = (6 + 18 * dt) * (0.6 + G.hash(i, seed + 2)); c.globalAlpha = 0.45 * (1 - dt / 1.2); c.fillStyle = '#5a4448'; c.beginPath(); c.arc(x + Math.cos(a) * v * dt, y + Math.sin(a) * v * dt * 0.4, r, 0, 7); c.fill(); }
    c.restore();
  }
  return { seq, run, draw, afterimages, backdrop, dust, mk, POSES };
})();
