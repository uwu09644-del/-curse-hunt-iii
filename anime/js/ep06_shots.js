/* RUINBREAKER — Episode 6: hand-directed moments (the giants marching in step, the boulder, White Gale, the cracked
   shell, Rin grabbed, Akuro's eye opening, the crimson frenzy, Rin hurt) and the build. */
'use strict';

const EP06_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES;
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  const proj = p => S3.project(p[0], p[1], p[2]);
  const over = (api, t, map) => api.castList(t).map(c => map[c[0]] ? [c[0], { ...c[1], ...map[c[0]].pose }, { ...c[2], ...(map[c[0]].o || {}) }] : c);
  const RG = 'm_redgiant', GH = () => S3.SPRITE_H[RG] || 4.6, yaw = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const ash = (t, a = 0.7) => GFX.motes(t * 4, { n: 90, vy: -50, vx: 30, color: '#ff8a4a', size: 2.2, seed: 31, a });
  function plate(id, lt, d, z0 = 1.0, z1 = 1.12, pan = 0, shake = 0) {
    const im = S3.plateImage(id), c = GFX.ctx, k = ease.io(clamp(lt / d)), z = lerp(z0, z1, k), sx = shake ? (hash(GFX.twos(lt, 30), 1) - 0.5) * shake : 0, sy = shake ? (hash(GFX.twos(lt, 30), 2) - 0.5) * shake : 0;
    if (!im) return GFX.fill('#120806');
    const s = Math.max(1280 / im.width, 720 / im.height) * z * 1.06; c.drawImage(im, 640 - im.width * s / 2 + pan * k * 1280 + sx, 360 - im.height * s / 2 + sy, im.width * s, im.height * s);
  }
  function giantSil(x, y, h, a, t, i) { // a distant giant: the sprite drawn small and dark, with burning eyes
    const ch = S3.chars[RG], im = ch && ch.mat.map.image; if (!im) return; const w = h * im.width / im.height, c = GFX.ctx, bob = Math.abs(Math.sin(t * 2.2 * PI / 2 + 0)) * h * 0.02;
    c.save(); c.globalAlpha = a; c.filter = 'brightness(0.32) saturate(0.6)'; c.drawImage(im, x - w / 2, y - h - bob, w, h); c.restore();
    [-0.06, 0.06].forEach(e => GFX.radial(x + e * w, y - h * 0.84 - bob, Math.max(3, h * 0.03), 'rgba(255,80,40,' + (0.95 * a).toFixed(2) + ')', 'rgba(255,40,20,0)', 1, 'lighter'));
  }
  function ribbons(from, to, t, k, n = 5, wrap = 0) { // White Gale: cutting ribbons of wind
    const c = GFX.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const ph = t * 5 + i * 1.3, e = clamp(k * 1.3 - i * 0.08), ex = lerp(from[0], to[0], e), ey = lerp(from[1], to[1], e) + Math.sin(ph) * 40 * (1 - e);
      c.strokeStyle = 'rgba(230,245,255,' + (0.75 * (1 - i * 0.1)).toFixed(2) + ')'; c.lineWidth = 5 - i * 0.6; c.beginPath(); c.moveTo(from[0], from[1]);
      c.bezierCurveTo(from[0] + Math.cos(ph) * 160, from[1] - 120 + i * 30, lerp(from[0], ex, 0.6) + Math.sin(ph) * 120, ey - 80, ex, ey); c.stroke();
      if (wrap > 0) { c.strokeStyle = 'rgba(220,240,255,0.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(to[0], to[1] - 60 + i * 40, 70 * wrap, 18 * wrap, 0.1 * Math.sin(t + i), ph % 6, ph % 6 + 4.8 * wrap); c.stroke(); } }
    c.restore();
  }
  function eye(cx, cy, r, open, t) { // Akuro's eye: a red iris with a black slit, opening
    const c = GFX.ctx, h = r * 0.55 * open; if (h < 1) return;
    c.save(); c.beginPath(); c.moveTo(cx - r, cy); c.quadraticCurveTo(cx, cy - h * 2, cx + r, cy); c.quadraticCurveTo(cx, cy + h * 2, cx - r, cy); c.closePath(); c.clip();
    c.fillStyle = '#1a0004'; c.fillRect(cx - r, cy - r, r * 2, r * 2);
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, r * 0.7); g.addColorStop(0, '#ffd27a'); g.addColorStop(0.35, '#ff3a1a'); g.addColorStop(1, '#4a0006'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 0.62, 0, 7); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(cx, cy, r * 0.07 * (1 + 0.2 * Math.sin(t * 3)), r * 0.5, 0, 0, 7); c.fill(); c.restore();
    c.save(); c.strokeStyle = 'rgba(255,60,40,0.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - r, cy); c.quadraticCurveTo(cx, cy - h * 2, cx + r, cy); c.quadraticCurveTo(cx, cy + h * 2, cx - r, cy); c.stroke(); c.restore();
    GFX.radial(cx, cy, r * 1.8, 'rgba(255,40,20,' + (0.35 * open).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter');
  }
  const crimson = (k) => { GFX.fill('#ff1020', 0.14 * k, 'multiply'); POST.set({ sat: 1.25, gain: [1.15, 0.86, 0.84], bloom: 0.8, thr: 0.5, vig: 0.6 }); };
  return {
    giantsMarch(lt, d, t) {
      const step = Math.abs(Math.sin(lt * PI * 0.9)), boom = Math.pow(step, 12);
      plate('fort_battle', lt, d, 1.04, 1.14, 0.02, boom * 8);
      const c = GFX.ctx, g = c.createLinearGradient(0, 300, 0, 720); g.addColorStop(0, 'rgba(10,4,4,0)'); g.addColorStop(1, 'rgba(10,4,4,0.6)'); c.fillStyle = g; c.fillRect(0, 300, 1280, 420);
      const adv = ease.io(clamp(lt / d)) * 30;
      [[430, 52, 0.55, 13], [470, 84, 0.75, 9], [530, 130, 0.95, 6]].forEach(([y, h, a, n], row) => { for (let i = 0; i < n; i++) { const x = 80 + (i + 0.5) * (1120 / n) + (row % 2) * 40 + Math.sin(i * 1.7) * 14; giantSil(x, y + adv * (row + 1) * 0.6, h + adv * (row + 1) * 0.3, a * inv(0, 1.2, lt), lt, i); } });
      GFX.motes(t, { n: 60, vy: -30, color: '#b0a090', size: 3, glow: false, seed: 4, a: 0.3 + boom * 0.3 }); ash(t, 0.6);
      POST.set({ bloom: 0.6, thr: 0.6, sat: 1.05, vig: 0.5 });
    },
    axeWhisper(lt, d, t, api) {
      const tk = api.marks().takuto, pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      api.render(t, { pos: [tk.x + 0.6, 0.95, tk.z + 1.2], look: [tk.x + 0.1, 0.75, tk.z], fov: 30 }, over(api, t, { takuto: { o: { axeGlow: 0.3 + pulse * 0.5, expr: { angry: 0.3 } } } }));
      const [x, y] = proj(S3.weaponTip('takuto', 0.6)); GFX.radial(x, y, 160 + pulse * 60, 'rgba(255,40,30,' + (0.25 + pulse * 0.2).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter');
      GFX.fill('#300004', 0.18 * pulse, 'multiply'); api.postFor();
    },
    boulder(lt, d, t) {
      const hit = 1.6, k = clamp(lt / hit), shake = lt > hit && lt < hit + 0.8 ? 26 * (1 - (lt - hit) / 0.8) : 0;
      plate('fort_wall', lt, d, 1.06, 1.12, -0.02, shake);
      if (lt < hit) { const x = lerp(1180, 620, k), y = lerp(120, 380, k) - Math.sin(k * PI) * 120, r = lerp(30, 90, k), c = GFX.ctx;
        for (let i = 4; i >= 1; i--) GFX.radial(x + i * 26, y - i * 10, r * (1 - i * 0.12), 'rgba(60,40,30,' + (0.18 / i).toFixed(2) + ')', 'rgba(0,0,0,0)', 1);
        c.fillStyle = '#3a2a22'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); GFX.radial(x - r * 0.3, y - r * 0.3, r, 'rgba(255,120,60,0.45)', 'rgba(255,60,20,0)', 1, 'lighter'); }
      else { if (lt < hit + 0.08) GFX.fill('#fff', 0.7); VFX.debris(lt - hit, { x: 620, y: 400, n: 70, speed: 900, size: 16, seed: 12 }); VFX.sparks(lt - hit, { x: 620, y: 400, n: 60, spread: 3, speed: 900, color: '#ffb070' }); GFX.motes(t, { n: 80, vy: -60, color: '#a89888', size: 6, glow: false, seed: 6, a: 0.5 * (1 - inv(hit + 1, d, lt)) }); }
      ash(t); POST.set({ bloom: 0.5, thr: 0.65 });
    },
    gale(lt, d, t, api) {
      const m = api.marks(), vs = m.vesper, gt = m[RG], k = ease.out(clamp((lt - 0.4) / 1.4)), fall = ease.in(clamp((lt - 2.6) / 2.6));
      const cam = jolt({ pos: [vs.x + 2.2, 1.3, vs.z + 3.0], look: [lerp(vs.x, gt.x, 0.6), GH() * 0.5, lerp(vs.z, gt.z, 0.6)], fov: 42 }, t, fall > 0 && fall < 1 ? 0.06 : 0);
      api.render(t, cam, over(api, t, { vesper: { pose: { uaR: [2.2, 0.5], elR: 0.2, uaL: [0.8, 0.4], elL: 0.6, lean: 0.12, ry: yaw(vs, gt) } }, [RG]: { o: { tilt: -fall * 0.5, alpha: 1 - fall * 0.9, shake: k * 0.6, flash: lt > 1.8 && lt < 1.9 ? 1 : 0, lunge: -fall * 0.4 } } }));
      ribbons(proj(S3.jointPos('vesper', 'handR', 0)), proj([gt.x, GH() * 0.55, gt.z]), t, k, 6);
      if (lt > 1.8 && lt < 3) VFX.sparks(lt - 1.8, { ...(([x, y]) => ({ x, y }))(proj([gt.x, GH() * 0.5, gt.z])), n: 70, spread: 3, speed: 1100, color: '#e8f4ff' });
      ash(t); api.postFor();
    },
    galeBind(lt, d, t, api) {
      const m = api.marks(), vs = m.vesper, tk = m.takuto, k = ease.out(clamp((lt - 0.3) / 1.2)), fade = 1 - inv(1.5, 4.5, lt);
      const cam = { pos: [tk.x + 2.4, 1.2, tk.z + 2.6], look: [tk.x, 1.2, tk.z], fov: 36 };
      api.render(t, cam, over(api, t, { takuto: { pose: { ...P().windup, weapon: 2.0, crouch: 0.1 }, o: { axeGlow: fade, expr: { angry: 0.9 * fade } } }, vesper: { pose: { uaR: [2.0, 0.6], elR: 0.2, ry: yaw(vs, tk) } } }));
      ribbons(proj(S3.jointPos('vesper', 'handR', 0)), proj([tk.x, 1.1, tk.z]), t, k, 6, k);
      const [x, y] = proj([tk.x, 1.1, tk.z]); VFX.aura(t, { x, y, w: 260, h: 380, n: 40, a: 0.6 * fade, color: '#ff3020' });
      crimson(fade); api.postFor();
    },
    armorCrack(lt, d, t, api) {
      const gt = api.marks()[RG], h = GH(), cam = jolt({ pos: [gt.x + 1.4, h * 0.55, gt.z + 4.2], look: [gt.x, h * 0.58, gt.z], fov: 34 }, t, lt < 0.5 ? 0.1 : 0.01);
      api.render(t, cam, over(api, t, { [RG]: { o: { shake: lt < 1.2 ? 0.8 : 0.2, flash: lt < 0.1 ? 1 : 0 } } }));
      const [cx, cy] = proj([gt.x, h * 0.58, gt.z]), c = GFX.ctx, k = ease.out(clamp(lt / 1.4));
      c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2 + hash(i, 2), L = (60 + hash(i, 3) * 130) * k; let x = cx, y = cy; c.strokeStyle = 'rgba(255,170,60,0.95)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y);
        for (let j = 1; j <= 4; j++) { x = cx + Math.cos(a + (hash(i, j) - 0.5) * 0.6) * L * j / 4; y = cy + Math.sin(a + (hash(i, j + 5) - 0.5) * 0.6) * L * j / 4; c.lineTo(x, y); } c.stroke(); }
      c.restore(); GFX.radial(cx, cy, 120 + 40 * Math.sin(t * 6), 'rgba(255,140,40,0.5)', 'rgba(255,60,0,0)', 1, 'lighter');
      if (lt < 1.4) VFX.sparks(lt, { x: cx, y: cy, n: 60, spread: 3, speed: 800, color: '#ffb060' });
      ash(t); api.postFor();
    },
    moreGiants(lt, d, t, api) {
      const tk = api.marks().takuto, gt = api.marks()[RG], k = ease.out(clamp(lt / 3)), cam = { pos: [tk.x - 0.6, 1.0, tk.z + 3.4], look: [gt.x, 2.0, gt.z], fov: 50 };
      api.render(t, cam, over(api, t, { takuto: { pose: { ...P().ready, ry: yaw(tk, gt) }, o: { axeGlow: 0.3 + 0.2 * Math.sin(t * 3) } } }), null, () => [[180, 520, 230, 0], [1110, 510, 250, 1], [330, 470, 150, 2], [960, 460, 170, 3], [640, 430, 110, 4]].forEach(([x, y, h, i]) => giantSil(x, y, h * (0.8 + 0.2 * k), inv(i * 0.6, i * 0.6 + 0.8, lt), lt, i)));
      ash(t); api.postFor();
    },
    grabRin(lt, d, t, api) {
      const m = api.marks(), rn = m.rin, gt = m[RG], tk = m.takuto, grab = 1.4, up = ease.out(clamp((lt - grab) / 1.2));
      const hand = { x: lerp(gt.x, rn.x, 0.4), z: lerp(gt.z, rn.z, 0.4) };
      const rp = lt < grab ? { ...P().ready, x: rn.x, z: rn.z, ry: yaw(rn, gt) } : { ...P().hit, x: lerp(rn.x, hand.x, up), z: lerp(rn.z, hand.z, up), y: up * 2.4, pitch: 0.3, ry: yaw(rn, tk) };
      const cam = jolt({ pos: [tk.x + 1.2, 0.6, tk.z + 2.6], look: [lerp(rn.x, gt.x, 0.4), 2.2, lerp(rn.z, gt.z, 0.4)], fov: 46 }, t, lt > grab && lt < grab + 0.4 ? 0.12 : 0.01);
      api.render(t, cam, over(api, t, { rin: { pose: rp, o: { expr: lt > grab ? { Surprised: 0.7 } : { angry: 0.6 } } }, [RG]: { pose: { x: lerp(gt.x, hand.x, Math.max(0, 1 - Math.abs(lt - grab) / 0.8) * 0.5), z: lerp(gt.z, hand.z, Math.max(0, 1 - Math.abs(lt - grab) / 0.8) * 0.5) }, o: { lunge: Math.max(0, 1 - Math.abs(lt - grab) / 0.6) } }, takuto: { pose: lt > 4.2 ? { ...S3.run(t * 15, 1.0), x: tk.x, z: tk.z, ry: yaw(tk, rn) } : { ...P().ready, ry: yaw(tk, gt) }, o: { expr: { angry: 0.8 } } } }));
      if (lt > grab - 0.1 && lt < grab + 1.2) { const [x, y] = proj(S3.jointPos('rin', 'handL', 0)); VFX.sparks(lt - grab + 0.1, { x, y, n: 60, spread: 3, speed: 700, color: '#ff4a5a' }); }
      ash(t); api.postFor();
    },
    akuroEye(lt, d, t, api) {
      const cut = 2.4;
      if (lt < cut) { const tk = api.marks().takuto, k = lt / cut;
        api.render(t, jolt({ pos: [tk.x + 0.25, 1.62, tk.z + lerp(0.9, 0.62, k)], look: [tk.x, 1.6, tk.z], fov: 26 }, t, 0.005 + k * 0.01), over(api, t, { takuto: { o: { axeGlow: k, expr: { angry: 0.9 } } } }));
        S3.eyePos('takuto').forEach(e => { const [x, y] = proj(e); GFX.radial(x, y, 14 + k * 20, 'rgba(255,40,30,' + (0.5 + k * 0.5).toFixed(2) + ')', 'rgba(255,0,0,0)', 1, 'lighter'); });
        crimson(k); if (GFX.twos(t, 8) % 4 === 0) GFX.fill('#ff0000', 0.06, 'lighter'); api.postFor(); return; }
      const l2 = lt - cut, open = ease.out(clamp((l2 - 1.0) / 1.2)); GFX.fill('#0a0002');
      RIG.cover('akuro', 0, 0, 1280, 720, 0.52, 0.36, lerp(1.1, 1.35, ease.io(clamp(l2 / (d - cut)))), { t, wind: 2 }, { a: 0.55 * inv(0, 0.8, l2) });
      GFX.fill('#ff0010', 0.25, 'multiply'); eye(640, 360, 330, open, t);
      if (l2 > 1 && l2 < 1.15) GFX.fill('#fff', 0.6); GFX.motes(t, { n: 80, vy: -90, color: '#ff4a3a', size: 2.6, seed: 3, a: 0.8 });
      POST.set({ bloom: 1.1, thr: 0.45, sat: 1.2, vig: 0.8, ca: 0.01 });
    },
    frenzy(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, gt = m[RG], hits = [0.6, 1.5, 2.3, 3.0, 3.6, 4.2, 4.7, 5.6], hi = hits.findIndex((h, i) => lt >= h && lt < (hits[i + 1] ?? d));
      const h0 = hits[Math.max(0, hi)], ph = lt - h0, H1 = { x: lerp(tk.x, gt.x, 0.55), z: lerp(tk.z, gt.z, 0.55) }, fall = ease.in(clamp((lt - 6.2) / 1.8));
      const pose = ph < 0.12 ? { ...P().windup, weapon: 2.0 } : { ...P().chop, weapon: 1.7 }, side = hi % 2 ? 1 : -1;
      const angles = [[2.6, 1.0, 2.2], [-2.8, 1.4, 1.8], [0.6, 0.5, 3.4], [-1.4, 2.2, 2.6]], [ax, ay, az] = angles[Math.max(0, hi) % 4];
      const cam = jolt({ pos: [H1.x + ax, ay, H1.z + az], look: [lerp(H1.x, gt.x, 0.5), 1.6, lerp(H1.z, gt.z, 0.5)], fov: 40 }, t, ph < 0.25 ? 0.25 : 0.03);
      api.render(t, cam, over(api, t, { takuto: { pose: { ...pose, x: H1.x + side * 0.4, z: H1.z, y: hi % 3 === 2 ? 0.6 : 0, ry: yaw(H1, gt) + side * 0.4 }, o: { axeGlow: 1, expr: { angry: 1 } } }, [RG]: { o: { flash: ph < 0.08 ? 1 : 0, shake: 1 - fall, tilt: fall * 0.6 + side * 0.04, alpha: 1 - fall, tint: '#ff9a8a' } } }));
      if (ph < 0.6 && lt < 6.2) { const [x, y] = proj([gt.x, GH() * (0.35 + 0.08 * (hi % 4)), gt.z]); VFX.slash(ph, { x, y, r: 380, a0: side > 0 ? -2.4 : 0.8, a1: side > 0 ? 0.9 : -2.2, dur: 0.12, hold: 0.3, w: 110, flat: 0.7, rot: side * 0.3, color: '#ff2a2a' }); VFX.sparks(ph, { x, y, n: 50, spread: 3, speed: 1300, color: '#ff6a4a' }); }
      if (lt > 6.2) { const [x, y] = proj([gt.x, GH() * 0.5, gt.z]); VFX.debris(lt - 6.2, { x, y, n: 70, speed: 1000, size: 16, seed: 41 }); }
      const [x, y] = proj([H1.x, 1.0, H1.z]); VFX.aura(t, { x, y, w: 320, h: 460, n: 60, a: 0.9, color: '#ff2a1a' });
      crimson(1); if (ph < 0.05) GFX.impact('inv'); ash(t, 1);
    },
    hurtRin(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, rn = m.rin, swing = 1.0, fly = ease.out(clamp((lt - swing - 0.1) / 0.9));
      const away = { x: rn.x + (rn.x - tk.x) * 0.6, z: rn.z + (rn.z - tk.z) * 0.6 };
      const rp = lt < swing ? { ...P().ready, x: rn.x, z: rn.z, ry: yaw(rn, tk) } : { ...P().hit, x: lerp(rn.x, away.x, fly), z: lerp(rn.z, away.z, fly), y: Math.sin(fly * PI) * 1.1, pitch: fly * 1.2, ry: yaw(rn, tk) };
      const cam = jolt(lt < 3.6 ? { pos: [lerp(tk.x, rn.x, 0.5) + 3.4, 1.0, lerp(tk.z, rn.z, 0.5) + 2.2], look: [lerp(tk.x, rn.x, 0.5), 1.0, lerp(tk.z, rn.z, 0.5)], fov: 44 } : { pos: [away.x + 1.4, 0.4, away.z + 1.6], look: [away.x, 0.3, away.z], fov: 32 }, t, lt > swing && lt < swing + 0.5 ? 0.25 : 0.02);
      api.render(t, cam, over(api, t, { takuto: { pose: { ...(lt < swing ? P().windup : P().chop), weapon: lt < swing ? 2.0 : 1.7, ry: yaw(tk, rn) + 0.5 }, o: { axeGlow: 1, expr: { angry: 1 } } }, rin: { pose: lt > 3.6 ? { ...P().hit, x: away.x, z: away.z, pitch: 1.4, y: 0 } : rp, o: { expr: { Surprised: 0.8 } } } }).filter(c => c[0] !== RG));
      if (lt > swing) { const [x, y] = proj([tk.x, 1.0, tk.z]); VFX.ring(lt - swing, { x, y, r1: 1400, dur: 0.7, flat: 0.8, color: '#ff4a3a' }); if (lt < swing + 0.07) GFX.fill('#fff', 0.7); }
      crimson(1 - inv(3.6, d, lt) * 0.6); ash(t);
    },
    rinDown(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, rn = m.rin, away = { x: rn.x + (rn.x - tk.x) * 0.6, z: rn.z + (rn.z - tk.z) * 0.6 }, k = ease.io(clamp(lt / d));
      const cam = { pos: [lerp(tk.x, away.x, 0.25) + 0.4, lerp(1.5, 1.0, k), lerp(tk.z, away.z, 0.25) + 0.6], look: [away.x, 0.3, away.z], fov: lerp(36, 28, k) };
      api.render(t, cam, over(api, t, { rin: { pose: { ...P().hit, x: away.x, z: away.z, pitch: 1.4, y: 0, ry: yaw(away, tk) }, o: { expr: { relaxed: 0.8 } } }, takuto: { pose: { crouch: 0.35 * clamp((lt - 4) / 1.2), uaR: [0.3, 0.2], elR: 0.4, weapon: 0, ry: yaw(tk, away) }, o: { expr: { sad: 0.8 } } } }).filter(c => c[0] !== RG));
      POST.set({ sat: 0.75, vig: 0.7, bloom: 0.3, thr: 0.8 }); ash(t, 0.5);
    },
    akuroTalk(lt, d, t, api) {
      const tk = api.marks().takuto, a = -0.6 + lt / d * 1.2;
      api.render(t, { pos: [tk.x + Math.sin(a) * 3.2, 1.3, tk.z + Math.cos(a) * 3.2], look: [tk.x, 1.25, tk.z], fov: 36 }, api.castList(t));
      RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, lerp(1.0, 1.15, lt / d), { t, wind: 1.4 + VOICE.amp('AKURO', t) * 2 }, { a: 0.42 * inv(0, 1.5, lt), comp: 'screen' });
      GFX.motes(t, { n: 70, vy: -70, color: '#ff4a3a', size: 2.4, seed: 8, a: 0.7 }); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.15, vig: 0.7 });
    },
    nextTitle(lt, d, t) {
      const a = inv(0, 0.8, lt); GFX.fill('#050406');
      GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt('第七話', 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      GFX.txt('羽と灰', 640, 430, { font: '400 100px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 14, a }); GFX.txt('FEATHERS AND ASH', 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
      GFX.fill('#000', inv(d - 1.2, d, lt));
    },
  };
})();
const EP06 = DIRECTOR.episode(EP06_SCRIPT, EP06_CUSTOM);
