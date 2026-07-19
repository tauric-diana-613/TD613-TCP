import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const manifestPath = path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime', 'canonical-cache-fixture-manifest.json');
const sha256 = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const v7Epoch = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';

const scopeTarget = `  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanKeys = Object.keys(cleanEntries);`;
const scopeReplacement = `  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanTransition = await page.evaluate(() => window.__td613AshCacheTransition || null);
  const cleanKeys = Object.keys(cleanEntries);`;
const valueTarget = `    cache_navigation_replaced: window.__td613AshCacheTransition?.navigation_replaced ?? null,`;
const valueReplacement = `    cache_navigation_replaced: cleanTransition?.navigation_replaced ?? null,`;
const sessionKeyTarget = `  'td613.ash.cache-flush.epoch'
]);`;
const sessionKeyReplacement = `  'td613.ash.cache-flush.epoch',
  'td613.ash.session.epoch'
]);`;
const v7EpochTarget = `  'td613.ash.cache-flush/2026-07-18-canonical-membrane-v6'
];`;
const v7EpochReplacement = `  'td613.ash.cache-flush/2026-07-18-canonical-membrane-v6',
  '${v7Epoch}'
];`;

const original = (await fs.readFile(probePath, 'utf8')).replace(/\r\n/g, '\n');
let prepared = original;
const transformations = [];

if (!prepared.includes('const cleanTransition = await page.evaluate')) {
  const count = prepared.split(scopeTarget).length - 1;
  if (count !== 1) throw new Error(`Canonical cache fixture expected one browser-scope seam; observed ${count}.`);
  prepared = prepared.replace(scopeTarget, scopeReplacement);
  transformations.push('READ_CACHE_TRANSITION_INSIDE_BROWSER_CONTEXT');
}

if (prepared.includes(valueTarget)) {
  prepared = prepared.replace(valueTarget, valueReplacement);
  transformations.push('BIND_CLEAN_ARRIVAL_RECEIPT_TO_BROWSER_VALUE');
}

if (!prepared.includes("'td613.ash.session.epoch'")) {
  const count = prepared.split(sessionKeyTarget).length - 1;
  if (count !== 1) throw new Error(`Canonical cache fixture expected one active-session allowlist seam; observed ${count}.`);
  prepared = prepared.replace(sessionKeyTarget, sessionKeyReplacement);
  transformations.push('ALLOW_CANONICAL_ACTIVE_SESSION_EPOCH_AFTER_DELIBERATE_ENTRY');
}

if (!prepared.includes(`'${v7Epoch}'`)) {
  const count = prepared.split(v7EpochTarget).length - 1;
  if (count !== 1) throw new Error(`Canonical cache fixture expected one v6 epoch seam; observed ${count}.`);
  prepared = prepared.replace(v7EpochTarget, v7EpochReplacement);
  transformations.push('ADMIT_V7_ONE_TIME_CACHE_MIGRATION_EPOCH');
}

if (!prepared.includes('const cleanTransition = await page.evaluate')
  || !prepared.includes(valueReplacement)
  || !prepared.includes("'td613.ash.session.epoch'")
  || !prepared.includes(`'${v7Epoch}'`)
  || prepared.includes(valueTarget)) {
  throw new Error('Canonical cache closure fixture did not isolate browser state or admit v7 correctly.');
}

if (prepared !== original) await fs.writeFile(probePath, prepared, 'utf8');
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema:'td613.ash-keep.canonical-cache-closure-fixture/v0.3-v7-epoch',
  source_probe:path.relative(repoRoot, probePath),
  posture:transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED',
  source_sha256:sha256(original),
  prepared_sha256:sha256(prepared),
  transformations,
  browser_state_read_via_page_evaluate:true,
  cache_navigation_required:false,
  active_document_replacement_allowed:false,
  permitted_active_session_key:'td613.ash.session.epoch',
  permitted_cache_migration_epoch:v7Epoch,
  session_epoch_written_only_after_deliberate_entry:true,
  product_ui_mutated:false,
  promotion_authorized:false,
  transport_authorized:false
}, null, 2)}\n`);

console.log(`prepare-ash-canonical-cache-closure-fixture.mjs passed · ${transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED'}`);
