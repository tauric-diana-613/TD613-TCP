import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  A15_R0_PROJECTIONS,
  getProjectionDescriptor
} from '../app/dome-world/previews/a15-r0/projection-registry.js';
import {
  ASH_DEMO_ASSET_EPOCH,
  ASH_DEMO_REGISTRY_VERSION
} from '../app/dome-world/ash-demo-registry.js';
import {
  BOUNDED_SIGMA_MAX,
  BOUNDED_SIGMA_MIN,
  MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA,
  PROCESS_IDS,
  buildMediatedIdentifiabilityCertificate,
  observeSyntheticProcess,
  pairInteractionResidue,
  selectLocalRegistry
} from '../app/dome-world/previews/a15-r0/moire-mediated-interventional-identifiability.js';

const BASE = '90c2b2da6a925e24f4c4e270dbff2098e309ee9d';
const html = fs.readFileSync('app/dome-world/previews/a15-r0/index.html', 'utf8');
const css = fs.readFileSync('app/dome-world/previews/a15-r0/a15-r0-harness.css', 'utf8');
const harness = fs.readFileSync('app/dome-world/previews/a15-r0/a15-r0-harness.js', 'utf8');
const mediatedSource = fs.readFileSync('app/dome-world/previews/a15-r0/moire-mediated-interventional-identifiability.js', 'utf8');
const mediatedSpec = fs.readFileSync('docs/research/2026-09-11-MOIRE-MEDIATED-INTERVENTIONAL-IDENTIFIABILITY-V0_1.md', 'utf8');
const receipt = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPERATOR_REJECTION_FREEZE_RECEIPT_V0_1.md', 'utf8');

assert.equal(A15_R0_PROJECTIONS.length, 3);
assert.deepEqual(A15_R0_PROJECTIONS.map(value => value.projection_id), ['A15_CONTROL', 'MINIMAL_ASH', 'PROTO_LOOM']);
for (const descriptor of A15_R0_PROJECTIONS) {
  assert.equal(descriptor.canonical, false);
  assert.equal(descriptor.preview_only, true);
  assert.equal(descriptor.disposable, true);
  assert.equal(descriptor.production_cutover_authorized, false);
  assert.equal(descriptor.deployment_authorized, false);
  assert.equal(descriptor.human_selection_required, true);
}
assert.equal(getProjectionDescriptor('A15_CONTROL').implementation_status, 'OBSERVABLE_CONTROL');
assert.equal(getProjectionDescriptor('A15_CONTROL').mutated_by_assay, false);
for (const id of ['MINIMAL_ASH', 'PROTO_LOOM']) {
  const descriptor = getProjectionDescriptor(id);
  assert.equal(descriptor.implementation_status, 'NOT_IMPLEMENTED');
  assert.deepEqual(descriptor.declared_controls, []);
  assert.equal(descriptor.entry_route, null);
}

