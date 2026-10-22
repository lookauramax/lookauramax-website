/* Lookauramax — bounded 3D hero piece (W1, founder-approved override).
   Raw WebGL, no library: three tilted rings of gold particles turning
   slowly around a soft core — an "aura" around the app screenshot.
   Bounds: lazy-started by IntersectionObserver, paused off-screen and
   when the tab hides, capped particle count + DPR, static poster (an
   inline SVG in the page) stays if WebGL is unavailable or the visitor
   prefers reduced motion. This is the ONLY WebGL on the site. */
(function () {
  'use strict';
  var stage = document.querySelector('.hero-stage');
  var canvas = document.getElementById('aura3d');
  if (!stage || !canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var started = false;
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) { started = true; start(); io.disconnect(); }
  }, { rootMargin: '120px' });
  io.observe(stage);

  function start() {
    var gl = canvas.getContext('webgl', { antialias: false, alpha: true, depthWrite: false });
    if (!gl) return; /* poster fallback stays */

    var vs = 'attribute vec3 p;uniform float uT;uniform float uAspect;' +
      'void main(){float a=uT;float ca=cos(a),sa=sin(a);' +
      'vec3 q=vec3(p.x*ca-p.z*sa,p.y,p.x*sa+p.z*ca);' +
      'gl_Position=vec4(q.x/uAspect,q.y,q.z*.001,1.0);' +
      'gl_PointSize=(2.1+p.y*0.7)*(180.0/-q.z+2.6);}';
    var fs = 'precision mediump float;uniform float uT;' +
      'void main(){vec2 c=gl_PointCoord-0.5;float d=length(c);' +
      'if(d>0.5) discard;float a=smoothstep(0.5,0.05,d);' +
      'gl_FragColor=vec4(0.94,0.78,0.45,a*0.85);}';
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    /* particle rings: 3 tilted ellipses, gold dust */
    var N = 900, pos = new Float32Array(N * 3), k = 0;
    var rings = [[1.55, 0.32, 0.5], [1.95, -0.22, 0.9], [2.4, 0.5, 1.3]];
    for (var i = 0; i < N; i++) {
      var r = rings[i % 3], ang = Math.random() * Math.PI * 2;
      var rad = r[0] * (0.92 + Math.random() * 0.16);
      var x = Math.cos(ang) * rad, z = Math.sin(ang) * rad * 0.42;
      var y = Math.sin(ang) * rad * r[1] + (Math.random() - 0.5) * 0.09;
      pos[k++] = x; pos[k++] = y; pos[k++] = z - 2.2;
    }
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    var uT = gl.getUniformLocation(prog, 'uT');
    var uA = gl.getUniformLocation(prog, 'uAspect');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    function size() {
      var w = stage.clientWidth, h = stage.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uA, w / Math.max(h, 1));
    }
    size();
    window.addEventListener('resize', size);

    var visible = true, raf = 0, t0 = performance.now();
    var vis = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.02 });
    vis.observe(stage);
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, (now - t0) / 1000 * 0.12);
      gl.drawArrays(gl.POINTS, 0, N);
    }
    raf = requestAnimationFrame(frame);
    stage.classList.add('live'); /* fades the canvas in over the poster */
  }
})();
