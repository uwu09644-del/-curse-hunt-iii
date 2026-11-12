/* RUINBREAKER — Episode 3: hand-directed moments (Wick's entrance, the tremor, the next-episode card) and the build. */
'use strict';

const EP03_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX;
  const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = GFX.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
  return {
    beat(lt, d, t, api) { api.render(t, { pos: [0.4, 0.9, 3.6], look: [0, 0.6, 0.4], fov: 34 }, api.castList(t)); api.postFor(); },
    wickAppears(lt, d, t, api) {
      const pop = ease.out(clamp((lt - 2.2) / 0.5)), m = api.marks();
      const cast = api.castList(t).filter(c => c[0] !== 'wick').map(c => c[0] === 'takuto' && lt > 4.2 ? [c[0], { ...c[1], ...S3.POSES.hit, x: m.takuto.x - 0.3 * clamp((lt - 4.2) / 0.3) }, c[2]] : c[0] === 'rin' && lt > 5.2 ? [c[0], { ...c[1], ...S3.POSES.ready }, { ...c[2], weapon: true }] : c);
      cast.push(['wick', { x: lerp(-2.6, 0.2, pop), z: lerp(-1.2, -1.6, pop), y: Math.sin(pop * PI) * 0.6, ry: 0.3, ...(pop < 1 ? S3.POSES.leap : { uaL: [2.4, 0.4], elL: 0.6, uaR: [2.4, 0.4], elR: 0.6 }) }, { expr: { happy: 0.6 } }]);
      const cam = jolt({ pos: [0.2, 1.3, 4.6], look: [0, 1.2, 0], fov: 32 }, t, lt > 4.2 && lt < 4.6 ? 0.1 : 0);
      api.render(t, cam, cast); api.postFor();
    },
    tremor(lt, d, t, api) {
      const k = clamp(lt / d), up = ease.io(clamp((lt - 2.4) / 1.4));
      const cast = api.castList(t).map(c => [c[0], { ...c[1], ...(up > 0 ? S3.blend(c[1], { ...S3.POSES.ready, x: c[1].x, z: c[1].z, ry: c[1].ry }, up) : {}), x: c[1].x, z: c[1].z, ry: c[1].ry }, c[2]]);
      api.render(t, jolt({ pos: [0.3, 1.2, 4.2], look: [0, 0.8, 0.4], fov: 34 }, t, 0.02 + k * 0.08), cast);
      GFX.motes(t, { n: 60, vy: 40, color: '#b8a890', size: 2, glow: false, seed: 9, a: k }); api.postFor();
    },
    nextTitle(lt, d, t) {
      const a = inv(0, 0.8, lt); GFX.fill('#050406');
      GFX.txt('NEXT EPISODE', 640, 250, { font: '700 15px ' + GFX.FONT.sub, fill: '#e8343c', ls: 10, a }); GFX.txt('第四話', 640, 300, { font: '400 26px ' + GFX.FONT.jp, fill: '#bdb6b0', ls: 8, a });
      GFX.txt('歯車の心臓', 640, 430, { font: '400 100px ' + GFX.FONT.jp, fill: '#f4efe9', ls: 14, a }); GFX.txt('COGWHEEL HEART', 640, 510, { font: '800 36px ' + GFX.FONT.disp, fill: '#f4efe9', ls: 12, a });
      GFX.fill('#000', inv(d - 1.2, d, lt));
    },
  };
})();
const EP03 = DIRECTOR.episode(EP03_SCRIPT, EP03_CUSTOM);
