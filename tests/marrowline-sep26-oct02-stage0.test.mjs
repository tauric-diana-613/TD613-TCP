import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildConstructedCounterfactual,
  generateEffectiveRequestMatrix,
  PINNED_COMMITS,
  PINNED_MODEL
} from '../research/marrowline-sep26-oct02-reconstruction-20261121/build-sep26-oct02-effective-request-matrix.mjs';
import {
  buildSlotRequest,
  EXPECTED_GENERATION_CONFIG_SHA256,
  Q1_SCHEDULE
} from '../research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs';
import { serializeGeminiRequest } from '../server/khonapolit-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const MATRIX_PATH = path.join(
  REPO_ROOT,
  'research/marrowline-sep26-oct02-reconstruction-20261121/MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json'
);

let cachedMatrix = null;
async function getMatrix() {
  if (!cachedMatrix) cachedMatrix = await generateEffectiveRequestMatrix({ writeOutput: false });
  return cachedMatrix;
}

test('Stage 0 zero-network lock: globalThis.fetch throws immediately and zero paid calls occur', async () => {
  await assert.rejects(
    () => globalThis.fetch('https://generativelanguage.googleapis.com/v1beta/models'),
    /ZERO_NETWORK_VIOLATION_IN_STAGE0_BUILDER/
  );
  const m = await getMatrix();
  assert.equal(m.new_paid_provider_calls_executed, 0);
  assert.equal(m.live_execution_authorized, false);
  assert.equal(m.q1_operator_artistic_verdict, 'ALL_SIX_COMPLETED_RETURNS_REJECTED_BEFORE_UNBLINDING');
  assert.equal(m.q1_unblinding_key_opened_here, false);
});

test('Stage 0 Oct 2 <-> Oct 4 exact blob equality (4 core + 6 extended) and identical wire request SHA-256', async () => {
  const m = await getMatrix();
  assert.equal(m.oct02_oct04_equality_verification.all_four_files_equal, true);
  assert.equal(m.oct02_oct04_equality_verification.all_six_files_equal, true);
  assert.equal(m.oct02_oct04_equality_verification.t1_body_sha256_equal, true);
  assert.equal(m.oct02_oct04_equality_verification.t2_body_sha256_equal, true);
});

test('Stage 0 mission source-code vs runtime-wire length accounting is exact and disclaims tokenizer equivalence', async () => {
  const m = await getMatrix();
  const byCommit = m.mission_source_vs_wire_accounting.by_commit;
  assert.match(m.mission_source_vs_wire_accounting.terminology_guard, /NEITHER value is a Gemini tokenizer count/);

  assert.equal(byCommit.PRE_MISSION.declaration_found, false);
  assert.equal(byCommit.PRE_MISSION.source_declaration_js_utf16_units, 0);
  assert.equal(byCommit.PRE_MISSION.per_turn_mission_cue_bullet_count, 0);

  assert.equal(byCommit.MISSION_V1.mission_version, 'td613.marrowline.red-deer-mission/v1');
  assert.equal(byCommit.MISSION_V1.source_declaration_line_count, 13);
  assert.equal(byCommit.MISSION_V1.rendered_element_count, 11);
  assert.equal(byCommit.MISSION_V1.source_declaration_js_utf16_units, 4570);
  assert.equal(byCommit.MISSION_V1.rendered_utf8_bytes, 4484);
  assert.equal(byCommit.MISSION_V1.per_turn_mission_cue_bullet_count, 0);
  assert.ok(byCommit.MISSION_V1.source_declaration_js_utf16_units > byCommit.MISSION_V1.rendered_utf16_chars);

  assert.equal(byCommit.MISSION_V3.mission_version, 'td613.marrowline.red-deer-mission/v3-antlered-ache');
  assert.equal(byCommit.MISSION_V3.source_declaration_line_count, 19);
  assert.equal(byCommit.MISSION_V3.rendered_element_count, 17);
  assert.equal(byCommit.MISSION_V3.source_declaration_js_utf16_units, 8527);
  assert.equal(byCommit.MISSION_V3.rendered_utf8_bytes, 8427);
  assert.equal(byCommit.MISSION_V3.per_turn_mission_cue_bullet_count, 2);
  assert.equal(byCommit.MISSION_V3.per_turn_mission_cue_utf8_bytes, 961);
  assert.equal(byCommit.MISSION_V3.rendered_sha256, byCommit.OCT02_LITERAL.rendered_sha256);
  assert.equal(byCommit.OCT02_LITERAL.rendered_sha256, byCommit.OCT04_CONTROL.rendered_sha256);
  assert.equal(byCommit.Q1_AUTHORIZED.source_declaration_js_utf16_units, 8567);
  assert.equal(byCommit.Q1_AUTHORIZED.rendered_utf8_bytes, 8467);
  assert.notEqual(byCommit.OCT02_LITERAL.rendered_sha256, byCommit.Q1_AUTHORIZED.rendered_sha256);
});

