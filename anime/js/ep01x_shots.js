/* RUINBREAKER — Episode 1 full-length cut: hand-directed moments for the new scenes (the cat behind the vending
   machine, the first conversation with Akuro, Sieg reading the axe, Sieg counting under the sky) and the build. */
'use strict';

const EP01X_CUSTOM = (() => {
  const PI = Math.PI, { clamp, lerp, inv, ease, hash } = GFX, P = () => S3.POSES, K = KIT;
  const rain = (t, a = 0.5) => K.rain(t, a);
  return {
    catLook(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hr = m.haruki, cam = { pos: [lerp(tk.x, hr.x, 0.5) + 0.4, 0.9, lerp(tk.z, hr.z, 0.5) + 1.6], look: [lerp(tk.x, hr.x, 0.5) - 0.6, 0.35, lerp(tk.z, hr.z, 0.5) - 1.6], fov: 34 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { crouch: 0.3, headX: 0.35, ry: PI }, o: { expr: { happy: 0.4 } } }, takuto: { pose: { headX: 0.3, ry: PI } } }));
      rain(t, 0.35); api.postFor();
    },
    catFeed(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, hr = m.haruki, k = ease.io(clamp(lt / d)), cam = { pos: [hr.x + 1.0, lerp(1.0, 0.7, k), hr.z + 1.4], look: [hr.x - 0.4, 0.3, hr.z - 1.0], fov: 32 };
      api.render(t, cam, K.over(api, t, { haruki: { pose: { crouch: 0.5, uaR: [1.0, 0.2], elR: 0.5, headX: 0.4, ry: PI }, o: { expr: { happy: 0.7 } } }, takuto: { pose: { crouch: 0.35, headX: 0.3, ry: PI }, o: { expr: { happy: 0.2 } } } }));
      rain(t, 0.3); api.postFor();
    },
    voidFirst(lt, d, t, api) {
      const tk = api.marks().takuto, a = -0.6 + lt / d * 1.2;
      api.render(t, { pos: [tk.x + Math.sin(a) * 3.2, 1.3, tk.z + Math.cos(a) * 3.2], look: [tk.x, 1.25, tk.z], fov: 36 }, api.castList(t));
      RIG.cover('akuro', 0, 0, 1280, 720, 0.5, 0.36, lerp(1.0, 1.15, lt / d), { t, wind: 1.4 + VOICE.amp('AKURO', t) * 2 }, { a: 0.45 * inv(0.6, 2.4, lt), comp: 'screen' });
      GFX.motes(t, { n: 70, vy: -70, color: '#ff4a3a', size: 2.4, seed: 8, a: 0.7 }); POST.set({ bloom: 0.9, thr: 0.5, sat: 1.15, vig: 0.7 });
    },
    siegReads(lt, d, t, api) {
      const m = api.marks(), tk = m.takuto, sg = m.sieg, cam = { pos: [lerp(tk.x, sg.x, 0.5) + 0.7, 1.2, lerp(tk.z, sg.z, 0.5) + 1.0], look: [tk.x + 0.2, 1.0, tk.z - 0.2], fov: 28 };
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
