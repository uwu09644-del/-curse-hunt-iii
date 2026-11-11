/* RUINBREAKER — Episode 11: hand-directed moments (Tyr waking, Tofu's reading, frost on the windows, the dome hit,
   the double block, the deal in the void, the Crimson Calamity, Vesper's final verse, Nemu's eighth life) and the build. */
'use strict';

const EP11_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT, TY = 'm_tyr';
  const snow = (t, a = 0.7) => K.snow(t, a);
  const calamity = (api, t, who = 'takuto', a = 1) => { const [x, y] = K.proj(S3.jointPos(who, 'hips', 0.2)); VFX.aura(t, { x, y, w: 340, h: 520, n: 70, a: 0.9 * a, color: '#ff2a1a' }); S3.eyePos(who).forEach(e => { const [ex, ey] = K.proj(e); GFX.radial(ex, ey, 22, 'rgba(255,40,30,' + a.toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); }); K.crimson(a); };
  const swingAt = (lt, hit) => S3.seq(lt, [[0, P().ready], [hit - 0.3, { ...P().windup, weapon: 2.0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.7, P().ready]]);
  return {
    tyrWakes(lt, d, t) {
      K.plate('tyr_crater', lt, d, { z0: 1.04, z1: 1.16, shake: lt > 7 ? 6 : 0 }); GFX.fill('#a8c8e8', 0.18, 'multiply');
      K.staticArcs(640, 420, 260, inv(0.6, 2, lt) * (1 - inv(6, 7.4, lt)), t, 7);
      const k = ease.out(clamp((lt - 6.4) / 3)); K.sil(TY, 640, 640, lerp(200, 520, k), inv(6, 7.4, lt), t, { filter: 'brightness(0.4) saturate(0.5)', eyeCol: '160,220,255', rate: 0.4 });
      if (lt > 6.4 && lt < 6.5) GFX.fill('#e8f4ff', 0.8); snow(t, 0.8); POST.set({ sat: 0.75, bloom: 0.7, thr: 0.55, vig: 0.6 });
    },
    tofuReads(lt, d, t, api) {
      const tf = api.marks().tofu, cam = { pos: [tf.x - 1.3, 0.95, tf.z + 1.2], look: [tf.x, 0.65, tf.z], fov: 32 };
      api.render(t, cam, K.over(api, t, { tofu: { pose: { y: 0.5 + Math.sin(t * 2) * 0.05 }, o: { face: lt > 0.6 ? 'scan' : 'idle' } } }));
      if (lt > 1.0) VFX.holo(lt - 1.0, d - 1.2, { x: 860, y: 230, w: 480, title: 'BRAND APPRAISAL', color: '#ff7ab6', accent: '#ffd6ea', lines: [{ t: 'Lucien Aurel', big: true }, 'Brand: SANCTUM  ·  Rank S', { t: lt > 4 ? 'Second signature: STATIC (key)' : '...', col: '#b0c8ff' }] });
      if (lt > 4 && lt < 4.4) GFX.fill('#c0d0ff', 0.15, 'lighter'); api.postFor();
    },
    frostCreeps(lt, d, t, api) {
      const hr = api.marks().haruki, cam = { pos: [hr.x + 1.6, 1.5, hr.z + 2.4], look: [hr.x, 1.8, hr.z - 3], fov: 44 };
      api.render(t, cam, api.castList(t)); const k = ease.io(clamp(lt / d)), c = GFX.ctx;
      const g = c.createRadialGradient(640, 360, 200, 640, 360, 820); g.addColorStop(0, 'rgba(220,240,255,0)'); g.addColorStop(1, 'rgba(220,240,255,' + (0.7 * k).toFixed(2) + ')'); c.fillStyle = g; c.fillRect(0, 0, 1280, 720);
      for (let i = 0; i < 10; i++) K.frost(hash(i, 2) < 0.5 ? 40 + hash(i, 3) * 200 : 1040 + hash(i, 3) * 200, 60 + hash(i, 4) * 600, 140, k, t);
      POST.set({ sat: lerp(1, 0.7, k), bloom: 0.6, thr: 0.6 });
    },
    domeHit(lt, d, t) {
      K.plate('lumen_dome', lt, d, { z0: 1.0, z1: 1.1, shake: lt > 7 && lt < 8 ? 18 : 0 });
      const walk = ease.io(clamp((lt - 1) / 5)), x = lerp(1180, 820, walk); K.sil(TY, x, 700, lerp(360, 520, walk), inv(1, 2.4, lt), t, { filter: 'brightness(0.5) saturate(0.6)', eyeCol: '160,220,255', rate: 1.2 });
      if (lt > 7) { K.cracks(760, 240, 420, ease.out(clamp((lt - 7) / 0.6)), { n: 12, w: 3, col: 'rgba(255,240,190,0.95)' }); if (lt < 7.08) GFX.fill('#fff', 0.85); VFX.ring(lt - 7, { x: 760, y: 240, r1: 1200, dur: 0.8, flat: 0.9, color: '#ffe8b0' }); }
      snow(t); POST.set({ bloom: 0.8, thr: 0.55 });
    },
    tyrFreezes(lt, d, t, api) {
      const m = api.marks(), rn = m.rin, ty = m[TY], cam = { pos: [rn.x + 2.4, 1.2, rn.z + 2.4], look: [lerp(rn.x, ty.x, 0.5), 1.6, lerp(rn.z, ty.z, 0.5)], fov: 44 }, k = ease.out(clamp((lt - 0.4) / 1.4));
      api.render(t, cam, K.over(api, t, { rin: { pose: { uaR: [1.8, 0.4], elR: 0.3, crouch: 0.2 * k }, o: { expr: { Surprised: 0.6 } } }, wick: { o: { expr: { sad: 0.6 } } } }));
      const a = K.proj(S3.jointPos('rin', 'handR', 0)), b = K.proj([ty.x, 1.2, ty.z]); if (lt < 3) K.thread(a, b, t, 1, { color: [lerp(255, 200, k), lerp(80, 230, k), lerp(90, 255, k)].map(Math.round) }); else VFX.sparks(lt - 3, { x: lerp(a[0], b[0], 0.5), y: lerp(a[1], b[1], 0.5), n: 50, spread: 3, speed: 700, color: '#d8f0ff' });
      K.frost(b[0], b[1], 400, k, t); GFX.fill('#a8d8ff', 0.12 * k, 'screen'); snow(t); api.postFor();
    },
    encoreTyr(lt, d, t, api) {
      const v = api.marks().valentine, ty = api.marks()[TY], cam = { pos: [v.x + 2.4, 1.3, v.z + 2.0], look: [ty.x, 2.4, ty.z], fov: 46 };
      api.render(t, cam, K.over(api, t, { valentine: { pose: { uaL: [2.4, 0.6], elL: 0.3, uaR: [2.4, 0.6], elR: 0.3, ry: PI }, o: { expr: lt > 3.6 ? { Surprised: 0.7 } : { happy: 0.8 } } }, [TY]: { pose: { z: ty.z + ease.io(clamp((lt - 3) / 3)) * 2.4 }, o: { tint: '#ffd8ee' } } }));
      const k = ease.out(clamp((lt - 0.4) / 1.0)) * (1 - inv(3.8, 5, lt)); GFX.fill('#ff60b0', 0.14 * k, 'screen'); K.cracks(640, 300, 600, inv(3.6, 4.6, lt), { n: 14, w: 2, col: 'rgba(255,180,230,0.9)' }); GFX.motes(t, { n: 60, vy: 40, color: '#ff9ad8', size: 3, seed: 7, a: k }); snow(t); api.postFor();
    },
    harnessDouble(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, va = m.valentine, ty = m[TY], hits = [3.2, 6.0], P1 = { x: lerp(va.x, ty.x, 0.25), z: lerp(va.z, ty.z, 0.25) };
      const run = ease.out(clamp(lt / 1.6)), pos = { x: lerp(tk.x, P1.x, run), z: lerp(tk.z, P1.z, run) }, lock = clamp((lt - 2.4) / 0.3), hi = hits.findIndex(h => lt > h && lt < h + 0.6), snapK = lt > 6.6 ? clamp((lt - 6.6) / 0.9) : 0;
      const cam = K.jolt(lt < 2 ? { pos: [pos.x + 3, 1.0, pos.z + 2.6], look: [pos.x, 1.2, pos.z - 1], fov: 40 } : { pos: [pos.x + 1.8, 1.1, pos.z + 1.9], look: [pos.x, 1.6, pos.z - 1.2], fov: 36 }, t, hi >= 0 ? 0.2 : 0.01);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...(lt < 1.6 ? S3.run(t * 15, 1) : lock > 0 ? P().block : P().ready), x: pos.x, z: pos.z, weapon: lock > 0 ? 1.2 : 0, ry: K.yaw(pos, ty) }, o: { axeGlow: 0.3, expr: { angry: 0.8 } } }, [TY]: { o: { lunge: hits.reduce((s, h) => Math.max(s, 1 - Math.abs(lt - h) / 0.6), 0) } } }));
      if (lock > 0) K.chains(t, lock * (1 - inv(d - 1, d, lt)), snapK);
      hits.forEach(h => { if (lt > h && lt < h + 0.9) { const [x, y] = K.proj(S3.weaponTip('takuto', 0.5)); VFX.sparks(lt - h, { x, y, n: 100, spread: 3, speed: 1300, color: '#ffd28a' }); VFX.ring(lt - h, { x, y, r1: 800, dur: 0.6, flat: 0.9 }); if (lt < h + 0.07) GFX.fill('#fff', 0.7); } });
      snow(t); api.postFor();
    },
    tyrRaises(lt, d, t, api) {
      const ty = api.marks()[TY], h = K.H(TY), up = ease.io(clamp((lt - 0.6) / 3)), cam = K.jolt({ pos: [ty.x - 3.2, 1.3, ty.z + 8.6], look: [ty.x, h * (0.6 + up * 0.25), ty.z], fov: 50 }, t, 0.02);
      api.render(t, cam, K.over(api, t, { [TY]: { o: { squash: -up * 0.12, tilt: -up * 0.06, shake: 0.2 } } }));
      const [x, y] = K.proj([ty.x + 1, h * 1.05, ty.z]); GFX.radial(x, y - up * 60, 160, 'rgba(160,220,255,0.55)', 'rgba(0,0,0,0)', 1, 'lighter'); snow(t); POST.set({ sat: 0.8, vig: 0.7 });
    },
    voidDeal(lt, d, t, api) {
      const tk = api.marks().takuto, a = -0.5 + lt / d;
      api.render(t, { pos: [tk.x + Math.sin(a) * 3, 1.3, tk.z + Math.cos(a) * 3], look: [tk.x, 1.3, tk.z], fov: 36 }, api.castList(t));
      RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, lerp(1.0, 1.2, lt / d), { t, wind: 1.4 + VOICE.amp('AKURO', t) * 2 }, { a: 0.5 * inv(0, 1.5, lt), comp: 'screen' });
      if (lt > d - 2) { const k = inv(d - 2, d, lt), c = GFX.ctx; c.save(); c.fillStyle = 'rgba(255,40,30,' + (0.8 * k).toFixed(2) + ')'; c.fillRect(640 - 4 - k * 640, 0, 8 + k * 1280, 720); c.restore(); }
      GFX.motes(t, { n: 70, vy: -70, color: '#ff4a3a', size: 2.4, seed: 8, a: 0.7 }); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.15, vig: 0.7 });
    },
    calamityRise(lt, d, t, api) {
      const tk = api.marks().takuto, k = ease.out(clamp(lt / 3)), cam = K.jolt(lt < 7 ? { pos: [tk.x + Math.sin(lt * 0.4) * 3, lerp(0.5, 1.2, k), tk.z + Math.cos(lt * 0.4) * 3], look: [tk.x, 1.3, tk.z], fov: 38 } : { pos: [tk.x + 0.4, 1.62, tk.z + 0.9], look: [tk.x, 1.6, tk.z], fov: 26 }, t, 0.02 + (lt < 1 ? 0.1 : 0));
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...P().ready, y: 0.15 * Math.sin(t * 2) * k, crouch: 0.1 }, o: { axeGlow: 1, expr: { happy: 0.6 * k } } } }));
      calamity(api, t, 'takuto', k); RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, 1.25, { t, wind: 2 }, { a: 0.22 * k, comp: 'screen' });
      if (lt < 0.1) GFX.fill('#fff', 0.9); if (lt > 0.1 && lt < 0.2) GFX.impact('inv'); GFX.motes(t, { n: 100, vy: -120, color: '#ff4a3a', size: 2.6, seed: 3, a: k });
    },
    calamityVsTyr(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, ty = m[TY], hits = [0.8, 1.6, 2.3, 3.1, 3.8, 4.6, 5.6, 6.4, 7.6], hi = hits.findIndex((h, i) => lt >= h && lt < (hits[i + 1] ?? d)), h0 = hits[Math.max(0, hi)], ph = lt - h0;
      const H1 = { x: lerp(tk.x, ty.x, 0.6), z: lerp(tk.z, ty.z, 0.6) }, side = hi % 2 ? 1 : -1, [ax, ay, az] = [[3, 1.2, 3], [-3.2, 2.6, 2.4], [0.8, 0.6, 4.4], [-1.6, 3.4, 3.4]][Math.max(0, hi) % 4];
      const cam = K.jolt({ pos: [H1.x + ax, ay, H1.z + az], look: [lerp(H1.x, ty.x, 0.5), 2.6, lerp(H1.z, ty.z, 0.5)], fov: 44 }, t, ph < 0.25 ? 0.3 : 0.03);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...(ph < 0.12 ? { ...P().windup, weapon: 2.0 } : { ...P().chop, weapon: 1.7 }), x: H1.x + side * 0.6, z: H1.z, y: [0, 1.4, 2.6, 0.6][Math.max(0, hi) % 4], ry: K.yaw(H1, ty) + side * 0.4 }, o: { axeGlow: 1, expr: { happy: 0.7 } } }, [TY]: { o: { flash: ph < 0.08 ? 1 : 0, shake: 0.8, tilt: side * 0.05, lunge: hi === 4 ? 0.8 : 0 } } }));
      if (ph < 0.6) { const [x, y] = K.proj([ty.x, K.H(TY) * (0.3 + 0.1 * (hi % 5)), ty.z]); VFX.slash(ph, { x, y, r: 420, a0: side > 0 ? -2.4 : 0.8, a1: side > 0 ? 0.9 : -2.2, dur: 0.12, hold: 0.3, w: 130, flat: 0.7, rot: side * 0.3, color: '#ff2a2a' }); VFX.sparks(ph, { x, y, n: 60, spread: 3, speed: 1400, color: '#c8eaff' }); }
      calamity(api, t, 'takuto', 1); if (ph < 0.05) GFX.impact('inv'); snow(t, 0.5);
    },
    axeBreak(lt, d, t, api) {
      const ty = api.marks()[TY], h = K.H(TY), hit = 2.4, cam = K.jolt({ pos: [ty.x + 3.4, h * 0.85, ty.z + 5.2], look: [ty.x + 1.4, h * 0.85, ty.z], fov: 36 }, t, lt > hit && lt < hit + 0.8 ? 0.3 : 0.02);
      api.render(t, cam, K.over(api, t, { [TY]: { o: { flash: lt > hit && lt < hit + 0.12 ? 1 : 0, shake: lt > hit ? 1 - inv(hit, hit + 2, lt) : 0.1 } } }));
      const [x, y] = K.proj([ty.x + 1.4, h * 0.9, ty.z]);
      if (lt > hit - 0.2) { VFX.slash(lt - hit + 0.2, { x, y, r: 400, a0: -2.4, a1: 0.9, dur: 0.15, hold: 0.6, w: 140, flat: 0.7, rot: 0.2, color: '#ff2a2a' }); K.cracks(x, y, 360, ease.out(clamp((lt - hit) / 0.4)), { n: 12, w: 4, col: 'rgba(200,235,255,0.95)' }); }
      if (lt > hit + 0.4) { VFX.debris(lt - hit - 0.4, { x, y, n: 90, speed: 1100, size: 18, seed: 22 }); GFX.motes(lt, { n: 80, vy: 120, color: '#d8f0ff', size: 4, glow: true, seed: 12, a: 1 - inv(hit + 1, d, lt) }); }
      if (lt > hit && lt < hit + 0.06) GFX.fill('#fff'); K.crimson(0.7); snow(t, 0.5);
    },
    turnOnCity(lt, d, t, api) {
      const tk = api.marks().takuto, k = ease.io(clamp(lt / 2.4)), cam = lt < 4 ? { pos: [tk.x - 0.8, 1.4, tk.z - 2.6], look: [tk.x, 1.5, tk.z], fov: 32 } : { pos: [tk.x + 0.5, 1.2, tk.z + 2.4], look: [tk.x, 2.4, tk.z - 12], fov: 50 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...P().ready, ry: lerp(PI, 0, k) }, o: { axeGlow: 1, expr: { happy: 0.8 } } } }));
      if (lt > 4) { const im = S3.plateImage('lumen_dome'); if (im) { const c = GFX.ctx; c.save(); c.globalAlpha = 0.35; c.globalCompositeOperation = 'screen'; c.drawImage(im, 0, 0, 1280, 720); c.restore(); } K.gold(640, 220, 1100, 400, 0.6, t); }
      calamity(api, t, 'takuto', 1); snow(t, 0.4);
    },
    galeExecute(lt, d, t, api) {
      const m = api.marks(), vs = m.vesper, tk = m.takuto, k = ease.out(clamp((lt - 0.4) / 1.2)), cut = 3.4;
      const cam = K.jolt(lt < cut ? { pos: [vs.x + 1.4, 1.6, vs.z + 2.2], look: [tk.x, 1.4, tk.z], fov: 40 } : { pos: [tk.x + 2.0, 1.3, tk.z + 2.2], look: [tk.x, 1.4, tk.z], fov: 34 }, t, lt > cut && lt < cut + 0.6 ? 0.2 : 0.01);
      api.render(t, cam, K.over(api, t, { vesper: { pose: { uaR: [2.4, 0.6], elR: 0.2, uaL: [2.0, 0.6], elL: 0.3, ry: K.yaw(vs, tk) }, o: { expr: { angry: 0.7 } } }, takuto: { pose: { ...(lt > cut ? P().block : P().ready), weapon: 1.2, ry: K.yaw(tk, vs) }, o: { axeGlow: 1 } } }));
      K.ribbons(K.proj(S3.jointPos('vesper', 'handR', 0)), K.proj([tk.x, 1.3, tk.z]), t, k, { n: 8 });
      if (lt > cut && lt < cut + 1.4) { const [x, y] = K.proj([tk.x, 1.4, tk.z]); VFX.sparks(lt - cut, { x, y, n: 120, spread: 3.2, speed: 1400, color: '#e8f4ff' }); VFX.ring(lt - cut, { x, y, r1: 900, dur: 0.6, flat: 0.9, color: '#ffffff' }); }
      calamity(api, t, 'takuto', 1); snow(t, 0.5);
    },
    haruFreezeBreak(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, f0 = 0.6, brk = 2.6, frz = lt > f0 && lt < brk, cam = K.jolt({ pos: [tk.x + 1.6, 1.4, tk.z + 2.0], look: [tk.x, 1.3, tk.z], fov: 34 }, t, lt > brk && lt < brk + 0.4 ? 0.25 : 0.01);
      api.render(t, cam, K.over(api, t, { takuto: { pose: frz ? { ...P().windup, weapon: 2.0 } : lt > brk ? swingAt(lt - brk, 0.3) : P().ready, o: {} }, haruki: { pose: { uaR: [1.6, 0.2], elR: 0.2, x: lerp(m.haruki.x, tk.x + 0.6, ease.out(clamp(lt / 0.6))), z: lerp(m.haruki.z, tk.z + 0.5, ease.out(clamp(lt / 0.6))) } } }));
      const [x, y] = K.proj([tk.x, 1.2, tk.z]); if (frz) { K.frost(x, y, 360, ease.out(clamp((lt - f0) / 0.3)), t); K.cracks(x, y - 30, 260, inv(1.4, brk, lt), { n: 10, w: 2.4, col: 'rgba(255,60,50,0.95)' }); }
      if (lt > brk && lt < brk + 0.9) { VFX.sparks(lt - brk, { x, y, n: 120, spread: 3, speed: 1200, color: '#d8f0ff' }); if (lt < brk + 0.06) GFX.fill('#fff', 0.8); }
      calamity(api, t, 'takuto', 1); snow(t, 0.4);
    },
    threadBurns(lt, d, t, api) {
      const m = api.marks(), rn = m.rin, tk = m.takuto, cam = { pos: [lerp(rn.x, tk.x, 0.5) + 0.6, 1.2, lerp(rn.z, tk.z, 0.5) + 2.0], look: [lerp(rn.x, tk.x, 0.5), 1.1, lerp(rn.z, tk.z, 0.5)], fov: 36 };
      api.render(t, cam, K.over(api, t, { rin: { pose: { uaR: [1.0, 0.4], elR: 0.4, lean: -0.25, ry: K.yaw(rn, tk) }, o: { expr: { sad: 0.7 } } } }));
      const a = K.proj(S3.jointPos('rin', 'handR', 0)), b = K.proj(S3.jointPos('takuto', 'handL', 0)), burn = clamp((lt - 0.8) / 1.0);
      if (burn < 1) K.thread(a, b, t, 1 - burn * 0.5, { w: 3 }); if (burn > 0 && burn < 1) VFX.sparks(lt - 0.8, { x: lerp(b[0], a[0], burn * 0.5), y: lerp(b[1], a[1], burn * 0.5), n: 40, spread: 3, speed: 600, color: '#ff6a3a' });
      calamity(api, t, 'takuto', 1); snow(t, 0.4);
    },
    nemuStep(lt, d, t, api) {
      const m = api.marks(), nm = m.nemu, tk = m.takuto, walk = ease.io(clamp(lt / 3.4)), np = { x: lerp(nm.x, tk.x + 0.2, walk * 0.8), z: lerp(nm.z, tk.z + 1.0, walk * 0.8) };
      const cam = lt < 4 ? { pos: [tk.x - 0.4, 1.5, tk.z - 1.8], look: [np.x, 1.2, np.z], fov: 34 } : { pos: [np.x + 0.5, 1.35, np.z + 1.0], look: [np.x, 1.3, np.z], fov: 26 };
      api.render(t, cam, K.over(api, t, { nemu: { pose: { x: np.x, z: np.z, ry: K.yaw(np, tk), ...(walk < 1 ? S3.walk(t * 3.6, 0.6) : { uaL: [0.6, 0.4], elL: 0.4, uaR: [0.6, 0.4], elR: 0.4 }) }, o: { expr: { sad: 0.4 } } }, takuto: { pose: { ...P().windup, weapon: 2.0, ry: K.yaw(tk, np) }, o: { axeGlow: 1 } } }));
      calamity(api, t, 'takuto', 0.9); snow(t, 0.5);
    },
    nemuFalls(lt, d, t, api) {
      const m = api.marks(), nm = m.nemu, tk = m.takuto, hit = 1.4, np = { x: lerp(nm.x, tk.x + 0.2, 0.8), z: lerp(nm.z, tk.z + 1.0, 0.8) }, fall = ease.in(clamp((lt - hit - 0.2) / 1.0)), still = lt > 4.2;
      const cam = K.jolt(lt < 4.2 ? { pos: [np.x + 2.4, 1.1, np.z + 1.6], look: [lerp(np.x, tk.x, 0.4), 1.0, lerp(np.z, tk.z, 0.4)], fov: 40 } : (() => { const dx = np.x - tk.x, dz = np.z - tk.z, l = Math.hypot(dx, dz) || 1; return { pos: [tk.x - dx / l * 0.95 - dz / l * 0.3, 1.62, tk.z - dz / l * 0.95 + dx / l * 0.3], look: [tk.x, 1.58, tk.z], fov: 28 }; })(), t, lt > hit && lt < hit + 0.5 ? 0.15 : 0);
      const fade = inv(4.6, 7.2, lt);
      api.render(still ? 4.2 : t, cam, K.over(api, t, { nemu: { pose: { ...P().hit, x: np.x, z: np.z + fall * 0.6, pitch: fall * 1.4, y: 0, ry: K.yaw(np, tk) }, o: { expr: { relaxed: 0.9 } } }, takuto: { pose: lt < hit ? { ...P().windup, weapon: 2.0, ry: K.yaw(tk, np) } : { ...P().chop, weapon: 1.7, ry: K.yaw(tk, np) }, o: { axeGlow: 1 - fade, expr: lt > 6 ? { sad: 1 } : { happy: 0.5 } } } }));
      if (lt > hit && lt < hit + 0.1) GFX.fill('#fff', 0.9); if (lt > hit + 0.1 && lt < hit + 0.3) GFX.fill('#000', 0.9);
      calamity(api, t, 'takuto', 1 - fade); if (lt > 4.2) POST.set({ sat: lerp(1, 0.2, fade), vig: 0.8, bloom: 0.3, thr: 0.8 });
      snow(still ? 4.2 : t, 0.6);
    },
    redRecedes(lt, d, t, api) {
      const tk = api.marks().takuto, k = 1 - ease.io(clamp((lt - 2) / 4)), cam = { pos: [tk.x + 0.4, 1.55, tk.z + 1.0], look: [tk.x, 1.5, tk.z], fov: 28 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { crouch: 0.3 * (1 - k), weapon: 0 }, o: { axeGlow: k, expr: { sad: 0.8 } } } }));
      if (k > 0.05) calamity(api, t, 'takuto', k); RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, 1.2, { t, wind: 1 }, { a: 0.3 * k, comp: 'screen' });
      if (k < 0.3) POST.set({ sat: 0.4, vig: 0.8, bloom: 0.3, thr: 0.8 }); snow(t, 0.5);
    },
    snowSilence(lt, d, t, api) {
      const nm = api.marks().nemu, a = lt / d * 0.6, cam = { pos: [nm.x + Math.sin(a) * 3, 2.0, nm.z + Math.cos(a) * 3], look: [nm.x, 0.3, nm.z], fov: 36 };
      api.render(t, cam, api.castList(t)); POST.set({ sat: 0.35, vig: 0.8, bloom: 0.4, thr: 0.75 }); snow(t * 0.5, 0.8);
    },
    nemuWakes(lt, d, t, api) {
      const nm = api.marks().nemu, cam = { pos: [nm.x - 0.75, 1.75, nm.z + 1.3], look: [nm.x + 0.15, 0.5, nm.z + 0.1], fov: 32 }, k = inv(2.6, 4, lt); // front-left: Takuto kneels to her right, out of the lens
      api.render(t, cam, K.over(api, t, { nemu: { o: { expr: lt > 5 ? { happy: 0.5 } : { relaxed: 0.9 }, blink: lt < 2.6 ? 1 : undefined } } }).filter(c => c[0] === 'nemu' || c[0] === 'takuto')); // just the two of them
      const [x, y] = K.proj(S3.jointPos('nemu', 'chest', 0)); GFX.radial(x, y, 300 * k, 'rgba(255,240,220,' + (0.35 * k * (1 - inv(5, d, lt))).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
      POST.set({ sat: lerp(0.35, 1, k), vig: 0.6, bloom: 0.6, thr: 0.6 }); snow(t * 0.5, 0.6);
    },
    letterTorn(lt, d, t, api) {
      const vs = api.marks().vesper, cam = { pos: [vs.x + 0.6, 1.5, vs.z + 1.4], look: [vs.x, 1.4, vs.z], fov: 30 };
      api.render(t, cam, K.over(api, t, { vesper: { pose: { uaR: [1.2, 0.3], elR: 0.8, uaL: [1.2, 0.3], elL: 0.8 } } }));
      const [x, y] = K.proj(S3.jointPos('vesper', 'handR', 0)), tear = clamp((lt - 1.0) / 0.6), c = GFX.ctx;
      [-1, 1].forEach(sd => { const fl = clamp((lt - 2) / 3), px = x + sd * (10 + tear * 30) + fl * sd * 300, py = y - 10 - fl * 200 + Math.sin(lt * 4 + sd) * 20; c.save(); c.translate(px, py); c.rotate(sd * tear * 0.4 + fl * 3 * sd); c.fillStyle = '#efe6d2'; c.fillRect(-26, -34, 26, 68); c.restore(); });
      K.ribbons([x, y], [x + 400, y - 300], t, inv(2, 3, lt), { n: 3 }); snow(t, 0.6); api.postFor();
    },
    nextTitle: K.title('最終話', 'ルインブレイカー', 'RUINBREAKER', 84),
  };
})();
const EP11 = DIRECTOR.episode(EP11_SCRIPT, EP11_CUSTOM);
