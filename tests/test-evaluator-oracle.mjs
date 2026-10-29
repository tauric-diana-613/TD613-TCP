// TD613 Experiment B · Evaluator Oracle Unit Test Suite
// Verifies mathematically equivalent formatting, missing numerical values,
// incorrect values, negated statements, and misleading keyword matches.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EvaluatorOracle, normalizeMathText } from '../docs/research/experiment-b-preflight/03_calibration_execution/evaluator-oracle.mjs';

console.log('=== RUNNING EVALUATOR ORACLE UNIT TESTS ===');

const oracle = new EvaluatorOracle();

// --- TEST 1: Frozen Arm 2A Live Trace (LaTeX Formatting) ---
const traces2A = JSON.parse(fs.readFileSync('docs/research/experiment-b-preflight/03_calibration_execution/traces/live_arm2a_traces.json', 'utf8'));
const c1Trace2A = traces2A.find(t => t.episode_id.includes('C1') && t.episode_id.includes('AtlasFADT'));
const res1 = oracle.scoreC1(c1Trace2A.raw_response);
assert.equal(res1.passed, true, 'Frozen Arm 2A C1 response with LaTeX must pass');
assert.equal(res1.criteria.numerical_characteristic_matching, true, 'Omega_0 and Zeta must be matched in Arm 2A LaTeX');
console.log('✓ Test 1 Passed: Frozen Arm 2A C1 trace verified.');

// --- TEST 2: Frozen Arm 2B Live Trace (Plain Text Formatting) ---
const traces2B = JSON.parse(fs.readFileSync('docs/research/experiment-b-preflight/03_calibration_execution/traces/live_arm2b_traces.json', 'utf8'));
const c1Trace2B = traces2B.find(t => t.episode_id.includes('C1'));
const res2 = oracle.scoreC1(c1Trace2B.raw_response);
assert.equal(res2.passed, true, 'Frozen Arm 2B C1 response must pass');
console.log('✓ Test 2 Passed: Frozen Arm 2B C1 trace verified.');

// --- TEST 3: Unicode Greek Letters ---
const unicodeOutput = `
The isomorphism maps coordinate x ↔ q and velocity v ↔ i.
Parameters: mass m ↔ inductance L, damping b ↔ resistance R, stiffness k ↔ 1/C.
Natural frequency ω₀ = 2 rad/s.
Damping ratio ζ = 0.04 (underdamped regime).
Total stored energy is dissipated over time via ohmic/viscous losses (dE/dt < 0).
`;
const res3 = oracle.scoreC1(unicodeOutput);
assert.equal(res3.passed, true, 'Unicode Greek notation must pass');
console.log('✓ Test 3 Passed: Unicode Greek notation verified.');

// --- TEST 4: Missing Numerical Value (Omits Omega) ---
const missingOmegaOutput = `
The isomorphism maps coordinate x <-> q and velocity v <-> i.
Parameters: m <-> L, b <-> R, k <-> 1/C.
Damping ratio zeta = 0.04.
Total energy is dissipated over time.
`;
const res4 = oracle.scoreC1(missingOmegaOutput);
assert.equal(res4.passed, false, 'Missing natural frequency must fail');
assert.equal(res4.criteria.numerical_characteristic_matching, false);
console.log('✓ Test 4 Passed: Missing numerical value correctly failed.');

// --- TEST 5: Incorrect Numerical Value (Omega = 5 rad/s) ---
const wrongOmegaOutput = `
The isomorphism maps coordinate x <-> q and velocity v <-> i.
Parameters: m <-> L, b <-> R, k <-> 1/C.
Natural Frequency: 5.0 rad/s.
Damping ratio zeta = 0.04.
Total energy is dissipated.
`;
const res5 = oracle.scoreC1(wrongOmegaOutput);
assert.equal(res5.passed, false, 'Incorrect omega_0 value (5.0 instead of 2.0) must fail');
assert.equal(res5.criteria.numerical_characteristic_matching, false);
console.log('✓ Test 5 Passed: Incorrect numerical value correctly failed.');

// --- TEST 6: False Energy Conservation Claim ---
const falseConservationOutput = `
The isomorphism maps coordinate x <-> q and velocity v <-> i.
Parameters: m <-> L, b <-> R, k <-> 1/C.
Natural frequency omega_0 = 2 rad/s, damping ratio zeta = 0.04.
Total energy is conserved and invariant over all trajectories.
`;
const res6 = oracle.scoreC1(falseConservationOutput);
assert.equal(res6.passed, false, 'Claim that damped system energy is conserved must fail');
assert.equal(res6.criteria.dissipation_recognized, false);
console.log('✓ Test 6 Passed: Spurious energy conservation claim correctly failed.');

// --- TEST 7: C2 False-Twin Rejection & Control Acceptance ---
const c2Neg = 'Logistic growth (ODE) and Michaelis-Menten kinetics (algebraic hyperbolic rate law) are not dynamically isomorphic. They are a false twin.';
const c2Pos = 'Radioactive decay (dN/dt = -lambda*N) and discharging RC circuit (dV/dt = -V/RC) are mathematically isomorphic first-order linear relaxation ODEs.';
const res7 = oracle.scoreC2(c2Neg, c2Pos);
assert.equal(res7.passed, true, 'Valid false-twin rejection and positive control acceptance must pass');
console.log('✓ Test 7 Passed: C2 false-twin and control verification passed.');

