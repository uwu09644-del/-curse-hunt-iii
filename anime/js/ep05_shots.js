/* RUINBREAKER — Episode 5: hand-directed moments (eyes under the lake, the Hydra rising and regrowing, Wick boiling
   the lake, Rin's seven threads, the heart breaking) and the build. */
'use strict';

const EP05_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES;
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  const proj = p => S3.project(p[0], p[1], p[2]);
  const over = (api, t, map) => api.castList(t).map(c => map[c[0]] ? [c[0], { ...c[1], ...map[c[0]].pose }, { ...c[2], ...(map[c[0]].o || {}) }] : c);
  const HY = 'm_hydra', HH = () => S3.SPRITE_H[HY] || 6;
  function plate(id, lt, d, z0 = 1.0, z1 = 1.12, pan = 0) {
    const im = S3.plateImage(id), c = GFX.ctx, k = ease.io(clamp(lt / d)), z = lerp(z0, z1, k);
    if (!im) return GFX.fill('#0c0e14');
    const s = Math.max(1280 / im.width, 720 / im.height) * z * 1.06; c.drawImage(im, 640 - im.width * s / 2 + pan * k * 1280, 360 - im.height * s / 2, im.width * s, im.height * s);
  }
  function waterline(t, m, depth, a = 1) { // spray and mist where the creature meets the water
    const [x0, y0] = proj([m.x, 0, m.z]), [, y1] = proj([m.x, -depth, m.z]), w = Math.abs(proj([m.x + 3.2, 0, m.z])[0] - x0) + 120;
    for (let i = 0; i < 14; i++) { const u = (i / 13 - 0.5) * 2, x = x0 + u * w + Math.sin(t * 1.3 + i) * 20; GFX.radial(x, y0 + 10 + hash(i, 3) * 20, 90 + hash(i, 4) * 90, 'rgba(214,224,232,' + (0.55 * a).toFixed(2) + ')', 'rgba(214,224,232,0)', 1); }
    if (y1 > y0 + 4) { const c = GFX.ctx, g = c.createLinearGradient(0, y0, 0, y1 + 30); g.addColorStop(0, 'rgba(60,74,88,0)'); g.addColorStop(0.3, 'rgba(60,74,88,' + (0.5 * a).toFixed(2) + ')'); g.addColorStop(1, 'rgba(60,74,88,0)'); c.fillStyle = g; c.fillRect(x0 - w, y0, w * 2, y1 - y0 + 30); }
  }
  const heads = () => { const h = HH(), im = S3.chars[HY] && S3.chars[HY].mat.map.image, wd = h * (im ? im.width / im.height : 1); return [-0.38, -0.25, -0.12, 0, 0.12, 0.25, 0.38].map((u, i) => [u * wd, h * (0.78 + 0.12 * Math.cos(u * 4.5) + 0.04 * hash(i, 7))]); };
  const headPt = (m, i, rise = 0) => { const [dx, dy] = heads()[i]; return [m.x + dx, dy + rise, m.z]; };
  function eyes(lt, t, n, a, y0) { // pairs of glowing eyes under dark water
    for (let i = 0; i < n; i++) { const x = 330 + i * 105 + hash(i, 2) * 40, y = y0 + hash(i, 5) * 60 - Math.sin(t * 0.7 + i) * 6, k = a * clamp((lt - i * 0.55) / 0.6);
      if (k <= 0) continue; [-9, 9].forEach(dx => GFX.radial(x + dx, y, 16, 'rgba(255,240,180,' + (0.95 * k).toFixed(2) + ')', 'rgba(120,255,200,0)', 1, 'lighter')); GFX.radial(x, y, 60, 'rgba(90,220,180,' + (0.18 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); }
  }
  function thread(a, b, t, k = 1, sag = 30, w = 2.4, i = 0) { // a glowing red thread from screen point a to b, drawn k of the way
    const c = GFX.ctx, mx = (a[0] + b[0]) / 2 + Math.sin(t * 3 + i) * 6, my = (a[1] + b[1]) / 2 + sag, ex = lerp(a[0], b[0], k), ey = lerp(a[1], b[1], k);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [[10, 'rgba(255,40,60,0.18)'], [w, 'rgba(255,80,90,0.95)'], [1, 'rgba(255,220,220,0.9)']].forEach(([lw, col]) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(lerp(a[0], mx, k), lerp(a[1], my, k), ex, ey); c.stroke(); });
    c.restore(); GFX.radial(ex, ey, 22, 'rgba(255,120,120,0.8)', 'rgba(255,40,60,0)', 1, 'lighter');
  }
  function chains(t, glow, snap = 0) {
    const g = GFX.ctx; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const p = proj(S3.weaponTip('takuto', -0.05 + i * 0.11)), off = snap > 0 ? [Math.cos(i * 2.3) * snap * 160, Math.sin(i * 1.7) * snap * 120 + snap * snap * 200] : [0, 0];
      g.strokeStyle = 'rgba(255,200,90,' + (0.9 * glow * (1 - snap)).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(p[0] + off[0], p[1] + off[1], 7, 4, i * 0.6 + t * 2, 0, 7); g.stroke();
      GFX.radial(p[0] + off[0], p[1] + off[1], 16, 'rgba(255,180,80,' + (0.5 * glow * (1 - snap)).toFixed(2) + ')', 'rgba(255,120,40,0)', 1, 'lighter'); }
    g.restore();
  }
  const rain = (t, a = 0.5) => GFX.motes(t * 3, { n: 160, vy: 900, vx: -120, color: '#a8b8d0', size: 1.3, glow: false, seed: 21, a });
  return {
    lakeLights(lt, d, t) {
      plate('marrowmere_lake', lt, d, 1.05, 1.18);
      const c = GFX.ctx, g = c.createLinearGradient(0, 430, 0, 720); g.addColorStop(0, 'rgba(8,14,22,0)'); g.addColorStop(1, 'rgba(8,14,22,0.75)'); c.fillStyle = g; c.fillRect(0, 430, 1280, 290);
      eyes(lt, t, 7, inv(0.6, 2.0, lt) * (1 - inv(d - 1.6, d - 0.8, lt)), 560 - ease.in(clamp((lt - 4) / 3)) * 80);
      if (lt > d - 1.0) { const k = clamp((lt - d + 1.0) / 0.3); GFX.fill('#e8f0f8', k * 0.9); }
      POST.set({ bloom: 0.7, thr: 0.55, sat: 0.95 });
    },
    hydraRise(lt, d, t, api) {
      const m = api.marks()[HY], h = HH(), rise = ease.out(clamp((lt - 1.2) / (d - 3.2))), y = lerp(-h * 0.98, 0, rise);
      const cam = jolt({ pos: [m.x + 1.6, 1.0, m.z + 11.5], look: [m.x, h * 0.55, m.z], fov: 42 }, t, 0.02 + (rise > 0 && rise < 1 ? 0.06 : 0));
      api.render(t, cam, [...api.castList(t).filter(c => c[0] !== HY), [HY, { x: m.x, z: m.z, y, ry: 0 }, { water: 0, shake: rise < 1 ? 0.4 : 0 }]]);
      waterline(t, m, -y, rise > 0 ? 1 : 0.3);
      if (rise > 0 && rise < 1) { const [x, yy] = proj([m.x, 0, m.z]); VFX.sparks(lt % 1.2, { x, y: yy, n: 40, spread: 3.2, speed: 700, color: '#d8e6f0' }); }
      if (lt < 1.2) eyes(lt + 2, t, 7, 1 - inv(0.6, 1.2, lt), 520);
      api.postFor();
    },
    hydraSink(lt, d, t, api) {
      const m = api.marks()[HY], h = HH(), k = ease.in(clamp((lt - 0.8) / (d - 2.4))), y = -h * 0.98 * k;
      const cam = { pos: [m.x - 1.2, 1.3, m.z + 12], look: [m.x, h * 0.5 - k * 1.5, m.z], fov: 40 };
      api.render(t, cam, [...api.castList(t).filter(c => c[0] !== HY), [HY, { x: m.x, z: m.z, y, ry: 0 }, { water: 0 }]]);
      waterline(t, m, -y, 1 - inv(d - 1.6, d, lt) * 0.6);
      if (k > 0.85) { const [x, yy] = proj(headPt(m, 3, y)); GFX.radial(x, Math.max(yy, proj([m.x, 0, m.z])[1] + 20), 30, 'rgba(255,240,180,' + (0.8 * (1 - inv(d - 1.2, d, lt))).toFixed(2) + ')', 'rgba(120,255,200,0)', 1, 'lighter'); }
      api.postFor();
    },
    regrow(lt, d, t, api) {
      const m = api.marks()[HY], h = HH(), cut = 0.5, grow = ease.out(clamp((lt - 1.6) / 2.4)), two = ease.out(clamp((lt - 4.2) / 1.8));
      const cam = jolt({ pos: [m.x + 2.6, h * 0.62, m.z + 6.8], look: [m.x - 0.6, h * 0.72, m.z], fov: 38 }, t, lt > cut && lt < cut + 0.6 ? 0.12 : 0.01);
      api.render(t, cam, over(api, t, { [HY]: { o: { shake: lt < cut + 1 ? 0.6 : 0.15, squash: Math.sin(clamp((lt - 1.6) / 2.4) * PI * 3) * 0.3 * (1 - two * 0.5), flash: lt > cut && lt < cut + 0.1 ? 1 : 0 } } }));
      const n = proj(headPt(m, 1)), base = [n[0] + 30, n[1] + 120];
      if (lt > cut && lt < cut + 1.4) { VFX.sparks(lt - cut, { x: n[0], y: n[1], n: 60, spread: 2.6, speed: 900, color: '#6cff9a' }); VFX.debris(lt - cut, { x: n[0], y: n[1], n: 24, speed: 500, size: 12, seed: 3 }); }
      const c = GFX.ctx; c.save(); c.lineCap = 'round';
      [[grow, -40, 0], [two, 70, 1], [two, -120, 2]].forEach(([k, dx, i]) => { if (k <= 0) return; const tip = [base[0] + dx * k, base[1] - 220 * k - (i === 2 ? 30 : 0)], ctl = [base[0] + dx * 0.3 + Math.sin(t * 4 + i) * 30, base[1] - 120 * k];
        [[34, 'rgba(18,40,30,0.95)'], [22, 'rgba(46,92,64,1)'], [6, 'rgba(140,255,170,0.6)']].forEach(([lw, col]) => { c.strokeStyle = col; c.lineWidth = lw * (0.4 + 0.6 * k); c.beginPath(); c.moveTo(base[0], base[1]); c.quadraticCurveTo(ctl[0], ctl[1], tip[0], tip[1]); c.stroke(); });
        c.fillStyle = 'rgba(30,62,44,1)'; c.beginPath(); c.ellipse(tip[0], tip[1], 34 * k, 24 * k, -0.3, 0, 7); c.fill();
        [-9, 9].forEach(e => GFX.radial(tip[0] + e, tip[1] - 6, 10 * k, 'rgba(255,240,160,1)', 'rgba(120,255,200,0)', 1, 'lighter')); });
      c.restore();
      if (grow > 0 && grow < 1) GFX.radial(base[0], base[1] - 90, 220, 'rgba(110,255,160,0.18)', 'rgba(0,0,0,0)', 1, 'lighter');
      api.postFor();
    },
    boil(lt, d, t, api) {
      const m = api.marks(), wk = m.wick, k = ease.out(clamp((lt - 0.4) / 1.4));
      const cam = { pos: [wk.x - 1.6, 1.2, wk.z + 2.8], look: [wk.x + 1.2, 0.6, wk.z - 6], fov: 40 };
      api.render(t, cam, over(api, t, { wick: { pose: { uaL: [1.6, 0.3], elL: 0.2, uaR: [1.6, 0.3], elR: 0.2, lean: 0.2, crouch: 0.15 }, o: { expr: { angry: 0.7 } } } }));
      for (let i = 0; i < 18; i++) { const u = hash(i, 4), x = 80 + u * 1120, y = 470 + hash(i, 6) * 160, f = k * (0.6 + 0.4 * Math.sin(t * 7 + i * 1.7));
        GFX.radial(x, y, 50 + 40 * hash(i, 8), 'rgba(110,190,255,' + (0.45 * f).toFixed(2) + ')', 'rgba(40,90,255,0)', 1, 'lighter'); }
      GFX.motes(t, { n: 120, vy: -120, color: '#dfe8f0', size: 5, glow: false, seed: 13, a: 0.35 * k });
      const [hx, hy] = proj(S3.jointPos('wick', 'handR', 0)); GFX.radial(hx, hy, 120, 'rgba(120,200,255,' + (0.8 * k).toFixed(2) + ')', 'rgba(40,90,255,0)', 1, 'lighter');
      rain(t, 0.4); api.postFor();
    },
    threadsTie(lt, d, t, api) {
      const m = api.marks(), hy = m[HY], rn = m.rin, times = [0.5, 1.4, 2.3, 4.2, 5.2, 8.2, 9.0];
      const strain = clamp((lt - 6) / 2), wide = lt > 3.6;
      const cam = wide ? jolt({ pos: [rn.x + 2.8, 0.7, rn.z + 4.2], look: [hy.x, HH() * 0.6, hy.z], fov: 46 }, t, strain * 0.04) : { pos: [rn.x - 0.9, 1.5, rn.z + 1.6], look: [rn.x + 0.2, 1.35, rn.z - 0.6], fov: 34 };
      api.render(t, cam, over(api, t, { rin: { pose: { uaL: [1.9, 0.4], elL: 0.3, uaR: [1.2 + strain * 0.5, 0.5], elR: 0.4, lean: -0.15 * strain, crouch: 0.15 + strain * 0.12, ry: Math.atan2(hy.x - rn.x, hy.z - rn.z) }, o: { expr: { angry: 0.5 + strain * 0.4 } } }, [HY]: { o: { shake: 0.25 + strain * 0.5 } } }));
      const a = proj(S3.jointPos('rin', 'handL', 0.05));
      times.forEach((t0, i) => { const k = ease.out(clamp((lt - t0) / 0.45)); if (k > 0) thread(a, proj(headPt(hy, [3, 0, 6, 1, 5, 2, 4][i])), t, k, 40 + i * 8, 2.4, i); });
      if (lt > 9.0) { const ctr = proj(headPt(hy, 3)); GFX.radial(ctr[0], ctr[1], 120 * ease.out(clamp((lt - 9) / 0.5)), 'rgba(255,90,100,0.6)', 'rgba(255,40,60,0)', 1, 'lighter'); }
      GFX.radial(a[0], a[1], 60 + strain * 40, 'rgba(255,60,80,0.5)', 'rgba(255,40,60,0)', 1, 'lighter');
      rain(t, 0.45); api.postFor();
    },
    harnessBlock(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hit = 2.0, lock = clamp((lt - 1.3) / 0.3), lunge = Math.max(0, 1 - Math.abs(lt - hit) / 0.7);
      const cam = jolt(lt < 3.4 ? { pos: [tk.x + 2.6, 1.0, tk.z + 2.4], look: [tk.x, 1.5, tk.z - 1], fov: 38 } : { pos: [tk.x + 0.4, 1.5, tk.z + 1.6], look: [tk.x, 1.5, tk.z], fov: 28 }, t, lt > hit && lt < hit + 0.5 ? 0.18 * (1 - (lt - hit) / 0.5) : 0.01);
      api.render(t, cam, over(api, t, { takuto: { pose: { ...(lock > 0 ? P().block : P().ready), weapon: lock > 0 ? 1.2 : 0, ry: Math.atan2(m[HY].x - tk.x, m[HY].z - tk.z) }, o: { axeGlow: 0.3, expr: { angry: 0.7 } } }, [HY]: { pose: { x: lerp(m[HY].x, tk.x, lunge * 0.4), z: lerp(m[HY].z, tk.z, lunge * 0.4) }, o: { lunge, tilt: lunge * 0.06 } } }));
      if (lock > 0) chains(t, lock * (1 - inv(hit + 1.6, hit + 2.6, lt)), lt > hit + 1.4 ? clamp((lt - hit - 1.4) / 0.8) : 0);
      if (lt > hit && lt < hit + 0.9) { const [x, y] = proj(S3.weaponTip('takuto', 0.5)); VFX.sparks(lt - hit, { x, y, n: 90, spread: 2.8, speed: 1200, color: '#ffd28a' }); VFX.ring(lt - hit, { x, y, r1: 700, dur: 0.6, flat: 0.9 }); if (lt < hit + 0.07) GFX.fill('#fff', 0.7); }
      rain(t, 0.45); api.postFor();
    },
    heartBreak(lt, d, t, api) {
      const m = api.marks(), hy = m[HY], rn = m.rin, tk = m.takuto, h = HH();
      const sink = ease.in(clamp((lt - 1.0) / 5.0)), drag = ease.io(clamp((lt - 1.0) / 2.6)) * (1 - ease.io(clamp((lt - 4.0) / 2.8)) * 0.85), snap = lt > 7.2;
      const rx = lerp(rn.x, lerp(rn.x, hy.x, 0.35), drag), rz = lerp(rn.z, lerp(rn.z, hy.z, 0.35), drag);
      const cam = jolt(lt < 6.8 ? { pos: [tk.x + 3.6, 1.1, tk.z + 4.2], look: [lerp(tk.x, hy.x, 0.4), 1.6, lerp(tk.z, hy.z, 0.4)], fov: 44 } : { pos: [tk.x - 0.8, 1.2, tk.z + 2.6], look: [rx, 0.9, rz], fov: 34 }, t, lt < 1 ? 0.12 : 0.02 + drag * 0.04);
      const cast = over(api, t, { rin: { pose: { ...P().hit, x: rx, z: rz, pitch: -0.4 * drag, crouch: 0.2, ry: Math.atan2(tk.x - rx, tk.z - rz) }, o: { expr: { Surprised: 0.6 } } }, takuto: { pose: { uaL: [1.4, 0.2], elL: 0.4, uaR: [1.4, 0.2], elR: 0.4, lean: -0.35 * clamp((lt - 3.4) / 0.6), crouch: 0.2, ry: Math.atan2(rx - tk.x, rz - tk.z) }, o: { expr: { angry: 0.9 } } } }).filter(c => c[0] !== HY);
      if (sink < 0.99) cast.push([HY, { x: hy.x, z: hy.z, y: -h * sink, ry: 0 }, { water: 0, flash: lt < 0.25 ? 1 : 0, tint: '#a0b0c0', shake: 0.6 * (1 - sink) }]);
      api.render(t, cam, cast);
      if (sink < 0.99) waterline(t, hy, h * sink, 1);
      const ra = proj(S3.jointPos('rin', 'handL', 0.05)), ta = proj(S3.jointPos('takuto', 'handR', 0.05));
      if (!snap) { [0, 1, 2, 3, 4, 5, 6].forEach(i => thread(ra, proj(headPt(hy, i, -h * sink)), t, 1, 20, 2.2 - drag, i)); }
      else if (lt < 8.4) VFX.sparks(lt - 7.2, { x: ra[0], y: ra[1], n: 80, spread: 3, speed: 900, color: '#ff6a7a' });
      if (lt > 3.2) thread(ta, ra, t, ease.out(clamp((lt - 3.2) / 0.3)), 10, 3, 9);
      if (lt < 0.15) GFX.fill('#fff', 0.8);
      rain(t, 0.45 * (1 - inv(7.5, 10, lt))); api.postFor();
    },
    nextTitle(lt, d, t) {
      const a = inv(0, 0.8, lt); GFX.fill('#050406');
      GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt('第六話', 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      GFX.txt('赤き巨人の行進', 640, 430, { font: '400 92px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 12, a }); GFX.txt('THE RED GIANTS MARCH', 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
      GFX.fill('#000', inv(d - 1.2, d, lt));
    },
  };
})();
const EP05 = DIRECTOR.episode(EP05_SCRIPT, EP05_CUSTOM);
