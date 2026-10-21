/* landing-motion.js — homepage-only logic-driven motion for the 12 improvements.
   No libraries. Every animation is triggered by real state (scroll into view,
   region selection, real clicks) — nothing loops forever. Content is visible
   by default; JS only adds animation states. Reduced-motion users get static
   content: every feature below early-returns there. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- #2 Word rotator: visibility-gated, stops after 2 full cycles ---------- */
  var rotator = document.querySelector('.rotator-word');
  if (rotator && !reduce) {
    var words = ['skin', 'hair', 'brows', 'opt-in beard', 'smile', 'posture', 'photo quality'];
    var rIdx = 0, rSwaps = 0, rTimer = null, rVisible = false;
    function rSchedule() {
      clearTimeout(rTimer);
      if (rVisible && rSwaps < 14) rTimer = setTimeout(rTick, 2500);
    }
    function rTick() {
      if (!rVisible || rSwaps >= 14) return;
      rotator.classList.add('is-out');
      setTimeout(function () {
        rIdx = (rIdx + 1) % words.length;
        rotator.textContent = words[rIdx];
        rotator.classList.remove('is-out');
        rSwaps++;
        rSchedule();
      }, 300);
    }
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        rVisible = entries[0].isIntersecting;
        rSchedule();
      }, { threshold: 0.1 }).observe(rotator);
    } else { rVisible = true; rSchedule(); }
  }

  /* ---------- #4 Value shuffle: one pass through 5 differentiators, then settles ---------- */
  var shuffleEl = document.querySelector('.value-shuffle-word');
  if (shuffleEl && !reduce) {
    var values = ['Never scores attractiveness', 'Every score shows Why + Action',
      'Honest pricing, shown openly', 'Easy to cancel', 'No weekly billing trap'];
    var vIdx = 0, vSwaps = 0, vTimer = null, vVisible = false, vHover = false;
    var shuffleBox = document.querySelector('.value-shuffle');
    function vSchedule() {
      clearTimeout(vTimer);
      if (vVisible && !vHover && vSwaps < 5) vTimer = setTimeout(vTick, 3000);
    }
    function vTick() {
      if (!vVisible || vHover || vSwaps >= 5) return;
      shuffleEl.classList.add('is-out');
      setTimeout(function () {
        vIdx = (vIdx + 1) % values.length;
        shuffleEl.textContent = values[vIdx];
        shuffleEl.classList.remove('is-out');
        vSwaps++;
        vSchedule();
      }, 350);
    }
    if (shuffleBox) {
      shuffleBox.addEventListener('mouseenter', function () { vHover = true; clearTimeout(vTimer); });
      shuffleBox.addEventListener('mouseleave', function () { vHover = false; vSchedule(); });
      shuffleBox.addEventListener('focusin', function () { vHover = true; clearTimeout(vTimer); });
      shuffleBox.addEventListener('focusout', function () { vHover = false; vSchedule(); });
    }
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        vVisible = entries[0].isIntersecting;
        vSchedule();
      }, { threshold: 0.1 }).observe(shuffleEl);
    } else { vVisible = true; vSchedule(); }
  }

  /* ---------- #5 Honest count-up stats: fire once on scroll into view ---------- */
  var stats = document.querySelector('.stats-strip');
  if (stats && !reduce && hasIO) {
    var statIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      statIO.disconnect();
      stats.querySelectorAll('.stat-num').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        var start = null, dur = 900;
        (function frame(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) { requestAnimationFrame(frame); } else { el.textContent = String(target); }
        })(performance.now());
      });
    }, { threshold: 0.3 });
    statIO.observe(stats);
  }

  /* ---------- #3 Milestone pings: stack in once on scroll into view ---------- */
  var pings = document.getElementById('milestone-pings');
  if (pings && !reduce && hasIO) {
    pings.classList.add('pings-anim');
    var pingIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { pings.classList.add('in-view'); pingIO.disconnect(); }
    }, { threshold: 0.3 });
    pingIO.observe(pings);
  }

  /* ---------- #6 Bento: fade/rise staggered once on scroll into view ---------- */
  var bento = document.getElementById('bento');
  if (bento && !reduce && hasIO) {
    bento.classList.add('bento-anim');
    var bentoIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { bento.classList.add('in-view'); bentoIO.disconnect(); }
    }, { threshold: 0.15 });
    bentoIO.observe(bento);
  }

  /* ---------- #8 Process draw: gold line draws once on scroll into view ---------- */
  var howSteps = document.getElementById('how-steps');
  var howLine = document.querySelector('.how-line');
  if (howSteps && howLine && !reduce && hasIO) {
    howLine.classList.add('is-hidden');
    var howIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        howLine.classList.remove('is-hidden');
        howIO.disconnect();
      }
    }, { threshold: 0.3 });
    howIO.observe(howSteps);
  }

  /* ---------- #7 Cursor tour: one guided glide to the explorer's first chip.
     Visual only — never dispatches a click. Dies on the first real interaction. ---------- */
  var preview = document.querySelector('.preview');
  var chips = document.querySelectorAll('#preview-chips button');
  if (preview && chips.length && !reduce && finePointer && hasIO) {
    var tourDone = false, tourStarted = false, chipsUsed = false, tourTimer = null;
    var cursorEl = null, rippleEl = null;
    function killTour() {
      tourDone = true;
      clearTimeout(tourTimer);
      if (cursorEl) { cursorEl.remove(); cursorEl = null; }
      if (rippleEl) { rippleEl.remove(); rippleEl = null; }
    }
    chips.forEach(function (b) {
      b.addEventListener('click', function () { chipsUsed = true; killTour(); });
    });
    document.addEventListener('pointerdown', killTour, { once: true });
    document.addEventListener('keydown', killTour, { once: true });
    var tourIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || tourStarted || tourDone || chipsUsed) return;
      tourIO.disconnect();
      tourStarted = true;
      tourTimer = setTimeout(runTour, 600);
    }, { threshold: 0.4 });
    tourIO.observe(preview);
    function runTour() {
      if (tourDone || chipsUsed) return;
      var target = chips[0].getBoundingClientRect();
      if (target.bottom < 0 || target.top > window.innerHeight) return;
      var tx = target.left + target.width / 2;
      var ty = target.top + target.height / 2;
      cursorEl = document.createElement('div');
      cursorEl.className = 'lam-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');
      cursorEl.innerHTML = '<svg viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M4 2 L4 20 L8.5 16.5 L11 23 L13.5 22 L11 15.5 L18 15 Z" fill="#F5F0E6" stroke="#000" stroke-width="1.5"/></svg>';
      document.body.appendChild(cursorEl);
      cursorEl.style.left = (tx - 140) + 'px';
      cursorEl.style.top = (ty - 110) + 'px';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (!cursorEl) return;
          cursorEl.classList.add('is-shown');
          cursorEl.style.left = tx + 'px';
          cursorEl.style.top = ty + 'px';
          setTimeout(function () {
            if (!cursorEl) return;
            rippleEl = document.createElement('div');
            rippleEl.className = 'lam-ripple';
            rippleEl.setAttribute('aria-hidden', 'true');
            rippleEl.style.left = tx + 'px';
            rippleEl.style.top = ty + 'px';
            document.body.appendChild(rippleEl);
            requestAnimationFrame(function () {
              if (rippleEl) rippleEl.classList.add('is-out');
            });
            setTimeout(function () {
              if (cursorEl) { cursorEl.remove(); cursorEl = null; }
              if (rippleEl) { rippleEl.remove(); rippleEl = null; }
            }, 600);
          }, 750);
        });
      });
    }
  }

  /* ---------- #9 Before/after slider: range input drives the Measured clip ---------- */
  var baRange = document.getElementById('ba-range');
  var baMeasured = document.querySelector('.ba-measured');
  var baHandle = document.getElementById('ba-handle');
  if (baRange && baMeasured && baHandle) {
    baRange.addEventListener('input', function () {
      var v = parseInt(baRange.value, 10);
      baMeasured.style.clipPath = 'inset(0 0 0 ' + v + '%)';
      baHandle.style.left = v + '%';
    });
  }

  /* ---------- #10 Price roll: per-digit odometer on region change.
     Called by pricing.js ONLY for change events (never initial render).
     After the roll, the exact pricing.js HTML is restored. ---------- */
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function stripTags(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }
  window.__lamPriceRoll = function (el, html) {
    if (reduce) { el.innerHTML = html; return; }
    var newText = stripTags(html).trim();
    var m = newText.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) { el.innerHTML = html; return; }
    var newPrefix = m[1], newNum = m[2];
    var oldText = (el.textContent || '').trim();
    var om = oldText.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
    var oldNum = om ? om[2] : '';
    var oldDigits = oldNum.replace(/\D/g, '');
    var newDigits = newNum.replace(/\D/g, '');
    if (!oldDigits || oldDigits === newDigits) { el.innerHTML = html; return; }
    if (el._lamRollT) { clearTimeout(el._lamRollT); }
    var out = '';
    if (newPrefix) out += '<span class="od-static">' + escapeHtml(newPrefix) + '</span>';
    var digitFromLeft = 0;
    newNum.split('').forEach(function (ch) {
      if (ch >= '0' && ch <= '9') {
        var r = newDigits.length - 1 - digitFromLeft; /* position from the right */
        var oldD = (r < oldDigits.length) ? parseInt(oldDigits.charAt(oldDigits.length - 1 - r), 10) : 0;
        var newD = parseInt(ch, 10);
        var steps = (newD - oldD + 10) % 10;
        var strip = '';
        for (var d = 0; d < 20; d++) strip += '<span>' + (d % 10) + '</span>';
        out += '<span class="od-col"><span class="od-strip" data-start="' + oldD +
          '" data-end="' + (oldD + steps) + '">' + strip + '</span></span>';
        digitFromLeft++;
      } else {
        out += '<span class="od-static">' + escapeHtml(ch) + '</span>';
      }
    });
    el.innerHTML = out;
    el.querySelectorAll('.od-strip').forEach(function (stripEl) {
      stripEl.style.transform = 'translateY(-' + stripEl.getAttribute('data-start') + 'em)';
    });
    /* Force reflow so the transition runs from the old digit to the new one. */
    void el.offsetHeight;
    el.querySelectorAll('.od-strip').forEach(function (stripEl) {
      stripEl.style.transform = 'translateY(-' + stripEl.getAttribute('data-end') + 'em)';
    });
    el._lamRollT = setTimeout(function () {
      el.innerHTML = html;
      el._lamRollT = null;
    }, 560);
  };

  /* ---------- #12 Click → success ---------- */
  /* Primary CTAs: press → check micro-state. Navigation still proceeds;
     the check is "pressed and going", never a fake confirmation. */
  document.querySelectorAll('.btn-gold[href^="#"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.lamChecked === '1') return;
      var arrow = btn.querySelector('.btn-arrow');
      if (arrow) {
        if (arrow.textContent.trim() === '→') {
          btn.dataset.lamChecked = '1';
          arrow.textContent = '✓';
          setTimeout(function () { arrow.textContent = '→'; btn.dataset.lamChecked = ''; }, 700);
        }
        return;
      }
      var t = btn.textContent;
      if (t && t.indexOf('→') !== -1) {
        btn.dataset.lamChecked = '1';
        btn.textContent = t.replace('→', '✓');
        setTimeout(function () { btn.textContent = t; btn.dataset.lamChecked = ''; }, 700);
      }
    });
  });

  /* Support email: click copies the address and shows "Copied ✓"
     AND lets the mailto proceed, so the mail app still opens.
     Never block mailto — copy is a bonus, not a replacement. */
  document.querySelectorAll('a[href^="mailto:support@lookauramax.com"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var addr = 'support@lookauramax.com';
      function done() {
        var original = a.textContent;
        a.textContent = 'Copied ✓';
        setTimeout(function () { a.textContent = original; }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = addr;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (err) { /* clipboard unavailable */ }
        ta.remove();
        done();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(done, function () { fallbackCopy(); });
      } else { fallbackCopy(); }
    });
  });
})();
