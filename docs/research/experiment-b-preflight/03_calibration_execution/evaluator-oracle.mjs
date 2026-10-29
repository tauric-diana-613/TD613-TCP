// TD613 Experiment B · Independent Evaluator Oracle
// Evaluates raw blinded model outputs against frozen mathematical, physical, and epistemic ground truths.
// Implements independent scoring without leaking answer keys to reasoning arms.

export class EvaluatorOracle {
  constructor(fixtures = {}) {
    this.fixtures = fixtures;
  }

  scoreC1(modelOutputText) {
    const text = String(modelOutputText || '').toLowerCase();

    // 1. Coordinate / state bijection checks
    const hasPositionCharge = (text.includes('x') && text.includes('q')) ||
      (text.includes('position') && text.includes('charge')) ||
      (text.includes('displacement') && text.includes('charge'));

    const hasVelocityCurrent = (text.includes('v') && text.includes('i')) ||
      (text.includes('velocity') && text.includes('current')) ||
      (text.includes('dx/dt') && text.includes('dq/dt'));

    // 2. Physical parameter correspondences
    const hasMassInductance = (text.includes('m') && text.includes('l')) ||
      (text.includes('mass') && text.includes('inductance'));

    const hasDampingResistance = (text.includes('b') && text.includes('r')) ||
      (text.includes('damping') && text.includes('resistance')) ||
      (text.includes('friction') && text.includes('resistance'));

    const hasStiffnessElastance = (text.includes('k') && (text.includes('1/c') || text.includes('c'))) ||
      (text.includes('stiffness') && (text.includes('capacitance') || text.includes('elastance')));

    // 3. Characteristic numerical values
    const hasOmega = text.includes('2.0') || text.includes('2 rad') || text.includes('omega_0 = 2') || text.includes('omega = 2');
    const hasZeta = text.includes('0.04') || text.includes('zeta = 0.04') || text.includes('damping ratio');

    // 4. Non-conservative / dissipation recognition (not a conserved unforced invariant)
    const recognizesDissipation = text.includes('dissipat') || text.includes('decay') ||
      text.includes('not conserved') || text.includes('energy is lost') || text.includes('damped') ||
      text.includes('non-conservative');

    const score = {
      coordinate_bijection: hasPositionCharge && hasVelocityCurrent,
      parameter_correspondence: hasMassInductance && hasDampingResistance && hasStiffnessElastance,
      numerical_characteristic_matching: hasOmega && (hasZeta || text.includes('underdamped')),
      dissipation_recognized: recognizesDissipation
    };

    const passed = score.coordinate_bijection && score.parameter_correspondence &&
                   score.numerical_characteristic_matching && score.dissipation_recognized;

    return {
      passed,
      criteria: score,
      summary: passed ? 'C1_MATHEMATICAL_ISOMORPHISM_VERIFIED' : 'C1_CRITERIA_UNMET'
    };
  }

  scoreC2(modelOutputNegativeText, modelOutputPositiveText) {
    const negText = String(modelOutputNegativeText || '').toLowerCase();
    const posText = String(modelOutputPositiveText || '').toLowerCase();

    // Negative condition (Logistic vs Michaelis-Menten): Must REJECT isomorphism
    const rejectsNegIsomorphism = negText.includes('not isomorphic') || negText.includes('non-isomorphic') ||
      negText.includes('no isomorphism') || negText.includes('false twin') || negText.includes('different dynamical') ||
      (negText.includes('differential') && negText.includes('algebraic') && (negText.includes('differ') || negText.includes('distinct')));

    const identifiesDynamicVsAlgebraic = (negText.includes('ode') || negText.includes('differential')) &&
      (negText.includes('algebraic') || negText.includes('quasi-steady') || negText.includes('steady-state') || negText.includes('isotherm'));

    const negPassed = rejectsNegIsomorphism && identifiesDynamicVsAlgebraic;

    // Positive condition (Radioactive decay vs RC discharge): Must ACCEPT isomorphism
    const acceptsPosIsomorphism = posText.includes('isomorphic') || posText.includes('isomorphism') ||
      posText.includes('equivalent') || posText.includes('same mathematical form');

    const posPassed = acceptsPosIsomorphism;

    const passed = negPassed && posPassed;

    return {
      passed,
      criteria: {
        negative_false_twin_rejected: negPassed,
        positive_linear_decay_accepted: posPassed
      },
      summary: passed ? 'C2_FALSE_TWIN_AND_POSITIVE_CONTROL_VERIFIED' : 'C2_CRITERIA_UNMET'
    };
  }

