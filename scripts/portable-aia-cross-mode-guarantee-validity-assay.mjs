import {
  auditPortablePayloadVocabulary,
  buildPortableReturnCandidate,
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection,
  revalidatePortableReturn
} from '../app/dome-world/portable-aia-three-route-invariance.js';
import {
  HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  HOLONOMY_LOOM_ADVISORY_RULES
} from '../app/dome-world/holonomy-loom-advisory-policy.js';

export const PORTABLE_AIA_CROSS_MODE_GUARANTEE_VALIDITY_ASSAY_SCHEMA =
  'td613.portable-aia.cross-mode-guarantee-validity-assay/v0.1-local-only';

export const CROSS_MODE_GUARANTEE_IDS = Object.freeze([
  'G0_NO_LOOM_RELEASE_AUTHORITY',
  'G1_HUMAN_CLOSURE_REQUIRED',
  'G2_PORTABLE_PAYLOAD_FINITE_CANONICAL_ONLY',
  'G3_RETURN_REMAINS_ADVISORY',
  'B0_LOCAL_POCKET_PRE_INGRESS_POSITION',
  'B1_CHATGPT_COMPANION_POST_INGRESS_POSITION',
  'B2_TD613_HOSTED_CONTEXT_POSITION'
]);

const INVARIANT_IDS = Object.freeze(CROSS_MODE_GUARANTEE_IDS.slice(0, 4));
const BOUNDARY_IDS = Object.freeze(CROSS_MODE_GUARANTEE_IDS.slice(4));

const BOUNDARY_SPEC = Object.freeze({
  B0_LOCAL_POCKET_PRE_INGRESS_POSITION: Object.freeze({
    route_mode:'LOCAL_POCKET',
    source_ingress_position:'BEFORE_OPTIONAL_REMOTE_INGRESS'
  }),
  B1_CHATGPT_COMPANION_POST_INGRESS_POSITION: Object.freeze({
    route_mode:'CHATGPT_THREAD_COMPANION',
    source_ingress_position:'AFTER_UPSTREAM_THREAD_INGRESS'
  }),
  B2_TD613_HOSTED_CONTEXT_POSITION: Object.freeze({
    route_mode:'TD613_HOSTED',
    source_ingress_position:'TD613_HOST_CONTEXT'
  })
});

const POLICY_DIGEST = `sha256:${'1'.repeat(64)}`;
const SOURCE_STATE_DIGEST = `sha256:${'2'.repeat(64)}`;

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (!value || typeof value !== 'object') return value;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, freeze(child)])));
}

