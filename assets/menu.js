/* Lookauramax mobile menu — vanilla JS, no libraries.
   Toggle: button flips aria-expanded + panel .open + hidden.
   Close: link tap (navigation), Escape (focus returns to button),
   or tap outside the panel. No focus trap (per spec); focus
   returns sanely on Escape. Also swaps <html> no-js -> js so CSS
   can show the panel as a plain stacked nav when JS is off. */
(function () {
  'use strict';
  document.documentElement.classList.replace('no-js', 'js');
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  function close(returnFocus) {
    nav.hidden = true;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    if (returnFocus) btn.focus();
  }
  function open() {
    nav.hidden = false;
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
  }
  btn.addEventListener('click', function () {
    if (nav.hidden) open(); else close(false);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !nav.hidden) close(true);
  });
  document.addEventListener('click', function (e) {
    if (!nav.hidden && !nav.contains(e.target) && !btn.contains(e.target)) close(false);
  });
})();
