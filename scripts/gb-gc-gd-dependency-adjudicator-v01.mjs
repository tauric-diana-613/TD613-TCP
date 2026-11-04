/**
 * TD613 · GB01–GD02 bounded status and decision compiler.
 *
 * Pure source-free code, no network/files/provider calls. Actual historical
 * GitHub receipts are recorded as FIXED EVIDENCE, not dynamic availability.
 * This file CANNOT activate sources, approve D01–D20, mint rights, download
 * encrypted archives, allocate spending or authorize publication.
 */
const need=(truth, code)=>{if(!truth)throw Object.assign(Error(code),{code})};
const isSha=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const timestamp=s=>typeof s==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(s)&&
 Number.isFinite(Date.parse(s))&&new Date(Date.parse(s)).toISOString()===s;
const hold=(reason,prerequisites=[])=>Object.freeze({state:'HELD',reason,prerequisites});

export const PUBLIC_SYNC_EVIDENCE=Object.freeze({
 GB01:Object.freeze({
  state:'EXECUTED_PUBLIC_METADATA_ONLY',gate:'DORMANT',run:41755812092,
  issue:1308,pr:1134,after_head:'4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1',
  snapshot:'wendbine-20261104014208-6d200e3ff3a0',
  seal:'wendbine-seal:6d200e3ff3a0d7d79d7a135d676141fea8dfab3ae9496b525c5a93b55e31edf2',
  observed:2063,new_source_ids:41,unchanged:2021,held:1,previous_custody_preserved:true,
  new_encrypted_artifact_id:13288781055,artifact_name:'wendbine-operator-encrypted-41755812092',
  archive_zip_bytes:12220904,archive_zip_sha256:'4804fabd2a2deb29652d21debc96a2a4feb3e1847aa66346d99dab560de20aeb',
  expires_utc:'2027-02-02T01:41:51Z',
  new_zip_operator_local_custody:'UNVERIFIED',private_restoration:'HELD'
 }),
 GB02:Object.freeze({
  state:'EXECUTED_PUBLIC_DELTA_ONLY',gate:'DORMANT',run:41755828423,
  issue:758,pr:731,after_head:'b3e69acf587d534eeef2e01d0bb5bdbdecdbd320',
  new_zenodo_records:84,partial_body_extraction:'none',
  sealed_phase2_mutation:false,merged:false,scientific_admission:false
 })
});
export const D_ITEMS=Object.freeze(Array.from({length:20},(_,i)=>'D'+String(i+1).padStart(2,'0')));

/**
 * GB03: scope design, NEVER actual acquisition or a gate gesture.
 * Refuse invented "start at inception" unless the earliest coverage witness
 * and the scope/rights are supplied as actual externally reviewed evidence.
 */
export function scopeHistoricalBackfill(input={}){
 const missing=[];
 if(input.author!=='Upset-Ratio502'||input.subreddit!=='Wendbine')missing.push('exact public account and community');
 if(!timestamp(input.start_utc)||!timestamp(input.end_utc)||
    (timestamp(input.end_utc)&&Date.parse(input.end_utc)>Date.parse('2026-09-09T00:00:00.000Z'))||
    (timestamp(input.start_utc)&&timestamp(input.end_utc)&&Date.parse(input.start_utc)>=Date.parse(input.end_utc)))
    missing.push('authenticated exact pre-2026-09-09 UTC coverage interval');
 if(!isSha(input.earliest_source_evidence_sha256))missing.push('independent earliest-source/coverage witness');
 if(typeof input.rights_basis!=='string'||input.rights_basis.length<20)missing.push('lawful access/retention basis');
 if(!Number.isSafeInteger(input.max_requests)||input.max_requests<1||input.max_requests>1000)missing.push('finite API request ceiling');
 if(!['POSTS_ONLY','POSTS_AND_COMMENTS','POSTS_COMMENTS_LINKED_MEDIA'].includes(input.surface))
   missing.push('exact posts/comments/offsite media scope');
 if(!isSha(input.acquisition_head))missing.push('reviewed prospective acquisition implementation exact HEAD');
 const ready=missing.length===0;
 return Object.freeze({gate:'GB03',state:ready?'DESIGN_READY_EXECUTION_NOT_GRANTED':'HELD_SCOPE_INCOMPLETE',
   rights_verified_by_this_code:false,archive_complete_from_inception:false,
   live_acquisition_authorized:false, source_admission_authorized:false,missing,
   approved_operation_count:0,scope:ready?Object.freeze({...input}):null});
}
/**
 * GB04: a local encrypted ZIP hash is a precondition, not a decrypt grant.
 */
