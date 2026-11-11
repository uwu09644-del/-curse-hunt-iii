/* RUINBREAKER — Episode 2: hand-directed set pieces (Valentine's entrance, Tofu's appraisal, Rin's entrance,
   the duel, Sieg's drill, the preview) and the episode build. */
'use strict';

const EP02_CUSTOM = (() => {
  const PI = Math.PI, H = PI / 2;
  const G = () => GFX, P = () => S3.POSES;
  const { clamp, lerp, inv, ease, hash } = GFX;
  const IDLE = { takuto: { uaR: [0.5, 0.25], elR: 2.3, weapon: 0, uaL: [0.05, 0.15], elL: 0.3 }, nemu: { uaL: [0.08, 0.12], elL: 0.35, uaR: [0.08, 0.12], elR: 0.35 }, sieg: { uaL: [0.25, 0.1], elL: 1.35, weapon: 0 }, rin: { uaL: [0.4, 0.3], elL: 1.2, uaR: [0.5, 0.2], elR: 1.0, weapon: 0 }, valentine: { uaL: [0.15, 0.55], elL: 1.7, uaR: [0.35, 0.1], elR: 1.2 }, clerk: { uaL: [0.42, 0.05], elL: 1.3, uaR: [0.42, 0.05], elR: 1.3 } };
  const VO = { takuto: 'TAKUTO', nemu: 'NEMU', sieg: 'SIEG', rin: 'RIN', valentine: 'VALENTINE', clerk: 'CLERK' };
  const C = (pos, look, fov = 32) => ({ pos, look, fov });
  const mv = (lt, a, b, t0, t1, e = 'io') => { const k = (ease[e] || (x => x))(clamp((lt - t0) / Math.max(0.01, t1 - t0))); return { pos: a.pos.map((v, i) => lerp(v, b.pos[i], k)), look: a.look.map((v, i) => lerp(v, b.look[i], k)), fov: lerp(a.fov, b.fov, k) }; };
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  const proj = p => S3.project(p[0], p[1], p[2]);
  const actor = (name, pose, t, o = {}) => [name, { ...(IDLE[name] || {}), ...pose }, { talk: VOICE.amp(VO[name] || '', t), gaze: o.gaze || [0, 0], weapon: o.weapon ?? (name !== 'rin' || !!o.dagger), ...o }];
  const fromMarks = (api, t, skip = []) => api.castList(t).filter(c => !skip.includes(c[0]));
  function thread(a, b, k, t, sag = 0.25, w = 3) { // a red Brand thread between two world points, k = how far it has reached
    const g = GFX.ctx, n = 16, pts = []; for (let i = 0; i <= n; i++) { const f = i / n * k; const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) - Math.sin(f * PI) * sag * (1 - k * 0.7), z = lerp(a[2], b[2], f); pts.push(proj([x, y, z])); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    [[w * 4, 'rgba(255,30,50,0.18)'], [w * 1.8, 'rgba(255,50,70,0.5)'], [w * 0.7, 'rgba(255,220,220,0.95)']].forEach(([lw, c]) => { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); });
    g.restore();
  }
  function holo(lt, d, o) { VFX.holo(lt, d, o); }

  return {
    recap(lt, d, t, api) { // "Previously": Episode 1's own shots, re-cut
      const segs = [[4, 2.0, 5], [13, 0.6, 4.5], [14, 2.6, 3.4], [22, 1.0, 5], [47, 0, 4.6], [63, 1.0, 4], [66, 2.0, 4.6], [67, 0.2, 4.4], [79, 1.0, 3]];
      let acc = 0, seg = segs[segs.length - 1], off = 0; for (const sg of segs) { if (lt < acc + sg[2]) { seg = sg; off = lt - acc; break; } acc += sg[2]; off = Math.min(lt - acc + sg[2], sg[2]); }
      const s0 = EP01.shots[seg[0]]; if (s0) { const l2 = Math.min(s0.d - 0.01, seg[1] + off); s0.draw(l2, s0.d, s0.t0 + l2); }
      GFX.ctx.save(); GFX.ctx.setTransform(GFX.K, 0, 0, GFX.K, 0, 0); GFX.txt('PREVIOUSLY', 70, 66, { font: '700 14px ' + GFX.FONT.sub, fill: '#e8343c', ls: 8, align: 'left', a: inv(0, 0.8, lt) * (1 - inv(d - 1.2, d, lt)) }); GFX.ctx.restore();
      POST.set({ sat: 0.85, vig: 0.6 }); GFX.fill('#000', 1 - inv(0, 0.6, lt)); GFX.fill('#000', inv(d - 1.0, d, lt));
    },
    valEntrance(lt, d, t, api) {
      const k = ease.out(clamp((lt - 1.0) / 3.2)), spin = ease.io(clamp((lt - 3.0) / 1.4));
      const vp = { x: lerp(5.8, 1.2, k), z: lerp(-1.2, -3.4, k), ry: -H - 0.6 + spin * PI * 2 * (lt < 4.4 ? 1 : 0), ...(lt > 4.4 ? { uaL: [1.6, 0.6], elL: 0.5, uaR: [2.6, 0.2], elR: 0.4 } : { uaL: [0.15, 0.55], elL: 1.7, uaR: [0.35, 0.1], elR: 1.2 }), ...(lt < 4.2 && lt > 1 ? S3.walk(t * 5, 0.8) : {}) };
      const tp = { x: lerp(6.8, 2.0, k), z: lerp(-2.6, -4.6, k), ry: -H - 0.4 };
      const cam = mv(lt, C([-1.0, 1.5, -1.2], [4.5, 1.5, -2.4], 34), C([-0.2, 1.55, -1.8], [1.4, 1.5, -3.3], 30), 0.6, 5.2);
      api.render(t, cam, [...fromMarks(api, t, ['valentine', 'tofu']), actor('valentine', vp, t, { expr: { happy: 0.6 } }), ['tofu', tp, { face: 'idle' }]]);
      const g = GFX.ctx, dim = inv(0.3, 1.2, lt) * (1 - inv(7.5, 9, lt)); g.save(); g.fillStyle = 'rgba(10,4,12,' + (0.45 * dim).toFixed(2) + ')'; g.fillRect(0, 0, 1280, 720); g.restore();
      const [sx, sy] = proj([vp.x, 1.2, vp.z]); GFX.radial(sx, sy - 40, 260, 'rgba(255,190,230,' + (0.35 * dim).toFixed(2) + ')', 'rgba(255,120,200,0)', 1, 'lighter');
      GFX.motes(t, { n: 60, vy: -40, color: '#ff9ad8', size: 2.2, seed: 7, a: dim, x0: sx - 200, x1: sx + 200, y0: sy - 300, y1: sy + 200 });
      api.postFor();
    },
    scanNemu(lt, d, t, api) {
      const m = api.marks(), np = { x: m.nemu.x, z: m.nemu.z, ry: PI + 0.5 }, up = ease.out(clamp((lt - 0.3) / 1.6));
      const tp = { x: lerp(2.0, -2.1, up), z: lerp(-4.6, -4.6, up), y: up * 0.5, ry: -H - 0.6 };
      const cam = lt < 4.6 ? mv(lt, C([-4.4, 1.5, -2.6], [-2.4, 1.2, -4.4], 34), C([-4.0, 1.5, -2.9], [-2.4, 1.3, -4.4], 30), 0, 4.6) : C([-1.0, 1.6, -2.4], [-2.6, 1.3, -4.0], 34);
      api.render(t, cam, [...fromMarks(api, t, ['nemu', 'tofu']), actor('nemu', np, t, { expr: { relaxed: 0.4 }, gaze: [0.3, -0.2] }), ['tofu', tp, { face: lt > 1.5 && lt < 4.5 ? 'scan' : 'idle' }]]);
      if (lt > 1.5 && lt < 4.5) { const a = [tp.x, tp.y + 0.45, tp.z + 0.1]; for (let i = 0; i < 4; i++) thread(a, [np.x + (i - 1.5) * 0.12, 0.4 + ((t * 0.8 + i * 0.25) % 1) * 1.1, np.z], 1, t, 0, 1.2); }
      if (lt > 4.6) holo(lt - 4.6, 4.4, { x: 820, y: 230, w: 460, title: 'BRAND APPRAISAL', color: '#ff7ab6', accent: '#ffd6ea', lines: [{ t: 'Nemu', big: true }, 'Brand: Nine Lives  ·  Rank D', { t: 'Lives remaining: 2 / 9', col: '#ffb0d0' }] });
      api.postFor();
    },
    scanTakuto(lt, d, t, api) {
      const m = api.marks(), tk = { x: m.takuto.x, z: m.takuto.z, ry: PI - 0.4 }, up = ease.out(clamp((lt - 0.4) / 1.8));
      const tp = { x: lerp(-2.1, -0.2, up), z: -4.9, y: 0.6 + up * 0.25, ry: -0.3 };
      const err = lt > 7.2, glitch = lt > 6.6 && lt < 7.6;
      let cam;
      if (lt < 5.5) cam = mv(lt, C([1.4, 1.35, -2.2], [-0.4, 1.4, -4.2], 34), C([0.9, 1.5, -2.7], [-0.4, 1.55, -4.1], 28), 0.3, 5.5);
      else if (lt < 10) cam = C([1.1, 1.25, -4.1], [-0.2, 1.05, -4.9], 30);
      else cam = mv(lt - 10, C([1.0, 1.6, -2.2], [-0.4, 1.55, -4.0], 30), C([0.7, 1.62, -2.6], [-0.4, 1.6, -4.0], 26), 0, 4);
      api.render(t, jolt(cam, t, glitch ? 0.05 : 0), [...fromMarks(api, t, ['takuto', 'tofu']), actor('takuto', tk, t, { axeGlow: inv(2, 6.5, lt) * (0.5 + 0.5 * Math.sin(t * 9)), gaze: [0, -0.1], expr: err ? { Surprised: 0.4 } : { angry: 0.2 } }), ['tofu', tp, { face: err ? 'error' : lt > 2 ? 'scan' : 'idle' }]]);
      if (lt > 2 && lt < 7) { const a = [tp.x, tp.y + 0.45, tp.z + 0.1]; for (let i = 0; i < 5; i++) thread(a, [tk.x + (i - 2) * 0.12, 0.3 + ((t * 0.9 + i * 0.2) % 1) * 1.4, tk.z], 1, t, 0, 1.2); }
      if (lt > 3.2 && lt < 10) holo(lt - 3.2, 6.8, { x: 900, y: 230, w: 500, title: err ? 'APPRAISAL FAILED' : 'BRAND APPRAISAL', color: err ? '#ff3a4a' : '#ff7ab6', accent: '#ffd6ea', lines: [{ t: 'Kirishima Takuto', big: true }, 'Brand: RUINBREAKER', { t: err ? 'RANK: ERROR' : 'Rank: ▒▒▒▒▒', big: err, col: err ? '#ff5060' : '#ffd6ea' }] });
      if (glitch) { POST.set({ ca: 0.02 }); if (GFX.twos(t, 12) % 3 === 0) GFX.impact('inv'); }
      if (lt > 6.4 && lt < 9) GFX.fill('#ff0000', 0.08 * Math.abs(Math.sin(t * 20)), 'lighter');
      api.postFor();
    },
    doorSlam(lt, d, t, api) {
      const m = api.marks(), k = ease.out(clamp((lt - 1.0) / 3.5)), rp = { x: 0.2, z: lerp(8.4, 6.0, k), ry: PI, ...(lt > 1 && lt < 4.5 ? S3.walk(t * 4.4, 0.8) : {}) };
      const cam = mv(lt, C([1.2, 0.7, -0.5], [0.2, 1.5, 8], 36), C([1.0, 0.75, 0.2], [0.2, 1.4, 6], 32), 0.8, 5.2);
      api.render(t, jolt(cam, t, lt > 0.2 && lt < 0.7 ? 0.08 : 0), [...fromMarks(api, t, ['rin']), actor('rin', rp, t, { expr: { angry: 0.7 }, weapon: false })]);
      const [dx, dy] = proj([0.2, 2, 9]); GFX.radial(dx, dy, 380, 'rgba(255,240,210,' + (0.6 * (1 - inv(0.4, 3, lt))).toFixed(2) + ')', 'rgba(255,220,180,0)', 1, 'lighter');
      api.postFor();
    },
    duelThreads(lt, d, t, api) {
      const bind = ease.out(clamp((lt - 3.6) / 0.6)), strain = clamp((lt - 4.2) / 1);
      const rp = { x: 0, z: -2.6, ry: 0, ...P().ready, uaR: [lt > 3.4 ? 1.6 : 0.6, 0.2], elR: lt > 3.4 ? 0.2 : 1.0, uaL: [0.8, 0.4], elL: 1.0 };
      const tp = { x: 0, z: 2.6, ry: PI, ...P().ready, lean: 0.25 - strain * 0.15, twist: Math.sin(t * 20) * 0.03 * strain };
      const cam = lt < 3.4 ? mv(lt, C([7.5, 1.4, 0.2], [0, 1.1, 0], 34), C([6.5, 1.3, 0.4], [0, 1.15, 0], 32), 0, 3.4) : mv(lt - 3.4, C([2.6, 1.2, 5.8], [0, 1.2, 2.4], 34), C([1.6, 1.35, 4.6], [0, 1.35, 2.5], 28), 0.6, 5.6);
      api.render(t, cam, [...fromMarks(api, t, ['rin', 'takuto']), actor('rin', rp, t, { dagger: true, expr: { angry: 0.5 } }), actor('takuto', tp, t, { gaze: [0, 0], expr: { angry: 0.4 + strain * 0.4 } })]);
      if (lt > 3.6) { const h = S3.jointPos('rin', 'handR'); ['handR', 'handL', 'head', 'hips'].forEach((j, i) => { const b = S3.jointPos('takuto', j, j === 'head' ? -0.05 : 0); thread(h, b, bind, t, 0.3 + i * 0.05, 2.6); }); }
      api.postFor();
    },
    duelBreak(lt, d, t, api) {
      const snap = 2.0, run = clamp((lt - 3.0) / 1.6), dodge = ease.out(clamp((lt - 4.3) / 0.6));
      const tp = lt < 3 ? { x: 0, z: 2.6, ry: PI, ...P().ready, lean: 0.1 } : { x: 0, z: lerp(2.6, -1.4, run), ry: PI, ...S3.run(t * 15, 1.1), uaR: [1.0, 0.2], elR: 0.8, weapon: 0.6 };
      const rp = { x: lerp(0, 2.2, dodge), z: -2.6, y: Math.sin(dodge * PI) * 0.5, ry: -0.5, ...(dodge > 0 && dodge < 1 ? P().leap : P().ready), pitch: 0 };
      let cam;
      if (lt < snap + 0.6) cam = mv(lt, C([1.3, 1.5, 4.6], [0, 1.45, 2.6], 30), C([0.9, 1.55, 3.9], [0, 1.5, 2.6], 24), 0, snap);
      else cam = mv(lt - snap - 0.6, C([7, 1.2, 1.2], [0, 1.1, 0.6], 34), C([6, 1.2, -0.4], [0.6, 1.1, -1.4], 34), 0, 2.6);
      api.render(t, jolt(cam, t, lt > snap && lt < snap + 0.4 ? 0.1 : 0), [...fromMarks(api, t, ['rin', 'takuto']), actor('takuto', tp, t, { axeGlow: lt < snap ? inv(0.4, snap, lt) : Math.max(0, 1 - (lt - snap)), expr: { angry: 0.6 }, vx: lt > 3 ? 3 : 0 }), actor('rin', rp, t, { dagger: true, expr: { Surprised: lt > 2 ? 0.5 : 0 } })]);
      if (lt < snap) { const h = S3.jointPos('rin', 'handR'); ['handR', 'handL', 'head', 'hips'].forEach((j, i) => thread(h, S3.jointPos('takuto', j), 1, t, 0.3 + i * 0.05, 2.6 + Math.sin(t * 30) * 0.4)); }
      else if (lt < snap + 1) { const f = lt - snap, b = S3.jointPos('takuto', 'chest'); for (let i = 0; i < 18; i++) { const a = hash(i, 3) * PI * 2, r = 0.2 + f * (1.5 + hash(i, 4) * 2); const p0 = [b[0] + Math.cos(a) * r, b[1] + Math.sin(a) * r * 0.6, b[2]], p1 = [p0[0] + Math.cos(a) * 0.25, p0[1] + Math.sin(a) * 0.15, p0[2]]; GFX.ctx.globalAlpha = 1 - f; thread(p0, p1, 1, t, 0, 2); GFX.ctx.globalAlpha = 1; } const [sx, sy] = proj(b); VFX.sparks(f, { x: sx, y: sy, n: 50, spread: PI * 2, speed: 900, color: '#ff8a8a' }); if (f < 0.08) GFX.fill('#fff', 0.8); }
      api.postFor(); if (lt > 3 && lt < 4.6) POST.set({ dir: [0, 0.006] });
    },
    duelExchange(lt, d, t, api) {
      const swings = [1.2, 3.4, 5.6], seg = Math.min(3, Math.floor(lt / 2.2));
      const rx = [2.2, -1.8, 0.6, 0.2][seg], rz = [-2.0, -1.2, -1.6, -2.4][seg];
      const sw = swings.map(s => clamp((lt - (s - 0.5)) / 0.5)), cur = sw.findIndex(v => v > 0 && v < 1);
      let tp = { x: [0.4, 0.6, 0.0, 0][seg], z: [-0.2, -0.6, -0.4, 0.6][seg], ry: PI + [0.3, -0.3, 0, 0][seg], ...P().ready };
      swings.forEach((s, i) => { if (lt > s - 0.5 && lt < s + 0.5) tp = { ...tp, ...S3.seq(lt - (s - 0.5), [[0, P().windup], [0.5, P().chop, 'in'], [1.0, P().ready]]), weapon: lt < s ? 2.0 : 1.7 }; });
      const dodgeK = swings.reduce((m, s) => Math.max(m, lt > s - 0.3 && lt < s + 0.4 ? Math.sin(clamp((lt - s + 0.3) / 0.7) * PI) : 0), 0);
      const rp = { x: rx, z: rz, ry: Math.atan2(tp.x - rx, tp.z - rz), ...(dodgeK > 0.2 ? (seg === 2 ? P().duck : P().crouch) : P().ready), y: seg === 1 ? dodgeK * 0.4 : 0 };
      const cams = [C([6, 1.2, 1.6], [0.6, 1.1, -0.8], 34), C([-0.4, 0.5, -5.2], [0.4, 1.3, -0.2], 36), C([1.5, 5.5, 3.5], [0.2, 0.4, -0.8], 38), C([8, 2.0, 6], [0.4, 1.0, -0.8], 32)];
      const hitAmt = swings.reduce((m, s) => Math.max(m, lt > s && lt < s + 0.35 ? 0.12 * (1 - (lt - s) / 0.35) : 0), 0);
      api.render(t, jolt({ ...cams[seg] }, t, hitAmt), [...fromMarks(api, t, ['rin', 'takuto']), actor('takuto', tp, t, { expr: { angry: 0.6 }, axeGlow: 0.3 }), actor('rin', rp, t, { dagger: true, expr: seg === 3 ? { happy: 0.3, angry: 0.3 } : { angry: 0.4 } })]);
      swings.forEach(s => { if (lt > s && lt < s + 1.2) { const tip = S3.weaponTip('takuto', 1.0), [x, y] = proj([tip[0], 0.02, tip[2]]); VFX.debris(lt - s, { x, y, n: 26, speed: 520, size: 8, seed: Math.round(s * 10), dust: '#c8b088' }); } });
      api.postFor();
    },
    duelBlock(lt, d, t, api) {
      const a = lt < 1.6 ? lt : lt < 3.0 ? 1.6 + (lt - 1.6) * 0.3 : 2.02 + (lt - 3.0);
      const lunge = ease.in(clamp((a - 1.0) / 0.8)), hit = 2.0;
      const rp = a < 2.1 ? { x: 0, z: lerp(-2.8, 1.4, lunge), ry: 0, ...(a < 1 ? P().ready : { ...P().ready, lean: 0.6, uaR: [1.5, 0.1], elR: 0.1 }), weapon: 0 } : a < 3.2 ? { x: 0, z: 1.6, ry: 0, ...P().ready, uaR: [1.2, 0.1], elR: 0.4 } : { x: 0.1, z: 2.9, ry: 0, ...P().kneel, uaR: [1.0, 0.1], elR: 0.6 };
      const fall = ease.out(clamp((a - hit) / 0.9));
      const tp = a < hit ? { x: 0, z: 2.6, ry: PI, ...P().block, weapon: 1.2 + (a > 1.8 ? (a - 1.8) * 6 : 0) } : { x: 0, z: lerp(2.6, 4.0, fall), ry: PI, ...P().hit, y: Math.sin(fall * PI) * 0.4 + (fall >= 1 ? 0.13 : 0), pitch: fall * H * 0.98, weapon: 2.6 };
      let cam;
      if (lt < 1.6) cam = mv(lt, C([0.6, 1.5, -1.0], [0, 1.45, -2.8], 26), C([0.5, 1.5, -1.3], [0, 1.45, -2.4], 24), 0, 1.6);
      else if (lt < 3.0) cam = mv(lt - 1.6, C([5.2, 1.2, 2.4], [0, 1.2, 2.0], 32), C([4.6, 1.15, 2.6], [0, 1.15, 2.2], 30), 0, 1.4, 'linear');
      else if (lt < 4.2) cam = C([3.2, 0.6, 4.8], [0, 0.6, 3.6], 34);
      else cam = mv(lt - 4.2, C([0.5, 3.2, 3.6], [0, 0.2, 3.9], 30), C([0.35, 2.4, 3.7], [0, 0.3, 3.9], 26), 0, 4.8);
      api.render(t, jolt(cam, t, lt > 2.9 && lt < 3.4 ? 0.15 : 0), [...fromMarks(api, t, ['rin', 'takuto']), actor('rin', rp, t, { dagger: true, expr: { angry: 0.6 } }), actor('takuto', tp, t, { expr: a > hit ? { Surprised: 0.6 } : { angry: 0.6 }, blink: a > hit && a < 3 ? 1 : undefined })]);
      if (lt > 2.2 && lt < 2.6) { const tip = S3.jointPos('rin', 'handR'), [x, y] = proj(tip); VFX.sparks(lt - 2.2, { x, y, n: 40, spread: 2.4, speed: 800, color: '#ffe0c0' }); }
      if (lt > 2.95 && lt < 3.05) GFX.fill('#fff', 0.85);
      if (lt > 1.6 && lt < 3.0) POST.set({ sat: 0.6, radial: 0.01 });
      api.postFor();
    },
    drill(lt, d, t, api) {
      const s1 = 3.4, s2 = 7.0, swing = s => S3.seq(clamp(lt - (s - 0.5), 0, 1.2), [[0, { ...P().windup, weapon: 0.6 }], [0.5, { ...P().chop, weapon: 1.4 }, 'in'], [1.2, { uaL: [0.25, 0.1], elL: 1.35 }]]);
      const sp = { x: 0, z: -1.4, ry: 0, ...(lt > s1 - 0.5 && lt < s1 + 0.7 ? swing(s1) : lt > s2 - 0.5 && lt < s2 + 0.7 ? swing(s2) : { uaL: [0.25, 0.1], elL: 1.35 }) };
      const dodge1 = Math.sin(clamp((lt - (s1 - 0.1)) / 0.5) * PI), bonk = lt > s1 + 0.5 && lt < s1 + 1.2;
      const dodge2 = Math.sin(clamp((lt - (s2 - 0.1)) / 0.5) * PI) + Math.sin(clamp((lt - (s2 + 0.35)) / 0.5) * PI);
      const tp = { x: 0.6 * dodge1 - 0.6 * dodge2, z: 1.6 + (bonk ? 0.3 : 0), ry: PI, ...(bonk ? P().hit : dodge1 > 0.2 || dodge2 > 0.2 ? P().duck : P().ready), weapon: 0 };
      const cam = mv(lt, C([6.5, 1.3, 0.3], [0, 1.1, 0.1], 34), C([5.6, 1.25, 0.5], [0, 1.1, 0.1], 32), 0, d);
      api.render(t, jolt(cam, t, bonk && lt < s1 + 0.7 ? 0.06 : 0), [...fromMarks(api, t, ['sieg', 'takuto']), actor('sieg', sp, t, { expr: { happy: 0.3 } }), actor('takuto', tp, t, { expr: bonk ? { angry: 0.6 } : { angry: 0.2 } })]);
      [s1, s2].forEach(s => { if (lt > s + 0.35 && lt < s + 0.9) S3.frame({ env: 'yard', only: 'cast', t, cam, cast: [actor('sieg', { ...sp, ...swing(s + 0.35 - (lt - s - 0.35)) }, t, {})], alpha: 0.35 * (1 - (lt - s - 0.35) / 0.55) }); });
      api.postFor();
    },
    previewShots(lt, d, t, api) {
      const cut = Math.floor(lt / 3.9);
      if (lt < 15.6) {
        const k = (lt % 3.9) / 3.9;
        const shotsP = [
          [C([1.6, 1.5, 1.6], [1.4, 1.5, 0.6], 26), C([1.55, 1.5, 1.5], [1.4, 1.5, 0.6], 24), { rin: { x: 1.4, z: 0.6, ry: 0.2 }, tk: null }],
          [C([0.3, 0.5, -1.4], [0, 1.4, 1], 34), C([0.3, 0.55, -1.1], [0, 1.5, 1], 30), { rin: null, tk: { x: 0, z: 1, ry: PI, ...P().ready } }],
          [C([6, 1.4, 2], [0.6, 1.2, 0.8], 34), C([5.5, 1.4, 1.2], [0.6, 1.2, 0.8], 34), { rin: { x: 1.4, z: 0.6, ry: -2.6, ...P().ready }, tk: { x: 0, z: 1, ry: PI - 0.4, ...P().ready } }],
          [C([0, 6, 14], [0, 1, 0], 40), C([0, 3, 9], [0, 1.2, 0], 36), { rin: { x: 1.4, z: 0.6, ry: -2.6 }, tk: { x: 0, z: 1, ry: PI } }],
        ][cut];
        const cast = []; if (shotsP[2].rin) cast.push(actor('rin', shotsP[2].rin, t, { dagger: true, expr: { angry: 0.4 } })); if (shotsP[2].tk) cast.push(actor('takuto', shotsP[2].tk, t, { expr: { angry: 0.3 } }));
        api.render(t, mv(k, shotsP[0], shotsP[1], 0, 1), cast);
        if (cut === 2) { const h = S3.jointPos('rin', 'handR'); thread(h, S3.jointPos('takuto', 'handR'), clamp(k * 3), t, 0.3); }
        if ((lt % 3.9) < 0.1) POST.set({ flash: 0.5 });
        api.postFor();
      } else {
        const a = inv(0, 0.8, lt - 15.6); GFX.fill('#050406');
        GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt('第三話', 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
        GFX.txt('故郷の炎', 640, 430, { font: '400 110px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 16, a }); GFX.txt('A FLAME FROM HOME', 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
        GFX.fill('#000', inv(d - 1.2, d, lt));
      }
    },
  };
})();

// build the episode: opening, eyecatch and ending are borrowed from Episode 1 so the series shares one title sequence
const EP02 = (() => {
  const op = EP01.chapters.find(c => c.name === 'Opening');
  const pB = EP01.chapters.find(c => c.name === 'Part B'), ed = EP01.chapters.find(c => c.name === 'Ending'), after = EP01.chapters.find(c => c.name === 'After the credits');
  const opEnd = EP01.shots.find(s => s.t0 > op.t + 1 && s.d > 6 && s.d < 6.5).t0;
  return DIRECTOR.build({ ...EP02_SCRIPT, custom: EP02_CUSTOM, borrow: { opening: { ep: EP01, t0: op.t, t1: opEnd }, eyecatch: { ep: EP01, t0: pB.t - 8, t1: pB.t }, ending: { ep: EP01, t0: ed.t, t1: after.t } } });
})();
