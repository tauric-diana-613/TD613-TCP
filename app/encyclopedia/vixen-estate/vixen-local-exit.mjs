/**
 * Local browser exit boundary for the two optional Maestro field methods.
 * Provenance: browser-local/user-authored, not a human-verified external witness.
 * Never serializes an unsent draft; never restores notes permission or role.
 */
export const VIXEN_LOCAL_EXIT_SCHEMA='td613.vixen.local-operator-side-receipts/v1';
const methods=Object.freeze([
 {name:'source_challenge',receipt_schema:'td613.vixen.visitor-hostile-source-challenge-receipt/v1'},
 {name:'comparative_field',receipt_schema:'td613.vixen.human-operator-comparative-field-session/v1'}
]);

export function collectVixenLocalExitBoundary(interfaces={}){
 const drafts=[];
 const receipts={};
 const observations={};
 for(const method of methods){
  const api=interfaces[method.name];
  if(!api){
   observations[method.name]='NOT_ATTACHED';
   continue;
  }
  try{
   const status=api.draftStatus?.();
   if(status?.schema!=='td613.vixen.unsent-draft-status/v1'||
      status.role!=='MAESTRO')throw Error('INVALID_DRAFT_STATUS');
   observations[method.name]='LOCAL_BROWSER_STATUS_ONLY';
   if(status.has_unsent_draft)drafts.push({
    method:method.name,unsent_characters:status.unsent_characters,
    outcome:'DISCARD_ONLY_AFTER_OPERATOR_ACKNOWLEDGMENT'
   });
   const report=api.copyLocalReceipt?.();
   if(report!==null&&report!==undefined){
    if(report.schema!==method.receipt_schema ||
       (method.name==='source_challenge'?report.scientific_credit:
         report.independent_empirical_replication_credit)!==0 ||
       (method.name==='source_challenge'&&report.composer_publication_authority!==false)||
       (method.name==='comparative_field'&&report.composer_publication_authority!==false))
     throw Error('UNVERIFIED_OR_PROMOTED_SIDE_RECEIPT');
    // Copy only complete, already submitted browser receipts. No unsent form bytes.
    receipts[method.name]=JSON.parse(JSON.stringify(report));
   }
  }catch(_){
   observations[method.name]='HELD_SIDE_RECEIPT_OR_DRAFT_STATUS_INVALID';
  }
 }
 return Object.freeze({
  schema:VIXEN_LOCAL_EXIT_SCHEMA,
  observations,unsent_drafts:drafts,
  completed_receipts:receipts,
  has_unsent_drafts:drafts.length>0,
  has_completed_receipts:Object.keys(receipts).length>0,
  local_browser_observation_only:true,
  browser_time_is_independent_provenance:false,
  original_source_admission:false,
  notes_consent_carry_forward:false,
  rehydration_permission:false,
  scientific_credit:0,
  human_closure_required:true
 });
}

export function attachVixenLocalExitToArchive(archive,boundary){
 if(archive?.schema!=='vixen.ai.session-archive/v1'||
    boundary?.schema!==VIXEN_LOCAL_EXIT_SCHEMA)
  throw Error('HELD_SESSION_ARCHIVE_OR_SIDE_RECEIPT_SCHEMA');
 if(archive.active!==false||archive.role!=='MAESTRO'&&archive.role!=='COMPOSER')
  throw Error('HELD_ROLE_OR_SESSION_NOT_FINISHED');
 if(archive.role!=='MAESTRO'&&boundary.has_completed_receipts)
  throw Error('HELD_CROSS_ROLE_FIELD_RECEIPT');
 // Preserve every original session archive field without changing its source.
 // The envelope is an explicitly marked local-only extension, not approval.
 return Object.freeze({...archive,operator_side_receipts:boundary,
  operator_exit_extension:'LOCAL_READ_ONLY_APPENDIX_NOT_NATIVE_CUSTODY',
  original_archive_schema_preserved:true,
  auto_restore_role:false,auto_restore_notes_permission:false,
  independent_empirical_credit:0});
}
