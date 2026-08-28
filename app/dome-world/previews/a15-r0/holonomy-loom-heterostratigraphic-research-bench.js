import {
  HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA,
  ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA,
  apparatusAuthorityMonotonicityCertificate,
  rejectAshAuthorityWidening,
} from './holonomy-loom-heterostratigraphic-apparatus-adapter.js';

export const HOLO_LOOM_RESEARCH_BENCH_SCHEMA =
  'td613.loom.heterostratigraphic-research-bench-scene/v0.1';
export const HOLO_LOOM_RESEARCH_BENCH_PARENT =
  'c5c354413f721277760baefe946f602db8624b15';

const CANONICAL_STRATA = Object.freeze([
  'ROUTE',
  'TEMPORAL',
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
]);

const FORBIDDEN_GLOBAL_FIELDS = Object.freeze([
  'truth',
  'global_truth',
  'global_holonomy',
  'global_route',
  'global_confidence',
  'privileged_stratum',
]);

const FORBIDDEN_ACTIONS = Object.freeze([
  'RUN_TOMOGRAPHY_INVERSE',
  'CREATE_CROSS_STRATUM_ENCODER',
  'PROMOTE_CLAIM',
  'MUTATE_CASE_CUSTODY',
  'WRITE_ROUTE_MEMORY',
  'AUTHORIZE_RELEASE',
  'TRANSMIT_SOURCE_CONTENT',
  'DEPLOY',
  'PUBLISH',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameSet(left, right) {
  const a = [...left].sort();
  const b = [...right].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function assertBenchFixture(fixture) {
  if (!fixture || fixture.schema !== 'td613.loom.heterostratigraphic-research-bench-fixture/v0.1') {
    throw new Error('Research bench requires the canonical bench fixture schema.');
  }
  if (fixture.fixture_id !== 'holonomy-loom.strata-lantern-research-bench/v0.1') {
    throw new Error('Research bench requires the canonical fixture id.');
  }
  if (fixture.manifestly_fictional !== true || fixture.research_only !== true || fixture.runtime_binding !== false) {
    throw new Error('Research bench fixture must remain fictional, research-only, and non-runtime.');
  }
  if (!same(fixture.panel_order, CANONICAL_STRATA)) {
    throw new Error('Research bench panel order drifted.');
  }
  if ((fixture.allowed_controls ?? []).some(action => FORBIDDEN_ACTIONS.includes(action))) {
    throw new Error('Research bench fixture exposes a forbidden action.');
  }
  if (!FORBIDDEN_ACTIONS.every(action => fixture.forbidden_controls?.includes(action))) {
    throw new Error('Research bench fixture lost a forbidden-action guard.');
  }
  if (Object.values(fixture.authority ?? {}).some(Boolean)) {
    throw new Error('Research bench fixture widened authority.');
  }
  return true;
}

function assertSources(receipt, projection) {
  if (!receipt || receipt.schema !== HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA) {
    throw new Error('Research bench requires a Holonomy Loom apparatus receipt.');
  }
  if (!projection || projection.schema !== ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA) {
    throw new Error('Research bench requires the Ash read-only projection.');
  }
  if (receipt.runtime_binding !== false || projection.runtime_binding !== false) {
    throw new Error('Research bench cannot consume runtime-bound inputs.');
  }
  if (projection.source_receipt_schema !== receipt.schema) {
    throw new Error('Research bench source receipt/projection lineage mismatch.');
  }
  const monotonicity = apparatusAuthorityMonotonicityCertificate(receipt, projection);
  if (!monotonicity.passed) throw new Error('Research bench requires authority-monotone adapter inputs.');
  const widening = rejectAshAuthorityWidening(projection);
  if (!widening.accepted) throw new Error('Research bench rejects widened Ash authority.');
  return freeze({ monotonicity, widening });
}

function paneFromCard(card, sourcePanel, fixture) {
  if (!sourcePanel || sourcePanel.id !== card.stratum) {
    throw new Error(`Research bench missing Loom technical panel for ${card.stratum}.`);
  }
  return freeze({
    stratum: card.stratum,
    label: card.title,
    technical_status: card.status,
    observable_kind: sourcePanel.observable_kind,
    what_changed: card.what_changed,
    what_remains_uncertain: card.what_remains_uncertain,
    claim_ceiling: card.claim_ceiling,
    posture: 'READ_ONLY_LOCAL_RESULT',
    control: 'INSPECT_LOCAL_RESULT',
    runtime_action: false,
    authority: fixture.authority,
  });
}

function comparisonSurface(item, fixture) {
  const status = item.status;
  const token = fixture.status_tokens?.[status] ?? 'HOLD_UNCLASSIFIED';
  const plain = fixture.hold_language?.[status]
    ?? item.reason
    ?? 'This comparison remains held under the declared research fixture.';
  return freeze({
    from: item.from,
    to: item.to,
    status,
    token,
    plain_language: plain,
    kind: item.kind,
    invertible: item.kind === 'PARTIAL_BRIDGE' ? false : null,
    prohibited_inference: item.prohibited_inference ?? null,
    control: item.kind === 'HOLD' ? 'INSPECT_COMPARISON_HOLD' : 'INSPECT_LOCAL_RESULT',
    authority_widening: false,
  });
}

function staticTruth(sceneCore, receipt, fixture) {
  return freeze({
    pane_count: sceneCore.stratum_panes.length,
    pane_order: freeze(sceneCore.stratum_panes.map(pane => pane.stratum)),
    panes: freeze(sceneCore.stratum_panes.map(pane => ({
      stratum: pane.stratum,
      technical_status: pane.technical_status,
      observable_kind: pane.observable_kind,
      consequence: pane.label,
      uncertainty: pane.what_remains_uncertain,
      claim_ceiling: pane.claim_ceiling,
    }))),
    comparison_edge_count: sceneCore.comparison_rail.length,
    comparisons: freeze(sceneCore.comparison_rail.map(edge => ({
      from: edge.from,
      to: edge.to,
      status: edge.status,
      token: edge.token,
      plain_language: edge.plain_language,
      prohibited_inference: edge.prohibited_inference,
    }))),
    partial_bridge_count: sceneCore.partial_bridge_rail.length,
    hold_count: sceneCore.hold_rail.length,
    defined_bridge_count: receipt.defined_bridges.length,
    allowed_controls: freeze([...fixture.allowed_controls]),
    forbidden_controls: freeze([...fixture.forbidden_controls]),
    rest_contract: freeze({ ...fixture.rest_contract }),
    return_contract: freeze({ ...fixture.return_contract }),
    authority: fixture.authority,
    runtime_binding: false,
    global_synthesis_authority: false,
  });
}

function accessibleSummary(panes, partials, holds) {
  const paneText = panes.map(pane => `${pane.stratum}: ${pane.label}`).join(' ');
  return `Holonomy Loom research bench. Four read-only strata. ${paneText} `
    + `${partials.length} partial noninvertible comparisons and ${holds.length} held comparisons are preserved. `
    + 'No global truth, tomography inverse, cross-stratum encoder, custody mutation, release, production, physical, or continuum authority is available.';
}

export function compileHolonomyLoomHeterostratigraphicResearchBench(receipt, projection, fixture) {
  assertBenchFixture(fixture);
  const sourceCertificates = assertSources(receipt, projection);

  if (!same(projection.cards.map(card => card.stratum), CANONICAL_STRATA)) {
    throw new Error('Research bench requires all four Ash cards in canonical order.');
  }
  if (!same(receipt.stratum_panels.map(panel => panel.id), CANONICAL_STRATA)) {
    throw new Error('Research bench requires all four Loom technical panels in canonical order.');
  }
  if (receipt.static_truth?.comparisons?.length !== fixture.comparison_expectations.edge_count) {
    throw new Error('Research bench comparison custody incomplete.');
  }

  const stratumPanes = projection.cards.map(card => (
    paneFromCard(card, receipt.stratum_panels.find(panel => panel.id === card.stratum), fixture)
  ));
  const comparisonRail = [
    ...receipt.partial_bridges.map(item => comparisonSurface(item, fixture)),
    ...receipt.comparison_holds.map(item => comparisonSurface(item, fixture)),
    ...receipt.defined_bridges.map(item => comparisonSurface(item, fixture)),
  ];
  const partialBridgeRail = comparisonRail.filter(item => item.kind === 'PARTIAL_BRIDGE');
  const holdRail = comparisonRail.filter(item => item.kind === 'HOLD');
  const definedRail = comparisonRail.filter(item => item.kind === 'DEFINED_BRIDGE');

  const expectations = fixture.comparison_expectations;
  if (
    comparisonRail.length !== expectations.edge_count
    || partialBridgeRail.length !== expectations.partial_bridge_count
    || holdRail.length !== expectations.hold_count
    || definedRail.length !== expectations.defined_bridge_count
    || holdRail.filter(item => item.status === 'ENCODER_REQUIRED').length !== expectations.encoder_required_count
    || holdRail.filter(item => item.status === 'INCOMMENSURABLE').length !== expectations.incommensurable_count
  ) {
    throw new Error('Research bench comparison counts drifted from preregistered fixture.');
  }

  const exposedControls = [...fixture.allowed_controls];
  if (!sameSet(exposedControls, projection.available_actions)) {
    throw new Error('Research bench control inventory must match the read-only Ash projection.');
  }
  if (exposedControls.some(action => FORBIDDEN_ACTIONS.includes(action))) {
    throw new Error('Research bench exposed a forbidden action.');
  }

  const sceneCore = {
    stratum_panes: freeze(stratumPanes),
    comparison_rail: freeze(comparisonRail),
    partial_bridge_rail: freeze(partialBridgeRail),
    hold_rail: freeze(holdRail),
  };
  const staticSceneTruth = staticTruth(sceneCore, receipt, fixture);

  const scene = {
    schema: HOLO_LOOM_RESEARCH_BENCH_SCHEMA,
    scene_id: 'holonomy-loom.strata-lantern-research-bench/scene-01',
    surface_owner: 'HOLONOMY_LOOM_RESEARCH',
    fixture_id: fixture.fixture_id,
    source_receipt_schema: receipt.schema,
    source_projection_schema: projection.schema,
    source_parent_head: HOLO_LOOM_RESEARCH_BENCH_PARENT,
    research_only: true,
    runtime_binding: false,
    header: freeze({
      title: fixture.operator_label,
      subtitle: 'Four local views. Declared bridges stay partial; missing translators stay missing.',
      claim_ceiling: 'BOUNDED_SYNTHETIC_RESEARCH_APPARATUS_ONLY',
    }),
    ...sceneCore,
    controls: freeze(exposedControls.map(action => ({ action, enabled: true, consequential: false }))),
    static_truth: staticSceneTruth,
    accessible_summary: accessibleSummary(stratumPanes, partialBridgeRail, holdRail),
    rest_state: freeze({
      status: 'REST',
      preserve_scene: fixture.rest_contract.preserve_scene,
      preserve_receipt: fixture.rest_contract.preserve_receipt,
      mutate_custody: fixture.rest_contract.mutate_custody,
      write_route_memory: fixture.rest_contract.write_route_memory,
      promote_claim: fixture.rest_contract.promote_claim,
      scar: 'REST != DISCARD',
    }),
    return_state: freeze({
      status: 'RETURN',
      exit_scene: fixture.return_contract.exit_scene,
      authorize_release: fixture.return_contract.authorize_release,
      transmit_source_content: fixture.return_contract.transmit_source_content,
      mutate_custody: fixture.return_contract.mutate_custody,
      write_route_memory: fixture.return_contract.write_route_memory,
      scar: 'RETURN != RELEASE',
    }),
    authority: fixture.authority,
    source_certificates: sourceCertificates,
    claim_ceiling: freeze({
      concrete_serializable_research_bench_scene: true,
      browser_execution_witness: false,
      human_usability_validation: false,
      scientific_bridge_promoted: false,
      live_holonomy_loom_runtime: false,
      live_ash_tomography: false,
      proto_loom: false,
      production_authority: false,
      physical_holonomy: false,
      continuum_tomography: false,
      vercel_authority: false,
    }),
    human_closure_required: true,
  };

  const forbiddenFields = FORBIDDEN_GLOBAL_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(scene, field));
  if (forbiddenFields.length) {
    throw new Error(`Research bench introduced forbidden global fields: ${forbiddenFields.join(', ')}`);
  }
  if (Object.values(scene.authority).some(Boolean)) {
    throw new Error('Research bench scene widened authority.');
  }

  return freeze(scene);
}

export function researchBenchStaticTruthParityCertificate(scene) {
  const paneParity =
    scene.stratum_panes.length === scene.static_truth.pane_count
    && same(scene.stratum_panes.map(item => item.stratum), scene.static_truth.pane_order)
    && scene.stratum_panes.every(pane => scene.static_truth.panes.some(item => (
      item.stratum === pane.stratum
      && item.technical_status === pane.technical_status
      && item.observable_kind === pane.observable_kind
      && item.consequence === pane.label
      && item.uncertainty === pane.what_remains_uncertain
      && item.claim_ceiling === pane.claim_ceiling
    )));

  const comparisonParity =
    scene.comparison_rail.length === scene.static_truth.comparison_edge_count
    && scene.comparison_rail.every(edge => scene.static_truth.comparisons.some(item => (
      item.from === edge.from
      && item.to === edge.to
      && item.status === edge.status
      && item.token === edge.token
      && item.plain_language === edge.plain_language
    )));

  const controlParity = same(
    scene.controls.map(item => item.action),
    scene.static_truth.allowed_controls,
  );

  const restReturnParity =
    scene.rest_state.preserve_scene === scene.static_truth.rest_contract.preserve_scene
    && scene.rest_state.preserve_receipt === scene.static_truth.rest_contract.preserve_receipt
    && scene.rest_state.mutate_custody === scene.static_truth.rest_contract.mutate_custody
    && scene.rest_state.write_route_memory === scene.static_truth.rest_contract.write_route_memory
    && scene.rest_state.promote_claim === scene.static_truth.rest_contract.promote_claim
    && scene.return_state.exit_scene === scene.static_truth.return_contract.exit_scene
    && scene.return_state.authorize_release === scene.static_truth.return_contract.authorize_release
    && scene.return_state.transmit_source_content === scene.static_truth.return_contract.transmit_source_content
    && scene.return_state.mutate_custody === scene.static_truth.return_contract.mutate_custody
    && scene.return_state.write_route_memory === scene.static_truth.return_contract.write_route_memory;

  const authorityParity = same(scene.authority, scene.static_truth.authority)
    && Object.values(scene.authority).every(value => value === false);

  const passed = paneParity && comparisonParity && controlParity && restReturnParity && authorityParity;
  return freeze({
    pane_parity: paneParity,
    comparison_parity: comparisonParity,
    control_parity: controlParity,
    rest_return_parity: restReturnParity,
    authority_parity: authorityParity,
    static_truth_carries_all_scene_information: passed,
    passed,
    scar: 'ANIMATED_OR_INTERACTIVE_SCENE_INFORMATION <= STATIC_TRUTH_INFORMATION',
  });
}

export function rejectResearchBenchAuthorityOrFlattening(candidate) {
  const controls = (candidate?.controls ?? []).map(item => item.action ?? item);
  const forbiddenActions = FORBIDDEN_ACTIONS.filter(action => controls.includes(action));
  const widenedAuthority = Object.entries(candidate?.authority ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  const forbiddenFields = FORBIDDEN_GLOBAL_FIELDS.filter(field => (
    Object.prototype.hasOwnProperty.call(candidate ?? {}, field)
  ));
  const privilegedPane = (candidate?.stratum_panes ?? []).some(pane => pane.privileged === true);
  const liveBinding = candidate?.runtime_binding === true;
  const accepted =
    forbiddenActions.length === 0
    && widenedAuthority.length === 0
    && forbiddenFields.length === 0
    && !privilegedPane
    && !liveBinding;

  return freeze({
    accepted,
    forbidden_actions: freeze(forbiddenActions),
    widened_authority_coordinates: freeze(widenedAuthority),
    forbidden_global_fields: freeze(forbiddenFields),
    privileged_stratum_attempted: privilegedPane,
    live_runtime_binding_attempted: liveBinding,
    classification: accepted
      ? 'RESEARCH_BENCH_AUTHORITY_AND_HETEROSTRATIGRAPHY_PRESERVED'
      : 'RESEARCH_BENCH_AUTHORITY_OR_FLATTENING_ATTEMPT_REJECTED',
  });
}
