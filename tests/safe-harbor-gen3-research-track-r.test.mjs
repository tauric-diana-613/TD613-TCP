import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  attachResearchTrackR,
  researchTrackRContainsRawText,
  runResearchTrackR
} from '../app/safe-harbor/app/safe-harbor-gen3-research-track-r.js';

function sentence(label, index, marker = 'However') {
  return `${marker} the ${label} route ${index} carries source relations through a bounded chamber, and the record returns with qualification, contrast, evidence order, uncertainty, and closure.`;
}

function lane(label, marker) {
  return Array.from({ length: 36 }, (_, index) => sentence(label, index + 1, marker)).join(' ');
}

function controlText(label, marker) {
  return Array.from({ length: 12 }, (_, index) => sentence(label, index + 1, marker)).join(' ');
}

const segments = {
  future_self: lane('future', 'However'),
  past_self: lane('past', 'Although'),
  higher_self: lane('higher', 'Therefore')
};

const blindCandidates = [
  ['genuine', 'genuine-holdout', 'sealed-entrant-holdout', 'placeholder'],
  ['topic', 'topic-matched-human-control', 'synthetic-topic', controlText('topic', 'Meanwhile')],
  ['paraphrase', 'semantic-paraphrase-control', 'synthetic-paraphrase', controlText('paraphrase', 'Instead')],
  ['imitation', 'llm-style-imitation-control', 'synthetic-imitation', controlText('future', 'However')],
  ['register', 'register-shifted-entrant-control', 'synthetic-register', controlText('register', 'Yo')],
  ['different', 'different-author-same-prompt-control', 'synthetic-different', controlText('different', 'Consequently')],
  ['prompt', 'prompt-only-synthetic-control', 'synthetic-prompt', Array.from({ length: 150 }, () => 'heliotrope').join(' ')],
  ['lane', 'lane-or-genre-shift-control', 'synthetic-lane', controlText('lane', 'Thus')]
].map(([candidate_id, control_class, provenance_class, text]) => ({ candidate_id, control_class, provenance_class, text }));

const restorativeTrajectories = [
  {
    feature_id: 'micro-rhythm',
    scale: 'micro',
    family: 'rhythm',
    perturbation_id: 'P1',
    perturbation_level: 1,
    baseline: 0.2,
    perturbed: 0.8,
    recoveries: [0.55, 0.35, 0.23]
  },
  {
    feature_id: 'meso-return',
    scale: 'meso',
    family: 'transition',
    perturbation_id: 'P2',
    perturbation_level: 2,
    baseline: 0.3,
    perturbed: 0.7,
    recoveries: [0.65, 0.6, 0.55]
  },
  {
    feature_id: 'macro-topology',
    scale: 'macro',
    family: 'topology',
    perturbation_id: 'P3',
    perturbation_level: 3,
    baseline: 0.4,
    perturbed: 0.9,
    recoveries: [0.88, 0.86, 0.84]
  }
];

function nullControl(label, shift) {
  return {
    control_class: label,
    provenance: `unmistakably-synthetic-${label}`,
    trajectories: restorativeTrajectories.map((record, index) => ({
      ...record,
      feature_id: `${label}-${index + 1}`,
      baseline: record.baseline + shift,
      perturbed: record.perturbed - shift,
      recoveries: record.recoveries.map((value) => value + shift)
    }))
  };
}

const model = {
  model_id: 'synthetic-model-a',
  model_digest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  preprocessing: 'observable-organization-only',
  normalization: 'unit-range',
  dimensionality: 3,
  distance_policy: 'normalized-l1'
};
const alternateModel = {
  model_id: 'synthetic-model-b',
  model_digest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  preprocessing: 'observable-organization-only',
  normalization: 'unit-range',
  dimensionality: 3,
  distance_policy: 'normalized-l1'
};

