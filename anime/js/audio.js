/* RUINBREAKER — procedural score + sound design (Web Audio, no audio files).
   Everything is scheduled from a flat, time-sorted event list so the episode can
   be paused, seeked, or rendered offline deterministically. */
'use strict';

const SND = (() => {
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const NOTE = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  const n = s => { const m = /^([A-G][b#]?)(-?\d)$/.exec(s); return mtof(NOTE[m[1]] + (parseInt(m[2]) + 1) * 12); };

  // deterministic PRNG so offline renders match live playback
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- per-context shared resources ---------- */
  const shared = new WeakMap();
  function res(ac) {
    let r = shared.get(ac); if (r) return r;
    r = {};
    const len = ac.sampleRate * 2;
    r.noise = ac.createBuffer(2, len, ac.sampleRate);
    const R = rng(7);
    for (let c = 0; c < 2; c++) { const d = r.noise.getChannelData(c); for (let i = 0; i < len; i++) d[i] = R() * 2 - 1; }
    // brown-ish noise for rumble / rain body
    r.brown = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = r.brown.getChannelData(c); let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (R() * 2 - 1)) / 1.02; d[i] = last * 3.5; } }
    // reverb impulse
    const il = Math.floor(ac.sampleRate * 3.2);
    r.ir = ac.createBuffer(2, il, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = r.ir.getChannelData(c); for (let i = 0; i < il; i++) { const t = i / il; d[i] = (R() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 80 ? i / 80 : 1); } }
    // distortion curves
    const mk = k => { const c = new Float32Array(2048); for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } return c; };
    r.dist = mk(9); r.soft = mk(2.5);
    shared.set(ac, r); return r;
  }

  /* ---------- graph for one playback session ---------- */
  function makeGraph(ac, dest) {
    const r = res(ac);
    const out = ac.createGain(); out.gain.value = 1; out.connect(dest);
    const rev = ac.createConvolver(); rev.buffer = r.ir; const revG = ac.createGain(); revG.gain.value = 0.55; rev.connect(revG); revG.connect(out);
    const mk = v => { const g = ac.createGain(); g.gain.value = v; g.connect(out); return g; };
    const G = { ac, r, out, rev, music: mk(0.62), sfx: mk(0.9), amb: mk(0.55), voice: mk(0.8) };
    G.send = (node, amt) => { if (amt > 0) { const s = ac.createGain(); s.gain.value = amt; node.connect(s); s.connect(rev); } };
    return G;
  }

  /* ---------- building blocks ---------- */
  function osc(G, type, f, w) { const o = G.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, w); return o; }
  function noiseSrc(G, w, brown) { const s = G.ac.createBufferSource(); s.buffer = brown ? G.r.brown : G.r.noise; s.loop = true; s.loopStart = 0; return s; }
  function filt(G, type, f, q) { const b = G.ac.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  function gain(G, v) { const g = G.ac.createGain(); g.gain.value = v; return g; }
  function adsr(g, w, a, peak, d, sus, end, rel) {
    const p = g.gain; p.setValueAtTime(0.0001, w); p.linearRampToValueAtTime(peak, w + a);
    p.setTargetAtTime(sus, w + a, d / 3);
    p.setValueAtTime(sus, end); p.setTargetAtTime(0.0001, end, rel / 4);
  }
  const bus = (G, b) => G[b || 'music'];

  /* ---------- instruments ---------- */
  function piano(G, w, f, len, vel = 0.5, b = 'music', rv = 0.35) {
    const g = gain(G, 0), lp = filt(G, 'lowpass', Math.min(9000, f * 7), 0.4);
    const o1 = osc(G, 'sine', f, w), o2 = osc(G, 'triangle', f * 2.001, w), o3 = osc(G, 'sine', f * 3.003, w);
    const g2 = gain(G, 0.16), g3 = gain(G, 0.05);
    o1.connect(lp); o2.connect(g2); g2.connect(lp); o3.connect(g3); g3.connect(lp); lp.connect(g);
    const pk = 0.32 * vel, dec = Math.max(0.5, 2.6 - f / 900);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(pk, w + 0.005);
    g.gain.setTargetAtTime(pk * 0.35, w + 0.005, 0.12); g.gain.setTargetAtTime(0.0001, w + 0.15, dec / 3);
    g.gain.setTargetAtTime(0.0001, w + len, 0.08);
    g.connect(bus(G, b)); G.send(g, rv);
    const e = w + len + 1.2; [o1, o2, o3].forEach(o => { o.start(w); o.stop(e); });
  }
  function pad(G, w, f, len, o = {}) {
    const { vol = 0.06, type = 'sawtooth', cut = 1300, att = 1.0, rel = 1.6, det = 9, b = 'music', rv = 0.5, trem = 0 } = o;
    const g = gain(G, 0), lp = filt(G, 'lowpass', cut, 0.6);
    const os = [-det, det, 0].map((d, i) => { const x = osc(G, i === 2 ? 'triangle' : type, f, w); x.detune.value = d; x.connect(lp); return x; });
    let out = g;
    lp.connect(g);
    if (trem) { const tg = gain(G, 1), l = osc(G, 'sine', trem, w), lg = gain(G, 0.45); l.connect(lg); lg.connect(tg.gain); g.connect(tg); out = tg; l.start(w); l.stop(w + len + rel + 0.5); }
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + att);
    g.gain.setValueAtTime(vol, w + Math.max(att, len)); g.gain.linearRampToValueAtTime(0.0001, w + Math.max(att, len) + rel);
    out.connect(bus(G, b)); G.send(out, rv);
    os.forEach(x => { x.start(w); x.stop(w + Math.max(att, len) + rel + 0.1); });
  }
  function choir(G, w, f, len, vol = 0.05, att = 0.9, rel = 1.8) {
    const g = gain(G, 0), sum = gain(G, 1);
    const vib = osc(G, 'sine', 5.1, w), vg = gain(G, 7); vib.connect(vg);
    const os = [-7, 0, 6].map(d => { const x = osc(G, 'sawtooth', f, w); x.detune.value = d; vg.connect(x.detune); x.connect(sum); return x; });
    [[700, 9, 1], [1150, 10, 0.55], [2600, 12, 0.22], [350, 3, 0.4]].forEach(([fr, q, gg]) => { const bp = filt(G, 'bandpass', fr, q), bg = gain(G, gg * 2.2); sum.connect(bp); bp.connect(bg); bg.connect(g); });
    const end = w + Math.max(att, len);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + att); g.gain.setValueAtTime(vol, end); g.gain.linearRampToValueAtTime(0.0001, end + rel);
    g.connect(G.music); G.send(g, 0.8);
    [...os, vib].forEach(x => { x.start(w); x.stop(end + rel + 0.1); });
  }
  function brass(G, w, f, len, vol = 0.09, rv = 0.45) {
    const g = gain(G, 0), lp = filt(G, 'lowpass', 300, 1.2);
    const os = [-6, 5].map(d => { const x = osc(G, 'sawtooth', f, w); x.detune.value = d; x.connect(lp); return x; });
    lp.frequency.setValueAtTime(260, w); lp.frequency.exponentialRampToValueAtTime(2600, w + 0.09); lp.frequency.setTargetAtTime(1500, w + 0.1, 0.2);
    lp.connect(g);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.05); g.gain.setTargetAtTime(vol * 0.8, w + 0.05, 0.2);
    g.gain.setValueAtTime(vol * 0.8, w + len); g.gain.setTargetAtTime(0.0001, w + len, 0.09);
    g.connect(G.music); G.send(g, rv);
    os.forEach(x => { x.start(w); x.stop(w + len + 0.6); });
  }
  function bass(G, w, f, len, vol = 0.16) {
    const g = gain(G, 0), lp = filt(G, 'lowpass', 900, 2);
    const a = osc(G, 'sawtooth', f, w), s = osc(G, 'sine', f, w), sg = gain(G, 0.9);
    a.connect(lp); s.connect(sg); sg.connect(g); lp.connect(g);
    lp.frequency.setValueAtTime(1100, w); lp.frequency.setTargetAtTime(280, w, 0.08);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.006); g.gain.setTargetAtTime(vol * 0.6, w + 0.01, 0.15);
    g.gain.setValueAtTime(vol * 0.6, w + len); g.gain.setTargetAtTime(0.0001, w + len, 0.03);
    g.connect(G.music);
    [a, s].forEach(x => { x.start(w); x.stop(w + len + 0.3); });
  }
  function guitar(G, w, fs, len, vol = 0.08, mute = false) {
    const sum = gain(G, 1), sh = G.ac.createWaveShaper(); sh.curve = G.r.dist; sh.oversample = '2x';
    const hp = filt(G, 'highpass', 90, 0.7), lp = filt(G, 'lowpass', mute ? 1300 : 3600, 0.8), pk = filt(G, 'peaking', 2400, 1); pk.gain.value = 3;
    const g = gain(G, 0);
    const os = [];
    fs.forEach(f => [-11, 9].forEach(d => { const x = osc(G, 'sawtooth', f, w); x.detune.value = d; x.connect(sum); os.push(x); }));
    sum.gain.value = 0.55; sum.connect(sh); sh.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(g);
    const end = w + len;
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.004);
    if (mute) g.gain.setTargetAtTime(0.0001, w + 0.02, 0.05);
    else { g.gain.setTargetAtTime(vol * 0.7, w + 0.01, 0.3); g.gain.setValueAtTime(vol * 0.7, end); g.gain.setTargetAtTime(0.0001, end, 0.05); }
    g.connect(G.music); G.send(g, 0.12);
    os.forEach(x => { x.start(w); x.stop(end + 0.4); });
  }
  function lead(G, w, f, len, vol = 0.055, prevF = 0) {
    const g = gain(G, 0), lp = filt(G, 'lowpass', 3200, 1);
    const a = osc(G, 'sawtooth', prevF || f, w), b = osc(G, 'square', prevF || f, w); b.detune.value = 8;
    if (prevF) { a.frequency.exponentialRampToValueAtTime(f, w + 0.05); b.frequency.exponentialRampToValueAtTime(f, w + 0.05); }
    const vib = osc(G, 'sine', 5.6, w), vg = gain(G, 0); vib.connect(vg); vg.connect(a.detune); vg.connect(b.detune);
    vg.gain.setValueAtTime(0, w); vg.gain.linearRampToValueAtTime(14, w + Math.min(0.5, len));
    const bg = gain(G, 0.5); b.connect(bg); a.connect(lp); bg.connect(lp); lp.connect(g);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.015); g.gain.setValueAtTime(vol, w + len); g.gain.setTargetAtTime(0.0001, w + len, 0.06);
    g.connect(G.music); G.send(g, 0.4);
    [a, b, vib].forEach(x => { x.start(w); x.stop(w + len + 0.5); });
  }
  function pluck(G, w, f, vol = 0.12, b = 'music') {
    const g = gain(G, 0), lp = filt(G, 'lowpass', f * 4, 1);
    const o = osc(G, 'triangle', f, w); o.connect(lp); lp.connect(g);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.003); g.gain.setTargetAtTime(0.0001, w + 0.004, 0.09);
    g.connect(bus(G, b)); G.send(g, 0.3);
    o.start(w); o.stop(w + 0.7);
  }
  function bell(G, w, f, vol = 0.08, dec = 2.2, b = 'music') {
    [[1, 1], [2.76, 0.35], [5.4, 0.15], [8.93, 0.06]].forEach(([m, a]) => {
      const g = gain(G, 0), o = osc(G, 'sine', f * m, w);
      o.connect(g); g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol * a, w + 0.002); g.gain.setTargetAtTime(0.0001, w + 0.003, dec / (m * 1.3));
      g.connect(bus(G, b)); G.send(g, 0.5); o.start(w); o.stop(w + dec * 2);
    });
  }

  /* ---------- drums ---------- */
  function kick(G, w, vol = 0.5, b = 'music') {
    const o = osc(G, 'sine', 150, w), g = gain(G, 0);
    o.frequency.setValueAtTime(155, w); o.frequency.exponentialRampToValueAtTime(42, w + 0.12);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.42);
    o.connect(g); g.connect(bus(G, b)); o.start(w); o.stop(w + 0.5);
    const nz = noiseSrc(G, w), hp = filt(G, 'highpass', 3000), ng = gain(G, 0);
    ng.gain.setValueAtTime(vol * 0.25, w); ng.gain.exponentialRampToValueAtTime(0.0001, w + 0.012);
    nz.connect(hp); hp.connect(ng); ng.connect(bus(G, b)); nz.start(w); nz.stop(w + 0.03);
  }
  function snare(G, w, vol = 0.25) {
    const nz = noiseSrc(G, w), bp = filt(G, 'bandpass', 2000, 0.6), g = gain(G, 0);
    g.gain.setValueAtTime(vol, w); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.2);
    nz.connect(bp); bp.connect(g); g.connect(G.music); G.send(g, 0.2); nz.start(w, (w * 7.31) % 1.5); nz.stop(w + 0.25);
    const o = osc(G, 'triangle', 190, w), og = gain(G, 0); o.frequency.exponentialRampToValueAtTime(150, w + 0.08);
    og.gain.setValueAtTime(vol * 0.8, w); og.gain.exponentialRampToValueAtTime(0.0001, w + 0.1);
    o.connect(og); og.connect(G.music); o.start(w); o.stop(w + 0.15);
  }
  function hat(G, w, vol = 0.06, open = false) {
    const nz = noiseSrc(G, w), hp = filt(G, 'highpass', 7500), g = gain(G, 0);
    g.gain.setValueAtTime(vol, w); g.gain.exponentialRampToValueAtTime(0.0001, w + (open ? 0.28 : 0.045));
    nz.connect(hp); hp.connect(g); g.connect(G.music); nz.start(w, (w * 13.37) % 1.5); nz.stop(w + 0.35);
  }
  function crash(G, w, vol = 0.12, b = 'music') {
    const nz = noiseSrc(G, w), hp = filt(G, 'highpass', 4200), g = gain(G, 0);
    g.gain.setValueAtTime(vol, w); g.gain.setTargetAtTime(0.0001, w + 0.01, 0.55);
    nz.connect(hp); hp.connect(g); g.connect(bus(G, b)); G.send(g, 0.4); nz.start(w); nz.stop(w + 3);
  }
  function taiko(G, w, vol = 0.45, b = 'music') {
    const o = osc(G, 'sine', 120, w), g = gain(G, 0);
    o.frequency.exponentialRampToValueAtTime(52, w + 0.25);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.9);
    o.connect(g); g.connect(bus(G, b)); G.send(g, 0.35); o.start(w); o.stop(w + 1);
    const nz = noiseSrc(G, w, true), lp = filt(G, 'lowpass', 600), ng = gain(G, 0);
    ng.gain.setValueAtTime(vol * 0.9, w); ng.gain.exponentialRampToValueAtTime(0.0001, w + 0.2);
    nz.connect(lp); lp.connect(ng); ng.connect(bus(G, b)); nz.start(w); nz.stop(w + 0.3);
  }

  /* ---------- sound effects ---------- */
  function kan(G, w, vol = 0.12) { // railway crossing bell
    [[760, 1, 0.38], [2093, 0.42, 0.22], [3910, 0.18, 0.12], [5230, 0.07, 0.08]].forEach(([f, a, d]) => {
      const o = osc(G, 'sine', f, w), g = gain(G, 0);
      g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol * a, w + 0.0015); g.gain.setTargetAtTime(0.0001, w + 0.002, d / 3);
      o.connect(g); g.connect(G.sfx); G.send(g, 0.25); o.start(w); o.stop(w + d * 2 + 0.2);
    });
  }
  function noiseBed(G, w, off, dur, o) { // long looping filtered noise (rain / wind / rumble / drone)
    const { vol = 0.1, hp = 0, lp = 8000, bp = 0, q = 0.7, brown = false, fin = 1.2, fout = 1.6, b = 'amb', lfo = 0, lfoDepth = 0, rv = 0 } = o;
    const s = noiseSrc(G, w, brown); let node = s;
    if (hp) { const f = filt(G, 'highpass', hp, 0.5); node.connect(f); node = f; }
    if (lp) { const f = filt(G, 'lowpass', lp, 0.5); node.connect(f); node = f; }
    let bpf = null; if (bp) { bpf = filt(G, 'bandpass', bp, q); node.connect(bpf); node = bpf; }
    const g = gain(G, 0); node.connect(g);
    const remain = dur - off; if (remain <= 0) return;
    const a = Math.max(0.01, fin - off);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + a);
    g.gain.setValueAtTime(vol, w + Math.max(a, remain - fout)); g.gain.linearRampToValueAtTime(0.0001, w + remain);
    if (lfo && bpf) { const l = osc(G, 'sine', lfo, w), lg = gain(G, lfoDepth); l.connect(lg); lg.connect(bpf.frequency); l.start(w); l.stop(w + remain + 0.1); }
    g.connect(bus(G, b)); G.send(g, rv);
    s.start(w, (off * 0.731) % 1.9); s.stop(w + remain + 0.1);
  }
  function thud(G, w, vol = 0.4) {
    const o = osc(G, 'sine', 95, w), g = gain(G, 0); o.frequency.exponentialRampToValueAtTime(38, w + 0.28);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.5);
    o.connect(g); g.connect(G.sfx); o.start(w); o.stop(w + 0.6);
    const nz = noiseSrc(G, w, true), lp = filt(G, 'lowpass', 500), ng = gain(G, 0);
    ng.gain.setValueAtTime(vol, w); ng.gain.exponentialRampToValueAtTime(0.0001, w + 0.25);
    nz.connect(lp); lp.connect(ng); ng.connect(G.sfx); G.send(ng, 0.2); nz.start(w); nz.stop(w + 0.3);
  }
  function boom(G, w, vol = 0.6) {
    const o = osc(G, 'sine', 75, w), g = gain(G, 0), sh = G.ac.createWaveShaper(); sh.curve = G.r.soft;
    o.frequency.exponentialRampToValueAtTime(26, w + 1.1);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, w + 1.6);
    o.connect(sh); sh.connect(g); g.connect(G.sfx); o.start(w); o.stop(w + 1.7);
    const nz = noiseSrc(G, w, true), lp = filt(G, 'lowpass', 900), ng = gain(G, 0);
    lp.frequency.setValueAtTime(1600, w); lp.frequency.exponentialRampToValueAtTime(120, w + 0.9);
    ng.gain.setValueAtTime(vol * 1.1, w); ng.gain.exponentialRampToValueAtTime(0.0001, w + 1.2);
    nz.connect(lp); lp.connect(ng); ng.connect(G.sfx); G.send(ng, 0.35); nz.start(w); nz.stop(w + 1.3);
  }
  function clang(G, w, vol = 0.3) {
    [[430, 1, 1.4], [1093, 0.6, 1.0], [1967, 0.45, 0.8], [2851, 0.3, 0.6], [4130, 0.2, 0.4], [5390, 0.12, 0.3]].forEach(([f, a, d]) => {
      const o = osc(G, 'sine', f, w), g = gain(G, 0);
      g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol * a, w + 0.001); g.gain.setTargetAtTime(0.0001, w + 0.002, d / 4);
      o.connect(g); g.connect(G.sfx); G.send(g, 0.4); o.start(w); o.stop(w + d * 1.5);
    });
    const nz = noiseSrc(G, w), bp = filt(G, 'bandpass', 3500, 0.8), ng = gain(G, 0);
    ng.gain.setValueAtTime(vol * 1.2, w); ng.gain.exponentialRampToValueAtTime(0.0001, w + 0.06);
    nz.connect(bp); bp.connect(ng); ng.connect(G.sfx); nz.start(w); nz.stop(w + 0.1);
    thud(G, w, vol * 0.8);
  }
  function shatter(G, w, vol = 0.25, seed = 3) {
    const R = rng(seed);
    for (let i = 0; i < 46; i++) {
      const t = w + Math.pow(R(), 1.8) * 0.9, f = 2200 + R() * 6500, o = osc(G, 'sine', f, t), g = gain(G, 0);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * (0.2 + R() * 0.4), t + 0.001); g.gain.setTargetAtTime(0.0001, t + 0.002, 0.02 + R() * 0.06);
      o.connect(g); g.connect(G.sfx); G.send(g, 0.3); o.start(t); o.stop(t + 0.4);
    }
    const nz = noiseSrc(G, w), hp = filt(G, 'highpass', 2500), ng = gain(G, 0);
    ng.gain.setValueAtTime(vol * 1.3, w); ng.gain.setTargetAtTime(0.0001, w + 0.01, 0.25);
    nz.connect(hp); hp.connect(ng); ng.connect(G.sfx); G.send(ng, 0.4); nz.start(w); nz.stop(w + 1.5);
  }
  function clicks(G, w, dur, count, o = {}) { // crackle / bone rattle / static
    const { vol = 0.15, f0 = 1500, f1 = 4000, q = 3, len = 0.012, seed = 11, b = 'sfx' } = o;
    const R = rng(seed);
    for (let i = 0; i < count; i++) {
      const t = w + R() * dur, nz = noiseSrc(G, t), bp = filt(G, 'bandpass', f0 + R() * (f1 - f0), q), g = gain(G, 0), l = len * (0.5 + R());
      g.gain.setValueAtTime(vol * (0.4 + R() * 0.6), t); g.gain.exponentialRampToValueAtTime(0.0001, t + l);
      nz.connect(bp); bp.connect(g); g.connect(bus(G, b)); nz.start(t, R()); nz.stop(t + l + 0.02);
    }
  }
  function whoosh(G, w, dur = 0.5, vol = 0.25, f0 = 300, f1 = 2600) {
    const nz = noiseSrc(G, w), bp = filt(G, 'bandpass', f0, 1.1), g = gain(G, 0);
    bp.frequency.setValueAtTime(f0, w); bp.frequency.exponentialRampToValueAtTime(f1, w + dur * 0.7);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + dur * 0.6); g.gain.linearRampToValueAtTime(0.0001, w + dur);
    nz.connect(bp); bp.connect(g); g.connect(G.sfx); G.send(g, 0.15); nz.start(w, w % 1.5); nz.stop(w + dur + 0.05);
  }
  function heartbeat(G, w, vol = 0.5) {
    [0, 0.27].forEach((d, i) => {
      const t = w + d, o = osc(G, 'sine', 62, t), g = gain(G, 0), lp = filt(G, 'lowpass', 160);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * (i ? 0.7 : 1), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(lp); lp.connect(g); g.connect(G.sfx); o.start(t); o.stop(t + 0.3);
    });
  }
  function tone(G, w, f, dur, vol = 0.03, type = 'sine', b = 'sfx', fin = 0.5, fout = 0.8) {
    const o = osc(G, type, f, w), g = gain(G, 0);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + fin); g.gain.setValueAtTime(vol, w + Math.max(fin, dur - fout)); g.gain.linearRampToValueAtTime(0.0001, w + dur);
    o.connect(g); g.connect(bus(G, b)); o.start(w); o.stop(w + dur + 0.05); return o;
  }
  function riser(G, w, dur = 3, vol = 0.18) {
    const nz = noiseSrc(G, w), hp = filt(G, 'highpass', 200, 1.5), g = gain(G, 0);
    hp.frequency.setValueAtTime(150, w); hp.frequency.exponentialRampToValueAtTime(7000, w + dur);
    g.gain.setValueAtTime(0.0001, w); g.gain.exponentialRampToValueAtTime(vol, w + dur);
    nz.connect(hp); hp.connect(g); g.connect(G.sfx); G.send(g, 0.3); nz.start(w); nz.stop(w + dur + 0.02);
    const o = osc(G, 'sawtooth', 80, w), og = gain(G, 0), lp = filt(G, 'lowpass', 600);
    o.frequency.exponentialRampToValueAtTime(640, w + dur);
    og.gain.setValueAtTime(0.0001, w); og.gain.exponentialRampToValueAtTime(vol * 0.35, w + dur);
    o.connect(lp); lp.connect(og); og.connect(G.sfx); o.start(w); o.stop(w + dur + 0.02);
  }
  function horn(G, w, len = 2.2, vol = 0.12) { // train horn (two-tone chord)
    [311, 392, 466].forEach((f, i) => {
      const o = osc(G, 'sawtooth', f, w), lp = filt(G, 'lowpass', 1500, 0.8), g = gain(G, 0);
      o.detune.setValueAtTime(0, w + len * 0.5); o.detune.linearRampToValueAtTime(-90, w + len);
      g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol * (i === 2 ? 0.5 : 0.8), w + 0.12); g.gain.setValueAtTime(vol * 0.8, w + len - 0.2); g.gain.linearRampToValueAtTime(0.0001, w + len);
      o.connect(lp); lp.connect(g); g.connect(G.sfx); G.send(g, 0.35); o.start(w); o.stop(w + len + 0.1);
    });
  }
  function train(G, w, off, dur, vol = 0.35) { // freight pass-by: rumble swell + wheel clacks
    const remain = dur - off; if (remain <= 0) return;
    const nz = noiseSrc(G, w, true), lp = filt(G, 'lowpass', 220, 0.8), g = gain(G, 0);
    const mid = dur * 0.45;
    const at = t => Math.max(0, Math.min(1, 1 - Math.abs(t - mid) / (dur * 0.55)));
    g.gain.setValueAtTime(vol * at(off) + 0.0001, w);
    for (let t = off; t <= dur; t += 0.25) g.gain.linearRampToValueAtTime(vol * Math.pow(at(t), 1.3) + 0.0001, w + (t - off));
    nz.connect(lp); lp.connect(g); g.connect(G.sfx); nz.start(w); nz.stop(w + remain + 0.1);
    const R = rng(5);
    for (let t = 0.2; t < dur; t += 0.62) {
      if (t < off) continue;
      const a = Math.pow(at(t), 1.2) * vol * 1.3;
      [0, 0.11].forEach(d => {
        const tt = w + (t - off) + d, o = osc(G, 'sine', 70 + R() * 10, tt), cg = gain(G, 0);
        o.frequency.exponentialRampToValueAtTime(40, tt + 0.08);
        cg.gain.setValueAtTime(0.0001, tt); cg.gain.linearRampToValueAtTime(a, tt + 0.004); cg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12);
        o.connect(cg); cg.connect(G.sfx); o.start(tt); o.stop(tt + 0.15);
      });
    }
  }
  function meow(G, w, vol = 0.05) {
    const o = osc(G, 'sawtooth', 420, w), g = gain(G, 0), f1 = filt(G, 'bandpass', 900, 5), f2 = filt(G, 'bandpass', 2400, 6), mix = gain(G, 1);
    o.frequency.setValueAtTime(430, w); o.frequency.linearRampToValueAtTime(720, w + 0.16); o.frequency.linearRampToValueAtTime(540, w + 0.55);
    f1.frequency.setValueAtTime(700, w); f1.frequency.linearRampToValueAtTime(1300, w + 0.2); f1.frequency.linearRampToValueAtTime(800, w + 0.55);
    f2.frequency.setValueAtTime(2900, w); f2.frequency.linearRampToValueAtTime(2300, w + 0.4);
    o.connect(f1); o.connect(f2); f1.connect(mix); f2.connect(mix); mix.connect(g);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.07); g.gain.setValueAtTime(vol, w + 0.4); g.gain.linearRampToValueAtTime(0.0001, w + 0.6);
    g.connect(G.sfx); G.send(g, 0.3); o.start(w); o.stop(w + 0.65);
  }
  function clap(G, w, vol = 0.22) {
    [0, 0.012, 0.024].forEach((d, i) => {
      const t = w + d, nz = noiseSrc(G, t), bp = filt(G, 'bandpass', 1300, 0.9), g = gain(G, 0);
      g.gain.setValueAtTime(vol * (i === 2 ? 1 : 0.6), t); g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 2 ? 0.14 : 0.01));
      nz.connect(bp); bp.connect(g); g.connect(G.sfx); G.send(g, 0.4); nz.start(t, i * 0.3); nz.stop(t + 0.2);
    });
  }
  function ui(G, w, vol = 0.05) { [2200, 3300].forEach((f, i) => { const o = osc(G, 'sine', f, w + i * 0.05), g = gain(G, 0), t = w + i * 0.05; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(g); g.connect(G.sfx); G.send(g, 0.3); o.start(t); o.stop(t + 0.2); }); }
  function step(G, w, vol = 0.45) { thud(G, w, vol); clicks(G, w, 0.15, 10, { vol: vol * 0.25, f0: 500, f1: 1800, q: 1.5, len: 0.02, seed: Math.floor(w * 10) }); }
  function splash(G, w, vol = 0.12) { const nz = noiseSrc(G, w), bp = filt(G, 'bandpass', 1400, 0.9), g = gain(G, 0); g.gain.setValueAtTime(vol, w); g.gain.exponentialRampToValueAtTime(0.0001, w + 0.09); nz.connect(bp); bp.connect(g); g.connect(G.sfx); nz.start(w, w % 1); nz.stop(w + 0.12); }
  function slash(G, w, vol = 0.3) { whoosh(G, w, 0.28, vol, 500, 5000); [3100, 4700, 6900].forEach((f, i) => { const o = osc(G, 'sine', f, w + 0.15), g = gain(G, 0), t = w + 0.15; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 0.18 / (i + 1), t + 0.002); g.gain.setTargetAtTime(0.0001, t, 0.15); o.connect(g); g.connect(G.sfx); G.send(g, 0.4); o.start(t); o.stop(t + 0.8); }); }
  function crackSky(G, w, dur = 4, vol = 0.18) {
    clicks(G, w, dur, Math.floor(dur * 26), { vol, f0: 1800, f1: 7000, q: 2, len: 0.01, seed: 21 });
    const o = osc(G, 'sawtooth', 48, w), lp = filt(G, 'lowpass', 180), g = gain(G, 0);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol * 0.6, w + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, w + dur);
    o.connect(lp); lp.connect(g); g.connect(G.sfx); o.start(w); o.stop(w + dur + 0.1);
  }
  function riftRoar(G, w, dur = 4, vol = 0.4) {
    const o = osc(G, 'sawtooth', 44, w), sh = G.ac.createWaveShaper(), lp = filt(G, 'lowpass', 300, 2), g = gain(G, 0);
    sh.curve = G.r.dist; o.frequency.linearRampToValueAtTime(31, w + dur);
    g.gain.setValueAtTime(0.0001, w); g.gain.linearRampToValueAtTime(vol, w + 0.4); g.gain.setValueAtTime(vol, w + dur - 1); g.gain.linearRampToValueAtTime(0.0001, w + dur);
    o.connect(sh); sh.connect(lp); lp.connect(g); g.connect(G.sfx); G.send(g, 0.4); o.start(w); o.stop(w + dur + 0.1);
    whoosh(G, w, dur * 0.8, vol * 0.5, 2400, 160);
  }
  function staticBurst(G, w, dur = 1.2, vol = 0.12) {
    clicks(G, w, dur, Math.floor(dur * 60), { vol, f0: 2500, f1: 9000, q: 0.8, len: 0.02, seed: 33 });
    const nz = noiseSrc(G, w), bp = filt(G, 'bandpass', 4000, 0.4), g = gain(G, 0);
    for (let t = 0; t < dur; t += 0.05) g.gain.setValueAtTime(((t * 977) % 1) > 0.5 ? vol * 0.5 : 0.0001, w + t);
    g.gain.setValueAtTime(0.0001, w + dur);
    nz.connect(bp); bp.connect(g); g.connect(G.sfx); nz.start(w); nz.stop(w + dur + 0.05);
  }

  return { mtof, n, rng, res, makeGraph, piano, pad, choir, brass, bass, guitar, lead, pluck, bell, kick, snare, hat, crash, taiko,
    kan, noiseBed, thud, boom, clang, shatter, clicks, whoosh, heartbeat, tone, riser, horn, train, meow, clap, ui, step, splash, slash, crackSky, riftRoar, staticBurst };
})();
