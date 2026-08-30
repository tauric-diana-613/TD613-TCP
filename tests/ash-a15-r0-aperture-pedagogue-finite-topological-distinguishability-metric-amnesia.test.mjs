import assert from 'node:assert/strict';
import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_PARENT_RECEIPT,
  finiteTopologicalDistinguishabilityMetricAmnesiaCertificate,
  compileFiniteTopologicalDistinguishabilityMetricAmnesiaProjection,
} from '../app/dome-world/previews/a15-r0/finite-topological-distinguishability-metric-amnesia.js';

const receipt='4ba3542aea8784586562032c57096248dc961db9';
assert.equal(FINITE_TOPOLOGICAL_DISTINGUISHABILITY_METRIC_AMNESIA_PARENT_RECEIPT,receipt);
const c=finiteTopologicalDistinguishabilityMetricAmnesiaCertificate();
assert.equal(c.parent_receipt,receipt);
assert.equal(c.exact,true);
assert.equal(c.passed,true);
assert.deepEqual(c.domain,{roles:5,nontrivial_probes:10,probe_families:1024,role_permutations:120});

assert.equal(c.probes.universe_matches_preregistered,true);
assert.deepEqual(c.probes.presentation_order,['RTAM','BRTM','RTM','BRM','BRT','RM','RT','BR','M','R']);
assert.deepEqual([...c.probes.inherited_nontrivial].sort(),[...c.probes.presentation_order].sort());

assert.equal(c.metric_family_census.pseudometric_families,1024);
assert.equal(c.metric_family_census.exact_metric_families,795);
assert.equal(c.metric_family_census.exact_signature_metric_mismatches,0);
assert.deepEqual(c.metric_family_census.role_class_spectrum,{'1':1,'2':10,'3':44,'4':174,'5':795});
assert.deepEqual(c.metric_family_census.metric_isometry_group_size_spectrum,{'1':372,'2':360,'4':40,'6':10,'8':8,'12':4,'24':1});
assert.deepEqual(c.metric_family_census.metric_incidence_joint_spectrum,{
  '1,1':372,'2,1':192,'2,2':168,'4,1':9,'4,2':21,'4,4':10,'6,2':2,'6,6':8,
  '8,1':2,'8,2':5,'8,4':1,'12,6':4,'24,4':1,
});
assert.equal(c.metric_family_census.equal_symmetry_families,558);
assert.equal(c.metric_family_census.families_with_nonliftable_metric_symmetry,237);
assert.equal(c.metric_family_census.maximum_metric_symmetry_families.length,1);
assert.deepEqual(new Set(c.metric_family_census.maximum_metric_symmetry_families[0]),new Set(['RTAM','BRTM','M','R']));

assert.deepEqual(c.full_metric.distance_matrix,{
  A:{A:0,B:5,T:4,M:5,R:8},
  B:{A:5,B:0,T:5,M:6,R:5},
  T:{A:4,B:5,T:0,M:5,R:4},
  M:{A:5,B:6,T:5,M:0,R:5},
  R:{A:8,B:5,T:4,M:5,R:0},
});
assert.equal(c.full_metric.minimum_positive_distance,4);
assert.equal(c.full_metric.diameter,8);
assert.deepEqual(c.full_metric.point_distance_profiles,{A:[4,5,5,8],B:[5,5,5,6],T:[4,4,5,5],M:[5,5,5,6],R:[4,5,5,8]});
assert.equal(c.full_metric.distance_profile_partition.length,3);
assert.deepEqual(c.full_metric.distance_profile_partition.map(group=>[...group].sort()).sort(),[['A','R'],['B','M'],['T']].map(group=>[...group].sort()).sort());
assert.equal(c.full_metric.ordered_distinct_triangle_checks,60);
assert.deepEqual(c.full_metric.triangle_slack_spectrum,{'0':2,'2':4,'4':22,'6':20,'8':12});
assert.deepEqual(c.full_metric.zero_slack_ordered_triples,[['A','T','R'],['R','T','A']]);
assert.equal(c.full_metric.metric_isometry_count,4);
assert.equal(c.full_metric.labelled_incidence_automorphism_count,1);
assert.equal(c.full_metric.nonliftable_metric_isometries,3);
const mapKey=map=>['A','B','T','M','R'].map(role=>map[role]).join('');
const fullMaps=new Set(c.full_metric.metric_isometries.map(mapKey));
for(const map of [
  {A:'A',B:'B',T:'T',M:'M',R:'R'},
  {A:'R',B:'B',T:'T',M:'M',R:'A'},
  {A:'A',B:'M',T:'T',M:'B',R:'R'},
  {A:'R',B:'M',T:'T',M:'B',R:'A'},
]) assert.equal(fullMaps.has(mapKey(map)),true);
assert.equal(mapKey(c.full_metric.labelled_incidence_automorphisms[0]),mapKey({A:'A',B:'B',T:'T',M:'M',R:'R'}));

