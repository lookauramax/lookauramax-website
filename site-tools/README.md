# Governance tools — Lookauramax Website Round 2

Zero-dependency tooling for the Round-2 build (Decision 5: governance is
build-fail, not memory; Decision 6: the SEO P0 bundle). Everything here runs on
Node ≥ 18 stdlib or Python 3 stdlib — no `npm install`, ever.

| Tool | What it is |
|---|---|
| `honesty-lint.mjs` + `lint-rules.json` + `lint-baseline.json` | The honesty linter (CI build-fail gate) |
| `lighthouse-budget.json` + `run-lighthouse.mjs` | Lighthouse CWV budget gate |
| `split-sitemap.py` | Splits `sitemap.xml` into a sitemap index + 4 typed sitemaps |
| `indexnow-key.txt` + `indexnow-submit.mjs` | IndexNow key + submission script |
| `../.github/workflows/site-checks.yml` | CI: lint gate + Lighthouse job |

---

## 1. Honesty linter

Scans every `.html` file under a root and fails the build on copy that breaks
the honesty floor. **All rules live in `lint-rules.json`** — the script holds
none. Change behaviour by editing the JSON, never the script.

```bash
node site-tools/honesty-lint.mjs .              # human-readable grouped report
node site-tools/honesty-lint.mjs . --json       # machine-readable report
node site-tools/honesty-lint.mjs <root>         # any root works (staging, clones…)
```

Exit codes: **0** pass · **1** at least one unbaselined fail-severity hit ·
**2** usage/config error.

### Rules (ids as in `lint-rules.json`)

| Rule | Severity | What it kills |
|---|---|---|
| `premium-banned` | fail (per-pattern overrides) | The Oct-18 premium language bans: cheap, hack, trick, "quick fix", "instant results", guaranteed, fake, "click here", "learn more" (as link text), "coming soon", bot, "loading...". **Warn-tier patterns inside the same rule:** overnight (see below), demo/test/sample/placeholder, algorithm. |
| `cancel-2-taps` | fail | "cancel in 2 taps" (or "two taps"), any case. Approved form: "Cancel easily anytime". |
| `free-trial` | fail | "free trial" — there is none; the starter is a paid 7 days. Even negations fail at lint level; write "no permanent free plan" instead. |
| `count-claims` | fail | Any number ≥ 16 (or "hundreds") within 40 chars of checks / measurements / factors / signals, in either direction; plus the literal "checks behind every signal". Audited truth is 15 / 12 / 10 (W1/W2/W3) — nothing larger may ever stand next to those nouns. Day 30/60/90 check-in numbers are explicitly guarded out (they are rescan days, not counts). |
| `score-percents` | fail | A signal name (skin/hair/brows/beard/smile/posture) within 40 chars of a % figure, any "n / 100", any "score of n". Scores are bands only. |
| `schema-offers` | fail | While `playListingLive` is `false` in `lint-rules.json`: any `SoftwareApplication` JSON-LD block containing `"offers"`, `"aggregateRating"` or `"review"` keys. No offers/ratings markup before the Play listing exists. The rule disables itself the day `playListingLive` is set to `true`. |
| `ml-blanket` | fail | "not AI, not machine learning" / "not machine learning" — retired by Decision 7 (M2). Replacement: "Clear, explainable checks — no learned score, no face rating, ever." |
| `rule-based` | fail | "rule-based" / "rules-based" in user copy. Say "clear, explainable checks". |
| `ai-powered` | fail | "AI-powered", "powered by AI", "AI powered". The patterns require the literal token AI, so "powered by Aura Intelligence" can never match — verified by control test. |
| `best-claim` | **warn** | "best glow-up", "#1", "number one". Warn-only **by design**: settled, caveated differentiator usage exists (DECISIONS.md) and "#1 finding" is locked free-results language. A human judges; the linter never auto-fails settled copy. |

### Scope

- Copy rules scan everything **except** the frozen legal pages
  (`privacy.html`, `terms.html`, `refund.html`, `parent-consent.html`) —
  legal is locked and keeps its own precise wording (Decision 7).
- The schema rule (`scope: "all"`) scans the legal pages too: structured
  data must obey the honesty floor everywhere.

### The baseline — shrink-only

`lint-baseline.json` is an array of `{rule, file, match}` entries generated
from the tree as it exists today, so the gate starts **green but tracked**:
every pre-existing fail hit is listed, and any NEW hit fails the build.

- A hit is baselined when an entry matches its rule + file + exact matched
  text. Baselined hits are reported separately, never silently.
- Warn hits are not baselined by default (they never fail the build); a
  human reviews them in the report.
- Baseline entries that stop matching anything are reported as **STALE** —
  the copy was fixed; delete the entry in the same commit.
