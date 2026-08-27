import assert from 'node:assert/strict';

import {
  STIEFEL_WHITNEY_PIN_STRUCTURES_PARENT_RECEIPT,
  orientationCharacter,
  swapEigenlineCertificate,
  orientationCharacterCertificate,
  mappingTorusTangentSplittingCertificate,
  stiefelWhitneyProfileCertificate,
  pinStructureCertificate,
  stiefelWhitneyPinStructuresAggregate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-stiefel-whitney-pin-structures.js';

assert.equal(
  STIEFEL_WHITNEY_PIN_STRUCTURES_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
  'characteristic-class chamber must pin exact witnessed #775 receipt',
);

const eigenlines = swapEigenlineCertificate();
assert.equal(eigenlines.passed, true);
assert.equal(eigenlines.status, 'SWAP_EIGENLINE_SPLITTING_CERTIFICATE_PASSED');
assert.equal(eigenlines.determinant, -1);
assert.deepEqual(eigenlines.plus_line.generator, [1, 1]);
assert.deepEqual(eigenlines.plus_line.image, [1, 1]);
assert.equal(eigenlines.plus_line.eigenvalue, 1);
assert.deepEqual(eigenlines.minus_line.generator, [1, -1]);
assert.deepEqual(eigenlines.minus_line.image, [-1, 1]);
assert.equal(eigenlines.minus_line.eigenvalue, -1);

const orientation = orientationCharacterCertificate();
assert.equal(orientation.passed, true);
assert.equal(orientation.status, 'PARITY_ORIENTATION_CHARACTER_CERTIFICATE_PASSED');
assert.equal(orientation.orientation_character, 'w(t,E,O)=(-1)^t');
assert.equal(orientation.sample_elements, 63);
assert.equal(orientation.sample_pairs, 3969);
assert.equal(orientation.all_homomorphism_rows_pass, true);
assert.equal(orientationCharacter({ t: 1, E: 0, O: 0 }), -1);
assert.equal(orientationCharacter({ t: -1, E: 4, O: -7 }), -1);
assert.equal(orientationCharacter({ t: 2, E: 1, O: 9 }), 1);
assert.equal(orientationCharacter({ t: 0, E: 1, O: 0 }), 1);

const tangent = mappingTorusTangentSplittingCertificate();
assert.equal(tangent.passed, true);
assert.equal(tangent.status, 'MAPPING_TORUS_TANGENT_SPLITTING_CERTIFICATE_PASSED');
assert.equal(tangent.base_tangent_line, 'epsilon_base');
assert.equal(tangent.vertical_plus_eigenline, 'epsilon_plus');
assert.equal(tangent.vertical_minus_eigenline, 'L_w');
assert.equal(tangent.tangent_bundle_candidate, 'TM_f ≅ epsilon^2 ⊕ L_w');
assert.equal(tangent.operational_route_tangent_authority, false);
assert.equal(tangent.physical_spacetime_authority, false);

const sw = stiefelWhitneyProfileCertificate();
assert.equal(sw.passed, true);
assert.equal(sw.status, 'STIEFEL_WHITNEY_PROFILE_CERTIFICATE_PASSED');
assert.equal(sw.total_class, 'w(TM_f)=1+u');
assert.deepEqual(sw.profile, { w0: 1, w1: 'u', w2: 0, w3: 0 });
assert.equal(sw.base_circle_H2_F2, 0);
assert.equal(sw.u_squared, 0);
assert.equal(
  sw.scar,
  'NONORIENTABLE_TANGENT_BUNDLE != NONZERO_HIGHER_STIEFEL_WHITNEY_CLASSES',
);

const pin = pinStructureCertificate();
assert.equal(pin.passed, true);
assert.equal(pin.status, 'PIN_PLUS_MINUS_STRUCTURE_CERTIFICATE_PASSED');
assert.equal(pin.pin_plus.obstruction, 'w2');
assert.equal(pin.pin_plus.value, 0);
assert.equal(pin.pin_plus.exists, true);
assert.equal(pin.pin_plus.isomorphism_classes, 4);
assert.equal(pin.pin_minus.obstruction, 'w2+w1^2');
assert.equal(pin.pin_minus.value, 0);
assert.equal(pin.pin_minus.exists, true);
assert.equal(pin.pin_minus.isomorphism_classes, 4);
assert.equal(pin.spin.exists, false);
assert.equal(pin.spin.rejected_because, 'w1=u!=0');
assert.equal(pin.H1_F2_rank_from_witnessed_H1_Z2, 2);
assert.equal(pin.pin_structures_are_physical_states, false);

const aggregate = stiefelWhitneyPinStructuresAggregate();
assert.equal(aggregate.passed, true);
assert.equal(aggregate.status, 'STIEFEL_WHITNEY_AND_PIN_STRUCTURE_AGGREGATE_PASSED');
assert.equal(aggregate.earned_if_passed.length, 7);
assert.equal(aggregate.ceilings.physical_fermion_sector, false);
assert.equal(aggregate.ceilings.particle_spin_claim, false);
assert.equal(aggregate.ceilings.geometric_2_holonomy, false);

// Hostile 1: swap determinant cannot be +1.
assert.notEqual(eigenlines.determinant, 1);

// Hostile 2: the anti-diagonal eigenline cannot be treated as fixed.
assert.notDeepEqual(eigenlines.minus_line.image, eigenlines.minus_line.generator);

// Hostile 3: tangent bundle cannot be promoted to epsilon^3; that would erase w1.
assert.notEqual(tangent.tangent_bundle_candidate, 'TM_f ≅ epsilon^3');
assert.notEqual(sw.profile.w1, 0);

// Hostile 4: higher Stiefel-Whitney classes must not be invented.
assert.equal(sw.profile.w2, 0);
assert.equal(sw.profile.w3, 0);
assert.equal(sw.u_squared, 0);

// Hostile 5: Pin+ and Pin- conventions are not interchangeable labels.
const wrongPinPlusObstruction = 'w2+w1^2';
const wrongPinMinusObstruction = 'w2';
assert.notEqual(pin.pin_plus.obstruction, wrongPinPlusObstruction);
assert.notEqual(pin.pin_minus.obstruction, wrongPinMinusObstruction);

// Hostile 6: Pin existence does not imply Spin because orientation is still obstructed.
assert.equal(pin.pin_plus.exists && pin.pin_minus.exists, true);
assert.equal(pin.spin.exists, false);

// Hostile 7: four Pin lifts of each type are tangential lift classes, not physical states.
assert.equal(pin.pin_plus.isomorphism_classes, 4);
assert.equal(pin.pin_minus.isomorphism_classes, 4);
assert.equal(pin.pin_structures_are_physical_states, false);

// Hostile 8: characteristic-class geometry does not promote physical or operational authority.
assert.equal(aggregate.ceilings.operational_route_tangent_bundle, false);
assert.equal(aggregate.ceilings.physical_spacetime_decomposition, false);
assert.equal(aggregate.ceilings.geometric_2_holonomy, false);

console.log('Ash A15-R0 Stiefel-Whitney and Pin structure hostile tests passed.');
