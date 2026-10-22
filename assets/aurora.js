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

  /* Lookauramax — Round-2 pricing fragment (Phase 2, pricing stream).
 *
 * REPLACES the "region pricing (plans only)" block inside assets/aurora.js
 * at integration (see MANIFEST.md for the exact span to remove). Append
 * this block where that block was; it is a self-contained guarded IIFE
 * that no-ops when the pricing elements are absent.
 *
 * Data: reads window.LAM_DATA (assets/site-data.js, loaded before
 * aurora.js). FALLBACK DECISION: if LAM_DATA failed to load, an embedded
 * copy of the IN + US rows only is used, so the section still renders
 * truthful locked prices for the two most-documented markets; any other
 * selected/detected market falls back to the IN row rather than
 * inventing a price. This is documented in MANIFEST.md.
 *
 * Preserved live behaviours (ported from the current aurora.js block):
 *  - initial render = detected market (timezone map below, ported
 *    verbatim; any other America/* timezone => US; default IN);
 *  - #pricing-region change re-renders;
 *  - .lad-row.plan click / Enter / Space selects the plan (selected
 *    class + aria-checked) and the CTA follows the selected plan;
 *  - strike animation on first view (IntersectionObserver) — now via
 *    the .strike-in class from frag-pricing.css;
 *  - price-roll hook: on a USER region change only, price/per figures
 *    route through window.__lamPriceRoll when present (the hook the
 *    legacy pricing.js used; initial render and renew lines never roll).
 *
 * Fixes vs the live block:
 *  - per-month = WHOLE-UNIT FLOOR of total / months, formatted with no
 *    decimals (₹83, $4) — the live code floored only to 2 decimals and
 *    rendered ₹83.25 / $4.16;
 *  - terms line follows the SELECTED plan in the SELECTED market, in
 *    the locked shape: "[starter] for your first 7 days, then [price]
 *    every [month|3 months|year]. Cancel easily anytime in Google Play.";
 *  - struck CTA animates on plan switch AND on first view (.strike-in,
 *    re-armed on every plan switch; transform/opacity only in CSS).
 */
