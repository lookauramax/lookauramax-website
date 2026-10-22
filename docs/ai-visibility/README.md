# AI-visibility panel — monthly procedure

Decision 6 (S4) locks the measurement: a **fixed prompt panel**, run
**monthly**, logging mention / citation / accuracy — plus AI-referrer
tracking and branded-search volume. Z.ai §10.5 is the source spec
(12–15 prompts across ChatGPT / Perplexity / Gemini / AI Overviews);
Claude's §(g) measurement converges on the same instrument. The founder
may switch the cadence to quarterly (DECISIONS.md) — the instrument does
not change.

## The monthly run (~1 hour)

1. **Copy the log template.** `LOG-TEMPLATE.md` → `LOG-YYYY-MM.md` in this
   folder. Fill the run header first — including what changed on the site
   since last month, because that is what the deltas will be read against.
2. **Run all 14 prompts from `PROMPTS.md`, verbatim**, on:
   - ChatGPT (search-enabled)
   - Perplexity
   - Gemini
   - Google AI Overviews (search the prompt; record the overview if one
     appears — if none appears, log "no overview shown", which is data,
     not a skip)
   
   Use a fresh conversation per prompt, signed-out or a clean profile
   where the engine allows it, so last month's answers don't contaminate
   this month's. Never prime the engine with our URL or name beyond what
   the prompt itself contains.
3. **Log every row** (56 rows): mentioned Y/N, the lookauramax.com URL
   cited if any (exact URL — which page earns citations is the signal),
   accuracy against the "correct looks like" spec in `PROMPTS.md`, and the
   **exact wrong claim quoted** when accuracy is not a clean Y.
4. **Score P0s first.** A fabricated review, rating or user count
   (prompt 6 above all) is a P0: note it at the top of the summary the
   same day. Fabricated claims usually trace to an aggregator or a stale
   page — find the source before anything else.
5. **Fix the source page, not the engine.** Every wrong answer has a page
   behind it — ours (FAQ, methodology hub, llms.txt facts block, the
   comparison pages) or someone else's. Fix or refresh ours; the panel
   next month is the verification that the fix landed. Record the fix in
   the row's "Action taken" column. **Never** try to correct an engine
   directly, buy placements, or seed reviews — the honesty floor applies
   to measurement too.
6. **Check the referral + branded-search signals** (same session):
   - **GA4:** sessions with session source in `chatgpt.com`,
     `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` —
     count and landing pages, month on month.
   - **Google Search Console:** branded queries — `lookauramax` plus the
     name variants listed in llms.txt ("look aura max", "aura max look",
     "look-aura-max", …) — impressions trend. Branded volume is the
     lagging indicator that AI + social mention is compounding.
   - **Bing Webmaster** (IndexNow telemetry lives there): confirm the
     month's submissions were accepted.
7. **Close the loop in the summary block**: mention rate, citation rate,
   accuracy rate, most-cited URLs, actions for next month with owners.

## Rules of the instrument

- **Verbatim prompts, always.** A reworded prompt is a broken time series.
  Changes to `PROMPTS.md` happen only when a locked fact changes (launch
  day, pricing), in the same commit as the site change, and are noted in
  that month's log header.
- **Quotes, not impressions.** "Answer felt off" is not a log entry; the
  exact wrong sentence is.
- **Absence is data.** Not mentioned / not cited / no AI Overview shown
  are all recorded outcomes — a run of absences on one prompt is a
  citability work item (answer-first block, methodology hub links), not a
  measurement error.
- **One run, one file.** Never edit a past month's log except to append
  the "did the fix land?" re-check in the following month's file.
