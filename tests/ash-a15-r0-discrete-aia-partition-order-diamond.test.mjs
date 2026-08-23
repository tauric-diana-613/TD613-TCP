import test from 'node:test';
import assert from 'node:assert/strict';
import { runDiscreteAIAPartitionOrderDiamondHoldout } from '../app/dome-world/previews/a15-r0/discrete-aia-partition-order-diamond.js';

test('fresh four-candidate AIA holdout is fully invertible and raw probe separates all candidates', () => {
  const receipt=runDiscreteAIAPartitionOrderDiamondHoldout();
  assert.equal(receipt.candidate_universe.length,4);
  assert.deepEqual(receipt.cardinality_profiles.Q_PAIR.bucket_size_multiset,[1,1,1,1]);
  assert.equal(receipt.cardinality_profiles.Q_PAIR.outcome_count,4);
});

test('middle probes have identical cardinality profiles but incomparable partitions', () => {
  const receipt=runDiscreteAIAPartitionOrderDiamondHoldout();
  assert.deepEqual(receipt.cardinality_profiles.Q_D.bucket_size_multiset,[2,2]);
  assert.deepEqual(receipt.cardinality_profiles.Q_B.bucket_size_multiset,[2,2]);
  assert.equal(receipt.cardinality_profiles.Q_D.outcome_count,2);
  assert.equal(receipt.cardinality_profiles.Q_B.outcome_count,2);
  assert.equal(receipt.refinement_order.matrix.Q_D.Q_B,false);
  assert.equal(receipt.refinement_order.matrix.Q_B.Q_D,false);
  assert.equal(receipt.refinement_order.middle_probes_incomparable,true);
});

test('partition refinement order forms the preregistered diamond', () => {
  const r=runDiscreteAIAPartitionOrderDiamondHoldout().refinement_order.matrix;
  assert.equal(r.Q_PAIR.Q_D,true);
  assert.equal(r.Q_PAIR.Q_B,true);
  assert.equal(r.Q_D.Q_BLIND,true);
  assert.equal(r.Q_B.Q_BLIND,true);
  assert.equal(r.Q_D.Q_PAIR,false);
  assert.equal(r.Q_B.Q_PAIR,false);
  assert.equal(r.Q_BLIND.Q_D,false);
  assert.equal(r.Q_BLIND.Q_B,false);
});

test('claim-sufficiency incidence crosses the two matched middle directions', () => {
  const m=runDiscreteAIAPartitionOrderDiamondHoldout().claim_sufficiency_incidence.matrix;
  assert.deepEqual(m.Q_BLIND,{F_D:false,F_B:false,F_RAW:false});
  assert.deepEqual(m.Q_D,{F_D:true,F_B:false,F_RAW:false});
  assert.deepEqual(m.Q_B,{F_D:false,F_B:true,F_RAW:false});
  assert.deepEqual(m.Q_PAIR,{F_D:true,F_B:true,F_RAW:true});
});

test('every withheld claim cell has a concrete collision witness', () => {
  const receipt=runDiscreteAIAPartitionOrderDiamondHoldout();
  assert.equal(receipt.claim_sufficiency_incidence.every_withheld_cell_has_witness,true);
  for(const [probeId,row] of Object.entries(receipt.claim_sufficiency_incidence.matrix)) {
    for(const [claimId,sufficient] of Object.entries(row)) {
      if(!sufficient) assert.ok(receipt.claim_sufficiency_incidence.collision_witnesses[probeId][claimId]);
    }
  }
});

test('matched incomparable pair earns bounded claim-relative anisotropy certificate only', () => {
  const receipt=runDiscreteAIAPartitionOrderDiamondHoldout();
  const cert=receipt.claim_relative_anisotropy_certificate;
  assert.equal(cert.certified,true);
  assert.deepEqual(cert.probe_pair,['Q_D','Q_B']);
  assert.equal(cert.matched_scalar_cost,true);
  assert.equal(cert.matched_outcome_count,true);
  assert.equal(cert.matched_bucket_size_multiset,true);
  assert.equal(cert.partitions_incomparable,true);
  assert.equal(cert.crossed_claim_sufficiency,true);
  assert.equal(receipt.anti_scalar_relation,'CARDINALITY_PROFILE_DOES_NOT_TOTAL_ORDER_CLAIM_ADEQUACY');
  assert.equal(receipt.claim_ceiling.td613_general_aia_theorem,false);
  assert.equal(receipt.claim_ceiling.physical_anisotropy,false);
  assert.equal(receipt.claim_ceiling.tensor_anisotropy,false);
  assert.equal(receipt.claim_ceiling.fisher_geometry,false);
  assert.equal(receipt.claim_ceiling.continuum_information_geometry,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