test('Stage 0 M0 / M1 / M3 constructed counterfactuals isolate mission anchor + per-turn cue without leaking v3 cues or altering task/config', async () => {
  const m = await getMatrix();
  assert.equal(m.total_matrix_rows, 22);

  for (const taskKey of ['T1_BLUE_ORANGE_WEATHER', 'T2_FORENSIC']) {
    const byId = Object.fromEntries(
      m.entries.filter((e) => e.task_key === taskKey).map((e) => [e.arm_id, e])
    );

    // Every single arm on the same task shares identical raw task prompt SHA-256
    const promptShas = new Set(Object.values(byId).map((e) => e.task_prompt_sha256));
    assert.equal(promptShas.size, 1, `${taskKey}: task prompt SHA-256 must be identical across all 11 arms`);

    // Constructed counterfactuals M0, M1, M3, and Q1 Arm A share exact contents, generationConfig, model, and Aperture route
    for (const id of ['CF_MODERN_M0_PRE1347', 'CF_MODERN_M1_PR1347_V1', 'CF_MODERN_M3_PR1348_V3', 'Q1_MEASURED_ARM_A']) {
      assert.equal(byId[id].model_target, PINNED_MODEL);
      assert.equal(byId[id].digests.generationConfigSha256, EXPECTED_GENERATION_CONFIG_SHA256);
      assert.equal(byId[id].digests.contentsSha256, byId.Q1_MEASURED_ARM_A.digests.contentsSha256);
      assert.equal(byId[id].aperture.primaryRoute, byId.Q1_MEASURED_ARM_A.aperture.primaryRoute);
      assert.equal(byId[id].aperture.discourseMode, byId.Q1_MEASURED_ARM_A.aperture.discourseMode);
      assert.equal(byId[id].multi_seat_morphology_selector_active, false);
    }

    // M0: zero persistent mission anchor AND zero per-turn mission/hornani cues
    assert.equal(byId.CF_MODERN_M0_PRE1347.realization_class, 'constructed_source_counterfactual');
    assert.equal(byId.CF_MODERN_M0_PRE1347.features.persistent_mission_anchor_present, false);
    assert.equal(byId.CF_MODERN_M0_PRE1347.features.per_turn_mission_cue_present, false);
    assert.equal(byId.CF_MODERN_M0_PRE1347.features.per_turn_hornani_cue_present, false);
    assert.equal(byId.CF_MODERN_M0_PRE1347.features.v3_every_turn_duty_present, false);

    // M1: exact #1347 v1 persistent anchor AND zero #1348 v3-only per-turn cues
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.realization_class, 'constructed_source_counterfactual');
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.mission_version, 'td613.marrowline.red-deer-mission/v1');
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.features.persistent_mission_anchor_present, true);
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.features.per_turn_mission_cue_present, false);
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.features.per_turn_hornani_cue_present, false);
    assert.equal(byId.CF_MODERN_M1_PR1347_V1.features.v3_every_turn_duty_present, false);

    // M3: exact #1348 v3 persistent anchor AND both #1348 v3 per-turn cues
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.realization_class, 'constructed_source_counterfactual');
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.mission_version, 'td613.marrowline.red-deer-mission/v3-antlered-ache');
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.features.persistent_mission_anchor_present, true);
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.features.per_turn_mission_cue_present, true);
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.features.per_turn_hornani_cue_present, true);
    assert.equal(byId.CF_MODERN_M3_PR1348_V3.features.v3_every_turn_duty_present, true);

    // H2 constructed counterfactual carries exact literal Oct 2 systemInstructionSha256 + modern generationConfigSha256
    assert.equal(byId.CF_MODERN_H2_OCT02_LITERAL_ENVELOPE.realization_class, 'constructed_source_counterfactual');
    assert.equal(
      byId.CF_MODERN_H2_OCT02_LITERAL_ENVELOPE.digests.systemInstructionSha256,
      byId.HIST_OCT02_LITERAL.digests.systemInstructionSha256
    );
    assert.equal(
      byId.CF_MODERN_H2_OCT02_LITERAL_ENVELOPE.digests.generationConfigSha256,
      EXPECTED_GENERATION_CONFIG_SHA256
    );

    // All 5 historical source-era assemblies carry honest realization labels, historical multi-seat
    // provenance, AND authentic api/khonapolit.js interactive generationConfig (thinkingLevel: medium)
    for (const hId of ['HIST_PRE_MISSION', 'HIST_MISSION_V1', 'HIST_MISSION_V3', 'HIST_OCT02_LITERAL', 'HIST_OCT04_EQUALITY_CONTROL']) {
      assert.equal(byId[hId].realization_class, 'historically_realized_source_era_assembly');
      assert.equal(byId[hId].original_hosted_model_equivalence, 'UNRECOVERABLE_FROM_SOURCE_ALONE');
      assert.equal(byId[hId].multi_seat_morphology_selector_active, true);
      assert.equal(byId[hId].approved_seat_order[0], 'gemini-3.8-flash');
      assert.equal(byId[hId].approved_seat_order[1], 'gemini-3.7-flash');
      assert.equal(byId[hId].generation_config.thinkingConfig.thinkingLevel, 'medium');
      assert.equal(byId[hId].digests.generationConfigSha256, EXPECTED_GENERATION_CONFIG_SHA256);
      assert.equal(byId[hId].bare_constructor_thinking_level_outside_api_route, 'high');
    }

    // Because Oct 2 api/khonapolit.js already ran thinkingLevel: medium, H2 counterfactual matches
    // literal Oct 2 wire body digest-for-digest while explicitly noting modern hosted-model non-equivalence.
    assert.equal(
      byId.CF_MODERN_H2_OCT02_LITERAL_ENVELOPE.digests.bodySha256,
      byId.HIST_OCT02_LITERAL.digests.bodySha256
    );
    // And CF_MODERN_M3_PR1348_V3 matches Q1 Arm A (historicalProsodyFreedom: true) digest-for-digest.
    assert.equal(
      byId.CF_MODERN_M3_PR1348_V3.digests.bodySha256,
      byId.Q1_MEASURED_ARM_A.digests.bodySha256
    );
  }
});

