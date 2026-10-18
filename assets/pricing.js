/* Lookauramax — automatic region pricing (website display only).
 *
 * Detection uses the visitor's own device timezone + language, entirely
 * in the browser. Nothing is sent, stored, or tracked. No IP lookup.
 *
 * Prices are the LOCKED manual local prices for the 10 launch markets
 * (never auto-FX, never converted). Savings are always floored, never
 * rounded up. No-JS fallback: the page ships with USD prices in HTML.
 */
(function () {
  'use strict';

  /* LOCKED price table — totals as charged: Monthly / 3-Month / 6-Month / Yearly. */
  var MARKETS = {
    US: { symbol: '$',    monthly: 9.99,  q: 19.99,  h: 29.99,  y: 49.99,  decimals: 2 },
    IN: { symbol: '₹',    monthly: 199,   q: 399,    h: 599,    y: 999,    decimals: 2 },
    GB: { symbol: '£',    monthly: 6.99,  q: 13.99,  h: 20.99,  y: 34.99,  decimals: 2 },
    BR: { symbol: 'R$',   monthly: 24.99, q: 49.99,  h: 74.99,  y: 124.99, decimals: 2 },
    ID: { symbol: 'Rp',   monthly: 53000, q: 106000, h: 160000, y: 266000, decimals: 0 },
    PH: { symbol: '₱',    monthly: 219,   q: 439,    h: 659,    y: 1099,   decimals: 2 },
    MX: { symbol: 'Mex$', monthly: 99,    q: 199,    h: 299,    y: 499,    decimals: 2 },
    NG: { symbol: '₦',    monthly: 4299,  q: 8599,   h: 12899,  y: 21499,  decimals: 2 },
    PK: { symbol: 'Rs',   monthly: 699,   q: 1399,   h: 2099,   y: 3499,   decimals: 2 },
    BD: { symbol: '৳',    monthly: 319,   q: 639,    h: 959,    y: 1599,   decimals: 2 }
  };

  /* IANA timezone -> market. Only the 10 launch markets are mapped;
   * everything else falls through to the USD default. */
  var TZ = {
    'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Europe/London': 'GB',
    'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR',
    'America/Belem': 'BR', 'America/Manaus': 'BR', 'America/Cuiaba': 'BR',
    'America/Campo_Grande': 'BR', 'America/Porto_Velho': 'BR',
    'America/Boa_Vista': 'BR', 'America/Rio_Branco': 'BR',
    'America/Eirunepe': 'BR', 'America/Araguaina': 'BR', 'America/Bahia': 'BR',
    'America/Santarem': 'BR', 'America/Maceio': 'BR', 'America/Aracaju': 'BR',
    'America/Joao_Pessoa': 'BR', 'America/Natal': 'BR', 'America/Teresina': 'BR',
    'America/Curitiba': 'BR', 'America/Florianopolis': 'BR',
    'America/Goiania': 'BR', 'America/Vitoria': 'BR', 'America/Palmas': 'BR',
    'America/Porto_Acre': 'BR',
    'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'America/Merida': 'MX',
    'America/Monterrey': 'MX', 'America/Mazatlan': 'MX',
    'America/Chihuahua': 'MX', 'America/Hermosillo': 'MX',
    'America/Tijuana': 'MX', 'America/Bahia_Banderas': 'MX',
    'America/Ojinaga': 'MX',
    'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID', 'Asia/Makassar': 'ID',
    'Asia/Jayapura': 'ID',
    'Asia/Manila': 'PH',
    'Africa/Lagos': 'NG',
    'Asia/Karachi': 'PK',
    'Asia/Dhaka': 'BD',
    'America/New_York': 'US', 'America/Detroit': 'US',
    'America/Kentucky/Louisville': 'US', 'America/Kentucky/Monticello': 'US',
    'America/Indiana/Indianapolis': 'US', 'America/Indiana/Vincennes': 'US',
    'America/Indiana/Winamac': 'US', 'America/Indiana/Marengo': 'US',
    'America/Indiana/Petersburg': 'US', 'America/Indiana/Vevay': 'US',
    'America/Chicago': 'US', 'America/Indiana/Tell_City': 'US',
    'America/Indiana/Knox': 'US', 'America/Menominee': 'US',
    'America/North_Dakota/Center': 'US', 'America/North_Dakota/New_Salem': 'US',
    'America/North_Dakota/Beulah': 'US', 'America/Denver': 'US',
    'America/Boise': 'US', 'America/Phoenix': 'US',
    'America/Los_Angeles': 'US', 'America/Anchorage': 'US',
    'America/Juneau': 'US', 'America/Sitka': 'US', 'America/Metlakatla': 'US',
    'America/Yakutat': 'US', 'America/Nome': 'US', 'America/Adak': 'US',
    'Pacific/Honolulu': 'US', 'America/Puerto_Rico': 'US',
    'America/St_Thomas': 'US', 'America/St_Croix': 'US',
    'Pacific/Pago_Pago': 'US', 'Pacific/Guam': 'US', 'Pacific/Saipan': 'US',
    'Pacific/Midway': 'US', 'Pacific/Wake': 'US'
  };

  /* Browser locale -> market. Full locales (en-IN) win; bare codes are
   * only mapped when unambiguous (hi, id, tl, ur). Bare 'en'/'es'/'pt'
   * are NOT mapped — they fall through to the USD default. */
  var LANG = {
    'en-in': 'IN', 'hi': 'IN', 'mr': 'IN', 'ta': 'IN', 'te': 'IN', 'kn': 'IN',
    'ml': 'IN', 'gu': 'IN', 'pa': 'IN', 'as': 'IN', 'or': 'IN',
    'en-gb': 'GB',
    'pt-br': 'BR', 'en-br': 'BR',
    'es-mx': 'MX', 'en-mx': 'MX',
    'id': 'ID', 'en-id': 'ID',
    'tl': 'PH', 'fil': 'PH', 'en-ph': 'PH',
    'ha': 'NG', 'yo': 'NG', 'ig': 'NG', 'en-ng': 'NG',
    'ur': 'PK', 'en-pk': 'PK',
    'bn-bd': 'BD', 'bn': 'BD', 'en-bd': 'BD',
    'en-us': 'US', 'es-us': 'US'
  };

  function detectMarket() {
    try {
      var tz = (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone || '';
      if (TZ[tz]) return TZ[tz];
    } catch (e) { /* fall through to language */ }
    try {
      var langs = [];
      if (typeof navigator !== 'undefined') {
        if (navigator.languages) langs = navigator.languages;
        if (navigator.language) langs = [navigator.language].concat(langs);
      }
      for (var i = 0; i < langs.length; i++) {
        var l = String(langs[i] || '').toLowerCase();
        if (LANG[l]) return LANG[l];
        var base = l.split('-')[0];
        if (LANG[base]) return LANG[base];
      }
    } catch (e) { /* fall through to default */ }
    return 'US';
  }

  function groupThousands(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* Whole amounts show no decimals (₹199, Mex$99); fractional amounts
   * show 2 decimals ($5.00, ₹99.83); zero-decimal markets round whole. */
  function fmt(m, value) {
    if (m.decimals === 0) return m.symbol + groupThousands(Math.round(value));
    /* Exact whole amounts show no decimals (₹199, ₹133); anything that
     * merely ROUNDS to whole still shows 2 decimals ($5.00, not $5). */
    if (Number.isInteger(value)) return m.symbol + groupThousands(value);
    var rounded = Math.round(value * 100) / 100;
    var parts = rounded.toFixed(2).split('.');
    return m.symbol + groupThousands(parts[0]) + '.' + parts[1];
  }

  /* Savings are ALWAYS floored, never rounded up. */
  function savePct(months, monthly, total) {
    return Math.floor((months * monthly - total) / (months * monthly) * 100);
  }

  function setText(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }
  function setHtml(sel, html) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function render(code) {
    var m = MARKETS[code] || MARKETS.US;
    var qSave = savePct(3, m.monthly, m.q);
    var hSave = savePct(6, m.monthly, m.h);
    var ySave = savePct(12, m.monthly, m.y);
    var save2x = Math.floor((2 * m.q - m.h) / (2 * m.q) * 100);

    setText('[data-price="monthly"]', fmt(m, m.monthly));
    setHtml('[data-price="quarterly"]', fmt(m, m.q) + ' <small>total</small>');
    setHtml('[data-price="halfyearly"]', fmt(m, m.h) + ' <small>total</small>');
    setHtml('[data-price="yearly"]', fmt(m, m.y) + ' <small>total</small>');

    setText('[data-per="monthly"]', fmt(m, m.monthly) + ' / month · billed monthly');
    setHtml('[data-per="quarterly"]',
      fmt(m, m.q / 3) + ' / month · Save ' + qSave + '%<br>One full 90-day cycle');
    setHtml('[data-per="halfyearly"]',
      fmt(m, m.h / 6) + ' / month · Save ' + hSave + '%<br>Two full 90-day cycles');
    setHtml('[data-per="yearly"]',
      fmt(m, m.y / 12) + ' / month · Save ' + ySave + '%<br>Lowest per-month cost');
    setText('[data-save2x]', 'Save ' + save2x + '% vs 2× 3-Month');
  }

  var select = document.getElementById('pricing-region');
  if (!select) return;
  select.value = detectMarket();
  render(select.value);
  select.addEventListener('change', function () { render(select.value); });
})();