export function assessRestoration(evidence={}){
 const tests={
  new_epoch_encrypted_zip_locally_preserved_and_verified:evidence.new_zip_verification===true,
  matching_rsa_key_custody_locally_attested:evidence.key_custody_attested===true,
  source_specific_rights_review_completed:evidence.rights_completed===true,
  actual_decryptor_implementation_independently_reviewed:evidence.restorer_reviewed===true,
  windows_host_security_acceptance:evidence.windows_acceptance===true,
  independent_out_of_band_rollback_anchor:evidence.trust_anchor_attested===true,
  global_cross_store_rights_enforcement:evidence.global_rights_reviewed===true,
  independent_cryptographic_batch_restore_challenge:evidence.synthetic_crypto_tested===true
 };
 return Object.freeze({gate:'GB04',state:'HELD_NO_REAL_RESTORATION_GRANT',
   checks:tests,unsatisfied:Object.entries(tests).filter(([,v])=>!v).map(([k])=>k),
   claimed_originals_restored:0,authorized_real_decryption:false,
   private_rsa_key_never_requested:true,
   note:'All prerequisites passing would trigger new source-specific human adjudication, not automatic decryption.'});
}
export function evaluateExperimentBDesign(design={}){
 const missing=[];
 if(design.challenge_corpus_class!=='BLINDED_CHALLENGE_ARCHIVE_EM')missing.push('actual sealed Em source class');
 if(!Number.isInteger(design.challenge_file_count)||design.challenge_file_count<20||design.challenge_file_count>24)
   missing.push('bounded prospective 20–24-file design count (without reading archive)');
 if(JSON.stringify(design.arms)!==JSON.stringify(['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION']))
   missing.push('full four-arm matched scope');
 if(design.strong_union_comparator!==true)missing.push('Arm 2B strong-union parity');
 if(design.RCA01_full_crossing!==true)missing.push('all authentic/control × neutral/Dollhouse cells for both reasoning architectures');
 if(design.three_lineages_separate!==true)missing.push('Evidence, Presentation and Adjudication lineages');
 if(design.T4_T5_not_promoted!==true)missing.push('non-promotion and independent validation');
 const ready=missing.length===0;
 return Object.freeze({gate:'GC02_PROTOCOL',state:ready?'SOURCE_FREE_PROTOCOL_SPECIFIED_ONLY':'HELD_DESIGN_INCOMPLETE',
   missing, real_corpus_read:false, blinded_contents_seen:0,
   independent_scientific_acceptance:false,spending_authority:false});
}
export function compileAllGateDecisions({gb03={},gb04={},protocol={},d01_d20=[],external={},release={}}={}){
 const gb03Result=scopeHistoricalBackfill(gb03),gb04Result=assessRestoration(gb04);
 const scientific=evaluateExperimentBDesign(protocol);
 need(Array.isArray(d01_d20),'D_DECISIONS_ARRAY_REQUIRED');
 const rows=d01_d20.length===0?
   D_ITEMS.map(id=>({id,status:'UNRESOLVED',human_choice:null,independent_witness:null})):d01_d20;
 need(rows.length===20&&rows.every((x,i)=>x?.id===D_ITEMS[i]),'D01_D20_EXACT_COMPLETE_DECISION_IDS_REQUIRED');
 const adopted=rows.filter(x=>x.status==='OPERATOR_ADOPTED'&&x.human_choice!==null);
 const independentlyWitnessed=rows.filter(x=>x.status==='INDEPENDENTLY_ACCEPTED'&&
   typeof x.independent_witness==='string'&&x.independent_witness.length>0);
 const D20=rows[19];
 const hasExplicitLaterD20=D20.status==='INDEPENDENTLY_ACCEPTED'&&Boolean(external?.fresh_d20_operator_grant)&&
  Boolean(external?.source_specific_grant)&&Boolean(external?.served_provider_receipt)&&
  Boolean(external?.external_root)&&Boolean(external?.evaluator_attestation);
 const g={
  GB01:PUBLIC_SYNC_EVIDENCE.GB01,
  GB02:PUBLIC_SYNC_EVIDENCE.GB02,
  GB03:gb03Result,
  GB04:gb04Result,
  GC01:hold('No actually authorized source-specific reciprocal research episode',[
   'source/version/rights manifest','actual recipient identities','blinded paired native/transport controls',
   'independent source-rights and scientific authorizations']),
  GC02:Object.freeze({state:'DECISION_PACKET_PARTIAL',protocol:scientific,
   d01_d19_adopted:adopted.filter(x=>x.id!=='D20').length,
   d01_d19_independently_accepted:independentlyWitnessed.filter(x=>x.id!=='D20').length,
   unresolved:rows.filter(x=>x.status==='UNRESOLVED').map(x=>x.id),
   budget_unlimited:false,provider_paid_calls_executed:0}),
  GC03:hold('Independent externally provisioned principal, trust root and provider identity not attested',[
   'independent evaluator identity, competence, conflicts and credentials',
   'provider account/retention/served-model evidence','external advancing trust root',
   'finite financial authority']),
  GD01:hold(hasExplicitLaterD20?
   'This offline compiler cannot execute/prove a protected Flight; all actual external evidence must be independently adjudicated':
   'D20 final protected Flight withheld; no automatic successor from an engineering permission',[
   'D01–D19 independently accepted','fresh exact source/plan/config-bound D20 grant',
   'served provider, independent evaluator and trust root','actual runtime isolation']),
  GD02:hold('No exact-head human merge/deployment/publication instruction',[
   'specific PR and reviewed HEAD','CI/security and rights/retention review',
   'public disclosure boundaries','explicit release and rollback authorization'])
 };
 return Object.freeze({schema:'td613.gbd.dependency-adjudication/v1',authority:'SOURCE_FREE_REVIEW_AND_DOCUMENTATION',
  every_gate:['GB01','GB02','GB03','GB04','GC01','GC02','GC03','GD01','GD02'],
  gates:g,consolidated_future_human_handoff_count_max:1,
  source_free_decision_support_complete:true,new_public_sync_commands_issued_by_this_compiler:0,
  original_private_sources_read:0,external_paid_inference_calls:0,
  merges_or_deployments:0,protected_flight:'HELD',
  human_closure:'RESERVED'});
}
