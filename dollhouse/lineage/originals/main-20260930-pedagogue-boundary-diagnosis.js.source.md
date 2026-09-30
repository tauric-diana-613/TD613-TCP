export const PEDAGOGUE_BOUNDARY_SPECIMEN_SCHEMA = 'td613.pedagogue-boundary-specimen/v0.1';
export const PEDAGOGUE_BOUNDARY_DIAGNOSIS_SCHEMA = 'td613.pedagogue-boundary-diagnosis/v0.1';

function finding(code, consequence, exact, severity = 'MEDIUM') {
  return Object.freeze({ code, severity, consequence, exact });
}

function recommendation(code, now, why, exact, guardrails = []) {
  return Object.freeze({ code, now, why, exact, guardrails: Object.freeze([...guardrails]) });
}

export function compilePedagogueBoundaryDiagnosis(specimen = {}) {
  if (specimen.schema !== PEDAGOGUE_BOUNDARY_SPECIMEN_SCHEMA) {
    throw new Error(`Expected ${PEDAGOGUE_BOUNDARY_SPECIMEN_SCHEMA}.`);
  }
  if (typeof specimen.surface_reference !== 'string' || !specimen.surface_reference.trim()) {
    throw new Error('Boundary diagnosis requires surface_reference.');
  }

  const observed = specimen.observed || {};
  const constraints = specimen.constraints || {};
  const findings = [];
  const recommendations = [];

  if (observed.universe_boundary_crossing_unstated === true) {
    findings.push(finding(
      'WORLD_BOUNDARY_UNDECLARED',
      'Restoring a saved object can silently move the operator into a different evidence universe while incompatible live-world tools remain awake.',
      'A practice/demo artifact carries a different provenance and source registry than a live research artifact; opening it without an explicit world transition collapses those boundaries.'
    ));
    recommendations.push(recommendation(
      'DECLARE_WORLD_TRANSITION_BEFORE_RESTORE',
      'Name the universe change before restoring the saved object and require an explicit human gesture to cross it.',
      'Custody continuity does not grant world-state continuity. The operator should know whether opening a saved artifact will wake practice sources, suspend live sources, or replace unsaved working state.',
      'Intercept the restore gesture, explain the destination universe and state consequences, then cross the boundary only after confirmation.',
      ['Preserve saved custody.', 'Do not silently mix live and fictional registries.', 'Do not infer practice status from title alone when provenance is available.']
    ));
  }

  if (observed.transient_state_survives_world_exit === true) {
    findings.push(finding(
      'EXIT_STATE_LEAK',
      'Leaving a bounded world does not actually leave it when queued actors, filled search fields, loaded context, or other transient state remain active afterward.',
      'Exit is a state transition, not a decorative navigation event; transient world-owned state must settle or clear while durable custody remains intact.'
    ));
    recommendations.push(recommendation(
      'PURGE_TRANSIENT_STATE_ON_WORLD_EXIT',
      'Use the product’s canonical transient-clear route when the world exits, then explicitly clear any independently owned temporary controls that route does not own.',
      'A clean exit prevents fictional/live state admixture without destroying saved files or encrypted custody.',
      'Clear queue membership, unsaved search fields, loaded temporary campaign context, transient filters, and source-run UI while preserving Saved Local Files and Vault artifacts.',
      ['Never delete durable custody as part of transient exit.', 'Do not clear unrelated browser storage globally.']
    ));
  }

  if (observed.source_finality_label_opaque === true) {
    findings.push(finding(
      'SOURCE_FINALITY_OPAQUE',
      'A status label describes internal workflow posture without telling the operator whether evidence is usable, incomplete, retryable, or absent.',
      'Terms such as “Source Hold” compress provider failure, partial coverage, and retryability into an implementation noun rather than an observable research consequence.'
    ));
    recommendations.push(recommendation(
      'NAME_SOURCE_STATE_BY_CONSEQUENCE',
      'Name incomplete retrieval by what remains true for the evidence and what action is available next.',
      'The operator needs to know that completed-source evidence remains usable while one or more source routes need another attempt.',
      'Prefer consequence language such as “Incomplete coverage” with a nearby explanation that successful source results remain usable and the named source may be retried.',
      ['Never convert a held/partial source into zero.', 'Preserve source-specific receipts and error details.', 'Do not imply the entire contact search failed when only one route held.']
    ));
  }

  if (observed.route_affordance_visually_ambiguous === true) {
    findings.push(finding(
      'ROUTE_AFFORDANCE_AMBIGUOUS',
      'Instructional copy names a destination but the actionable route is visually indistinguishable from ordinary explanatory text.',
      'A snap/jump control can technically work while remaining pedagogically dormant when its affordance is not visible.'
    ));
    recommendations.push(recommendation(
      'MARK_ROUTE_AS_ROUTE',
      'Give instructional navigation a visible link/button affordance and name the destination consequence.',
      'Pedagogy weakens when the learner must discover that prose is secretly interactive.',
      'Use an underlined or button-like jump control adjacent to the explanation; preserve keyboard focus and an explicit accessible label.',
      ['Do not encode interactivity through color alone.', 'Do not move the learner unless they activate the route.']
    ));
  }

  if (observed.source_envelope_mismatch === true) {
    findings.push(finding(
      'SOURCE_ENVELOPE_MISMATCH',
      'A generic page-size or retry policy asks a particular provider to return more data or wait longer than that source can reliably deliver inside the product boundary.',
      'Uniform retrieval envelopes can turn a small real-world result set into a large raw provider response, a timeout, or a response-boundary failure before Giving can retain the few relevant records.'
    ));
    recommendations.push(recommendation(
      'BOUND_PAGE_BY_SOURCE',
      'Use source-specific request ceilings and explicit continuation rather than forcing every provider through one browser page size.',
      'Provider cost is determined by upstream query behavior and raw response shape, not merely by how many relevant records survive normalization.',
      'Choose a conservative per-gesture page envelope for the affected source, return the first bounded page promptly, and expose continuation for additional coverage.',
      ['Partial coverage must remain explicit.', 'Do not claim completeness from a bounded first page.', 'Do not hide provider errors by silently retrying without limit.']
    ));
  }

  if (observed.native_control_geometry_breaches_container === true) {
    findings.push(finding(
      'NATIVE_CONTROL_GEOMETRY_BREACH',
      'A platform-native control preserves correct semantics while its rendered geometry escapes the instrument panel at a responsive breakpoint.',
      'The failure belongs to the wrapper/geometry contract, not to the native input semantics themselves.'
    ));
    recommendations.push(recommendation(
      'BOUND_NATIVE_CONTROL_WITHOUT_REIMPLEMENTING_IT',
      'Keep the native control and repair width, min-width, box sizing, value alignment, and surrounding responsive rhythm.',
      'Replacing a native date or picker solely for visual continuity creates avoidable accessibility and locale risk.',
      'Constrain the native control to its responsive grid cell and style the value surface around the platform-owned behavior.',
      ['Preserve native keyboard, picker, and assistive-technology semantics.', 'Keep mobile text at the platform-safe zoom threshold.']
    ));
  }

  return Object.freeze({
    schema: PEDAGOGUE_BOUNDARY_DIAGNOSIS_SCHEMA,
    surface_reference: specimen.surface_reference,
    specimen_kind: specimen.specimen_kind || 'BOUNDARY_AND_SOURCE_FINALITY',
    findings: Object.freeze(findings),
    recommendations: Object.freeze(recommendations),
    synthesis: Object.freeze({
      implementation_this_round: constraints.implementation_this_round === true,
      preserve_durable_custody: constraints.preserve_durable_custody !== false,
      preserve_source_receipts: constraints.preserve_source_receipts !== false,
      automatic_redesign: false,
      human_closure_required: true
    }),
    pedagogue_hydration: Object.freeze({
      capability: 'WORLD_BOUNDARY_SOURCE_FINALITY_AND_ROUTE_AFFORDANCE_DIAGNOSIS',
      generic_operator_added: true,
      source_surface_is_specimen_not_owner: true,
      product_mutation_authority: false,
      diagnosis_may_propose_not_apply: true
    }),
    authority: Object.freeze({
      product_mutation_authorized: false,
      automatic_redesign: false,
      automatic_release: false,
      authority_may_cross: false,
      human_closure_required: true
    })
  });
}
