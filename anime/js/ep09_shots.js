/* RUINBREAKER — Episode 9: hand-directed moments (Haruki's fall, the golden carriage, the statues, the Saint's aura,
   the reunion, Frozen Hour, the Sanctum test, the undercity, Sable in the alley) and the build. */
'use strict';

const EP09_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT;
  const motes = (t, a = 0.6) => GFX.motes(t, { n: 50, vy: -20, color: '#ffe0a0', size: 2.2, seed: 7, a });
  return {
    haruFall(lt, d, t) {
      K.plate('rift_sky', lt, d, { z0: 1.0, z1: 1.3, tilt: 0.04 }); const stop = 4.6, k = clamp(lt / stop), frz = lt > stop;
      const x = 640 + Math.sin(lt * 1.3) * 60, y = frz ? lerp(140, 520, ease.out(clamp(stop / stop))) : lerp(140, 520, ease.in(k));
      if (!frz) GFX.motes(lt * 8, { n: 80, vy: -900, color: '#ffffff', size: 1.4, glow: false, seed: 41, a: 0.6 });
      GFX.radial(x, y, 30, 'rgba(255,255,255,0.95)', 'rgba(255,255,255,0)', 1, 'lighter'); GFX.radial(x, y, 90, 'rgba(160,210,255,0.4)', 'rgba(0,0,0,0)', 1, 'lighter');
      if (frz) { K.frost(x, y, 420, ease.out(clamp((lt - stop) / 0.6)), t); GFX.fill('#a8d8ff', 0.12, 'screen'); POST.set({ sat: 0.6, bloom: 0.8, thr: 0.5 }); if (lt < stop + 0.08) GFX.fill('#fff', 0.8); }
      else POST.set({ bloom: 0.7, thr: 0.55, ca: 0.008 });
    },
    carriage(lt, d, t, api) {
      const tk = api.marks().takuto, sway = Math.sin(t * 2.6) * 0.02;
      api.render(t, { pos: [tk.x + 0.3, 1.25 + sway, tk.z + 1.8], look: [tk.x - 0.6, 0.95, tk.z - 0.8], fov: 44 }, api.castList(t));
      const c = GFX.ctx; for (let i = 0; i < 6; i++) { const x = ((lt * 520 + i * 260) % 1560) - 140; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x - 40, 0, x + 40, 0); g.addColorStop(0, 'rgba(255,220,140,0)'); g.addColorStop(0.5, 'rgba(255,220,140,0.18)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x - 40, 0, 80, 720); c.restore(); }
      motes(t); POST.set({ bloom: 0.7, thr: 0.55, sat: 1.12 });
    },
    statues(lt, d, t) {
      K.plate('lumen_plaza', lt, d, { z0: 1.24, z1: 1.04, tilt: -0.05 });
      GFX.radial(640, 160, 520, 'rgba(255,220,140,0.28)', 'rgba(0,0,0,0)', 1, 'lighter'); motes(t, 0.8); GFX.motes(t * 0.6, { n: 30, vy: 30, color: '#fff4d8', size: 3, glow: false, seed: 19, a: 0.6 });
      POST.set({ bloom: 0.8, thr: 0.55, sat: 1.12 });
    },
    lucienAura(lt, d, t, api) {
      const l = api.marks().lucien, k = ease.out(clamp(lt / 2.4)), cam = { pos: [l.x + 0.6, 1.5, l.z + lerp(4.2, 2.6, ease.io(clamp(lt / d)))], look: [l.x, 1.55, l.z], fov: 30 };
      api.render(t, cam, K.over(api, t, { lucien: { pose: { uaL: [0.4, 0.5], elL: 0.3, uaR: [0.4, 0.5], elR: 0.3 }, o: { expr: { happy: 0.6 } } } }));
      const [x, y] = K.proj([l.x, 1.3, l.z]); GFX.radial(x, y - 40, 380, 'rgba(255,215,130,' + (0.35 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); VFX.aura(t, { x, y, w: 300, h: 460, n: 40, a: 0.5 * k, color: '#ffd27a' });
      motes(t, 0.8); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.1 });
    },
    reunion(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hr = m.haruki, k = ease.io(clamp(lt / d)), mid = { x: lerp(tk.x, hr.x, 0.5), z: lerp(tk.z, hr.z, 0.5) };
      const cam = lt < 4.2 ? { pos: [tk.x + 0.5, 1.6, tk.z + 1.4], look: [hr.x, 1.55, hr.z], fov: lerp(34, 28, k) } : { pos: [mid.x + 2.6, 1.4, mid.z + 1.8], look: [mid.x, 1.45, mid.z], fov: 36 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { ry: K.yaw(hr, tk) }, o: { expr: lt > 5 ? { happy: 0.5 } : { Surprised: 0.4 } } }, takuto: { pose: { ry: K.yaw(tk, hr) }, o: { expr: { sad: 0.3 } } } }));
      GFX.motes(t, { n: 30, vy: 40, vx: 20, color: '#fff6f0', size: 3.4, glow: false, seed: 15, a: 0.8 }); POST.set({ bloom: 0.7, thr: 0.55, sat: 1.05 });
    },
    frozenHour(lt, d, t, api) {
      const hr = api.marks().haruki, f0 = 2.0, f1 = 5.0, frz = lt > f0 && lt < f1, cam = { pos: [hr.x + 0.8, 1.5, hr.z + 1.2], look: [hr.x + 0.2, 1.3, hr.z], fov: 30 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { uaR: [1.3, 0.3], elR: 0.4, ry: 0.4 }, o: { expr: { happy: 0.4 } } } }));
      const [hx, hy] = K.proj(S3.jointPos('haruki', 'handR', 0)), tl = lt < f0 ? lt : lt < f1 ? f0 : lt - (f1 - f0), lx = hx + 40 + Math.sin(tl * 2) * 30, ly = hy - 160 + tl * 60, c = GFX.ctx;
      c.save(); c.translate(lx, ly); c.rotate(tl * 2); c.fillStyle = '#e8a040'; c.beginPath(); c.ellipse(0, 0, 18, 9, 0, 0, 7); c.fill(); c.restore();
      if (frz) { const k = ease.out(clamp((lt - f0) / 0.4)); K.frost(lx, ly, 160, k, t); GFX.fill('#a8d8ff', 0.1 * k, 'screen'); const n = 3 - Math.floor(lt - f0); GFX.txt(String(Math.max(1, n)), lx + 90, ly - 60, { font: '800 54px ' + GFX.FONT.disp, fill: '#e8f6ff', a: 0.9 }); POST.set({ sat: 0.7 }); }
      else api.postFor();
    },
    sanctumTest(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, lu = m.lucien, raise = ease.out(clamp((lt - 0.8) / 1.4)), hit = 5.0, crack = lt > hit;
      const B = { x: lerp(tk.x, lu.x, 0.45), z: lerp(tk.z, lu.z, 0.45) };
      const pose = S3.seq(lt, [[0, P().ready], [3.6, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0, y: 0.5 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 1.0, P().ready]]);
      const cam = K.jolt(lt < 7.4 ? { pos: [B.x + 3.6, 1.4, B.z + 1.2], look: [B.x, 1.4, B.z], fov: 40 } : { pos: [lu.x + 0.3, 1.62, lu.z + 1.1], look: [lu.x, 1.6, lu.z], fov: 24 }, t, crack && lt < hit + 0.6 ? 0.25 : 0.01);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, x: lerp(tk.x, B.x, 0.55), z: lerp(tk.z, B.z, 0.55), ry: K.yaw(tk, lu) }, o: { axeGlow: inv(3.4, hit, lt), expr: { angry: 0.7 } } }, lucien: { pose: { uaR: [1.6, 0.3], elR: 0.2, ry: K.yaw(lu, tk) }, o: { expr: lt > 7.6 && lt < 8.6 ? { Surprised: 0.7 } : { happy: 0.4 } } } }));
      if (lt < 7.4) { const [x, y] = K.proj([B.x, 1.3, B.z]), r = Math.abs(K.proj([B.x + 2.0, 1.3, B.z])[0] - x) + 160; K.gold(x, y, r * 2, r * 2.4, raise, t);
        if (crack) { K.cracks(x - 10, y - 30, 220, ease.out(clamp((lt - hit) / 0.3)), { n: 3, w: 2, col: 'rgba(255,255,255,0.95)' }); if (lt < hit + 0.9) { VFX.sparks(lt - hit, { x, y: y - 30, n: 120, spread: 3.2, speed: 1400, color: '#ffe2a0' }); VFX.ring(lt - hit, { x, y: y - 30, r1: 900, dur: 0.6, flat: 0.95, color: '#ffe8b0' }); } if (lt < hit + 0.07) GFX.fill('#fff', 0.85); } }
      else { const e = S3.eyePos('lucien').map(K.proj); if (lt > 7.6 && lt < 8.6) e.forEach(([x, y]) => GFX.radial(x, y, 10, 'rgba(255,230,160,0.6)', 'rgba(0,0,0,0)', 1, 'lighter')); }
      motes(t, 0.6); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.1 });
    },
    drainedChild(lt, d, t) {
      K.plate('lumen_slums', lt, d, { z0: 1.12, z1: 1.2 }); GFX.fill('#101420', 0.25);
      const x = 640, y = 470, k = 0.4 + 0.3 * Math.sin(t * 1.4), c = GFX.ctx;
      c.save(); c.fillStyle = 'rgba(20,22,30,0.85)'; c.beginPath(); c.ellipse(x, y + 120, 70, 140, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - 40, 48, 0, 7); c.fill(); c.restore();
      GFX.radial(x + 30, y + 40, 26, 'rgba(255,215,140,' + (0.25 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); GFX.motes(t, { n: 30, vy: -8, color: '#c8d0e0', size: 2, glow: false, seed: 8, a: 0.4 });
      POST.set({ sat: 0.6, vig: 0.7, bloom: 0.3, thr: 0.8 });
    },
    staticAlley(lt, d, t) {
      K.plate('lumen_slums', lt, d, { z0: 1.16, z1: 1.28, pan: 0.02 }); GFX.fill('#05060c', 0.3);
      const vis = inv(1.0, 2.0, lt) * (1 - inv(5.4, 6.2, lt)), x = 900, y = 420;
      if (vis > 0) { const c = GFX.ctx; c.save(); c.globalAlpha = vis; c.fillStyle = '#06060a'; c.beginPath(); c.ellipse(x, y + 120, 60, 170, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - 70, 44, 0, 7); c.fill(); c.restore();
        GFX.radial(x + 12, y - 76, 16, 'rgba(230,240,255,' + vis.toFixed(2) + ')', 'rgba(150,170,255,0)', 1, 'lighter'); K.staticArcs(x, y, 240, vis, t, 6);
        const g = GFX.ctx; g.save(); g.strokeStyle = 'rgba(230,240,255,' + (0.8 * vis).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(x, y - 66, 26, 0.3, PI - 0.3); g.stroke(); g.restore(); }
      if (lt > 5.4 && lt < 6.0) GFX.fill('#d8e4ff', 0.3 * (1 - (lt - 5.4) / 0.6), 'lighter');
      POST.set({ sat: 0.7, vig: 0.75, ca: 0.006 });
    },
    freezeSpar(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hr = m.haruki, f0 = 1.6, brk = 6.2, frz = lt > f0 && lt < brk;
      const tp = lt < f0 ? S3.seq(lt, [[0, P().ready], [f0, { ...P().windup, weapon: 2.0 }, 'out']]) : frz ? { ...P().windup, weapon: 2.0 } : S3.seq(lt - brk, [[0, { ...P().windup, weapon: 2.0 }], [0.2, { ...P().chop, weapon: 1.7 }, 'in'], [1.0, P().ready]]);
      const cam = K.jolt({ pos: [4.2, 1.3, 0.4], look: [0, 1.2, 0], fov: 34 }, t, lt > brk && lt < brk + 0.4 ? 0.12 : frz ? 0.004 + inv(3.5, brk, lt) * 0.02 : 0);
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...tp, ry: PI }, o: { axeGlow: frz ? inv(3.5, brk, lt) : 0.2, expr: { angry: frz ? 0.9 : 0.5 } } }, haruki: { pose: { ...(lt > f0 - 0.3 && lt < f0 + 0.4 ? { uaR: [1.6, 0.2], elR: 0.2 } : P().ready), x: lt > brk ? 0.5 : 0, ry: 0 } } }));
      const [x, y] = K.proj([tk.x, 1.2, tk.z]);
      if (frz) { K.frost(x, y, 320, ease.out(clamp((lt - f0) / 0.4)) * (1 - inv(brk - 0.4, brk, lt) * 0.3), t); GFX.fill('#a8d8ff', 0.1, 'screen'); K.cracks(x, y - 40, 260, inv(4.0, brk, lt), { n: 8, w: 2, col: 'rgba(255,90,80,0.9)' }); GFX.txt(String(Math.max(1, 3 - Math.floor((lt - f0) / 1.0))), x + 160, y - 160, { font: '800 54px ' + GFX.FONT.disp, fill: '#e8f6ff', a: 0.9 }); }
      if (lt > brk && lt < brk + 0.9) { VFX.sparks(lt - brk, { x, y: y - 40, n: 100, spread: 3, speed: 1100, color: '#d8f0ff' }); if (lt < brk + 0.07) GFX.fill('#fff', 0.7); }
      api.postFor();
    },
    nextTitle: K.title('第十話', 'モルヴッド', 'MORVUDD'),
  };
})();
const EP09 = DIRECTOR.episode(EP09_SCRIPT, EP09_CUSTOM);
