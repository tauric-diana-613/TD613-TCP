export const APERTURE_V32_VERSION = 'v3.2-alpha';
export const APERTURE_V32_SCHEMA = 'td613-aperture/v3.2-alpha';
export const APERTURE_V32_TYPED_DEFICIT_SCHEMA =
  'td613.aperture.v32-typed-epistemic-deficit/v0.1';
export const APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA =
  'td613.aperture.v32-typed-epistemic-deficit-receipt/v0.1';
export const APERTURE_V32_REPLAY_STABILITY = 'HELD_NOT_YET_WITNESSED';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function integer(value, label) {
  const number = finite(value, label);
  if (!Number.isInteger(number)) throw new TypeError(`${label} must be an integer`);
  return number;
}

export function classifyTypedEpistemicDeficit(input = {}) {
  const latentDimension = integer(input.latent_dimension, 'latent_dimension');
  const currentRank = integer(input.current_rank, 'current_rank');
  const sigmaMin = finite(input.sigma_min, 'sigma_min');
  const conditionNumber = finite(input.condition_number, 'condition_number');
  const sigmaMinFloor = finite(input.sigma_min_floor, 'sigma_min_floor');
  const conditionNumberCeiling = finite(
    input.condition_number_ceiling,
    'condition_number_ceiling'
  );
  const uncertaintyStatus = String(input.uncertainty_status || '').toUpperCase();

  if (
    latentDimension < 1 ||
    currentRank < 0 ||
    currentRank > latentDimension ||
    sigmaMin < 0 ||
    conditionNumber < 1 ||
    sigmaMinFloor < 0 ||
    conditionNumberCeiling < 1
  ) {
    return deepFreeze({
      deficit_class: 'INVALID_DECLARED_OPERATOR_STATE',
      disposition: 'REJECT',
      criterion: null,
      reason: 'declared rank/dimension/stability metrics violate the local audit contract'
    });
  }

  if (uncertaintyStatus === 'INVALID') {
    return deepFreeze({
      deficit_class: 'INVALID_NOISE_GEOMETRY',
      disposition: 'REJECT',
      criterion: null,
      reason: 'declared uncertainty geometry is invalid and must not be silently repaired'
    });
  }

  if (uncertaintyStatus !== 'VALID_DECLARED') {
    return deepFreeze({
      deficit_class: 'NOISE_GEOMETRY_INCOMPLETE',
      disposition: 'ABSTAIN',
      criterion: null,
      reason: uncertaintyStatus === 'INCOMPLETE'
        ? 'disposition-relevant uncertainty geometry is unresolved; missing reliability is not neutral reliability'
        : 'uncertainty geometry has not been declared valid'
    });
  }

  if (currentRank < latentDimension) {
    return deepFreeze({
      deficit_class: 'STRUCTURAL_RANK_DEFICIT',
      disposition: 'PROPOSE',
      criterion: 'SEEK_PREDECLARED_NULLSPACE_CONTRACTING_OBSERVATION_THEN_AUDIT_STABILITY',
      reason: 'current operator rank is below the declared latent dimension'
    });
  }

  if (sigmaMin < sigmaMinFloor || conditionNumber > conditionNumberCeiling) {
    return deepFreeze({
      deficit_class: 'NUMERICAL_STABILITY_DEFICIT',
      disposition: 'PROPOSE',
      criterion: 'SEEK_PREDECLARED_STABILIZING_OBSERVATION_WITHOUT_REQUIRING_RANK_LIFT',
      reason: 'operator is full rank but fails the declared local stability posture'
    });
  }

  return deepFreeze({
    deficit_class: 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
    disposition: 'ASK_NOTHING',
    criterion: 'DO_NOT_MANUFACTURE_A_QUESTION',
    reason: 'declared local rank and stability posture is presently satisfied'
  });
}

function pedagogueCue(disposition) {
  if (disposition === 'PROPOSE') {
    return 'PEDAGOGUE_MAY_PROPOSE_PREDECLARED_CANDIDATE_FAMILY_UNDER_THIS_CRITERION';
  }
  if (disposition === 'ASK_NOTHING') return 'PEDAGOGUE_SHOULD_NOT_MANUFACTURE_A_QUESTION';
  if (disposition === 'ABSTAIN') return 'RESOLVE_UNCERTAINTY_GEOMETRY_BEFORE_CANDIDATE_COMPARISON';
  return 'REPAIR_OR_REJECT_DECLARED_GEOMETRY_BEFORE_RANKING';
}

export function auditTypedEpistemicDeficit(input = {}) {
  const classification = classifyTypedEpistemicDeficit(input);
  return deepFreeze({
    schema: APERTURE_V32_TYPED_DEFICIT_RECEIPT_SCHEMA,
    version: APERTURE_V32_VERSION,
    source_status: 'DERIVED_FROM_OPERATOR_DECLARED_METRICS',
    authority_class: 'A2_DERIVATIONAL',
    input: {
      latent_dimension: Number(input.latent_dimension),
      current_rank: Number(input.current_rank),
      sigma_min: Number(input.sigma_min),
      condition_number: Number(input.condition_number),
      uncertainty_status: String(input.uncertainty_status),
      sigma_min_floor: Number(input.sigma_min_floor),
      condition_number_ceiling: Number(input.condition_number_ceiling),
      threshold_authority: String(input.threshold_authority || 'OPERATOR_DECLARED_LOCAL')
    },
    deficit_class: classification.deficit_class,
    disposition: classification.disposition,
    admissible_question_criterion: classification.criterion,
    reason: classification.reason,
    pedagogue_companion_cue: pedagogueCue(classification.disposition),
    classification_replay_stability: APERTURE_V32_REPLAY_STABILITY,
    no_scalar_crown: true,
    proposal_is_execution: false,
    widening_is_validation: false,
    automatic_observation: false,
    automatic_experiment_execution: false,
    promotion_authority: false,
    production_mutation: false,
    human_closure_required: true
  });
}

export function selfTestTypedEpistemicDeficit() {
  const fixtures = [
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'STRUCTURAL_RANK_DEFICIT', 'PROPOSE'],
    [{ latent_dimension: 2, current_rank: 2, sigma_min: 0.0007071065, condition_number: 2000.0005, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NUMERICAL_STABILITY_DEFICIT', 'PROPOSE'],
    [{ latent_dimension: 2, current_rank: 2, sigma_min: 1, condition_number: 1, uncertainty_status: 'VALID_DECLARED', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT', 'ASK_NOTHING'],
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'INCOMPLETE', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'NOISE_GEOMETRY_INCOMPLETE', 'ABSTAIN'],
    [{ latent_dimension: 2, current_rank: 1, sigma_min: 0, condition_number: 2000, uncertainty_status: 'INVALID', sigma_min_floor: 0.25, condition_number_ceiling: 10 }, 'INVALID_NOISE_GEOMETRY', 'REJECT']
  ];
  const results = fixtures.map(([input, expectedClass, expectedDisposition]) => {
    const receipt = auditTypedEpistemicDeficit(input);
    return deepFreeze({
      expected: [expectedClass, expectedDisposition],
      actual: [receipt.deficit_class, receipt.disposition],
      pass: receipt.deficit_class === expectedClass && receipt.disposition === expectedDisposition
    });
  });
  return deepFreeze({
    schema: 'td613.aperture.v32-typed-epistemic-deficit-self-test/v0.1',
    status: results.every(result => result.pass) ? 'pass' : 'fail',
    results,
    classification_replay_stability: APERTURE_V32_REPLAY_STABILITY
  });
}
