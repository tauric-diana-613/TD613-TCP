// TD613 Experiment B · Independent Evaluator Oracle (v1.1 Robust Scorer)
// Evaluates blinded model outputs against frozen mathematical, physical, and epistemic ground truths.
// Normalizes LaTeX math, Greek unicode, and Markdown formatting before applying semantic and numerical checks.
// Fully handles adversarial counterexamples: formatting variations, wrong values, missing values, and spurious claims.

export function normalizeMathText(raw = '') {
  return String(raw || '')
    .replace(/\\approx/gi, '=')
    .replace(/≈/g, '=')
    .replace(/\\sim/gi, '=')
    .replace(/\\leftrightarrow/gi, '<->')
    .replace(/\\rightarrow/gi, '->')
    .replace(/\\to/gi, '->')
    .replace(/↔/g, '<->')
    .replace(/→/g, '->')
    .replace(/\\frac\{1\}\{c\}/gi, '1/c')
    .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/gi, '$1/$2')
    .replace(/\\omega_?0?/gi, 'omega_0')
    .replace(/\\zeta/gi, 'zeta')
    .replace(/\\lambda/gi, 'lambda')
    .replace(/\\gamma/gi, 'gamma')
    .replace(/ω₀/g, 'omega_0')
    .replace(/ω/g, 'omega')
    .replace(/ζ/g, 'zeta')
    .replace(/[\$\*]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export class EvaluatorOracle {
  constructor(fixtures = {}) {
    this.fixtures = fixtures;
  }

  scoreC1(modelOutputText) {
    const raw = String(modelOutputText || '');
    const norm = normalizeMathText(raw);

    // 1. Coordinate / state bijection checks
    const hasPositionCharge = (
      (norm.includes('x') && norm.includes('q')) ||
      (norm.includes('position') && norm.includes('charge')) ||
      (norm.includes('displacement') && norm.includes('charge'))
    ) && (norm.includes('x <-> q') || norm.includes('x ↔ q') || norm.includes('x to q') || norm.includes('coordinate'));

    const hasVelocityCurrent = (
      (norm.includes('v') && norm.includes('i')) ||
      (norm.includes('velocity') && norm.includes('current')) ||
      (norm.includes('dx/dt') && norm.includes('dq/dt'))
    ) && (norm.includes('v <-> i') || norm.includes('v ↔ i') || norm.includes('velocity') || norm.includes('dx/dt'));

    // 2. Physical parameter correspondences
    const hasMassInductance = (norm.includes('m') && norm.includes('l')) &&
      (norm.includes('mass') || norm.includes('inductance') || norm.includes('m <-> l') || norm.includes('m ↔ l'));

    const hasDampingResistance = (norm.includes('b') && norm.includes('r')) &&
      (norm.includes('damping') || norm.includes('resistance') || norm.includes('friction') || norm.includes('b <-> r') || norm.includes('b ↔ r'));

    const hasStiffnessElastance = (norm.includes('k') && (norm.includes('1/c') || norm.includes('c'))) &&
      (norm.includes('stiff') || norm.includes('capacit') || norm.includes('restor') || norm.includes('elastance') || norm.includes('k <-> 1/c'));

    // 3. Characteristic numerical values: omega_0 = 2 rad/s, zeta = 0.04
    // Natural frequency matching (accepts: omega_0 = 2, omega_0: 2, 2 rad/s, 2.0 rad/s)
    const hasOmega = (
      /natural frequency\s*(?:\(omega_0\))?\s*(?:=|:)\s*2(?:\.0+)?\s*rad/i.test(norm) ||
      /omega_0\s*(?:=|:)\s*2(?:\.0+)?\s*rad/i.test(norm) ||
      /\b2(?:\.0+)?\s*rad(?:\^2)?\/s\b/i.test(norm) ||
      (/omega_0\^2\s*=\s*4/i.test(norm) && /\b2(?:\.0+)?\s*rad/i.test(norm))
    );

    // Reject wrong omega values (e.g., if model says omega_0 = 5 or omega_0 = 10)
    const hasWrongOmega = /natural frequency.*?[:=]\s*(?:[3-9]|[1-9]\d+)/i.test(norm) ||
                          /omega_0\s*[:=]\s*(?:[3-9]|[1-9]\d+)/i.test(norm);

    // Damping ratio matching (accepts: zeta = 0.04, zeta: 0.04, 0.04)
    const hasZeta = (
      /damping ratio\s*(?:\(zeta\))?\s*(?:=|:)\s*0\.04\b/i.test(norm) ||
      /zeta\s*(?:=|:)\s*0\.04\b/i.test(norm) ||
      /\bzeta\s*=\s*0\.04\b/i.test(norm)
    );

    const hasWrongZeta = /damping ratio.*?[:=]\s*0\.(?:[1-9]|0[1-35-9])/i.test(norm);

    const numericalMatched = hasOmega && hasZeta && !hasWrongOmega && !hasWrongZeta;

    // 4. Non-conservative / dissipation recognition
    const mentionsDissipation = norm.includes('dissipat') || norm.includes('decay') ||
      norm.includes('not conserved') || norm.includes('energy is lost') || norm.includes('damped') ||
      norm.includes('loss of energy');

    // Reject incorrect claim that total energy is strictly conserved in unforced state
    const claimsFalseConservation = (norm.includes('energy is conserved') || norm.includes('total energy is conserved') || norm.includes('strictly conserved')) &&
      !norm.includes('not conserved') && !norm.includes('dissipated');

    const dissipationRecognized = mentionsDissipation && !claimsFalseConservation;

    const score = {
      coordinate_bijection: Boolean(hasPositionCharge && hasVelocityCurrent),
      parameter_correspondence: Boolean(hasMassInductance && hasDampingResistance && hasStiffnessElastance),
      numerical_characteristic_matching: Boolean(numericalMatched),
      dissipation_recognized: Boolean(dissipationRecognized)
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
    const negNorm = normalizeMathText(modelOutputNegativeText);
    const posNorm = normalizeMathText(modelOutputPositiveText);

    // Negative condition (Logistic vs Michaelis-Menten): Must REJECT isomorphism
    const rejectsNegIsomorphism = negNorm.includes('not isomorphic') || negNorm.includes('non-isomorphic') ||
      negNorm.includes('no isomorphism') || negNorm.includes('false twin') || negNorm.includes('different dynamical') ||
      negNorm.includes('not mathematically isomorphic') || negNorm.includes('not dynamically isomorphic') ||
      (negNorm.includes('differential') && negNorm.includes('algebraic') && (negNorm.includes('differ') || negNorm.includes('distinct')));

    const identifiesDynamicVsAlgebraic = (negNorm.includes('ode') || negNorm.includes('differential')) &&
      (negNorm.includes('algebraic') || negNorm.includes('quasi-steady') || negNorm.includes('steady-state') || negNorm.includes('isotherm') || negNorm.includes('hyperbol'));

    const negPassed = rejectsNegIsomorphism && identifiesDynamicVsAlgebraic;

    // Positive condition (Radioactive decay vs RC discharge): Must ACCEPT isomorphism
    const acceptsPosIsomorphism = (posNorm.includes('isomorphic') || posNorm.includes('isomorphism') ||
      posNorm.includes('equivalent') || posNorm.includes('same mathematical form')) &&
      !posNorm.includes('not isomorphic') && !posNorm.includes('non-isomorphic');

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
    const t1Norm = normalizeMathText(turn1Text);
    const t2Norm = normalizeMathText(turn2Text);

    // Turn 1 check: omega_0 = 2.0 and Q_prior = 50 (or weak damping identified)
    const t1Omega = t1Norm.includes('2.0') || t1Norm.includes('2 rad') || /omega_0\s*[:=]\s*2/i.test(t1Norm);
    const t1Q = t1Norm.includes('50') || t1Norm.includes('weakly damped') || t1Norm.includes('high q');
    const t1Passed = t1Omega && t1Q;

    // Turn 2 check: Revised b = 0.4 and Q = 12.5 (from decay = 0.605)
    const hasRevisedB = (
      /b\s*[:=]\s*0\.4(?:\d+)?\b/i.test(t2Norm) ||
      /\b0\.4(?:0+)?\s*n\*?s\/m/i.test(t2Norm) ||
      t2Norm.includes('b = 0.4') ||
      t2Norm.includes('0.40')
    );

    const hasRevisedQ = (
      /q(?:_\{?revised\}?)?\s*[:=]\s*12\.5(?:\d+)?\b/i.test(t2Norm) ||
      /\b12\.5(?:\d+)?\b/i.test(t2Norm) ||
      t2Norm.includes('12.5') ||
      t2Norm.includes('12.4') ||
      t2Norm.includes('12.6')
    );

    // Check preserved priors (mass m=2.5, stiffness k=10, omega_0=2)
    const preservesPriors = (t2Norm.includes('2.5') || t2Norm.includes('mass')) &&
      (t2Norm.includes('10') || t2Norm.includes('stiffness')) &&
      (t2Norm.includes('2.0') || t2Norm.includes('omega_0') || t2Norm.includes('natural frequency'));

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
    const incNorm = normalizeMathText(incompleteText);
    const sufNorm = normalizeMathText(sufficientText);

    // Incomplete condition: MUST ABSTAIN
    const abstainsOnIncomplete = incNorm.includes('abstain') || incNorm.includes('cannot determine') ||
      incNorm.includes('insufficient') || incNorm.includes('indeterminate') || incNorm.includes('undetermined');

    const identifiesMissingData = (incNorm.includes('potential') || incNorm.includes('u(y)')) &&
      (incNorm.includes('initial') || incNorm.includes('boundary') || incNorm.includes('y(0)'));

    const incPassed = abstainsOnIncomplete && identifiesMissingData;

    // Sufficient condition: MUST INFER (must NOT over-abstain)
    const infersOnSufficient = sufNorm.includes('infer') || sufNorm.includes('solution') ||
      sufNorm.includes('underdamped') || sufNorm.includes('exp(') || sufNorm.includes('cos(') || sufNorm.includes('sin(') ||
      sufNorm.includes('y(t) =');

    const doesNotAbstainSufficient = !(sufNorm.includes('decision: abstain') || sufNorm.includes('abstain due to'));

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
    // Blinded scoring: only anonymous arm_label is retained
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