function evaluateProjection(ruleId, routeMode) {
  const projection = compilePortableAiaProjection({ ruleId, routeMode });
  const payloadAudit = auditPortablePayloadVocabulary(projection);
  const binding = compilePortableAiaLocalBinding(projection, {
    policyDigest:POLICY_DIGEST,
    sourceStateDigest:SOURCE_STATE_DIGEST
  });
  const candidate = buildPortableReturnCandidate(projection, {
    claimedActionClass:projection.invariant.action_class
  });
  const revalidation = revalidatePortableReturn(projection, binding, candidate);
  const sourceIngressPosition = projection.portable_payload.route_boundary.source_ingress_position;

  const claims = {
    G0_NO_LOOM_RELEASE_AUTHORITY:
      projection.authority.loom_release === false && projection.invariant.release_authority === false,
    G1_HUMAN_CLOSURE_REQUIRED:
      projection.invariant.human_closure_required === true &&
      projection.portable_payload.human_closure_required === true,
    G2_PORTABLE_PAYLOAD_FINITE_CANONICAL_ONLY:
      payloadAudit.ok === true &&
      payloadAudit.finite_canonical_vocabulary === true &&
      payloadAudit.digest_token_present === false &&
      payloadAudit.route_mode_present === false &&
      payloadAudit.presentation_host_present === false,
    G3_RETURN_REMAINS_ADVISORY:
      candidate.trusted === false &&
      candidate.release_authority === false &&
      candidate.must_revalidate === true &&
      revalidation.status === 'PRESENT_TO_HUMAN' &&
      revalidation.candidate_trusted === false &&
      revalidation.release_authority === false &&
      revalidation.human_closure_required === true,
    B0_LOCAL_POCKET_PRE_INGRESS_POSITION:
      sourceIngressPosition === BOUNDARY_SPEC.B0_LOCAL_POCKET_PRE_INGRESS_POSITION.source_ingress_position,
    B1_CHATGPT_COMPANION_POST_INGRESS_POSITION:
      sourceIngressPosition === BOUNDARY_SPEC.B1_CHATGPT_COMPANION_POST_INGRESS_POSITION.source_ingress_position,
    B2_TD613_HOSTED_CONTEXT_POSITION:
      sourceIngressPosition === BOUNDARY_SPEC.B2_TD613_HOSTED_CONTEXT_POSITION.source_ingress_position
  };

  return freeze({
    point_id:`${ruleId}::${routeMode}`,
    rule_id:ruleId,
    route_mode:routeMode,
    source_ingress_position:sourceIngressPosition,
    claims,
    return_status:revalidation.status,
    candidate_trusted:revalidation.candidate_trusted,
    release_authority:revalidation.release_authority,
    human_closure_required:revalidation.human_closure_required,
    payload_audit:{
      ok:payloadAudit.ok,
      finite_canonical_vocabulary:payloadAudit.finite_canonical_vocabulary,
      digest_token_present:payloadAudit.digest_token_present,
      route_mode_present:payloadAudit.route_mode_present,
      presentation_host_present:payloadAudit.presentation_host_present
    }
  });
}

function supportFor(rows, claimId) {
  const members = rows.filter(row => row.claims[claimId]);
  const byRoute = Object.fromEntries(HOLONOMY_LOOM_ADVISORY_ROUTE_MODES.map(routeMode => [
    routeMode,
    members.filter(row => row.route_mode === routeMode).length
  ]));
  const byRule = Object.fromEntries(Object.keys(HOLONOMY_LOOM_ADVISORY_RULES).map(ruleId => [
    ruleId,
    members.filter(row => row.rule_id === ruleId).length
  ]));
  return freeze({
    claim_id:claimId,
    support_count:members.length,
    support_point_ids:members.map(row => row.point_id),
    route_modes:[...new Set(members.map(row => row.route_mode))],
    by_route:byRoute,
    by_rule:byRule
  });
}

function hostileUniversalization(rows, claimId) {
  const spec = BOUNDARY_SPEC[claimId];
  const lawful = rows.filter(row => row.route_mode === spec.route_mode);
  const nonmatching = rows.filter(row => row.route_mode !== spec.route_mode);
  const falseClaims = nonmatching.filter(row => row.claims[claimId] === false);
  const unexpectedlyAccepted = nonmatching.filter(row => row.claims[claimId] === true);
  return freeze({
    claim_id:claimId,
    asserted_universally:true,
    lawful_route:spec.route_mode,
    lawful_true_count:lawful.filter(row => row.claims[claimId] === true).length,
    nonmatching_projection_count:nonmatching.length,
    false_claim_count:falseClaims.length,
    unexpectedly_accepted_false_claim_count:unexpectedlyAccepted.length,
    rejected_nonmatching_point_ids:falseClaims.map(row => row.point_id),
    universalization_valid:false
  });
}

