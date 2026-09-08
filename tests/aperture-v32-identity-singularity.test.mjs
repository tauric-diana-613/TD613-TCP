import assert from 'node:assert/strict';
import fs from 'node:fs';

const tool = fs.readFileSync('app/aperture/tool.html', 'utf8');
const probe = fs.readFileSync('scripts/aperture-v32-identity-singularity-browser-witness.mjs', 'utf8');
const wrapper = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
const prereg = fs.readFileSync('docs/aperture/v3.2-alpha/APERTURE_V32_IDENTITY_SINGULARITY_WITNESS_V0_1_PREREGISTRATION_20260907.md', 'utf8');

assert.match(tool, /<meta[^>]+name=["']aperture-version["'][^>]+content=["']v3\.2-alpha["']/i);
assert.match(tool, /<body[^>]+data-aperture-version=["']v3\.2-alpha["']/i);
assert.match(tool, /id=["']mFirmwareVer["'][^>]*>v3\.2-alpha</i);
assert.match(tool, /apertureV31AdmissibilityTomographyContract/);
assert.match(tool, /td613\.aperture\.v31-admissibility-tomography-contract\/v0\.1/);

const hostile = [];
const checks = [
  ['STALE_CURRENT_TITLE_V31', /(?:document\.title\s*=|\.textContent\s*=)\s*["']TD613 Aperture v3\.1-alpha["']/],
  ['STALE_BODY_VERSION_V31_V30', /document\.body(?:\?\.)?\.setAttribute\(\s*["']data-aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)/],
  ['STALE_ROOT_VERSION_V31_V30', /document\.documentElement(?:\?\.)?(?:\.setAttribute\(\s*["']data-aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)|\.dataset\.apertureVersion\s*=\s*["']v3\.[01]-alpha["'])/],
  ['STALE_VISIBLE_FIRMWARE_V31_V30', /(?:setText\(\s*["']mFirmwareVer["']\s*,\s*["']v3\.[01]-alpha["']|(?:mFirmwareVer|firmwareEl|firmwareVer|fw)\.textContent\s*=\s*["']v3\.[01]-alpha["'])/],
  ['STALE_VISIBLE_SCHEMA_V31_V30', /(?:setText\(\s*["']schemaVersionReadout["']\s*,\s*["']td613-aperture\/v3\.[01]-alpha["']|(?:schemaEl|schemaRead)\.textContent\s*=\s*["']td613-aperture\/v3\.[01]-alpha["'])/],
  ['STALE_META_VERSION_V31_V30', /(?:setMeta|ensureMeta)\(\s*["']aperture-version["']\s*,\s*["']v3\.[01]-alpha["']\s*\)/],
  ['STALE_WINDOW_APERTURE_VERSION_V31_V30', /window\.APERTURE_VERSION\s*=\s*["']v3\.[01]-alpha["']/],
  ['STALE_WINDOW_APERTURE_SCHEMA_V31_V30', /window\.APERTURE_SCHEMA_VERSION\s*=\s*["']td613-aperture\/v3\.[01]-alpha["']/],
  ['STALE_FIRMWARE_CURRENT_VERSION_V31_V30', /window\.FIRMWARE\.VERSION\s*=\s*["']v3\.[01]-alpha["']/],
  ['STALE_FIRMWARE_CURRENT_SCHEMA_V31_V30', /window\.FIRMWARE\.SCHEMA_VERSION\s*=\s*["']td613-aperture\/v3\.[01]-alpha["']/]
];
for (const [id, pattern] of checks) if (pattern.test(tool)) hostile.push(id);

assert.deepEqual(hostile, [], `Current v3.2 identity writer hostility detected: ${hostile.join(', ')}`);

for (const token of [
  'T0_DOM_READY',
  'T1_350MS',
  'T2_1000MS',
  'T3_2200MS',
  'document_title',
  'html_data_aperture_version',
  'body_data_aperture_version',
  'meta_aperture_version',
  'visible_firmware_readout',
  'visible_schema_readout',
  'window_APERTURE_VERSION',
  'window_APERTURE_SCHEMA_VERSION',
  'window_FIRMWARE_VERSION',
  'window_FIRMWARE_SCHEMA_VERSION',
  'counts_as_human_evidence: false',
  'production_observation: false',
  'release_authority: false',
  'merge_authority: false',
  'vercel_authority: false',
  'provider_call_performed: false',
  'human_closure_required: true',
  'exogenous_witness_credit: 0',
  'golden_egg_credit: 0'
]) assert.ok(probe.includes(token), `Identity witness omitted ${token}`);

assert.match(probe, /\/aperture\/tool\.html/);
assert.match(probe, /chromium, firefox, webkit/);
assert.match(probe, /waitForTimeout\(350\)/);
assert.match(probe, /waitForTimeout\(650\)/);
assert.match(probe, /waitForTimeout\(1200\)/);
assert.doesNotMatch(probe, /page\.(?:click|fill|type|press|selectOption)\(/);
assert.doesNotMatch(probe, /fetch\([^)]*method\s*:\s*["'](?:POST|PUT|PATCH|DELETE)/i);

assert.match(wrapper, /await import\(['"]\.\/aperture-v32-identity-singularity-browser-witness\.mjs['"]\)/,
  'Three-engine transition wrapper must execute the delayed Aperture identity witness.');

assert.match(prereg, /ATTACHMENT_DIVERGENCE != REPOSITORY_REGRESSION/);
assert.match(prereg, /DOM_READY_GREEN != DELAYED_IDENTITY_CONVERGENCE/);
assert.match(prereg, /Chromium \+ Firefox \+ WebKit delayed identity witness/);
assert.match(prereg, /exogenous_witness_credit = 0/);
assert.match(prereg, /golden_egg_credit = 0/);

console.log('aperture-v32-identity-singularity.test.mjs passed');