const star=c.maximum_metric_symmetry_control;
assert.deepEqual(new Set(star.family),new Set(['RTAM','BRTM','M','R']));
assert.deepEqual(star.signatures,{A:'1000',B:'0100',T:'1100',M:'1110',R:'1101'});
assert.equal(star.metric_isometry_count,24);
assert.equal(star.labelled_incidence_automorphism_count,4);
assert.equal(star.nonliftable_metric_isometries,20);
assert.equal(star.center,'T');
assert.deepEqual(star.leaves,['A','B','M','R']);
assert.equal(star.center_to_leaf_distance,1);
assert.equal(star.leaf_to_leaf_distance,2);
for(const leaf of star.leaves) assert.equal(star.distance_matrix.T[leaf],1);
for(let i=0;i<star.leaves.length;i+=1) for(let j=i+1;j<star.leaves.length;j+=1) assert.equal(star.distance_matrix[star.leaves[i]][star.leaves[j]],2);

assert.deepEqual(c.erasure_metric_equivalence.exact_erasure_case_counts,{'0':1024,'1':5120,'2':11520,'3':15360,'4':13440});
assert.equal(c.erasure_metric_equivalence.total_erasure_cases,46464);
assert.equal(c.erasure_metric_equivalence.family_order_comparisons,4876);
assert.equal(c.erasure_metric_equivalence.criterion_mismatches,0);

assert.equal(c.execution_ledger.probe_families,1024);
assert.equal(c.execution_ledger.pseudometric_triangle_failures,0);
assert.equal(c.execution_ledger.exact_family_metric_permutation_checks,95400);
assert.equal(c.execution_ledger.exact_family_incidence_permutation_checks,95400);
assert.equal(c.execution_ledger.exact_erasure_cases,46464);
assert.equal(c.execution_ledger.erasure_family_order_comparisons,4876);

for(const scar of [
  'SEPARATOR_COUNT_METRIC != PHYSICAL_GEOMETRY','FINITE_HAMMING_FORM != CHANNEL_CODING_THEOREM','PAIRWISE_DISTANCE_MATRIX != LABELLED_PROBE_INCIDENCE',
  'METRIC_ISOMETRY != TOPOLOGICAL_AUTOMORPHISM','METRIC_ISOMETRY != SEMANTIC_ROLE_IDENTITY','EXACT_DISTINGUISHABILITY != STRUCTURAL_IDENTITY_RECOVERY',
  'DISTANCE_PROFILE_ALIASING != ROLE_IDENTITY','NON_LIFTABLE_METRIC_SYMMETRY != HIDDEN_PHYSICAL_SYMMETRY','PSEUDOMETRIC_COLLAPSE != SOURCE_STATE_COLLAPSE',
  'MINIMUM_SEPARATOR_DISTANCE != SHANNON_CAPACITY','MINIMUM_SEPARATOR_DISTANCE != MINIMUM_BIT_LENGTH','FINITE_ERASURE_METRIC_EQUIVALENCE != ERROR_CORRECTION_CAPACITY',
  'LABELLED_INCIDENCE_AUTOMORPHISM != SCIENTIFIC_ANCESTRY','PROBE_UNIVERSE_IDENTITY != PROBE_ENUMERATION_ORDER','WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
]) assert.equal(c.scars.includes(scar),true,`missing scar ${scar}`);

for(const receiver of [AIA_RECEIVERS.ASH,AIA_RECEIVERS.LOOM]){
  const projection=compileFiniteTopologicalDistinguishabilityMetricAmnesiaProjection(receiver);
  assert.equal(projection.receiver,receiver);
  assert.equal(projection.authority.custody_mutation,false);
  assert.equal(projection.authority.source_state_transform,false);
  assert.equal(projection.authority.release,false);
  assert.equal(projection.authority.production,false);
  assert.equal(projection.authority.physical_claim,false);
  assert.equal(projection.authority.continuum_claim,false);
  assert.equal(projection.research_only,true);
  assert.equal(projection.runtime_binding,false);
}
const ash=compileFiniteTopologicalDistinguishabilityMetricAmnesiaProjection(AIA_RECEIVERS.ASH);
assert.equal(ash.payload.exact_metric_families,795);
assert.equal(ash.payload.full_metric_isometry_count,4);
assert.equal(ash.payload.full_topology_incidence_automorphism_count,1);
assert.equal(ash.payload.families_with_nonliftable_metric_symmetry,237);
assert.equal(ash.payload.physical_geometry_claim,false);
assert.equal(ash.payload.channel_coding_claim,false);
assert.equal(ash.payload.semantic_identity_claim,false);

console.log('Ash A15-R0 finite topological distinguishability metric / non-liftable isometry amnesia canonical contract passed.');
