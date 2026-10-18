/* Lookauramax — cookie consent + Google Analytics 4 (consent-first).
 *
 * Privacy rules (locked):
 *  - Google Analytics NEVER loads until the visitor clicks "Accept analytics".
 *  - "Decline" is equally prominent — no dark patterns, no pre-ticked boxes,
 *    no nagging. The banner never re-appears after a choice.
 *  - Do Not Track (DNT: 1) is honoured: no banner, no analytics, no storage.
 *  - Google Consent Mode v2 defaults are DENIED (analytics + ads) before any
 *    choice. Ads storage stays denied always — we run no ads.
 *  - No personal data is ever sent to Google Analytics (no user IDs, emails,
 *    or account data). Page views only. GA4 anonymises IP addresses by default.
 *  - The visitor's choice is stored in localStorage on their own device only
 *    (key: lookauramax_cookie_consent). It is never sent anywhere.
 *  - The choice can be changed any time via the "Cookie settings" link in the
 *    footer, or the "Change cookie choice" button on the Privacy page.
 *
 * SETUP (founder): create a Google Analytics 4 property, copy its Measurement
 * ID (looks like G-DNHD5B3MWR), and replace GA_MEASUREMENT_ID below with it.
 * Until the real ID is pasted in, "Accept" stores the choice but loads
 * nothing — the site works exactly as before.
 */
(function () {
  'use strict';

  /* TODO (founder): paste your real GA4 Measurement ID here, e.g. 'G-ABC1234567'. */
  var GA_MEASUREMENT_ID = 'G-DNHD5B3MWR';
  var STORAGE_KEY = 'lookauramax_cookie_consent';
  var GA_CONFIGURED = /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID);

  /* --- Consent Mode v2: deny everything by default, before any script loads. --- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted'
  });

  /* --- Do Not Track: honour it silently — no banner, no analytics, no storage. --- */
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  if (dnt) { return; }

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) { return null; }
      var parsed = JSON.parse(raw);
      return (parsed && (parsed.choice === 'accepted' || parsed.choice === 'declined')) ? parsed.choice : null;
    } catch (e) { return null; }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: choice, at: new Date().toISOString() }));
    } catch (e) { /* storage unavailable (private mode) — banner just shows again next visit */ }
  }

  function loadAnalytics() {
    if (!GA_CONFIGURED) { return; }
    if (document.querySelector('script[data-lam-ga="1"]')) { return; }
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-lam-ga', '1');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    if (window.console && window.console.info) {
      window.console.info('Lookauramax: analytics enabled (you consented). Change any time via "Cookie settings".');
    }
  }

  function hideBanner() {
    var banner = document.getElementById('lam-consent-banner');
    if (banner) { banner.remove(); }
  }

  function showBanner() {
    if (document.getElementById('lam-consent-banner')) { return; }
    var banner = document.createElement('div');
    banner.id = 'lam-consent-banner';
    banner.className = 'lam-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'lam-consent-title');
    banner.innerHTML =
      '<p class="lam-consent-title" id="lam-consent-title">We use cookies for analytics — only if you accept</p>' +
      '<p class="lam-consent-text">If you accept, Google Analytics counts which pages help visitors (no ads, no selling data, no personal info, IP addresses anonymised). If you decline, nothing is loaded and nothing is tracked. Your choice is saved on this device only.</p>' +
      '<div class="lam-consent-actions">' +
        '<button type="button" class="lam-consent-accept">Accept analytics</button>' +
        '<button type="button" class="lam-consent-decline">Decline</button>' +
        '<a class="lam-consent-policy" href="https://lookauramax.com/privacy">Privacy Policy</a>' +
      '</div>';
    document.body.appendChild(banner);
    var acceptBtn = banner.querySelector('.lam-consent-accept');
    var declineBtn = banner.querySelector('.lam-consent-decline');
    acceptBtn.addEventListener('click', function () {
      saveChoice('accepted');
      hideBanner();
      loadAnalytics();
    });
    declineBtn.addEventListener('click', function () {
      saveChoice('declined');
      hideBanner();
    });
    acceptBtn.focus();
  }

  function addFooterLink() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-lam-cookie-settings', '1');
    btn.className = 'lam-cookie-settings';
    btn.textContent = 'Cookie settings';
    btn.addEventListener('click', function () { showBanner(); });
    var slot = document.querySelector('[data-cookie-settings-slot]');
    if (slot) {
      if (slot.querySelector('[data-lam-cookie-settings="1"]')) { return; }
      slot.appendChild(btn);
      return;
    }
    var footer = document.querySelector('footer');
    if (!footer || footer.querySelector('[data-lam-cookie-settings="1"]')) { return; }
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(btn);
  }

  /* Public API: Privacy page "Change cookie choice" button uses this. */
  window.LookauramaxConsent = {
    openSettings: showBanner,
    getChoice: readChoice
  };

  function init() {
    addFooterLink();
    var choice = readChoice();
    if (choice === 'accepted') { loadAnalytics(); return; }
    if (choice === 'declined') { return; }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
