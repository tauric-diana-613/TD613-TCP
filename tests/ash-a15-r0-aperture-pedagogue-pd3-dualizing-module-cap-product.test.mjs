import assert from 'node:assert/strict';

import {
  PD3_DUALIZING_MODULE_CAP_PRODUCT_PARENT_RECEIPT,
  orientationCharacter,
  orientationCharacterCertificate,
  mappingTorusAsphericalModelCertificate,
  twistedWangCertificate,
  ordinaryIntegralCohomologyUCTCertificate,
  orientationCoinvariantCertificate,
  poincareDualityCapProductCertificate,
  pd3DualizingModuleCertificate,
  pd3DualizingModuleCapProductAggregate,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-pd3-dualizing-module-cap-product.js';

assert.equal(
  PD3_DUALIZING_MODULE_CAP_PRODUCT_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
  'PD3 chamber must pin exact witnessed #775 receipt',
);

const orientation = orientationCharacterCertificate();
assert.equal(orientation.passed, true);
assert.equal(orientation.status, 'PD3_ORIENTATION_CHARACTER_CERTIFICATE_PASSED');
assert.equal(orientation.det_swap, -1);
assert.equal(orientation.orientation_character, 'w(t,E,O)=(-1)^t');
assert.equal(orientationCharacter({ t: 1, E: 0, O: 0 }), -1);
assert.equal(orientationCharacter({ t: 2, E: 7, O: -3 }), 1);
assert.equal(orientationCharacter({ t: 0, E: 1, O: 0 }), 1);
assert.equal(orientationCharacter({ t: 0, E: 0, O: 1 }), 1);
assert.equal(orientation.all_homomorphism_rows_pass, true);
assert.equal(orientation.sample_pairs, 18225);

const model = mappingTorusAsphericalModelCertificate();
assert.equal(model.passed, true);
assert.equal(model.closed_manifold_dimension, 3);
assert.equal(model.universal_cover_model, 'R^2 × R ≅ R^3');
assert.equal(model.aspherical, true);
assert.equal(model.physical_spacetime_authority, false);

const twisted = twistedWangCertificate();
assert.equal(twisted.passed, true);
assert.deepEqual(twisted.effective_monodromy.q0, [[-1]]);
assert.deepEqual(twisted.effective_monodromy.q1, [[0, -1], [-1, 0]]);
assert.deepEqual(twisted.effective_monodromy.q2, [[1]]);
assert.deepEqual(twisted.I_minus_effective_monodromy.q0, [[2]]);
assert.deepEqual(twisted.I_minus_effective_monodromy.q1, [[1, 1], [1, 1]]);
assert.deepEqual(twisted.I_minus_effective_monodromy.q2, [[0]]);
assert.equal(twisted.q0.kernel, '0');
assert.equal(twisted.q0.cokernel, 'Z/2');
assert.equal(twisted.q1.kernel, 'Z<(1,-1)>');
assert.equal(twisted.q1.cokernel, 'Z');
assert.equal(twisted.q2.kernel, 'Z');
assert.equal(twisted.q2.cokernel, 'Z');
assert.deepEqual(twisted.twisted_homology, {
  H0: 'Z/2',
  H1: 'Z',
  H2: 'Z^2',
  H3: 'Z',
});

const ordinary = ordinaryIntegralCohomologyUCTCertificate();
assert.equal(ordinary.passed, true);
assert.deepEqual(ordinary.ordinary_homology, {
  H0: 'Z', H1: 'Z^2', H2: 'Z ⊕ Z/2', H3: '0',
});
assert.deepEqual(ordinary.ordinary_cohomology, {
  H0: 'Z', H1: 'Z^2', H2: 'Z', H3: 'Z/2',
});
assert.equal(ordinary.H3_UCT.Ext1_H2_Z, 'Z/2');
assert.equal(ordinary.H3_UCT.result, 'Z/2');

const coinvariants = orientationCoinvariantCertificate();
assert.equal(coinvariants.passed, true);
assert.equal(coinvariants.odd_generator_action, -1);
assert.equal(coinvariants.coinvariant_relation, '-a-a=-2a');
assert.equal(coinvariants.H0_twisted, 'Z/2');

const pd = poincareDualityCapProductCertificate();
assert.equal(pd.passed, true);
assert.equal(pd.fundamental_class, '[M]_w generates H3(G;Z^w)=Z');
assert.deepEqual(pd.ordinary_homology, ['Z', 'Z^2', 'Z ⊕ Z/2', '0']);
assert.deepEqual(pd.ordinary_cohomology, ['Z', 'Z^2', 'Z', 'Z/2']);
assert.deepEqual(pd.twisted_homology, ['Z/2', 'Z', 'Z^2', 'Z']);
assert.deepEqual(pd.twisted_cohomology, ['0', 'Z ⊕ Z/2', 'Z^2', 'Z']);
assert.equal(pd.ordinary_to_twisted_cap_rows.every((row) => row.passed), true);
assert.equal(pd.twisted_to_ordinary_cap_rows.every((row) => row.passed), true);
assert.equal(pd.H3_bridge.UCT_Ext_description, 'Z/2');
assert.equal(pd.H3_bridge.PD_orientation_coinvariant_description, 'Z/2');
assert.equal(pd.H3_bridge.same_unique_nonzero_Z2_class, true);
assert.equal(pd.chain_level_cap_formula_authored_here, false);
assert.equal(pd.physical_duality_authority, false);

const dualizing = pd3DualizingModuleCertificate();
assert.equal(dualizing.passed, true);
assert.equal(dualizing.cohomological_dimension, 3);
assert.equal(dualizing.PD_group_dimension, 3);
assert.equal(dualizing.dualizing_module, 'Z^w');
assert.equal(dualizing.ordinary_top_homology, '0');
assert.equal(dualizing.twisted_top_homology, 'Z');
assert.equal(dualizing.twisted_top_cohomology, 'Z');
assert.equal(dualizing.ordinary_top_cohomology, 'Z/2');
assert.equal(
  dualizing.scar,
  'ORDINARY_TOP_HOMOLOGY_VANISHES != FAILURE_OF_THREE_DIMENSIONAL_POINCARE_DUALITY',
);

const aggregate = pd3DualizingModuleCapProductAggregate();
assert.equal(aggregate.passed, true);
assert.equal(aggregate.status, 'PD3_DUALIZING_MODULE_AND_CAP_PRODUCT_AGGREGATE_PASSED');
assert.equal(aggregate.earned_if_passed.length, 9);
assert.equal(aggregate.ceilings.physical_spacetime, false);
assert.equal(aggregate.ceilings.operational_route_duality, false);
assert.equal(aggregate.ceilings.geometric_2_holonomy, false);

// Hostile 1: erase the orientation character. The odd base generator must reverse orientation.
const trivialOrientation = () => 1;
assert.notEqual(trivialOrientation({ t: 1, E: 0, O: 0 }), orientationCharacter({ t: 1, E: 0, O: 0 }));

// Hostile 2: forget the local-system sign. The effective monodromy would be +f_*.
// This yields ordinary, not orientation-twisted, endpoint behavior: H0 would be Z and H3 would vanish.
const wrongUntwistedEndpointTable = { H0: 'Z', H3: '0' };
assert.notEqual(wrongUntwistedEndpointTable.H0, twisted.twisted_homology.H0);
assert.notEqual(wrongUntwistedEndpointTable.H3, twisted.twisted_homology.H3);

// Hostile 3: ordinary top homology cannot be promoted to Z.
assert.notEqual(pd.ordinary_homology[3], 'Z');
assert.equal(pd.ordinary_homology[3], '0');

// Hostile 4: ordinary H^3 is not an ordinary integral fundamental-class Z.
assert.notEqual(pd.ordinary_cohomology[3], 'Z');
assert.equal(pd.ordinary_cohomology[3], 'Z/2');

// Hostile 5: Ext^1(Z/2,Z) cannot be erased.
assert.notEqual(ordinary.H3_UCT.Ext1_H2_Z, '0');

// Hostile 6: orientation coinvariants cannot be Z because an odd element imposes 2a=0.
assert.notEqual(coinvariants.H0_twisted, 'Z');

// Hostile 7: twisted H^1/H^2 tables cannot be replaced by ordinary cohomology.
assert.notDeepEqual(pd.twisted_cohomology, pd.ordinary_cohomology);
assert.equal(pd.twisted_cohomology[1], 'Z ⊕ Z/2');
assert.equal(pd.twisted_cohomology[2], 'Z^2');

// Hostile 8: mod two kills the sign distinction algebraically; retaining -1 mod 2 is malformed.
assert.equal(((-1 % 2) + 2) % 2, 1);
assert.equal(((1 % 2) + 2) % 2, 1);

// Hostile 9: theorem application does not claim a chain-level cap formula was authored here.
assert.equal(pd.chain_level_cap_formula_authored_here, false);

console.log('Ash A15-R0 PD3 dualizing-module and cap-product hostile tests passed.');
