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

const ISSUED_PERFORMERS=new WeakSet();
const SOURCE_WORK_ID=/^emwork_[0-9a-f]{24}$/;
const OBSERVATION_EVENTS=new Set([
 'INSPECT_WORK','VIXEN_WORK_SELECTED','MANIFESTATION_COMPARISON_OPENED',
 'VIXEN_METADATA_OBSERVED','HUMAN_QUESTION_OPENED','UNPENALIZED_REST',
 'OPERATOR_RESUMED','OPERA_RETURNED_TO_NOTICE'
]);

const AUTHORITY_DENIED=new Set([
  'release_authority','deployment_authority','merge_authority',
  'scientific_closure_authority','identity_adjudication_authority',
  'admitRecord','prepareImport','cross_estate_authorship'
]);

export function castVixenPerformer(work,corpus){
  if(!work||typeof work.work_id!=='string'||!work.work_id.trim())
    throw new TypeError('PERFORMER_WORK_ID_REQUIRED');
  if(!Array.isArray(corpus?.works)||corpus.works.length!==32)
    throw new TypeError('PERFORMER_SOURCE_ROSTER_REQUIRED');
  // Positive membership in this caller's admitted 32-Work source roster,
  // coupled to an issued object identity, prevents ad-hoc role labels and RC
  // method IDs from becoming Performer-shaped Opera event inputs.
  if(!SOURCE_WORK_ID.test(work.work_id)||!corpus.works.some(row=>row===work))
    throw new TypeError('PERFORMER_WORK_NOT_IN_SOURCE_ROSTER');
  const performer=Object.freeze({
    role:STAGE_ROLES.PERFORMER.role,
    estate:'EMSTD613',
    work_id:work.work_id,
    title:String(work.display_title||work.declared_title||work.work_id),
    identity_status:work.identity_status||'UNRESOLVED',
    source_level:'EXPERIMENT_A_PREVIEW_AUTHORIZED'
  });
  ISSUED_PERFORMERS.add(performer);
  return performer;
}

export function stageVixenOperaEvent(action,performer,details={}){
  if(typeof action!=='string'||!/^[A-Z][A-Z0-9_]*$/.test(action))throw new TypeError('OPERA_EVENT_ACTION_INVALID');
  if(performer?.role!==STAGE_ROLES.PERFORMER.role||performer?.estate!=='EMSTD613'||
     !ISSUED_PERFORMERS.has(performer))throw new TypeError('OPERA_REQUIRES_TYPED_PERFORMER');
  if(!details||typeof details!=='object'||Array.isArray(details))throw new TypeError('OPERA_EVENT_DETAILS_INVALID');
  for(const key of Object.keys(details))if(AUTHORITY_DENIED.has(key))throw new TypeError('OPERAHOUSE_AUTHORITY_LEAK:'+key);
  if('role' in details||'layer' in details||'estate' in details||'performer' in details)throw new TypeError('OPERA_IDENTITY_COLLISION');
  // Even a properly issued Performer cannot label an observation as a deploy,
  // release, admit, promotion or adjudication event.
  if(!OBSERVATION_EVENTS.has(action))throw new TypeError('OPERA_EVENT_NOT_OBSERVATIONAL:'+action);
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
