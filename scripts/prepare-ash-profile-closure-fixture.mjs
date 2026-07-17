import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const manifestPath = path.resolve(
  process.env.TD613_PROFILE_CLOSURE_FIXTURE_MANIFEST
    || path.join(here, '..', 'artifacts', 'ash-keep-probe-runtime', 'profile-fixture-manifest.json')
);

const replacements = [
  {
    label: 'profile-selected demo launch',
    from: `  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);`,
    to: `  await page.waitForFunction(() => Boolean(window.__td613AshProfileDemos?.version));
  await page.locator('#newProfile').selectOption('political_campaign');
  assert(await page.locator('#startDemo').isEnabled(), 'Political Campaign demo did not become available.');
  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);`
  },
  {
    label: 'profile-demo localStorage privacy assertion',
    from: `  assert(!localValues.includes('Glasshouse Archive inquiry') && !localValues.includes('node_archive'), 'Private case material entered localStorage');`,
    to: `  assert(!localValues.includes('Harbor City Mayoral Campaign') && !localValues.includes('node_candidate'), 'Private campaign case material entered localStorage');`
  },
  {
    label: 'profile-demo reload title',
    from: `  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);`,
    to: `  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);`
  },
  {
    label: 'prehydrated Route Memory successor count',
    from: `  assert(routeRecord?.entries.length === 1, 'Route Memory did not append exactly one successor entry');`,
    to: `  assert(routeRecord?.entries.length === 4, 'Profile Route Memory did not preserve three hydrated entries and append one successor entry');`
  }
];

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function replaceExactlyOnce(source, replacement) {
  const count = source.split(replacement.from).length - 1;
  if (count !== 1) {
    throw new Error(`Profile closure fixture requires exactly one ${replacement.label} seam; observed ${count}.`);
  }
  return source.replace(replacement.from, replacement.to);
}

const original = (await fs.readFile(probePath, 'utf8')).replace(/\r\n/g, '\n');
let prepared = original;
for (const replacement of replacements) prepared = replaceExactlyOnce(prepared, replacement);

if (!prepared.includes("selectOption('political_campaign')")
  || !prepared.includes('Harbor City Mayoral Campaign')
  || !prepared.includes('entries.length === 4')
  || prepared.includes('Glasshouse Archive inquiry')) {
  throw new Error('Profile closure fixture did not materialize every declared campaign-demo seam.');
}

await fs.writeFile(probePath, prepared, 'utf8');
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.profile-closure-fixture/v0.1',
  source_probe: path.relative(path.join(here, '..'), probePath),
  profile: 'political_campaign',
  demo_id: 'demo_political_campaign_rapid_response_v1',
  source_sha256: sha256(original),
  prepared_sha256: sha256(prepared),
  replacements: replacements.map(item => item.label),
  source_file_mutated_in_ephemeral_ci_checkout_only: true,
  production_product_mutated: false,
  maturity_promoted: false,
  transport_authorized: false,
  cinder_authorized: false
}, null, 2)}\n`);

console.log('prepare-ash-profile-closure-fixture.mjs passed');
