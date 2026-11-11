/* RUINBREAKER — rig definitions (original-art pixel coordinates) and pose helpers.
   Bones: [name, parent, pivot, regions]. Regions are soft shapes:
   ['e', cx, cy, rx, ry, feather] ellipse, ['p', [[x,y]...], feather] polygon, ['r', x0, y0, x1, y1, feather] rect.
   Earlier siblings win where regions overlap. Sway fields add travelling waves to hair and cloth. */
'use strict';

const ALL = f => [['r', -400, -400, 2400, 2400, f || 1]];
RIG.define({
  takuto: {
    grid: 38, skin: '#f8e9dc', lash: '#3a2a2c', root: [368, 785],
    bones: [
      ['chest', 'root', [380, 720], ALL()],
      ['head', 'chest', [400, 312], [['e', 405, 185, 120, 124, 34]]],
      ['armR', 'chest', [255, 372], [['p', [[-10, 385], [95, 352], [235, 318], [330, 326], [345, 395], [265, 470], [215, 565], [80, 575], [-10, 525]], 26],
        ['p', [[476, 252], [540, 150], [610, 40], [650, -20], [770, -20], [770, 345], [640, 335], [565, 262], [505, 275]], 16]]],
      ['armL', 'chest', [572, 420], [['p', [[515, 392], [645, 398], [725, 470], [735, 620], [695, 770], [560, 770], [520, 610], [498, 470]], 30]]],
    ],
    sway: [
      { id: 'hair', s: [['e', 405, 160, 132, 118, 22]], sub: [['e', 412, 236, 64, 50, 18]], a: [405, 195], fall: 110, amp: 3.2, freq: 0.85, dir: [1, -0.15], ph: 0.03 },
      { id: 'ribbon', s: [['e', 155, 668, 48, 108, 12]], a: [168, 555], fall: 180, amp: 7, freq: 1.15, dir: [1, 0.1] },
      { id: 'ribbon2', s: [['e', 656, 640, 38, 152, 12]], a: [650, 488], fall: 280, amp: 6, freq: 1.0, dir: [1, 0], seed: 1.3 },
      { id: 'hem', s: [['r', 190, 690, 720, 800, 24]], a: [450, 690], fall: 90, amp: 2.2, freq: 1.3, dir: [1, 0.2], seed: 0.7 },
    ],
    eyes: [[345, 207, 389, 238], [425, 205, 470, 236]],
    face: [408, 228, 98, 92, 9],
  },
  nemu: {
    grid: 30, skin: '#e9b892', root: [460, 920],
    bones: [
      ['body', 'root', [520, 720], ALL()],
      ['chest', 'body', [520, 470], [['r', 360, -50, 720, 470, 50]]],
      ['armUp', 'chest', [452, 72], [['p', [[420, 12], [525, 8], [612, 32], [678, 42], [684, 118], [600, 118], [540, 82], [470, 80], [424, 80]], 18]]],
      ['head', 'chest', [505, 262], [['e', 490, 142, 118, 118, 30]]],
      ['armM', 'chest', [625, 300], [['p', [[575, 230], [668, 248], [672, 348], [598, 352], [548, 300]], 20]]],
      ['jaw', 'head', [515, 196], [['e', 522, 220, 32, 24, 10]]],
      ['earL', 'head', [408, 130], [['e', 396, 103, 26, 32, 10]]],
      ['earR', 'head', [528, 66], [['e', 530, 40, 22, 30, 10]]],
      ['tail', 'body', [402, 522], [['e', 322, 592, 88, 98, 18]]],
      ['knee', 'body', [575, 520], [['p', [[548, 470], [655, 480], [665, 790], [515, 805], [520, 610]], 34]]],
    ],
    sway: [
      { id: 'tail', s: [['e', 322, 592, 92, 102, 14]], a: [402, 522], fall: 140, amp: 8, freq: 0.8, dir: [0.6, 0.8], ph: 0.02 },
      { id: 'hair', s: [['e', 490, 130, 125, 105, 20]], a: [495, 150], fall: 110, amp: 2.6, freq: 0.9, dir: [1, 0] },
      { id: 'shirt', s: [['r', 400, 300, 670, 372, 20]], a: [530, 300], fall: 70, amp: 1.6, freq: 1.4, dir: [1, 0.3] },
    ],
    face: [512, 178, 72, 72, 10],
  },
  sieg: {
    grid: 34, skin: '#d3a08a', lash: '#3a1f1f', mouthCol: '#4a1a1c', root: [370, 899],
    bones: [
      ['chest', 'root', [380, 760], ALL()],
      ['head', 'chest', [355, 320], [['e', 352, 190, 112, 132, 32]]],
      ['armL', 'chest', [232, 372], [['p', [[168, 330], [272, 350], [262, 470], [202, 580], [192, 700], [222, 722], [62, 890], [-20, 890], [-20, 780], [80, 700], [90, 600], [108, 450]], 24]]],
      ['armR', 'chest', [532, 372], [['p', [[478, 330], [612, 340], [704, 430], [704, 562], [642, 654], [558, 654], [556, 560], [498, 452]], 24]]],
      ['jaw', 'head', [352, 258], [['e', 356, 282, 40, 20, 12]]],
    ],
    sway: [
      { id: 'hair', s: [['e', 352, 160, 125, 120, 24]], sub: [['e', 360, 240, 62, 52, 16]], a: [352, 200], fall: 120, amp: 3.5, freq: 0.8, dir: [1, -0.2] },
      { id: 'coat', s: [['p', [[540, 560], [760, 520], [760, 910], [540, 910]], 30]], a: [560, 560], fall: 260, amp: 7, freq: 0.7, dir: [1, 0.15], ph: 0.012 },
      { id: 'coatL', s: [['p', [[140, 640], [290, 640], [300, 910], [130, 910]], 30]], a: [220, 640], fall: 240, amp: 4, freq: 0.75, dir: [1, 0], seed: 1 },
      { id: 'blade', s: [['p', [[540, 230], [760, 230], [760, 560], [560, 520]], 20]], a: [560, 300], fall: 200, amp: 3, freq: 0.6, dir: [0.2, 1] },
      { id: 'fur', s: [['r', 180, 200, 530, 370, 20]], a: [355, 290], fall: 150, amp: 1.5, freq: 1.1, dir: [1, 0] },
    ],
    eyes: [[368, 204, 404, 230], null],
    mouth: [338, 256, 378, 282],
    face: [360, 232, 82, 88, 8],
  },
  shield: {
    grid: 32, root: [380, 1065],
    bones: [
      ['body', 'root', [340, 640], ALL()],
      ['torso', 'body', [340, 620], [['r', -20, 40, 760, 630, 40], ['r', 420, 560, 760, 1090, 30]]],
      ['head', 'torso', [342, 262], [['e', 342, 168, 82, 94, 26]]],
      ['jaw', 'head', [342, 184], [['e', 343, 204, 28, 16, 8]]],
      ['armC', 'torso', [212, 295], [['p', [[110, 190], [262, 210], [262, 330], [192, 422], [162, 562], [152, 702], [132, 795], [36, 795], [26, 622], [58, 450], [88, 300]], 26]]],
      ['shield', 'torso', [478, 300], [['p', [[418, 198], [562, 168], [602, 298], [738, 328], [738, 1075], [428, 1075], [428, 560], [418, 382]], 10]]],
      ['legL', 'body', [262, 622], [['p', [[168, 600], [322, 600], [332, 800], [302, 1075], [138, 1075], [168, 822]], 26]]],
      ['legR', 'body', [382, 622], [['p', [[322, 600], [440, 600], [450, 1075], [322, 1075], [332, 800]], 22]]],
    ],
    sway: [
      { id: 'rags', s: [['r', 230, 760, 440, 910, 20]], a: [335, 760], fall: 140, amp: 6, freq: 0.7, dir: [1, 0] },
      { id: 'rags2', s: [['r', 540, 250, 730, 312, 14]], a: [560, 280], fall: 160, amp: 5, freq: 0.9, dir: [0, 1] },
      { id: 'hood', s: [['e', 342, 170, 110, 110, 16]], sub: [['e', 342, 160, 48, 60, 12]], a: [342, 170], fall: 110, amp: 1.6, freq: 0.6, dir: [1, 0] },
    ],
  },
  sable: {
    grid: 28, root: [380, 1006],
    bones: [
      ['chest', 'root', [380, 820], ALL()],
      ['head', 'chest', [300, 292], [['e', 290, 165, 95, 128, 28]]],
      ['hand', 'chest', [505, 390], [['p', [[478, 330], [560, 320], [715, 330], [715, 505], [622, 630], [540, 605], [468, 452]], 24]]],
    ],
    sway: [{ id: 'smoke', s: [['e', 290, 70, 95, 72, 20]], a: [290, 130], fall: 80, amp: 5, freq: 1.3, dir: [1, -0.3] }],
  },
  rin: { grid: 20, root: [170, 886], bones: [['chest', 'root', [170, 700], ALL()], ['head', 'chest', [170, 232], [['e', 165, 120, 86, 96, 24]]]],
    sway: [{ id: 'hair', s: [['e', 165, 110, 96, 92, 18]], a: [165, 135], fall: 90, amp: 2.6, freq: 0.9 }, { id: 'scarf', s: [['r', 90, 170, 280, 340, 20]], a: [170, 190], fall: 130, amp: 3, freq: 1.1 }] },
  rin_face: { grid: 18, root: [540, 430], bones: [['head', 'root', [540, 400], ALL()]], sway: [{ id: 'hair', s: [['e', 540, 150, 200, 160, 30]], a: [560, 230], fall: 160, amp: 3, freq: 0.8 }] },
  wick: { grid: 22, root: [470, 1300], bones: [['chest', 'root', [480, 900], ALL()], ['head', 'chest', [445, 470], [['e', 440, 340, 115, 135, 30]]]],
    sway: [{ id: 'flame', s: [['e', 440, 320, 125, 150, 20]], a: [445, 470], fall: 190, amp: 8, freq: 2.2, dir: [1, -0.4], ph: 0.05 }] },
  haruki: { grid: 22, face: [432, 150, 72, 78, 10], root: [400, 942], bones: [['chest', 'root', [400, 760], ALL()], ['head', 'chest', [430, 255], [['e', 432, 130, 98, 112, 26]]]],
    sway: [{ id: 'hair', s: [['e', 432, 110, 105, 100, 18]], a: [432, 140], fall: 100, amp: 2.4, freq: 0.85 }, { id: 'fur', s: [['r', 240, 170, 640, 400, 26]], a: [440, 260], fall: 200, amp: 2.4, freq: 1.0 }] },
  nemu_chibi: { grid: 16, noGlow: true, root: [135, 350], bones: [['head', 'root', [135, 300], ALL()]], sway: [{ id: 'hair', s: [['e', 135, 170, 110, 80, 20]], a: [135, 200], fall: 90, amp: 3, freq: 1.6 }] },
  nemu_gg: { grid: 10, noGlow: true, root: [325, 420], bones: [['b', 'root', [325, 420], ALL()]] },
  akuro: { grid: 26, pad: 0, noGlow: true, root: [368, 1306], bones: [['body', 'root', [368, 900], ALL()]],
    sway: [{ id: 'hair', s: [['e', 380, 250, 430, 330, 60]], sub: [['e', 385, 440, 95, 85, 30]], a: [385, 420], fall: 280, amp: 9, freq: 0.55, radial: true, ph: 0.012 },
      { id: 'blade', s: [['r', 40, 950, 700, 1270, 40]], a: [368, 1000], fall: 300, amp: 4, freq: 0.4, dir: [1, 0.3] }] },
  gideon: { grid: 18, pad: 0, noGlow: true, root: [368, 1100], sway: [{ id: 'all', s: [['e', 380, 520, 300, 420, 120]], a: [380, 330], fall: 500, amp: 3, freq: 0.5, dir: [1, 0.2] }] },
  valentine: { grid: 18, pad: 0, noGlow: true, root: [368, 736], sway: [{ id: 'hair', s: [['e', 330, 330, 230, 200, 80]], a: [330, 380], fall: 300, amp: 3, freq: 0.6 }] },
  lucien: { grid: 18, pad: 0, noGlow: true, root: [368, 1226], sway: [{ id: 'hair', s: [['e', 380, 230, 220, 180, 80]], a: [380, 330], fall: 220, amp: 3.5, freq: 0.6 }, { id: 'scarf', s: [['r', 420, 500, 736, 900, 60]], a: [450, 560], fall: 300, amp: 5, freq: 0.7 }] },
  vesper: { grid: 18, pad: 0, noGlow: true, root: [368, 1293], sway: [{ id: 'cloth', s: [['e', 368, 650, 330, 560, 120]], sub: [['e', 368, 330, 80, 90, 40]], a: [368, 420], fall: 500, amp: 6, freq: 0.45, radial: true }] },
});
// creature pages breathe slowly
(() => {
  const M = {};
  [['m_redgiant', [368, 520]], ['m_hydra', [368, 470]], ['m_golem', [368, 520]], ['m_morvudd', [368, 480]], ['m_plume', [368, 470]], ['m_wolf', [368, 640]], ['m_tyr', [384, 440]]].forEach(([n, c]) => {
    M[n] = { grid: 16, pad: 0, noGlow: true, root: [c[0], c[1] + 420], bones: [['body', 'root', c, ALL()]],
      sway: [{ id: 'all', s: [['e', c[0], c[1], 300, 380, 140]], a: c, fall: 420, amp: 3.2, freq: 0.45, radial: true }] };
  });
  RIG.define(M);
})();

