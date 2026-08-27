import {
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
} from './heterostratigraphic-holonomy-tomography-bridge.js';

export const HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA =
  'td613.loom.heterostratigraphic-apparatus-receipt/v0.1';
export const ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA =
  'td613.ash.heterostratigraphic-readonly-projection/v0.1';
export const HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT =
  'aad04e9cbb4532b4fc63dea16ef179f2e66200ed';

const STRATA = Object.freeze([
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

const HOLD_STATUSES = new Set([
  'ENCODER_REQUIRED',
  'INCOMMENSURABLE',
  'CONTRADICTORY',
  'REJECTED',
  'ABSTAIN',
]);

const ASH_AVAILABLE_ACTIONS = Object.freeze([
  'INSPECT_LOCAL_RESULT',
  'INSPECT_COMPARISON_HOLD',
  'RETURN',
  'REST',
]);

const ASH_PROHIBITED_ACTIONS = Object.freeze([
  'RUN_TOMOGRAPHY_INVERSE',
  'CREATE_CROSS_STRATUM_ENCODER',
  'PROMOTE_CLAIM',
  'MUTATE_CASE_CUSTODY',
  'WRITE_ROUTE_MEMORY',
  'AUTHORIZE_RELEASE',
  'TRANSMIT_SOURCE_CONTENT',
]);

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertCleanBridge(bridge) {
  if (!bridge || bridge.schema !== HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA) {
    throw new Error('Loom apparatus adapter requires the frozen heterostratigraphic bridge schema.');
  }
  if (bridge.manifestly_fictional !== true || bridge.runtime_binding !== false) {
    throw new Error('Loom apparatus adapter requires a fictional non-runtime bridge.');
  }
  if (bridge.global_synthesis_authority !== false || bridge.promotion_authority !== false) {
    throw new Error('Loom apparatus adapter cannot consume a bridge with promoted synthesis authority.');
  }
  if (bridge.live_ash_binding !== false) {
    throw new Error('Loom apparatus adapter cannot consume a bridge already bound to live Ash.');
  }
  const forbidden = FORBIDDEN_GLOBAL_FIELDS.filter(field => (
    Object.prototype.hasOwnProperty.call(bridge, field)
  ));
  if (forbidden.length > 0) {
    throw new Error(`Forbidden global synthesis fields: ${forbidden.join(', ')}`);
  }
  const ids = bridge.strata?.map(item => item.id) ?? [];
  if (JSON.stringify(ids) !== JSON.stringify(STRATA)) {
    throw new Error('Loom apparatus adapter requires all four strata in canonical order.');
  }
  if (bridge.comparison_registry?.length !== 12) {
    throw new Error('Loom apparatus adapter requires all twelve ordered cross-stratum edges.');
  }
  if (bridge.findings?.assay_mechanism_validated !== true) {
    throw new Error('Loom apparatus adapter requires a locally passing frozen bridge research input.');
  }
  return true;
}

function panelFor(id, result) {
  const shared = {
    id,
    technical_status: result.passed === true ? 'LOCAL_ASSAY_PASS' : 'LOCAL_ASSAY_HOLD',
    local_pass: result.passed === true,
    observable_kind: result.observable_kind,
    claim_ceiling: 'BOUNDED_SYNTHETIC_LOCAL_STRATUM_ONLY',
  };

  if (id === 'ROUTE') {
    return freeze({
      ...shared,
      plain_language_consequence: 'Same endpoint, different route history.',
      what_changed: `route residue = ${result.route_residue_millipoints} millipoints`,
      what_remains_uncertain: 'No claim about hidden live-Ash transport or geometric holonomy.',
    });
  }
  if (id === 'TEMPORAL') {
    return freeze({
      ...shared,
      plain_language_consequence: 'The order of the same operations can remain visible in the terminal witness.',
      what_changed: `${result.positive_unique_signature_count} order-sensitive terminal signatures versus ${result.commuting_null_unique_signature_count} commuting-null signature`,
      what_remains_uncertain: 'No TD613-general temporal-order law and no live custody inference.',
    });
  }
  if (id === 'FACE_HOLONOMY') {
    return freeze({
      ...shared,
      plain_language_consequence: 'Reconstructed face loops require the declared order and common basepoint.',
      what_changed: 'Wrong-order and wrong-basepoint controls are rejected in the authored two-cell fixture.',
      what_remains_uncertain: 'No continuum curvature, physical gauge field, or global holonomy surface.',
    });
  }
  return freeze({
    ...shared,
    plain_language_consequence: 'What can be identified depends on the observed ecology and calibration support.',
    what_changed: 'Sparse ecology aliases directions; calibrated ecology recovers the authored projective directions.',
    what_remains_uncertain: 'No arbitrary-ecology sufficiency or universal observation geometry.',
  });
}

function comparisonEntry(edge) {
  if (edge.status === 'PARTIAL_NONINVERTIBLE') {
    return freeze({
      kind: 'PARTIAL_BRIDGE',
      from: edge.from,
      to: edge.to,
      status: edge.status,
      invertible: false,
      reason: edge.reason ?? edge.note ?? 'Declared partial map loses information.',
      prohibited_inference: 'DO_NOT_TREAT_AS_EQUIVALENCE_OR_APPROXIMATE_ISOMORPHISM',
    });
  }
  if (edge.status === 'DEFINED') {
    return freeze({
      kind: 'DEFINED_BRIDGE',
      from: edge.from,
      to: edge.to,
      status: edge.status,
      reason: edge.reason ?? edge.note ?? 'Declared comparison map available.',
    });
  }
  if (HOLD_STATUSES.has(edge.status)) {
    return freeze({
      kind: 'HOLD',
      from: edge.from,
      to: edge.to,
      status: edge.status,
      reason: edge.reason ?? edge.note ?? 'Cross-stratum comparison not licensed.',
      prohibited_inference:
        edge.status === 'INCOMMENSURABLE'
          ? 'DO_NOT_RENDER_AS_CONTRADICTION_OR_LOW_CONFIDENCE_MATCH'
          : 'DO_NOT_INVENT_ENCODER_IDENTITY_OR_PROBABLE_EQUIVALENCE',
    });
  }
  throw new Error(`Unsupported comparison status ${edge.status}`);
}

function authorityVector(overrides = {}) {
  const base = Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false]));
  return freeze({ ...base, ...overrides });
}

