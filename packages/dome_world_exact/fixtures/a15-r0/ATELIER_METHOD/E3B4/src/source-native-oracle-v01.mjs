/**
 * Independent source-free comparator process path for E3-B.4. Reuses pinned
 * original #1605 method functions, NOT native SRC private/source corpus code.
 * Deliberately does not import the E3-B.4 recipient dispatcher or its matrix.
 */
import {createHash} from 'node:crypto';
import {representationSufficiency,nonLiftPath} from '../seed/atelier-core-v02.mjs';
import {resolveSourceEntity,polycompilationConservation,preregisterThreeStratum} from '../seed/atelier-parity-operators-v02.mjs';
import {assemblePolycompiler} from '../seed/atelier-semantic-polycompiler-v02.mjs';
export const ORACLE_LIMIT='PINNED_1605_PORTABLE_FUNCTIONS_NOT_ORIGINAL_SRC_CORPUS_ORACLE';
const q=['Q_place','Q_history','Q_bridge','Q_type','Q_reader'];
const surfaces=['CANON_MAP','CANON_AND_FIELD_ARCHITECTURE','PROVENANCE_REGISTRY','SR_CFIF','SIGNATURE_EXPLORE'];
const status={
 Q_place:['SUFFICIENT','SUFFICIENT','PARTIAL','PARTIAL','INSUFFICIENT'],
 Q_history:['INSUFFICIENT','PARTIAL','SUFFICIENT','INSUFFICIENT','INSUFFICIENT'],
 Q_bridge:['PARTIAL','PARTIAL','INSUFFICIENT','SUFFICIENT','INSUFFICIENT'],
 Q_type:['PARTIAL','SUFFICIENT','PARTIAL','PARTIAL','INSUFFICIENT'],
 Q_reader:['INSUFFICIENT','INSUFFICIENT','INSUFFICIENT','INSUFFICIENT','SUFFICIENT']
};
export function nativeMatrix(){const cells={},evidence_refs={};for(const [i,s] of surfaces.entries())for(const qq of q){cells[qq+'::'+s]=status[qq][i];evidence_refs[qq+'::'+s]=['SOURCE_GROUNDED_SRC_2026_09_14_REST_SYNTHETIC_REPLAY'];}return representationSufficiency({questions:q,surfaces,cells,evidence_refs});}
export function nativeRoleCompilation(f){return assemblePolycompiler({snapshot_id:f.epoch,seal_id:'SYNTHETIC_SEAL_E3B4',compilation_passes:f.compilation_passes,role_assertions:f.role_assertions});}
export function nativeNonLift(f){return nonLiftPath({first:f.typed_edges[0],second:f.typed_edges[1],proposed_direct:'SAME_CURRENT_OBJECT'});}
export function nativeConservation(f){const roles=['LEXICON','HANDBOOK','CANON_MAP','DEPLOYMENT'];const role_claims={};for(const role of roles)role_claims[role]=f.claims.filter(x=>x.role===role).map(x=>({claim_id:x.claim_id,source_ids:[x.source_id],evidence_class:x.evidence_class}));return polycompilationConservation({epoch:f.epoch,source_rows:f.surfaces.map(x=>({source_id:x.source_id})),roles,shared_claim_ids:['PRESERVED_RELATION'],role_claims});}
export function nativeEpochLookup(f){const epoch={snapshot_id:f.epoch,seal_id:'SYNTHETIC_SEAL_E3B4'};return resolveSourceEntity({entity_id:'A',epoch,expected_epoch:epoch,resolver_rows:f.resolver_rows,captures:[],derivatives:[]});}
export function nativeThreePlan(f){return preregisterThreeStratum({snapshot_id:f.epoch,epoch_seal:'SYNTHETIC_SEAL_E3B4',targets:['FROZEN_INVENTED_RELATION'],matched_budget:'ONE_TOKENIZED_WITNESS_PER_STRATUM_WITH_MISSING_CELL_PADDING',blind_seed_commitment:'SYNTHETIC_SEED_COMMITTED_BEFORE_TEST',control_specification:'MORE_TEXT_TEMPLATE_TOPIC_DENSITY_LABEL_LEAKAGE_CHRONOLOGY_LEAKAGE'});}
export function transportOnly(bytes){return {sha256:createHash('sha256').update(bytes).digest('hex'),bytes:Buffer.from(bytes),native_operations_executed:0,recipient_operations_executed:0,classification:'TRANSPORT_ONLY_COPY_NO_RESEARCH'};}