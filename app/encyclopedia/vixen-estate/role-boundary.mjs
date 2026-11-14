/**
 * TD613 Vixen Encyclopedia · Three irreducible presentation/governance layers.
 *
 * OPERAHOUSE ≠ OPERA ≠ PERFORMER
 *
 * Theater metaphor is an ontological type constraint, never a license for
 * infrastructure to declare authorship or for a performer to deploy itself.
 */
export const VIXEN_ROLE_SCHEMA='td613.vixen.presentation-roles/v1';

export const STAGE_ROLES=Object.freeze({
  OPERAHOUSE:Object.freeze({
    role:'OPERAHOUSE',
    kind:'HOST_AND_CUSTODY_INFRASTRUCTURE',
    scope:'routes, hosting, reference transport, source integrity, adjudication gates',
    authorized_in_this_browser:'READ_ONLY_RETRIEVAL_AND_VISIBLE_REFUSAL',
    release_authority:false,
    deployment_authority:false,
    scientific_closure_authority:false
  }),
  OPERA:Object.freeze({
    role:'OPERA',
    kind:'RESEARCH_ENCOUNTER_AND_SCORE',
    scope:'historical Vixen questions, five-clock demonstrations, NOTICE→ACT→WORLD_ANSWERS→NAME→REST',
    scientific_claim_authority:false,
    source_reclassification_authority:false
  }),
  PERFORMER:Object.freeze({
    role:'PERFORMER',
    kind:'ATTRIBUTED_SCHOLARLY_SOURCE_LOCUS',
    scope:'a Work, manifestation, documentary instrument or recorded author, without collapsed identity',
    authorship_inference_authority:false,
    human_identity_adjudication_authority:false
  })
});

const AUTHORITY_DENIED=new Set([
  'release_authority','deployment_authority','merge_authority',
  'scientific_closure_authority','identity_adjudication_authority',
  'admitRecord','prepareImport','cross_estate_authorship'
]);

export function castVixenPerformer(work){
  if(!work||typeof work.work_id!=='string'||!work.work_id.trim())throw new TypeError('PERFORMER_WORK_ID_REQUIRED');
  // Preserve historical source ID as a provenance coordinate; never infer
  // civil identity, shared authorship, or permission to admit new source bodies.
  return Object.freeze({
    role:STAGE_ROLES.PERFORMER.role,
    estate:'EMSTD613',
    work_id:work.work_id,
    title:String(work.display_title||work.declared_title||work.work_id),
    identity_status:work.identity_status||'UNRESOLVED',
    source_level:'CATALOGUE_METADATA_ONLY'
  });
}

export function stageVixenOperaEvent(action,performer,details={}){
  if(typeof action!=='string'||!/^[A-Z][A-Z0-9_]*$/.test(action))throw new TypeError('OPERA_EVENT_ACTION_INVALID');
  if(performer?.role!==STAGE_ROLES.PERFORMER.role||performer?.estate!=='EMSTD613')throw new TypeError('OPERA_REQUIRES_TYPED_PERFORMER');
  if(!details||typeof details!=='object'||Array.isArray(details))throw new TypeError('OPERA_EVENT_DETAILS_INVALID');
  for(const key of Object.keys(details))if(AUTHORITY_DENIED.has(key))throw new TypeError('OPERAHOUSE_AUTHORITY_LEAK:'+key);
  if('role' in details||'layer' in details||'estate' in details||'performer' in details)throw new TypeError('OPERA_IDENTITY_COLLISION');
  return Object.freeze({
    role:STAGE_ROLES.OPERA.role,
    opera:'VIXEN_CYBERNETICS_ENCYCLOPEDIA',
    performer,
    action,
    ...details,
    authority:'OBSERVATION_AND_HUMAN_INTERPRETATION_ONLY'
  });
}

export function readOperahouseStatus(referenceStatus){
  // A machine may report its own transport/verification state. It cannot
  // promote a Work, authorize a production release or complete Experiment B.
  return Object.freeze({
    role:STAGE_ROLES.OPERAHOUSE.role,
    service:'UNIVERSAL_REFERENCE_READ_SIDE',
    read_state:String(referenceStatus?.state||'UNOPENED'),
    verification_class:'TRANSPORT_AND_CANONICAL_PAYLOAD_WITNESS_ONLY',
    release_authority:false,
    scientific_closure_authority:false,
    experiment_b_flight:'HELD'
  });
}

export function assertStageRoleSeparation(){
  const values=Object.values(STAGE_ROLES).map(x=>x.role);
  return new Set(values).size===3
    && STAGE_ROLES.OPERAHOUSE.release_authority===false
    && STAGE_ROLES.OPERA.source_reclassification_authority===false
    && STAGE_ROLES.PERFORMER.human_identity_adjudication_authority===false;
}
