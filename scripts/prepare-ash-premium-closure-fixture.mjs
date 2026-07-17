import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const manifestPath = path.resolve(
  process.env.TD613_PREMIUM_CLOSURE_FIXTURE_MANIFEST
    || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime', 'premium-fixture-manifest.json')
);

const target = `  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);

  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));`;

const replacement = `  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);

  const premiumCommandInstrument = await page.evaluate(() => Boolean(window.__td613AshPremiumUI?.version));
  if (premiumCommandInstrument) {
    await page.evaluate(() => window.__td613AshPremiumUI.open('save'));
    await page.waitForFunction(() => document.getElementById('workspace-save')?.classList.contains('active'));
  }

  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));`;

const marker = 'const premiumCommandInstrument = await page.evaluate';
const sha256 = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;

const original = (await fs.readFile(probePath, 'utf8')).replace(/\r\n/g, '\n');
let prepared = original;
let posture = 'ALREADY_PREPARED';
if (!original.includes(marker)) {
  const count = original.split(target).length - 1;
  if (count !== 1) throw new Error(`Premium closure fixture expected one authenticated-import seam; observed ${count}.`);
  prepared = original.replace(target, replacement);
  posture = 'PREPARED_NOW';
}

if (!prepared.includes(marker)
  || !prepared.includes("window.__td613AshPremiumUI.open('save')")
  || !prepared.includes("document.getElementById('workspace-save')?.classList.contains('active')")) {
  throw new Error('Premium closure fixture did not materialize the exact Save re-entry seam.');
}

if (prepared !== original) await fs.writeFile(probePath, prepared, 'utf8');
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.premium-production-closure-fixture/v0.1',
  source_probe: path.relative(repoRoot, probePath),
  posture,
  source_sha256: sha256(original),
  prepared_sha256: sha256(prepared),
  transformation: 'REOPEN_EXACT_SAVE_AFTER_AUTHENTICATED_CAPSULE_BEFORE_TAMPER_ASSAY',
  source_file_mutated_in_ephemeral_ci_checkout_only: true,
  product_ui_mutated: false,
  promotion_authorized: false,
  transport_authorized: false,
  cinder_authorized: false
}, null, 2)}\n`);

console.log(`prepare-ash-premium-closure-fixture.mjs passed · ${posture}`);
