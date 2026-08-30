import assert from 'node:assert/strict';
import { finiteTransportSignatureQuotientRobustnessPreservingWitnessCompressionCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-transport-signature-quotient-robustness-preserving-witness-compression.js';

const c=certificate();
assert.equal(c.parent_receipt,'633cd75baaaebcc5f357bd503024aefbbcf11057');
assert.equal(c.parent_exact,true);

const expected={
  specialization_comparability:{
    witnesses:20,families:1048576,signatures:{'000':6,'001':2,'010':2,'011':6,'100':2,'111':2},states:3969,
    mu:{0:66880,1:267136,2:395520,3:257152,4:61888},robust:[981696,714560,319040,61888,0],minimum:[1,2,4,6,null],qBlockers:3,lifts:22,
    zeroSignature:['B<T','B<M','T<B','T<M','M<B','M<T'],
  },
  principal_open_identity:{
    witnesses:5,families:32,signatures:{'011':2,'101':1,'111':2},states:18,
    mu:{0:5,1:13,2:11,3:3},robust:[27,14,3,0,0],minimum:[1,2,4,null,null],qBlockers:2,lifts:4,zeroSignature:[],
  },
  principal_open_size:{
    witnesses:5,families:32,signatures:{'000':1,'011':2,'101':2},states:18,
    mu:{0:14,1:16,2:2},robust:[18,2,0,0,0],minimum:[2,4,null,null,null],qBlockers:1,lifts:4,zeroSignature:['|U(T)|'],
  },
  cut_orientation:{
    witnesses:10,families:1024,signatures:{'011':8,'101':2},states:27,
    mu:{0:259,1:518,2:247},robust:[765,247,0,0,0],minimum:[2,4,null,null,null],qBlockers:1,lifts:16,zeroSignature:[],
  },
};

for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witness_count,e.witnesses,name);
  assert.equal(row.original_family_count,e.families,name);
  assert.deepEqual(row.signature_multiplicities,e.signatures,name);
  assert.equal(row.quotient_state_count,e.states,name);
  assert.equal(row.family_weight_checksum,e.families,name);
  assert.deepEqual(row.weighted_mu_spectrum,e.mu,name);
  assert.deepEqual(row.weighted_robust_counts_e0_to_e4,e.robust,name);
  assert.deepEqual(row.minimum_width_e0_to_e4,e.minimum,name);
  assert.equal(row.quotient_blocker_state_count,e.qBlockers,name);
  assert.equal(row.weighted_blocker_lifts,e.lifts,name);
  assert.equal(row.nonbinary_minimal_identifying_states,0,name);
  assert.equal(row.factorization_original_family_audits,e.families,name);
  assert.equal(row.factorization_residual_transport_mismatches,0,name);
  assert.equal(row.factorization_mu_mismatches,0,name);
  assert.equal(row.family_weight_checksum_match,true,name);
  assert.equal(row.weighted_mu_parent_match,true,name);
  assert.equal(row.weighted_robustness_parent_match,true,name);
  assert.equal(row.minimum_width_parent_match,true,name);
  assert.equal(row.blocker_lift_parent_match,true,name);
  assert.deepEqual(row.signature_classes['000']||[],e.zeroSignature,name);
  assert.equal(row.passed,true,name);
}

assert.deepEqual(c.ledger,{
  original_family_count:1049664,
  quotient_state_count:4032,
  quotient_transport_load_checks:12096,
  quotient_depth_checks:20160,
  original_family_factorization_audits:1049664,
  family_weight_checksum:1049664,
  signature_multiplicity_mismatches:0,
  factorization_residual_transport_mismatches:0,
  factorization_mu_mismatches:0,
  weighted_mu_mismatch_classes:0,
  weighted_robustness_mismatch_classes:0,
  minimum_width_mismatch_classes:0,
  blocker_lift_mismatch_classes:0,
  nonbinary_minimal_identifying_states:0,
});
assert.ok(c.classes.specialization_comparability.compression_factor>260);
assert.ok(c.classes.cut_orientation.compression_factor>37);
assert.ok(c.laws.includes('DECLARED_TRANSPORT_FUNCTIONALS_FACTOR_THROUGH_TRANSPORT_SIGNATURE_MULTIPLICITY'));
assert.ok(c.laws.includes('BINOMIAL_LIFT_WEIGHTS_RECONSTRUCT_FULL_ORIGINAL_FAMILY_CENSUS'));
assert.ok(c.membranes.includes('TRANSPORT_SIGNATURE_EQUIVALENCE != WITNESS_SEMANTIC_EQUIVALENCE'));
assert.ok(c.membranes.includes('ROBUSTNESS_PRESERVING_QUOTIENT != UNIVERSAL_SUFFICIENT_STATISTIC'));
assert.equal(c.passed,true);
console.log(JSON.stringify({schema:c.schema,ledger:c.ledger,classes:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{signature_multiplicities:row.signature_multiplicities,quotient_state_count:row.quotient_state_count,weighted_mu_spectrum:row.weighted_mu_spectrum,weighted_robust_counts_e0_to_e4:row.weighted_robust_counts_e0_to_e4,minimum_width_e0_to_e4:row.minimum_width_e0_to_e4,quotient_blocker_state_count:row.quotient_blocker_state_count,weighted_blocker_lifts:row.weighted_blocker_lifts,compression_factor:row.compression_factor}]))},null,2));