/* ---------- poses ---------- */
const POSE = (() => {
  const S = Math.sin;
  const H = GFX.hash, sm = x => x * x * (3 - 2 * x), cl = x => Math.max(0, Math.min(1, x));
  function gaze(t, seed) { // saccades: the eyes snap to a new target every couple of seconds, the head follows more slowly
    const P = 2.3 + (seed % 3) * 0.35, u = t + seed * 3.7, k = Math.floor(u / P), f = (u - k * P);
    const tgt = i => H(i, seed + 13) < 0.22 ? [0, 0] : [(H(i, seed + 11) - 0.5) * 1.9, (H(i, seed + 12) - 0.45) * 0.8];
    const a = tgt(k - 1), b = tgt(k), e = sm(cl(f / 0.13)), h = sm(cl(f / 0.75));
    return { look: [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e], yaw: (a[0] + (b[0] - a[0]) * h) * 0.5 };
  }
  const base = (t, o, bones) => {
    const tt = o.freeze ?? t, g = gaze(tt, o.seed || 0), bias = o.lookBias || 0, k = o.lookBias != null ? 0.45 : 1;
    const look = o.look || [Math.max(-1, Math.min(1, g.look[0] * k + bias)), g.look[1] * k];
    if (bones.head) bones.head.r = (bones.head.r || 0) + look[0] * 0.018;
    return { t: tt, wind: o.wind ?? 1, blink: o.blink ?? RIG.blink(tt, o.seed || 0), open: o.open || 0, sway: o.sway, bones, look, yaw: o.yaw ?? (g.yaw * k + bias * 0.55) };
  };
  return {
    takuto(t, o = {}) {
      const tt = o.freeze ?? t, br = S(tt * 2.0) * (o.breath ?? 1), talk = o.talk || 0;
      return base(t, { seed: 1, ...o }, {
        root: { r: o.lean || 0, x: o.x || 0, y: o.y || 0, sx: o.sx ?? 1, sy: o.sy ?? 1 },
        chest: { sy: 1 + 0.010 * br, r: 0.006 * S(tt * 0.9) + (o.chestR || 0) },
        head: { r: 0.026 * S(tt * 0.7 + 1) + 0.01 * S(tt * 1.9) + (o.headR || 0) + talk * 0.02 * S(tt * 7.5), y: -1.2 * br + (o.headY || 0) - talk * 1.2, x: o.headX || 0 },
        armR: { r: 0.016 * S(tt * 2.0 + 0.5) + (o.arm || 0), x: o.armX || 0, y: o.armY || 0 },
        armL: { r: 0.01 * S(tt * 1.3) + (o.armL || 0) },
      });
    },
    nemu(t, o = {}) {
      const tt = o.freeze ?? t, br = S(tt * 1.7) * (o.breath ?? 1), talk = o.talk || 0, tw = Math.max(0, S(tt * 0.9) - 0.92) * 12;
      return base(t, { seed: 2, ...o }, {
        root: { r: o.lean || 0, x: o.x || 0, y: o.y || 0, sx: o.sx ?? 1, sy: o.sy ?? 1 },
        body: { r: 0.012 * S(tt * 0.8) },
        chest: { sy: 1 + 0.014 * br, r: 0.01 * S(tt * 0.9 + 0.4) + (o.chestR || 0) },
        armUp: { r: 0.05 * S(tt * 1.1) + (o.armUp || 0), y: o.armUpY || 0 },
        head: { r: 0.035 * S(tt * 0.75) + (o.headR || 0) + talk * 0.03 * S(tt * 8), y: -1.6 * br + (o.headY || 0) },
        armM: { r: 0.03 * S(tt * 1.3 + 1) + (o.armM || 0) },
        jaw: { y: 2.5 + 5 * talk + (o.yawn || 0) * 7 },
        earL: { r: -0.12 * tw + (o.ears || 0) },
        earR: { r: 0.14 * tw - (o.ears || 0) },
        tail: { r: 0.18 * S(tt * 1.1) + (o.tail || 0) },
        knee: { r: 0.02 * S(tt * 1.4) + (o.knee || 0), y: o.kneeY || 0 },
      });
    },
    sieg(t, o = {}) {
      const tt = o.freeze ?? t, br = S(tt * 1.6), talk = o.talk || 0, walk = o.walk || 0, ph = tt * 4.2;
      return base(t, { seed: 3, ...o }, {
        root: { r: (o.lean || 0) + walk * 0.02 * S(ph), x: o.x || 0, y: (o.y || 0) - walk * 7 * Math.abs(S(ph)) },
        chest: { sy: 1 + 0.009 * br, r: 0.005 * S(tt * 0.8) },
        head: { r: 0.022 * S(tt * 0.6 + 2) + (o.headR || 0) + talk * 0.018 * S(tt * 6.5), y: -1 * br + (o.headY || 0) - talk * 1 },
        armL: { r: 0.018 * S(tt * 1.4) + walk * 0.06 * S(ph) + (o.armL || 0) },
        armR: { r: 0.012 * S(tt * 1.2 + 1) - walk * 0.03 * S(ph) + (o.armR || 0) },
        jaw: { y: talk * 3 },
      });
    },
    shield(t, o = {}) {
      const tt = o.freeze ?? t, br = S(tt * 1.1), walk = o.walk || 0, ph = (o.walkPh ?? tt * 2.2);
      const liftL = Math.max(0, S(ph)) * walk, liftR = Math.max(0, -S(ph)) * walk;
      return base(t, { ...o, blink: 0 }, {
        root: { r: (o.lean || 0) + walk * 0.025 * S(ph), x: o.x || 0, y: (o.y || 0) - walk * 10 * Math.abs(S(ph)) + (o.crouch || 0) * 30, sx: o.sx ?? 1, sy: (o.sy ?? 1) - (o.crouch || 0) * 0.04 },
        body: { r: 0.008 * S(tt * 0.7) },
        torso: { sy: 1 + 0.014 * br, r: 0.012 * S(tt * 0.6) + (o.torsoR || 0), y: o.torsoY || 0 },
        head: { r: 0.04 * S(tt * 0.5 + 1) + (o.headR || 0), y: o.headY || 0 },
        jaw: { r: 0, y: (o.jaw || 0) * 12 },
        armC: { r: 0.04 * S(tt * 0.9) + walk * 0.08 * S(ph + 1.5) + (o.claw || 0) },
        shield: { r: 0.015 * S(tt * 0.8) + (o.shieldR || 0) - walk * 0.03 * S(ph), x: o.shieldX || 0, y: o.shieldY || 0, sx: o.shieldS || 1, sy: o.shieldS || 1 },
        legL: { y: -liftL * 26, r: liftL * 0.05 },
        legR: { y: -liftR * 22, r: -liftR * 0.04 },
      });
    },
    sable(t, o = {}) {
      const tt = o.freeze ?? t;
      return base(t, { ...o, blink: 0 }, {
        root: { x: o.x || 0, y: o.y || 0 },
        chest: { sy: 1 + 0.006 * S(tt * 1.2), r: 0.01 * S(tt * 0.5) },
        head: { r: 0.05 * S(tt * 0.45) + (o.headR || 0) + (o.talk || 0) * 0.03 * S(tt * 6) },
        hand: { r: 0.06 * S(tt * 0.9) + (o.hand || 0) },
      });
    },
    generic(t, o = {}) {
      const tt = o.freeze ?? t;
      return base(t, { ...o, blink: 0 }, {
        root: { x: o.x || 0, y: o.y || 0, sx: 1 + 0.006 * S(tt * 1.5), sy: 1 + 0.01 * S(tt * 1.5) },
        chest: { sy: 1 + 0.01 * S(tt * 1.7) }, head: { r: 0.03 * S(tt * 0.7) + (o.headR || 0), y: -1 * S(tt * 1.7) },
        b: { sx: 1 + 0.03 * S(tt * 6), sy: 1 - 0.03 * S(tt * 6) },
        body: { sy: 1 + 0.01 * S(tt * 0.9), r: 0.004 * S(tt * 0.6) },
      });
    },
  };
})();
