import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT,
  finiteTopologicalProbeSeparationRedundancyCertificate,
  compileFiniteTopologicalProbeSeparationRedundancyProjection,
} from '../app/dome-world/previews/a15-r0/finite-topological-probe-separation-redundancy.js';

const cert=finiteTopologicalProbeSeparationRedundancyCertificate();
assert.equal(FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT,'3662f48ed7ad1345dc013fa6eb50bc4835a15e10');
assert.equal(cert.parent_receipt,FINITE_TOPOLOGICAL_PROBE_SEPARATION_REDUNDANCY_PARENT_RECEIPT);
assert.equal(cert.exact,true);
assert.equal(cert.passed,true);
assert.equal(cert.research_only,true);
assert.equal(cert.runtime_binding,false);

assert.deepEqual(cert.domain,{roles:5,open_states:12,nontrivial_probes:10,probe_families:1024,unordered_role_pairs:10});
assert.deepEqual(cert.probes.nontrivial,['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R']);
assert.equal(cert.probes.all_open_states.length,12);
assert.ok(cert.probes.all_open_states.includes('EMPTY'));
assert.ok(cert.probes.all_open_states.includes('BRTAM'));

assert.deepEqual(cert.family_census.role_class_spectrum,{'1':1,'2':10,'3':44,'4':174,'5':795});
assert.deepEqual(cert.family_census.separation_multiplicity_spectrum,{'0':229,'1':446,'2':288,'3':57,'4':4});
assert.equal(cert.family_census.exact_identifying_families,795);
assert.deepEqual(cert.family_census.width_mu_spectrum,{
  '0':{'0':1},
  '1':{'0':10},
  '2':{'0':45},
  '3':{'0':92,'1':28},
  '4':{'0':61,'1':144,'2':5},
  '5':{'0':18,'1':188,'2':46},
  '6':{'0':2,'1':78,'2':129,'3':1},
  '7':{'1':8,'2':96,'3':16},
  '8':{'2':12,'3':32,'4':1},
  '9':{'3':8,'4':2},
  '10':{'4':1},
});

assert.deepEqual(cert.erasure_redundancy.exact_erasure_case_counts,{'0':1024,'1':5120,'2':11520,'3':15360,'4':13440});
assert.equal(cert.erasure_redundancy.total_erasure_cases,46464);
assert.equal(cert.erasure_redundancy.criterion_family_order_comparisons,4876);
assert.equal(cert.erasure_redundancy.criterion_mismatches,0);
assert.deepEqual(cert.erasure_redundancy.robust_family_counts,{'0':795,'1':349,'2':61,'3':4,'4':0});
assert.deepEqual(cert.erasure_redundancy.minimum_width_by_erasure_order,{'0':3,'1':4,'2':6,'3':8,'4':null});
assert.equal(cert.erasure_redundancy.minimum_families_by_erasure_order['0'].length,28);
assert.equal(cert.erasure_redundancy.minimum_families_by_erasure_order['1'].length,5);
assert.deepEqual(cert.erasure_redundancy.minimum_families_by_erasure_order['2'],[['RTM','BRM','BRT','RM','RT','BR']]);
assert.deepEqual(cert.erasure_redundancy.minimum_families_by_erasure_order['3'],[['BRTM','RTM','BRM','BRT','RM','RT','BR','R']]);
assert.deepEqual(cert.erasure_redundancy.minimum_families_by_erasure_order['4'],[]);
assert.equal(cert.erasure_redundancy.maximum_arbitrary_erasure_tolerance,3);

assert.deepEqual(cert.full_family_wall.pair_separations,{
  'A-B':5,'A-T':4,'A-M':5,'A-R':8,'B-T':5,'B-M':6,'B-R':5,'T-M':5,'T-R':4,'M-R':5,
});
assert.equal(cert.full_family_wall.mu,4);
assert.deepEqual(cert.full_family_wall.bottleneck_pairs,[['A','T'],['T','R']]);
assert.equal(cert.full_family_wall.four_erasure_recovery_possible,false);

assert.deepEqual(cert.execution_ledger,{
  families_enumerated:1024,
  family_role_signatures:5120,
  family_pair_rows:10240,
  exact_erasure_cases:46464,
  criterion_family_order_comparisons:4876,
});

for(const value of Object.values(cert.authority)) assert.equal(value,false);
assert.ok(cert.scars.includes('TOPOLOGICAL_PROBE != PHYSICAL_SENSOR'));
assert.ok(cert.scars.includes('OPEN_SET_MEMBERSHIP_BIT != SHANNON_BIT'));
assert.ok(cert.scars.includes('ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY'));
assert.ok(cert.scars.includes('MINIMUM_PROBE_WIDTH != MINIMUM_BIT_LENGTH'));
assert.ok(cert.scars.includes('FOUR_ERASURE_IMPOSSIBILITY_IN_THIS_TOPOLOGY != UNIVERSAL_IMPOSSIBILITY'));
assert.ok(cert.scars.includes('WITNESS_ROUTING != SCIENTIFIC_ANCESTRY'));

const ash=compileFiniteTopologicalProbeSeparationRedundancyProjection(AIA_RECEIVERS.ASH);
assert.equal(ash.receiver,AIA_RECEIVERS.ASH);
assert.deepEqual(ash.payload.minimum_width_by_erasure_order,{'0':3,'1':4,'2':6,'3':8,'4':null});
assert.equal(ash.payload.maximum_arbitrary_erasure_tolerance,3);
assert.equal(ash.payload.shannon_claim,false);
assert.equal(ash.payload.physical_sensor_claim,false);
assert.equal(ash.payload.natural_language_semantics_claim,false);
for(const value of Object.values(ash.authority)) assert.equal(value,false);

const loom=compileFiniteTopologicalProbeSeparationRedundancyProjection(AIA_RECEIVERS.LOOM);
assert.equal(loom.receiver,AIA_RECEIVERS.LOOM);
assert.equal(loom.payload.domain.probe_families,1024);
assert.equal(loom.payload.erasure_redundancy.total_erasure_cases,46464);
assert.equal(loom.payload.full_family_wall.mu,4);
assert.equal(loom.payload.shannon_claim,false);
assert.equal(loom.payload.physical_sensor_claim,false);
assert.equal(loom.payload.natural_language_semantics_claim,false);
for(const value of Object.values(loom.authority)) assert.equal(value,false);

assert.throws(()=>compileFiniteTopologicalProbeSeparationRedundancyProjection('UNKNOWN'),/unsupported finite topological probe separation redundancy receiver/);

console.log('Ash A15-R0 finite topological probe separation / erasure-robust role tomography canonical contract passed.');
