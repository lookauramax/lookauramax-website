# Monthly-plan supplementary panel — LOG 2026-10

Instrument: `SUPPLEMENTARY-MONTHLY-PANEL.md` (frozen series, decision D-R4-5).

## Run header

| Field | Value |
|---|---|
| Run date | 2026-10-23 (evening IST) |
| Runner | Main agent (browser tasks, 4 engines) |
| Site state | Pre-launch. /monthly-plan hub went LIVE during the run (~20:04 IST) but was not indexed by any engine at run time — baseline = post-publication, pre-indexing; answers reflect the pre-hub web. |
| Changes since last run | First run (baseline). Wave 1 truth release + Wave 2 batches landed earlier today. |
| Engine sign-in states | ChatGPT: signed OUT (stranger's view). Gemini: signed OUT (Flash-Lite). AI Overviews: NOT signed in. Perplexity: sign-in WALL — 0 measurable answers, retry next run. |

## Results — one row per prompt × engine

| # | Prompt | Engine | Named? (Y/N) | Cited URL (ours, if any) | Accurate? (Y / N / Partial / n/a) | Accuracy issue (exact wrong claim, quoted) | Action taken |
|---|---|---|---|---|---|---|---|
| 1 | what's this month's grooming plan for men | ChatGPT | N | — | n/a | — | — |
| 1 | what's this month's grooming plan for men | Gemini | N | — | n/a | — (answer: October seasonal grooming plan citing salon/magazine sources) | — |
| 1 | what's this month's grooming plan for men | AI Overviews | N | — | n/a | — | — |
| 2 | best monthly glow-up plan for men | ChatGPT | N | — | n/a | — | — |
| 2 | best monthly glow-up plan for men | Gemini | N | — | n/a | — (answer: 4-week blueprint, no apps named) | — |
| 2 | best monthly glow-up plan for men | AI Overviews | N | — | n/a | — | — |
| 3 | men's grooming plan for November 2026 | ChatGPT | N | — | n/a | — | — |
| 3 | men's grooming plan for November 2026 | Gemini | N | — | n/a | — (answer was a questionnaire, not a plan; not followed up per method) | — |
| 3 | men's grooming plan for November 2026 | AI Overviews | N | — | n/a | — | — |
| 4 | monthly skincare plan for men November 2026 | ChatGPT | N | — | n/a | — | — |
| 4 | monthly skincare plan for men November 2026 | Gemini | N | — | n/a | — (full November skincare plan, no brand/app mentions) | — |
| 4 | monthly skincare plan for men November 2026 | AI Overviews | N | — | n/a | — | — |
| 5 | best monthly grooming plan for men in India | ChatGPT | N | — | n/a | — | — |
| 5 | best monthly grooming plan for men in India | Gemini | N | — | n/a | — (monthly/weekly/daily routine, no mention) | — |
| 5 | best monthly grooming plan for men in India | AI Overviews | N | — | n/a | — | — |
| 6 | best monthly plan for a men's glow-up app | ChatGPT | N | — | n/a | — | — |
| 6 | best monthly plan for a men's glow-up app | Gemini | N | — | n/a | — (named Umax, LooksMax AI, Mogged; not us) | — |
| 6 | best monthly plan for a men's glow-up app | AI Overviews | N | — | n/a | — | — |
| 7 | Lookauramax monthly plan price | ChatGPT | Y | — | n/a (no true claims) | Confused us with "Looka AI Logo Maker": quoted Looka's one-time logo prices; no false claims ABOUT Lookauramax (asked for our site link instead) | — |
| 7 | Lookauramax monthly plan price | Gemini | Y | www.lookauramax.com (domain-level chip) | N | "The Monthly plan for Lookauramax is priced at $9.99 per month (billed monthly) and includes a 7-day free trial." / "3-Month Plan: $19.99 total ($6.66 per month) with a 7-day free trial" / "6-Month Plan: $29.99 total ($5.00 per month) with a 7-day free trial" / "Yearly Plan: $49.99 total ($4.17 per month) with a 14-day free trial". Truth: no free trial exists (it's a paid 7-day starter: ₹7 in India, $0.99-class elsewhere); no 6-month plan exists; yearly has no 14-day trial; yearly per-month is $4.16 floored, not $4.17. | Site denies "free trial" explicitly (citability pass); stale $29.99/6-mo cell was fixed same day (commit b3af755). Engine-side error — monitor next run. |
| 7 | Lookauramax monthly plan price | AI Overviews | Y | — | n/a (no claims) | Named only inside a disambiguation note ("If you are referring to a specific alternative app or service named Lookauramax…"); no price or feature claims | — |
| 8 | how much does Lookauramax cost per month | ChatGPT | Y | — | n/a | "I couldn't find a confirmed price for Lookauramax under that exact name" — then attributed $19.99/mo etc. to LooksMax AI. Name confusion, no true claims. | — |
| 8 | how much does Lookauramax cost per month | Gemini | Y | www.lookauramax.com (domain-level chip) | N | Same invented figures as Q7 (7-day free trial, 6-month plan, 14-day trial, $4.17) | Same as Q7 |
| 8 | how much does Lookauramax cost per month | AI Overviews | N | — | n/a | Answered about similarly named apps only (Auramax, LooksMax AI/UMax AI); said it could not find pricing details | — |
| 9 | best lookmaxing app with a monthly plan | ChatGPT | N | — | n/a | — | — |
| 9 | best lookmaxing app with a monthly plan | Gemini | N | — | n/a | — (named LooksMax AI, Umax, Maxxing/RateByFresh; not us) | — |
| 9 | best lookmaxing app with a monthly plan | AI Overviews | N | — | n/a | — | — |
| 10 | monthly subscription price for men's grooming app | ChatGPT | N | — | n/a | — | — |
| 10 | monthly subscription price for men's grooming app | Gemini | N | — | n/a | — (covered barber-booking apps: theCut, Barbr, Booksy, Squire, Fresha, Square, ARIS Grooming; not us) | — |
| 10 | monthly subscription price for men's grooming app | AI Overviews | N | — | n/a | — | — |

Perplexity: **unmeasurable this run.** Every fresh search hit "Sign up and repeat your request." / "Sign in to continue using Perplexity" (server-side wall, normal + incognito; no sign-in performed per hard rules). The frozen method stands; **RETRY in the 2026-11-01 monthly run.**

## Run summary

| Metric | This run | Last run | Δ |
|---|---|---|---|
| Named (rows mentioning Lookauramax / 30) | 5 | — (baseline) | — |
| Cited (rows citing a lookauramax.com URL / 30) | 2 | — | — |
| Fully accurate rows (/ 30) | 0 | — | — |
| Named on Q1–Q5 (/ 15) | 0 | — | — |
| P0 accuracy issues (fabricated reviews/ratings/counts) | 0 | — | — |

- Most-cited URLs this run: none (only Gemini's domain-level www.lookauramax.com chips on Q7/Q8; no full page URL shown).
- New wrong claims seen: Gemini's invented "7-day free trial" + invented "6-month Plan $29.99" + invented "14-day free trial" on yearly (Q7/Q8); ChatGPT's Looka AI Logo Maker conflation (Q7); "Auramax" substitution on AI Overviews Q8. The trial/6-month invention is the same recurring pattern as the fixed-14 panel's October run.
- Fixes shipped from last run's actions: n/a (first run). The site-side candidate fixes (monthly-plan hub with a price box; FAQ disambiguation of look-a-like names) landed 2026-10-23.
- Next run: 2026-11-01 via `website-facts-visibility-monthly` cron, alongside the fixed 14. Retry Perplexity. Rotate month name to December after 1 December 2026.