function staticTruthFromPanels(panels, comparisons) {
  return freeze({
    stratum_count: panels.length,
    comparison_edge_count: comparisons.length,
    panels: freeze(panels.map(panel => ({
      id: panel.id,
      local_pass: panel.local_pass,
      consequence: panel.plain_language_consequence,
      uncertainty: panel.what_remains_uncertain,
      claim_ceiling: panel.claim_ceiling,
    }))),
    comparisons: freeze(comparisons.map(item => ({
      from: item.from,
      to: item.to,
      status: item.status,
      kind: item.kind,
      prohibited_inference: item.prohibited_inference ?? null,
    }))),
    global_synthesis_authority: false,
  });
}

export function compileLoomHeterostratigraphicApparatusReceipt(bridge) {
  assertCleanBridge(bridge);

  const panels = STRATA.map(id => panelFor(id, bridge.local_results[id]));
  const comparisons = bridge.comparison_registry.map(comparisonEntry);
  const partialBridges = comparisons.filter(item => item.kind === 'PARTIAL_BRIDGE');
  const comparisonHolds = comparisons.filter(item => item.kind === 'HOLD');
  const definedBridges = comparisons.filter(item => item.kind === 'DEFINED_BRIDGE');

  const apparatusAuthority = authorityVector();
  const staticTruth = staticTruthFromPanels(panels, comparisons);

  const receipt = {
    schema: HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA,
    apparatus_owner: 'HOLONOMY_LOOM_RESEARCH',
    source_bridge_schema: bridge.schema,
    source_fixture_id: bridge.fixture_id,
    source_bridge_head: HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
    research_only: true,
    runtime_binding: false,
    stratum_panels: freeze(panels),
    partial_bridges: freeze(partialBridges),
    comparison_holds: freeze(comparisonHolds),
    defined_bridges: freeze(definedBridges),
    static_truth: staticTruth,
    inspection: freeze({
      comparison_edge_count: comparisons.length,
      partial_bridge_count: partialBridges.length,
      hold_count: comparisonHolds.length,
      defined_bridge_count: definedBridges.length,
      encoder_required_count: comparisonHolds.filter(item => item.status === 'ENCODER_REQUIRED').length,
      incommensurable_count: comparisonHolds.filter(item => item.status === 'INCOMMENSURABLE').length,
      all_local_panels_present: panels.length === 4,
      all_comparison_edges_preserved: comparisons.length === 12,
    }),
    authority: apparatusAuthority,
    claim_ceiling: freeze({
      engineering_adapter_over_frozen_bridge: true,
      scientific_bridge_promoted: false,
      live_ash_tomography: false,
      proto_loom: false,
      physical_holonomy: false,
      continuum_tomography: false,
      production_authority: false,
      vercel_authority: false,
    }),
    receiver_contract: freeze({
      receiver: 'ASH_KEEP_RESEARCH_SURFACE',
      projection_mode: 'READ_ONLY',
      authority_may_widen: false,
      inverse_authority: false,
      encoder_authority: false,
      custody_mutation_authority: false,
      release_authority: false,
    }),
    human_closure_required: true,
  };

  const forbidden = FORBIDDEN_GLOBAL_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(receipt, field));
  if (forbidden.length) throw new Error(`Apparatus receipt introduced forbidden fields: ${forbidden.join(', ')}`);

  return freeze(receipt);
}

