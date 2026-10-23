#!/usr/bin/env node
/**
 * semantic-schema-check.mjs — Lookauramax semantic JSON-LD type checker
 * (Website Round 4, Wave 2 — closes the gap behind the GSC
 * "Incorrect value type" structured-data errors).
 *
 * The site's older checks only verify that each JSON-LD block PARSES as
 * JSON. Google's parser additionally requires that VALUES have the types
 * schema.org declares: a "position" of "1" (string) parses fine but is
 * the wrong type, and Google flags it. This tool walks every
 * <script type="application/ld+json"> block in every .html file under a
 * root — @graph arrays and nested objects recursively — and flags TYPE
 * errors only. Missing optional properties are NOT flagged.
 *
 * Zero-dependency, Node >= 18 stdlib only (house style, see
 * site-tools/README.md — no `npm install`, ever).
 *
 * Usage:
 *   node semantic-schema-check.mjs <root> [--json]
 *
 *   <root>   Directory scanned recursively for .html files.
 *   --json   Machine-readable report on stdout instead of the human report.
 *
 * Exit codes: 0 = clean (no error hits) · 1 = at least one error hit ·
 *             2 = usage error.
 * Warnings (currently only: AggregateRating present at all — the site is
 * pre-launch and must carry none) are reported but never change the exit
 * code, matching the honesty-lint warn convention.
 *
 * Rules (id — what is flagged):
 *   json-parse              block does not parse as JSON at all
 *   jsonld-root             block's top level is not an object / array of objects
 *   type-string             any "@type" value that is not a string (array/number/…)
 *   position-integer        "position" is not an integer (a string "1" is a hit)
 *   date-iso8601            datePublished / dateModified / dateCreated /
 *                           uploadDate / startDate / endDate / validFrom /
 *                           expires / foundingDate is not a string in ISO 8601
 *                           form (YYYY-MM-DD or full datetime)
 *   url-absolute            url / @id / image / logo / sameAs entries /
 *                           mainEntityOfPage / contentUrl / thumbnailUrl /
 *                           target is a string that is not an absolute
 *                           http(s) URL (relative URL = hit). image / logo may
 *                           instead be an ImageObject — those are recursed.
 *   entity-object           author / publisher / creator / provider / brand /
 *                           sponsor / memberOf / parentOrganization is a bare
 *                           string (or an object without a string "@type")
 *                           instead of an Organization/Person/Thing object
 *   offer-price-currency    Offer "priceCurrency" is not a 3-letter string.
 *                           ("price" itself is NEVER flagged: schema.org
 *                           allows string or number.)
 *   offer-schema-url        "availability" / "itemCondition" is not a
 *                           schema.org URL (e.g. https://schema.org/InStock)
 *   geo-number              GeoCoordinates latitude / longitude is not a
 *                           number (a numeric string is a hit)
 *   rating-number           ratingValue / reviewCount / ratingCount /
 *                           bestRating / worstRating is not a number
 *   numeric-string          a conventionally numeric property (name ends in
 *                           "Count", or is ratingValue / bestRating /
 *                           worstRating / position) holds a numeric STRING.
 *                           priceRange is explicitly excluded. Properties
 *                           already hit by a more specific rule above are
 *                           not double-reported under this id.
 *   string-prop             "name" / "headline" / "description" is not a string
 *   boolean-type            isAccessibleForFree / isFamilyFriendly is not a
 *                           boolean ("true" / "false" strings are hits)
 *   faq-accepted-answer     FAQPage acceptedAnswer is not an object
 *   faq-answer-text         an Answer's "text" is not a string
 *                           (a Question's "name" is covered by string-prop)
 *   breadcrumb-item         BreadcrumbList itemListElement[*].item is neither
 *                           an absolute URL string nor an object with "@id"
 *   aggregate-rating-present  [WARNING] an AggregateRating node or an
 *                           "aggregateRating" property exists at all
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

// ---------- args ----------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const positional = argv.filter((a) => !a.startsWith('--'));
const JSON_OUT = flags.has('--json');

if (flags.has('--help') || flags.has('-h')) {
  console.log('usage: node semantic-schema-check.mjs <root> [--json]');
  process.exit(0);
}
const unknown = [...flags].filter((f) => f !== '--json');
if (unknown.length || positional.length !== 1) {
  console.error('usage: node semantic-schema-check.mjs <root> [--json]');
  if (unknown.length) console.error(`unknown flag(s): ${unknown.join(', ')}`);
  process.exit(2);
}
const ROOT = positional[0];

// ---------- rule tables ----------
const DATE_FIELDS = new Set([
  'datePublished', 'dateModified', 'dateCreated', 'uploadDate',
  'startDate', 'endDate', 'validFrom', 'expires', 'foundingDate',
]);
const URL_FIELDS = new Set([
  'url', '@id', 'image', 'logo', 'mainEntityOfPage',
  'contentUrl', 'thumbnailUrl', 'target',
]);
const ENTITY_FIELDS = new Set([
  'author', 'publisher', 'creator', 'provider',
  'brand', 'sponsor', 'memberOf', 'parentOrganization',
]);
const RATING_NUM_FIELDS = new Set([
  'ratingValue', 'reviewCount', 'ratingCount', 'bestRating', 'worstRating',
]);
const GENERIC_NUMERIC_KEYS = new Set(['ratingValue', 'bestRating', 'worstRating', 'position']);
const BOOLEAN_FIELDS = new Set(['isAccessibleForFree', 'isFamilyFriendly']);
const STRING_FIELDS = new Set(['name', 'headline', 'description']);
const SKIP_DIRS = new Set(['.git', 'node_modules']);

// YYYY-MM-DD, optionally followed by a time (Thh:mm[:ss[.fff]] with Z or ±hh:mm / ±hhmm offset; space separator tolerated)
const ISO_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:[T ](?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?$/;
const ABS_URL_RE = /^https?:\/\/\S+$/i;
const SCHEMA_URL_RE = /^https?:\/\/schema\.org\/\S+$/i;
const NUMERIC_STRING_RE = /^-?\d+(?:\.\d+)?$/;
const CURRENCY_RE = /^[A-Za-z]{3}$/;

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

function fmtValue(v) {
  let s;
  if (typeof v === 'string') s = JSON.stringify(v);
  else if (v === undefined) s = 'undefined';
  else {
    try { s = JSON.stringify(v); } catch { s = String(v); }
    if (s === undefined) s = String(v);
  }
  return s.length > 120 ? s.slice(0, 117) + '...' : s;
}
function typeName(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

// ---------- file walk ----------
function walkFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.has(ent.name)) walkFiles(p, out);
    } else if (ent.isFile() && extname(ent.name).toLowerCase() === '.html') {
      out.push(p);
    }
  }
  return out;
}

const files = walkFiles(ROOT);
if (files.length === 0) {
  // Distinguish "not a directory / typo" from a genuinely html-free tree:
  // readdir on ROOT itself decides.
  let rootReadable = true;
  try { readdirSync(ROOT); } catch { rootReadable = false; }
  if (!rootReadable) {
    console.error(`semantic-schema-check: cannot read root directory: ${ROOT}`);
    process.exit(2);
  }
}
files.sort();

// ---------- checking ----------
const hits = [];     // errors: {file, block, typeContext, path, rule, value, message}
const warnings = []; // {file, block, typeContext, path, rule, value, message}
let blocksScanned = 0;
let blocksParsed = 0;

function checkBlock(parsed, file, blockIndex) {
  const meta = { file, block: blockIndex };
  if (Array.isArray(parsed)) {
    parsed.forEach((el, i) => {
      if (isPlainObject(el)) walkNode(el, rootLabel(el), null, {}, meta);
      else addHit(meta, '$', `$[${i}]`, 'jsonld-root', el,
        `top-level JSON-LD array entry [${i}] is ${typeName(el)}, expected an object`);
    });
    return;
  }
  if (!isPlainObject(parsed)) {
    addHit(meta, '$', '$', 'jsonld-root', parsed,
      `top-level JSON-LD is ${typeName(parsed)}, expected an object`);
    return;
  }
  if (Array.isArray(parsed['@graph'])) {
    // Container-level keys other than @graph/@context are still checked.
    const { '@graph': _g, ...rest } = parsed;
    if (Object.keys(rest).some((k) => k !== '@context')) {
      walkNode(rest, rootLabel(rest), null, {}, meta);
    }
    parsed['@graph'].forEach((el, i) => {
      if (isPlainObject(el)) walkNode(el, `@graph[${i}]`, null, {}, meta);
      else addHit(meta, '$', `@graph[${i}]`, 'jsonld-root', el,
        `@graph[${i}] is ${typeName(el)}, expected an object`);
    });
    return;
  }
  walkNode(parsed, rootLabel(parsed), null, {}, meta);
}

function rootLabel(obj) {
  return typeof obj['@type'] === 'string' ? obj['@type'] : '$';
}

function addHit(meta, typeContext, path, rule, value, message) {
  hits.push({ file: meta.file, block: meta.block, typeContext: typeContext || '$', path, rule, value: fmtValue(value), message });
}
function addWarning(meta, typeContext, path, rule, value, message) {
  warnings.push({ file: meta.file, block: meta.block, typeContext: typeContext || '$', path, rule, value: fmtValue(value), message });
}

/**
 * Recursively check one node.
 * nodePath    — display path of THIS node (e.g. "FAQPage.mainEntity[2]")
 * inheritedType — nearest enclosing string @type
 * flags       — { inBreadcrumb }
 */
