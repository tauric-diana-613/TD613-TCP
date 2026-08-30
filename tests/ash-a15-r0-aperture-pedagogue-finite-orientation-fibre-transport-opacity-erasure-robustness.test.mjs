import assert from 'node:assert/strict';
import { finiteOrientationFibreTransportOpacityErasureRobustnessCertificate as certificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-transport-opacity-erasure-robustness.js';

const c=certificate();
assert.equal(c.parent_receipt,'faef60c732e057fe6c678fe4cc7ae7318192f694');
assert.equal(c.parent_exact,true);
assert.equal(c.inherited,'1111111110');
assert.deepEqual(c.group,['id','(B M)','(A R)','(A R)(B M)']);
assert.deepEqual(c.inherited_point_stabilizer,['id']);

const expected={
  specialization_comparability:{witnesses:20,families:1048576,exact:981696,mu:{0:66880,1:267136,2:395520,3:257152,4:61888},robust:[981696,714560,319040,61888,0],minimum:[1,2,4,6,null],difference:576,cases:[1048576,10485760,49807360,149422080,317521920]},
  principal_open_identity:{witnesses:5,families:32,exact:27,mu:{0:5,1:13,2:11,3:3},robust:[27,14,3,0,0],minimum:[1,2,4,null,null],difference:0,cases:[32,80,80,40,10]},
  principal_open_size:{witnesses:5,families:32,exact:18,mu:{0:14,1:16,2:2},robust:[18,2,0,0,0],minimum:[2,4,null,null,null],difference:0,cases:[32,80,80,40,10]},
  cut_orientation:{witnesses:10,families:1024,exact:765,mu:{0:259,1:518,2:247},robust:[765,247,0,0,0],minimum:[2,4,null,null,null],difference:0,cases:[1024,5120,11520,15360,13440]},
};
for(const [name,e] of Object.entries(expected)){
  const row=c.classes[name];
  assert.equal(row.witnesses,e.witnesses,name);
  assert.equal(row.families,e.families,name);
  assert.equal(row.exact_identifying_families,e.exact,name);
  assert.deepEqual(row.mu_tr_spectrum,e.mu,name);
  assert.deepEqual(row.robust_family_counts_e0_to_e4,e.robust,name);
  assert.deepEqual(row.minimum_width_e0_to_e4,e.minimum,name);
  assert.equal(row.transport_separating_rank,e.minimum[0],name);
  assert.equal(row.residual_transport_vs_setwise_stabilizer_difference_families,e.difference,name);
  assert.deepEqual(row.direct_deletion_cases_e0_to_e4,e.cases,name);
  assert.equal(row.criterion_mismatches,0,name);
}

const x=c.classes.specialization_comparability.first_transport_stabilizer_counterexample;
assert.deepEqual(x.witnesses,['A<B']);
assert.deepEqual(x.residual_cell,['0000000001','0000000010','1111111110']);
assert.deepEqual(x.residual_transport_set,['id','(A R)','(A R)(B M)']);
assert.deepEqual(x.setwise_stabilizer,['id']);

assert.deepEqual(c.ledger,{total_selected_families:1049664,total_direct_deletion_cases:528332644,criterion_mismatches:0,residual_transport_vs_setwise_stabilizer_difference_families:576});
assert.ok(c.laws.includes('DIRECT_EXACT_E_WITNESS_ERASURE_SURVIVAL_IFF_MU_TR_IS_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR_IN_EACH_DECLARED_WITNESS_CLASS'));
assert.ok(c.membranes.includes('RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER'));
assert.ok(c.membranes.includes('WITNESS_ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY'));
assert.equal(c.passed,true);
console.log(JSON.stringify({schema:c.schema,ledger:c.ledger,classes:Object.fromEntries(Object.entries(c.classes).map(([name,row])=>[name,{witnesses:row.witnesses,families:row.families,exact:row.exact_identifying_families,mu:row.mu_tr_spectrum,robust:row.robust_family_counts_e0_to_e4,minimum:row.minimum_width_e0_to_e4,difference:row.residual_transport_vs_setwise_stabilizer_difference_families,cases:row.direct_deletion_cases_e0_to_e4}]))},null,2));