function assertAuthorityMonotone(parent, child) {
  for (const key of AUTHORITY_KEYS) {
    if (child[key] === true && parent[key] !== true) {
      throw new Error(`Ash projection widened authority coordinate ${key}`);
    }
  }
  return true;
}

export function compileAshReadOnlyTomographyProjection(receipt) {
  if (!receipt || receipt.schema !== HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA) {
    throw new Error('Ash projection requires the Holonomy Loom heterostratigraphic apparatus receipt.');
  }
  if (receipt.runtime_binding !== false || receipt.research_only !== true) {
    throw new Error('Ash projection requires a research-only non-runtime apparatus receipt.');
  }
  if (receipt.stratum_panels?.length !== 4 || receipt.inspection?.comparison_edge_count !== 12) {
    throw new Error('Ash projection requires complete panel and comparison custody.');
  }

  const ashAuthority = authorityVector();
  assertAuthorityMonotone(receipt.authority, ashAuthority);

  const cards = receipt.stratum_panels.map(panel => freeze({
    stratum: panel.id,
    title: panel.plain_language_consequence,
    status: panel.technical_status,
    what_changed: panel.what_changed,
    what_remains_uncertain: panel.what_remains_uncertain,
    claim_ceiling: panel.claim_ceiling,
    read_only: true,
  }));

  const holds = receipt.comparison_holds.map(hold => freeze({
    from: hold.from,
    to: hold.to,
    status: hold.status,
    reason: hold.reason,
    prohibited_inference: hold.prohibited_inference,
    operator_posture: 'HOLD_AND_INSPECT',
  }));

  const projection = {
    schema: ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA,
    surface_owner: 'ASH_KEEP_RESEARCH_SURFACE',
    source_receipt_schema: receipt.schema,
    fixture_label: 'Strata Lantern · Moss Lantern heterostratigraphic calibration',
    cards: freeze(cards),
    holds: freeze(holds),
    partial_bridges: receipt.partial_bridges,
    static_truth: receipt.static_truth,
    available_actions: ASH_AVAILABLE_ACTIONS,
    prohibited_actions: ASH_PROHIBITED_ACTIONS,
    authority: ashAuthority,
    claim_ceiling: freeze({
      read_only_research_projection: true,
      tomography_inverse_authority: false,
      encoder_authority: false,
      live_case_mutation: false,
      route_memory_write: false,
      release_authority: false,
      source_transport: false,
      production_authority: false,
    }),
    runtime_binding: false,
    human_closure_required: true,
  };

  const forbidden = FORBIDDEN_GLOBAL_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(projection, field));
  if (forbidden.length) throw new Error(`Ash projection introduced forbidden fields: ${forbidden.join(', ')}`);

  return freeze(projection);
}

export function apparatusAuthorityMonotonicityCertificate(receipt, projection) {
  const coordinates = AUTHORITY_KEYS.map(key => freeze({
    coordinate: key,
    loom: Boolean(receipt.authority[key]),
    ash: Boolean(projection.authority[key]),
    monotone: projection.authority[key] !== true || receipt.authority[key] === true,
  }));
  const actionsSafe = ASH_PROHIBITED_ACTIONS.every(action => projection.prohibited_actions.includes(action));
  const comparisonsPreserved =
    projection.holds.length === receipt.comparison_holds.length
    && projection.partial_bridges.length === receipt.partial_bridges.length;

  return freeze({
    coordinates: freeze(coordinates),
    all_coordinates_monotone: coordinates.every(item => item.monotone),
    all_prohibited_actions_preserved: actionsSafe,
    all_hold_and_partial_comparisons_preserved: comparisonsPreserved,
    passed: coordinates.every(item => item.monotone) && actionsSafe && comparisonsPreserved,
    scar: 'RECEIPT_VISIBILITY != TOMOGRAPHY_AUTHORITY',
  });
}

export function rejectAshAuthorityWidening(candidate) {
  const forbiddenActions = [
    'RUN_TOMOGRAPHY_INVERSE',
    'CREATE_CROSS_STRATUM_ENCODER',
    'MUTATE_CASE_CUSTODY',
    'AUTHORIZE_RELEASE',
  ];
  const available = new Set(candidate?.available_actions ?? []);
  const widenedActions = forbiddenActions.filter(action => available.has(action));
  const widenedAuthority = AUTHORITY_KEYS.filter(key => candidate?.authority?.[key] === true);
  const liveBinding = candidate?.runtime_binding === true;
  const accepted = widenedActions.length === 0 && widenedAuthority.length === 0 && !liveBinding;
  return freeze({
    accepted,
    widened_actions: freeze(widenedActions),
    widened_authority_coordinates: freeze(widenedAuthority),
    live_runtime_binding_attempted: liveBinding,
    classification: accepted
      ? 'ASH_READ_ONLY_AUTHORITY_BOUNDARY_PRESERVED'
      : 'ASH_AUTHORITY_WIDENING_REJECTED',
  });
}
