/* RUINBREAKER — episode player: clock, audio + voice scheduling, GPU post, adaptive quality, controls. */
'use strict';

(() => {
  const G = GFX, E = window.RB_EP || EP01, W = G.W, H = G.H;
  const $ = s => document.querySelector(s);
  const cv = $('#cv'), subc = $('#subs'), stage = $('#stage'), ui = $('#ui'), startBtn = $('#start'), startLbl = $('#startLbl'), startOv = $('#startOverlay');
  const playBtn = $('#play'), bar = $('#bar'), fillEl = $('#fill'), knob = $('#knob'), timeEl = $('#time'), ccBtn = $('#cc'), fsBtn = $('#fs'), volEl = $('#vol'), endOv = $('#endOverlay');
  const scene = document.createElement('canvas'), sctx = scene.getContext('2d', { alpha: false }), subx = subc.getContext('2d');
  const DUR = E.duration, EV = E.ev;
  let posterT = 0, K = 1, Kmax = 1, quality = 1, ready = false, started = false, playing = false, ended = false, subsOn = true;
  let ac = null, master = null, graph = null, pos0 = 0, ctx0 = 0, evIdx = 0, pausedPos = 0, needsRestart = false, lastAc = -1, lastPerf = 0, perfStart = 0;
  try { if (localStorage.getItem('rb-cc') === '0') subsOn = false; } catch (e) {}
  try { const v = parseFloat(localStorage.getItem('rb-vol')); if (v >= 0 && v <= 1) volEl.value = v; } catch (e) {}
  POST.init(cv);

  /* ---------- sizing + adaptive resolution ---------- */
  function resize() {
    const r = stage.getBoundingClientRect(), dpr = Math.min(1.75, window.devicePixelRatio || 1);
    const w = Math.max(320, Math.min(1920, Math.round(r.width * dpr)));
    Kmax = w / W; cv.width = w; cv.height = Math.round(H * Kmax); subc.width = cv.width; subc.height = cv.height;
    applyQuality();
  }
  function applyQuality() {
    K = Kmax * quality; scene.width = Math.round(W * K); scene.height = Math.round(H * K);
    G.init(sctx, K); RIG.setK(K); if (!playing) draw(started ? currentPos() : posterT);
  }
  window.addEventListener('resize', resize);
  // hold the screen's full refresh rate (60, 90, 100, 120, 144 Hz...) by trading resolution for speed
  let ftAvg = 16, ftCount = 0, lastFrame = 0, refresh = 16.7, minFt = 1e9, fpsN = 0, fpsT = 0;
  const fpsEl = $('#fps');
  function adapt(now) {
    if (!playing) { lastFrame = 0; return; }
    if (lastFrame) {
      const ft = now - lastFrame; ftAvg = ftAvg * 0.9 + Math.min(100, ft) * 0.1;
      if (ft > 4) minFt = Math.min(minFt, ft);
      fpsN++; if (now - fpsT > 500) { if (fpsEl) fpsEl.textContent = Math.round(fpsN * 1000 / (now - fpsT)) + ' fps'; fpsN = 0; fpsT = now; }
    }
    lastFrame = now;
    if (++ftCount % 40 !== 0) return;
    refresh = Math.max(5, Math.min(34, minFt * 1.02)); minFt = 1e9;
    if (ftAvg > refresh * 1.3 && quality > 0.5) { quality = Math.max(0.5, quality * 0.86); applyQuality(); }
    else if (ftAvg < refresh * 1.06 && quality < 1) { quality = Math.min(1, quality * 1.06); applyQuality(); }
  }

  /* ---------- timeline lookup ---------- */
  let shotIdx = 0;
  function shotAt(t) {
    const S = E.shots; if (shotIdx >= S.length) shotIdx = S.length - 1;
    while (shotIdx > 0 && S[shotIdx].t0 > t) shotIdx--;
    while (shotIdx < S.length - 1 && S[shotIdx].t0 + S[shotIdx].d <= t) shotIdx++;
    return S[shotIdx];
  }
  function subAt(t) { for (const s of E.subs) if (t >= s.t0 && t < s.t1) return s; return null; }

  /* ---------- render ---------- */
  function draw(t) {
    if (!ready) return;
    t = Math.max(0, Math.min(DUR - 0.001, t));
    sctx.setTransform(K, 0, 0, K, 0, 0); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over'; sctx.filter = 'none';
    sctx.fillStyle = '#000'; sctx.fillRect(0, 0, W, H);
    POST.reset();
    const s = shotAt(t), lt = t - s.t0;
    sctx.save();
    // a touch of hand-held drift on every shot
    sctx.translate(W / 2 + Math.sin(t * 0.7) * 1.6 + Math.sin(t * 1.9) * 0.6, H / 2 + Math.cos(t * 0.6) * 1.2); sctx.rotate(Math.sin(t * 0.45) * 0.0015); sctx.translate(-W / 2, -H / 2);
    try { s.draw(lt, s.d, t); } catch (e) { console.error('shot', E.shots.indexOf(s), e); }
    sctx.restore(); sctx.globalAlpha = 1; sctx.globalCompositeOperation = 'source-over';
    if (!s.vig) POST.set({ vig: 0.1 });
    POST.render(scene, t);
    // subtitles on their own crisp layer
    subx.setTransform(1, 0, 0, 1, 0, 0); subx.clearRect(0, 0, subc.width, subc.height);
    if (subsOn) { const sb = subAt(t); if (sb) { subx.setTransform(Kmax, 0, 0, Kmax, 0, 0); G.setCtx(subx, Kmax); G.subtitle(sb, Math.min(1, (t - sb.t0) / 0.12, (sb.t1 - t) / 0.12), t); G.setCtx(sctx, K); } }
  }

  /* ---------- clock + audio ---------- */
  function ensureAudio() {
    if (ac) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ac = new AC({ latencyHint: 'playback' });
      master = ac.createGain(); master.gain.value = parseFloat(volEl.value);
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.3;
      master.connect(comp); comp.connect(ac.destination); SND.res(ac); return true;
    } catch (e) { console.warn('Audio unavailable', e); ac = null; return false; }
  }
  function newSession() {
    if (!ac) return;
    if (graph) { const old = graph.out; try { old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.015); setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 400); } catch (e) {} }
    graph = SND.makeGraph(ac, master);
  }
  function firstEvent(t) { let lo = 0, hi = EV.length; while (lo < hi) { const m = (lo + hi) >> 1; if (EV[m].t < t) lo = m + 1; else hi = m; } return lo; }
  function startAt(p) {
    pos0 = p; needsRestart = false;
    if (ac) { newSession(); ctx0 = ac.currentTime + 0.08; evIdx = firstEvent(p - 200); lastAc = -1; schedule(); }
    else perfStart = performance.now();
  }
  function currentPos() {
    if (!started || !playing) return pausedPos;
    if (!ac) return pos0 + (performance.now() - perfStart) / 1000;
    const a = ac.currentTime, p = performance.now();
    if (a !== lastAc) { lastAc = a; lastPerf = p; }
    return Math.max(pos0, pos0 + (a + Math.min(0.05, (p - lastPerf) / 1000) - ctx0));
  }
  function schedule() {
    if (!ac || !playing) return;
    const now = ac.currentTime, pos = pos0 + (now - ctx0), horizon = pos + 0.9;
    while (evIdx < EV.length && EV[evIdx].t < horizon) {
      const e = EV[evIdx++];
      try {
        if (e.t >= pos - 0.03) e.f(graph, Math.max(ctx0 + (e.t - pos0), now + 0.005), 0);
        else if (e.long && e.t + e.d > pos + 0.25) e.f(graph, now + 0.06, pos - e.t + 0.06);
      } catch (err) { console.error('audio event', err); }
    }
  }
  setInterval(schedule, 60);

  function play() {
    if (!ready) return;
    if (ended) { ended = false; endOv.hidden = true; pausedPos = 0; needsRestart = true; }
    started = true; startOv.hidden = true; ui.hidden = false;
    const hasAudio = ensureAudio();
    if (hasAudio && ac.state === 'suspended') ac.resume();
    if (hasAudio && !VOICE.buffer) VOICE.load(ac, VOICE_DATA.file || 'voice/voices.mp3').catch(e => console.warn('voice track', e));
    playing = true;
    if (needsRestart || !hasAudio || !graph) startAt(pausedPos);
    stage.classList.add('playing'); playBtn.setAttribute('aria-label', 'Pause'); playBtn.dataset.state = 'pause';
    wakeLock(); showUi();
  }
  function pause() {
    if (!playing) return;
    pausedPos = currentPos(); playing = false;
    if (ac) ac.suspend(); else needsRestart = true;
    stage.classList.remove('playing'); playBtn.setAttribute('aria-label', 'Play'); playBtn.dataset.state = 'play'; showUi();
  }
  function seek(p) {
    p = Math.max(0, Math.min(DUR - 0.05, p)); pausedPos = p; ended = false; endOv.hidden = true;
    if (playing) { if (ac && ac.state === 'suspended') ac.resume(); startAt(p); } else { needsRestart = true; if (ac) newSession(); draw(p); updateBar(p); }
  }
  function toggle() { playing ? pause() : play(); }

  /* ---------- UI ---------- */
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function updateBar(p) { const f = p / DUR * 100; fillEl.style.width = f + '%'; knob.style.left = f + '%'; timeEl.textContent = fmt(p) + ' / ' + fmt(DUR); bar.setAttribute('aria-valuenow', Math.floor(p)); bar.setAttribute('aria-valuetext', fmt(p)); }
  E.chapters.forEach(c => { const m = document.createElement('i'); m.className = 'tick'; m.style.left = (c.t / DUR * 100) + '%'; m.title = c.name; bar.appendChild(m); });
  bar.setAttribute('aria-valuemax', Math.floor(DUR));
  document.querySelectorAll('[data-dur]').forEach(el => { el.textContent = fmt(DUR); });
  let dragging = false;
  const barPos = e => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * DUR; };
  bar.addEventListener('pointerdown', e => { if (!ready) return; dragging = true; bar.setPointerCapture(e.pointerId); seek(barPos(e)); });
  bar.addEventListener('pointermove', e => { if (dragging) seek(barPos(e)); });
  bar.addEventListener('pointerup', () => { dragging = false; });
  bar.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { seek(currentPos() + 5); e.preventDefault(); } if (e.key === 'ArrowLeft') { seek(currentPos() - 5); e.preventDefault(); } });
  playBtn.addEventListener('click', toggle);
  startBtn.addEventListener('click', play);
  $('#replay').addEventListener('click', () => { seek(0); play(); });
  subc.addEventListener('click', () => { if (started) toggle(); });
  ccBtn.addEventListener('click', () => { subsOn = !subsOn; ccBtn.setAttribute('aria-pressed', subsOn); try { localStorage.setItem('rb-cc', subsOn ? '1' : '0'); } catch (e) {} if (!playing) draw(currentPos()); });
  ccBtn.setAttribute('aria-pressed', subsOn);
  volEl.addEventListener('input', () => { const v = parseFloat(volEl.value); if (master) master.gain.setTargetAtTime(v, ac.currentTime, 0.02); try { localStorage.setItem('rb-vol', v); } catch (e) {} });
  fsBtn.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); } catch (e) { stage.classList.toggle('pseudo-fs'); } setTimeout(resize, 120); });
  document.addEventListener('fullscreenchange', () => setTimeout(resize, 60));
  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); started ? toggle() : play(); }
    else if (e.key === 'ArrowRight' && e.target !== bar) seek(currentPos() + 5);
    else if (e.key === 'ArrowLeft' && e.target !== bar) seek(currentPos() - 5);
    else if (e.key === 'f') fsBtn.click(); else if (e.key === 'c') ccBtn.click();
    else if (e.key === 'm') { volEl.value = parseFloat(volEl.value) > 0 ? 0 : 0.85; volEl.dispatchEvent(new Event('input')); }
  });
  const chapList = $('#chapters');
  if (chapList) E.chapters.forEach(c => {
    const li = document.createElement('li'), b = document.createElement('button'), tm = document.createElement('time'), nm = document.createElement('span');
    b.className = 'chap'; b.type = 'button'; tm.textContent = fmt(c.t); nm.textContent = c.name; b.append(tm, nm); li.append(b); chapList.append(li);
    b.addEventListener('click', () => { if (!ready) return; stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); seek(c.t); play(); });
  });
  let hideT = 0; function showUi() { stage.classList.add('ui-on'); clearTimeout(hideT); if (playing) hideT = setTimeout(() => stage.classList.remove('ui-on'), 2600); }
  stage.addEventListener('pointermove', showUi); stage.addEventListener('touchstart', showUi, { passive: true });
  let lock = null; async function wakeLock() { try { if ('wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } } catch (e) {} }

  /* ---------- main loop ---------- */
  let lastDrawn = -1;
  function frame(now) {
    const p = currentPos();
    if (playing && p >= DUR) { pause(); ended = true; pausedPos = DUR - 0.01; endOv.hidden = false; }
    // animated on twos: a new drawing every 1/12 s, like TV anime (window.RB_TWOS = false for smooth motion)
    if (playing || dragging) { const q = window.RB_TWOS === false ? p : Math.floor(p * 12) / 12; if (q !== lastDrawn || dragging) { draw(q); lastDrawn = q; } updateBar(Math.min(p, DUR)); adapt(now); }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  async function boot() {
    resize();
    const JP = '踏切烙印行方不明新庄春樹年月日第話付近目撃心当たりの方は練馬警察署まで亀裂魔物狩人止まれルインブレイカーネムジークリンウィックハルキアクロ一二四';
    const fonts = ['900 40px "Big Shoulders Display"', '800 40px "Big Shoulders Display"', '700 20px "Noto Sans"', '600 20px "Noto Sans"', '500 20px "Noto Sans"', 'italic 600 20px "Noto Sans"', 'italic 500 20px "Noto Sans"'];
    const fontP = Promise.race([Promise.all([...fonts.map(f => document.fonts.load(f)), document.fonts.load('400 40px "Dela Gothic One"', JP)]).catch(() => {}), new Promise(r => setTimeout(r, 6000))]);
    startLbl.textContent = 'Loading art…';
    try { await G.loadAssets('assets/', f => { startLbl.textContent = 'Loading art… ' + Math.round(f * 100) + '%'; }); }
    catch (e) { startLbl.textContent = 'Some art failed to load. Reload the page to try again.'; console.error(e); return; }
    startLbl.textContent = 'Loading voices…';
    try { if (ensureAudio()) await VOICE.load(ac, VOICE_DATA.file || 'voice/voices.mp3'); } catch (e) { console.warn('voice track will load on play', e); }
    // 2D mode (RB_FLAT) draws the cast from their illustrations: no 3D models to fetch
    if (typeof S3 !== 'undefined' && S3.preload && !window.RB_FLAT) { startLbl.textContent = 'Loading characters…'; try { await S3.preload('models/', f => { startLbl.textContent = 'Loading characters… ' + Math.round(f * 100) + '%'; }); } catch (e) { console.warn('3D characters fell back to simple models', e); } }
    if (typeof S3 !== 'undefined' && S3.loadPlates) { startLbl.textContent = 'Loading backgrounds…'; const ids = new Set(window.RB_PLATES || []); Object.values(S3.PLATE_SETS).forEach(st => { st.plates.forEach(([id]) => ids.add(id)); Object.values(st.moods || {}).forEach(l => l.forEach(([id]) => ids.add(id))); }); try { await S3.loadPlates([...ids], 'plates/'); } catch (e) { console.warn('plates', e); } }
    if (typeof S3 !== 'undefined' && S3.loadSprites && window.RB_SPRITES) { try { S3.init(); await S3.loadSprites(window.RB_SPRITES, 'sprites/'); } catch (e) { console.warn('sprites', e); } }
    startLbl.textContent = 'Loading fonts…'; await fontP;
    G.init(sctx, K); G.build(); PARTS.register(); VFX.build(); RIG.init(); RIG.setK(K);
    ready = true; startBtn.disabled = false; startLbl.textContent = 'Play Episode ' + (window.RB_EP_NO || 1);
    pausedPos = 0; updateBar(0);
    posterT = E.chapters.find(c => c.name === 'Opening').t + 35.2 * 1.6;
    draw(posterT);
    window.__rb = { draw, seek, play, pause, dur: DUR, shots: E.shots, subs: E.subs, chapters: E.chapters, get pos() { return currentPos(); }, get quality() { return quality; }, setQuality(q) { quality = q; applyQuality(); }, snap(t) { draw(t); const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const x = c.getContext('2d'); x.drawImage(cv, 0, 0); x.drawImage(subc, 0, 0); return c.toDataURL('image/jpeg', 0.85); } };
    requestAnimationFrame(frame);
  }
  boot();
})();
