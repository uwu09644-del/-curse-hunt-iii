/* RUINBREAKER — the auto-director. Turns an episode script (scenes of dialogue, entrances, walks and custom
   action beats) into staged 3D shots with subtitles, voice, score and ambience.
   Staging follows the make-an-anime rules: establish the place, then shot / reverse-shot from one side of the
   line between the speakers, vary shot sizes, hold faces through lines, cut reactions on long lines, and move
   the camera once per shot after a short hold. */
'use strict';

const DIRECTOR = (() => {
  const PI = Math.PI, HALF = PI / 2;
  const WHO = { TAK: 'TAKUTO', NEM: 'NEMU', SIE: 'SIEG', AKU: 'AKURO', RIN: 'RIN', VAL: 'VALENTINE', CLK: 'CLERK', CRW: 'CROWD', CRF: 'CROWD2', VEN: 'VENDOR', HUN: 'HUNTER', SAB: 'SABLE', WIC: 'WICK', GID: 'GIDEON', HAR: 'HARUKI', LUC: 'LUCIEN', VES: 'VESPER', KUR: 'KUROZANE', OGR: 'OGRE', EXM: 'EXAMINER', NAR: 'NARRATOR' };
  const ACTOR = { TAKUTO: 'takuto', NEMU: 'nemu', SIEG: 'sieg', RIN: 'rin', VALENTINE: 'valentine', CLERK: 'clerk', SABLE: 'sable', WICK: 'wick', GIDEON: 'gideon', HARUKI: 'haruki', LUCIEN: 'lucien', VESPER: 'vesper', KUROZANE: 'm_wolf', OGRE: 'm_plume', EXAMINER: 'clerk' };
  const EYE = { takuto: 1.66, nemu: 1.45, sieg: 1.76, rin: 1.5, valentine: 1.55, clerk: 1.45, sable: 1.8, tofu: 1.2 };
  const IDLE = {
    takuto: { uaR: [0.5, 0.25], elR: 2.3, weapon: 0, uaL: [0.05, 0.15], elL: 0.3 },
    nemu: { uaL: [0.08, 0.12], elL: 0.35, uaR: [0.08, 0.12], elR: 0.35 },
    sieg: { uaL: [0.25, 0.1], elL: 1.35, weapon: 0, uaR: [0.05, 0.12], elR: 0.3 },
    rin: { uaL: [0.55, 0.32], elL: 1.95, uaR: [0.55, 0.32], elR: 1.95, weapon: 0 },
    valentine: { uaL: [0.15, 0.55], elL: 1.7, uaR: [0.35, 0.1], elR: 1.2 },
    clerk: { uaL: [0.42, 0.05], elL: 1.3, uaR: [0.42, 0.05], elR: 1.3 },
    sable: { uaL: [0.05, 0.12], elL: 0.2, uaR: [0.05, 0.12], elR: 0.2 },
    tofu: {},
  };
  const EMOTE = { angry: { angry: 0.75 }, happy: { happy: 0.7 }, sad: { sad: 0.7 }, surprised: { Surprised: 0.8 }, smug: { happy: 0.35, angry: 0.15 }, calm: { relaxed: 0.4 }, tired: { relaxed: 0.6 } };

  function build(spec) {
    const G = GFX, S = SND, V = VOICE, X = VFX, n = S.n, { clamp, lerp, inv, ease, hash, W, H } = G;
    const shots = [], subs = [], ev = [], chapters = []; let T = 0, lineNo = 0;
    const prior = V.placed.splice(0, V.placed.length); // lines another episode already placed (Episode 1), re-timed when borrowed
    const at = (t, f, d = 0.2, long = false) => ev.push({ t, d, f, long });
    const chapter = name => chapters.push({ t: T, name });
    const nextId = () => spec.id + '_' + String(++lineNo).padStart(3, '0');
    function place(tt, id) { const p = V.place(tt, id); subs.push({ t0: tt, t1: tt + p.dur + 0.3, who: p.who, text: p.text, mono: p.mono }); ev.push({ t: tt, d: p.dur + 0.1, long: true, f: (g, w, off) => V.play(g, p, w, off) }); return p; }
    function shot(d, draw, o = {}) {
      let lastEnd = 0; (o.say || []).forEach(([a, id]) => { const tt = typeof a === 'string' ? lastEnd + parseFloat(a) : a; const p = place(T + tt, id); lastEnd = tt + p.dur; });
      if (o.say && o.say.length) d = Math.max(d, lastEnd + (o.tail ?? 0.5));
      const s = { t0: T, d, draw, vig: o.vig !== false, tag: o.tag }; shots.push(s);
      (o.sfx || []).forEach(([a, f, d2 = 0.2, long = false]) => ev.push({ t: T + a, d: d2, f, long }));
      T += d; return s;
    }
    // borrow shots + sound from another episode (the opening, the eyecatch, the ending)
    function borrow(ep, t0, t1, patch) {
      const off = T - t0;
      ep.shots.filter(s => s.t0 >= t0 - 1e-6 && s.t0 < t1 - 1e-6).forEach(s => { shots.push({ t0: s.t0 + off, d: s.d, draw: patch ? (lt, d, t) => patch(s, lt, d, t) : s.draw, vig: s.vig }); });
      ep.ev.filter(e => e.t >= t0 - 1e-6 && e.t < t1 - 1e-6).forEach(e => ev.push({ ...e, t: e.t + off }));
      (ep.subs || []).filter(u => u.t0 >= t0 - 1e-6 && u.t0 < t1 - 1e-6).forEach(u => subs.push({ ...u, t0: u.t0 + off, t1: u.t1 + off }));
      prior.filter(p => p.t >= t0 - 1e-6 && p.t < t1 - 1e-6).forEach(p => V.placed.push({ ...p, t: p.t + off }));
      T += t1 - t0;
    }

    /* ---------- staging helpers ---------- */
    const SC = { marks: {}, env: 'town', envOpts: {}, side: 1, lastShot: '', count: 0, pairShots: 0 };
    const snap = () => ({ marks: SC.marks, env: SC.env, envOpts: SC.envOpts, mood: SC.mood, side: SC.side, wideDir: SC.wideDir, overlay: SC.overlay, handheld: SC.handheld, lastPartner: { ...SC.lastPartner } });
    const enter = st => { const prev = snap(); Object.assign(SC, st); return () => Object.assign(SC, prev); };
    const gaze = (t, seed, bias = [0, 0]) => { const k = Math.floor(t / 1.8 + hash(seed, 7) * 5); return [bias[0] + (hash(k, seed) - 0.5) * 0.3, bias[1] + (hash(k, seed + 3) - 0.5) * 0.12]; };
    function actorPose(name, t, o = {}) { // idle stance at the mark, facing who they talk to, with small talking gestures
      const m = SC.marks[name]; if (!m) return null;
      const p = { ...IDLE[name], ...(m.pose || {}), x: m.x, z: m.z, ry: m.ry ?? 0 };
      if (o.face) { const f = SC.marks[o.face]; if (f) p.ry = Math.atan2(f.x - m.x, f.z - m.z) + SC.side * (m.cheat ?? 0.32); }
      const talk = V.amp(VOICE_OF[name] || '', t);
      if (talk > 0.05 && name !== 'tofu' && (m.gesture ?? true)) { const k = Math.floor(t / 2.2 + hash(name.length, 3)); if (hash(k, name.length) > 0.45) { const s2 = 0.5 + 0.5 * Math.sin(t * 2.6 + k); p.uaR = [0.35 + 0.35 * s2, 0.15]; p.elR = 1.2 + 0.5 * s2; if (name === 'takuto') { p.uaL = [0.3 + 0.3 * s2, 0.15]; p.elL = 1.1 + 0.4 * s2; p.uaR = IDLE.takuto.uaR; p.elR = IDLE.takuto.elR; } } p.headX = (p.headX || 0) - 0.04; }
      if (o.pose) Object.assign(p, o.pose);
      return p;
    }
    const VOICE_OF = { takuto: 'TAKUTO', nemu: 'NEMU', sieg: 'SIEG', rin: 'RIN', valentine: 'VALENTINE', clerk: 'CLERK', sable: 'SABLE', wick: 'WICK', gideon: 'GIDEON', haruki: 'HARUKI', lucien: 'LUCIEN', vesper: 'VESPER' };
    function castList(t, focus = {}, extra = {}) {
      return Object.keys(SC.marks).filter(k => !SC.marks[k].hidden).map(k => {
        const m = SC.marks[k], partner = focus[k] || m.faceTo || SC.lastPartner[k];
        const pose = actorPose(k, t, { face: partner, pose: (extra[k] || {}).pose });
        const listening = V.amp(VOICE_OF[k] || '', t) < 0.02;
        const o = { talk: k === 'nemu' ? Math.max(V.amp('NEMU', t), 0) : V.amp(VOICE_OF[k] || '', t), gaze: (extra[k] || {}).gaze || gaze(t, k.length * 7, listening ? [0, 0.05] : [0, 0]), expr: EMOTE[(extra[k] || {}).emote || m.emote] || undefined, weapon: m.weapon ?? (k !== 'rin'), axeGlow: m.axeGlow || 0, face: m.screen };
        if (m.blink != null) o.blink = m.blink;
        return [k, pose, o];
      });
    }
    function headAt(name, t) { const p = actorPose(name, t, { face: SC.lastPartner[name] || SC.marks[name].faceTo }); S3.place(name, p, t, {}); const h = S3.jointPos(name, 'head', 0.115); return h; }
    const V3a = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    const norm2 = (x, z) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
    // camera for a dialogue framing between speaker a and listener b
    function frameFor(kind, a, b, t) {
      const ha = headAt(a, t), hb = b ? headAt(b, t) : null;
      const [dx, dz] = hb ? norm2(hb[0] - ha[0], hb[2] - ha[2]) : [Math.sin(SC.marks[a].ry || 0), Math.cos(SC.marks[a].ry || 0)];
      const nx = -dz * SC.side, nz = dx * SC.side; // the camera's side of the line
      if (kind === 'two' && hb) { const mid = V3a(ha, hb, 0.5), dist = Math.max(2.6, Math.hypot(hb[0] - ha[0], hb[2] - ha[2]) * 1.55 + 1.4); return { pos: [mid[0] + nx * dist, mid[1] - 0.2, mid[2] + nz * dist], look: [mid[0], mid[1] - 0.32, mid[2]], fov: 30 }; }
      if (kind === 'ots' && hb) return { pos: [hb[0] + dx * 0.75 + nx * 0.42, hb[1] + 0.02, hb[2] + dz * 0.75 + nz * 0.42], look: [ha[0], ha[1] - 0.06, ha[2]], fov: 28 };
      const toCam = norm2((hb ? dx : dx) * 0.55 + nx * 0.85, (hb ? dz : dz) * 0.55 + nz * 0.85);
      if (kind === 'cu') return { pos: [ha[0] + toCam[0] * 0.9, ha[1] - 0.02, ha[2] + toCam[1] * 0.9], look: [ha[0], ha[1] - 0.04, ha[2]], fov: 26 };
      if (kind === 'mcu') return { pos: [ha[0] + toCam[0] * 1.55, ha[1] - 0.12, ha[2] + toCam[1] * 1.55], look: [ha[0], ha[1] - 0.2, ha[2]], fov: 28 };
      if (kind === 'low') return { pos: [ha[0] + toCam[0] * 1.6, ha[1] - 0.75, ha[2] + toCam[1] * 1.6], look: [ha[0], ha[1] - 0.05, ha[2]], fov: 30 };
      // wide: everybody
      const near = (k) => !b || [a, b].some(q => SC.marks[q] && Math.hypot(SC.marks[k].x - SC.marks[q].x, SC.marks[k].z - SC.marks[q].z) < 4.5);
      const ks = Object.keys(SC.marks).filter(k => !SC.marks[k].hidden && k !== 'tofu' && near(k)), c = ks.reduce((s2, k) => [s2[0] + SC.marks[k].x / ks.length, s2[1] + SC.marks[k].z / ks.length], [0, 0]);
      const spread = Math.min(5, Math.max(1.6, ...ks.map(k => Math.hypot(SC.marks[k].x - c[0], SC.marks[k].z - c[1]))));
      const [vx, vz] = SC.wideDir || [0, 1]; return { pos: [c[0] + vx * (spread * 2.4 + 2.5), 1.45, c[1] + vz * (spread * 2.4 + 2.5)], look: [c[0], 1.0, c[1]], fov: 32 };
    }
    function moveCam(a, lt, d, style, seed) {
      const k = ease.io(clamp((lt - 0.3) / Math.max(0.5, d - 0.6))), c = { pos: a.pos.slice(), look: a.look.slice(), fov: a.fov };
      if (style === 'push') { c.pos = V3a(a.pos, a.look, 0.06 * k); }
      else if (style === 'drift') { const dx = a.look[2] - a.pos[2], dz = -(a.look[0] - a.pos[0]), l = Math.hypot(dx, dz) || 1; c.pos[0] += dx / l * 0.18 * (k - 0.5) * (hash(seed, 2) > 0.5 ? 1 : -1); c.pos[2] += dz / l * 0.18 * (k - 0.5) * (hash(seed, 2) > 0.5 ? 1 : -1); }
      if (SC.handheld) { c.pos = c.pos.map((v, i) => v + Math.sin(lt * (0.9 + i * 0.3) + seed) * 0.006); }
      return c;
    }
    // keep dialogue cameras inside the set: the street between the houses, the walls of the hall, the yard's fence
    const BOUNDS = { town: p => p[1] > 8 ? p : [clamp(p[0], -3.7, 3.7), p[1], p[2]], guild: p => [clamp(p[0], -10.3, 10.3), Math.min(p[1], 7.3), clamp(p[2], -8.5, 8.5)], yard: p => { const r = Math.hypot(p[0], p[2]); return r > 12.2 ? [p[0] * 12.2 / r, p[1], p[2] * 12.2 / r] : p; } };
    const inSet = cam => { const f = BOUNDS[SC.env]; if (f) cam.pos = f(cam.pos); return cam; };
    function render(t, cam, cast, after, under) {
      S3.frame({ env: SC.env, t, cam, cast, envOpts: SC.envOpts, under });
      if (SC.overlay) SC.overlay(t, cam);
      postFor(SC.mood);
      if (after) after(t);
    }
    function postFor(mood) {
      if (mood === 'night') POST.set({ lift: [0.02, 0.03, 0.06], gain: [0.95, 1, 1.08], sat: 1.05, bloom: 0.5, thr: 0.68 });
      else if (mood === 'interior') POST.set({ bloom: 0.35, thr: 0.76, sat: 1.06, gain: [1.0, 0.97, 0.92] });
      else if (mood === 'dusk') POST.set({ bloom: 0.45, thr: 0.7, sat: 1.1 });
      else POST.set({ bloom: 0.35, thr: 0.74, sat: 1.12 });
    }

    /* ---------- score and ambience ---------- */
    const KEYS = { calm: ['D', 'Bb', 'F', 'C'], town: ['D', 'G', 'A', 'D'], comedy: ['F', 'C', 'Dm', 'Bb'], tension: ['D', 'Eb', 'D', 'C'], battle: ['D', 'Bb', 'C', 'A'], emotional: ['D', 'Bb', 'F', 'A'], night: ['A', 'F', 'C', 'G'], mystery: ['E', 'C', 'E', 'B'] };
    const CH = r => { const root = r.replace('m', ''), minor = r.endsWith('m') || ['D', 'E', 'A'].includes(r) && false; const i = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].indexOf(root); const N = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']; const third = r === 'D' || r === 'A' || r === 'E' || r.endsWith('m') ? 3 : 4; return [N[i], N[(i + third) % 12], N[(i + 7) % 12]]; };
    function music(mood, t0, dur) {
      if (!mood || mood === 'none' || dur < 2) return;
      const prog = KEYS[mood] || KEYS.calm, bpm = { calm: 72, town: 96, comedy: 112, tension: 64, battle: 148, emotional: 66, night: 60, mystery: 70 }[mood] || 80, b = 60 / bpm, bar = b * 4;
      const fadeIn = t0 + 0.5, end = t0 + dur - 0.8;
      for (let t = fadeIn, i = 0; t < end; t += bar, i++) {
        const r = prog[i % prog.length], ch = CH(r), rootF = n(ch[0] + '2'), len = Math.min(bar, end - t), fade = Math.min(1, (t - t0) / 2, (end - t) / 2);
        if (len < 0.4) break;
        at(t, (g, w) => {
          if (mood === 'battle') { S.pad(g, w, rootF, len, { vol: 0.05 * fade, cut: 700 }); ch.forEach(c => S.brass(g, w, n(c + '3'), b * 1.8, 0.05 * fade)); for (let k = 0; k < 8; k++) S.bass(g, w + k * b / 2, k % 4 === 3 ? rootF * 1.5 : rootF, b * 0.42, 0.13 * fade); [0, 2].forEach(k => S.taiko(g, w + k * b, 0.42 * fade)); for (let k = 0; k < 8; k++) S.hat(g, w + k * b / 2, 0.04 * fade); S.snare(g, w + b, 0.18 * fade); S.snare(g, w + 3 * b, 0.18 * fade); }
          else if (mood === 'tension') { S.pad(g, w, rootF, len, { vol: 0.06 * fade, cut: 420, att: 1.2 }); S.choir(g, w, n(ch[1] + '4'), len, 0.025 * fade, 1.2, 1.5); if (i % 2 === 0) S.taiko(g, w, 0.3 * fade); S.tone && S.tone(g, w + b * 2, rootF * 4, b * 1.5, 0.01 * fade, 'sine', 'music', 0.5, 0.8); }
          else if (mood === 'comedy') { S.pad(g, w, rootF * 2, len, { vol: 0.03 * fade, cut: 1200 }); for (let k = 0; k < 8; k++) if (hash(i * 8 + k, 5) > 0.35) S.pluck(g, w + k * b / 2, n(ch[k % 3] + (k % 2 ? '5' : '4')), 0.09 * fade); S.bass(g, w, rootF, b * 0.4, 0.1 * fade); S.bass(g, w + 2 * b, rootF * 1.5, b * 0.4, 0.1 * fade); if (i % 2) S.bell(g, w + 3 * b, n(ch[2] + '6'), 0.04 * fade, 1.2); }
          else if (mood === 'town') { S.pad(g, w, rootF, len, { vol: 0.04 * fade, cut: 900 }); for (let k = 0; k < 8; k++) S.pluck(g, w + k * b / 2, n(ch[[0, 1, 2, 1][k % 4]] + (k < 4 ? '4' : '5')), 0.08 * fade); if (i % 2 === 0) { const mel = [ch[2] + '5', ch[1] + '5', ch[0] + '5', ch[1] + '5']; mel.forEach((m, k) => S.lead(g, w + k * b, n(m), b * 0.9, 0.035 * fade)); } S.bass(g, w, rootF, b * 1.6, 0.09 * fade); S.bass(g, w + 2 * b, rootF * 1.5, b * 1.6, 0.08 * fade); }
          else if (mood === 'emotional' || mood === 'night') { S.pad(g, w, rootF, len, { vol: 0.05 * fade, cut: 700, att: 1.5 }); [0, 1, 2, 1, 0, 1, 2, 1].forEach((c, k) => S.piano(g, w + k * b / 2, n(ch[c] + (k > 3 ? '5' : '4')), b * 1.2, 0.22 * fade)); if (mood === 'emotional' && i % 2 === 1) S.choir(g, w, n(ch[0] + '4'), len, 0.025 * fade, 1, 1.5); }
          else if (mood === 'mystery') { S.pad(g, w, rootF, len, { vol: 0.05 * fade, cut: 500, att: 1.2 }); S.bell(g, w + b, n(ch[2] + '5'), 0.05 * fade, 2.4); S.bell(g, w + b * 2.5, n(ch[1] + '6'), 0.03 * fade, 2.4); }
          else { S.pad(g, w, rootF, len, { vol: 0.05 * fade, cut: 800 }); ch.forEach((c, k) => S.piano(g, w + k * b, n(c + '4'), b * 2, 0.2 * fade)); }
        }, len, true);
      }
    }
    function ambience(loc, t0, dur, mood) {
      const f = { town: { vol: 0.07, bp: 900, q: 0.4 }, guild: { vol: 0.06, bp: 700, q: 0.5 }, yard: { vol: 0.05, hp: 500, lp: 3000 }, barrow: { vol: 0.06, hp: 300, lp: 2200 }, earth: { vol: 0.14, hp: 900, lp: 7500 } }[loc];
      if (!f) return; at(t0, (g, w, off) => S.noiseBed(g, w, off, dur, { ...f, fin: 1.2, fout: 1.2 }), dur, true);
      if (loc === 'town' || loc === 'guild') for (let t = t0 + 1; t < t0 + dur - 1; t += 1.7 + hash(Math.floor(t), 9) * 3) { const tt = t; at(tt, (g, w) => S.clicks && S.clicks(g, w, 0.4, 3, { vol: 0.03, f0: 400, f1: 1200, q: 2, len: 0.03, seed: Math.floor(tt) })); }
      if (mood === 'night' && loc === 'barrow') at(t0, (g, w, off) => S.noiseBed(g, w, off, dur, { vol: 0.04, bp: 4200, q: 6, lfo: 7, lfoDepth: 900, fin: 1.5, fout: 1.5 }), dur, true);
    }


    /* ---------- painted establishing shots and reusable fight moves ---------- */
    function plateShot(id, d, o = {}) {
      const a = o.from || [0, 0, 1.0], b = o.to || [o.pan ?? -0.06, o.tilt ?? 0, o.zoom ?? 1.1];
      shot(d, (lt, dd, t) => {
        const im = S3.plateImage(id); const k = ease.io(clamp(lt / dd)), x = lerp(a[0], b[0], k), y = lerp(a[1], b[1], k), z = lerp(a[2], b[2], k);
        if (im) { const c = G.ctx, s = Math.max(W / im.width, H / im.height) * z * 1.06; c.save(); c.drawImage(im, W / 2 - im.width * s / 2 + x * W, H / 2 - im.height * s / 2 + y * H, im.width * s, im.height * s); c.restore(); }
        else G.fill('#101014');
        if (o.fx) o.fx(lt, dd, t);
        if (o.card) G.locationCard(lt - 0.6, Math.min(5, dd - 1), o.card[0], o.card[1]);
        if (o.fadeIn) G.fill('#000', 1 - inv(0, o.fadeIn, lt)); if (o.fadeOut) G.fill('#000', inv(dd - o.fadeOut, dd, lt));
        POST.set({ bloom: 0.35, thr: 0.74, sat: 1.08 });
      }, { say: o.say, sfx: o.sfx });
    }
    const P = () => S3.POSES, V2 = (x, z) => [x, z];
    function mk(name) { const m = SC.marks[name]; return m ? [m.x, m.z] : [0, 0]; }
    function toward(a, b, dist) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [b[0] - dx / l * dist, b[1] - dz / l * dist]; }
    const yawTo = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
    const proj = p => S3.project(p[0], p[1], p[2]);
    const jolt = (c, t, amt) => { if (amt <= 0) return c; const k = G.twos(t, 30); c.pos = c.pos.map((v, i) => v + (hash(k, i + 1) - 0.5) * amt); return c; };
    function castWith(t, over) { return castList(t).map(c => over[c[0]] ? [c[0], { ...c[1], ...over[c[0]].pose }, { ...c[2], ...(over[c[0]].o || {}) }] : c); }
    function sideCam(a, b, dist, h = 1.25, fov = 34, bias = 0) { const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * SC.side, nz = dx / l * SC.side; return { pos: [mx + nx * dist + dx / l * bias, h, mz + nz * dist + dz / l * bias], look: [mx, h * 0.9 + 0.2, mz], fov }; }
    const MOVES = {
      standoff(lt, d, t, o) {
        const H0 = mk(o.hero || 'takuto'), F0 = mk(o.foe), fh = S3.SPRITE_H[o.foe] || 1.8, dx = H0[0] - F0[0], dz = H0[1] - F0[1], l = Math.hypot(dx, dz) || 1, roar = o.roar ? Math.max(0, 1 - Math.abs(lt - d * 0.55) / 0.6) : 0;
        const a = { pos: [H0[0] + dx / l * 2.0 - dz / l * 0.9 * SC.side, 0.75, H0[1] + dz / l * 2.0 + dx / l * 0.9 * SC.side], look: [F0[0], fh * 0.55, F0[1]], fov: 38 };
        const k = ease.io(clamp(lt / d)); a.pos = a.pos.map((v, i) => i === 1 ? v : lerp(v, [H0[0], 0, H0[1]][i], k * 0.25));
        render(t, jolt(a, t, roar * 0.12), castWith(t, { [o.hero || 'takuto']: { pose: { ...P().ready, ry: yawTo(H0, F0) }, o: { axeGlow: o.glow || 0 } }, [o.foe]: { o: { lunge: roar * 0.6, shake: roar } } }));
        if (roar > 0.5) { const [x, y] = proj([F0[0], fh * 0.8, F0[1]]); X.ring(lt - d * 0.55, { x, y, r1: 900, dur: 0.7, flat: 0.9 }); X.focus(t, { x, y, r0: 300, a: (roar - 0.5) * 1.6 }); }
      },
      charge(lt, d, t, o) {
        const hero = o.hero || 'takuto', H0 = mk(hero), F0 = mk(o.foe), end = toward(H0, F0, o.stop || 2.6), k = clamp(lt / d), pos = [lerp(H0[0], end[0], k), lerp(H0[1], end[1], k)];
        const cam = sideCam(pos, [pos[0] + (F0[0] - H0[0]) * 0.15, pos[1] + (F0[1] - H0[1]) * 0.15], 4.2, 1.1, 36);
        render(t, cam, castWith(t, { [hero]: { pose: { ...S3.run(t * 15, 1.1), x: pos[0], z: pos[1], ry: yawTo(H0, F0), ...(hero === 'takuto' ? { uaR: [1.0, 0.2], elR: 0.8, weapon: 0.6 } : {}) }, o: { vx: 3 } } }));
        X.streaks(t, { a: 0.55 }); POST.set({ dir: [0.006, 0] });
      },
      strike(lt, d, t, o) {
        const hero = o.hero || 'takuto', F0 = mk(o.foe), H1 = toward(mk(hero), F0, o.reach || 2.2), hit = d * (o.at || 0.55), fh = S3.SPRITE_H[o.foe] || 1.8;
        const pose = S3.seq(lt, [[0, P().ready], [hit - 0.35, { ...P().windup, weapon: 2.0, y: o.jump ? 1.0 : 0 }, 'out'], [hit, { ...P().chop, weapon: 1.7 }, 'in'], [hit + 0.5, P().ready]]);
        const after = lt > hit ? Math.exp(-(lt - hit) * 5) : 0;
        const cam = jolt(sideCam(H1, F0, Math.max(5, fh * 1.25), Math.min(2.2, fh * 0.35 + 0.8), 36, -0.6), t, after * 0.25);
        render(t, cam, castWith(t, { [hero]: { pose: { ...pose, x: H1[0], z: H1[1], ry: yawTo(H1, F0) }, o: { axeGlow: o.glow ?? 0.4, expr: { angry: 0.6 } } }, [o.foe]: { o: { flash: lt > hit && lt < hit + 0.1 ? 1 : 0, shake: after, lunge: -after * 0.8, tilt: -after * 0.08 } } }));
        if (lt > hit) { const [x, y] = proj([F0[0], fh * 0.5, F0[1]]); X.sparks(lt - hit, { x, y, n: 70, spread: 2.4, speed: 1200, color: o.color || '#ffd0a0' }); X.debris(lt - hit, { x, y: proj([F0[0], 0, F0[1]])[1], n: 30, speed: 600, size: 10, seed: Math.round(t * 10) }); }
        if (lt > hit && lt < hit + 0.45) { const [x, y] = proj([F0[0], fh * 0.5, F0[1]]); X.focus(t, { x, y, r0: 220, a: 1 - (lt - hit) / 0.45 }); }
        if (lt > hit && lt < hit + 0.09) G.fill('#fff', 0.8); else if (lt > hit + 0.09 && lt < hit + 0.18) G.impact('inv');
      },
      foeAttack(lt, d, t, o) {
        const hero = o.hero || 'takuto', H0 = mk(hero), F0 = mk(o.foe), at = d * 0.42, fh = S3.SPRITE_H[o.foe] || 1.8, lunge = Math.max(0, 1 - Math.abs(lt - at) / 0.5);
        const F1 = toward(H0, F0, -0.0); const fpos = [lerp(F0[0], H0[0], lunge * 0.35), lerp(F0[1], H0[1], lunge * 0.35)];
        const hit = !!o.hit && lt > at, fly = hit ? ease.out(clamp((lt - at) / 0.8)) : 0, dodge = !o.hit ? Math.sin(clamp((lt - at + 0.25) / 0.6) * Math.PI) : 0;
        const back = [H0[0] - (F0[0] - H0[0]) * 0.35 * fly, H0[1] - (F0[1] - H0[1]) * 0.35 * fly];
        const hp = hit ? { ...P().hit, y: Math.sin(fly * Math.PI) * 0.6, pitch: fly * 0.9 } : dodge > 0.2 ? { ...P().duck, x: H0[0] + dodge * 0.8 * SC.side } : P().ready;
        const cam = jolt({ pos: [H0[0] + (H0[0] - F0[0]) * 0.45, 1.1, H0[1] + (H0[1] - F0[1]) * 0.45 + 0.8 * SC.side], look: [F0[0], fh * 0.6, F0[1]], fov: 40 }, t, lunge * 0.15 + (hit && lt < at + 0.4 ? 0.2 : 0));
        render(t, cam, castWith(t, { [hero]: { pose: { x: back[0], z: back[1], ry: yawTo(H0, F0), ...hp }, o: { expr: hit ? { Surprised: 0.6 } : { angry: 0.5 } } }, [o.foe]: { pose: { x: fpos[0], z: fpos[1] }, o: { lunge: lunge, tilt: lunge * 0.06 } } }));
        if (lunge > 0.6) { const [x, y] = proj([H0[0], 1.0, H0[1]]); X.focus(t, { x, y, r0: 260, a: (lunge - 0.6) * 2 }); }
        if (hit && lt < at + 0.09) G.fill('#fff', 0.7);
      },
      special(lt, d, t, o) {
        const hero = o.hero || 'takuto', H0 = mk(hero), F0 = mk(o.foe), fh = S3.SPRITE_H[o.foe] || 1.8, jumpAt = d * 0.45, hit = d * 0.62;
        const glow = clamp(lt / (d * 0.4)), jump = clamp((lt - jumpAt) / (hit - jumpAt)), P1 = toward(H0, F0, 1.4);
        const pos = [lerp(H0[0], P1[0], ease.io(jump)), lerp(H0[1], P1[1], ease.io(jump))], y = Math.sin(jump * Math.PI * 0.85) * (o.height || 2.4);
        const pose = lt < jumpAt ? { ...P().ready, crouch: 0.15 * glow } : lt < hit ? { ...P().windup, weapon: 2.0, y } : { ...P().chop, weapon: 1.7, y: Math.max(0, y) };
        let cam; if (lt < jumpAt) { const a = (lt / jumpAt) * 0.9 - 0.45, r = 3.2; cam = { pos: [H0[0] + Math.sin(a) * r, 0.9, H0[1] + Math.cos(a) * r], look: [H0[0], 1.3, H0[1]], fov: 34 }; }
        else cam = jolt(sideCam(H0, F0, Math.max(7, fh * 1.6), 1.6, 38), t, lt > hit && lt < hit + 0.9 ? 0.35 * (1 - (lt - hit) / 0.9) : 0);
        const broke = o.kill && lt > hit + 0.3, fade = broke ? clamp((lt - hit - 0.3) / 1.6) : 0;
        render(t, cam, castWith(t, { [hero]: { pose: { ...pose, x: pos[0], z: pos[1], ry: yawTo(H0, F0) }, o: { axeGlow: glow, expr: { angry: 0.8 } } }, [o.foe]: { o: { flash: lt > hit && lt < hit + 0.15 ? 1 : 0, shake: lt > hit ? 1 - fade : 0, alpha: 1 - fade, tint: broke ? '#ff8a7a' : undefined } } }));
        if (lt < jumpAt) { const [x, yy] = proj([H0[0], 1.0, H0[1]]); X.aura(t, { x, y: yy, w: 300, h: 420, n: 50, a: 0.7 * glow }); X.converge(t, { x, y: yy, r: 420, n: 60, a: glow * 0.7 }); }
        if (lt > hit - 0.15) { const [x, yy] = proj([F0[0], fh * 0.55, F0[1]]); X.slash(lt - hit + 0.15, { x, y: yy - 60, r: 420, a0: -2.4, a1: 0.95, dur: 0.22, hold: 0.8, w: 130, flat: 0.75, rot: 0.15 }); if (lt > hit) { X.ring(lt - hit, { x, y: yy, r1: 1300, dur: 0.9, flat: 1, color: '#ffd0c0' }); X.sparks(lt - hit, { x, y: yy, n: 120, spread: 3.2, speed: 1600, color: '#ffc29a' }); } }
        if (broke) { const [x, yy] = proj([F0[0], fh * 0.5, F0[1]]); X.debris(lt - hit - 0.3, { x, y: yy, n: 60, speed: 900, size: 14, seed: 77 }); G.motes(t, { n: 90, vy: -60, color: '#ff8a5a', size: 2.4, seed: 5, a: 1 - fade * 0.5 }); }
        if (lt > jumpAt && lt < hit) X.streaks(t, { a: 0.6, dir: -1 }); if (lt > hit && lt < hit + 0.7) { const [x, yy] = proj([F0[0], fh * 0.55, F0[1]]); X.focus(t, { x, y: yy, r0: 240, a: 1 - (lt - hit) / 0.7 }); }
        if (lt > hit && lt < hit + 0.09) G.fill('#fff'); else if (lt > hit + 0.09 && lt < hit + 0.18) G.impact('inv');
        POST.set({ bloom: 0.9, thr: 0.5 });
      },
      ally(lt, d, t, o) { // an ally's Brand on the creature: threads (Rin), afterimage (Sieg), flame (Wick), freeze (Haruki)
        const ally = o.ally, A0 = mk(ally), F0 = mk(o.foe), fh = S3.SPRITE_H[o.foe] || 1.8, k = clamp((lt - 0.4) / 0.8), kind = o.kind;
        const cam = sideCam(A0, F0, Math.max(5, fh * 1.3), 1.3, 36);
        const pose = { ...P().ready, ry: yawTo(A0, F0), uaR: [1.6, 0.2], elR: 0.2, ...(kind === 'afterimage' ? S3.seq(lt, [[0, P().ready], [0.5, P().windup, 'out'], [0.8, P().chop, 'in'], [1.6, P().ready]]) : {}) };
        const tint = kind === 'freeze' ? '#9ad8ff' : kind === 'flame' ? '#a8c0ff' : undefined;
        render(t, cam, castWith(t, { [ally]: { pose, o: { expr: { angry: 0.5 }, weapon: true } }, [o.foe]: { o: { tint: k > 0.5 ? tint : undefined, shake: kind === 'freeze' && k > 0.5 ? 0 : k * 0.4, flash: kind === 'afterimage' && ((lt > 0.8 && lt < 0.9) || (lt > 1.15 && lt < 1.25)) ? 1 : 0 } } }));
        const [fx, fy] = proj([F0[0], fh * 0.5, F0[1]]);
        if (kind === 'threads') { const h = S3.jointPos(ally, 'handR'); for (let i = 0; i < 5; i++) { const b = [F0[0] + (i - 2) * 0.4, fh * (0.2 + i * 0.15), F0[1]]; const a = proj(h), bb = proj([lerp(h[0], b[0], k), lerp(h[1], b[1], k), lerp(h[2], b[2], k)]); const c = G.ctx; c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; [[10, 'rgba(255,30,50,0.2)'], [4, 'rgba(255,60,80,0.6)'], [1.5, 'rgba(255,230,230,1)']].forEach(([lw, col]) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2 + 30, bb[0], bb[1]); c.stroke(); }); c.restore(); } }
        if (kind === 'afterimage' && lt > 0.8) { [0.8, 1.15].forEach(h0 => { if (lt > h0) X.slash(lt - h0, { x: fx, y: fy, r: 260, a0: -2.2, a1: 0.6, dur: 0.18, hold: 0.25, w: 60, color: '#bcd4ff', flat: 0.8 }); }); }
        if (kind === 'flame' && k > 0) { X.aura(t, { x: fx, y: fy + 40, w: 260 * (fh / 3), h: 360 * (fh / 3), n: 70, a: k, color: '#5ab0ff' }); G.radial(fx, fy, 300, 'rgba(90,170,255,' + (0.35 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); }
        if (kind === 'freeze' && k > 0) { G.fill('#a0d8ff', 0.12 * k, 'screen'); G.radial(fx, fy, 260, 'rgba(200,240,255,' + (0.4 * k).toFixed(2) + ')', 'rgba(0,0,0,0)', 1, 'lighter'); G.txt('3', fx + 120, fy - 140, { font: '800 60px ' + G.FONT.disp, fill: '#d8f4ff', a: k * (Math.floor(lt * 2) % 2 ? 1 : 0.6) }); }
      },
    };

    /* ---------- interpreter ---------- */
    SC.lastPartner = {};
    function lineShot(who, text, o, pending) {
      const silent = text.trim() === '...', id = silent ? null : (o.id || nextId()), actor = o.on || ACTOR[who];
      let dur = 0; if (!silent) { const p0 = V.place(-999, id); dur = p0.dur; V.placed.pop(); }
      const onScreen = actor && SC.marks[actor] && !SC.marks[actor].hidden;
      const partner = o.to ? o.to : SC.prevSpeaker && SC.prevSpeaker !== actor ? SC.prevSpeaker : Object.keys(SC.marks).find(k => k !== actor && !SC.marks[k].hidden && k !== 'tofu');
      if (onScreen && partner) { SC.lastPartner[actor] = partner; SC.lastPartner[partner] = actor; }
      // choose the framing
      let kind = o.shot;
      if (!kind) {
        const nOn = Object.keys(SC.marks).filter(k => !SC.marks[k].hidden && k !== 'tofu').length;
        if (!onScreen) kind = SC.count % 3 === 0 ? 'wide' : 'react';
        else if (SC.count === 0) kind = nOn > 2 ? 'wide' : 'two';
        else if (SC.pairShots >= 5 && nOn > 1) { kind = nOn > 2 ? 'wide' : 'two'; SC.pairShots = 0; }
        else if (actor !== SC.prevSpeaker) kind = (hash(lineNo, 4) > 0.45 ? 'ots' : 'cu');
        else kind = SC.lastShot === 'cu' ? 'mcu' : 'cu';
        if (o.emote === 'angry' && onScreen && hash(lineNo, 8) > 0.5) kind = 'low';
      }
      SC.pairShots++; SC.count++; SC.lastShot = kind; if (onScreen) SC.prevSpeaker = actor;
      const pre = o.pre ?? 0.45, post = o.post ?? 0.6 + (spec.pace || 0), d = Math.max(o.min || 0, pre + dur + post), seed = lineNo;
      const splitReact = !o.noReact && onScreen && partner && dur > 3.4 && (kind === 'cu' || kind === 'mcu') && hash(seed, 6) > 0.4;
      const style = kind === 'two' || kind === 'wide' ? 'drift' : hash(seed, 3) > 0.5 ? 'push' : 'still';
      const emo = {}; if (o.emote && actor) emo[actor] = { emote: o.emote }; if (o.react && partner) emo[partner] = { emote: o.react };
      const st = snap(), cutAt = d * 0.68;
      const draw = (lt, dd, t) => {
        const leave = enter(st);
        let a = actor, b = partner, k2 = kind;
        if (k2 === 'react' || (splitReact && lt > cutAt)) { a = partner || Object.keys(SC.marks)[0]; b = actor && SC.marks[actor] ? actor : null; k2 = 'cu'; }
        if (!a || !SC.marks[a]) { a = Object.keys(SC.marks).find(x => !SC.marks[x].hidden); k2 = 'wide'; }
        const cam = inSet(moveCam(frameFor(k2, a, b, t), splitReact && lt > cutAt ? lt - cutAt : lt, splitReact ? (lt > cutAt ? dd - cutAt : cutAt) : dd, style, seed));
        const focus = {}; if (actor && partner) { focus[actor] = partner; focus[partner] = actor; }
        render(t, cam, castList(t, focus, emo), o.after ? (tt) => o.after(lt, dd, tt) : null);
        if (o.overlay) o.overlay(lt, dd, t);
        leave();
      };
      shot(d, draw, { say: silent ? [] : [[pre, id]], tail: post, sfx: o.sfx });
    }
    function estShot(d, path, o = {}) {
      const st = snap();
      shot(d, (lt, dd, t) => { const leave = enter(st); const k = ease.io(clamp((lt - 0.3) / Math.max(0.6, dd - 0.6))); const cam = { pos: V3a(path[0], path[2], k), look: V3a(path[1], path[3], k), fov: lerp(path[4] || 34, path[5] || path[4] || 34, k) };
        render(t, cam, castList(t), null); if (o.card) G.locationCard(lt - 0.6, Math.min(5, dd - 1), o.card[0], o.card[1]); if (o.fadeIn) G.fill('#000', 1 - inv(0, o.fadeIn, lt)); if (o.fadeOut) G.fill('#000', inv(dd - o.fadeOut, dd, lt)); if (o.overlay) o.overlay(lt, dd, t); leave(); }, { say: o.say, sfx: o.sfx });
    }
    function walkShot(who, to, d, o = {}) {
      const m = SC.marks[who], from = [m.x, m.z], marks = { ...SC.marks }; Object.keys(marks).forEach(k => { marks[k] = { ...marks[k] }; });
      const ry = Math.atan2(to[0] - from[0], to[1] - from[1]), side = SC.side, others = (o.with || []), st = { ...snap(), marks };
      shot(d, (lt, dd, t) => {
        const leave = enter(st); const k = clamp(lt / dd);
        const pos = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)]; marks[who].x = pos[0]; marks[who].z = pos[1]; marks[who].ry = ry; marks[who].pose = { ...S3.walk(t * 5.2, 1), ...(who === 'takuto' ? { uaR: IDLE.takuto.uaR, elR: IDLE.takuto.elR } : {}), ...(who === 'sieg' ? { uaL: IDLE.sieg.uaL, elL: IDLE.sieg.elL } : {}) };
        others.forEach(([ow, off], i) => { marks[ow].x = pos[0] + off[0]; marks[ow].z = pos[1] + off[1]; marks[ow].ry = ry; marks[ow].pose = { ...S3.walk(t * 5.2 + 1 + i, 1), ...(ow === 'takuto' ? { uaR: IDLE.takuto.uaR, elR: IDLE.takuto.elR } : {}), ...(ow === 'sieg' ? { uaL: IDLE.sieg.uaL, elL: IDLE.sieg.elL } : {}) }; });
        const fx = Math.sin(ry), fz = Math.cos(ry), nx = -fz * side, nz = fx * side, dist = o.dist || 4.2;
        const cam = { pos: [pos[0] + nx * dist + fx * (o.lead ?? 1.2), 1.35, pos[1] + nz * dist + fz * (o.lead ?? 1.2)], look: [pos[0] + fx * 0.6, 1.15, pos[1] + fz * 0.6], fov: 32 };
        if (o.behind) { cam.pos = [pos[0] - fx * 3.4 + nx * 0.9, 1.7, pos[1] - fz * 3.4 + nz * 0.9]; cam.look = [pos[0] + fx * 4, 1.3, pos[1] + fz * 4]; }
        render(t, cam, castList(t).map(c => c[0] === who || others.some(([ow]) => ow === c[0]) ? [c[0], marks[c[0]].pose ? { ...c[1], ...marks[c[0]].pose, x: marks[c[0]].x, z: marks[c[0]].z, ry: marks[c[0]].ry } : c[1], { ...c[2], vx: 1 }] : c), null);
        if (o.overlay) o.overlay(lt, dd, t); leave();
      }, { say: o.say, sfx: [[0.1, (g, w) => { for (let s2 = 0; s2 < d; s2 += 0.48) S.step(g, w + s2, 0.05); }], ...(o.sfx || [])] });
      SC.marks = { ...SC.marks, [who]: { ...SC.marks[who], x: to[0], z: to[1], ry, pose: null } }; others.forEach(([ow, off]) => { SC.marks = { ...SC.marks, [ow]: { ...SC.marks[ow], x: to[0] + off[0], z: to[1] + off[1], ry, pose: null } }; });
    }
    function defaultSfx(move, d, o) {
      const hit = d * (o.at || 0.55);
      if (move === 'strike') return [[hit - 0.35, (g, w) => S.whoosh(g, w, 0.35, 0.3, 400, 3200)], [hit, (g, w) => { S.clang(g, w, 0.3); S.boom(g, w, 0.35); }]];
      if (move === 'special') return [[0, (g, w) => S.riser(g, w, d * 0.6, 0.1)], [d * 0.62, (g, w) => { S.boom(g, w, 0.7); S.shatter(g, w, 0.16, 8); S.slash(g, w, 0.4); }]];
      if (move === 'foeAttack') return [[d * 0.3, (g, w) => S.riftRoar(g, w, 1.2, 0.2)], [d * 0.42, (g, w) => S.whoosh(g, w, 0.45, 0.3, 1400, 300)], ...(o.hit ? [[d * 0.42, (g, w) => { S.boom(g, w, 0.5); S.thud(g, w + 0.1, 0.4); }]] : [])];
      if (move === 'standoff' && o.roar) return [[d * 0.5, (g, w) => { S.riftRoar(g, w, 1.6, 0.28); S.boom(g, w, 0.3); }]];
      if (move === 'charge') return [[0.1, (g, w) => { for (let s2 = 0; s2 < d; s2 += 0.26) S.step(g, w + s2, 0.1); }]];
      if (move === 'ally') return [[0.4, (g, w) => S.whoosh(g, w, 0.6, 0.2, 600, 2400)], [0.8, (g, w) => S.clang(g, w, 0.15)]];
      return [];
    }
    function runScene(sc, custom) {
      if (sc.borrow) { if (sc.chapter) chapter(sc.chapter); borrow(sc.from || EP01, sc.borrow[0], sc.borrow[1]); return; } // a stretch of another episode, as it was
      const t0 = T;
      SC.env = sc.env; SC.envOpts = sc.envOpts || {}; SC.mood = sc.mood || 'day'; SC.side = sc.side || 1; SC.count = 0; SC.pairShots = 0; SC.prevSpeaker = null; SC.handheld = !!sc.handheld; SC.wideDir = sc.wideDir || [0, 1]; SC.overlay = sc.overlay || null; SC.lastPartner = {};
      SC.marks = {}; Object.entries(sc.cast || {}).forEach(([k, v]) => { SC.marks[k] = { x: v[0], z: v[1], ry: v[2] ?? 0, ...(v[3] || {}) }; });
      if (sc.chapter) chapter(sc.chapter);
      (sc.beats || []).forEach(bt => {
        const [kind] = bt;
        if (WHO[kind]) { const o = bt[2] || {}; lineShot(WHO[kind], bt[1], o); return; }
        if (kind === 'est') return estShot(bt[1], bt[2], bt[3] || {});
        if (kind === 'plate') { const lines = (bt[4] || []).map(([a, w2, txt, lo]) => [a, (lo && lo.id) || nextId()]); return plateShot(bt[1], bt[2], { ...(bt[3] || {}), say: lines.length ? lines : (bt[3] || {}).say }); }
        if (kind === 'fight') { const st = snap(), mv = MOVES[bt[1]], o = bt[3] || {}; const lines = (bt[4] || []).map(([a, w2, txt, lo]) => [a, (lo && lo.id) || nextId()]); shot(bt[2], (lt, dd, t) => { const leave = enter(st); mv(lt, dd, t, o); postFor(SC.mood); leave(); }, { say: lines, sfx: bt[5] || defaultSfx(bt[1], bt[2], o) }); return; }
        if (kind === 'walk') return walkShot(bt[1], bt[2], bt[3], bt[4] || {});
        if (kind === 'set') { const [, who, v] = bt; SC.marks = { ...SC.marks, [who]: { ...(SC.marks[who] || {}), ...v } }; return; }
        if (kind === 'hide') { SC.marks = { ...SC.marks, [bt[1]]: { ...SC.marks[bt[1]], hidden: true } }; return; }
        if (kind === 'show') { SC.marks = { ...SC.marks, [bt[1]]: { ...SC.marks[bt[1]], hidden: false } }; return; }
        if (kind === 'side') { SC.side = bt[1]; return; }
        if (kind === 'custom') { const fn = custom[bt[1]]; const st = snap(); const lines = (bt[3] || []).map(([a, w2, txt, lo]) => { const id = (lo && lo.id) || nextId(); return [a, id]; });
          shot(bt[2], (lt, dd, t) => { const leave = enter(st); fn(lt, dd, t, API); leave(); }, { say: lines, sfx: bt[4], tag: 'custom:' + bt[1] }); return; }
      });
      const dur = T - t0;
      music(sc.music, t0, dur); ambience(sc.ambience || sc.env, t0, dur, sc.mood);
    }
    const API = { render: (t, cam, cast, after, under) => render(t, cam, cast, after, under), castList, marks: () => SC.marks, frameFor, headAt, S3, G, X, POST, V, postFor: () => postFor(SC.mood) };

    // assemble: cold open, opening, title card, Part A, eyecatch, Part B, ending, preview
    const custom = spec.custom || {};
    if (spec.coldOpen) { chapter('Cold open'); spec.coldOpen.forEach(sc => runScene(sc, custom)); }
    if (spec.borrow && spec.borrow.opening) { chapter('Opening'); const b = spec.borrow.opening; borrow(b.ep, b.t0, b.t1); }
    const tc = spec.title; shot(6.2, (lt, d) => { G.fill('#050406'); const a = inv(0.3, 1.2, lt) * (1 - inv(d - 1, d, lt));
      G.txt(tc.jpNo, 640, 250, { font: '400 30px ' + G.FONT.jp, fill: '#e8343c', a, ls: 8 }); G.txt(tc.jp, 640, 400, { font: '400 150px ' + G.FONT.jp, fill: '#f4efe9', a, ls: 20 });
      G.ctx.save(); G.ctx.globalAlpha = a; G.ctx.fillStyle = '#e8343c'; G.ctx.fillRect(560, 446, 160 * ease.out(inv(0.6, 1.6, lt)), 2); G.ctx.restore();
      G.txt('EPISODE ' + spec.number, 640, 492, { font: '700 15px ' + G.FONT.sub, fill: '#bdb6b0', a, ls: 8 }); G.txt(tc.en, 640, 540, { font: '800 40px ' + G.FONT.disp, fill: '#f4efe9', a, ls: 12 }); }, { vig: false, sfx: [[0.6, (g, w) => S.kan(g, w, 0.09)], [1.1, (g, w) => S.kan(g, w, 0.07)]] });
    (spec.partA || []).forEach((sc, i) => runScene(i ? sc : { chapter: 'Part A', ...sc }, custom));
    if (spec.borrow && spec.borrow.eyecatch) { const b = spec.borrow.eyecatch; borrow(b.ep, b.t0, b.t1); }
    (spec.partB || []).forEach((sc, i) => runScene(i ? sc : { chapter: 'Part B', ...sc }, custom));
    if (spec.borrow && spec.borrow.ending) { chapter('Ending'); const b = spec.borrow.ending; borrow(b.ep, b.t0, b.t1); }
    if (spec.postCredits) { chapter('After the credits'); spec.postCredits.forEach(sc => runScene(sc, custom)); }
    if (spec.preview) { chapter('Next episode'); spec.preview.forEach(sc => runScene(sc, custom)); }
    shot(3, (lt) => { G.fill('#000'); G.logo(640, 380, 0.5, 1, { a: 1 - inv(1.6, 3, lt) }); }, { vig: false });
    ev.sort((a, b) => a.t - b.t);
    return { shots, subs, ev, chapters, duration: T };
  }

  // every spoken line of an episode script, in order, for the voice generator
  function lines(spec) {
    const out = []; let k = 0; const id = () => spec.id + '_' + String(++k).padStart(3, '0');
    const scan = scs => (scs || []).forEach(sc => (sc.beats || []).forEach(bt => {
      if (WHO[bt[0]] && bt[1].trim() !== '...') out.push({ id: (bt[2] && bt[2].id) || id(), who: WHO[bt[0]], text: bt[1], tts: bt[2] && bt[2].tts });
      if (bt[0] === 'custom') (bt[3] || []).forEach(([a, w2, txt, lo]) => out.push({ id: (lo && lo.id) || id(), who: WHO[w2], text: txt, tts: lo && lo.tts }));
      if (bt[0] === 'plate') (bt[4] || []).forEach(([a, w2, txt, lo]) => out.push({ id: (lo && lo.id) || id(), who: WHO[w2], text: txt, tts: lo && lo.tts }));
      if (bt[0] === 'fight') (bt[4] || []).forEach(([a, w2, txt, lo]) => out.push({ id: (lo && lo.id) || id(), who: WHO[w2], text: txt, tts: lo && lo.tts }));
    }));
    // the build numbers lines in the order it meets them: cold open, A, B, preview (est/walk "say" lines are custom-only)
    scan(spec.coldOpen); scan(spec.partA); scan(spec.partB); scan(spec.postCredits); scan(spec.preview);
    return out;
  }
  function episode(script, custom) {
    const op = EP01.chapters.find(c => c.name === 'Opening'), pB = EP01.chapters.find(c => c.name === 'Part B'), ed = EP01.chapters.find(c => c.name === 'Ending'), after = EP01.chapters.find(c => c.name === 'After the credits');
    const opEnd = EP01.shots.find(s => s.t0 > op.t + 1 && s.d > 6 && s.d < 6.5).t0;
    return build({ ...script, custom: custom || {}, borrow: { opening: { ep: EP01, t0: op.t, t1: opEnd }, eyecatch: { ep: EP01, t0: pB.t - 8, t1: pB.t }, ending: { ep: EP01, t0: ed.t, t1: after.t } } });
  }
  return { build, lines, episode, WHO };
})();
if (typeof module !== 'undefined') module.exports = DIRECTOR;
