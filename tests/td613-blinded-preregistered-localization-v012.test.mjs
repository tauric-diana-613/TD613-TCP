import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  adjudicateBlind,
  collapsedTerminalBlind
} from './helpers/phase5-role-typed-adjudicator-v011.mjs';
import { sourceSet } from './helpers/phase5-fixtures.mjs';

const manifestPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/2026-09-15-held-out-defect-localization-v012-preregistration.json';
const helperPath = 'tests/helpers/phase5-role-typed-adjudicator-v011.mjs';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const helperSource = fs.readFileSync(helperPath, 'utf8');

function gitBlobSha(text) {
  const bytes = Buffer.from(text, 'utf8');
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function wilson(successes, total, z = manifest.evaluation.z) {
  assert.ok(Number.isInteger(successes) && Number.isInteger(total) && total > 0 && successes >= 0 && successes <= total);
  const p = successes / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denominator;
  const half = z * Math.sqrt((p * (1 - p) / total) + (z2 / (4 * total * total))) / denominator;
  return Object.freeze({
    lower: Math.max(0, center - half),
    upper: Math.min(1, center + half)
  });
}

assert.equal(manifest.schema, 'td613.held-out-defect-localization-preregistration/v0.12');
assert.equal(manifest.state, 'PREREGISTERED_BEFORE_V012_EVALUATOR_IMPLEMENTATION');
assert.equal(gitBlobSha(helperSource), manifest.classifier_freeze.git_blob_sha, 'Frozen adjudicator helper must match the preregistered Git blob SHA.');
assert.equal(manifest.classifier_freeze.git_blob_sha, '43467c059a29527bedd9e39ddd5f03bb70d12f56');
assert.equal(manifest.classifier_freeze.commit_sha, '81469b0360c7c8b2d1587708a3ed8eba5eca6f65');
assert.equal(manifest.schedule.replicates_per_condition, 12);
assert.equal(manifest.schedule.condition_count, 6);
assert.equal(manifest.schedule.total_instances, 72);
assert.equal(manifest.schedule.defect_instances, 60);
assert.equal(manifest.blinding.adjudicator_receives_expected_labels, false);
assert.equal(manifest.blinding.adjudicator_receives_condition_code, false);
assert.equal(manifest.blinding.expected_labels_joined_only_after_prediction, true);

const base = await sourceSet({ assurance: 'L0_METADATA_ONLY' });

function buildHandoff(conditionCode, replicate) {
  const suffix = String(replicate).padStart(2, '0');
  const ash = structuredClone(base.ash);
  const flow = structuredClone(base.flow);
  const roundTrip = structuredClone(base.roundTrip);
  let routeScope = `v012-control-${suffix}`;

  switch (conditionCode) {
    case 'C0_VALID':
      break;
    case 'C1_ASH':
      ash.manifest.artifact_id = `artifact_phase5_fixture_tampered_v012_${suffix}`;
      routeScope = `v012-ash-${suffix}`;
      break;
    case 'C2_FLOW':
      flow.artifact_reference = `ashc_forbidden_v012_${suffix}`;
      routeScope = `v012-flow-${suffix}`;
      break;
    case 'C3_SCHEMA':
      roundTrip.schema = `td613.aperture.round-trip-receipt/unsupported-v012-${suffix}`;
      routeScope = `v012-schema-${suffix}`;
      break;
    case 'C4_REPLAY':
      roundTrip.context.receipt.missingness = [
        ...(roundTrip.context.receipt.missingness || []),
        `tampered-after-round-trip-digest-v012-${suffix}`
      ];
      routeScope = `v012-replay-${suffix}`;
      break;
    case 'C5_ROUTE':
      routeScope = ' '.repeat(replicate);
      break;
    default:
      throw new Error(`Unknown preregistered condition: ${conditionCode}`);
  }

  const handoff = Object.freeze({ ash, flow, roundTrip, routeScope, options: Object.freeze({}) });
  assert.deepEqual(
    Object.keys(handoff).sort(),
    [...manifest.classifier_freeze.input_ceiling].sort(),
    'Blind adjudicator input may not contain schedule identity or expected labels.'
  );
  for (const forbidden of manifest.classifier_freeze.forbidden_classifier_inputs) {
    assert.equal(forbidden in handoff, false, `Blind handoff leaked forbidden classifier input: ${forbidden}`);
  }
  return handoff;
}

const predictions = [];
for (let replicate = 1; replicate <= manifest.schedule.replicates_per_condition; replicate += 1) {
  for (const condition of manifest.schedule.conditions) {
    const handoff = buildHandoff(condition.condition_code, replicate);

    // Prediction occurs before any expected labels are joined to the result row.
    const collapsedTerminal = await collapsedTerminalBlind(handoff);
    const rolePrediction = await adjudicateBlind(handoff);

    predictions.push(Object.freeze({
      condition_code: condition.condition_code,
      replicate,
      collapsed_terminal: collapsedTerminal,
      role_terminal: rolePrediction.terminal,
      role_localization: rolePrediction.localization,
      expected_terminal: condition.expected_terminal,
      expected_localization: condition.expected_localization
    }));
  }
}

assert.equal(predictions.length, manifest.schedule.total_instances);
const defectRows = predictions.filter(row => row.expected_terminal === 'HOLD');
assert.equal(defectRows.length, manifest.schedule.defect_instances);

const collapsedBinaryCorrect = predictions.filter(row => row.collapsed_terminal === row.expected_terminal).length;
const roleBinaryCorrect = predictions.filter(row => row.role_terminal === row.expected_terminal).length;
const roleLocalizationCorrect = defectRows.filter(row => row.role_localization === row.expected_localization).length;
// A terminal-only classifier emits no defect-family prediction. Its localization output is therefore null by construction.
const collapsedLocalizationCorrect = 0;

const scores = Object.freeze({
  collapsed_binary_accuracy: collapsedBinaryCorrect / predictions.length,
  role_binary_accuracy: roleBinaryCorrect / predictions.length,
  binary_accuracy_absolute_delta: Math.abs(collapsedBinaryCorrect - roleBinaryCorrect) / predictions.length,
  collapsed_localization_accuracy: collapsedLocalizationCorrect / defectRows.length,
  role_localization_accuracy: roleLocalizationCorrect / defectRows.length,
  collapsed_binary_wilson_95: wilson(collapsedBinaryCorrect, predictions.length),
  role_binary_wilson_95: wilson(roleBinaryCorrect, predictions.length),
  collapsed_localization_wilson_95: wilson(collapsedLocalizationCorrect, defectRows.length),
  role_localization_wilson_95: wilson(roleLocalizationCorrect, defectRows.length)
});

const criteria = manifest.evaluation.pass_criteria;
assert.ok(scores.collapsed_binary_accuracy >= criteria.collapsed_binary_accuracy_min);
assert.ok(scores.role_binary_accuracy >= criteria.role_typed_binary_accuracy_min);
assert.ok(scores.binary_accuracy_absolute_delta <= criteria.binary_accuracy_absolute_delta_max);
assert.ok(scores.collapsed_localization_accuracy <= criteria.collapsed_localization_accuracy_max);
assert.ok(scores.role_localization_accuracy >= criteria.role_typed_localization_accuracy_min);
if (criteria.require_role_localization_wilson_lower_gt_collapsed_localization_wilson_upper) {
  assert.ok(
    scores.role_localization_wilson_95.lower > scores.collapsed_localization_wilson_95.upper,
    'Preregistered Wilson-interval separation criterion failed.'
  );
}

// Bind the deterministic observed values so later receipts cannot round-trip a different scorecard.
assert.equal(collapsedBinaryCorrect, 72);
assert.equal(roleBinaryCorrect, 72);
assert.equal(collapsedLocalizationCorrect, 0);
assert.equal(roleLocalizationCorrect, 60);
assert.ok(Math.abs(scores.collapsed_binary_wilson_95.lower - 0.9493488274035422) < 1e-12);
assert.ok(Math.abs(scores.role_localization_wilson_95.lower - 0.93982814785791) < 1e-12);
assert.ok(Math.abs(scores.collapsed_localization_wilson_95.upper - 0.06017185214208986) < 1e-12);

console.log(JSON.stringify({
  assay: 'td613.blinded-preregistered-defect-localization/v0.12',
  classifier_blob_sha: manifest.classifier_freeze.git_blob_sha,
  preregistration_commit: 'f62b62a25e19de7c6646376c8c23f3ccbc31970f',
  instances: predictions.length,
  defect_instances: defectRows.length,
  scores
}));