for (const marker of [
  'Preview',
  'Synthetic',
  'Noncanonical',
  'Production unchanged',
  'No external transmission',
  'Human selection required',
  'Keep a reference with this case',
  'Connect it to the question',
  'Compare two routes',
  'Preserve this result',
  'Return to custody',
  'Rest',
  'Reset synthetic run',
  'Missingness',
  'Claim ceiling',
  'Last action receipt',
  'Current projection descriptor',
  'Interaction ownership',
  'Observable interface events'
]) assert.ok(html.includes(marker), `Preview omitted visible marker: ${marker}`);
assert.match(html, /<meta name="viewport"/);
assert.match(html, /role="status" aria-live="polite"/);
assert.match(css, /@media \(max-width: 520px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /min-height: 48px/);
assert.match(harness, /FIXTURE_URL = '\.\.\/\.\.\/fixtures\/a15-r0\/governed-task-fixture-v01\.json'/);
assert.match(harness, /button\.addEventListener\('click'/);
assert.doesNotMatch(harness, /stopImmediatePropagation|\.click\(\)|MutationObserver|indexedDB|localStorage|sessionStorage|caches\.|serviceWorker|sendBeacon|XMLHttpRequest/);
assert.doesNotMatch(html, /href="[^"]*(?:minimal-ash|proto-loom)|button[^>]*(?:minimal|loom)/i);
assert.equal((harness.match(/fetch\s*\(/g) || []).length, 1);
assert.match(harness, /fetch\(FIXTURE_URL, \{ cache: 'no-store', credentials: 'same-origin' \}\)/);

assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

// Fresh-main mediator-identifiability chamber: the passive pair surface must remain
// non-identifying, and only the declared synthetic intervention may separate H0/H1.
assert.equal(MOIRE_MEDIATED_IDENTIFIABILITY_SCHEMA, 'td613.dome-world.moire-mediated-interventional-identifiability/v0.1');
assert.equal(BOUNDED_SIGMA_MIN, -7);
assert.equal(BOUNDED_SIGMA_MAX, 7);
for (const g of [-1, 1]) {
  const h0Passive = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: true });
  const h1Passive = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: true });
  const h0Ablated = observeSyntheticProcess(PROCESS_IDS.OVERLAY_NUISANCE, { g, mediatorPresent: false });
  const h1Ablated = observeSyntheticProcess(PROCESS_IDS.MEDIATED, { g, mediatorPresent: false });
  assert.deepEqual(h0Passive.output, h1Passive.output, `passive outputs diverged for g=${g}`);
  assert.deepEqual(pairInteractionResidue(h0Passive.output), pairInteractionResidue(h1Passive.output), `passive residue diverged for g=${g}`);
  assert.notDeepEqual(h0Ablated.output, h1Ablated.output, `mediator ablation failed to separate processes for g=${g}`);
  assert.deepEqual(pairInteractionResidue(h1Ablated.output), [0, 0, 0], `mediated residue survived ablation for g=${g}`);
  assert.deepEqual(h0Ablated.output, h0Passive.output, `H0 changed under mediator switch for g=${g}`);
}
let boundedCases = 0;
for (const g of [-1, 1]) {
  for (let sigma = BOUNDED_SIGMA_MIN; sigma <= BOUNDED_SIGMA_MAX; sigma += 1) {
    const present = selectLocalRegistry({ g, mediatorPresent: true, sigma });
    const absent = selectLocalRegistry({ g, mediatorPresent: false, sigma });
    assert.equal(present.unique, true, `mediator-present registry ambiguous at g=${g}, sigma=${sigma}`);
    assert.equal(present.selected_registry, g, `bounded relation changed at g=${g}, sigma=${sigma}`);
    assert.equal(absent.state, 'AMBIGUOUS', `mediator-absent relation became identifying at g=${g}, sigma=${sigma}`);
    assert.equal(absent.selected_registry, null);
    boundedCases += 1;
  }
}
assert.equal(boundedCases, 30);
assert.equal(selectLocalRegistry({ g: 1, mediatorPresent: true, sigma: 9 }).selected_registry, -1);
assert.equal(selectLocalRegistry({ g: -1, mediatorPresent: true, sigma: -9 }).selected_registry, 1);