const trackInput = {
  blind_custody: {
    segments,
    candidates: blindCandidates
  },
  restorative_stylodynamics: {
    trajectories: restorativeTrajectories,
    latent_lane: {
      model,
      baseline_embedding: [0.1, 0.2, 0.3],
      perturbed_embedding: [0.8, 0.7, 0.6],
      recovery_embeddings: [[0.5, 0.4, 0.4], [0.2, 0.25, 0.32]]
    },
    null_controls: {
      prompt_only: nullControl('prompt-only', 0.01),
      topic_matched: nullControl('topic-matched', 0.02),
      semantic_paraphrase: nullControl('semantic-paraphrase', 0.03),
      same_author_static: nullControl('same-author-static', 0.04),
      different_author_same_prompt: nullControl('different-author-same-prompt', 0.05),
      lane_vocabulary_ablation: nullControl('lane-vocabulary-ablation', 0.06),
      feature_family_ablation: nullControl('feature-family-ablation', 0.07),
      embedding_model_substitution: {
        model: alternateModel,
        baseline_embedding: [0.1, 0.2, 0.3],
        perturbed_embedding: [0.75, 0.68, 0.58],
        recovery_embeddings: [[0.48, 0.39, 0.39], [0.19, 0.24, 0.31]]
      }
    },
    imitation: {
      provenance: 'unmistakably-synthetic-imitation',
      trajectories: restorativeTrajectories.map((record) => ({ ...record }))
    }
  }
};

const options = {
  researchMode: true,
  explicitConsent: true,
  calibrationTriadCount: 0,
  packetHash: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  selectionNonce: 'synthetic-track-r-nonce',
  createdAtUtc: '2026-07-22T22:00:00Z'
};

const resultA = await runResearchTrackR(trackInput, options);
const resultB = await runResearchTrackR({
  restorative_stylodynamics: trackInput.restorative_stylodynamics,
  blind_custody: trackInput.blind_custody
}, {
  createdAtUtc: options.createdAtUtc,
  selectionNonce: options.selectionNonce,
  packetHash: options.packetHash,
  calibrationTriadCount: 0,
  explicitConsent: true,
  researchMode: true
});

assert.equal(resultA.schema_version, 'td613.safe-harbor.research-track-r/v1');
assert.equal(resultA.policy_version, 'td613.safe-harbor.research-track-r-policy/v1');
assert.equal(resultA.research_track_digest, resultB.research_track_digest);
assert.match(resultA.research_track_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(resultA.protocol_state.code_complete, true);
assert.equal(resultA.protocol_state.research_mode, true);
assert.equal(resultA.protocol_state.explicit_consent_recorded, true);
assert.equal(resultA.protocol_state.baseline_intake_mandatory, false);
assert.equal(resultA.protocol_state.separately_invoked, true);
assert.equal(resultA.protocol_state.baseline_pipeline_integration, false);
assert.equal(resultA.protocol_state.feature_gate_required, true);
assert.equal(resultA.protocol_state.production_deployment_authorized, false);
assert.equal(resultA.protocol_state.promotion_pr_required, true);
assert.equal(resultA.protocol_state.serverless_functions_added, 0);
assert.equal(resultA.protocol_state.raw_text_exported, false);
assert.equal(resultA.protocol_state.keystroke_telemetry_collected, false);
assert.equal(resultA.protocol_state.pause_timing_collected, false);
assert.equal(resultA.protocol_state.covert_behavioral_biometrics_collected, false);
assert.equal(resultA.protocol_state.private_vulnerability_targeting, false);
assert.equal(resultA.protocol_state.adaptive_emotional_pressure, false);
assert.equal(resultA.protocol_state.external_identity_data_consumed, false);
assert.equal(resultA.blind_custody_challenge.schema_version, 'td613.safe-harbor.blind-custody-challenge/v1');
assert.equal(resultA.restorative_stylodynamics.schema_version, 'td613.safe-harbor.restorative-stylodynamics/v1');
assert.equal(resultA.adverse_result_registry.renderer_may_suppress_adverse_results, false);
assert.equal(resultA.adverse_result_registry.raw_text_included, false);
assert.equal(resultA.calibration_gate.state, 'CODE-COMPLETE-UNPROMOTED');
assert.equal(resultA.calibration_gate.observed_triads, 0);
assert.equal(resultA.calibration_gate.required_triads, 12);
assert.ok(resultA.calibration_gate.blockers.includes('calibration-triads-below-12'));
assert.equal(resultA.calibration_gate.promotion_decision, 'WITHHELD');
assert.equal(resultA.calibration_gate.production_deployment_authorized, false);
assert.equal(resultA.calibration_gate.baseline_intake_promotion_authorized, false);
assert.equal(resultA.calibration_gate.separate_promotion_pr_required, true);
assert.equal(resultA.raw_text_included, false);
assert.equal(researchTrackRContainsRawText(resultA), false);
assert.equal(JSON.stringify(resultA).includes(segments.future_self.slice(0, 80)), false);

const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  packet_hash_sha256: options.packetHash,
  authorship_evidence: {
    schema_version: 'td613.safe-harbor.authorship-evidence/v1',
    blind_custody_challenge: null,
    perturbation_invariance: null
  },
  bridge: {
    export_gate: { ready: true, state: 'harbor-eligible', blockers: [] }
  }
};
const attached = attachResearchTrackR(packet, resultA, {
  researchMode: true,
  explicitConsent: true
});
assert.equal(attached.authorship_evidence.blind_custody_challenge.result_digest, resultA.blind_custody_challenge.result_digest);
assert.equal(attached.authorship_evidence.perturbation_invariance.result_digest, resultA.restorative_stylodynamics.result_digest);
assert.equal(attached.authorship_evidence.research_track_r.research_track_digest, resultA.research_track_digest);
assert.equal(attached.authorship_evidence.research_track_r.raw_text_included, false);
assert.equal(packet.authorship_evidence.blind_custody_challenge, null, 'attachment must not mutate source packet');

