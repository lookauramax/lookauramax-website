/* Lookauramax — GA4 event layer (Plan v2 §9.2.9).
 *
 * Events fire only when gtag exists. Consent Mode v2 defaults are DENIED,
 * so GA itself decides whether anything is collected — this layer never
 * bypasses consent, never sends personal data, and never stores anything.
 *
 * Spec: launch_cta_click, launch_signup_submit, launch_signup_confirmed
 * (fired by the future confirmation page via window.__lamEvent),
 * tool_start, tool_complete, guide_to_tool_click, pricing_view,
 * plan_select, play_store_click.
 */
(function () {
  'use strict';

  function ev(name, params) {
    if (typeof window.gtag !== 'function') return;
    try { window.gtag('event', name, params || {}); } catch (e) { /* never break the page */ }
  }
  window.__lamEvent = ev;

  function on(sel, type, fn) {
    document.addEventListener(type, function (e) {
      var el = e.target && e.target.closest ? e.target.closest(sel) : null;
      if (el) fn(el, e);
    }, true);
  }

  /* Launch list CTAs (site-wide standard CTA blocks + pricing rows). */
  on('a[href$="#launch"]', 'click', function (el) {
    ev('launch_cta_click', { link_text: (el.textContent || '').trim().slice(0, 60) });
  });

  /* Google Play links (pre-registration / store listing, when live). */
  on('a[href*="play.google.com"]', 'click', function () {
    ev('play_store_click', {});
  });

  /* Guide/content pages -> tools. */
  on('a[href^="/tools/"], a[href*="lookauramax.com/tools/"]', 'click', function (el) {
    if (location.pathname.indexOf('/tools') !== 0) {
      ev('guide_to_tool_click', { tool: el.getAttribute('href') });
    }
  });

  /* Plan selection: region change + pricing-row CTA clicks. */
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'pricing-region') {
      ev('plan_select', { market: e.target.value });
    }
  }, true);
  on('.price-row .btn', 'click', function (el) {
    var row = el.closest('.price-row');
    var name = row && row.querySelector('.p-name') ? row.querySelector('.p-name').textContent : '';
    ev('plan_select', { plan: (name || '').trim() });
  });

  /* Pricing section viewed (homepage). */
  var pv = document.getElementById('pricing');
  if (pv && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { ev('pricing_view', {}); io.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(pv);
  }

  /* Launch-list submit (form is disabled until sign-ups open; wiring ready). */
  var lf = document.querySelector('.launch-form');
  if (lf) {
    lf.addEventListener('submit', function () { ev('launch_signup_submit', {}); });
  }

  /* Tool engagement: first interaction inside the tool = start; a result
   * area gaining content or a .show class = complete. Tool pages only. */
  var isTool = location.pathname.indexOf('/tools/') === 0 &&
    !/\/tools\/?$/.test(location.pathname) && location.pathname.indexOf('/tools/index') < 0;
  if (isTool) {
    var started = false;
    function start() {
      if (!started) { started = true; ev('tool_start', { tool: location.pathname }); }
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.closest && e.target.closest('main')) start();
    }, true);
    document.addEventListener('input', start, true);

    var completed = false;
    var targets = document.querySelectorAll(
      '[id*="result" i], [class*="result"], [id*="output" i], [class*="output"]');
    if (targets.length && 'MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (completed) return;
        for (var i = 0; i < targets.length; i++) {
          var el = targets[i];
          var hasText = (el.textContent || '').trim().length > 0;
          var shown = el.classList && el.classList.contains('show');
          if (hasText && (shown || el.offsetParent !== null)) {
            completed = true;
            ev('tool_complete', { tool: location.pathname });
            mo.disconnect();
            break;
          }
        }
      });
      targets.forEach(function (el) {
        mo.observe(el, {
          childList: true, subtree: true, characterData: true,
          attributes: true, attributeFilter: ['class', 'style']
        });
      });
    }
  }
})();
