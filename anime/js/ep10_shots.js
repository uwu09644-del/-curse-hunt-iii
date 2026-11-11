/* RUINBREAKER — Episode 10: hand-directed moments (the horde, Kurozane at the fire, the bridge fight, Haruki's freeze
   line, Morvudd rising, Sieg counting as he falls, Sable between two seconds, the red rising, a hand on the shoulder,
   the three-Brand finish) and the build. */
'use strict';

const EP10_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT, MV = 'm_morvudd', WF = 'm_wolf';
  const wind = (t, a = 0.5) => GFX.motes(t * 2, { n: 60, vy: 10, vx: 220, color: '#c8b888', size: 2, glow: false, seed: 33, a });
  function crowd(lt, t, a, y0 = 470, rows = 3) { // the horde: rows of Lesser Fiends running, smaller with distance
    if (a <= 0) return;
    for (let r = 0; r < rows; r++) for (let i = 0; i < 18; i++) { const x = ((i / 17) * 1400 - 60 + hash(i, r) * 50 + lt * (20 + r * 8)) % 1460 - 60, y = y0 + r * 34 + lt * (4 + r * 3) + Math.abs(Math.sin(t * 6 + i * 1.7 + r)) * -6, s = 9 + r * 7;
      K.wolf(x, y, s, a * (0.75 + 0.25 * r / Math.max(1, rows - 1)), t * 0.6, i + r * 20); }
  }
  return {
    horde(lt, d, t) {
      K.plate('plains_dusk', lt, d, { z0: 1.04, z1: 1.14 }); const k = inv(0.4, 3, lt);
      K.sil(MV, 640, 470, 330 + lt * 8, k * 0.9, t, { filter: 'brightness(0.18) saturate(0.4)', rate: 0.6 }); crowd(lt, t, k, 470, 3);
      K.staticArcs(980, 300, 160, inv(0.6, 1.6, lt) * (1 - inv(d - 2, d, lt)), t, 5); wind(t); POST.set({ vig: 0.7, sat: 0.9, bloom: 0.6, thr: 0.6 });
    },
    kurozaneArrives(lt, d, t, api) {
      const w = api.marks()[WF], k = ease.out(clamp((lt - 0.4) / 1.6)), cam = { pos: [w.x - 2.6, 1.3, w.z + 3.4], look: [w.x, 1.6, w.z], fov: 38 };
      api.render(t, cam, [...api.castList(t), [WF, { x: w.x, z: w.z, ry: w.ry }, { alpha: k, tint: lerp(0, 1, k) > 0.5 ? '#ffffff' : '#8890a8' }]]);
      const [x, y] = K.proj(S3.jointPos(WF, 'head', 0)); GFX.radial(x + 8, y + 6, 16, 'rgba(255,50,40,' + (0.95 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); api.postFor();
    },
    hordeArrives(lt, d, t, api) {
      const s = api.marks().sieg, cam = K.jolt({ pos: [s.x + 0.6, 1.2, s.z + 3.6], look: [s.x, 1.0, s.z - 8], fov: 52 }, t, 0.01 + inv(4, d, lt) * 0.03);
      api.render(t, cam, K.over(api, t, { sieg: { pose: { ...P().ready, ry: PI } } }), null, () => crowd(lt * 2, t, inv(0.4, 2.6, lt), 380, 4)); wind(t); api.postFor();
    },
    bridgeFight(lt, d, t, api) {
      const m = api.marks(), cast = ['takuto', 'sieg', 'rin', 'wick', 'm_wolf', 'haruki'].filter(n => m[n] && !m[n].hidden), seg = Math.floor(lt / 2.6) % cast.length, who = cast[(seg + Math.floor(hash(Math.floor(t), 2) * 2)) % cast.length], h = m[who], ph = lt % 2.6, hit = 0.9;
      const cam = K.jolt({ pos: [h.x + (seg % 2 ? 2.4 : -2.4), 1.1, h.z + 2.2], look: [h.x, 1.1, h.z - 1.4], fov: 40 }, t, ph > hit && ph < hit + 0.35 ? 0.14 : 0.015);
      const pose = who === 'takuto' || who === 'sieg' ? S3.seq(ph, [[0, P().ready], [hit - 0.3, { ...P().windup, weapon: 2.0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.8, P().ready]]) : { uaR: [1.8, 0.4], elR: 0.3, uaL: [1.2, 0.5], elL: 0.5 };
      api.render(t, cam, K.over(api, t, { [who]: { pose: { ...pose, ry: PI }, o: { axeGlow: 0.4, expr: { angry: 0.7 } } } }), null, () => crowd(ph * 3, t, 0.95, 400, 2));
      const [x, y] = K.proj([h.x, 1.0, h.z - 1.4]);
      if (ph > hit && ph < hit + 0.8) { const col = { rin: '#ff4a5a', wick: '#6ab8ff', haruki: '#d8f0ff', m_wolf: '#e8f0ff' }[who] || '#ffd0a0'; VFX.sparks(ph - hit, { x, y, n: 80, spread: 3, speed: 1200, color: col }); VFX.slash(ph - hit, { x, y: y - 30, r: 300, a0: -2.4, a1: 0.9, dur: 0.12, hold: 0.3, w: 90, flat: 0.75, rot: seg * 0.3, color: col });
        if (who === 'rin') K.thread(K.proj(S3.jointPos('rin', 'handR', 0)), [x, y], t, 1); if (who === 'wick') GFX.radial(x, y, 220, 'rgba(90,170,255,0.4)', 'rgba(0,0,0,0)', 1, 'lighter'); }
      wind(t, 0.4); api.postFor();
    },
    freezeLine(lt, d, t, api) {
      const s = api.marks().sieg, k = ease.out(clamp((lt - 0.6) / 0.6)), unf = inv(d - 1.6, d - 0.6, lt), cam = { pos: [s.x + 3.2, 1.4, s.z + 1.2], look: [s.x, 1.0, s.z - 4], fov: 46 };
      api.render(t, cam, api.castList(t), null, () => crowd(lt < 0.6 ? lt * 2 : 1.2, t, 0.95, 420, 2));
      if (k > 0) { GFX.fill('#a8d8ff', 0.14 * k * (1 - unf), 'screen'); for (let i = 0; i < 4; i++) K.frost(220 + i * 280, 460 + (i % 2) * 30, 150, 0.55 * k * (1 - unf), t); }
      if (lt > 0.6 && lt < 0.68) GFX.fill('#fff', 0.7); POST.set({ sat: lerp(1, 0.6, k * (1 - unf)), bloom: 0.7, thr: 0.55 });
    },
    morvuddRises(lt, d, t, api) {
      const mv = api.marks()[MV], h = K.H(MV), rise = ease.out(clamp((lt - 1.0) / (d - 3))), cam = K.jolt({ pos: [mv.x + 1.4, 0.8, mv.z + 13], look: [mv.x, h * 0.55 * rise + 1, mv.z], fov: 46 }, t, 0.02 + rise * 0.05);
      api.render(t, cam, [...api.castList(t).filter(c => c[0] !== MV), [MV, { x: mv.x, z: mv.z, y: lerp(-h, 0, rise) }, { water: 0, shake: 0.4 * (1 - rise) }]]);
      const [x, y] = K.proj([mv.x, 0, mv.z]); GFX.motes(t, { n: 80, vy: -40, color: '#6a5a4a', size: 10, glow: false, seed: 61, a: 0.5, x0: x - 500, x1: x + 500, y0: y - 200, y1: y + 40 }); wind(t); api.postFor();
    },
    siegFalls(lt, d, t, api) {
      const s = api.marks().sieg, mv = api.marks()[MV], kneel = ease.out(clamp((lt - 0.6) / 1.4)), k = ease.io(clamp(lt / d));
      const cam = { pos: [s.x + lerp(2.6, 1.3, k), lerp(1.2, 0.95, k), s.z - lerp(0.4, 1.4, k)], look: [s.x, lerp(1.1, 0.85, k), s.z], fov: lerp(38, 30, k) };
      api.render(t, cam, K.over(api, t, { sieg: { pose: { ...S3.blend(P().hit, P().kneel, kneel), x: s.x, z: s.z, ry: K.yaw(s, mv), weapon: 0 }, o: { expr: { sad: 0.6 } } }, [MV]: { o: { lunge: 0.2 * Math.sin(t) } } }));
      GFX.fill('#300004', 0.18 * k, 'multiply'); POST.set({ sat: lerp(1, 0.55, k), vig: 0.8, bloom: 0.4, thr: 0.7 }); GFX.fill('#000', inv(d - 1.4, d, lt) * 0.6);
    },
    timeStops(lt, d, t, api) {
      const tk = api.marks().takuto, frz = lt > 2.6, k = ease.out(clamp((lt - 2.6) / 0.6)), cam = { pos: [tk.x + 0.6, 1.5, tk.z + 2.0], look: [tk.x, 1.4, tk.z], fov: 34 };
      api.render(frz ? 2.6 : t, cam, K.over(api, t, { takuto: { pose: frz ? P().ready : { ...S3.run(t * 15, 1.0) }, o: { expr: { angry: 0.6 } } } }));
      GFX.motes(frz ? 2.6 * 3 : t * 3, { n: 160, vy: frz ? 0 : 900, vx: -120, color: '#a8b8d0', size: 1.3, glow: false, seed: 21, a: 0.55 });
      if (frz) { GFX.fill('#203050', 0.25 * k, 'multiply'); K.staticArcs(260, 220, 200, k, t, 4); K.staticArcs(1050, 520, 180, k, t + 3, 4); POST.set({ sat: lerp(1, 0.25, k), ca: 0.01 * k, vig: 0.7 }); } else api.postFor();
    },
    sableVanishes(lt, d, t, api) {
      const sb = api.marks().sable, k = ease.in(clamp((lt - 2.8) / 1.6)), cam = { pos: [sb.x + 0.5, 1.75, sb.z + 1.6], look: [sb.x, 1.7, sb.z], fov: 28 };
      api.render(t, cam, K.over(api, t, { sable: { o: { expr: { happy: 0.9 }, alpha: 1 - k } } }));
      const [x, y] = K.proj(S3.jointPos('sable', 'head', 0.1)); K.staticArcs(x, y + 80, 300, 0.3 + k, t, 8); if (lt > 4.3 && lt < 4.5) GFX.fill('#e0e8ff', 0.6, 'lighter');
      POST.set({ sat: 0.3, ca: 0.01, vig: 0.7 });
    },
    redRising(lt, d, t, api) {
      const tk = api.marks().takuto, k = ease.in(clamp(lt / (d - 1))), cam = K.jolt({ pos: [tk.x + 0.4, 1.6, tk.z + lerp(1.6, 0.8, k)], look: [tk.x, 1.55, tk.z], fov: 28 }, t, 0.005 + k * 0.03);
      api.render(t, cam, K.over(api, t, { takuto: { o: { axeGlow: k, expr: { angry: 1 } } } }));
      S3.eyePos('takuto').forEach(e => { const [x, y] = K.proj(e); GFX.radial(x, y, 10 + k * 30, 'rgba(255,40,30,' + (0.4 + k * 0.6).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter'); });
      if (lt > 2) RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, 1.2, { t, wind: 2 }, { a: 0.25 * k, comp: 'screen' }); K.crimson(k);
    },
    shoulderHand(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hr = m.haruki, step = ease.io(clamp(lt / 1.6)), hp = { x: lerp(hr.x, tk.x + 0.45, step), z: lerp(hr.z, tk.z + 0.35, step) }, calm = inv(3.6, 7, lt);
      const cam = lt < 3.4 ? { pos: [tk.x + 1.8, 1.4, tk.z + 2.2], look: [lerp(tk.x, hp.x, 0.5), 1.4, lerp(tk.z, hp.z, 0.5)], fov: 36 } : { pos: [tk.x - 0.35, 1.5, tk.z - 1.7], look: [tk.x + 0.2, 1.45, tk.z + 0.15], fov: 30 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { x: hp.x, z: hp.z, ry: K.yaw(hp, tk), ...(lt > 1.6 ? { uaR: [1.5, 0.1], elR: 0.5 } : S3.walk(t * 4, 0.6)) }, o: { expr: { sad: 0.4 } } }, takuto: { o: { axeGlow: 1 - calm, expr: { angry: 1 - calm } } } }));
      K.crimson(1 - calm); if (calm > 0) GFX.fill('#a8d8ff', 0.08 * calm * (1 - inv(6, d, lt)), 'screen');
    },
    comboFinish(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, mv = m[MV], h = K.H(MV), f0 = 0.6, f1 = 3.6, hit = 7.0, frz = lt > f0 && lt < f1 + 3;
      const H1 = { x: lerp(tk.x, mv.x, 0.6), z: lerp(tk.z, mv.z, 0.6) }, jump = clamp((lt - 6.0) / 1.0), y = Math.sin(jump * PI * 0.85) * 3.2;
      const pose = lt < 6 ? P().ready : lt < hit ? { ...P().windup, weapon: 2.0, y } : { ...P().chop, weapon: 1.7, y: Math.max(0, y) };
      const cam = K.jolt(lt < 6 ? { pos: [mv.x + 6, 1.6, mv.z + 9], look: [mv.x, h * 0.5, mv.z], fov: 44 } : { pos: [H1.x + 7, 2.0, H1.z + 4], look: [mv.x, h * 0.5, mv.z], fov: 42 }, t, lt > hit && lt < hit + 1 ? 0.35 * (1 - (lt - hit)) : 0.01);
      const dead = lt > hit + 0.4, fade = dead ? clamp((lt - hit - 0.4) / 2) : 0;
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...pose, x: lt < 6 ? tk.x : lerp(tk.x, H1.x, ease.io(jump)), z: lt < 6 ? tk.z : lerp(tk.z, H1.z, ease.io(jump)), ry: K.yaw(tk, mv) }, o: { axeGlow: inv(5, hit, lt), expr: { angry: 0.7 } } }, [MV]: { o: { flash: lt > hit && lt < hit + 0.15 ? 1 : 0, shake: frz ? 0 : 0.3 + (dead ? 1 - fade : 0), alpha: 1 - fade, tint: frz ? '#cfe8ff' : dead ? '#ff9a8a' : undefined } } }));
      const [x, yy] = K.proj([mv.x, h * 0.5, mv.z]);
      if (frz) { K.frost(x, yy, 520, ease.out(clamp((lt - f0) / 0.5)) * (1 - inv(f1 + 2, f1 + 3, lt)), t); GFX.fill('#a8d8ff', 0.1, 'screen'); }
      if (lt > 3.4 && lt < 5.4) { VFX.slash(lt - 3.4, { x, y: yy, r: 520, a0: -2.4, a1: 0.9, dur: 0.15, hold: 0.4, w: 120, flat: 0.7, rot: 0.2, color: '#bfe0ff' }); if (lt > 4.0) VFX.slash(lt - 4.0, { x, y: yy, r: 520, a0: -2.4, a1: 0.9, dur: 0.15, hold: 0.4, w: 120, flat: 0.7, rot: 0.2, color: '#e0f0ff' }); }
      if (lt > 5.2 && lt < hit) { const [hx, hy] = K.proj([tk.x, 1.0, tk.z]); VFX.aura(t, { x: hx, y: hy, w: 300, h: 420, n: 50, a: 0.7, color: '#ffd0b0' }); }
      if (lt > hit - 0.15) { VFX.slash(lt - hit + 0.15, { x, y: yy - 60, r: 620, a0: -2.4, a1: 0.95, dur: 0.22, hold: 0.9, w: 160, flat: 0.75, rot: 0.15 }); if (lt > hit) { VFX.ring(lt - hit, { x, y: yy, r1: 1500, dur: 1.0, flat: 1, color: '#ffd0c0' }); VFX.sparks(lt - hit, { x, y: yy, n: 140, spread: 3.2, speed: 1600, color: '#ffc29a' }); } }
      if (dead) VFX.debris(lt - hit - 0.4, { x, y: yy, n: 80, speed: 1000, size: 16, seed: 7 });
      if (lt > hit && lt < hit + 0.09) GFX.fill('#fff'); else if (lt > hit + 0.09 && lt < hit + 0.18) GFX.impact('inv');
      POST.set({ bloom: 0.9, thr: 0.5 });
    },
    encore(lt, d, t, api) {
      const v = api.marks().valentine, cam = { pos: [v.x + 2.4, 1.3, v.z + 2.0], look: [v.x - 0.4, 1.4, v.z - 4], fov: 44 };
      const k = ease.out(clamp((lt - 0.4) / 1.2)), loop = (lt * 0.8) % 1, c = GFX.ctx;
      api.render(t, cam, K.over(api, t, { valentine: { pose: { uaL: [2.4, 0.6], elL: 0.3, uaR: [2.4, 0.6], elR: 0.3, ry: PI }, o: { expr: { happy: 0.8 } } } }), null, () => crowd(loop * 2, t, 0.95 * k, 440, 2));
      GFX.fill('#ff60b0', 0.12 * k, 'screen'); [[320, 0], [960, 1]].forEach(([x, i]) => { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(x, 0, x + (i ? -260 : 260), 720); g.addColorStop(0, 'rgba(255,190,230,' + (0.5 * k).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,120,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 30, 0); c.lineTo(x + 30, 0); c.lineTo(x + (i ? -120 : 380), 720); c.lineTo(x + (i ? -380 : 120), 720); c.closePath(); c.fill(); c.restore(); });
      c.save(); c.fillStyle = 'rgba(120,10,40,' + (0.85 * k).toFixed(2) + ')'; c.fillRect(0, 0, 1280 * 0.12 * k, 720); c.fillRect(1280 - 1280 * 0.12 * k, 0, 1280 * 0.12 * k, 720); c.restore();
      GFX.motes(t, { n: 60, vy: 40, color: '#ff9ad8', size: 3, seed: 7, a: k }); POST.set({ bloom: 0.8, thr: 0.5, sat: 1.15 });
    },
    nextTitle: K.title('第十一話', '厄災', 'CALAMITY', 120),
  };
})();
const EP10 = DIRECTOR.episode(EP10_SCRIPT, EP10_CUSTOM);
