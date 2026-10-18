/* Lookauramax menu V3 — vanilla JS, no libraries.
   The phone menu is a FULL-SCREEN overlay (#nav-overlay), not a
   dropdown panel. Toggle: button flips aria-expanded + overlay
   .open + hidden, and locks body scroll via <html>.nav-open.
   Close: link tap (navigation), Escape (focus returns to button),
   tap on the overlay backdrop itself, or resize to desktop width.
   Also swaps <html> no-js -> js so CSS can show the overlay as a
   plain stacked nav when JS is off. */
(function () {
  'use strict';
  document.documentElement.classList.replace('no-js', 'js');
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-overlay');
  if (!btn || !nav) return;
  function close(returnFocus) {
    nav.hidden = true;
    nav.classList.remove('open');
    document.documentElement.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    if (returnFocus) btn.focus();
  }
  function open() {
    nav.hidden = false;
    nav.classList.add('open');
    document.documentElement.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
  }
  btn.addEventListener('click', function () {
    if (nav.hidden) open(); else close(false);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close(false);
    else if (e.target === nav) close(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !nav.hidden) close(true);
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && !nav.hidden) close(false);
  });
})();