function walkNode(node, nodePath, inheritedType, flags, meta) {
  if (Array.isArray(node)) {
    node.forEach((el, i) => walkNode(el, `${nodePath}[${i}]`, inheritedType, flags, meta));
    return;
  }
  if (!isPlainObject(node)) return;

  // @type must be a string
  let ownType = null;
  if ('@type' in node) {
    if (typeof node['@type'] === 'string') ownType = node['@type'];
    else addHit(meta, inheritedType, `${nodePath}.@type`, 'type-string', node['@type'],
      `@type must be a string, got ${typeName(node['@type'])}`);
  }
  const effType = ownType || inheritedType;

  // AggregateRating must not exist at all on this pre-launch site (warning)
  if (ownType === 'AggregateRating') {
    addWarning(meta, effType, nodePath, 'aggregate-rating-present', node,
      'AggregateRating present — the site is pre-launch and must carry no ratings markup');
  }
  if ('aggregateRating' in node) {
    // If the value is itself an AggregateRating node, that node's own
    // warning (above, when it is walked) covers this presence — don't double-report.
    const v = node['aggregateRating'];
    if (!(isPlainObject(v) && v['@type'] === 'AggregateRating')) {
      addWarning(meta, effType, `${nodePath}.aggregateRating`, 'aggregate-rating-present', v,
        '"aggregateRating" property present — the site is pre-launch and must carry no ratings markup');
    }
  }

  const childFlags = { inBreadcrumb: flags.inBreadcrumb || effType === 'BreadcrumbList' };
  const hitPaths = new Set(); // paths already hit in THIS object, for numeric-string dedupe

  for (const [key, val] of Object.entries(node)) {
    if (key === '@context' || key === '@type') continue;
    const propPath = `${nodePath}.${key}`;
    const before = hits.length;
    checkProperty(key, val, propPath, { node, effType, flags: childFlags, meta });
    for (let i = before; i < hits.length; i++) hitPaths.add(hits[i].path);
    // Generic numeric-string rule (lowest priority; specific rules win)
    if (!hitPaths.has(propPath) && key !== 'priceRange'
        && (key.endsWith('Count') || GENERIC_NUMERIC_KEYS.has(key))
        && typeof val === 'string' && NUMERIC_STRING_RE.test(val.trim())) {
      addHit(meta, effType, propPath, 'numeric-string', val,
        `"${key}" is conventionally numeric but holds the string ${fmtValue(val)} — use a number`);
      hitPaths.add(propPath);
    }
    // Recurse
    if (isPlainObject(val) || Array.isArray(val)) {
      walkNode(val, propPath, effType, childFlags, meta);
    }
  }
}

