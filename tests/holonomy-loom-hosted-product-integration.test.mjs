import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';
import {
  analyzeHolonomyLoomMessage,
  makeHolonomyLoomSaferCopy,
  HOLONOMY_LOOM_SCHEMA
} from '../app/dome-world/holonomy-loom/engine.js';

const hostedPath = 'app/dome-world/holonomy-loom.html';
const enginePath = 'app/dome-world/holonomy-loom/engine.js';
const legacyWitnessPath = 'scripts/holonomy-loom-hosted-product-integration-browser-witness.mjs';
const repairedWitnessPath = 'scripts/holonomy-loom-hosted-product-integration-browser-witness-v02.mjs';
const transitionWrapperPath = 'scripts/ash-a15-transition-trace-browser-probe.mjs';
const pedagogueFixturePath = 'tests/fixtures/pedagogue/holonomy-loom-hosted-observer-geometry-design.json';
const hosted = fs.readFileSync(hostedPath, 'utf8');
const engine = fs.readFileSync(enginePath);
const legacyWitness = fs.readFileSync(legacyWitnessPath, 'utf8');
const repairedWitness = fs.readFileSync(repairedWitnessPath, 'utf8');
const transitionWrapper = fs.readFileSync(transitionWrapperPath, 'utf8');

function gitBlobSha(buffer) {
  const prefix = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(prefix).update(buffer).digest('hex');
}

assert.equal(
  gitBlobSha(engine),
  '3686d8caa958c53caa485b2ef810cca13534ce10',
  'Hosted integration must reuse the exact earned #1034 Loom engine blob rather than reimplementing the rule ontology.'
);
assert.equal(HOLONOMY_LOOM_SCHEMA, 'td613.holonomy-loom.child-legible-preflight/v0.1');

assert.match(hosted, /<h1>Holonomy Loom<\/h1>/);
assert.match(hosted, /Before you send it, check what this message carries\./);
assert.match(hosted, /SEE → CHECK → UNDERSTAND → REST/);
assert.match(hosted, /data-route-mode="TD613_HOSTED"/);
assert.match(hosted, /data-provider-release-authority="false"/);
assert.match(hosted, /data-production-release="false"/);
assert.match(hosted, /CHECK THIS MESSAGE/);
assert.match(hosted, /KEEP/);
assert.match(hosted, /CHANGE/);
assert.match(hosted, /REMOVE/);
assert.match(hosted, /MAKE A SAFER COPY/);
assert.match(hosted, /COPY CHECKED MESSAGE/);
assert.match(hosted, /Show me why/);
assert.match(hosted, /Ask for model help \(optional\)/);
assert.match(hosted, /No model is called by this pre-release integration\./);
assert.match(hosted, /Provider advice remains advisory and receives no Loom release authority\./);
assert.match(hosted, /GREEN means only that no enabled Loom rule fired\./);
assert.match(hosted, /Resemblance alone does not establish provenance\./);
assert.match(hosted, /REST/);
assert.match(hosted, /RETURN/);
assert.match(hosted, /EXIT/);
assert.match(hosted, /href="\/dome-world\/ash-keep\.html"/);
assert.match(hosted, /from '\.\/holonomy-loom\/engine\.js'/);

for (const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon(',
  'new WebSocket(',
  'new EventSource(',
  'GEMINI_API_KEY',
  '/api/khonapolit',
  'release_authority = true',
  'data-provider-release-authority="true"',
  'data-production-release="true"'
]) {
  assert.ok(!hosted.includes(forbidden), `Hosted default check must not introduce forbidden route/authority surface: ${forbidden}`);
}

const protectedTerm = 'PRIVATE_TD613_HOSTED_613';
const journeyMarker = 'JOURNEY_TD613_HOSTED_613';
const red = analyzeHolonomyLoomMessage({
  text: `ordinary ${protectedTerm} ${journeyMarker}`,
  protectedTerms: [{ value: protectedTerm, label: 'protected fixture' }],
  journeyMarkers: [{ value: journeyMarker, label: 'journey fixture' }]
});
assert.equal(red.status, 'RED');
assert.equal(red.release_boundary.raw_release_allowed, false);
assert.equal(red.release_boundary.safer_copy_available, true);
assert.equal(red.journey_relations.length, 1);
assert.equal(red.journey_relations[0].relation_id, 'DECLARED_JOURNEY_MARKER_MATCH');
assert.match(red.journey_relations[0].claim_ceiling, /not claiming the connection proves truth/i);

const safer = makeHolonomyLoomSaferCopy({
  text: `ordinary ${protectedTerm}`,
  protectedTerms: [{ value: protectedTerm, label: 'protected fixture' }],
  journeyMarkers: []
});
assert.equal(safer.release_allowed, true);
assert.ok(!safer.text.includes(protectedTerm));

