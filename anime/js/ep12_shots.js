/* RUINBREAKER — Episode 12: hand-directed moments (the Great Sanctum closing, the drained, the dancing knights, the
   gate gale, the Saint at his altar, static, three seconds, the shatter, the light coming home, Sable escaping, a Rift
   to Nerima, the city waking, Tofu's crown, the crossing bell) and the build. */
'use strict';

const EP12_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT;
  const motes = (t, a = 0.7) => GFX.motes(t, { n: 60, vy: -24, color: '#ffe0a0', size: 2.2, seed: 7, a });
  const drainMotes = (t, a = 0.8) => GFX.motes(t * 1.4, { n: 90, vy: -160, color: '#ffd890', size: 2.6, seed: 13, a });
  const shards = (lt, t, a = 1) => { const c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const k = lt * (0.6 + hash(i, 1)), x = 640 + Math.cos(i * 2.39) * k * 520 * (0.4 + hash(i, 2)), y = 330 + Math.sin(i * 2.39) * k * 360 * (0.4 + hash(i, 3)) + k * k * 60, s = 8 + hash(i, 4) * 20;
    c.fillStyle = 'rgba(255,' + Math.round(210 + hash(i, 5) * 40) + ',140,' + (a * (1 - clamp(k / 2.4))).toFixed(2) + ')'; c.save(); c.translate(x, y); c.rotate(i + t * 3); c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.5, 0); c.lineTo(0, s * 0.7); c.lineTo(-s * 0.4, 0); c.closePath(); c.fill(); c.restore(); } c.restore(); };
  return {
    greatSanctum(lt, d, t) {
      K.plate('lumen_dome', lt, d, { z0: 1.0, z1: 1.12, tilt: 0.02 }); const k = ease.io(clamp((lt - 4.4) / 4));
      K.gold(640, 360 + (1 - k) * 300, 1500, lerp(200, 1300, k), Math.max(0.15, k), t, { cell: 60 }); drainMotes(t, inv(6, 9, lt));
      if (lt > 8.4) GFX.fill('#e8c880', 0.1 * inv(8.4, 10, lt), 'multiply'); motes(t); POST.set({ bloom: 0.9, thr: 0.5, sat: lerp(1.1, 0.85, inv(8, d, lt)) });
    },
    drained(lt, d, t, api) {
      const m = api.marks(), wk = m.wick, rn = m.rin, cam = lt < 4 ? { pos: [wk.x + 0.6, 1.7, wk.z + 1.4], look: [wk.x, 1.7, wk.z], fov: 30 } : { pos: [rn.x + 0.8, 1.3, rn.z + 1.2], look: [rn.x, 1.2, rn.z], fov: 30 };
      api.render(t, cam, K.over(api, t, { rin: { pose: { uaR: [1.2, 0.3], elR: 0.5 }, o: { expr: { sad: 0.5 } } }, wick: { o: { expr: { sad: 0.6 } } } }));
      if (lt > 4) { const a = K.proj(S3.jointPos('rin', 'handR', 0)); K.thread(a, [a[0] + 200, a[1] - 140], t, 1, { w: 0.8, sag: 20 }); }
      drainMotes(t, 0.6); POST.set({ sat: 0.75, vig: 0.6 });
    },
    encoreKnights(lt, d, t, api) {
      const v = api.marks().valentine, cam = K.jolt({ pos: [v.x + 2.0, 1.4, v.z + 2.4], look: [v.x + 0.6, 1.4, v.z - 4], fov: 46 }, t, 0.01);
      api.render(t, cam, K.over(api, t, { valentine: { pose: { uaL: [2.4, 0.6], elL: 0.3, uaR: [2.4, 0.6], elR: 0.3, ry: PI }, o: { expr: { happy: 0.8 } } }, gideon: { pose: { uaR: [2.0, 0.4], elR: 0.3, uaL: [2.0, 0.4], elL: 0.3, ry: PI }, o: { expr: { angry: 0.5 } } } }));
      const k = ease.out(clamp((lt - 0.4) / 1.0)), c = GFX.ctx; GFX.fill('#ff60b0', 0.12 * k, 'screen');
      for (let i = 0; i < 9; i++) { const x = 140 + i * 125, y = 470 + Math.sin(lt * 6 + i) * 10, h = 120; c.save(); c.translate(x, y); c.rotate(Math.sin(lt * 5 + i) * 0.2 * k); c.fillStyle = 'rgba(230,210,150,0.9)'; c.fillRect(-18, -h, 36, h); c.beginPath(); c.arc(0, -h - 16, 16, 0, 7); c.fill(); c.restore(); }
      if (lt > 3.6) K.chains(t, inv(3.6, 4.4, lt), 0, 'gideon');
      GFX.motes(t, { n: 60, vy: 40, color: '#ff9ad8', size: 3, seed: 7, a: k }); POST.set({ bloom: 0.8, thr: 0.55 });
    },
    gateGale(lt, d, t, api) {
      const vs = api.marks().vesper, k = ease.out(clamp((lt - 0.3) / 1.0)), cam = { pos: [vs.x + 1.8, 1.3, vs.z + 2.4], look: [vs.x - 0.6, 1.6, vs.z - 6], fov: 44 };
      api.render(t, cam, K.over(api, t, { vesper: { pose: { uaR: [2.4, 0.6], elR: 0.2, uaL: [1.6, 0.6], elL: 0.4, ry: PI } } }));
      K.ribbons(K.proj(S3.jointPos('vesper', 'handR', 0)), [640, 300], t, k, { n: 8 }); GFX.motes(t * 3, { n: 120, vy: -40, vx: -600, color: '#e8f4ff', size: 2, glow: false, seed: 31, a: 0.5 * k }); api.postFor();
    },
    kurozaneReturns(lt, d, t, api) {
      const w = api.marks().m_wolf, k = ease.out(clamp((lt - 0.4) / 1.0)), cam = K.jolt({ pos: [w.x + 2.4, 1.2, w.z + 3.0], look: [w.x, 1.6, w.z], fov: 38 }, t, lt > 1 && lt < 1.4 ? 0.1 : 0);
      api.render(t, cam, [...api.castList(t), ['m_wolf', { x: w.x, z: w.z, ry: w.ry, y: lerp(1.6, 0, k) }, { alpha: k }]]);
      if (lt > 1 && lt < 1.6) { const [x, y] = K.proj([w.x, 0, w.z]); VFX.ring(lt - 1, { x, y, r1: 600, dur: 0.5, flat: 0.95 }); VFX.debris(lt - 1, { x, y, n: 30, speed: 500, size: 10, seed: 3 }); }
      const [ex, ey] = K.proj(S3.jointPos('m_wolf', 'head', 0)); GFX.radial(ex + 8, ey + 6, 16, 'rgba(255,50,40,' + (0.95 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); api.postFor();
    },
    lucienAltar(lt, d, t, api) {
      const lu = api.marks().lucien, k = ease.io(clamp(lt / d)), cam = { pos: [lu.x + lerp(3.4, 1.0, k), lerp(0.8, 1.5, k), lu.z + lerp(5.0, 2.2, k)], look: [lu.x, 1.5, lu.z], fov: 34 };
      api.render(t, cam, K.over(api, t, { lucien: { pose: { uaL: [1.2, 0.6], elL: 0.2, uaR: [1.2, 0.6], elR: 0.2 }, o: { expr: { sad: 0.3 } } } }));
      const [x, y] = K.proj([lu.x, 1.3, lu.z]); K.gold(x, y, 520, 640, 0.7, t, { cell: 38 }); VFX.aura(t, { x, y, w: 300, h: 460, n: 40, a: 0.5, color: '#ffd27a' }); drainMotes(t, 0.5); POST.set({ bloom: 0.9, thr: 0.5 });
    },
    staticStorm(lt, d, t, api) {
      const sb = api.marks().sable, cam = K.jolt({ pos: [sb.x + 2.4, 1.5, sb.z + 3.4], look: [sb.x - 0.6, 1.4, sb.z + 1], fov: 44 }, t, 0.03);
      api.render(t, cam, K.over(api, t, { sable: { pose: { uaR: [2.0, 0.6], elR: 0.2, uaL: [2.0, 0.6], elL: 0.2 }, o: { expr: { happy: 0.9 } } } }));
      const [x, y] = K.proj(S3.jointPos('sable', 'chest', 0)); K.staticArcs(x, y, 520, 0.9, t, 12); if (GFX.twos(t, 10) % 5 === 0) GFX.fill('#d8e4ff', 0.12, 'lighter');
      if (lt > 3.8) K.thread(K.proj(S3.jointPos('rin', 'handR', 0)), [x, y], t, ease.out(clamp((lt - 3.8) / 0.6)));
      POST.set({ sat: 0.7, ca: 0.008, bloom: 0.7, thr: 0.55 });
    },
    bindSable(lt, d, t, api) {
      const m = api.marks(), sb = m.sable, rn = m.rin, cam = { pos: [sb.x + 1.2, 1.7, sb.z + 2.0], look: [sb.x, 1.4, sb.z], fov: 32 };
      api.render(t, cam, K.over(api, t, { sable: { pose: { uaR: [0.3, 0.1], elR: 0.2, uaL: [0.3, 0.1], elL: 0.2 }, o: { expr: { happy: 0.7 } } } }));
      const a = K.proj(S3.jointPos('rin', 'handR', 0)); for (let i = 0; i < 9; i++) K.thread(a, K.proj([sb.x + (i - 4) * 0.08, 0.4 + i * 0.16, sb.z]), t, ease.out(clamp((lt - i * 0.12) / 0.6)), { sag: 10 + i * 4, w: 1.4, i });
      const [x, y] = K.proj(S3.jointPos('sable', 'chest', 0)); K.staticArcs(x, y, 200, 0.5, t, 4); api.postFor();
    },
    sanctumStrike(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, lu = m.lucien, hit = 2.0, B = { x: lerp(tk.x, lu.x, 0.5), z: lerp(tk.z, lu.z, 0.5) };
      const pose = S3.seq(lt, [[0, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0, y: 0.6 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.8, { ...P().hit }]]);
      const cam = K.jolt({ pos: [B.x + 3.4, 1.4, B.z + 1.6], look: [B.x, 1.4, B.z], fov: 40 }, t, lt > hit && lt < hit + 0.6 ? 0.3 : 0.01);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, x: lerp(tk.x, B.x, 0.6) + (lt > hit + 0.4 ? 0.6 * ease.out(clamp((lt - hit - 0.4) / 0.6)) : 0), z: lerp(tk.z, B.z, 0.6), ry: K.yaw(tk, lu) }, o: { axeGlow: 0.6, expr: { angry: 0.8 } } }, lucien: { pose: { uaR: [1.8, 0.3], elR: 0.2 }, o: { expr: { angry: 0.7 } } } }));
      const [x, y] = K.proj([B.x, 1.3, B.z]); K.gold(x, y, 720, 820, 1, t, { cell: 40 });
      if (lt > hit && lt < hit + 1) { VFX.sparks(lt - hit, { x, y, n: 140, spread: 3.2, speed: 1500, color: '#ffe2a0' }); VFX.ring(lt - hit, { x, y, r1: 900, dur: 0.6, flat: 0.95, color: '#ffe8b0' }); if (lt < hit + 0.07) GFX.fill('#fff', 0.85); K.cracks(x, y, 120, 0.4 * (1 - inv(hit + 0.4, hit + 1, lt)), { n: 3, w: 2, col: 'rgba(255,255,255,0.9)' }); }
      POST.set({ bloom: 0.9, thr: 0.5 });
    },
    haruRun(lt, d, t, api) {
      const m = api.marks(), hr = m.haruki, lu = m.lucien, run = ease.io(clamp((lt - 0.4) / 3.0)), hp = { x: lerp(hr.x, lu.x + 0.4, run), z: lerp(hr.z, lu.z + 0.5, run) };
      const cam = lt < 3.4 ? { pos: [hp.x + 2.4, 1.2, hp.z + 1.8], look: [hp.x, 1.3, hp.z - 1], fov: 40 } : { pos: [lu.x + 0.9, 1.6, lu.z + 1.6], look: [lerp(lu.x, hp.x, 0.5), 1.5, lerp(lu.z, hp.z, 0.5)], fov: 30 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { x: hp.x, z: hp.z, ry: K.yaw(hp, lu), ...(run < 1 ? S3.run(t * 15, 1.0) : { uaR: [1.5, 0.1], elR: 0.4 }) }, o: { expr: { sad: 0.5 } } }, lucien: { o: { expr: lt > 2.4 ? { Surprised: 0.6 } : { angry: 0.5 } } } }));
      const [x, y] = K.proj([lu.x, 1.3, lu.z]); K.gold(x, y, 520, 640, 0.9, t, { cell: 38 });
      const ga = K.proj(S3.jointPos('rin', 'handR', 0)); K.thread(ga, [x - 120, y], t, 1, { w: 2 }); K.thread(ga, [x - 120, y - 200], t, 1, { w: 2, i: 3 });
      POST.set({ bloom: 0.8, thr: 0.55 });
    },
    threeSeconds(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, lu = m.lucien, f0 = 1.0, hit = 11.4, frz = lt > f0, n = lt < 3 ? 3 : lt < 5.8 ? 3 : lt < 8.4 ? 2 : 1, B = { x: lerp(tk.x, lu.x, 0.55), z: lerp(tk.z, lu.z, 0.55) };
      const wind = clamp((lt - 6) / 4.6), pose = lt < 6 ? P().ready : lt < hit ? { ...P().windup, weapon: 2.0, y: wind * 1.6, crouch: 0.1 } : { ...P().chop, weapon: 1.7 };
      const shots = [[0, { pos: [lu.x + 0.6, 1.62, lu.z + 1.1], look: [lu.x, 1.6, lu.z], fov: 24 }], [3.2, { pos: [B.x + 4, 1.0, B.z + 1], look: [B.x, 1.4, B.z], fov: 40 }], [6.0, { pos: [tk.x + 0.4, 1.0, tk.z + 1.6], look: [tk.x, 1.9, tk.z - 1], fov: 34 }], [8.6, { pos: [B.x - 3, 2.6, B.z + 2.6], look: [B.x, 1.6, B.z], fov: 42 }]];
      const cam = shots.reduce((c, s) => lt >= s[0] ? s[1] : c, shots[0][1]);
      api.render(frz ? f0 : t, cam, K.over(api, t, { takuto: { pose: { ...pose, x: lt > 6 ? lerp(tk.x, B.x, ease.io(wind)) : tk.x, z: lt > 6 ? lerp(tk.z, B.z, ease.io(wind)) : tk.z, ry: K.yaw(tk, lu) }, o: { axeGlow: inv(6, hit, lt), expr: { angry: 0.6 } } }, haruki: { pose: { x: lu.x + 0.4, z: lu.z + 0.5, uaR: [1.5, 0.1], elR: 0.4, ry: K.yaw({ x: lu.x + 0.4, z: lu.z + 0.5 }, lu) }, o: { expr: { sad: 0.6 } } } }));
      const [x, y] = K.proj([lu.x, 1.3, lu.z]);
      if (frz) { K.gold(x, y, 520, 640, 0.6, t, { cell: 38 }); K.frost(x, y, 420, ease.out(clamp((lt - f0) / 0.5)), t); GFX.fill('#a8d8ff', 0.12, 'screen'); POST.set({ sat: 0.45, bloom: 0.7, thr: 0.55 });
        const [hx, hy] = K.proj([tk.x, 1.0, tk.z]); if (lt > 6) VFX.aura(t, { x: hx, y: hy, w: 320, h: 460, n: 50, a: 0.7 * wind, color: '#ffe0c0' });
        GFX.txt(String(n), 1120, 160, { font: '900 120px ' + GFX.FONT.disp, fill: '#e8f6ff', a: 0.85, stroke: 'rgba(40,80,140,0.6)', lw: 6 }); }
      if (lt > hit - 0.1) { VFX.slash(lt - hit + 0.1, { x, y: y - 60, r: 620, a0: -2.4, a1: 0.95, dur: 0.18, hold: 0.6, w: 170, flat: 0.75, rot: 0.15 }); if (lt > hit) GFX.fill('#fff', 1 - inv(hit, d, lt) * 0.2); }
    },
    sanctumShatter(lt, d, t, api) {
      const lu = api.marks().lucien, cam = K.jolt(lt < 5 ? { pos: [lu.x + 4, 1.4, lu.z + 4], look: [lu.x, 1.6, lu.z], fov: 46 } : { pos: [lu.x, 1.0, lu.z + 9], look: [lu.x, 4, lu.z - 6], fov: 60 }, t, lt < 1.2 ? 0.4 * (1 - lt / 1.2) : 0.02);
      api.render(t, cam, api.castList(t)); const [x, y] = K.proj([lu.x, 1.3, lu.z]);
      if (lt < 0.25) GFX.fill('#fff'); else if (lt < 0.35) GFX.impact('inv');
      K.cracks(x, y, 900, ease.out(clamp(lt / 0.5)) * (1 - inv(1.6, 2.4, lt)), { n: 22, w: 5, col: 'rgba(255,245,210,0.95)' }); shards(Math.max(0, lt - 0.3), t, 1);
      if (lt > 0.3) { VFX.ring(lt - 0.3, { x, y, r1: 1800, dur: 1.4, flat: 1, color: '#ffe8c0' }); VFX.sparks(lt - 0.3, { x, y, n: 200, spread: 3.4, speed: 1800, color: '#ffe2a0' }); }
      if (lt > 5) { const im = S3.plateImage('dawn_city'); if (im) { const c = GFX.ctx; c.save(); c.globalAlpha = inv(5, 7, lt); c.drawImage(im, 0, 0, 1280, 720); c.restore(); } shards(lt - 5, t, 0.8); }
      POST.set({ bloom: 1.1, thr: 0.45, sat: 1.15 });
    },
    lightReturns(lt, d, t, api) {
      const lu = api.marks().lucien, cam = { pos: [lu.x + 3.2, 1.6, lu.z + 4.6], look: [lu.x, 1.2, lu.z], fov: 48 };
      api.render(t, cam, K.over(api, t, { lucien: { o: { expr: { sad: 0.8 } } } }));
      GFX.motes(t * 1.4, { n: 120, vy: 120, color: '#ffe6b0', size: 3, seed: 15, a: 0.8 }); for (let i = 0; i < 6; i++) GFX.radial(140 + i * 200, 560 + (i % 2) * 40, 90 + 30 * Math.sin(t * 2 + i), 'rgba(200,240,255,' + (0.35 * inv(i * 0.6, i * 0.6 + 1.6, lt)).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
      POST.set({ bloom: 0.9, thr: 0.5 });
    },
    sableEscapes(lt, d, t, api) {
      const sb = api.marks().sable, open = ease.out(clamp((lt - 0.6) / 2)), gone = ease.in(clamp((lt - 6) / 2)), cam = { pos: [sb.x + 1.2, 1.7, sb.z + 3.0], look: [sb.x, 2.0, sb.z - 1], fov: 40 };
      api.render(t, cam, K.over(api, t, { sable: { pose: { z: sb.z - gone * 1.4 }, o: { expr: { happy: 0.9 }, alpha: 1 - gone } } }));
      const [x, y] = K.proj([sb.x, 2.2, sb.z - 1.2]), c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,60,60,0.95)'; c.lineWidth = 6; c.beginPath();
      for (let i = 0; i <= 10; i++) { const u = i / 10, py = y - 300 * open + u * 600 * open, px = x + (hash(i, 4) - 0.5) * 60 * open; c[i ? 'lineTo' : 'moveTo'](px, py); } c.stroke(); c.restore(); GFX.radial(x, y, 240 * open, 'rgba(255,40,40,0.35)', 'rgba(0,0,0,0)', 1, 'lighter');
      K.staticArcs(x, y, 300, open * (1 - gone * 0.5), t, 8); POST.set({ sat: 0.8, ca: 0.008 });
    },
    earthRift(lt, d, t, api) {
      const tk = api.marks().takuto, open = ease.out(clamp((lt - 0.6) / 2.4)), cam = { pos: [tk.x + 0.6, 1.5, tk.z + 2.4], look: [tk.x - 0.4, 2.0, tk.z - 4], fov: 44 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ry: PI }, o: { expr: { Surprised: 0.5 } } } }));
      const c = GFX.ctx, cx = 640, cy = 300, w = 200 * open, h = 300 * open; c.save(); c.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * PI * 2, r = 1 + (hash(i, 3) - 0.5) * 0.4; c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * w * r, cy + Math.sin(a) * h * r); } c.closePath(); c.clip();
      const im = S3.plateImage('nerima_night'); if (im) c.drawImage(im, cx - 400, cy - 225, 800, 450); else { c.fillStyle = '#101828'; c.fillRect(0, 0, 1280, 720); }
      GFX.motes(t * 3, { n: 80, vy: 900, vx: -120, color: '#a8b8d0', size: 1.3, glow: false, seed: 21, a: 0.6 }); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,90,80,0.9)'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * PI * 2, r = 1 + (hash(i, 3) - 0.5) * 0.4; c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * w * r, cy + Math.sin(a) * h * r); } c.stroke(); c.restore();
      if (lt > 5) { const bl = Math.sin(t * 6) > 0; GFX.radial(cx - 60, cy + 40, 14, bl ? 'rgba(255,40,40,0.95)' : 'rgba(255,40,40,0.1)', 'rgba(0,0,0,0)', 1, 'lighter'); GFX.radial(cx + 60, cy + 40, 14, !bl ? 'rgba(255,40,40,0.95)' : 'rgba(255,40,40,0.1)', 'rgba(0,0,0,0)', 1, 'lighter'); }
      api.postFor();
    },
    riftCloses(lt, d, t, api) {
      const tk = api.marks().takuto, open = 1 - ease.in(clamp((lt - 1.0) / (d - 3))), cam = { pos: [tk.x + 1.4, 1.4, tk.z + 3.4], look: [tk.x - 0.4, 1.9, tk.z - 4], fov: 46 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ry: PI }, o: { expr: { sad: 0.3 } } } }));
      const c = GFX.ctx, cx = 640, cy = 300, w = 200 * open, h = 300 * Math.max(0.05, open); if (open > 0.02) { c.save(); c.beginPath(); c.ellipse(cx, cy, w, h, 0, 0, 7); c.clip(); const im = S3.plateImage('nerima_night'); if (im) c.drawImage(im, cx - 400, cy - 225, 800, 450); c.restore(); GFX.radial(cx, cy, 260 * open + 40, 'rgba(255,80,70,0.35)', 'rgba(0,0,0,0)', 1, 'lighter'); }
      else if (lt < d - 1.4) GFX.radial(cx, cy, 120 * (1 - inv(d - 3, d - 1.4, lt)), 'rgba(255,255,255,0.8)', 'rgba(0,0,0,0)', 1, 'lighter');
      api.postFor();
    },
    cityWakes(lt, d, t) {
      K.plate('dawn_city', lt, d, { z0: 1.12, z1: 1.0, tilt: 0.02 }); GFX.radial(900, 180, 800, 'rgba(255,220,150,0.3)', 'rgba(0,0,0,0)', 1, 'lighter');
      GFX.motes(t, { n: 100, vy: -40, color: '#fff0d0', size: 2.4, seed: 17, a: 0.8 }); for (let i = 0; i < 14; i++) GFX.radial(80 + hash(i, 3) * 1120, 480 + hash(i, 4) * 200, 40, 'rgba(180,230,255,' + (0.6 * inv(i * 0.4, i * 0.4 + 1, lt)).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
      POST.set({ bloom: 0.9, thr: 0.5, sat: 1.15 });
    },
    tofuCrown(lt, d, t, api) {
      const tf = api.marks().tofu, tk = api.marks().takuto, cam = { pos: [lerp(tk.x, tf.x, 0.5) + 0.4, 1.3, lerp(tk.z, tf.z, 0.5) + 2.0], look: [lerp(tk.x, tf.x, 0.5), 1.0, lerp(tk.z, tf.z, 0.5)], fov: 36 };
      api.render(t, cam, K.over(api, t, { tofu: { pose: { y: 0.6 + Math.sin(t * 3) * 0.06 }, o: { face: lt > 0.6 && lt < 5.5 ? 'scan' : 'idle' } }, takuto: { pose: { ...P().ready, weapon: 1.2 }, o: { axeGlow: 0.3 } } }));
      if (lt > 1) VFX.holo(lt - 1, d - 1.2, { x: 900, y: 230, w: 460, title: 'BRAND APPRAISAL', color: '#ff7ab6', accent: '#ffd6ea', lines: [{ t: 'Kirishima Takuto', big: true }, 'Brand: RUINBREAKER', { t: lt > 4.2 ? 'Rank: ERROR  ♛' : 'Rank: ...', col: '#ffd27a' }] });
      api.postFor();
    },
    crossingBell(lt, d, t, api) {
      const cam = { pos: [-2.6 + lt * 0.02, 1.4, 7.8 - lt * 0.05], look: [2.2, 1.4, -1.0], fov: 28 }, gate = ease.io(inv(4, 6, lt)), blink = lt > 4 && Math.sin(t * 7) > 0;
      S3.frame({ env: 'earth', t, cam, cast: [], envOpts: { gate: 1 - gate, cat: true, catUp: true, catRy: 0.6, lamps: blink } });
      S3.frame({ env: 'earth', only: 'cast', t, cam, cast: [['sable', { x: 2.4, z: -1.6, ry: -0.5, uaR: [0.05, 0.15], elR: 0.3 }, { expr: { happy: 0.8 } }]], alpha: ease.out(inv(1.0, 2.6, lt)), envOpts: {} });
      const e = K.proj(S3.jointPos('sable', 'head', 0.16)); GFX.radial(e[0] - 4, e[1], 26, 'rgba(230,240,255,0.95)', 'rgba(150,170,255,0)', inv(2.6, 3.2, lt) * (0.7 + 0.3 * Math.sin(t * 25)), 'lighter');
      if (lt > 4) { [[540, 300], [600, 300]].forEach(([x, y], i) => GFX.radial(x, y, 20, ((i === 0) === blink) ? 'rgba(255,40,40,0.9)' : 'rgba(255,40,40,0.08)', 'rgba(0,0,0,0)', 1, 'lighter')); }
      K.rain(t, 0.55); GFX.fill('#000', inv(d - 1.6, d, lt)); POST.set({ sat: 0.85, vig: 0.7, bloom: 0.6, thr: 0.6 });
    },
    returnCard(lt, d, t) {
      const a = inv(0.4, 1.6, lt) * (1 - inv(d - 1.4, d, lt)); GFX.fill('#050406');
      GFX.txt('ルインブレイカー', 640, 280, { font: '400 30px ' + GFX.FONT.jp, fill: '#e8343c', ls: 10, a });
      GFX.txt('RUINBREAKER', 640, 380, { font: '900 110px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 8, a });
      GFX.txt('WILL RETURN', 640, 460, { font: '800 30px ' + GFX.FONT.disp, fill: '#bdb6b0', ls: 16, a: a * inv(1.6, 2.6, lt) });
      GFX.txt('SEASON 2', 640, 520, { font: '700 16px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a: a * inv(2.6, 3.6, lt) });
    },
  };
})();
const EP12 = DIRECTOR.episode(EP12_SCRIPT, EP12_CUSTOM);
