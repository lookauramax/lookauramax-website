/* Lookauramax — SITE DATA: the single source of truth for prices.
 * Round-2 build (Phase 2, pricing stream). Destined for assets/site-data.js.
 *
 * Values are the LOCKED prices in BUILD-SPEC §5 — verified 2026-10-22
 * against the live tables in assets/aurora.js (MARKETS + STARTERS) and
 * assets/pricing.js (MARKETS + STARTERS): all 10 markets, all plan totals
 * and all starters matched the locked table exactly. Prices are manual
 * per-market Google Play prices — never auto-FX, never converted.
 *
 * Load order: this file MUST load before assets/aurora.js on the homepage
 * (see MANIFEST.md). Other pages do not need it.
 */
window.LAM_DATA = {
  /* Per-market prices. monthly / q / y are TOTALS as charged.
   * decimals: display decimals for fractional totals (0 = whole-unit
   * market). starter: the formatted 7-day starter price string.
   * label: the region-selector label for this market. */
  markets: {
    IN: { symbol: '₹',    monthly: 199,   q: 399,    y: 999,    decimals: 2, starter: '₹7',      label: 'India (₹)' },
    US: { symbol: '$',    monthly: 9.99,  q: 19.99,  y: 49.99,  decimals: 2, starter: '$0.99',   label: 'United States ($)' },
    GB: { symbol: '£',    monthly: 6.99,  q: 13.99,  y: 34.99,  decimals: 2, starter: '£0.99',   label: 'United Kingdom (£)' },
    BR: { symbol: 'R$',   monthly: 24.99, q: 49.99,  y: 124.99, decimals: 2, starter: 'R$4.99',  label: 'Brazil (R$)' },
    ID: { symbol: 'Rp',   monthly: 53000, q: 106000, y: 266000, decimals: 0, starter: 'Rp9,900', label: 'Indonesia (Rp)' },
    PH: { symbol: '₱',    monthly: 219,   q: 439,    y: 1099,   decimals: 2, starter: '₱49',     label: 'Philippines (₱)' },
    MX: { symbol: 'Mex$', monthly: 99,    q: 199,    y: 499,    decimals: 2, starter: 'Mex$19',  label: 'Mexico (Mex$)' },
    NG: { symbol: '₦',    monthly: 4299,  q: 8599,   y: 21499,  decimals: 2, starter: '₦499',    label: 'Nigeria (₦)' },
    PK: { symbol: 'Rs',   monthly: 699,   q: 1399,   y: 3499,   decimals: 2, starter: 'Rs249',   label: 'Pakistan (Rs)' },
    BD: { symbol: '৳',    monthly: 319,   q: 639,    y: 1599,   decimals: 2, starter: '৳99',     label: 'Bangladesh (৳)' }
  },

  /* The three plans — and only three. The starter week is a property of
   * every plan, never a plan itself. totalKey points into a market row.
   * period: the word used in the terms line ("every [period]").
   * perSuffix: the line that follows the floored per-month figure. */
  plans: [
    { id: 'monthly',   label: 'Monthly',  months: 1,  totalKey: 'monthly', period: 'month',
      perMonthlySuffix: ' / month · billed monthly',
      perSuffix: ' / month · billed monthly' },
    { id: 'quarterly', label: '3-Month',  months: 3,  totalKey: 'q',       period: '3 months',
      perSuffix: ' a month · one full 90-day cycle' },
    { id: 'yearly',    label: 'Yearly',   months: 12, totalKey: 'y',       period: 'year',
      perSuffix: ' a month · lowest per-month cost' }
  ],

  /* Starters as a flat map (same values as markets[*].starter), for any
   * consumer that only needs the starter string per market. */
  starters: {
    IN: '₹7', US: '$0.99', GB: '£0.99', BR: 'R$4.99', ID: 'Rp9,900',
    PH: '₱49', MX: 'Mex$19', NG: '₦499', PK: 'Rs249', BD: '৳99'
  },

  /* Terms-line template pieces (BUILD-SPEC §5). The rendered line is:
   *   "<b>[starter] for your first 7 days</b>, then [price] every
   *    [period]. Cancel easily anytime in Google Play."
   * Assembled by frag-pricing.js from these pieces + the market/plan. */
  terms: {
    starterLead: ' for your first 7 days',
    thenLead: ', then ',
    everyLead: ' every ',
    cancelTail: '. Cancel easily anytime in Google Play.',
    renewSuffix: ' unless you cancel',
    renewLead: 'then '
  },

  defaultMarket: 'IN'
};
