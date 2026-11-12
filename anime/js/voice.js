/* RUINBREAKER — voice track: places recorded lines on the timeline, plays them, drives lip-sync. */
'use strict';

const VOICE = (() => {
  const L = VOICE_DATA.lines, placed = [];
  let buffer = null;
  function place(t, id) {
    const l = L[id]; if (!l) { if (VOICE_DATA.lenient) return { t, id, who: '', dur: 0, env: [], mono: false, text: '', off: 0 }; throw new Error('missing voice line ' + id); }
    const p = { t, id, who: l.who, dur: l.dur, env: l.env, mono: l.mono, text: l.text, off: l.off };
    placed.push(p); return p;
  }
  const dur = id => L[id].dur;
  // mouth/jaw opening 0..1 for a speaker at timeline time t
  function amp(who, t) {
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      if (p.who !== who || t < p.t || t >= p.t + p.dur) continue;
      const x = (t - p.t) * 30, i0 = Math.floor(x), f = x - i0, a = +p.env[i0] || 0, b = +p.env[i0 + 1] || 0;
      return Math.min(1, (a + (b - a) * f) / 9 * 1.15);
    }
    return 0;
  }
  function speaking(who, t) { return placed.some(p => p.who === who && t >= p.t - 0.1 && t < p.t + p.dur + 0.2); }
  function play(g, p, w, off) {
    if (!buffer) return;
    const ac = g.ac, src = ac.createBufferSource(), gn = ac.createGain();
    src.buffer = buffer; gn.gain.value = p.who === 'AKURO' ? 1.15 : 1;
    src.connect(gn); gn.connect(g.voice);
    g.send(gn, p.mono ? 0.32 : p.who === 'AKURO' ? 0.75 : p.who === 'SABLE' ? 0.35 : 0.1);
    const len = Math.max(0.05, p.dur - off + 0.04);
    src.start(w, p.off + off, len);
    const m = g.music.gain, a = g.amb.gain; // duck the score under dialogue
    m.setTargetAtTime(0.34, w, 0.06); m.setTargetAtTime(0.62, w + len, 0.4);
    a.setTargetAtTime(0.38, w, 0.08); a.setTargetAtTime(0.55, w + len, 0.5);
  }
  async function load(ac, url) {
    const r = await fetch(url); if (!r.ok) throw new Error('voice track ' + r.status);
    const ab = await r.arrayBuffer();
    buffer = await new Promise((res, rej) => { const pr = ac.decodeAudioData(ab, res, rej); if (pr && pr.then) pr.then(res, rej); });
    return buffer;
  }
  return { place, amp, speaking, play, load, dur, placed, get buffer() { return buffer; }, set buffer(b) { buffer = b; } };
})();
