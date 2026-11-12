/* RUINBREAKER — Episode 7: hand-directed moments (eyes in the Greatwood, Wick's griddle, the ogre raid, the chieftain
   kneeling, the ogre camp, the grey pack, the wrist thread, Kurozane on the ridge) and the build. */
'use strict';

const EP07_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT, OG = 'm_plume';
  const feathers = (t, a = 0.8) => GFX.motes(t * 2, { n: 40, vy: 60, vx: 20, color: '#c83a2a', size: 3.4, glow: false, seed: 17, a });
  function wolfShape(x, y, s, a, t, i) { // a grey wolf in mid-leap: dark body, two red eyes
    const c = GFX.ctx; c.save(); c.globalAlpha = a; c.fillStyle = '#16141c'; c.translate(x, y); c.rotate(Math.sin(t * 6 + i) * 0.1 - 0.2);
    c.beginPath(); c.ellipse(0, 0, s, s * 0.38, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(s * 0.9, -s * 0.22, s * 0.38, s * 0.26, -0.3, 0, 7); c.fill();
    c.beginPath(); c.moveTo(s * 0.9, -s * 0.42); c.lineTo(s * 1.0, -s * 0.72); c.lineTo(s * 1.12, -s * 0.38); c.fill(); c.beginPath(); c.moveTo(-s * 0.9, 0); c.quadraticCurveTo(-s * 1.5, -s * 0.4, -s * 1.7, -s * 0.1); c.lineTo(-s * 0.9, s * 0.1); c.fill(); c.restore();
    GFX.radial(x + s * 1.02, y - s * 0.3, s * 0.12 + 3, 'rgba(255,50,40,' + (0.95 * a).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
  }
  return {
    greyEyes(lt, d, t) {
      K.plate('forest_night', lt, d, { z0: 1.05, z1: 1.16 });
      GFX.fill('#05060c', 0.35); K.eyePairs(46, lt, inv(0.8, 3, lt), { y0: 240, y1: 520, size: 4 });
      const run = clamp((lt - 1.0) / (d - 1.5)); K.sil(OG, lerp(1300, -100, run), 640, 320, 0.9, t * 3, { filter: 'brightness(0.18)', eyes: false, rate: 9 });
      feathers(t); POST.set({ bloom: 0.7, thr: 0.55, vig: 0.7, sat: 0.9 });
    },
    griddle(lt, d, t, api) {
      const wk = api.marks().wick, cam = { pos: [wk.x + 1.0, 1.35, wk.z - 1.3], look: [wk.x, 1.0, wk.z + 0.4], fov: 32 };
      api.render(t, cam, K.over(api, t, { wick: { pose: { uaR: [1.2, 0.2], elR: 0.9, uaL: [1.0, 0.3], elL: 0.8, lean: 0.15, headX: 0.25 }, o: { expr: { happy: 0.6 } } } }));
      const [hx, hy] = K.proj(S3.jointPos('wick', 'handR', 0)), flip = clamp((lt - 4.4) / 0.8), c = GFX.ctx, px = hx + 30, py = hy - 20 - Math.sin(flip * PI) * 160;
      GFX.radial(hx, hy + 40, 120, 'rgba(110,180,255,0.6)', 'rgba(40,90,255,0)', 1, 'lighter');
      c.save(); c.translate(px, py); c.scale(1, Math.cos(flip * PI * 2) * 0.35 + (flip > 0 ? 0 : 0.0)); c.fillStyle = flip > 0.5 ? '#c27a34' : '#e2b46a'; c.beginPath(); c.ellipse(0, 0, 58, 58, 0, 0, 7); c.fill(); c.strokeStyle = '#7a4a1a'; c.lineWidth = 3; c.stroke(); c.restore();
      GFX.motes(t, { n: 30, vy: -60, color: '#e8e0d0', size: 6, glow: false, seed: 5, a: 0.3, x0: px - 120, x1: px + 120, y0: py - 200, y1: py + 40 });
      api.postFor();
    },
    alarmBell(lt, d, t) {
      const ring = Math.abs(Math.sin(lt * 7)) * (1 - inv(2.5, d, lt));
      K.plate('village_night', lt, d, { z0: 1.08, z1: 1.14, shake: ring * 8 });
      GFX.radial(900, 520, 600 * inv(0.5, d, lt), 'rgba(255,120,40,0.4)', 'rgba(255,60,0,0)', 1, 'lighter'); K.embers(t, inv(0.6, 2, lt)); POST.set({ bloom: 0.6, thr: 0.6 });
    },
    ogreRaid(lt, d, t) {
      K.plate('village_burning', lt, d, { z0: 1.04, z1: 1.14, pan: -0.03 });
      [[0, 1.0, 520, 260], [1.4, 0.8, 470, 200], [2.6, 1.1, 560, 300], [3.8, 0.9, 500, 230]].forEach(([t0, sp, y, h], i) => { const k = clamp((lt - t0) / 4.2 * sp); if (k > 0 && k < 1) K.sil(OG, lerp(i % 2 ? -150 : 1430, i % 2 ? 1430 : -150, k), y, h, 0.95, t * 3 + i, { filter: 'brightness(0.22)', flip: i % 2 === 1, rate: 8, ph: i }); });
      K.embers(t, 1); GFX.radial(640, 600, 700, 'rgba(255,110,40,0.2)', 'rgba(0,0,0,0)', 1, 'lighter'); POST.set({ bloom: 0.7, thr: 0.55, sat: 1.1 });
    },
    spearBreak(lt, d, t, api) {
      const m = api.marks()[OG], h = K.H(OG), cam = K.jolt({ pos: [m.x + 2.0, h * 0.5, m.z + 4.2], look: [m.x + 0.4, h * 0.55, m.z], fov: 36 }, t, lt < 0.5 ? 0.12 : 0.01);
      api.render(t, cam, K.over(api, t, { [OG]: { o: { shake: lt < 1.0 ? 0.7 : 0.1, flash: lt < 0.1 ? 1 : 0, lunge: -0.3 * (1 - inv(0, 1.2, lt)) } } }));
      const [x, y] = K.proj([m.x + 0.6, h * 0.6, m.z]); VFX.debris(lt, { x, y, n: 24, speed: 700, size: 14, seed: 19 }); VFX.sparks(lt, { x, y, n: 60, spread: 3, speed: 900, color: '#ffd0a0' });
      K.embers(t); api.postFor();
    },
    chiefKneels(lt, d, t, api) {
      const m = api.marks(), og = m[OG], tk = m.takuto, kneel = ease.out(clamp((lt - 0.4) / 1.2)), H1 = { x: lerp(tk.x, og.x, 0.5), z: lerp(tk.z, og.z, 0.5) };
      const cam = lt < 4.2 ? { pos: [H1.x + 3.2, 0.7, H1.z + 1.4], look: [lerp(H1.x, og.x, 0.4), 1.5, lerp(H1.z, og.z, 0.4)], fov: 40 } : { pos: [og.x + 0.8, K.H(OG) * 0.5, og.z + 3.4], look: [og.x, K.H(OG) * 0.6 - kneel * 0.6, og.z], fov: 32 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...P().windup, weapon: 2.0, x: H1.x, z: H1.z, ry: K.yaw(H1, og) }, o: { axeGlow: 0.5, expr: { angry: 0.5 } } }, [OG]: { pose: { y: -kneel * 0.7 }, o: { squash: kneel * 0.35, tilt: kneel * 0.05 } } }));
      K.embers(t, 0.7); api.postFor();
    },
    chiefLeaves(lt, d, t, api) {
      const og = api.marks()[OG], k = ease.in(clamp((lt - 0.8) / (d - 1.2))), cam = { pos: [og.x + 1.6, 1.3, og.z + 6.4], look: [og.x, K.H(OG) * 0.5, og.z - k * 4], fov: 38 };
      api.render(t, cam, K.over(api, t, { [OG]: { pose: { z: og.z - k * 6, ry: PI }, o: { alpha: 1 - k * 0.9 } } }));
      feathers(t, 0.9); api.postFor();
    },
    ogreCamp(lt, d, t) {
      K.plate('forest_camp', lt, d, { z0: 1.04, z1: 1.12, pan: 0.03 });
      [[220, 560, 120], [330, 590, 90], [470, 540, 70], [820, 560, 110], [960, 600, 80], [1080, 545, 140], [610, 520, 60]].forEach(([x, y, h], i) => K.sil(OG, x, y, h, inv(i * 0.4, i * 0.4 + 1, lt), t + i, { filter: 'brightness(0.4) saturate(0.8)', eyeCol: '255,200,120', flip: i % 2 === 0, rate: 1.4, ph: i }));
      GFX.radial(640, 600, 260, 'rgba(255,150,70,0.35)', 'rgba(0,0,0,0)', 1, 'lighter'); K.embers(t, 0.5); POST.set({ bloom: 0.6, thr: 0.6 });
    },
    wolfPack(lt, d, t, api) {
      const tk = api.marks().takuto, cam = { pos: [tk.x + 0.4, 1.4, tk.z + 3.4], look: [tk.x, 1.0, tk.z - 6], fov: 48 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...P().ready, ry: PI }, o: { expr: { angry: 0.4 } } } }), null, () => K.eyePairs(70, lt * 0.9, inv(0.6, 3.5, lt), { y0: 330, y1: 470, size: 3.4 }));
      GFX.fill('#05060c', 0.15 * inv(0, 2, lt));
      GFX.motes(t, { n: 50, vy: -10, color: '#6a6a80', size: 9, glow: false, seed: 12, a: 0.25 }); api.postFor();
    },
    wolfLunge(lt, d, t, api) {
      const tk = api.marks().takuto, hit = 2.8, cam = K.jolt({ pos: [tk.x + 2.6, 1.1, tk.z + 2.2], look: [tk.x - 0.4, 1.0, tk.z - 0.6], fov: 40 }, t, lt > hit && lt < hit + 0.4 ? 0.14 : 0.01);
      const pose = S3.seq(lt, [[0, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.7, P().ready]]);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, ry: PI - 0.5 }, o: { axeGlow: 0.4, expr: { angry: 0.7 } } } }));
      const [tx, ty] = K.proj([tk.x, 1.0, tk.z]);
      [0, 1, 2].forEach(i => { const k = clamp((lt - 0.6 - i * 0.25) / (hit - 0.6 - i * 0.25)); if (lt < hit) wolfShape(lerp(-120, tx - 60, k), lerp(380 + i * 60, ty, k) - Math.sin(k * PI) * 120, 70 + i * 10, 0.95, t, i);
        else if (lt < hit + 1.2) GFX.motes(lt - hit, { n: 30, vy: -80, color: '#202030', size: 10, glow: false, seed: 30 + i, a: 1 - inv(hit, hit + 1.2, lt), x0: tx - 220, x1: tx + 40, y0: ty - 200, y1: ty + 60 }); });
      if (lt > hit && lt < hit + 0.5) VFX.slash(lt - hit, { x: tx - 80, y: ty - 40, r: 360, a0: -2.4, a1: 0.9, dur: 0.12, hold: 0.3, w: 110, flat: 0.75, rot: 0.2 });
      api.postFor();
    },
    wristThread(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, rn = m.rin, cam = { pos: [lerp(tk.x, rn.x, 0.5) + 0.4, 1.2, lerp(tk.z, rn.z, 0.5) + 1.8], look: [lerp(tk.x, rn.x, 0.5), 1.0, lerp(tk.z, rn.z, 0.5)], fov: 34 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { uaL: [0.9, 0.4], elL: 0.5, ry: K.yaw(tk, rn) }, o: { axeGlow: 0.2 + 0.2 * Math.sin(t * 3) } }, rin: { pose: { uaR: [1.0, 0.4], elR: 0.4, ry: K.yaw(rn, tk) } } }));
      K.thread(K.proj(S3.jointPos('rin', 'handR', 0)), K.proj(S3.jointPos('takuto', 'handL', 0)), t, ease.out(clamp((lt - 0.4) / 0.8)), { sag: 24, w: 3 });
      api.postFor();
    },
    chiefFights(lt, d, t, api) {
      const m = api.marks(), og = m[OG], tk = m.takuto, hit = 2.4, cam = K.jolt({ pos: [lerp(tk.x, og.x, 0.5) + 4.2, 1.3, lerp(tk.z, og.z, 0.5) + 3.0], look: [lerp(tk.x, og.x, 0.5), 1.4, lerp(tk.z, og.z, 0.5) - 1.5], fov: 44 }, t, lt > hit && lt < hit + 0.5 ? 0.15 : 0.01);
      const pose = S3.seq(lt, [[0, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.8, P().ready]]);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, ry: PI }, o: { axeGlow: 0.5 } }, [OG]: { pose: { ry: PI }, o: { lunge: Math.max(0, 1 - Math.abs(lt - hit) / 0.6), tilt: 0.05 } } }));
      if (lt > hit && lt < hit + 1.4) { [[420, 300], [860, 330], [640, 260]].forEach(([x, y], i) => VFX.sparks(lt - hit, { x, y, n: 30, spread: 3, speed: 900, color: i ? '#ffd0a0' : '#ff8a6a' })); GFX.motes(lt - hit, { n: 60, vy: -60, color: '#1a1a26', size: 12, glow: false, seed: 44, a: 1 - inv(hit, hit + 1.4, lt) }); }
      api.postFor();
    },
    kurozaneRidge(lt, d, t, api) {
      const tk = api.marks().takuto, w = api.marks().m_wolf, rise = ease.out(clamp((lt - 0.6) / 1.4));
      const cam = { pos: [tk.x + 0.6, 0.5, tk.z + 2.6], look: [w.x, 2.4, w.z], fov: lerp(46, 34, ease.io(clamp(lt / d))) };
      api.render(t, cam, [...api.castList(t).filter(c => c[0] !== 'm_wolf'), ['m_wolf', { x: w.x, z: w.z, y: 1.6, ry: 0 }, { tint: '#5a6680', alpha: rise }]]);
      const [ex, ey] = K.proj(S3.jointPos('m_wolf', 'head', 0)); GFX.radial(ex + 8, ey + 6, 18, 'rgba(255,50,40,' + (rise * 0.95).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter');
      GFX.radial(ex, ey - 200, 500, 'rgba(180,200,255,0.12)', 'rgba(0,0,0,0)', 1, 'lighter'); if (lt > d - 1.6) { const k = inv(d - 1.6, d - 0.6, lt); GFX.fill('#05060c', k * 0.8); }
      POST.set({ bloom: 0.6, thr: 0.6, sat: 0.85, vig: 0.7 });
    },
    wickTrick(lt, d, t, api) {
      const wk = api.marks().wick, cam = { pos: [wk.x + 1.6, 1.3, wk.z + 2.2], look: [wk.x, 1.6, wk.z], fov: 36 };
      api.render(t, cam, K.over(api, t, { wick: { pose: { uaL: [2.2, 0.4], elL: 0.6, uaR: [2.2, 0.4], elR: 0.6 }, o: { expr: { happy: 0.8 } } } }));
      const [x, y] = K.proj([wk.x, 2.1, wk.z]);
      [0, 1, 2].forEach(i => { const ph = lt * 4.2 + i * 2.09, bx = x + Math.cos(ph) * 90, by = y - Math.abs(Math.sin(ph)) * 150; GFX.radial(bx, by, 34, 'rgba(140,210,255,0.95)', 'rgba(40,90,255,0)', 1, 'lighter'); GFX.radial(bx, by, 80, 'rgba(80,150,255,0.25)', 'rgba(0,0,0,0)', 1, 'lighter'); });
      [[200, 640, 120], [1080, 650, 110], [320, 670, 90]].forEach(([sx, sy, h], i) => K.sil(OG, sx, sy, h, 1, t + i, { filter: 'brightness(0.45)', eyeCol: '255,210,140', flip: i === 1, rate: 3 }));
      api.postFor();
    },
    nextTitle: K.title('第八話', '牙の浪人', 'THE FANG RONIN'),
  };
})();
const EP07 = DIRECTOR.episode(EP07_SCRIPT, EP07_CUSTOM);