- **Convention (binding): entries may only be REMOVED as copy is fixed.
  Never add an entry without a named reason in the PR that carries it.**
  Regenerating is possible —

  ```bash
  node site-tools/honesty-lint.mjs . --write-baseline                 # fail hits
  node site-tools/honesty-lint.mjs . --write-baseline --include-warnings
  ```

  — but a regeneration that GROWS the baseline is a red flag in review, and
  `--write-baseline` must **never** run in CI.

### Why "overnight" is warn, not fail

The premium pass bans "overnight" as a *results claim*. Verified against the
live tree (2026-10-22), articles use the word honestly and constantly —
"no overnight cure", "cannot force a pimple away overnight". Failing on the
bare word would baseline-noise the gate into uselessness; the claim forms
are already covered by `instant results` / `quick fix` / `guaranteed`.
Promote it to fail only if a copy pass ever finds it used as a promise.
(The reasoning also lives in `lint-rules.json`, on the pattern itself.)

---

## 2. Lighthouse budgets

```bash
# serve the repo root first (extensionless URLs must resolve, as on Vercel)
npx -y serve@14 -l 4173 .
node site-tools/run-lighthouse.mjs --base http://127.0.0.1:4173 / /blog/glow-up-guide-90-days /tools/bmi-calculator
```

- Budgets (`lighthouse-budget.json`): **LCP ≤ 2500 ms · CLS ≤ 0.1 ·
  TBT ≤ 200 ms**, mobile, Lighthouse default throttling.
- **INP note:** INP is a *field* metric — no lab run can measure it. TBT is
  the lab gate because long tasks are what make interactions slow; field
  INP is watched via RUM/CrUX by device class. The performance *score* is
  printed and archived, never gated.
- Chrome discovery order: `$CHROME_PATH` → ms-playwright cache →
  puppeteer cache → system Chrome/Chromium.
- JSON reports land in `--out` (default `./lighthouse-reports`); CI uploads
  them as artifacts. Exit 1 on any budget breach or run failure.

---

## 3. Sitemap splitter

```bash
python3 tools/split-sitemap.py <site-root>                 # in place
python3 tools/split-sitemap.py <site-root> --out <dir>     # elsewhere
python3 tools/split-sitemap.py <site-root> --add https://www.lookauramax.com/methodology
```

Reads the current `sitemap.xml`, classifies each URL by path —
articles `/blog/*` (except the `/blog/` index), tools `/tools/*`, glossary
`/glossary*`, pages = everything else **including `/hubs/*` and
`/new-year-glow-up-2027/*`** — and writes `sitemap.xml` as a sitemap index
plus `sitemap-pages.xml`, `sitemap-articles.xml`, `sitemap-tools.xml`,
`sitemap-glossary.xml`. Every `<loc>` and `<lastmod>` is carried across
**exactly** (honest lastmod is the point; the splitter never refreshes a
date). `--add` is for a page that ships the same day, before the source
sitemap knows about it; its lastmod is today. The script prints counts per
file and verifies the total (input + adds), exiting 1 on any mismatch.
After splitting, `robots.txt`'s single `Sitemap:` line still points at
`sitemap.xml` — now the index — so no robots change is needed for this.

---

## 4. IndexNow

IndexNow notifies Bing (+ partners: Yandex, Seznam, Naver) the moment pages
publish or change — Decision 6 P0 for a 350-page long tail.

**One-time setup (coordinator):**

1. Read the key: `tools/indexnow-key.txt` (32 hex chars; the file contains
   only the key).
2. At the **site root**, create a file named **`<key>.txt`** —
   i.e. `d1908233133230e28a38203543d0eefd.txt` — whose entire content is
   the key itself, nothing else.
3. Verify it serves: `https://www.lookauramax.com/d1908233133230e28a38203543d0eefd.txt`
   returns the key as plain text. Until this is live, submissions fail
   with HTTP 403.

**Submitting (on every publish / update push):**

```bash
# one URL per line
printf '%s\n' https://www.lookauramax.com/ https://www.lookauramax.com/methodology > /tmp/changed.txt
node tools/indexnow-submit.mjs --key-file tools/indexnow-key.txt --host www.lookauramax.com --file /tmp/changed.txt
node tools/indexnow-submit.mjs --key-file tools/indexnow-key.txt --host www.lookauramax.com --file /tmp/changed.txt --dry-run   # print payload, send nothing
```

- Payload: `{host, key, keyLocation, urlList}` POSTed to
  `https://api.indexnow.org/indexnow`. HTTP 200/202 = accepted.
- URLs must all belong to `--host`; a mixed batch is refused before sending.
- Batches over 10,000 URLs are chunked automatically.
- Submit only URLs that actually changed — IndexNow is a change signal,
  not a sitemap replacement. The split sitemaps (§3) remain the discovery
  baseline; IndexNow is the accelerator.
- If the key is ever rotated: generate a new 32-hex key, replace both the
  root `<key>.txt` file and `tools/indexnow-key.txt` in the same change,
  and delete the old key file from the root.