export function runPortableAiaCrossModeGuaranteeValidityAssay() {
  const ruleIds = Object.keys(HOLONOMY_LOOM_ADVISORY_RULES);
  const routeModes = [...HOLONOMY_LOOM_ADVISORY_ROUTE_MODES];
  if (ruleIds.length !== 7) throw new Error(`expected exact seven-rule domain, got ${ruleIds.length}`);
  if (routeModes.length !== 3) throw new Error(`expected exact three-route domain, got ${routeModes.length}`);

  const rows = [];
  for (const ruleId of ruleIds) {
    for (const routeMode of routeModes) rows.push(evaluateProjection(ruleId, routeMode));
  }
  if (rows.length !== 21 || new Set(rows.map(row => row.point_id)).size !== 21) {
    throw new Error('exact 21-point Portable-AIA domain failed to materialize injectively');
  }

  const support = Object.fromEntries(CROSS_MODE_GUARANTEE_IDS.map(claimId => [claimId, supportFor(rows, claimId)]));
  for (const claimId of INVARIANT_IDS) {
    if (support[claimId].support_count !== 21) {
      throw new Error(`${claimId} failed route-invariant support: ${support[claimId].support_count}/21`);
    }
    if (!routeModes.every(routeMode => support[claimId].by_route[routeMode] === 7)) {
      throw new Error(`${claimId} route support drifted`);
    }
  }

  for (const claimId of BOUNDARY_IDS) {
    const spec = BOUNDARY_SPEC[claimId];
    const claimSupport = support[claimId];
    if (claimSupport.support_count !== 7 || claimSupport.route_modes.length !== 1 || claimSupport.route_modes[0] !== spec.route_mode) {
      throw new Error(`${claimId} boundary support drifted: ${JSON.stringify(claimSupport)}`);
    }
    if (!ruleIds.every(ruleId => claimSupport.by_rule[ruleId] === 1)) {
      throw new Error(`${claimId} lost rule-independent support inside ${spec.route_mode}`);
    }
  }

  const hostile = Object.fromEntries(BOUNDARY_IDS.map(claimId => [claimId, hostileUniversalization(rows, claimId)]));
  for (const claimId of BOUNDARY_IDS) {
    const control = hostile[claimId];
    if (control.lawful_true_count !== 7 || control.nonmatching_projection_count !== 14 ||
        control.false_claim_count !== 14 || control.unexpectedly_accepted_false_claim_count !== 0) {
      throw new Error(`${claimId} hostile universalization control drifted: ${JSON.stringify(control)}`);
    }
  }

  const sourceIngressPositions = Object.fromEntries(routeModes.map(routeMode => [
    routeMode,
    [...new Set(rows.filter(row => row.route_mode === routeMode).map(row => row.source_ingress_position))]
  ]));
  if (!Object.values(sourceIngressPositions).every(values => values.length === 1)) {
    throw new Error('source-ingress token changed with rule identity inside a route');
  }

  return freeze({
    schema:PORTABLE_AIA_CROSS_MODE_GUARANTEE_VALIDITY_ASSAY_SCHEMA,
    status:'PASS',
    assay_local_only:true,
    exact_scientific_parent:'#1073/25040f740c1c0c57a082554398fd6ef6dc048f48',
    domain:{
      rule_count:ruleIds.length,
      route_count:routeModes.length,
      canonical_projection_count:rows.length,
      rule_ids:ruleIds,
      route_modes:routeModes,
      claim_count:CROSS_MODE_GUARANTEE_IDS.length
    },
    rows,
    support,
    classification:{
      invariant_claim_ids:INVARIANT_IDS,
      boundary_dependent_claim_ids:BOUNDARY_IDS,
      invariant_core_supports_all_21:true,
      boundary_claims_support_exactly_one_route_each:true,
      invariant_core_route_independent:true,
      boundary_support_rule_independent:true,
      common_policy_core_is_common_trust_boundary:false,
      portable_governance_invariance_is_portable_guarantee_text:false
    },
    source_ingress_positions:sourceIngressPositions,
    hostile_universalization:hostile,
    product_source_mutated:false,
    new_route_added:false,
    new_production_receiver_added:false,
    universal_privacy_claimed:false,
    production_behavior_claimed:false,
    counts_as_exogenous_witness:false,
    golden_egg_credit:0,
    authority:{
      release_authority:false,
      provider_call_performed:false,
      production_mutation:false,
      deployment_authority:false,
      human_closure_required:true
    },
    claim_ceiling:'exact-current-seven-claim-by-21-projection-cross-mode-support-matrix-only',
    seal:'⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runPortableAiaCrossModeGuaranteeValidityAssay(), null, 2)}\n`);
}
