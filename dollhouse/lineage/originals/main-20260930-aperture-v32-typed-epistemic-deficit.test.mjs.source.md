import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_V32_REPLAY_STABILITY,
  APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA,
  auditTypedEpistemicDeficit,
  classifyTypedEpistemicDeficit,
  selfTestTypedEpistemicDeficit
} from '../app/engine/aperture-v32-typed-epistemic-deficit.js';
import { releaseManifestFromMetadata } from '../scripts/lib/aperture-sync-lane.mjs';

const base = {
  latent_dimension: 2,
  current_rank: 2,
  sigma_min: 1,
  condition_number: 1,
  uncertainty_status: 'VALID_DECLARED',
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10
};

const cases = [
  [{ ...base, current_rank: 1 }, 'STRUCTURAL_RANK_DEFICIT', 'PROPOSE'],
  [{ ...base, sigma_min: 0.1 }, 'NUMERICAL_STABILITY_DEFICIT', 'PROPOSE'],
  [base, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT', 'ASK_NOTHING'],
  [{ ...base, uncertainty_status: 'INCOMPLETE' }, 'NOISE_GEOMETRY_INCOMPLETE', 'ABSTAIN'],
  [{ ...base, uncertainty_status: 'INVALID' }, 'INVALID_NOISE_GEOMETRY', 'REJECT']
];

for (const [input, deficitClass, disposition] of cases) {
  const result = classifyTypedEpistemicDeficit(input);
  assert.equal(result.deficit_class, deficitClass);
  assert.equal(result.disposition, disposition);
  assert.equal(Object.isFrozen(result), true);
}

assert.equal(
  classifyTypedEpistemicDeficit({ ...base, uncertainty_status: '' }).deficit_class,
  'NOISE_GEOMETRY_INCOMPLETE'
);
assert.equal(
  classifyTypedEpistemicDeficit({ ...base, current_rank: 3 }).deficit_class,
  'INVALID_DECLARED_OPERATOR_STATE'
);
assert.throws(() => classifyTypedEpistemicDeficit({ ...base, sigma_min: 'missing' }), /must be finite/);

const receipt = auditTypedEpistemicDeficit({ ...base, sigma_min: 0.1 });
assert.equal(receipt.schema, APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA);
assert.equal(receipt.classification_replay_stability, APERTURE_V32_REPLAY_STABILITY);
assert.equal(receipt.no_scalar_crown, true);
assert.equal(receipt.automatic_observation, false);
assert.equal(receipt.automatic_experiment_execution, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutation, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(Object.hasOwn(receipt, 'score'), false);
assert.equal(Object.isFrozen(receipt), true);
assert.equal(selfTestTypedEpistemicDeficit().status, 'pass');

const tool = fs.readFileSync('app/aperture/tool.html', 'utf8');
assert.match(tool, /id="apertureV32TypedEpistemicDeficitContract"/);
assert.match(tool, /id="apertureV32ScanGrammarAddendum"/);
assert.match(tool, /window\.TD613_APERTURE_V32_EXPERIMENT_DESIGN=Object\.freeze/);
assert.match(tool, /classification_replay_stability:'HELD_NOT_YET_WITNESSED'/);
assert.match(tool, /td613\.aperture\.diagnostic-receipt\/v3\.0-alpha/);
assert.match(tool, /td613\.aperture\.round-trip-receipt\/v3\.0-alpha/);
const runtime = tool.match(/<script id="apertureV32TypedEpistemicDeficitRuntime">([\s\S]*?)<\/script>/)?.[1] || '';
assert.doesNotMatch(runtime, /MutationObserver/);

const release = JSON.parse(fs.readFileSync('app/aperture/release.json', 'utf8'));
assert.equal(release.version, 'v3.2-alpha');
assert.equal(release.compatibility.phase4ReceiptSchemaVersion, 'v3.0-alpha');
assert.equal(release.compatibility.v3ProducerMayEmitV30BridgeReceipts, true);
assert.equal(release.experimentDesign.classificationReplayStability, APERTURE_V32_REPLAY_STABILITY);
assert.equal(release.experimentDesign.scalarScore, false);

const regenerated = releaseManifestFromMetadata({
  version: 'v3.2-alpha',
  schema: 'td613-aperture/v3.2-alpha',
  featureVersion: 'v3.2-alpha-typed-epistemic-deficit-and-stability-aware-widening-runtime',
  doctrineKernelSchema: 'td613.aperture.doctrine-kernel/v2.9.4'
}, release);
assert.equal(regenerated.domeDiagnosticReceiptSchema, 'td613.aperture.diagnostic-receipt/v3.0-alpha');
assert.equal(regenerated.roundTripReceiptSchema, 'td613.aperture.round-trip-receipt/v3.0-alpha');
assert.equal(regenerated.observatory.tomographyReceiptSchema, 'td613.aperture.admissibility-tomography-receipt/v0.2');

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  states: cases.length,
  replay_stability: receipt.classification_replay_stability,
  bridge_receipt_version: release.compatibility.phase4ReceiptSchemaVersion
}, null, 2));
