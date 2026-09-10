import {
  FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
  finiteAdmissibilityDescentProfile,
  materializeExactDescendedRule,
} from './aperture-pedagogue-finite-admissibility-descent-theorem.js';
import {
  HOLO_LOOM_RESEARCH_BENCH_SCHEMA,
} from './holonomy-loom-heterostratigraphic-research-bench.js';

export const FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA =
  'td613.loom.fadt-constitutional-descent-membrane/v0.1';
export const FADT_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
export const HOLO_LOOM_RESEARCH_BENCH_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';

const CANONICAL_STRATA = Object.freeze([
  'ROUTE',
  'TEMPORAL',
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
]);

const STRATUM_CLAIM_SUPPORTS = Object.freeze({
  ROUTE: Object.freeze(['LOCAL_RESULT', 'ROUTE_HISTORY']),
  TEMPORAL: Object.freeze(['LOCAL_RESULT', 'TEMPORAL_ORDER']),
  FACE_HOLONOMY: Object.freeze(['LOCAL_RESULT', 'FACE_HOLONOMY']),
  OBSERVABILITY_ECOLOGY: Object.freeze(['LOCAL_RESULT', 'OBSERVABILITY_ECOLOGY']),
});

const FORBIDDEN_OVERREACH_FIELDS = Object.freeze([
  'truth',
  'global_truth',
  'semantic_equivalence',
  'cross_stratum_encoder',
  'encoder_created',
  'incommensurable_resolved',
  'scientific_bridge_promoted',
  'live_runtime_binding',
  'proto_loom_authority',
  'physical_holonomy_authority',
  'continuum_tomography_authority',
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

function assertBench(scene) {
  if (!scene || scene.schema !== HOLO_LOOM_RESEARCH_BENCH_SCHEMA) {
    throw new Error('FADT membrane requires the witnessed Holonomy Loom research-bench schema.');
  }
  if (scene.research_only !== true || scene.runtime_binding !== false) {
    throw new Error('FADT membrane accepts only the bounded non-runtime research bench.');
  }
  const strata = scene.stratum_panes?.map(pane => pane.stratum) ?? [];
  if (!same(strata, CANONICAL_STRATA)) {
    throw new Error('FADT membrane requires all four canonical bench strata in order.');
  }
  if (Object.values(scene.authority ?? {}).some(Boolean)) {
    throw new Error('FADT membrane rejects a bench with widened authority.');
  }
  return true;
}

function rowsForGlobalSummary(scene) {
  assertBench(scene);
  return freeze(scene.stratum_panes.map(pane => freeze({
    antecedent: pane.stratum,
    quotient: 'GLOBAL_SUMMARY',
    support: STRATUM_CLAIM_SUPPORTS[pane.stratum],
  })));
}

function envelopeFromSingleFiber(profile) {
  if (profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') {
    return freeze({ status: 'FADT_INPUT_ABSTAIN', profile });
  }
  if (profile.occupied_fibers.length !== 1) {
    return freeze({ status: 'FADT_INPUT_ABSTAIN', profile });
  }
  const fiber = profile.occupied_fibers[0];
  return freeze({
    status: 'FADT_OCCUPIED_FIBER_ENVELOPE_DERIVED',
    quotient: fiber.quotient,
    exact_descended_claim_support_authorized: profile.exact_descended_rule_exists,
    largest_universally_sound_support: fiber.intersection_support,
    smallest_universally_complete_support: fiber.union_support,
    irreducible_gap: fiber.irreducible_gap,
    irreducible_gap_cardinality: fiber.irreducible_gap_cardinality,
    antecedent_supports: fiber.antecedent_supports,
  });
}

export function auditDeclaredFiniteClaimSupportDescent(rows) {
  const profile = finiteAdmissibilityDescentProfile(rows);
  if (profile.status !== 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED') {
    return freeze({
      schema: FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA,
      status: 'FADT_INPUT_ABSTAIN',
      fadt_receipt: FADT_RECEIPT,
      bench_receipt: HOLO_LOOM_RESEARCH_BENCH_RECEIPT,
      fadt_schema: FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
      bench_schema: HOLO_LOOM_RESEARCH_BENCH_SCHEMA,
      profile,
    });
  }

  const materialized = materializeExactDescendedRule(rows);
  const authorized = profile.exact_descended_rule_exists;
  return freeze({
    schema: FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA,
    status: authorized ? 'EXACT_FADT_DESCENT_AUTHORIZED' : 'HELD_BY_FADT_IRREDUCIBLE_GAP',
    fadt_receipt: FADT_RECEIPT,
    bench_receipt: HOLO_LOOM_RESEARCH_BENCH_RECEIPT,
    fadt_schema: FINITE_ADMISSIBILITY_DESCENT_THEOREM_SCHEMA,
    bench_schema: HOLO_LOOM_RESEARCH_BENCH_SCHEMA,
    exact_descended_claim_support_authorized: authorized,
    occupied_fibers: profile.occupied_fibers,
    descended_rule: authorized ? materialized.rule : null,
    materialization_status: materialized.status,
    claim_ceiling: freeze({
      finite_claim_support_descent_only: true,
      semantic_equivalence_authority: false,
      cross_stratum_encoder_authority: false,
      incommensurability_resolution_authority: false,
      scientific_bridge_promotion_authority: false,
      live_runtime_authority: false,
      proto_loom_authority: false,
      physical_holonomy_authority: false,
      continuum_tomography_authority: false,
    }),
  });
}

export function auditHolonomyLoomGlobalSummaryDescent(scene) {
  const rows = rowsForGlobalSummary(scene);
  const audit = auditDeclaredFiniteClaimSupportDescent(rows);
  const envelope = envelopeFromSingleFiber({
    status: audit.status === 'FADT_INPUT_ABSTAIN'
      ? audit.profile?.status
      : 'FINITE_ADMISSIBILITY_DESCENT_PROFILE_DERIVED',
    exact_descended_rule_exists: audit.exact_descended_claim_support_authorized,
    occupied_fibers: audit.occupied_fibers ?? [],
  });

  if (audit.status === 'FADT_INPUT_ABSTAIN' || envelope.status !== 'FADT_OCCUPIED_FIBER_ENVELOPE_DERIVED') {
    return freeze({
      schema: FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA,
      status: 'FADT_INPUT_ABSTAIN',
      fadt_receipt: FADT_RECEIPT,
      bench_receipt: HOLO_LOOM_RESEARCH_BENCH_RECEIPT,
      audit,
    });
  }

  return freeze({
    ...audit,
    quotient: envelope.quotient,
    largest_universally_sound_support: envelope.largest_universally_sound_support,
    smallest_universally_complete_support: envelope.smallest_universally_complete_support,
    irreducible_gap: envelope.irreducible_gap,
    irreducible_gap_cardinality: envelope.irreducible_gap_cardinality,
    antecedent_supports: envelope.antecedent_supports,
    constitutional_hold_visible: !audit.exact_descended_claim_support_authorized,
    preferred_tight_rule_selected: false,
    semantic_equivalence_inferred: false,
    encoder_created: false,
    incommensurable_resolved: false,
    scientific_bridge_promoted: false,
    scars: freeze([
      'FADT_DESCENT_AUTHORITY != SEMANTIC_EQUIVALENCE_AUTHORITY',
      'EXACT_CLAIM_SUPPORT_DESCENT != CROSS_STRATUM_ENCODER',
      'NONEMPTY_IRREDUCIBLE_GAP != CONTRADICTION',
      'MINIMAL_DISTORTION_FRONTIER != UNIQUE_CORRECT_RULE',
    ]),
  });
}

export function auditRouteLocalDisplayCompression() {
  return auditDeclaredFiniteClaimSupportDescent([
    {
      antecedent: 'ROUTE_CARD_STATIC',
      quotient: 'ROUTE_LOCAL_DISPLAY',
      support: ['LOCAL_RESULT', 'ROUTE_HISTORY'],
    },
    {
      antecedent: 'ROUTE_CARD_REST',
      quotient: 'ROUTE_LOCAL_DISPLAY',
      support: ['LOCAL_RESULT', 'ROUTE_HISTORY'],
    },
  ]);
}

export function rejectFadtConstitutionalOverreach(candidate) {
  const forbidden_fields = FORBIDDEN_OVERREACH_FIELDS.filter(field => {
    if (!Object.prototype.hasOwnProperty.call(candidate ?? {}, field)) return false;
    const value = candidate[field];
    return value === true || value !== null && value !== false && value !== undefined;
  });
  const chosePreferredRule = candidate?.preferred_tight_rule_selected === true;
  const hidGap = candidate?.status === 'HELD_BY_FADT_IRREDUCIBLE_GAP'
    && !Array.isArray(candidate?.irreducible_gap);
  const authorizedAgainstGap = candidate?.exact_descended_claim_support_authorized === true
    && (candidate?.irreducible_gap_cardinality ?? 0) > 0;
  const accepted = forbidden_fields.length === 0
    && !chosePreferredRule
    && !hidGap
    && !authorizedAgainstGap;
  return freeze({
    accepted,
    forbidden_fields: freeze(forbidden_fields),
    chose_preferred_tight_rule: chosePreferredRule,
    hid_irreducible_gap: hidGap,
    authorized_exact_descent_against_nonempty_gap: authorizedAgainstGap,
    scar: 'FADT_DESCENT_AUTHORITY != SEMANTIC_OR_ENCODER_AUTHORITY',
  });
}

export function fadtBenchConstitutionalInheritanceCertificate(scene) {
  assertBench(scene);
  const global = auditHolonomyLoomGlobalSummaryDescent(scene);
  const local = auditRouteLocalDisplayCompression();
  const overreach = rejectFadtConstitutionalOverreach(global);
  const passed =
    global.status === 'HELD_BY_FADT_IRREDUCIBLE_GAP'
    && global.irreducible_gap_cardinality === 4
    && same(global.largest_universally_sound_support, ['LOCAL_RESULT'])
    && local.status === 'EXACT_FADT_DESCENT_AUTHORIZED'
    && local.exact_descended_claim_support_authorized === true
    && local.occupied_fibers?.[0]?.irreducible_gap_cardinality === 0
    && overreach.accepted === true;
  return freeze({
    schema: FADT_HOLO_LOOM_CONSTITUTIONAL_MEMBRANE_SCHEMA,
    fadt_receipt: FADT_RECEIPT,
    bench_receipt: HOLO_LOOM_RESEARCH_BENCH_RECEIPT,
    fadt_is_explicit_provenance_dependency: true,
    method_used_downstream_without_pin_closed_here: true,
    global_summary_hold: global,
    local_positive_control: local,
    overreach_certificate: overreach,
    no_retroactive_scientific_promotion: true,
    passed,
    classification: passed
      ? 'FADT_EXPLICITLY_GOVERNS_FINITE_CLAIM_SUPPORT_DESCENT_AT_THE_WITNESSED_HOLONOMY_LOOM_RESEARCH_BENCH_BOUNDARY_WITH_NONCONSTANT_STRATUM_SUPPORTS_FORCING_VISIBLE_HOLDS_AND_ZERO_SEMANTIC_OR_SCIENTIFIC_AUTHORITY_WIDENING'
      : 'FADT_HOLONOMY_LOOM_CONSTITUTIONAL_INHERITANCE_NOT_ESTABLISHED',
  });
}