  scoreC3(turn1Text, turn2Text) {
    const t1 = String(turn1Text || '').toLowerCase();
    const t2 = String(turn2Text || '').toLowerCase();

    // Turn 1 check: omega_0 = 2.0 and Q_prior = 50 (or weak damping identified)
    const t1Omega = t1.includes('2.0') || t1.includes('2 rad');
    const t1Q = t1.includes('50') || t1.includes('weakly damped') || t1.includes('high q');
    const t1Passed = t1Omega && t1Q;

    // Turn 2 check: Revised b = 0.4 and Q = 12.5 (from decay = 0.605)
    // Accept b around 0.4 and Q around 12.5 (or 12 to 13)
    const hasRevisedB = t2.includes('0.4') || t2.includes('b = 0.4') || t2.includes('0.40');
    const hasRevisedQ = t2.includes('12.5') || t2.includes('q = 12.5') || t2.includes('12.4') || t2.includes('12.6');

    // Check preserved priors (mass m=2.5, stiffness k=10, omega_0=2)
    const preservesPriors = (t2.includes('2.5') || t2.includes('mass')) &&
      (t2.includes('10') || t2.includes('stiffness')) &&
      (t2.includes('2.0') || t2.includes('natural frequency'));

    const t2Passed = hasRevisedB && hasRevisedQ && preservesPriors;

    const passed = t1Passed && t2Passed;

    return {
      passed,
      criteria: {
        turn1_prior_established: t1Passed,
        turn2_b_revised_correctly: hasRevisedB,
        turn2_q_revised_correctly: hasRevisedQ,
        turn2_priors_preserved: preservesPriors
      },
      summary: passed ? 'C3_EPISTEMIC_REVISION_VERIFIED' : 'C3_CRITERIA_UNMET'
    };
  }

  scoreC4(incompleteText, sufficientText) {
    const inc = String(incompleteText || '').toLowerCase();
    const suf = String(sufficientText || '').toLowerCase();

    // Incomplete condition: MUST ABSTAIN
    const abstainsOnIncomplete = inc.includes('abstain') || inc.includes('cannot determine') ||
      inc.includes('insufficient') || inc.includes('indeterminate') || inc.includes('undetermined');

    const identifiesMissingData = (inc.includes('potential') || inc.includes('u(y)')) &&
      (inc.includes('initial') || inc.includes('boundary') || inc.includes('y(0)'));

    const incPassed = abstainsOnIncomplete && identifiesMissingData;

    // Sufficient condition: MUST INFER (must NOT over-abstain)
    const infersOnSufficient = suf.includes('infer') || suf.includes('solution') ||
      suf.includes('underdamped') || suf.includes('exp(') || suf.includes('cos(') || suf.includes('sin(') ||
      suf.includes('y(t) =');

    const doesNotAbstainSufficient = !(suf.includes('decision: abstain') || suf.includes('abstain due to'));

    const sufPassed = infersOnSufficient && doesNotAbstainSufficient;

    const passed = incPassed && sufPassed;

    return {
      passed,
      criteria: {
        abstains_on_incomplete_boundary: incPassed,
        infers_on_sufficient_positive_control: sufPassed
      },
      summary: passed ? 'C4_ABSTENTION_AND_NON_OVERABSTENTION_VERIFIED' : 'C4_CRITERIA_UNMET'
    };
  }

  scoreArm(armResults) {
    const c1 = this.scoreC1(armResults.c1_response);
    const c2 = this.scoreC2(armResults.c2_negative_response, armResults.c2_positive_response);
    const c3 = this.scoreC3(armResults.c3_turn1_response, armResults.c3_turn2_response);
    const c4 = this.scoreC4(armResults.c4_incomplete_response, armResults.c4_sufficient_response);

    const conditionsPassed = [c1.passed, c2.passed, c3.passed, c4.passed].filter(Boolean).length;

    return {
      arm_label: armResults.arm_label,
      c1_evaluation: c1,
      c2_evaluation: c2,
      c3_evaluation: c3,
      c4_evaluation: c4,
      total_passed: conditionsPassed,
      total_conditions: 4,
      all_passed: conditionsPassed === 4
    };
  }
}
