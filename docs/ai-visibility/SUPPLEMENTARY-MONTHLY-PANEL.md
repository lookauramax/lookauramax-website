# Supplementary monthly-plan panel — the instrument (frozen)

Decision: **D-R4-5** (Round 4, 2026-10-23). The founder's formal target: when
people ask AIs or Google monthly-plan questions, Lookauramax should be NAMED
in the answer. This panel measures exactly that, monthly, as a SEPARATE
frozen series. **The fixed 14 prompts (`PROMPTS.md`) are untouched and stay
untouched** — this series is in addition to them, never a replacement.

## The 10 frozen prompts (verbatim, identical on all engines)

1. what's this month's grooming plan for men
2. best monthly glow-up plan for men
3. men's grooming plan for November 2026
4. monthly skincare plan for men November 2026
5. best monthly grooming plan for men in India
6. best monthly plan for a men's glow-up app
7. Lookauramax monthly plan price
8. how much does Lookauramax cost per month
9. best lookmaxing app with a monthly plan
10. monthly subscription price for men's grooming app

A reworded prompt is a broken time series. The only allowed change is the
**month-name rotation**: after 1 December 2026, prompts 3 and 4 carry the new
month's name ("…for December 2026", "…men December 2026"); after 1 January
2027, January's; and so on. Everything else — wording, order, casing —
stays frozen. Rotate nothing else.

## Method (mirrors the fixed-14 run)

Run every prompt, verbatim, on all four engines: **ChatGPT** (chatgpt.com),
**Gemini** (gemini.google.com), **Perplexity** (perplexity.ai), **Google AI
Overviews** (google.com — if no overview appears, log "no overview shown"
and base named/cited on the first results page, saying so).

- **One fresh chat / thread / search per prompt.** No follow-ups. Never prime
  the engine with our URL or name beyond what the prompt itself contains.
- **Prefer the signed-out stranger's view** (signed-out session or clean
  profile where the engine allows it) so last month's answers don't
  contaminate this month's. **NEVER sign in, sign out, switch accounts, or
  change any setting** — record the sign-in state instead (e.g. "signed out",
  "signed in as a personal account") in the run header; a signed-in run is
  data with a caveat, not a failure.
- Per answer record: **named** (Lookauramax mentioned: y/n), **cited** (a
  lookauramax.com page cited/linked: y/n + the exact URL), **accurate**
  (fully / partly / wrong — or n/a when we're not mentioned), and copy
  **verbatim** any sentence that states something false about Lookauramax
  (invented prices, an invented "free trial" — there is none; a 6-month
  plan — there is none; scores instead of bands; claims we use AI; invented
  reviews or user counts).
- If an engine is unreachable after genuine effort, log it as unreachable —
  never ask anyone to sign in or solve anything.

## Baseline — 2026-10-23 evening (IST), run BEFORE hub indexing

The /monthly-plan hub went live during the run window (live ~20:04 IST) but
no engine had indexed it yet — the baseline answers still reflect the
pre-hub web. Baseline is recorded in `LOG-MONTHLY-2026-10.md` (30 measured
answers; Perplexity hit a sign-in wall and contributed 0 measurable
answers — **RETRY Perplexity in every monthly run**).

- **Named: 5/30** (ChatGPT 2, Gemini 2, AI Overviews 1)
- **Cited (a lookauramax.com page): 2/30** (Gemini only, domain-level chips)
- **Fully accurate answers about us: 0/30**
- **On the 5 pure "this month" questions (Q1–Q5): 0/15 named** — the gap
  the /monthly-plan hub is built to close.

## Success criterion

On Q1–Q5, the named-count and cited-count rise from **0/15** over the
coming months, and wrong claims about us (invented free trial, invented
6-month plan) decline. Report the Δ every run: this run vs last run.

## Monthly procedure

1. Copy this month's log as `LOG-MONTHLY-YYYY-MM.md` in this folder. Fill the
   run header first — including what changed on the site since last month.
2. Run the 10 frozen prompts per the method above, alongside the fixed-14
   panel (same engines, same session conditions).
3. Log every row (40 rows when all engines answer). Note engine sign-in
   states and any unreachable engine.
4. Score P0s first: a fabricated review, rating or user count is a P0.
5. **Fix the source page, not the engine.** Every wrong answer has a page
   behind it. The honesty floor applies to measurement too: never correct an
   engine directly, buy placements, or seed reviews.
6. Close the loop in the summary: mention rate, citation rate, accuracy rate,
   most-cited URLs, actions for next month with owners.