function checkProperty(key, val, propPath, { node, effType, flags, meta }) {
  const hit = (rule, value, message) => addHit(meta, effType, propPath, rule, value, message);

  // position — integer only
  if (key === 'position') {
    if (!(typeof val === 'number' && Number.isInteger(val))) {
      hit('position-integer', val,
        `"position" must be an integer, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // Date fields — ISO 8601 strings only
  if (DATE_FIELDS.has(key)) {
    const checkOne = (v, p) => {
      if (typeof v !== 'string' || !ISO_DATE_RE.test(v)) {
        addHit(meta, effType, p, 'date-iso8601', v,
          `"${key}" must be an ISO 8601 string (YYYY-MM-DD or full datetime), got ${typeName(v)} ${fmtValue(v)}`);
      }
    };
    if (Array.isArray(val)) val.forEach((v, i) => { if (!isPlainObject(v)) checkOne(v, `${propPath}[${i}]`); });
    else checkOne(val, propPath);
    return;
  }

  // URL fields — absolute http(s) when strings; objects are recursed by caller
  if (URL_FIELDS.has(key) || key === 'sameAs') {
    const checkUrl = (v, p) => {
      if (typeof v === 'string') {
        if (!ABS_URL_RE.test(v)) {
          addHit(meta, effType, p, 'url-absolute', v,
            `"${key}" must be an absolute http(s) URL, got ${fmtValue(v)}`);
        }
      } else if (!isPlainObject(v) && !Array.isArray(v)) {
        addHit(meta, effType, p, 'url-absolute', v,
          `"${key}" must be a URL string (or an object), got ${typeName(v)} ${fmtValue(v)}`);
      }
    };
    if (Array.isArray(val)) val.forEach((v, i) => checkUrl(v, `${propPath}[${i}]`));
    else checkUrl(val, propPath);
    return;
  }

  // Entity fields — objects with a string @type, never bare strings
  if (ENTITY_FIELDS.has(key)) {
    const checkEntity = (v, p) => {
      if (isPlainObject(v)) {
        if (typeof v['@type'] !== 'string') {
          addHit(meta, effType, p, 'entity-object', v,
            `"${key}" object must carry a string "@type" (Organization/Person/Thing)`);
        }
      } else if (Array.isArray(v)) {
        v.forEach((el, i) => checkEntity(el, `${p}[${i}]`));
      } else {
        addHit(meta, effType, p, 'entity-object', v,
          `"${key}" must be an object with "@type" (Organization/Person/Thing), got ${typeName(v)} ${fmtValue(v)}`);
      }
    };
    checkEntity(val, propPath);
    return;
  }

  // Offer: priceCurrency — 3-letter string ("price" itself is never checked)
  if (key === 'priceCurrency') {
    if (typeof val !== 'string' || !CURRENCY_RE.test(val)) {
      hit('offer-price-currency', val,
        `"priceCurrency" must be a 3-letter string (e.g. "USD"), got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }
  // availability / itemCondition — schema.org URLs
  if (key === 'availability' || key === 'itemCondition') {
    if (typeof val !== 'string' || !SCHEMA_URL_RE.test(val)) {
      hit('offer-schema-url', val,
        `"${key}" must be a schema.org URL (e.g. "https://schema.org/InStock"), got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // GeoCoordinates numbers
  if (key === 'latitude' || key === 'longitude') {
    if (typeof val !== 'number') {
      hit('geo-number', val,
        `"${key}" must be a number, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // AggregateRating numeric fields — numbers only
  if (RATING_NUM_FIELDS.has(key)) {
    if (typeof val !== 'number') {
      hit('rating-number', val,
        `"${key}" must be a number, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // Booleans must be booleans
  if (BOOLEAN_FIELDS.has(key)) {
    if (typeof val !== 'boolean') {
      hit('boolean-type', val,
        `"${key}" must be a boolean, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // name / headline / description must be strings
  if (STRING_FIELDS.has(key)) {
    if (typeof val !== 'string') {
      hit('string-prop', val,
        `"${key}" must be a string, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // FAQPage: acceptedAnswer must be an object
  if (key === 'acceptedAnswer') {
    if (!isPlainObject(val)) {
      hit('faq-accepted-answer', val,
        `"acceptedAnswer" must be an object (Answer), got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }
  // FAQPage: Answer.text must be a string
  if (key === 'text' && effType === 'Answer') {
    if (typeof val !== 'string') {
      hit('faq-answer-text', val,
        `Answer "text" must be a string, got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }

  // BreadcrumbList: item must be an absolute URL string or an object with @id
  if (key === 'item' && flags.inBreadcrumb) {
    if (typeof val === 'string') {
      if (!ABS_URL_RE.test(val)) {
        hit('breadcrumb-item', val,
          `BreadcrumbList "item" must be an absolute URL, got ${fmtValue(val)}`);
      }
    } else if (isPlainObject(val)) {
      if (!('@id' in val)) {
        hit('breadcrumb-item', val,
          `BreadcrumbList "item" object must carry an "@id"`);
      }
    } else {
      hit('breadcrumb-item', val,
        `BreadcrumbList "item" must be an absolute URL string or an object with "@id", got ${typeName(val)} ${fmtValue(val)}`);
    }
    return;
  }
}

// ---------- scan ----------
const BLOCK_RE = /<script\b[^>]*?type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script\s*>/gi;
let pagesWithBlocks = 0;

for (const file of files) {
  const rel = relative(ROOT, file).split('\\').join('/');
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  BLOCK_RE.lastIndex = 0;
  let m;
  let blockIndex = 0;
  let fileBlocks = 0;
  while ((m = BLOCK_RE.exec(text)) !== null) {
    blocksScanned++;
    fileBlocks++;
    const raw = m[1].trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
      blocksParsed++;
    } catch (e) {
      hits.push({
        file: rel, block: blockIndex, typeContext: '$', path: '$',
        rule: 'json-parse', value: fmtValue(raw),
        message: `JSON-LD block does not parse as JSON: ${e.message}`,
      });
      blockIndex++;
      continue;
    }
    // checkBlock works with absolute-ish meta; swap file to rel afterwards
    const beforeHits = hits.length;
    const beforeWarn = warnings.length;
    checkBlock(parsed, rel, blockIndex);
    for (let i = beforeHits; i < hits.length; i++) hits[i].file = rel;
    for (let i = beforeWarn; i < warnings.length; i++) warnings[i].file = rel;
    blockIndex++;
  }
  if (fileBlocks > 0) pagesWithBlocks++;
}

// ---------- report ----------
const pass = hits.length === 0;

if (JSON_OUT) {
  console.log(JSON.stringify({
    root: ROOT,
    filesScanned: files.length,
    pagesWithBlocks,
    blocksScanned,
    blocksParsed,
    totals: { hits: hits.length, warnings: warnings.length },
    hits,
    warnings,
    pass,
  }, null, 2));
} else {
  console.log('='.repeat(72));
  console.log('SEMANTIC SCHEMA CHECK — Lookauramax (JSON-LD value types)');
  console.log(`root: ${ROOT}`);
  console.log(`pages scanned: ${files.length} · pages with JSON-LD: ${pagesWithBlocks} · blocks scanned: ${blocksScanned} · blocks parsed: ${blocksParsed}`);
  console.log('-'.repeat(72));
  if (hits.length) {
    console.log(`HITS (${hits.length}) — type errors:`);
    let currentFile = null;
    for (const h of hits) {
      if (h.file !== currentFile) { currentFile = h.file; console.log(`\n  ${h.file}`); }
      console.log(`    [${h.rule}] block #${h.block} · @type context: ${h.typeContext}`);
      console.log(`      path:  ${h.path}`);
      console.log(`      value: ${h.value}`);
      console.log(`      rule:  ${h.message}`);
    }
    console.log('');
  }
  if (warnings.length) {
    console.log(`WARNINGS (${warnings.length}) — never fail the build, human judgement:`);
    let currentFile = null;
    for (const w of warnings) {
      if (w.file !== currentFile) { currentFile = w.file; console.log(`\n  ${w.file}`); }
      console.log(`    [${w.rule}] block #${w.block} · @type context: ${w.typeContext}`);
      console.log(`      path:  ${w.path}`);
      console.log(`      value: ${w.value}`);
      console.log(`      note:  ${w.message}`);
    }
    console.log('');
  }
  console.log('='.repeat(72));
  console.log(pass
    ? `RESULT: PASS — 0 type errors across ${blocksScanned} blocks (${warnings.length} warning(s)).`
    : `RESULT: FAIL — ${hits.length} type error(s) across ${blocksScanned} blocks (${warnings.length} warning(s)).`);
}

process.exit(pass ? 0 : 1);
