#!/usr/bin/env node
/**
 * indexnow-submit.mjs — submit URLs to IndexNow (Bing + partners).
 *
 * Website Round 2, Decision 6 / S1: IndexNow on publish/update so the
 * long tail of a 350+ page site gets indexed without waiting for a crawl.
 * Zero-dependency, Node >= 18 (global fetch).
 *
 * SETUP (once): the key in tools/indexnow-key.txt must be served from the
 * site root as a file named <key>.txt whose entire content is the key
 * itself. See tools/README.md § IndexNow.
 *
 * Usage:
 *   node tools/indexnow-submit.mjs --key <key> --host www.lookauramax.com --file urls.txt [--dry-run]
 *   node tools/indexnow-submit.mjs --key-file tools/indexnow-key.txt --host www.lookauramax.com --file urls.txt
 *
 *   --file     one URL per line (blank lines and # comments ignored).
 *              URLs must belong to --host. Max 10,000 per request — larger
 *              files are chunked automatically.
 *   --dry-run  print the exact JSON payload(s) and send NOTHING.
 *
 * Exit 0 = every chunk accepted (HTTP 200/202) or dry-run. Exit 1 otherwise.
 */

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
function optValue(name) {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
  return null;
}
const DRY_RUN = argv.includes('--dry-run');
const HOST = optValue('--host');
const FILE = optValue('--file');
let KEY = optValue('--key');
const KEY_FILE = optValue('--key-file');
if (!KEY && KEY_FILE) KEY = readFileSync(KEY_FILE, 'utf8').trim();
if (!KEY && process.env.INDEXNOW_KEY) KEY = process.env.INDEXNOW_KEY.trim();

if (!KEY || !HOST || !FILE) {
  console.error('usage: node tools/indexnow-submit.mjs (--key <key> | --key-file <path>) --host <host> --file <urls.txt> [--dry-run]');
  process.exit(2);
}
if (!/^[a-zA-Z0-9-]{8,128}$/.test(KEY)) {
  console.error('indexnow-submit: key must be 8–128 chars of [a-zA-Z0-9-] (IndexNow spec).');
  process.exit(2);
}

const urls = readFileSync(FILE, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

if (!urls.length) {
  console.error(`indexnow-submit: no URLs in ${FILE}`);
  process.exit(2);
}
const offHost = urls.filter((u) => {
  try {
    return new URL(u).host !== HOST;
  } catch {
    return true;
  }
});
if (offHost.length) {
  console.error(`indexnow-submit: ${offHost.length} URL(s) are not on host ${HOST} — refusing to submit a mixed batch.`);
  console.error('  first offender: ' + offHost[0]);
  process.exit(2);
}

const keyLocation = `https://${HOST}/${KEY}.txt`;
const CHUNK = 10_000;
let failed = false;

for (let i = 0; i < urls.length; i += CHUNK) {
  const batch = urls.slice(i, i + CHUNK);
  const payload = { host: HOST, key: KEY, keyLocation, urlList: batch };
  if (DRY_RUN) {
    console.log(JSON.stringify(payload, null, 2));
    continue;
  }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    // 200 = received, 202 = received & key validation pending — both are success.
    console.log(`indexnow-submit: batch ${i / CHUNK + 1} (${batch.length} URLs) → HTTP ${res.status} ${res.statusText}`);
    if (res.status !== 200 && res.status !== 202) {
      failed = true;
      const body = await res.text().catch(() => '');
      if (body) console.error('  response: ' + body.slice(0, 500));
      if (res.status === 403) console.error(`  403 usually means the key file is not reachable at ${keyLocation} — check it is live at the site root and contains only the key.`);
      if (res.status === 422) console.error('  422: URLs do not match the host, or the key format/location is wrong.');
    }
  } catch (e) {
    failed = true;
    console.error(`indexnow-submit: request failed for batch ${i / CHUNK + 1}: ${e.message}`);
  }
}

if (DRY_RUN) console.log(`indexnow-submit: dry run — ${urls.length} URL(s), nothing sent.`);
process.exit(failed ? 1 : 0);