(function () {
  'use strict';

  var sel = document.getElementById('pricing-region');
  var ctaBlock = document.getElementById('cta-block');
  var planRows = document.querySelectorAll('.lad-row.plan');
  if (!sel && !ctaBlock && !planRows.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data (LAM_DATA, with embedded IN+US fallback) ---------- */
  var FALLBACK = {
    markets: {
      IN: { symbol: '₹', monthly: 199, q: 399, y: 999, decimals: 2, starter: '₹7' },
      US: { symbol: '$', monthly: 9.99, q: 19.99, y: 49.99, decimals: 2, starter: '$0.99' }
    },
    plans: [
      { id: 'monthly', months: 1, totalKey: 'monthly', period: 'month', perSuffix: ' / month · billed monthly' },
      { id: 'quarterly', months: 3, totalKey: 'q', period: '3 months', perSuffix: ' a month · one full 90-day cycle' },
      { id: 'yearly', months: 12, totalKey: 'y', period: 'year', perSuffix: ' a month · lowest per-month cost' }
    ],
    defaultMarket: 'IN'
  };
  var DATA = (window.LAM_DATA && window.LAM_DATA.markets && window.LAM_DATA.plans)
    ? window.LAM_DATA : FALLBACK;
  var PLANS = {};
  DATA.plans.forEach(function (p) { PLANS[p.id] = p; });

  function marketRow(code) {
    return DATA.markets[code] || DATA.markets[DATA.defaultMarket || 'IN'];
  }
  function planTotal(mk, planId) {
    var p = PLANS[planId] || PLANS.quarterly;
    return mk[p.totalKey];
  }

  /* ---------- detection (ported verbatim from live aurora.js) ------- */
  var TZ2M = { 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'America/Sao_Paulo': 'BR',
    'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
    'Asia/Manila': 'PH', 'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'Africa/Lagos': 'NG',
    'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD' };
  function detectMarket() {
    var detected = 'IN';
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '';
      if (TZ2M[tz]) detected = TZ2M[tz];
      else if (tz.indexOf('America/') === 0) detected = 'US';
    } catch (e) { /* keep IN default */ }
    /* With the fallback data set, an unmapped detected market renders
       the IN row (marketRow) — the select is left as detected so the
       visitor sees their market named; prices stay truthful. */
    return detected;
  }

  /* ---------- formatting -------------------------------------------- */
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  /* Totals: whole amounts show no decimals (₹199, Mex$99); fractional
     totals show 2 decimals ($9.99); zero-decimal markets round whole. */
  function fmtTotal(mk, v) {
    if (mk.decimals === 0) return mk.symbol + grp(Math.round(v));
    if (Number.isInteger(v)) return mk.symbol + grp(v);
    var p = (Math.round(v * 100) / 100).toFixed(2).split('.');
    return mk.symbol + grp(p[0]) + '.' + p[1];
  }
  /* Per-month: WHOLE-UNIT FLOOR of total / months — never fractional. */
  function fmtPerMonth(mk, total, months) {
    return mk.symbol + grp(Math.floor(total / months));
  }

  /* ---------- state + rendering ------------------------------------- */
  var market = detectMarket();
  var plan = 'quarterly';

  function setText(kind, key, txt, roll) {
    var el = document.querySelector('[data-' + kind + '="' + key + '"]');
    if (!el) return;
    if (roll && window.__lamPriceRoll) { window.__lamPriceRoll(el, txt); return; }
    el.textContent = txt;
  }

  function playStrike() {
    if (!ctaBlock || reduce) return;
    ctaBlock.classList.remove('strike-in');
    void ctaBlock.offsetWidth; /* restart the one-shot animation */
    ctaBlock.classList.add('strike-in');
  }

  function updateCTA(animate) {
    if (!ctaBlock) return;
    var mk = marketRow(market);
    var p = PLANS[plan] || PLANS.quarterly;
    var was = ctaBlock.querySelector('[data-cta-was]');
    var now = ctaBlock.querySelector('[data-cta-now]');
    var terms = ctaBlock.querySelector('[data-cta-terms]');
    if (was) was.textContent = fmtTotal(mk, planTotal(mk, plan));
    if (now) now.textContent = mk.starter;
    if (terms) {
      terms.innerHTML = '<b>' + mk.starter + ' for your first 7 days</b>, then ' +
        fmtTotal(mk, planTotal(mk, plan)) + ' every ' + p.period +
        '. Cancel easily anytime in Google Play.';
    }
    if (animate) playStrike();
  }

  function render(code, opts) {
    market = code;
    var roll = !!(opts && opts.roll);
    var mk = marketRow(code);
    DATA.plans.forEach(function (p) {
      var total = mk[p.totalKey];
      setText('price', p.id, fmtTotal(mk, total), roll);
      setText('per', p.id,
        p.months === 1
          ? fmtTotal(mk, total) + p.perSuffix
          : fmtPerMonth(mk, total, p.months) + p.perSuffix,
        roll);
      setText('renew', p.id,
        'then ' + fmtTotal(mk, total) + ' every ' + p.period + ' unless you cancel', false);
    });
    updateCTA(false);
  }

  if (sel) {
    sel.value = market;
    render(market);
    sel.addEventListener('change', function () { render(sel.value, { roll: true }); });
  } else {
    render(market);
  }

  /* ---------- plan selection ---------------------------------------- */
  planRows.forEach(function (row) {
    if (row.classList.contains('selected')) {
      plan = row.getAttribute('data-plan') || 'quarterly';
      updateCTA(false);
    }
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
      if (entries[0].isIntersecting) { playStrike(); io3.disconnect(); }
    }, { threshold: 0.25 });
    io3.observe(ctaBlock);
  }
})();

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
