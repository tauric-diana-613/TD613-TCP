import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  runHeterostratigraphicHolonomyTomographyBridge,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';
import {
  compileLoomHeterostratigraphicApparatusReceipt,
  compileAshReadOnlyTomographyProjection,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js';
import {
  HOLO_LOOM_RESEARCH_BENCH_SCHEMA,
  HOLO_LOOM_RESEARCH_BENCH_PARENT,
  compileHolonomyLoomHeterostratigraphicResearchBench,
  researchBenchStaticTruthParityCertificate,
  rejectResearchBenchAuthorityOrFlattening,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-research-bench.js';

const STRATA_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json',
  import.meta.url,
);
const BENCH_FIXTURE_PATH = new URL(
  './fixtures/pedagogue/holonomy-loom-heterostratigraphic-research-bench-v01.json',
  import.meta.url,
);

const strataFixture = JSON.parse(await readFile(STRATA_FIXTURE_PATH, 'utf8'));
const benchFixture = JSON.parse(await readFile(BENCH_FIXTURE_PATH, 'utf8'));
const bridge = runHeterostratigraphicHolonomyTomographyBridge(strataFixture);
const receipt = compileLoomHeterostratigraphicApparatusReceipt(bridge);
const projection = compileAshReadOnlyTomographyProjection(receipt);
const scene = compileHolonomyLoomHeterostratigraphicResearchBench(receipt, projection, benchFixture);

assert.equal(HOLO_LOOM_RESEARCH_BENCH_PARENT, 'c5c354413f721277760baefe946f602db8624b15');
assert.equal(scene.schema, HOLO_LOOM_RESEARCH_BENCH_SCHEMA);
assert.equal(scene.scene_id, 'holonomy-loom.strata-lantern-research-bench/scene-01');
assert.equal(scene.surface_owner, 'HOLONOMY_LOOM_RESEARCH');
assert.equal(scene.research_only, true);
assert.equal(scene.runtime_binding, false);
assert.equal(scene.source_parent_head, HOLO_LOOM_RESEARCH_BENCH_PARENT);

assert.deepEqual(
  scene.stratum_panes.map(pane => pane.stratum),
  ['ROUTE', 'TEMPORAL', 'FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY'],
);
assert.equal(scene.stratum_panes.length, 4);
assert.equal(scene.stratum_panes.every(pane => pane.technical_status === 'LOCAL_ASSAY_PASS'), true);
assert.equal(scene.stratum_panes.every(pane => typeof pane.observable_kind === 'string' && pane.observable_kind.length > 0), true);
assert.equal(scene.stratum_panes.every(pane => pane.posture === 'READ_ONLY_LOCAL_RESULT'), true);
assert.equal(scene.stratum_panes.every(pane => pane.runtime_action === false), true);
assert.equal(scene.stratum_panes.some(pane => pane.privileged === true), false);

assert.equal(scene.comparison_rail.length, 12);
assert.equal(scene.partial_bridge_rail.length, 2);
assert.equal(scene.hold_rail.length, 10);
assert.equal(scene.hold_rail.filter(item => item.status === 'ENCODER_REQUIRED').length, 8);
assert.equal(scene.hold_rail.filter(item => item.status === 'INCOMMENSURABLE').length, 2);
assert.equal(scene.comparison_rail.filter(item => item.kind === 'DEFINED_BRIDGE').length, 0);
assert.equal(scene.partial_bridge_rail.every(item => item.invertible === false), true);
assert.equal(scene.partial_bridge_rail.every(item => item.token === 'BRIDGE_WITH_LOSS'), true);
assert.equal(scene.hold_rail.filter(item => item.status === 'ENCODER_REQUIRED').every(item => item.token === 'HOLD_ENCODER_REQUIRED'), true);
assert.equal(scene.hold_rail.filter(item => item.status === 'INCOMMENSURABLE').every(item => item.token === 'HOLD_INCOMMENSURABLE'), true);
assert.equal(
  scene.hold_rail.filter(item => item.status === 'ENCODER_REQUIRED')
    .every(item => item.plain_language === 'These two views do not have a declared translator yet.'),
  true,
);
assert.equal(
  scene.hold_rail.filter(item => item.status === 'INCOMMENSURABLE')
    .every(item => item.plain_language === 'These two views answer different questions and are not being forced into one scale.'),
  true,
);

assert.deepEqual(
  scene.controls.map(item => item.action),
  ['INSPECT_LOCAL_RESULT', 'INSPECT_COMPARISON_HOLD', 'REST', 'RETURN'],
);
assert.equal(scene.controls.every(item => item.enabled === true && item.consequential === false), true);
assert.equal(Object.values(scene.authority).every(value => value === false), true);
assert.equal(scene.rest_state.status, 'REST');
assert.equal(scene.rest_state.preserve_scene, true);
assert.equal(scene.rest_state.preserve_receipt, true);
assert.equal(scene.rest_state.mutate_custody, false);
assert.equal(scene.rest_state.write_route_memory, false);
assert.equal(scene.rest_state.promote_claim, false);
assert.equal(scene.rest_state.scar, 'REST != DISCARD');
assert.equal(scene.return_state.status, 'RETURN');
assert.equal(scene.return_state.exit_scene, true);
assert.equal(scene.return_state.authorize_release, false);
assert.equal(scene.return_state.transmit_source_content, false);
assert.equal(scene.return_state.mutate_custody, false);
assert.equal(scene.return_state.write_route_memory, false);
assert.equal(scene.return_state.scar, 'RETURN != RELEASE');

assert.equal(scene.source_certificates.monotonicity.passed, true);
assert.equal(scene.source_certificates.widening.accepted, true);
assert.equal(scene.claim_ceiling.concrete_serializable_research_bench_scene, true);
assert.equal(scene.claim_ceiling.browser_execution_witness, false);
assert.equal(scene.claim_ceiling.human_usability_validation, false);
assert.equal(scene.claim_ceiling.scientific_bridge_promoted, false);
assert.equal(scene.claim_ceiling.live_holonomy_loom_runtime, false);
assert.equal(scene.claim_ceiling.live_ash_tomography, false);
assert.equal(scene.claim_ceiling.proto_loom, false);
assert.equal(scene.claim_ceiling.production_authority, false);
assert.equal(scene.claim_ceiling.physical_holonomy, false);
assert.equal(scene.claim_ceiling.continuum_tomography, false);
assert.equal(scene.claim_ceiling.vercel_authority, false);

const parity = researchBenchStaticTruthParityCertificate(scene);
assert.equal(parity.passed, true);
assert.equal(parity.pane_parity, true);
assert.equal(parity.comparison_parity, true);
assert.equal(parity.authority_parity, true);
assert.equal(parity.static_truth_carries_all_scene_information, true);
assert.equal(scene.static_truth.pane_count, 4);
assert.equal(scene.static_truth.comparison_edge_count, 12);
assert.equal(scene.static_truth.partial_bridge_count, 2);
assert.equal(scene.static_truth.hold_count, 10);
assert.equal(scene.static_truth.defined_bridge_count, 0);
assert.equal(scene.static_truth.panes.every(pane => typeof pane.observable_kind === 'string'), true);
assert.match(scene.accessible_summary, /Four read-only strata/);
assert.match(scene.accessible_summary, /2 partial noninvertible comparisons/);
assert.match(scene.accessible_summary, /10 held comparisons/);
assert.match(scene.accessible_summary, /No global truth/);

const clean = rejectResearchBenchAuthorityOrFlattening(scene);
assert.equal(clean.accepted, true);
assert.deepEqual(clean.forbidden_actions, []);
assert.deepEqual(clean.widened_authority_coordinates, []);
assert.deepEqual(clean.forbidden_global_fields, []);
assert.equal(clean.privileged_stratum_attempted, false);
assert.equal(clean.live_runtime_binding_attempted, false);

const withInverse = JSON.parse(JSON.stringify(scene));
withInverse.controls.push({ action: 'RUN_TOMOGRAPHY_INVERSE', enabled: true, consequential: true });
assert.equal(rejectResearchBenchAuthorityOrFlattening(withInverse).accepted, false);
assert.deepEqual(rejectResearchBenchAuthorityOrFlattening(withInverse).forbidden_actions, ['RUN_TOMOGRAPHY_INVERSE']);

const withEncoder = JSON.parse(JSON.stringify(scene));
withEncoder.controls.push({ action: 'CREATE_CROSS_STRATUM_ENCODER', enabled: true, consequential: true });
assert.equal(rejectResearchBenchAuthorityOrFlattening(withEncoder).accepted, false);

const withAuthority = JSON.parse(JSON.stringify(scene));
withAuthority.authority.inverse = true;
assert.equal(rejectResearchBenchAuthorityOrFlattening(withAuthority).accepted, false);
assert.deepEqual(rejectResearchBenchAuthorityOrFlattening(withAuthority).widened_authority_coordinates, ['inverse']);

const withGlobalTruth = JSON.parse(JSON.stringify(scene));
withGlobalTruth.global_truth = 0.99;
assert.equal(rejectResearchBenchAuthorityOrFlattening(withGlobalTruth).accepted, false);
assert.deepEqual(rejectResearchBenchAuthorityOrFlattening(withGlobalTruth).forbidden_global_fields, ['global_truth']);

const withPrivilegedStratum = JSON.parse(JSON.stringify(scene));
withPrivilegedStratum.stratum_panes[0].privileged = true;
assert.equal(rejectResearchBenchAuthorityOrFlattening(withPrivilegedStratum).accepted, false);
assert.equal(rejectResearchBenchAuthorityOrFlattening(withPrivilegedStratum).privileged_stratum_attempted, true);

const withLiveBinding = JSON.parse(JSON.stringify(scene));
withLiveBinding.runtime_binding = true;
assert.equal(rejectResearchBenchAuthorityOrFlattening(withLiveBinding).accepted, false);
assert.equal(rejectResearchBenchAuthorityOrFlattening(withLiveBinding).live_runtime_binding_attempted, true);

const badPanelOrder = JSON.parse(JSON.stringify(benchFixture));
[badPanelOrder.panel_order[0], badPanelOrder.panel_order[1]] = [badPanelOrder.panel_order[1], badPanelOrder.panel_order[0]];
assert.throws(
  () => compileHolonomyLoomHeterostratigraphicResearchBench(receipt, projection, badPanelOrder),
  /panel order drifted/,
);

const badFixtureControl = JSON.parse(JSON.stringify(benchFixture));
badFixtureControl.allowed_controls.push('RUN_TOMOGRAPHY_INVERSE');
assert.throws(
  () => compileHolonomyLoomHeterostratigraphicResearchBench(receipt, projection, badFixtureControl),
  /forbidden action/,
);

const missingProjectionCard = JSON.parse(JSON.stringify(projection));
missingProjectionCard.cards.pop();
assert.throws(
  () => compileHolonomyLoomHeterostratigraphicResearchBench(receipt, missingProjectionCard, benchFixture),
  /all four Ash cards/,
);

const missingTechnicalPanel = JSON.parse(JSON.stringify(receipt));
missingTechnicalPanel.stratum_panels.pop();
assert.throws(
  () => compileHolonomyLoomHeterostratigraphicResearchBench(missingTechnicalPanel, projection, benchFixture),
  /all four Loom technical panels/,
);

const missingComparison = JSON.parse(JSON.stringify(receipt));
missingComparison.static_truth.comparisons.pop();
assert.throws(
  () => compileHolonomyLoomHeterostratigraphicResearchBench(missingComparison, projection, benchFixture),
  /comparison custody incomplete/,
);

console.log('Holonomy Loom heterostratigraphic research bench tests passed.');