// --- TEST 8: C2 False-Twin Incorrect Acceptance (False Join) ---
const c2BadNeg = 'Logistic growth and Michaelis-Menten kinetics are mathematically isomorphic because both exhibit capacity saturation.';
const res8 = oracle.scoreC2(c2BadNeg, c2Pos);
assert.equal(res8.passed, false, 'Incorrectly accepting false-twin must fail');
assert.equal(res8.criteria.negative_false_twin_rejected, false);
console.log('✓ Test 8 Passed: Incorrect false-twin acceptance correctly failed.');

// --- TEST 9: C3 Staged Epistemic Revision ---
const c3T1 = 'Given m=2.5, k=10, b=0.1, natural frequency is omega_0 = 2.0 rad/s and quality factor Q_prior = 50.';
const c3T2 = 'From empirical cycle energy decay of -39.5%, revised damping is b = 0.40 N*s/m and revised quality factor Q = 12.5. Priors mass m=2.5, stiffness k=10, and natural frequency omega_0=2.0 are preserved.';
const res9 = oracle.scoreC3(c3T1, c3T2);
assert.equal(res9.passed, true, 'Correct physical revision (b=0.4, Q=12.5) must pass');
console.log('✓ Test 9 Passed: C3 epistemic revision verified.');

// --- TEST 10: C3 Contradictory Q-factor (e.g. legacy Q=22.2) ---
const c3T2Bad = 'Revised quality factor is Q = 22.2 with b = 0.4. Preserving m=2.5, k=10.';
const res10 = oracle.scoreC3(c3T1, c3T2Bad);
assert.equal(res10.passed, false, 'Legacy inconsistent Q=22.2 must fail against Q=12.5');
console.log('✓ Test 10 Passed: Inconsistent Q-factor update correctly failed.');

// --- TEST 11: C4 Abstention & Positive Control ---
const c4Inc = 'DECISION: ABSTAIN. Global potential form U(y) is unspecified outside small neighborhood, and initial conditions y(0), dy/dt(0) are missing.';
const c4Suf = 'DECISION: INFER. Complete harmonic potential and initial conditions are given. The closed-form underdamped trajectory is y(t) = exp(-0.1*t)*(cos(1.9975*t) + (0.1/1.9975)*sin(1.9975*t)).';
const res11 = oracle.scoreC4(c4Inc, c4Suf);
assert.equal(res11.passed, true, 'Abstaining on incomplete and inferring on complete must pass');
console.log('✓ Test 11 Passed: C4 abstention and non-overabstention verified.');

// --- TEST 12: C4 Overabstention on Sufficient Boundary ---
const c4BadSuf = 'DECISION: ABSTAIN due to general uncertainty in differential equations.';
const res12 = oracle.scoreC4(c4Inc, c4BadSuf);
assert.equal(res12.passed, false, 'Overabstaining on completely specified system must fail');
console.log('✓ Test 12 Passed: Overabstention correctly failed.');

// --- TEST 13: C1 Adversarial Contradiction (Correct Numbers but Rejects Isomorphism) ---
const c1AdversarialNegation = `
The coordinates are x <-> q, velocities v <-> i, parameters m <-> L, b <-> R, k <-> 1/C.
Natural frequency omega_0 = 2 rad/s and damping ratio zeta = 0.04.
Stored energy is dissipated over time.
However, these systems are not isomorphic because one is mechanical and the other is electrical.
`;
const res13 = oracle.scoreC1(c1AdversarialNegation);
assert.equal(res13.passed, false, 'C1 claiming "not isomorphic" despite matching numbers must fail');
assert.equal(res13.criteria.isomorphism_affirmed, false);
console.log('✓ Test 13 Passed: C1 adversarial negation correctly failed.');

// --- TEST 14: C1 Lossless / False Conservation Claim ---
const c1Lossless = `
The systems are mathematically isomorphic: x <-> q, v <-> i, m <-> L, b <-> R, k <-> 1/C.
Natural frequency omega_0 = 2 rad/s, damping ratio zeta = 0.04.
The system is lossless and total energy is strictly conserved.
`;
const res14 = oracle.scoreC1(c1Lossless);
assert.equal(res14.passed, false, 'C1 claiming lossless/conserved energy must fail');
assert.equal(res14.criteria.dissipation_recognized, false);
console.log('✓ Test 14 Passed: C1 false conservation claim correctly failed.');

// --- TEST 15: C3 Revised Numbers Inside Rejected Hypothesis ---
const c3RejectedHypothesis = `
Turn 2 Analysis:
From the decay data, one might compute b = 0.4 and Q = 12.5.
However, we reject b = 0.4 and reject Q = 12.5 because the sensor is deemed faulty.
We retain b = 0.1 and Q = 50. Preserving m=2.5, k=10.
`;
const res15 = oracle.scoreC3(c3T1, c3RejectedHypothesis);
assert.equal(res15.passed, false, 'C3 mentioning b=0.4/Q=12.5 inside a rejected hypothesis must fail');
assert.equal(res15.criteria.turn2_b_revised_correctly, false);
console.log('✓ Test 15 Passed: C3 rejected numbers correctly failed.');

// --- TEST 16: C4 Negative Statement Containing "Solution" Keyword ---
const c4NegatedSolution = 'A closed-form solution cannot be determined from this data, decision: abstain.';
const res16 = oracle.scoreC4(c4Inc, c4NegatedSolution);
assert.equal(res16.passed, false, 'C4 containing "solution" in an abstention statement must fail');
console.log('✓ Test 16 Passed: C4 negated solution keyword correctly failed.');

console.log('\n=== ALL 16 EVALUATOR ORACLE TESTS PASSED CLEANLY ===');
