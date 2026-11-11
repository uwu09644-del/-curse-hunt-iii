/* RUINBREAKER — GPU post-processing: bloom, grading, chromatic aberration, shockwaves,
   zoom/directional blur, vignette and grain. The 2D scene is uploaded once per frame. */
'use strict';

const POST = (() => {
  let gl = null, ok = false, prog = {}, tex = null, fb = [], fbTex = [], fbW = 0, fbH = 0, quad = null, out2d = null;
  const DEF = () => ({ bloom: 0.55, thr: 0.62, ca: 0.0008, sat: 1.06, con: 1.06, lift: [0, 0, 0], gain: [1, 1, 1], exposure: 1, vig: 0.38, grain: 0.05,
    shock: null, radial: 0, dir: [0, 0], flash: 0, flashCol: [1, 1, 1], tint: [1, 1, 1] });
  let P = DEF();
  const VS = 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const FS_BRIGHT = `precision mediump float; varying vec2 uv; uniform sampler2D t; uniform float thr; uniform vec2 px;
    void main(){ vec3 c = vec3(0.0);
      for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) c += texture2D(t, uv + vec2(float(i), float(j)) * px).rgb;
      c /= 9.0; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(thr, thr + 0.25, l), 1.0); }`;
  const FS_BLUR = `precision mediump float; varying vec2 uv; uniform sampler2D t; uniform vec2 d;
    void main(){ vec3 c = texture2D(t, uv).rgb * 0.227;
      c += (texture2D(t, uv + d * 1.385).rgb + texture2D(t, uv - d * 1.385).rgb) * 0.316;
      c += (texture2D(t, uv + d * 3.231).rgb + texture2D(t, uv - d * 3.231).rgb) * 0.070;
      gl_FragColor = vec4(c, 1.0); }`;
  const FS_FINAL = `precision mediump float; varying vec2 uv; uniform sampler2D t; uniform sampler2D b;
    uniform float bloom, ca, sat, con, exposure, vig, grain, time, radial, flash, aspect;
    uniform vec3 lift, gain, flashCol, tint; uniform vec4 shock; uniform float shockAmp; uniform vec2 dir;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 q = uv;
      if (shockAmp > 0.0) { vec2 dv = (q - shock.xy) * vec2(aspect, 1.0); float r = length(dv); float w = shock.w;
        float k = smoothstep(shock.z - w, shock.z, r) * (1.0 - smoothstep(shock.z, shock.z + w, r));
        q -= normalize(dv + 1e-5) / vec2(aspect, 1.0) * k * shockAmp; }
      vec2 cd = (q - 0.5);
      vec3 c;
      if (radial > 0.0 || dot(dir, dir) > 0.0) {
        c = vec3(0.0);
        for (int i = 0; i < 8; i++) { float f = float(i) / 7.0; vec2 o = -cd * radial * f + dir * (f - 0.5); c += texture2D(t, q + o).rgb; }
        c /= 8.0;
      } else {
        float a = ca * (1.0 + 2.5 * dot(cd, cd));
        c = vec3(texture2D(t, q + cd * a * 2.0).r, texture2D(t, q).g, texture2D(t, q - cd * a * 2.0).b);
      }
      c += texture2D(b, q).rgb * bloom;
      c *= exposure * tint;
      c = lift + (gain - lift) * c;
      c = (c - 0.5) * con + 0.5;
      float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, sat);
      float v = smoothstep(0.85, 0.2, length(cd * vec2(1.0, 0.85)) * 1.25); c *= mix(1.0 - vig, 1.0, v);
      c += (hash(uv * vec2(1280.0, 720.0) + time) - 0.5) * grain;
      c = mix(c, flashCol, flash);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`;
  function init(canvas) {
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
      if (!gl) { out2d = canvas.getContext('2d'); return false; }
      const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const mk = fs => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); p.u = n => gl.getUniformLocation(p, n); return p; };
      prog.bright = mk(FS_BRIGHT); prog.blur = mk(FS_BLUR); prog.final = mk(FS_FINAL);
      quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      tex = mkTex();
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); ok = false; });
      ok = true; return true;
    } catch (e) { console.warn('post-processing unavailable', e); ok = false; return false; }
  }
  function mkTex() { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
  function ensureFB(w, h) {
    if (fbW === w && fbH === h) return;
    fbW = w; fbH = h; fb.forEach(f => gl.deleteFramebuffer(f)); fbTex.forEach(t => gl.deleteTexture(t)); fb = []; fbTex = [];
    for (let i = 0; i < 2; i++) { const t = mkTex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); fb.push(f); fbTex.push(t); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function pass(p, target, w, h, src, setup) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target); gl.viewport(0, 0, w, h); gl.useProgram(p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src); gl.uniform1i(p.u('t'), 0);
    setup && setup(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function reset() { P = DEF(); }
  function set(o) { Object.assign(P, o); }
  function render(scene, t) {
    const cv = scene, W = cv.width, H = cv.height;
    if (!ok) { if (out2d) { out2d.drawImage(scene, 0, 0, out2d.canvas.width, out2d.canvas.height); if (P.flash > 0) { out2d.globalAlpha = P.flash; out2d.fillStyle = '#fff'; out2d.fillRect(0, 0, out2d.canvas.width, out2d.canvas.height); out2d.globalAlpha = 1; } } return; }
    const cw = gl.canvas.width, ch = gl.canvas.height;
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const bw = Math.max(64, Math.round(W / 4)), bh = Math.max(36, Math.round(H / 4)); ensureFB(bw, bh);
    if (P.bloom > 0) {
      pass(prog.bright, fb[0], bw, bh, tex, p => { gl.uniform1f(p.u('thr'), P.thr); gl.uniform2f(p.u('px'), 1 / W * 2, 1 / H * 2); });
      for (let i = 0; i < 2; i++) {
        pass(prog.blur, fb[1], bw, bh, fbTex[0], p => gl.uniform2f(p.u('d'), (1 + i) / bw, 0));
        pass(prog.blur, fb[0], bw, bh, fbTex[1], p => gl.uniform2f(p.u('d'), 0, (1 + i) / bh));
      }
    }
    pass(prog.final, null, cw, ch, tex, p => {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fbTex[0]); gl.uniform1i(p.u('b'), 1); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1f(p.u('bloom'), P.bloom); gl.uniform1f(p.u('ca'), P.ca); gl.uniform1f(p.u('sat'), P.sat); gl.uniform1f(p.u('con'), P.con);
      gl.uniform1f(p.u('exposure'), P.exposure); gl.uniform1f(p.u('vig'), P.vig); gl.uniform1f(p.u('grain'), P.grain); gl.uniform1f(p.u('time'), (t * 24 | 0) % 97);
      gl.uniform1f(p.u('radial'), P.radial); gl.uniform2f(p.u('dir'), P.dir[0], P.dir[1]); gl.uniform1f(p.u('flash'), P.flash); gl.uniform1f(p.u('aspect'), W / H);
      gl.uniform3fv(p.u('lift'), P.lift); gl.uniform3fv(p.u('gain'), P.gain); gl.uniform3fv(p.u('flashCol'), P.flashCol); gl.uniform3fv(p.u('tint'), P.tint);
      const s = P.shock; gl.uniform4f(p.u('shock'), s ? s.x : 0, s ? 1 - s.y : 0, s ? s.r : 0, s ? s.w || 0.05 : 0.05); gl.uniform1f(p.u('shockAmp'), s ? s.amp : 0);
    });
  }
  return { init, render, reset, set, get ok() { return ok; }, get params() { return P; } };
})();
