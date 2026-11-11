/* RUINBREAKER — Episode 1 full-length cut: hand-directed moments for the new scenes (the cat behind the vending
   machine, the first conversation with Akuro, Sieg reading the axe, Sieg counting under the sky) and the build. */
'use strict';

const EP01X_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT;
  const rain = (t, a = 0.5) => K.rain(t, a);
  return {
    catLook(lt, d, t, api) { // the same spot by the tracks where Episode 1 finds the cat
      const m = api.marks(), cam = { pos: [6.6, 1.05, -0.4], look: [4.9, 0.55, -2.7], fov: 36 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { ...P().kneel, headX: 0.35, ry: 1.2 }, o: { expr: { happy: 0.4 } } }, takuto: { pose: { headX: 0.3, ry: 1.9 } } }));
      rain(t, 0.35); api.postFor();
    },
    catFeed(lt, d, t, api) {
      const k = ease.io(clamp(lt / d)), cam = { pos: [6.4, lerp(1.0, 0.8, k), -0.6], look: [5.0, 0.45, -2.8], fov: lerp(34, 30, k) };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { ...P().kneel, uaR: [1.0, 0.2], elR: 0.5, headX: 0.4, ry: 1.2 }, o: { expr: { happy: 0.7 } } }, takuto: { pose: { ...P().kneel, headX: 0.35, ry: 1.9 }, o: { expr: { happy: 0.2 } } } }));
      rain(t, 0.3); api.postFor();
    },
    voidFirst(lt, d, t, api) {
      const tk = api.marks().takuto, a = -0.6 + lt / d * 1.2;
      api.render(t, { pos: [tk.x + Math.sin(a) * 3.2, 1.3, tk.z + Math.cos(a) * 3.2], look: [tk.x, 1.25, tk.z], fov: 36 }, api.castList(t));
      RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, lerp(1.0, 1.15, lt / d), { t, wind: 1.4 + VOICE.amp('AKURO', t) * 2 }, { a: 0.45 * inv(0.6, 2.4, lt), comp: 'screen' });
      GFX.motes(t, { n: 70, vy: -70, color: '#ff4a3a', size: 2.4, seed: 8, a: 0.7 }); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.15, vig: 0.7 });
    },
    siegReads(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, sg = m.sieg, mx = lerp(tk.x, sg.x, 0.5), mz = lerp(tk.z, sg.z, 0.5), cam = { pos: [mx + 2.6, 1.35, mz + 1.6], look: [mx, 1.15, mz], fov: 34 };
      api.render(t, cam, K.over(api, t, { takuto: { pose: { ...P().ready, weapon: 1.2, ry: K.yaw(tk, sg) }, o: { axeGlow: 0.25 + 0.15 * Math.sin(t * 2) } }, sieg: { pose: { lean: 0.2, headX: 0.3, ry: K.yaw(sg, tk) }, o: { expr: { sad: 0.4 } } } }));
      const [x, y] = K.proj(S3.weaponTip('takuto', 0.6)); GFX.radial(x, y, 120, 'rgba(255,60,40,0.25)', 'rgba(0,0,0,0)', 1, 'lighter'); api.postFor();
    },
    siegSky(lt, d, t, api) {
      const sg = api.marks().sieg, k = ease.io(clamp(lt / d)), cam = { pos: [sg.x + 0.8, 0.9, sg.z + 2.2], look: [sg.x - 0.4, lerp(1.6, 3.4, k), sg.z - 4], fov: 40 };
      api.render(t, cam, K.over(api, t, { sieg: { pose: { headX: -0.35, ry: PI + 0.3 }, o: { expr: { sad: 0.4 } } } }));
      GFX.motes(t * 0.2, { n: 120, vy: 0, color: '#ffffff', size: 1.4, glow: true, seed: 44, a: 0.7, y0: 0, y1: 300 });
      if (lt > 5) K.staticArcs(1000, 120, 120, 0.3 * Math.max(0, Math.sin(t * 3)), t, 3); api.postFor();
    },
  };
})();
const EP01X = DIRECTOR.episode(EP01X_SCRIPT, EP01X_CUSTOM);
