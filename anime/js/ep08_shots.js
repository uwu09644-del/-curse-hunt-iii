/* RUINBREAKER — Episode 8: hand-directed moments (Grey Hollow, the hot spring, the fang letter, the dojo, moonrise,
   the Fang Draw, Sieg's lying echo, Sable's static, Kurozane turning on the pack, the first sight of Saint Lumen). */
'use strict';

const EP08_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT, WF = 'm_wolf';
  const duelCam = (api, t, amt = 0) => { const m = api.marks(), s = m.sieg, w = m[WF]; return K.jolt({ pos: [lerp(s.x, w.x, 0.5) + 4.6, 1.2, lerp(s.z, w.z, 0.5) + 0.4], look: [lerp(s.x, w.x, 0.5), 1.3, lerp(s.z, w.z, 0.5)], fov: 40 }, t, amt); };
  const slashLine = (lt, y, k, col = '255,255,255') => { const c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, y - 6, 0, y + 6); g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(0.5, 'rgba(' + col + ',' + (0.95 * k).toFixed(2) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.translate(640, y); c.rotate(-0.18); c.fillRect(-900, -6, 1800, 12); c.restore(); };
  return {
    hollowFlash(lt, d, t) {
      K.plate('grey_hollow', lt, d, { z0: 1.1, z1: 1.2, shake: lt > 3.5 ? 6 : 0 });
      GFX.fill('#0a0c12', 0.4); K.staticArcs(640, 300, 260, inv(0.2, 1.0, lt) * (1 - inv(3, 4, lt)), t, 7);
      if (lt > 3.4) { const k = inv(3.4, 4.2, lt); GFX.fill('#300004', 0.4 * k, 'multiply'); const c = GFX.ctx; c.save(); c.strokeStyle = 'rgba(255,40,40,' + (0.85 * k).toFixed(2) + ')'; c.lineWidth = 6; c.beginPath(); c.moveTo(380, 120); c.lineTo(900, 90); c.lineTo(820, 60); c.stroke(); c.restore(); GFX.radial(640, 90, 420 * k, 'rgba(255,40,40,0.4)', 'rgba(0,0,0,0)', 1, 'lighter'); }
      POST.set({ sat: 0.6, vig: 0.8, bloom: 0.6, thr: 0.6 });
    },
    steam(lt, d, t) {
      K.plate('mountain_inn', lt, d, { z0: 1.12, z1: 1.2, pan: 0.02 });
      const boil = inv(3.8, 6, lt); GFX.motes(t, { n: 90, vy: -50, vx: 10, color: '#f4f0ea', size: 22, glow: false, seed: 6, a: 0.25 + 0.35 * boil });
      GFX.radial(640, 520, 160, 'rgba(120,190,255,' + (0.35 + boil * 0.3).toFixed(2) + ')', 'rgba(40,90,255,0)', 1, 'lighter'); POST.set({ bloom: 0.5, thr: 0.65 });
    },
    fangLetter(lt, d, t) {
      K.plate('pass_shrine', lt, d, { z0: 1.1, z1: 1.3, tilt: -0.02 }); GFX.fill('#000', 0.25 * inv(0, 1, lt));
      const c = GFX.ctx, a = inv(0.3, 1.0, lt); c.save(); c.globalAlpha = a; c.translate(640, 370); c.rotate(-0.04);
      c.fillStyle = '#e9dfc8'; c.fillRect(-250, -170, 500, 340); c.strokeStyle = '#8a7a5a'; c.lineWidth = 2; c.strokeRect(-240, -160, 480, 320);
      c.fillStyle = '#d8d0c0'; c.beginPath(); c.moveTo(-12, -190); c.lineTo(12, -190); c.lineTo(0, -120); c.closePath(); c.fill();
      c.restore();
      const lines = ['To the Laughing Blade.', 'At moonrise, at this gate.', 'Come alone,', 'or I visit the little cat first.', '— Kurozane'];
      lines.forEach((s, i) => GFX.txt(s, 640, 270 + i * 46, { font: (i === 4 ? '700 ' : '400 ') + '26px ' + GFX.FONT.sub, fill: '#2a1e14', a: a * inv(0.8 + i * 0.9, 1.4 + i * 0.9, lt) }));
      GFX.radial(640, 300, 40, 'rgba(255,60,40,0.4)', 'rgba(0,0,0,0)', a, 'multiply');
    },
    dojoSpar(lt, d, t, api) {
      const hits = [1.6, 4.2, 6.8], hi = hits.findIndex((h, i) => lt >= h - 0.6 && lt < (hits[i + 1] ?? d) - 0.6), h0 = hits[Math.max(0, hi)];
      const tp = S3.seq(lt - h0 + 0.6, [[0, P().ready], [0.3, { ...P().windup, weapon: 2.0 }, 'out'], [0.6, { ...P().chop, weapon: 1.7 }, 'in'], [1.3, P().ready]]);
      const sp = lt > h0 - 0.1 && lt < h0 + 0.5 ? P().duck : P().ready, cam = K.jolt({ pos: [4.4, 1.3, 0.4], look: [0, 1.2, 0], fov: 34 }, t, lt > h0 && lt < h0 + 0.25 ? 0.06 : 0);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...tp, ry: PI }, o: { axeGlow: 0.2 } }, sieg: { pose: { ...sp, x: lt > h0 ? 0.5 : 0, ry: 0 }, o: { expr: { happy: 0.4 } } } }));
      if (lt > h0 + 0.3 && lt < h0 + 0.9) { const [x, y] = K.proj([0, 1.3, -1.2]); VFX.slash(lt - h0 - 0.3, { x, y, r: 200, a0: -2.2, a1: 0.8, dur: 0.12, hold: 0.25, w: 60, flat: 0.8, rot: 0.2, color: '#bfe0ff' }); }
      api.postFor();
    },
    moonrise(lt, d, t, api) {
      K.plate('pass_rain', lt, d, { z0: 1.0, z1: 1.1, tilt: 0.02 });
      const k = ease.out(clamp(lt / (d * 0.7))), my = lerp(260, 120, k); GFX.radial(980, my, 90, 'rgba(240,244,255,0.95)', 'rgba(200,215,255,0)', 1, 'lighter'); GFX.radial(980, my, 260, 'rgba(180,200,255,0.25)', 'rgba(0,0,0,0)', 1, 'lighter');
      const w = api.marks()[WF]; if (lt > 1.6) K.sil(WF, 420, 600, 330, inv(1.6, 3, lt), t, { filter: 'brightness(0.2)', eyes: false, rate: 0.5 });
      if (lt > 2.2) GFX.radial(452, 330, 12, 'rgba(255,50,40,0.95)', 'rgba(0,0,0,0)', inv(2.2, 2.8, lt), 'lighter');
      K.rain(t, 0.5); POST.set({ sat: 0.8, vig: 0.7, bloom: 0.6, thr: 0.6 });
    },
    fangDraw(lt, d, t, api) {
      const draw = 1.2, m = api.marks(), s = m.sieg, w = m[WF], past = lt > draw;
      const cam = lt < draw ? { pos: [w.x + 0.8, 1.5, w.z + 1.4], look: [w.x, 1.4, w.z], fov: 30 } : duelCam(api, t, lt < draw + 0.4 ? 0.2 : 0.01);
      api.render(t, cam, K.over(api, t, { [WF]: { pose: past ? { x: lerp(w.x, s.x - 0.6, 0.5), z: lerp(w.z, s.z - 0.6, 0.5) } : {}, o: { lunge: lt < draw ? -0.2 : 0.6 * (1 - inv(draw, draw + 1, lt)), squash: lt < draw ? 0.15 : 0 } }, sieg: { pose: past ? { ...P().hit, ry: K.yaw(s, w) } : { ...P().ready, ry: K.yaw(s, w) } } }));
      if (lt > draw - 0.1 && lt < draw + 0.09) GFX.fill('#fff', 0.9);
      if (lt > draw) { slashLine(lt, 360, 1 - inv(draw, draw + 0.8, lt)); if (lt < draw + 0.3) GFX.impact('inv'); }
      if (lt > draw + 0.8 && lt < draw + 1.6) { const [x, y] = K.proj(S3.jointPos('sieg', 'chest', 0)); VFX.sparks(lt - draw - 0.8, { x, y, n: 40, spread: 2.6, speed: 700, color: '#ff6a6a' }); }
      K.rain(t, 0.5); api.postFor();
    },
    duelClash(lt, d, t, api) {
      const hits = [0.8, 2.0, 3.4, 4.6], m = api.marks(), s = m.sieg, w = m[WF], mid = { x: lerp(s.x, w.x, 0.5), z: lerp(s.z, w.z, 0.5) }, hi = hits.findIndex(h => Math.abs(lt - h) < 0.35);
      api.render(t, duelCam(api, t, hi >= 0 ? 0.12 : 0.02), K.over(api, t, { sieg: { pose: { ...(hi >= 0 ? P().chop : P().windup), weapon: 1.7, x: lerp(s.x, mid.x, 0.55), z: lerp(s.z, mid.z, 0.55), ry: K.yaw(s, w) } }, [WF]: { pose: { x: lerp(w.x, mid.x, 0.45), z: lerp(w.z, mid.z, 0.45) }, o: { lunge: hi >= 0 ? 0.7 : 0.2, tilt: hi % 2 ? 0.05 : -0.05 } } }));
      hits.forEach((h, i) => { if (lt > h && lt < h + 0.8) { const [x, y] = K.proj([mid.x, 1.4 + (i % 2) * 0.3, mid.z]); VFX.sparks(lt - h, { x, y, n: 70, spread: 3, speed: 1200, color: '#e0f0ff' }); VFX.ring(lt - h, { x, y, r1: 500, dur: 0.5, flat: 0.9 }); }
        if (lt > h + 0.25 && lt < h + 0.7) { const [x, y] = K.proj([mid.x, 1.4, mid.z]); VFX.slash(lt - h - 0.25, { x, y, r: 260, a0: -2.2, a1: 0.8, dur: 0.1, hold: 0.25, w: 70, flat: 0.8, rot: 0.1, color: '#9ad0ff' }); } });
      K.rain(t, 0.5); api.postFor();
    },
    afterimageTrick(lt, d, t, api) {
      const m = api.marks(), s = m.sieg, w = m[WF], miss = 2.4, echo = 5.6, dodge = ease.out(clamp((lt - miss) / 0.5)), wp = { x: w.x + dodge * 1.6, z: w.z + dodge * 0.3 };
      const cam = lt < echo - 0.3 ? duelCam(api, t, lt > miss && lt < miss + 0.3 ? 0.08 : 0.01) : K.jolt({ pos: [wp.x + 1.6, 1.4, wp.z + 2.4], look: [wp.x, 1.5, wp.z], fov: 30 }, t, lt > echo && lt < echo + 0.5 ? 0.2 : 0);
      api.render(t, cam, K.over(api, t, { sieg: { pose: { ...(lt > miss ? P().chop : P().windup), weapon: 1.7, ry: K.yaw(s, w) } }, [WF]: { pose: { x: wp.x, z: wp.z }, o: { flash: lt > echo && lt < echo + 0.12 ? 1 : 0, shake: lt > echo ? 1 - inv(echo, echo + 1.4, lt) : 0, tilt: lt > echo ? 0.12 : 0 } } }));
      if (lt > miss && lt < miss + 0.6) { const [x, y] = K.proj([w.x, 1.5, w.z]); VFX.slash(lt - miss, { x, y, r: 280, a0: -2.2, a1: 0.8, dur: 0.12, hold: 0.3, w: 70, flat: 0.8, rot: 0.1, color: '#9ad0ff' }); }
      if (lt > echo - 0.6 && lt < echo + 0.8) { const [x, y] = K.proj([wp.x, 1.5, wp.z]); const k = clamp((lt - echo + 0.6) / 0.6); GFX.radial(x - 40, y, 140, 'rgba(160,210,255,' + (0.6 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); if (lt > echo) { VFX.slash(lt - echo, { x, y, r: 300, a0: 0.8, a1: -2.2, dur: 0.1, hold: 0.4, w: 90, flat: 0.8, rot: -0.1, color: '#d0ecff' }); VFX.sparks(lt - echo, { x, y, n: 90, spread: 3, speed: 1300, color: '#ff8a8a' }); } }
      if (lt > echo && lt < echo + 0.09) GFX.fill('#fff', 0.9);
      K.rain(t, 0.5); api.postFor();
    },
    staticCrackle(lt, d, t, api) {
      const m = api.marks(), w = m[WF], cam = { pos: [w.x - 2.4, 1.5, w.z + 3.6], look: [w.x - 1.0, 1.6, w.z - 2.0], fov: 40 };
      api.render(t, cam, api.castList(t));
      const vis = inv(0.3, 1.2, lt) * (1 - inv(d - 1, d, lt)); if (vis > 0) S3.frame({ env: 'pass', only: 'cast', t, cam, cast: [['sable', { x: w.x - 2.6, z: w.z - 3.4, ry: 0.4 }, { expr: { happy: 0.8 } }]], alpha: vis * 0.9, envOpts: { light: 'storm' } });
      const [x, y] = K.proj([w.x - 2.6, 1.6, w.z - 3.4]); K.staticArcs(x, y, 220, vis, t, 8);
      const e = K.proj(S3.jointPos('sable', 'head', 0.16)); GFX.radial(e[0], e[1], 26, 'rgba(230,240,255,' + (0.9 * vis).toFixed(2) + ')', 'rgba(150,170,255,0)', 1, 'lighter');
      api.postFor();
    },
    packAmbush(lt, d, t, api) {
      const s = api.marks().sieg, cam = { pos: [s.x + 0.4, 1.3, s.z + 3.0], look: [s.x, 1.1, s.z - 3], fov: 50 };
      api.render(t, cam, K.over(api, t, { sieg: { pose: { ...P().ready, ry: PI }, o: { expr: { angry: 0.5 } } } }), null, () => K.eyePairs(80, lt, inv(0.4, 3, lt), { y0: 300, y1: 480, size: 3.6 }));
      GFX.fill('#05060c', 0.15 * inv(0, 2, lt));
      [0, 1, 2, 3].forEach(i => { const k = clamp((lt - 4 - i * 0.4) / 1.6); if (k > 0 && k < 1) K.wolf(lerp(i % 2 ? 1400 : -140, 640 + (i - 1.5) * 120, k), 520 - Math.sin(k * PI) * 160, 80, 0.95, t, i); });
      K.rain(t, 0.4); api.postFor();
    },
    wolfLunge(lt, d, t, api) {
      const tk = api.marks().takuto, hit = 2.6, cam = K.jolt({ pos: [tk.x + 2.6, 1.1, tk.z + 2.2], look: [tk.x - 0.4, 1.0, tk.z - 0.6], fov: 40 }, t, lt > hit && lt < hit + 0.4 ? 0.14 : 0.01);
      const pose = S3.seq(lt, [[0, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.7, P().ready]]);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, ry: PI - 0.5 }, o: { axeGlow: 0.4, expr: { angry: 0.7 } } } }));
      const [tx, ty] = K.proj([tk.x, 1.0, tk.z]);
      [0, 1, 2].forEach(i => { const k = clamp((lt - 0.6 - i * 0.25) / (hit - 0.6 - i * 0.25)); if (lt < hit) K.wolf(lerp(-120, tx - 60, k), lerp(380 + i * 60, ty, k) - Math.sin(k * PI) * 120, 70 + i * 10, 0.95, t, i);
        else if (lt < hit + 1.2) GFX.motes(lt - hit, { n: 30, vy: -80, color: '#202030', size: 10, glow: false, seed: 30 + i, a: 1 - inv(hit, hit + 1.2, lt), x0: tx - 220, x1: tx + 40, y0: ty - 200, y1: ty + 60 }); });
      if (lt > hit && lt < hit + 0.5) VFX.slash(lt - hit, { x: tx - 80, y: ty - 40, r: 360, a0: -2.4, a1: 0.9, dur: 0.12, hold: 0.3, w: 110, flat: 0.75, rot: 0.2 });
      K.rain(t, 0.4); api.postFor();
    },
    kurozaneTurns(lt, d, t, api) {
      const w = api.marks()[WF], cut = 4.8, cam = K.jolt(lt < cut ? { pos: [w.x + 1.2, 1.5, w.z + 2.4], look: [w.x, 1.6, w.z], fov: 32 } : { pos: [w.x, 1.0, w.z + 6.4], look: [w.x, 1.4, w.z], fov: 50 }, t, lt > cut && lt < cut + 0.6 ? 0.22 : 0.01);
      api.render(t, cam, K.over(api, t, { [WF]: { o: { squash: lt < cut ? 0.2 * inv(2, cut, lt) : 0, lunge: lt > cut ? 0.8 * (1 - inv(cut, cut + 1, lt)) : 0, tint: lt > cut ? '#ffffff' : '#c8d0e0' } } }));
      if (lt > cut) { const [x, y] = K.proj([w.x, 1.3, w.z]); VFX.slash(lt - cut, { x, y, r: 620, a0: -PI, a1: PI * 0.9, dur: 0.25, hold: 0.8, w: 140, flat: 0.45, rot: 0, color: '#e8f0ff' }); if (lt < cut + 0.09) GFX.fill('#fff', 0.9);
        GFX.motes(lt - cut, { n: 120, vy: -60, color: '#1c1c28', size: 12, glow: false, seed: 51, a: 1 - inv(cut + 0.5, d, lt) }); }
      else { const [x, y] = K.proj(S3.jointPos(WF, 'head', 0)); GFX.radial(x + 8, y + 6, 18, 'rgba(255,50,40,0.95)', 'rgba(0,0,0,0)', 1, 'lighter'); }
      K.rain(t, 0.45); api.postFor();
    },
    wolfLeaves(lt, d, t, api) {
      const w = api.marks()[WF], k = ease.in(clamp((lt - 0.6) / (d - 1))), cam = { pos: [w.x + 1.0, 1.4, w.z + 5.6], look: [w.x, 1.6, w.z - k * 3], fov: 40 };
      api.render(t, cam, K.over(api, t, { [WF]: { pose: { z: w.z - k * 5, ry: PI }, o: { alpha: 1 - k } } })); K.rain(t, 0.4 * (1 - k)); api.postFor();
    },
    cityView(lt, d, t) {
      const x = inv(3.4, 5.4, lt); K.plate('mountain_cliff', lt, d, { z0: 1.0, z1: 1.08 });
      if (x > 0) { GFX.ctx.save(); GFX.ctx.globalAlpha = x; K.plate('lumen_gate', lt, d, { z0: 1.06, z1: 1.16 }); GFX.ctx.restore(); }
      GFX.radial(900, 200, 700, 'rgba(255,215,140,' + (0.25 + 0.15 * x).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); GFX.motes(t, { n: 50, vy: -20, color: '#ffe0a0', size: 2.2, seed: 7, a: 0.6 });
      POST.set({ bloom: 0.8, thr: 0.55, sat: 1.12 });
    },
    nextTitle: K.title('第九話', '聖都ルーメン', 'SAINT LUMEN', 92),
  };
})();
const EP08 = DIRECTOR.episode(EP08_SCRIPT, EP08_CUSTOM);
