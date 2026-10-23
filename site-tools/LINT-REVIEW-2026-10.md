# Honesty-lint review — 2026-10-23

**Run before:** 999 hits · 7 unbaselined FAIL · 6 stale baseline entries · exit 1.
**Run after:** PASS · 0 unbaselined FAIL · 0 stale · exit 0.
**Copy changed: NONE.** Every unbaselined hit was an honest denial/negation —
the lint is a string match and cannot read negation (by design; see the
`free-trial` rule text and the `fake`/`guaranteed` pattern notes in
`lint-rules.json`). No genuine violation was baselined; no honest denial copy
was deleted or reworded.

## Baselined as legitimate (6 entries added, each also carries a `reason` in lint-baseline.json)

| Rule | File | Sentence (hit in bold) |
|---|---|---|
| free-trial | index.html (FAQ JSON-LD L33 + visible FAQ L652 — one entry covers both hits) | "There is no weekly plan and **no free trial**; other markets are priced locally in Google Play…" |
| free-trial | reviews.html (L105) | "…then auto-renew; **there is no free trial**, no weekly plan, and no permanent free plan." |
| premium-banned (`fake`) | blog/chhath-puja-grooming-guide.html (L197) | "**No fake promises** — 90-day Aura Cycles, no guaranteed transformations, and our own cons published…" (shared "Why Lookauramax" block) |
| premium-banned (`guaranteed`) | blog/chhath-puja-grooming-guide.html (L197) | "…**no guaranteed transformations**…" (same block) |
| premium-banned (`fake`) | blog/how-often-wash-hair-men.html (L294) | Same shared block: "**No fake promises** — …" (Daily Answers post #1, published after the last baseline generation) |
| premium-banned (`guaranteed`) | blog/how-often-wash-hair-men.html (L294) | Same shared block: "…**no guaranteed transformations**…" |

The identical "Why Lookauramax" block is already baselined on 300+ pages;
these two posts simply post-date the last baseline generation.

## Stale entries removed (6)

| Rule | File | Match | Why stale |
|---|---|---|---|
| premium-banned | blog/glow-up-guide-men.html | fake | File deleted in Round 3 (guide merge; 308 → glow-up-guide-for-men) |
| premium-banned | blog/glow-up-guide-men.html | guaranteed | Same deleted file |
| premium-banned | blog/glow-up-guide-men.html | quick fix | Same deleted file |
| premium-banned | blog/glow-up-guide-men.html | tricks | Same deleted file |
| premium-banned | index.html | tricks | Text no longer present — homepage rebuilt in Round 3 |
| count-claims | index.html | "signals. A 90" | Text no longer present — homepage rebuilt in Round 3 |

## Untouched

- All 801 previously baselined hits: still present, still tracked, unchanged.
- All 191 warn hits (`best-claim`, `overnight`, `algorithm`, demo/test/sample
  family): warn-tier by design, human judgement, never fail the build —
  out of scope for this cleanup.
- Frozen legal pages: not scanned by copy rules and not edited.
