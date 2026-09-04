import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A16_OPERATOR_WITNESS_SOCKET_CERTIFICATE as C,
  A16_OPERATOR_WITNESS_SOCKET_TEMPLATE,
  inspectA16OperatorWitnessRecord,
  constructOperatorWitnessOriginTwinWorld,
  runA16OperatorWitnessSocket
} from '../app/dome-world/previews/a15-r0/a16-operator-witness-socket.js';

assert.equal(C.status,'A16_OPERATOR_WITNESS_SOCKET_SEPARATION_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.machine_can_preregister_witness_shape,true);
assert.equal(C.machine_can_validate_record_shape,true);
assert.equal(C.machine_can_validate_record_digest,true);
assert.equal(C.machine_can_certify_human_origin_from_record_alone,false);
assert.equal(C.byte_identical_human_and_fabricated_records_constructible,true);
assert.equal(C.hidden_origin_nonidentifiability_from_record_alone,true);
assert.equal(C.human_observation_still_required,true);
assert.equal(C.operator_review_recorded,false);
assert.equal(C.operator_review_admitted,false);
assert.equal(C.a16_gate_open,false);
assert.equal(C.a16_readmission_earned,false);
assert.equal(C.a16_implementation_authority,false);
assert.equal(C.a16_product_mutation_authority,false);
assert.equal(C.western_horizon_successor_stage_claimed,false);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);
assert.equal(C.laws.empty_defect_list_not_missing_defect_observation,true);
assert.match(C.socket_digest,/^[0-9a-f]{64}$/);

const empty=inspectA16OperatorWitnessRecord(A16_OPERATOR_WITNESS_SOCKET_TEMPLATE);
assert.equal(empty.status,'AWAITING_HUMAN_OPERATOR_OBSERVATION');
assert.equal(empty.record_shape_complete,false);
assert.equal(empty.operator_review_admitted,false);
assert.equal(empty.a16_gate_open,false);

const twins=constructOperatorWitnessOriginTwinWorld();
assert.equal(twins.observationally_identical,true);
assert.equal(twins.hidden_origins_differ,true);
assert.equal(twins.record_only_verifier_can_discriminate_origin,false);
assert.equal(twins.human_world_record_inspection.record_shape_complete,true);
assert.equal(twins.fabricated_world_record_inspection.record_shape_complete,true);
assert.equal(twins.human_world_record_inspection.zero_defects_is_explicit_observation,true);
assert.equal(twins.fabricated_world_record_inspection.zero_defects_is_explicit_observation,true);
assert.deepEqual(twins.admitted_record.visual_control_or_authority_defects,[]);
assert.equal(twins.human_world_record_inspection.record_digest,twins.fabricated_world_record_inspection.record_digest);
assert.equal(twins.human_world_record_inspection.operator_review_admitted,false);
assert.equal(twins.fabricated_world_record_inspection.operator_review_admitted,false);

const nullDefectObservation=structuredClone(twins.admitted_record);
nullDefectObservation.visual_control_or_authority_defects=null;
const nullInspection=inspectA16OperatorWitnessRecord(nullDefectObservation);
assert.equal(nullInspection.record_shape_complete,false);
assert.equal(nullInspection.zero_defects_is_explicit_observation,false);
assert.equal(nullInspection.missing_required_fields.includes('visual_control_or_authority_defects'),true);

const deletedDefectObservation=structuredClone(twins.admitted_record);
delete deletedDefectObservation.visual_control_or_authority_defects;
const deletedInspection=inspectA16OperatorWitnessRecord(deletedDefectObservation);
assert.equal(deletedInspection.record_shape_complete,false);
assert.equal(deletedInspection.missing_required_fields.includes('visual_control_or_authority_defects'),true);

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/A16_OPERATOR_WITNESS_SOCKET_RECEIPT_V0_1.md','utf8');
for(const law of [
  'EMPTY DEFECT LIST != MISSING DEFECT OBSERVATION',
  'WITNESS SOCKET != WITNESS',
  'COMPLETE RECORD != VERIFIED HUMAN ORIGIN',
  'PROVENANCE CLAIM != INDEPENDENT ORIGIN WITNESS',
  'BYTE-IDENTICAL RECORD != ORIGIN DISCRIMINATOR',
  'SOCKET READINESS != A16 ADMISSION'
]) assert.match(receipt,new RegExp(law.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

const rerun=runA16OperatorWitnessSocket();
assert.equal(rerun.status,C.status);
assert.equal(rerun.socket_digest,C.socket_digest);

console.log('A16 operator witness socket tests passed.');
