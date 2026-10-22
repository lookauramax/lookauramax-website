/* Lookauramax — AURORA interactions (rebuild 2026-10, staging).
   Reveals (one-shot), mobile menu, signals accordion, Analysis Lens,
   desktop tilt, parallax-lite, scroll progress, region pricing.
   No libraries. Transform/opacity only. Everything degrades to fully
   visible, fully readable content with JS off or reduced motion on. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- one-shot reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
  /* Failsafe: no reveal may stay hidden if the observer stalls —
     after 5s every remaining reveal is shown (animation already spent). */
  setTimeout(function () {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }, 5000);

  /* timeline + day card: add .in when visible (CSS runs the animation) */
  var staged = document.querySelectorAll('.tl, .day-card');
  if ('IntersectionObserver' in window && !reduce) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    staged.forEach(function (el) { io2.observe(el); });
  } else {
    staged.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- scroll progress hairline ---------- */
  var prog = document.querySelector('.scroll-progress');
  if (prog && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        prog.style.transform = 'scaleX(' + (max > 0 ? (h.scrollTop / max) : 0) + ')';
        ticking = false;
      });
    }, { passive: true });
  } else if (prog) { prog.style.display = 'none'; }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.nav-overlay');
  if (menuBtn && overlay) {
    var closeBtn = overlay.querySelector('[data-nav-close]');
    function setMenu(open) {
      overlay.classList.toggle('open', open);
      overlay.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
    }
    menuBtn.addEventListener('click', function () { setMenu(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  } else if (menuBtn) {
    /* article pages: the button toggles the inline link row instead */
    var links = document.querySelector('.hlinks');
    if (links) menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- signals accordion ----------
     Rows ship OPEN in HTML (readable with JS off). JS collapses all but
     the first, then toggles one at a time. */
  var rows = document.querySelectorAll('.sig-row[data-acc]');
  rows.forEach(function (row, i) {
    var head = row.querySelector('.sig-head');
    if (!head) return;
    if (i > 0) { row.classList.add('closed'); head.setAttribute('aria-expanded', 'false'); }
    else { row.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
    head.addEventListener('click', function () {
      var closed = row.classList.toggle('closed');
      row.classList.toggle('open', !closed);
      head.setAttribute('aria-expanded', String(!closed));
    });
  });

  /* ---------- Analysis Lens ----------
     Pointer/touch drag moves a clipped "read" layer over the photo.
     The lens shows light/visibility notes only — never a score. */
  var lens = document.querySelector('.lens-wrap');
  if (lens) {
    var readEl = document.querySelector('[data-lens-read]');
    var zone = '';
    var setRead = function (x, y) {
      if (!readEl) return;
      var z = y > 66 ? 'close' : (x < 40 ? 'even' : (x > 64 ? 'shadow' : 'balanced'));
      if (z === zone) return;
      zone = z;
      readEl.textContent =
        z === 'close' ? 'Too close — the frame crops the edges of the face.' :
        z === 'even' ? 'Even light — features read clearly.' :
        z === 'shadow' ? 'Hard shadow — one side reads darker than the other.' :
        'Balanced light — the read stays even.';
    };
    var move = function (clientX, clientY) {
      var r = lens.getBoundingClientRect();
      var x = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      var y = Math.max(8, Math.min(92, ((clientY - r.top) / r.height) * 100));
      lens.style.setProperty('--lx', x + '%');
      lens.style.setProperty('--ly', y + '%');
      setRead(x, y);
    };
    var dragging = false;
    lens.addEventListener('pointerdown', function (e) { e.preventDefault(); dragging = true; move(e.clientX, e.clientY); });
    window.addEventListener('pointermove', function (e) { if (dragging) move(e.clientX, e.clientY); }, { passive: true });
    window.addEventListener('pointerup', function () { dragging = false; });
    window.addEventListener('pointercancel', function () { dragging = false; });
  }

  /* ---------- desktop tilt (one element class, fine pointers only) ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - r.left) / r.width - 0.5;
          var dy = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = 'perspective(900px) rotateY(' + (dx * 5).toFixed(2) + 'deg) rotateX(' + (-dy * 5).toFixed(2) + 'deg)';
          raf = null;
        });
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = 'perspective(900px)';
      });
    });
  }

  /* ---------- parallax-lite (transform only, rAF-throttled) ---------- */
  var plx = document.querySelectorAll('[data-plx]');
  if (plx.length && !reduce) {
    var pTick = false;
    var update = function () {
      plx.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var speed = parseFloat(el.getAttribute('data-plx')) || 0.06;
        var shift = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
        el.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
      });
      pTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- region pricing (plans only) ----------
     Locked manual prices for the 10 launch markets — never auto-FX.
     Per-month figures are floored, never rounded up. The ₹7 start is a
     property of every plan (stated in the section copy), not a plan. */
  var MARKETS = {
    US: { s: '$', m: 9.99, q: 19.99, y: 49.99, d: 2 }, IN: { s: '₹', m: 199, q: 399, y: 999, d: 2 },
    GB: { s: '£', m: 6.99, q: 13.99, y: 34.99, d: 2 }, BR: { s: 'R$', m: 24.99, q: 49.99, y: 124.99, d: 2 },
    ID: { s: 'Rp', m: 53000, q: 106000, y: 266000, d: 0 }, PH: { s: '₱', m: 219, q: 439, y: 1099, d: 2 },
    MX: { s: 'Mex$', m: 99, q: 199, y: 499, d: 2 }, NG: { s: '₦', m: 4299, q: 8599, y: 21499, d: 2 },
    PK: { s: 'Rs', m: 699, q: 1399, y: 3499, d: 2 }, BD: { s: '৳', m: 319, q: 639, y: 1599, d: 2 }
  };
  var TZ2M = { 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'America/Sao_Paulo': 'BR',
    'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
    'Asia/Manila': 'PH', 'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'Africa/Lagos': 'NG',
    'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD' };
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmt(mk, v, floorIt) {
    if (mk.d === 0) return mk.s + grp(Math.round(v));
    if (Number.isInteger(v)) return mk.s + grp(v);
    var r = (floorIt ? Math.floor(v * 100 + 1e-9) : Math.round(v * 100)) / 100;
    var p = r.toFixed(2).split('.');
    return mk.s + grp(p[0]) + '.' + p[1];
  }
  /* Locked starter prices (the 7-day verification cost) — ALL 10 launch
     markets locked 2026-10-22, each above Google Play's official
     per-country minimum price. The generic fallback in updateCTA survives
     only as a safety net for an unmapped market. */
  var STARTERS = { IN: '₹7', US: '$0.99', GB: '£0.99', BR: 'R$4.99', ID: 'Rp9,900',
    PH: '₱49', MX: 'Mex$19', NG: '₦499', PK: 'Rs249', BD: '৳99' };
  var sel = document.getElementById('pricing-region');
  var ctaBlock = document.getElementById('cta-block');
  var market = 'IN', plan = 'quarterly';
  var planTotal = function (mk, p) { return p === 'monthly' ? mk.m : (p === 'yearly' ? mk.y : mk.q); };
  var cadence = function (mk, p) {
    return p === 'monthly' ? fmt(mk, mk.m) + ' a month'
      : (p === 'yearly' ? fmt(mk, mk.y) + ' a year' : fmt(mk, mk.q) + ' every 3 months');
  };
  var updateCTA = function (animate) {
    if (!ctaBlock) return;
    var mk = MARKETS[market] || MARKETS.IN;
    var starter = STARTERS[market];
    var was = ctaBlock.querySelector('[data-cta-was]');
    var now = ctaBlock.querySelector('[data-cta-now]');
    var terms = ctaBlock.querySelector('[data-cta-terms]');
    if (was) was.textContent = fmt(mk, planTotal(mk, plan));
    if (now) now.textContent = starter || 'small starter price';
    if (terms) {
      var sTxt = starter ? starter + ' for your first 7 days' : 'A small starter price for your first 7 days';
      terms.innerHTML = '<b>' + sTxt + '</b>, then ' + cadence(mk, plan) +
        '. Cancel easily anytime in Google Play.';
    }
    if (animate && !reduce) {
      ctaBlock.classList.remove('playing');
      void ctaBlock.offsetWidth; /* restart the strike animation */
      ctaBlock.classList.add('playing');
      setTimeout(function () { ctaBlock.classList.remove('playing'); }, 1400);
    }
  };
  if (sel) {
    var render = function (code) {
      market = code;
      var mk = MARKETS[code] || MARKETS.IN;
      var set = function (kind, key, txt) {
        var el = document.querySelector('[data-' + kind + '="' + key + '"]');
        if (el) el.textContent = txt;
      };
      set('price', 'monthly', fmt(mk, mk.m));
      set('price', 'quarterly', fmt(mk, mk.q));
      set('price', 'yearly', fmt(mk, mk.y));
      set('per', 'monthly', fmt(mk, mk.m) + ' / month · billed monthly');
      set('per', 'quarterly', fmt(mk, mk.q / 3, true) + ' a month · one full 90-day cycle');
      set('per', 'yearly', fmt(mk, mk.y / 12, true) + ' a month · lowest per-month cost');
      set('renew', 'monthly', 'then ' + fmt(mk, mk.m) + ' every month unless you cancel');
      set('renew', 'quarterly', 'then ' + fmt(mk, mk.q) + ' every 3 months unless you cancel');
      set('renew', 'yearly', 'then ' + fmt(mk, mk.y) + ' every year unless you cancel');
      updateCTA(false);
    };
    var detected = 'IN';
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '';
      if (TZ2M[tz]) detected = TZ2M[tz];
      else if (tz.indexOf('America/') === 0) detected = 'US';
    } catch (e) { /* keep IN default */ }
    sel.value = detected;
    render(detected);
    sel.addEventListener('change', function () { render(sel.value); updateCTA(true); });
  }
  /* plan selection: the CTA always reflects the chosen plan's real price */
  var planRows = document.querySelectorAll('.lad-row.plan');
  planRows.forEach(function (row) {
    var choose = function () {
      planRows.forEach(function (r) {
        r.classList.toggle('selected', r === row);
        r.setAttribute('aria-checked', String(r === row));
      });
      plan = row.getAttribute('data-plan') || 'quarterly';
      updateCTA(true);
    };
    row.addEventListener('click', choose);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });
  });
  /* strike animation fires when the pricing section first comes into view */
  if (ctaBlock && 'IntersectionObserver' in window && !reduce) {
    var io3 = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { updateCTA(true); io3.disconnect(); }
    }, { threshold: 0.25 });
    io3.observe(ctaBlock);
  }

  /* ---------- article template: TOC jump links ----------
     Source HTML is untouched; ids are assigned at runtime only.
     Phase 2 fix: the inserted modules (the TOC itself and the two CTA
     cards) carry their own h2 elements inside #main, so the target list
     must exclude any h2 inside a [data-aurora-insert] module — otherwise
     every entry lands on the wrong section (the Phase 1 article too). */
  var toc = document.querySelector('.art-toc');
  if (toc) {
    var heads = Array.prototype.filter.call(
      document.querySelectorAll('#main h2'),
      function (h) { return !h.closest('[data-aurora-insert]'); });
    toc.querySelectorAll('[data-toc]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var i = parseInt(a.getAttribute('data-toc'), 10);
        if (heads[i]) { e.preventDefault(); heads[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
      });
    });
  }
})();