const mediatedCertificate = buildMediatedIdentifiabilityCertificate();
assert.equal(mediatedCertificate.passed, true);
assert.equal(mediatedCertificate.passive_observational_equivalence, true);
assert.equal(mediatedCertificate.passive_pair_residue_equivalence, true);
assert.equal(mediatedCertificate.mediator_ablation_separates_processes, true);
assert.equal(mediatedCertificate.mediated_ablation_clears_declared_interaction_residue, true);
assert.equal(mediatedCertificate.nuisance_model_unaffected_by_mediator_switch, true);
assert.equal(mediatedCertificate.bounded_registry_cases, 30);
assert.equal(mediatedCertificate.bounded_registry_stable, true);
assert.equal(mediatedCertificate.absent_mediator_registry_ambiguous, true);
assert.equal(mediatedCertificate.morphology_changes_without_registry_change, true);
assert.equal(mediatedCertificate.hostile_out_of_window.breaks_universal_invariance, true);
assert.equal(mediatedCertificate.exact_integer_arithmetic, true);
assert.equal(mediatedCertificate.source_provenance.external_source, 'arXiv:2607.02822');
assert.equal(mediatedCertificate.source_provenance.prepublication_td613_possession_claim, false);
for (const value of Object.values(mediatedCertificate.authority)) assert.equal(value, false, 'mediator assay widened authority');
for (const scar of [
  'SYNTHETIC_MEDIATOR_ABLATION != REAL_WORLD_CAUSAL_INTERVENTION',
  'PAIR_RESIDUE != MEDIATOR_CAUSATION',
  'GLOBAL_PARAMETER_TO_LOCAL_ARGMIN != PHYSICAL_STACKING_REGISTRY',
  'SOURCE_A_DERIVED_REPAIR != TD613_PREPUBLICATION_POSSESSION',
  'BOUNDED_SYNTHETIC_IDENTIFIABILITY != UNIVERSAL_IDENTIFIABILITY'
]) assert.ok(mediatedCertificate.scars.includes(scar), `mediator assay omitted scar ${scar}`);
assert.doesNotMatch(mediatedSource, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|caches\.|serviceWorker/);
for (const ceiling of [
  'PASSIVE_PAIR_RESIDUE != PROCESS_IDENTIFIABILITY',
  'BOUNDED_RELATION_PERSISTENCE != UNIVERSAL_INVARIANCE',
  'SOURCE_A_DERIVED_REPAIR != TD613_PREPUBLICATION_POSSESSION',
  'No external causal truth, physical moiré equivalence, universal identifiability, empirical exteriority, Western Horizon reopening, Golden Egg credit'
]) assert.ok(mediatedSpec.includes(ceiling), `fresh-main mediator spec omitted ceiling ${ceiling}`);

const p0Files = [
  'app/dome-world/ash-keep.html',
  'app/dome-world/ash-workspace-bridge.js',
  'app/dome-world/ash-premium-ui.js',
  'app/dome-world/ash-premium-ui.css',
  'app/dome-world/ash-premium-compatibility.js',
  'app/dome-world/ash-whole-instrument-pedagogy.js',
  'app/dome-world/ash-whole-instrument-pedagogy.css',
  'app/dome-world/ash-demo-entry-convergence.js',
  'app/dome-world/ash-flowcore-workspace-remount.js',
  'app/dome-world/ash-ui-ux-rescue.js'
];
const p0Diff = execFileSync('git', ['diff', '--name-only', BASE, '--', ...p0Files], { encoding: 'utf8' }).trim();
assert.equal(p0Diff, '', 'The A15 control witness was mutated by the assay.');

for (const marker of [
  'A15 technical production closure = PASSED',
  'A15 operator acceptance = FAILED',
  'current A15 production shell = WITNESS / NOT ACCEPTED',
  'A16 implementation = HELD',
  'Golden Egg implementation = HELD',
  'production action = NONE',
  'deployment action = NONE',
  'historical A15 receipts rewritten = false',
  'operator media received in this implementation session = false',
  'media evidence status = MISSING / MAY BE ADDED LATER'
]) assert.ok(receipt.includes(marker), `R0.0 receipt omitted ${marker}`);

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.preview-contract-test/v0.2-mediated-identifiability',
  descriptors: A15_R0_PROJECTIONS.length,
  mediated_identifiability: {
    passive_nonidentifying: mediatedCertificate.passive_pair_residue_equivalence,
    mediator_ablation_separates: mediatedCertificate.mediator_ablation_separates_processes,
    bounded_registry_cases: mediatedCertificate.bounded_registry_cases,
    bounded_registry_stable: mediatedCertificate.bounded_registry_stable,
    hostile_breaks_universal_invariance: mediatedCertificate.hostile_out_of_window.breaks_universal_invariance
  },
  p0_mutated: false,
  p1_implemented: false,
  p2_implemented: false,
  production_mutation: false,
  deployment_authorized: false,
  human_selection_required: true
}, null, 2));
