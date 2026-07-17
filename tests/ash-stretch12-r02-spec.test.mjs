import assert from 'node:assert/strict';
import fs from 'node:fs';

const spec = fs.readFileSync('docs/ASH_KEEP_STRETCH12_CONTINUATION_SPEC_V0_2.md', 'utf8');
const receipt = fs.readFileSync('docs/ASH_KEEP_STRETCH12_REVISION_0_2_RECONCILIATION.md', 'utf8');

for (const token of [
  'Ash Keep Stretch 12 — Continuation Specification v0.2',
  'Stretch 12 · Revision 0.2',
  'S12-A through S12-F',
  'Ash Portable Environment Qualification / APEQ',
  'Portable Anisotropic Information Architecture / PAIA',
  'Universal transport: false',
  'Universal non-reconstructability: false',
  'encryption ≠ semantic non-reconstructability',
  'Flow-Core weather ≠ custody',
  'Capsule ≠ provider packet',
  'unknown Reader ≠ safe Reader',
  'Free caller-supplied rank assertions are forbidden',
  'promotion from constructed preflight',
  'NO_STRETCH_13_IS_CONSTITUTED',
  '11 active + 1 reserved'
]) assert.ok(spec.includes(token) || receipt.includes(token), `Missing Revision 0.2 law: ${token}`);

for (const workPackage of ['S12-A','S12-B','S12-C','S12-D','S12-E','S12-F']) {
  assert.ok(spec.includes(`### ${workPackage} ·`), `Missing work package ${workPackage}`);
}

assert.match(receipt, /S12-SPEC → S12-A → S12-B → S12-C → S12-D → S12-E → S12-F/);
assert.match(receipt, /portable_anisotropy_demonstrated/);
assert.match(receipt, /Constructed semantic preflight remains PA1–PA2 evidence only/);
assert.doesNotMatch(receipt, /STRETCH_13_(?:OPEN|AUTHORIZED|CONSTITUTED)/);

console.log('ash-stretch12-r02-spec.test.mjs passed');
