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

    // ============================================================
    // PASTE YOUR HYDRA SKETCH HERE.
    //
    // Drop in whatever chain you built on hydra.ojack.xyz / the Hydra
    // editor, starting from a source function (osc/noise/voronoi/shape/
    // gradient/solid/src) and ending in .out() or .out(o0).
    //
    // What's already in scope for you at this point:
    //   - hydra    : the Hydra instance for this canvas
    //   - isMobile : true under 700px wide — branch on this if your
    //                sketch is expensive (fewer voronoi cells, smaller
    //                repeat() counts, skip a .layer(), etc.)
    //   - time     : global, auto-updated each frame by Hydra — safe to
    //                reference directly inside a function you pass as a
    //                param, e.g. .rotate(0, () => Math.sin(time) * 0.2)
    //   - s0..s3   : external sources, if your sketch does
    //                s0.init({ src: ... }) for an image/video/canvas
    //   - o0..o3   : output buffers, if your sketch reads them back for
    //                feedback, e.g. src(o0).modulate(o0, 0.01).out(o0)
    //
    // Everything below this block until the "END SKETCH" marker gets
    // replaced by your pasted code — the example line is just a
    // placeholder so the file renders something if left untouched.
    speed = 0.025; // 1 = normal, lower = slower. try 0.2–0.5

    noise(0.8,0.1,70)
    .rotate(0.001,-0.1,-20).mask(shape([2,10].ease()))
    .modulate(noise(0.01),0.01)
    .color(-7,-2,[-2,-3].smooth())
    .colorama(-1.5)
    .modulateScale(o0, 2.1)
    .modulateScale(o0,[0.5,0.71].ease(),)
    .blend(o0, 0.3)
    .blend(o0,0.4)
    .blend(o0,0.7)
    .blend(o0,0.3)
    .saturate(1)
    .out(o0)

    // ============================== END SKETCH ==============================

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
