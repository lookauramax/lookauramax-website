/* Lookauramax V4 shared JS — vanilla, no libraries.
   Owns: overlay menu, always-visible sticky capsule header, gold
   scroll-progress line, header logo coin flip, scroll-spy active
   nav, scroll reveals + stagger, honest-number counters, the Aura
   Score ring fill, and the pricing region-switch transition.
   Progressive enhancement everywhere: if JS fails, or
   IntersectionObserver is missing, or the user prefers reduced
   motion, the page stays fully visible with FINAL values shown.
   pricing.js / consent.js / motion.js are untouched. */
(function () {
  'use strict';
  document.documentElement.classList.replace('no-js', 'js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Overlay menu ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav-overlay');
  var header = document.querySelector('header');
  function closeMenu(returnFocus) {
    if (!nav || !btn) return;
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden', 'true');
    nav.inert = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    document.documentElement.classList.remove('nav-open');
    if (header) header.classList.remove('nav-open');
    if (returnFocus) btn.focus();
  }
  function openMenu() {
    if (!nav || !btn) return;
    nav.classList.add('open');
    nav.removeAttribute('aria-hidden');
    nav.inert = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('nav-open');
    if (header) { header.classList.add('nav-open'); }
  }
  if (btn && nav) {
    nav.inert = true;
    nav.setAttribute('aria-hidden', 'true');
    btn.addEventListener('click', function () {
      if (nav.classList.contains('open')) closeMenu(false); else openMenu();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.closest('[data-nav-close]')) closeMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 901 && nav.classList.contains('open')) closeMenu(false);
    });
  }

  /* ---------- Header logo coin flip ---------- */
  /* Wraps the header logo in a two-face coin (front = the real
     logo, back = a clone of it, so it never shows mirrored) and
     lets the CSS flip it once every 6s. No JS / reduced-motion =
     the plain static logo stays. */
  (function () {
    if (reduce) return;
    var logo = document.querySelector('.brand img');
    if (!logo || logo.closest('.brand-coin')) return;
    var coin = document.createElement('span');
    coin.className = 'brand-coin';
    var front = document.createElement('span');
    front.className = 'coin-face front';
    var back = document.createElement('span');
    back.className = 'coin-face back';
    var backImg = logo.cloneNode(false);
    backImg.setAttribute('aria-hidden', 'true');
    backImg.setAttribute('alt', '');
    logo.parentNode.insertBefore(coin, logo);
    front.appendChild(logo);
    back.appendChild(backImg);
    coin.appendChild(front);
    coin.appendChild(back);
})();

  /* ---------- Scroll progress (scroll-owned motion) ----------
     The header itself is always visible now — no hide-on-scroll. */
  var progress = document.getElementById('scroll-progress');
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (progress && !reduce) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Scroll-spy: gold underline draws under the active nav link ---------- */
  if (hasIO && header) {
    var spyMap = {};
    header.querySelectorAll('.hlinks a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) spyMap[id] = a;
    });
    var spyIds = Object.keys(spyMap);
    if (spyIds.length) {
      var spyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          spyIds.forEach(function (id) { spyMap[id].removeAttribute('aria-current'); });
          var link = spyMap[e.target.id];
          if (link) link.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      spyIds.forEach(function (id) {
        var sec = document.getElementById(id);
        if (sec) spyIO.observe(sec);
      });
    }
  }

  /* ---------- Scroll reveals + stagger (final states live in HTML/CSS;
     JS only animates INTO them) ---------- */
  if (!reduce && hasIO) {
    document.documentElement.classList.add('js-motion');
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-revealed');
        var kids = e.target.querySelectorAll('[data-stagger]');
        kids.forEach(function (k, i) {
          k.style.transitionDelay = (i * 70) + 'ms';
          k.classList.add('is-revealed');
        });
        revealIO.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Honest-number counters (real values only: 90, 7, 78) ---------- */
  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(end)) return;
    if (reduce) return; /* final value already in the HTML */
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1000;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(end * eased)) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
      else el.textContent = String(end) + suffix;
    }
    window.requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && hasIO && !reduce) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        countIO.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  /* ---------- Aura Score ring: fills on scroll into view ---------- */
  var journey = document.querySelector('.journey');
  var ringFill = document.querySelector('.jp-fill');
  if (journey && ringFill && hasIO && !reduce) {
    /* Start empty (CSS keeps the full ring as the no-JS / reduced-motion
       fallback). On scroll into view, transition cleanly to full. */
    ringFill.style.strokeDashoffset = '326.7';
    var ringIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ringFill.style.strokeDashoffset = '71.9';
        ringIO.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    ringIO.observe(journey);
  }

  /* ---------- Pricing region switch: sliding indicator + price swap ---------- */
  var region = document.getElementById('pricing-region');
  if (region) {
    region.addEventListener('change', function () {
      var wrap = region.closest('.region-select');
      var prices = document.getElementById('pricing-us');
      if (wrap) wrap.classList.add('is-switching');
      if (prices) prices.classList.add('is-switching');
      window.setTimeout(function () {
        if (wrap) wrap.classList.remove('is-switching');
        if (prices) prices.classList.remove('is-switching');
      }, 450);
    });
  }

  /* ---------- What section: interactive tabs ---------- */
  var whatTabs = document.querySelectorAll('[data-what-tab]');
  if (whatTabs.length) {
    whatTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        whatTabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('[data-what-panel]').forEach(function (p) {
          p.classList.remove('is-active');
          p.hidden = true;
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.querySelector('[data-what-panel="' + tab.getAttribute('data-what-tab') + '"]');
        if (panel) {
          panel.classList.add('is-active');
          panel.hidden = false;
        }
      });
    });
  }

  /* ---------- FAQ: single-open accordion (LooxUP-style interaction,
     adapted: our <details> stay native + keyboard-accessible). ---------- */
  var faqDetails = document.querySelectorAll('#faq details');
  faqDetails.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqDetails.forEach(function (other) {
        if (other !== d) other.open = false;
      });
    });
  });
})();