/* ================= ROUND 2 — CAPSULE C1 ================= */
/* Lookauramax Round 2 — capsule header behaviour (frag-capsule.js).
   Coordinator: append to assets/aurora.js. Self-contained guarded block:
   no-ops when the capsule markup is absent. Transform/opacity only;
   passive listeners + rAF throttling; no layout reads in scroll handlers
   beyond scrollY. (a) shrink-in-place at 32px, (b) article "Top" ghost
   button after 700px, (c) homepage active-section gold dot. */
(function () {
  'use strict';
  var header = document.querySelector('.capsule-head');
  if (!header) return;
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- (a) shrink in place: .is-scrolled at 32px ---------- */
  var setScrolled = function (on) {
    header.classList.toggle('is-scrolled', !!on);
  };
  if ('IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'capsule-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(sentinel, document.body.firstChild);
    var sio = new IntersectionObserver(function (entries) {
      setScrolled(!entries[0].isIntersecting);
    }, { threshold: 0 });
    sio.observe(sentinel);
  } else {
    var sTick = false;
    var onScrollA = function () {
      if (sTick) return;
      sTick = true;
      requestAnimationFrame(function () {
        setScrolled(window.scrollY > 32);
        sTick = false;
      });
    };
    window.addEventListener('scroll', onScrollA, { passive: true });
    onScrollA();
  }

  /* ---------- (b) "Top" ghost button on article-type pages ---------- */
  var ARTICLE_BODIES = ['article', 'lam-tools', 'glossary', 'hub'];
  var isArticle = ARTICLE_BODIES.some(function (c) {
    return document.body.classList.contains(c);
  });
  var inner = header.querySelector('.capsule-inner');
  if (isArticle && inner) {
    var topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'capsule-top';
    topBtn.textContent = 'Top ↑';
    topBtn.setAttribute('aria-label', 'Back to top');
    var cta = inner.querySelector('.capsule-cta');
    if (cta) inner.insertBefore(topBtn, cta);
    else inner.appendChild(topBtn);
    var tTick = false;
    var onScrollB = function () {
      if (tTick) return;
      tTick = true;
      requestAnimationFrame(function () {
        topBtn.classList.toggle('show', window.scrollY > 700);
        tTick = false;
      });
    };
    window.addEventListener('scroll', onScrollB, { passive: true });
    onScrollB();
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- (c) homepage: active-section gold dot ---------- */
  var isHome = window.location.pathname === '/' ||
    window.location.pathname === '/index.html';
  var nav = header.querySelector('.capsule-nav');
  if (isHome && nav && 'IntersectionObserver' in window) {
    var SECTION_IDS = ['how', 'lens', 'signals', 'cycle', 'pricing', 'faq'];
    var linkFor = {};
    nav.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hash = href.split('#')[1];
      if (hash && SECTION_IDS.indexOf(hash) !== -1) linkFor[hash] = a;
    });
    var setActive = function (id) {
      Object.keys(linkFor).forEach(function (k) {
        var on = k === id;
        linkFor[k].classList.toggle('is-active', on);
        if (on) linkFor[k].setAttribute('aria-current', 'true');
        else linkFor[k].removeAttribute('aria-current');
      });
    };
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    SECTION_IDS.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec && linkFor[id]) hio.observe(sec);
    });
  }
})();

