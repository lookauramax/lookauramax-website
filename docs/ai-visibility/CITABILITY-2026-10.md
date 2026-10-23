# Citability pass — coverage audit (2026-10-23)

Written BEFORE any edits in this pass, per the citability-pass brief.
Method: for each of the 14 fixed panel prompts (`PROMPTS.md`), the crawlable
site was checked for a page that gives a direct, answer-first answer in the
locked facts. Verdicts: **COVERED** (a crawlable page already answers it —
no duplication made), **PARTIAL** (an answer exists but is incomplete,
split, or not in the prompt's own terms), **GAP** (no crawlable page
answers it). "Action" records what this pass did; absence from AI answers
on a COVERED prompt is a citability problem, not a page gap, and is left to
the monthly panel + Daily Answers Engine.

| # | Prompt | Verdict | Evidence (crawlable answer found) | Action in this pass |
|---|---|---|---|---|
| 1 | best glow up app for men android | COVERED — with a source defect | `/blog/best-glow-up-apps` is an honest comparison that names Lookauramax, states pre-launch and "no real user reviews yet" in its own cons. **Defect:** our own column of its pricing table listed "$9.99/mo · $19.99/3-mo · $29.99/6-mo · $49.99/yr" — a 6-month plan that does not exist. This is the only occurrence of the engines' invented "$29.99 6-month plan" anywhere in our marketing pages and the likely origin of that panel error. A second cell listed photo quality under "What it scores". | Fixed both cells on `/blog/best-glow-up-apps` (pricing cell now Monthly / 3-Month / Yearly only; scores cell now states photo quality is a gate, never scored). No new content. |
| 2 | does lookauramax use ai | COVERED | Hub `/aura-intelligence`, "Questions, answered" + "What the detection steps do": full M2 answer — clear explainable checks, two supporting steps use the phone's standard on-device detection, detection never scores the face. Homepage FAQ also answers ("Does Lookauramax use AI to rate my face?") but in the short blanket form. | Homepage FAQ answer strengthened to carry the detection nuance (visible + JSON-LD kept identical). Hub unchanged. |
| 3 | how does lookauramax analyse a selfie | PARTIAL → CLOSED | Hub covers gate-first + 15 checks in full. The dedicated post `/blog/how-aurascan-works` has a "What is AuraScan?" answer block, but its lead did not state gate-first, 12 measurements on the face photo, or the 15-check total — and Gemini answered this prompt with invented landmark scoring while citing nothing of ours. | Lead answer block of `/blog/how-aurascan-works` rewritten answer-first: gate first, 12 measurements, 15 checks, bands with Why + Action. |
| 4 | what is an aura score | COVERED — tightened | Glossary entry + homepage FAQ both already define it as a band (Focus first / Good / Strong) with Why + Action, "never a number"; hub has a full "Bands, not numbers" section. Missing only the explicit "not a percentage, not an attractiveness rating" clause from the panel's correct-answer spec. | Glossary definition (visible + DefinedTerm JSON-LD, kept identical) extended with that clause. No other change. |
| 5 | honest looksmaxxing apps | COVERED | `/blog/best-glow-up-apps` (honest comparison incl. our own cons) + `/limitations`. Absence from all four engines' answers is citability, not a page gap. | None (source defect on that page fixed under #1). |
| 6 | lookauramax review | GAP → CLOSED | No page anywhere stated the honest status (pre-launch; no reviews or ratings exist). AI Overviews invented Reddit reviews (panel P0); Gemini presented a Pros/Cons "review". | New page `/reviews` published ("Lookauramax reviews: the honest status"), added to sitemap-pages.xml, linked from the homepage FAQ (new Q "Are there any Lookauramax reviews?") and from `/limitations`. No Review/AggregateRating schema, no stars, no testimonials. |
| 7 | how can men improve their skin | COVERED | `/blog/clear-skin-guide` and the skincare guides give honest routine advice with no miracle claims. No Lookauramax citation on any engine = citability only (panel log already assigns this to the Daily Answers Engine). | None. |
| 8 | what is lookauramax | COVERED | Homepage (hero + FAQ "What is Lookauramax?") and `/about`. Engines that cited the homepage answered mostly correctly. | None. |
| 9 | lookauramax vs umax | COVERED | `/blog/lookauramax-vs-umax` — dedicated honest comparison; cited by Perplexity + Gemini, facts right. | None. |
| 10 | how much does lookauramax cost | PARTIAL → CLOSED | `/blog/lookauramax-pricing` is complete (IN + US totals, paid starter, no weekly/6-month/free-trial — verified). But the homepage FAQ answer gave India prices only ("Other markets are priced locally"), and ChatGPT answered "pricing doesn't appear to be publicly confirmed yet" from the homepage. | Homepage FAQ cost answer extended with US totals + starter truth (visible + JSON-LD identical). Poisoned comparison cell fixed under #1. |
| 11 | is lookauramax free | COVERED | Homepage FAQ already answers directly: "There is no permanent free plan — but the scan itself is free… every plan starts with the 7-day starter — ₹7 in India…". Pricing post agrees. | None — no duplication made. |
| 12 | what is aura intelligence | GAP → CLOSED | FAQ + glossary define the term, but the canonical hub `/aura-intelligence` never opened with an entity definition — its lead paragraph defines AuraScan and jumps to mechanics. On 3 of 4 engines the term resolves to an unrelated workforce-analytics company. | Hub opening answer paragraph rewritten to open with the entity definition ("Aura Intelligence is Lookauramax's analysis engine…"), then the checks/gate/bands facts. |
| 13 | 90 day glow up plan app | COVERED | Homepage "Your 90-day cycle" section, hub "From read to plan", `/limitations` — 90-day cycles with Day 30/60/90 check-ins, no transformation guarantee. Absence from engines = citability only. | None. |
| 14 | does lookauramax rate your face | PARTIAL → CLOSED | Hub Q&A ("Does Lookauramax rate attractiveness? No…") and homepage FAQ answer it, but `/limitations` — the page this prompt is the report card for — had no direct answer in the prompt's own words, only supporting statements. Its lede also carried the tree's only "seven actionable signals" framing. | Direct-answer section added to `/limitations` ("Does Lookauramax rate your face? No. Never.…"); lede corrected to the six traits; homepage FAQ answer strengthened under #2. |

## Summary

- Covered with no change: #5, #7, #8, #9, #11, #13 (6 prompts).
- Covered, tightened: #2, #4 (2 prompts).
- Partial → closed: #3, #10, #14 (3 prompts).
- Gap → closed: #6 (new `/reviews`), #12 (hub opening) (2 prompts).
- Source defect fixed: #1 — our own comparison table was the one place on
  the site still publishing the non-existent 6-month $29.99 plan.

Verification for this pass (FAQ parity, sweeps, JSON-LD parse, link check,
live checks) is reported with the push, and the monthly panel re-run is
the follow-up measurement.
