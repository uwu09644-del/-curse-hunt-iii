/* RUINBREAKER — Episode 4: hand-directed moments (the forge, the harness tests, the sabotage, the man in the smoke)
   and the build. */
'use strict';

const EP04_CUSTOM = (() => {
  const PI = Math.PI, H = PI / 2, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES;
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  const proj = p => S3.project(p[0], p[1], p[2]);
  const over = (api, t, map) => api.castList(t).map(c => map[c[0]] ? [c[0], { ...c[1], ...map[c[0]].pose }, { ...c[2], ...(map[c[0]].o || {}) }] : c);
  function chains(t, glow, snap = 0) { // the harness: glowing links wound along the haft
    const g = GFX.ctx; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const d0 = -0.05 + i * 0.11, p = proj(S3.weaponTip('takuto', d0)), off = snap > 0 ? [Math.cos(i * 2.3) * snap * 160, Math.sin(i * 1.7) * snap * 120 + snap * snap * 200] : [0, 0];
      g.strokeStyle = 'rgba(255,200,90,' + (0.9 * glow * (1 - snap)).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(p[0] + off[0], p[1] + off[1], 7, 4, i * 0.6 + t * 2, 0, 7); g.stroke();
      GFX.radial(p[0] + off[0], p[1] + off[1], 16, 'rgba(255,180,80,' + (0.5 * glow * (1 - snap)).toFixed(2) + ')', 'rgba(255,120,40,0)', 1, 'lighter'); }
    g.restore();
  }
  return {
    forgeWork(lt, d, t, api) {
      const hits = [1.0, 2.4, 3.8, 5.2, 6.6], hit = hits.find(h => lt > h && lt < h + 0.25);
      const sw = hits.reduce((m, h) => Math.max(m, Math.sin(clamp((lt - h + 0.5) / 0.5) * PI / 2) * (lt < h ? 1 : 0)), 0);
      api.render(t, jolt({ pos: [1.4, 1.2, 1.6], look: [0.1, 0.9, -0.8], fov: 32 }, t, hit ? 0.02 : 0), over(api, t, { gideon: { pose: { uaR: [2.2 - sw * 1.4, 0.2], elR: 0.4, lean: 0.25, headX: 0.25 } } }));
      if (hit != null) { const [x, y] = proj([0.35, 0.8, -0.5]); VFX.sparks(lt - hit, { x, y, n: 40, spread: 2.2, speed: 700, color: '#ffb060' }); }
      GFX.radial(640, 520, 500, 'rgba(255,140,60,0.16)', 'rgba(0,0,0,0)', 1, 'lighter'); api.postFor();
    },
    harnessTest(lt, d, t, api) {
      const hit = 3.6, pose = S3.seq(lt, [[0, P().ready], [hit - 0.4, P().windup, 'out'], [hit, P().chop, 'in'], [hit + 0.8, P().ready]]);
      const lock = clamp((lt - (hit - 0.5)) / 0.3);
      api.render(t, jolt({ pos: [5.4, 1.3, 0.6], look: [0, 1.25, 0.1], fov: 32 }, t, lt > hit && lt < hit + 0.3 ? 0.12 : 0), over(api, t, { sieg: { pose: { ...pose, x: 0, z: -0.9, ry: 0 } }, takuto: { pose: { ...(lock > 0 ? P().block : P().ready), weapon: lock > 0 ? 1.2 : 0, ry: PI }, o: { axeGlow: lock * 0.4 } } }));
      if (lock > 0) chains(t, lock * (1 - inv(hit + 1.5, hit + 2.5, lt)));
      if (lt > hit && lt < hit + 0.8) { const [x, y] = proj(S3.weaponTip('takuto', 0.5)); VFX.sparks(lt - hit, { x, y, n: 70, spread: 2.6, speed: 1000, color: '#ffd28a' }); if (lt < hit + 0.08) GFX.fill('#fff', 0.6); }
      api.postFor();
    },
    harnessFail(lt, d, t, api) {
      const hit = 2.2, pose = S3.seq(lt, [[0, P().ready], [hit - 0.4, P().windup, 'out'], [hit, P().chop, 'in'], [hit + 0.8, P().ready]]), bonk = lt > hit;
      api.render(t, jolt({ pos: [5.4, 1.3, 0.6], look: [0, 1.25, 0.1], fov: 32 }, t, bonk && lt < hit + 0.3 ? 0.1 : 0), over(api, t, { sieg: { pose: { ...pose, x: 0, z: -0.9, ry: 0 } }, takuto: { pose: bonk ? { ...P().hit, y: Math.max(0, Math.sin(clamp((lt - hit) / 0.6) * PI) * 0.3), pitch: clamp((lt - hit) / 0.6) * 0.3 } : { ...P().block, weapon: 1.2 }, o: { expr: bonk ? { Surprised: 0.7 } : { angry: 0.4 } } } }));
      if (lt > hit - 0.3 && lt < hit + 1.2) chains(t, 1, clamp((lt - hit + 0.3) / 0.6));
      api.postFor();
    },
    explosion(lt, d, t, api) {
      const b = 1.2, up = ease.io(clamp((lt - b - 0.4) / 0.8));
      const cast = api.castList(t).map(c => [c[0], up > 0 ? { ...c[1], ...S3.blend(c[1], { ...P().ready, x: c[1].x, z: c[1].z, ry: c[1].ry }, up), x: c[1].x, z: c[1].z, ry: c[1].ry + up * 0.8 } : c[1], c[2]]);
      api.render(t, jolt({ pos: [1.4, 1.1, -27.4], look: [0.5, 0.9, -33], fov: 34 }, t, lt > b && lt < b + 0.8 ? 0.08 * (1 - (lt - b) / 0.8) : 0), cast);
      if (lt > b) { GFX.radial(1100, 300, 700, 'rgba(255,140,60,' + (0.55 * Math.exp(-(lt - b) * 1.2)).toFixed(2) + ')', 'rgba(255,60,20,0)', 1, 'lighter'); if (lt < b + 0.1) GFX.fill('#ffb070', 0.4); }
      api.postFor();
    },
    forgeRift(lt, d, t, api) {
      const open = ease.out(clamp(lt / 1.4)), rise = ease.out(clamp((lt - 2.4) / 3.2));
      const cam = jolt({ pos: [2.2, 1.6, 3.4], look: [0.3, 0.6, -3.0], fov: 36 }, t, 0.01 + (lt > 2.4 && lt < 5.6 ? 0.03 : 0));
      api.render(t, cam, over(api, t, { shield: { pose: { y: lerp(-2.8, 0, rise), headX: lerp(0.4, 0, rise) } } }));
      const c = GFX.ctx, pts = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * PI * 2, r = (0.9 + (hash(i, 3) - 0.5) * 0.6) * open * 1.6; pts.push(proj([0.3 + Math.cos(a) * r, 0.02, -3.0 + Math.sin(a) * r * 0.6])); }
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,40,40,0.35)'; c.strokeStyle = 'rgba(255,120,100,0.9)'; c.lineWidth = 3; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.stroke(); c.restore();
      api.postFor();
    },
    harnessSave(lt, d, t, api) {
      const m = api.marks(), hit = 2.0, slam = ease.in(clamp((lt - 0.8) / 1.2)), lock = clamp((lt - 1.5) / 0.3);
      const tk = { x: lerp(m.takuto.x, 0.35, ease.out(clamp(lt / 1.2))), z: lerp(m.takuto.z, 1.4, ease.out(clamp(lt / 1.2))), ry: PI, ...(lt < 1.2 ? S3.run(t * 15, 1) : lock > 0 ? P().block : P().ready), weapon: lock > 0 ? 1.2 : 0 };
      const cam = jolt(lt < 2.6 ? { pos: [3.4, 1.0, 3.0], look: [0.3, 1.4, 0.4], fov: 36 } : { pos: [0.5, 1.5, 3.2], look: [0.35, 1.5, 1.4], fov: 28 }, t, lt > hit && lt < hit + 0.5 ? 0.18 * (1 - (lt - hit) / 0.5) : 0);
      api.render(t, cam, over(api, t, { takuto: { pose: tk, o: { axeGlow: 0.3, expr: { angry: 0.7 } } }, shield: { pose: { ...S3.blend(P().sbRaise, P().sbSlam, slam), x: 0.3, z: lerp(-3.4, -1.0, slam), ry: 0 } } }));
      if (lock > 0) chains(t, lock * (1 - inv(hit + 1.4, hit + 2.4, lt)), lt > hit + 1.2 ? clamp((lt - hit - 1.2) / 0.8) : 0);
      if (lt > hit && lt < hit + 0.9) { const [x, y] = proj(S3.weaponTip('takuto', 0.5)); VFX.sparks(lt - hit, { x, y, n: 90, spread: 2.8, speed: 1200, color: '#ffd28a' }); VFX.ring(lt - hit, { x, y, r1: 700, dur: 0.6, flat: 0.9 }); if (lt < hit + 0.07) GFX.fill('#fff', 0.7); }
      api.postFor();
    },
    sableInSmoke(lt, d, t, api) {
      const vis = inv(1.2, 2.4, lt) * (1 - inv(5.6, 7.0, lt)), cam = { pos: [0.2, 1.6, 2.4], look: [0.4, 1.6, -3.6], fov: 30 };
      api.render(t, cam, api.castList(t).filter(c => c[0] !== 'shield'));
      if (vis > 0) S3.frame({ env: 'forge', only: 'cast', t, cam, cast: [['sable', { x: 0.6, z: -3.6, ry: 0 }, { expr: { happy: 0.8 } }]], alpha: vis * 0.85, envOpts: { light: 'fire' } });
      const c = GFX.ctx; for (let i = 0; i < 9; i++) { const x = 300 + hash(i, 2) * 700 + Math.sin(t * 0.4 + i) * 60, y = 200 + hash(i, 3) * 380 - lt * 12; GFX.radial(x, y, 160 + hash(i, 4) * 140, 'rgba(40,34,38,' + (0.35 + 0.2 * hash(i, 5)).toFixed(2) + ')', 'rgba(40,34,38,0)', 1); }
      if (vis > 0.3) { const e = proj(S3.jointPos('sable', 'head', 0.16)); GFX.radial(e[0], e[1], 30, 'rgba(230,240,255,' + (0.9 * vis).toFixed(2) + ')', 'rgba(150,170,255,0)', 1, 'lighter'); }
      api.postFor();
    },
    tofuScan(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, tf = m.tofu, cam = { pos: [tk.x + 1.2, 1.35, tk.z + 1.9], look: [lerp(tk.x, tf.x, 0.5), 1.1, lerp(tk.z, tf.z, 0.5)], fov: 34 };
      api.render(t, cam, over(api, t, { tofu: { pose: { y: 0.5 + Math.sin(t * 2) * 0.05 }, o: { face: lt > 0.8 && lt < 5 ? 'scan' : 'idle' } }, takuto: { pose: { ...P().ready, weapon: 1.2 }, o: { axeGlow: inv(1, 3, lt) * 0.5 } } }));
      if (lt > 1) chains(t, inv(1, 1.6, lt) * (1 - inv(d - 1, d, lt)));
      if (lt > 2.2) VFX.holo(lt - 2.2, d - 2.4, { x: 900, y: 230, w: 460, title: 'BRAND APPRAISAL', color: '#ff7ab6', accent: '#ffd6ea', lines: [{ t: 'Kirishima Takuto', big: true }, 'Brand: RUINBREAKER', { t: 'Rank: ERROR (smaller)', col: '#ff9ab0' }, { t: 'Signatures: 2', col: '#ffd6ea' }] });
      api.postFor();
    },
    nextTitle(lt, d, t) {
      const a = inv(0, 0.8, lt); GFX.fill('#050406');
      GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt('第五話', 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      GFX.txt('七つ首の河', 640, 430, { font: '400 100px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 14, a }); GFX.txt('SEVEN HEADS, ONE RIVER', 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
      GFX.fill('#000', inv(d - 1.2, d, lt));
    },
  };
})();
const EP04 = DIRECTOR.episode(EP04_SCRIPT, EP04_CUSTOM);