test('Negative controls: silent mutation of contents, generationConfig, or missing mission cue fails closed', () => {
  const base = buildSlotRequest(Q1_SCHEDULE[0]);
  const mutatedContentsReq = {
    ...base.request,
    contents: [{ role: 'user', parts: [{ text: 'SILENTLY_MUTATED_USER_TASK' }] }]
  };
  const baseWire = serializeGeminiRequest(base.request, PINNED_MODEL);
  const mutatedContentsWire = serializeGeminiRequest(mutatedContentsReq, PINNED_MODEL);
  assert.notEqual(baseWire.observation.contentsSha256, mutatedContentsWire.observation.contentsSha256);

  const mutatedConfigReq = {
    ...base.request,
    generationConfig: { ...base.request.generationConfig, maxOutputTokens: 32768 }
  };
  const mutatedConfigWire = serializeGeminiRequest(mutatedConfigReq, PINNED_MODEL);
  assert.notEqual(baseWire.observation.generationConfigSha256, mutatedConfigWire.observation.generationConfigSha256);

  // Attempting M0 strip on a prompt lacking mission span or missing expected per-turn bullet must throw fail-closed
  assert.throws(() => buildConstructedCounterfactual({
    modernBaseRequest: { ...base.request, systemInstruction: { parts: [{ text: 'NO_MISSION_HERE' }] } },
    modernBaseAperture: base.aperture,
    modernMissionAnchorText: '',
    modernPerTurnMissionBullets: ['MISSING_BULLET'],
    targetVariant: 'CF_MODERN_M0_PRE1347',
    v1AnchorText: '',
    v3AnchorText: '',
    oct02LiteralRequest: base.request,
    serializeFn: serializeGeminiRequest
  }), /RUNTIME_MISSION_SPAN_NOT_FOUND/);

  assert.throws(() => buildConstructedCounterfactual({
    modernBaseRequest: base.request,
    modernBaseAperture: base.aperture,
    modernMissionAnchorText: '',
    modernPerTurnMissionBullets: ['NONEXISTENT_PER_TURN_BULLET'],
    targetVariant: 'CF_MODERN_M1_PR1347_V1',
    v1AnchorText: 'v1',
    v3AnchorText: 'v3',
    oct02LiteralRequest: base.request,
    serializeFn: serializeGeminiRequest
  }), /EXPECTED_PER_TURN_MISSION_BULLET_NOT_FOUND/);
});

test('Committed MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json matches live deterministic regeneration digest-for-digest', async () => {
  assert.ok(fs.existsSync(MATRIX_PATH), 'MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json must be committed');
  const committed = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
  const live = await getMatrix();

  assert.equal(committed.total_matrix_rows, live.total_matrix_rows);
  assert.deepEqual(committed.pinned_commits, PINNED_COMMITS);
  assert.deepEqual(committed.frozen_tasks, live.frozen_tasks);
  assert.deepEqual(committed.oct02_oct04_equality_verification, live.oct02_oct04_equality_verification);

  for (let i = 0; i < live.entries.length; i++) {
    assert.equal(committed.entries[i].arm_id, live.entries[i].arm_id);
    assert.equal(committed.entries[i].task_key, live.entries[i].task_key);
    assert.deepEqual(committed.entries[i].digests, live.entries[i].digests);
    assert.deepEqual(committed.entries[i].features, live.entries[i].features);
  }
});
