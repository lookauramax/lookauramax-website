/* Lookauramax shared motion JS — tiny, no libraries.
   Reveal: adds .lm-reveal to sections/cards (skips the landing page's own
   .reveal system), then IntersectionObserver adds .lm-visible. Content is
   visible by default; if JS or the observer fails, nothing stays hidden.
   Count-up: animates tool result numbers (.bignum) when their text changes.
   Reduced-motion users get instant values, no animation. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* --- Reveal on scroll --- */
  var targets = document.querySelectorAll(
    'section, .card, .step, .pcard, .tool, .cta, .post-hero');
  var fresh = [];
  targets.forEach(function (el) {
    if (el.classList.contains('reveal')) return; /* landing's own system */
    el.classList.add('lm-reveal');
    fresh.push(el);
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('lm-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    fresh.forEach(function (el) { io.observe(el); });
  } else {
    fresh.forEach(function (el) { el.classList.add('lm-visible'); });
  }

  /* --- Gentle count-up for tool result numbers --- */
  function animateNum(el, from, to, done) {
    var decimals = (String(to).split('.')[1] || '').length;
    var start = null, dur = 650;
    (function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (from + (to - from) * eased).toFixed(decimals);
      if (p < 1) { requestAnimationFrame(frame); }
      else { el.textContent = String(to); done(); }
    })(performance.now());
  }
  document.querySelectorAll('.result .bignum').forEach(function (num) {
    var last = num.textContent;
    var animating = false;
    new MutationObserver(function () {
      if (animating) return;
      var cur = num.textContent;
      var from = parseFloat(String(last).replace(/,/g, ''));
      var to = parseFloat(String(cur).replace(/,/g, ''));
      last = cur;
      if (isNaN(from) || isNaN(to) || from === to) return;
      animating = true;
      animateNum(num, from, to, function () { animating = false; });
    }).observe(num, { characterData: true, childList: true, subtree: true });
  });
})();
