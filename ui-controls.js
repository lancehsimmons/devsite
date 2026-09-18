// Shared header controls for every page (root landing + /engnr + /sprt).
// Lives in one file so the three pages don't each carry their own copy.
(function () {
  var toggleBtn = document.getElementById('content-toggle');
  var opacitySlider = document.getElementById('overlay-opacity');
  var morphSlider = document.getElementById('morph-speed');
  var body = document.body;
  var root = document.documentElement;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var hidden = body.classList.toggle('content-hidden');
      toggleBtn.textContent = hidden ? 'read' : 'gaze';
      toggleBtn.setAttribute('aria-pressed', String(hidden));
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', function () {
      root.style.setProperty('--overlay-alpha', opacitySlider.value / 100);
    });
  }

  if (morphSlider) {
    morphSlider.addEventListener('input', function () {
      // Quadratic curve: equal slider steps near the low end map to much
      // smaller speed changes than steps near the high end, so most of the
      // slider's travel is spent fine-tuning slow motion instead of being
      // split evenly across the whole 0–1.2x range.
      var t = morphSlider.value / 100;
      window.speed = t * t * 1.2;
    });
  }
})();
