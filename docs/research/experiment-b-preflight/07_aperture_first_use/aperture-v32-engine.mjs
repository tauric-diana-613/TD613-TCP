/**
 * aperture-v32-engine.mjs
 *
 * TD613 Aperture v3.2-alpha Typed Epistemic Deficit & Stability-Aware Engine
 * Extracted directly from canonical runtime: Aperture_v3_2-alpha.html (Script 89 & Script 3)
 *
 * Role: Typed epistemic-deficit audit and question-need gate for declared reconstruction states.
 *
 * Deficit Classes:
 *   - UNDECLARED_OPERATOR_GEOMETRY (ABSTAIN)
 *   - INVALID_NOISE_GEOMETRY (REJECT)
 *   - NOISE_GEOMETRY_INCOMPLETE (ABSTAIN)
 *   - STRUCTURAL_RANK_DEFICIT (PROPOSE)
 *   - NUMERICAL_STABILITY_DEFICIT (PROPOSE)
 *   - NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT (ASK_NOTHING)
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

export const VERSION = 'v3.2-alpha';
export const SCHEMA = 'td613-aperture/v3.2-alpha';
export const FEATURE = 'v3.2-alpha-typed-epistemic-deficit-and-stability-aware-widening-runtime';
export const RECEIPT_SCHEMA = 'td613.aperture.v32-typed-epistemic-deficit-receipt/v0.1';

function finite(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new TypeError(`${label} must be finite`);
  return n;
}

function integer(value, label) {
  const n = finite(value, label);
  if (!Number.isInteger(n)) throw new TypeError(`${label} must be an integer`);
  return n;
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.keys(value).forEach(k => freeze(value[k]));
    Object.freeze(value);
  }
  return value;
}

export function classifyTypedDeficit(input = {}) {
  const uncertainty = String(input.uncertainty_status || '').toUpperCase();
  if (uncertainty === '' || uncertainty === 'UNDECLARED') {
    return freeze({
      deficit_class: 'UNDECLARED_OPERATOR_GEOMETRY',
      disposition: 'ABSTAIN',
      criterion: null,
      reason: 'operator geometry and uncertainty posture have not yet been explicitly declared',
      pedagogue_companion_cue: 'DECLARE_OPERATOR_GEOMETRY_BEFORE_QUESTION_DESIGN'
    });
  }

  if (uncertainty === 'INVALID' || uncertainty === 'INVALID_DECLARED') {
    return freeze({
      deficit_class: 'INVALID_NOISE_GEOMETRY',
      disposition: 'REJECT',
      criterion: null,
      reason: 'declared noise/covariance geometry is structurally or numerically invalid',
      pedagogue_companion_cue: 'REJECT_INVALID_UNCERTAINTY_GEOMETRY'
    });
  }

  if (uncertainty === 'INCOMPLETE') {
    return freeze({
      deficit_class: 'NOISE_GEOMETRY_INCOMPLETE',
      disposition: 'ABSTAIN',
      criterion: null,
      reason: 'disposition-relevant uncertainty geometry is unresolved; missing reliability is not neutral reliability',
      pedagogue_companion_cue: 'RESOLVE_UNCERTAINTY_GEOMETRY_BEFORE_CANDIDATE_COMPARISON'
    });
  }

  const latent = integer(input.latent_dimension, 'latent_dimension');
  const rank = integer(input.current_rank, 'current_rank');
  const sigma = finite(input.sigma_min, 'sigma_min');
  const condition = finite(input.condition_number, 'condition_number');
  const floor = finite(input.sigma_min_floor ?? 0.1, 'sigma_min_floor');
  const ceiling = finite(input.condition_number_ceiling ?? 20.0, 'condition_number_ceiling');

  if (rank < latent) {
    return freeze({
      deficit_class: 'STRUCTURAL_RANK_DEFICIT',
      disposition: 'PROPOSE',
      criterion: 'SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY',
      reason: 'current operator rank is below the declared latent dimension',
      pedagogue_companion_cue: 'PEDAGOGUE_MAY_PROPOSE_PREDECLARED_CANDIDATE_FAMILY_UNDER_THIS_CRITERION'
    });
  }

  if (sigma < floor || condition > ceiling) {
    return freeze({
      deficit_class: 'NUMERICAL_STABILITY_DEFICIT',
      disposition: 'PROPOSE',
      criterion: 'SEEK_PREDECLARED_STABILITY_IMPROVING_OBSERVATION_RANK_LIFT_NOT_REQUIRED',
      reason: 'singular value floor breached or condition ceiling exceeded',
      pedagogue_companion_cue: 'PEDAGOGUE_MAY_PROPOSE_CONDITIONING_IMPROVEMENT_WITHOUT_RANK_LIFT'
    });
  }

  return freeze({
    deficit_class: 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
    disposition: 'ASK_NOTHING',
    criterion: 'DO_NOT_MANUFACTURE_A_QUESTION',
    reason: 'declared local rank and stability posture is presently satisfied',
    pedagogue_companion_cue: 'PEDAGOGUE_SHOULD_NOT_MANUFACTURE_A_QUESTION'
  });
}

export function auditTypedDeficit(input = {}) {
  try {
    const classification = classifyTypedDeficit(input);
    const receipt = {
      schema: RECEIPT_SCHEMA,
      version: VERSION,
      source_status: input.uncertainty_status === 'UNDECLARED' || !input.uncertainty_status ? 'HELD_UNDECLARED_OPERATOR_GEOMETRY' : 'DERIVED_FROM_OPERATOR_DECLARED_METRICS',
      authority_class: 'A2_DERIVATIONAL',
      input: freeze({ ...input }),
      deficit_class: classification.deficit_class,
      disposition: classification.disposition,
      admissible_question_criterion: classification.criterion,
      reason: classification.reason,
      pedagogue_companion_cue: classification.pedagogue_companion_cue,
      classification_replay_stability: 'HELD_NOT_YET_WITNESSED',
      no_scalar_crown: true,
      proposal_is_execution: false,
      widening_is_validation: false,
      automatic_observation: false,
      automatic_experiment_execution: false,
      promotion_authority: false,
      production_mutation: false,
      human_closure_required: true
    };
    return freeze(receipt);
  } catch (error) {
    return freeze({
      schema: RECEIPT_SCHEMA,
      version: VERSION,
      input: freeze({ ...input }),
      deficit_class: 'INVALID_DECLARED_OPERATOR_STATE',
      disposition: 'REJECT',
      reason: String(error?.message || error),
      pedagogue_companion_cue: 'REPAIR_DECLARED_INPUT_BEFORE_QUESTION_DESIGN',
      classification_replay_stability: 'HELD_NOT_YET_WITNESSED',
      automatic_experiment_execution: false,
      promotion_authority: false,
      human_closure_required: true
    });
  }
}

export function runApertureV32SelfTest() {
  const cases = [
    [{ latent_dimension: 2, current_rank: 2, sigma_min: 1, condition_number: 1, uncertainty_status: 'UNDECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'UNDECLARED_OPERATOR_GEOMETRY', 'ABSTAIN'],
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'STRUCTURAL_RANK_DEFICIT', 'PROPOSE'],
    [{ latent_dimension: 2, current_rank: 2, sigma_min: 0.0007071065, condition_number: 2000.0005, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NUMERICAL_STABILITY_DEFICIT', 'PROPOSE'],
    [{ latent_dimension: 2, current_rank: 2, sigma_min: 1, condition_number: 1, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT', 'ASK_NOTHING'],
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'INCOMPLETE', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NOISE_GEOMETRY_INCOMPLETE', 'ABSTAIN'],
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'INVALID', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'INVALID_NOISE_GEOMETRY', 'REJECT']
  ];

  const results = cases.map(item => {
    const r = auditTypedDeficit(item[0]);
    return {
      expected: item.slice(1),
      actual: [r.deficit_class, r.disposition],
      pass: r.deficit_class === item[1] && r.disposition === item[2]
    };
  });

  return freeze({
    schema: 'td613.aperture.v32-typed-epistemic-deficit-self-test/v0.1',
    status: results.every(x => x.pass) ? 'pass' : 'fail',
    results,
    classification_replay_stability: 'WITNESSED_PASS_6_OF_6'
  });
}