/* ================= ROUND 2 — MARQUEE PAUSE ================= */
/* Lookauramax Round 2 — marquee pause toggle (frag-marquee.js).
   Coordinator: append to assets/aurora.js. The original marquee was
   pure CSS (MARQUEE-FINDING §5d: no JS); this block exists ONLY for the
   Round-2 WCAG 2.2.2 pause button. Guarded: no-ops without .marquee. */
(function () {
  'use strict';
  var mq = document.querySelector('.marquee');
  if (!mq) return;
  var btn = mq.querySelector('.marquee-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var paused = mq.classList.toggle('paused');
    btn.setAttribute('aria-pressed', String(paused));
    btn.setAttribute('aria-label',
      paused ? 'Resume the Aura features line' : 'Pause the Aura features line');
    /* Icon swap (pause bars <-> play triangle) is CSS-driven off
       [aria-pressed="true"] in frag-marquee.css — no DOM swap needed. */
  });
})();

/* ===== R2 foundation: one-shot reveal observer (coordinator glue) =====
   Adds .is-in once to the Round-2 motion utilities (.mv-rise, .mv-wipe,
   .r2-in, .mv-sweep) when they first enter the viewport, then unobserves.
   Enhancement only: without IO (or with reduced motion) every element is
   put straight into its final state — the CSS start-states are gated
   behind .js + prefers-reduced-motion: no-preference, so content is never
   hidden waiting for this block. */
(function () {
  'use strict';
  var SEL = '.mv-rise, .mv-wipe, .r2-in, .mv-sweep';
  var els = document.querySelectorAll(SEL);
  if (!els.length) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