const held = attachResearchTrackR(packet, resultA, {
  researchMode: false,
  explicitConsent: true
});
assert.equal(held.bridge.export_gate.ready, false);
assert.equal(held.bridge.export_gate.state, 'research-gate-held');
assert.ok(held.bridge.export_gate.blockers.includes('research-mode-and-explicit-consent-required'));
assert.equal(held.authorship_evidence.blind_custody_challenge, null);

const closedResult = await runResearchTrackR(trackInput, {
  ...options,
  explicitConsent: false
});
assert.equal(closedResult.protocol_state.explicit_consent_recorded, false);
assert.ok(closedResult.calibration_gate.blockers.includes('research-gate-closed'));
assert.equal(closedResult.calibration_gate.production_deployment_authorized, false);

const schemaFiles = [
  ['../app/safe-harbor/schemas/td613-safe-harbor.blind-custody-challenge.v1.schema.json', 'td613.safe-harbor.blind-custody-challenge/v1'],
  ['../app/safe-harbor/schemas/td613-safe-harbor.restorative-stylodynamics.v1.schema.json', 'td613.safe-harbor.restorative-stylodynamics/v1'],
  ['../app/safe-harbor/schemas/td613-safe-harbor.research-track-r.v1.schema.json', 'td613.safe-harbor.research-track-r/v1']
];
for (const [relative, expectedId] of schemaFiles) {
  const schema = JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.$id, expectedId);
  assert.equal(schema.additionalProperties, false);
}

const blindSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.blind-custody-challenge.v1.schema.json', import.meta.url), 'utf8'));
assert.equal(blindSchema.properties.source_window_policy.properties.required_window_count.const, 9);
assert.equal(blindSchema.properties.precommitment.properties.candidate_count.const, 8);
assert.deepEqual(blindSchema.properties.results.properties.all_outcomes_permitted.const, [
  'SUPPORTED',
  'INCONCLUSIVE',
  'FAILED',
  'CONTAMINATED',
  'PROMPT-DOMINATED',
  'IMITATION-COLLISION'
]);
assert.equal(blindSchema.properties.presentation_authority.properties.renderer_may_suppress_adverse_result.const, false);

const restorativeSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.restorative-stylodynamics.v1.schema.json', import.meta.url), 'utf8'));
assert.equal(restorativeSchema.properties.protocol.properties.private_vulnerability_targeting.const, false);
assert.equal(restorativeSchema.properties.protocol.properties.covert_behavioral_biometrics_collected.const, false);
assert.equal(restorativeSchema.properties.restoration_receipt.properties.identity_probability.type, 'null');
assert.equal(restorativeSchema.properties.promotion_gate.properties.calibration_triads_required.const, 12);
assert.equal(restorativeSchema.properties.promotion_gate.properties.production_deployment_authorized.const, false);

const trackSchema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.research-track-r.v1.schema.json', import.meta.url), 'utf8'));
assert.equal(trackSchema.properties.protocol_state.properties.baseline_pipeline_integration.const, false);
assert.equal(trackSchema.properties.protocol_state.properties.serverless_functions_added.const, 0);
assert.equal(trackSchema.properties.calibration_gate.properties.required_triads.const, 12);
assert.equal(trackSchema.properties.calibration_gate.properties.separate_promotion_pr_required.const, true);

console.log('safe-harbor-gen3-research-track-r: ok');
