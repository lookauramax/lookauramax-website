#!/usr/bin/env node
/**
 * run-lighthouse.mjs — Lighthouse budget gate (Website Round 2, Decisions 5+6).
 *
 * Zero-dependency (Node >= 18 stdlib). Shells out to `npx -y lighthouse`.
 *
 * Usage:
 *   node site-tools/run-lighthouse.mjs [--base <url>] [--budget <path>] [--out <dir>] <url-or-path> [...]
 *
 *   Targets may be full URLs (https://…) or paths (/blog/…) resolved against
 *   --base (default http://127.0.0.1:4173 — serve the repo root there first,
 *   e.g. `npx -y serve -l 4173 .`). With no targets, the CI default trio runs:
 *   homepage + one article + one tool page.
 *
 *   Chrome is located via, in order: $CHROME_PATH, the ms-playwright cache
 *   (~/.cache/ms-playwright), the puppeteer cache (~/.cache/puppeteer),
 *   then system Chrome/Chromium on PATH.
 *
 * Budgets live in lighthouse-budget.json next to this script:
 *   LCP <= 2500 ms · CLS <= 0.1 · TBT <= 200 ms (lab proxy for INP — INP is
 *   field-only; see the notes inside lighthouse-budget.json).
 *   The performance score is printed and saved, never gated.
 *
 * JSON reports are written to --out (default ./lighthouse-reports).
 * Exit 0 = all targets within budget. Exit 1 = any breach or run failure.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

// ---------- args ----------
const argv = process.argv.slice(2);
function optValue(name, fallback) {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
  return fallback;
}
const optValues = new Set([optValue('--base', null), optValue('--budget', null), optValue('--out', null)].filter(Boolean));
const BASE = optValue('--base', 'http://127.0.0.1:4173');
const BUDGET_PATH = optValue('--budget', join(SCRIPT_DIR, 'lighthouse-budget.json'));
const OUT_DIR = optValue('--out', join(process.cwd(), 'lighthouse-reports'));
const targets = argv.filter((a) => !a.startsWith('--') && !optValues.has(a));
const DEFAULT_TARGETS = ['/', '/blog/glow-up-guide-90-days', '/tools/bmi-calculator'];
const urls = (targets.length ? targets : DEFAULT_TARGETS).map((t) =>
  /^https?:\/\//i.test(t) ? t : BASE.replace(/\/$/, '') + (t.startsWith('/') ? t : `/${t}`),
);

// ---------- budget ----------
let budgetCfg;
try {
  budgetCfg = JSON.parse(readFileSync(BUDGET_PATH, 'utf8'));
} catch (e) {
  console.error(`run-lighthouse: cannot read budget file ${BUDGET_PATH}: ${e.message}`);
  process.exit(1);
}
const B = budgetCfg.budgets || {};

// ---------- chrome ----------
function firstExecutable(paths) {
  for (const p of paths) if (p && existsSync(p)) return p;
  return null;
}
function fromCache(cacheRoot, subdirs) {
  if (!existsSync(cacheRoot)) return null;
  const candidates = [];
  for (const entry of readdirSync(cacheRoot).sort().reverse()) {
    for (const sub of subdirs) candidates.push(join(cacheRoot, entry, sub));
  }
  return firstExecutable(candidates);
}
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const home = homedir();
  const pw = fromCache(join(home, '.cache', 'ms-playwright'), [
    join('chrome-linux64', 'chrome'),
    join('chrome-linux', 'chrome'),
    join('chrome-headless-shell-linux64', 'chrome-headless-shell'),
    join('chrome-linux', 'headless_shell'),
    join('chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
  ]);
  if (pw) return pw;
  const pp = fromCache(join(home, '.cache', 'puppeteer'), [
    join('chrome-linux64', 'chrome'),
    join('chrome-linux', 'chrome'),
  ]);
  if (pp) return pp;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const r = spawnSync('which', [name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split('\n')[0];
  }
  return null;
}
const chromePath = findChrome();
if (!chromePath) {
  console.error('run-lighthouse: no Chrome found. Set CHROME_PATH, or install one:');
  console.error('  npx -y @puppeteer/browsers install chrome@stable   (or run via Playwright)');
  process.exit(1);
}
console.log(`run-lighthouse: Chrome = ${chromePath}`);
console.log(`run-lighthouse: budgets = LCP <= ${B.largestContentfulPaintMs} ms · CLS <= ${B.cumulativeLayoutShift} · TBT <= ${B.totalBlockingTimeMs} ms (mobile, default throttling)`);
console.log('run-lighthouse: INP is field-only; TBT is the lab gate (see lighthouse-budget.json notes).');

mkdirSync(OUT_DIR, { recursive: true });

// ---------- run ----------
const slug = (u) => {
  try {
    const p = new URL(u).pathname.replace(/\/$/, '');
    return (p === '' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-')) || 'home';
  } catch {
    return 'target';
  }
};
const fmt = (n, digits = 0) => (n == null || Number.isNaN(n) ? '—' : n.toFixed(digits));

let failed = false;
const rows = [];
for (const url of urls) {
  const outFile = join(OUT_DIR, `lighthouse-${slug(url)}.json`);
  const args = [
    '-y', 'lighthouse', url,
    '--output=json', `--output-path=${outFile}`,
    `--form-factor=${budgetCfg.formFactor || 'mobile'}`,
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--quiet',
  ];
  const r = spawnSync('npx', args, {
    encoding: 'utf8',
    env: { ...process.env, CHROME_PATH: chromePath },
    timeout: 300_000,
  });
  if (r.status !== 0 || !existsSync(outFile)) {
    console.error(`run-lighthouse: FAILED to run Lighthouse for ${url}`);
    if (r.stderr) console.error(r.stderr.slice(-1500));
    failed = true;
    rows.push({ url, error: 'run failed' });
    continue;
  }
  let report;
  try {
    report = JSON.parse(readFileSync(outFile, 'utf8'));
  } catch (e) {
    console.error(`run-lighthouse: cannot parse report for ${url}: ${e.message}`);
    failed = true;
    continue;
  }
  const a = report.audits || {};
  const lcp = a['largest-contentful-paint']?.numericValue ?? null;
  const cls = a['cumulative-layout-shift']?.numericValue ?? null;
  const tbt = a['total-blocking-time']?.numericValue ?? null;
  const score = report.categories?.performance?.score != null ? report.categories.performance.score * 100 : null;
  const breaches = [];
  if (lcp != null && B.largestContentfulPaintMs != null && lcp > B.largestContentfulPaintMs) breaches.push(`LCP ${fmt(lcp)} ms > ${B.largestContentfulPaintMs}`);
  if (cls != null && B.cumulativeLayoutShift != null && cls > B.cumulativeLayoutShift) breaches.push(`CLS ${fmt(cls, 3)} > ${B.cumulativeLayoutShift}`);
  if (tbt != null && B.totalBlockingTimeMs != null && tbt > B.totalBlockingTimeMs) breaches.push(`TBT ${fmt(tbt)} ms > ${B.totalBlockingTimeMs}`);
  if (lcp == null || cls == null || tbt == null) breaches.push('missing audit values — treated as breach');
  if (breaches.length) failed = true;
  rows.push({ url, lcp, cls, tbt, score, breaches, outFile });
}

// ---------- table ----------
console.log('');
console.log('URL'.padEnd(58) + 'LCP(ms)'.padStart(9) + 'CLS'.padStart(8) + 'TBT(ms)'.padStart(9) + 'Perf'.padStart(6) + '  Verdict');
console.log('-'.repeat(110));
for (const row of rows) {
  if (row.error) {
    console.log(row.url.padEnd(58) + '  ERROR: ' + row.error);
    continue;
  }
  const verdict = row.breaches.length ? `FAIL — ${row.breaches.join('; ')}` : 'PASS';
  console.log(
    row.url.padEnd(58) +
      fmt(row.lcp).padStart(9) +
      fmt(row.cls, 3).padStart(8) +
      fmt(row.tbt).padStart(9) +
      fmt(row.score).padStart(6) +
      '  ' +
      verdict,
  );
}
console.log('-'.repeat(110));
console.log(`Reports: ${OUT_DIR}`);
console.log(failed ? 'RESULT: FAIL — budget breach or run failure.' : 'RESULT: PASS — all targets within budget.');
process.exit(failed ? 1 : 0);