const warning = analyzeHolonomyLoomMessage({
  text: 'contact lab@example.org at 2026-09-07T13:35:00-04:00',
  protectedTerms: [],
  journeyMarkers: []
});
assert.equal(warning.status, 'YELLOW');
assert.deepEqual(new Set(warning.findings.map(item => item.rule_id)), new Set(['EMAIL_IDENTIFIER', 'EXACT_TIMESTAMP']));

const green = analyzeHolonomyLoomMessage({ text: 'ordinary bounded message', protectedTerms: [], journeyMarkers: [] });
assert.equal(green.status, 'GREEN');
assert.equal(green.summary, 'Nothing matched the protection rules you turned on.');
assert.equal(green.release_boundary.raw_release_allowed, true);
assert.equal(green.release_boundary.downstream_platform_governed, false);

const resemblanceOnly = analyzeHolonomyLoomMessage({ text: `ordinary ${journeyMarker}`, protectedTerms: [], journeyMarkers: [] });
assert.equal(resemblanceOnly.journey_relations.length, 0, 'Undeclared resemblance must not become provenance.');

const pedagogueFixture = JSON.parse(fs.readFileSync(pedagogueFixturePath, 'utf8'));
const pedagogueReview = await compilePedagogueDesignReview(pedagogueFixture);
for (const [gate, held] of Object.entries(pedagogueReview.design_gate)) {
  assert.equal(held, true, `Holonomy Loom Pedagogue observer-geometry gate must hold ${gate}`);
}
assert.equal(pedagogueReview.surface_reference, 'Dome-World/Holonomy Loom hosted GREEN consequence');
assert.equal(pedagogueReview.design_gate.consequence_before_ontology, true);
assert.equal(pedagogueReview.design_gate.rest_and_exit_preserved, true);
assert.equal(pedagogueReview.design_gate.aia_invariants_preserved, true);
assert.equal(pedagogueReview.design_gate.route_history_explicit, true);
assert.equal(pedagogueReview.design_gate.automatic_redesign_forbidden, true);
assert.equal(pedagogueReview.design_gate.human_closure_required, true);
assert.ok(pedagogueReview.burden_comparison.improved_model_count >= 1, 'Pedagogue consequence-first repair should improve at least one comparative burden model.');
assert.ok(Object.values(pedagogueReview.burden_comparison.delta_millipoints).every(value => value <= 0), 'Pedagogue observer repair may not worsen any comparative route-burden model.');
assert.equal(pedagogueReview.aia_surface_family_report.authority_transferred, false);

assert.ok(
  legacyWitness.includes("check('GREEN promise remains bounded', (await page.locator('#promiseDisclosure').innerText()).includes('GREEN means only that no enabled Loom rule fired'))"),
  'The original three-engine false-negative observer must remain preserved as historical evidence.'
);
assert.match(repairedWitness, /legacy observer reproduces only the preserved closed-details false negative/);
assert.match(repairedWitness, /VISIBLE_SUMMARY_PLUS_DECLARED_CLOSED_DISCLOSURE_STATE/);
assert.match(repairedWitness, /visible GREEN consequence is exact and bounded/);
assert.match(repairedWitness, /technical promise remains optional after visible consequence/);
assert.match(repairedWitness, /same_claim_family_not_same_encounter_route: true/);
assert.match(repairedWitness, /product_bytes_mutated_by_repair: false/);
assert.match(transitionWrapper, /holonomy-loom-hosted-product-integration-browser-witness-v02\.mjs/);
assert.ok(!transitionWrapper.includes("path.join(scriptsDir, 'holonomy-loom-hosted-product-integration-browser-witness.mjs')"), 'Step 8 must invoke the repaired observer wrapper rather than bypassing it for the legacy witness.');

console.log(JSON.stringify({
  schema: 'td613.holonomy-loom.hosted-product-integration-static/v0.2-pedagogue-observer-geometry',
  status: 'PASS',
  donor_engine_blob: '3686d8caa958c53caa485b2ef810cca13534ce10',
  pedagogue_design_id: pedagogueReview.design_id,
  pedagogue_burden_delta_millipoints: pedagogueReview.burden_comparison.delta_millipoints,
  legacy_false_negative_preserved: true,
  repaired_observer_bound_to_step8: true,
  product_bytes_mutated_by_observer_repair: false,
  production_release_authority: false,
  provider_release_authority: false,
  human_closure_required: true,
  exogenous_witness_credit: 0,
  golden_egg_credit: 0
}, null, 2));
