(function () {
  var canvas = document.getElementById('hydra-bg');
  var body = document.body;

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function supportsWebGL() {
    try {
      var test = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (test.getContext('webgl') || test.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  if (prefersReducedMotion || !supportsWebGL() || typeof Hydra === 'undefined') {
    body.classList.add('static-bg');
    return;
  }

  var NAME = 'LANCE HOWARD SIMMONS';

  // Turns the name into a handful of stable 0..1 numbers so the chaos below
  // is seeded by "Lance Howard Simmons" rather than arbitrary constants.
  function seedFromString(str, salt) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i) + salt) % 9973;
    }
    return (h < 0 ? h + 9973 : h) / 9973;
  }

  function buildNameTexture() {
    var tc = document.createElement('canvas');
    var size = 512;
    tc.width = size;
    tc.height = size;
    var ctx = tc.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 72px sans-serif';
    var lines = NAME.split(' ');
    var lineHeight = 92;
    var startY = size / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach(function (line, i) {
      ctx.fillText(line, size / 2, startY + i * lineHeight);
    });
    return tc;
  }

  try {
    initHydraBackground();
  } catch (err) {
    console.warn(
      'Hydra background failed to initialize, falling back to static background.',
      err
    );
    body.classList.add('static-bg');
  }

  function initHydraBackground() {
    var isMobile = window.innerWidth < 700;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    var targetWidth = Math.round(window.innerWidth * pixelRatio);
    var targetHeight = Math.round(window.innerHeight * pixelRatio);

    // Hydra reads canvas.width/canvas.height directly when a canvas is
    // passed in — its own width/height constructor options are ignored
    // in that case, so the buffer size has to be set here first.
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    var hydra = new Hydra({
      canvas: canvas,
      detectAudio: false,
      autoLoop: false,
      makeGlobal: true,
    });

    var seedA = seedFromString(NAME, 1);
    var seedB = seedFromString(NAME, 2);
    var seedC = seedFromString(NAME, 3);
    var seedD = seedFromString(NAME, 4);
    var kaleidSides = 3 + Math.floor(seedA * 7); // 3..9, derived from the name
    var voronoiCells = isMobile ? 6 : 12 + Math.floor(seedB * 10);

    s0.init({ src: buildNameTexture() });

    // The name gets kaleidoscoped, thrown through voronoi cells, and fed
    // back into itself frame over frame — it never fully resolves or fully
    // dissolves, just keeps melting and re-forming out of the noise.
    voronoi(voronoiCells, 0.3, 0.15)
      .thresh(0.4, 0.1)
      .mult(
        src(s0)
          .kaleid(kaleidSides)
          .scale(1 + seedC * 0.5)
          .modulateRotate(noise(3, 0.3), 0.4)
          .colorama(0.6)
      )
      .modulate(osc(6, 0.1, 1).kaleid(kaleidSides * 2), 0.2)
      .layer(
        shape(3 + Math.floor(seedD * 5), 0.3, 0.05)
          .repeat(isMobile ? 2 : 3, isMobile ? 2 : 3)
          .rotate(0, function () {
            return Math.sin(time * 0.15) * 0.4;
          })
          .mask(src(s0).invert())
          .color(seedA, seedB, seedC)
      )
      .modulateScale(src(o0), 0.02)
      .blend(src(o0), 0.55)
      .hue(function () {
        return time * 0.04;
      })
      .contrast(1.35)
      .saturate(1.5)
      .out(o0);

    var rafId = null;
    var lastTime = performance.now();

    function loop(now) {
      var dt = now - lastTime;
      lastTime = now;
      hydra.tick(dt);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }

    function stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }
})();
