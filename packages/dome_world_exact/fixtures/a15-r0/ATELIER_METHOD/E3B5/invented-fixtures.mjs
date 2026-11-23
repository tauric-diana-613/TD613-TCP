import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const EPOCH='SRC-E3B4-INVENTED-20261102',RIGHTS='INVENTED_SOURCE_FREE_PUBLIC_METADATA';
const R=source_id=>({source_id,evidence_class:'INVENTED_SOURCE_FREE'});
export const hash=b=>createHash('sha256').update(b).digest('hex');
export function inventedFixture(){
 const surfaces=[
  {...R('FIXTURE-CANON'),surface:'CANON_MAP'},
  {...R('FIXTURE-ARCH'),surface:'CANON_AND_FIELD_ARCHITECTURE'},
  {...R('FIXTURE-PROVENANCE'),surface:'PROVENANCE_REGISTRY'},
  {...R('FIXTURE-CFIF'),surface:'SR_CFIF'},
  {...R('FIXTURE-IDENTITY'),surface:'IDENTITY_REGISTRY'},
  {...R('FIXTURE-READER'),surface:'SIGNATURE_EXPLORE'}
 ];
 const edge=(edge_id,from,to,graph='G_CANON',relation='PRECEDES')=>({edge_id,from,to,graph,relation,source_id:'FIXTURE-PROVENANCE',witness_id:'SYNTH-EVIDENCE-'+edge_id,evidence_class:'INVENTED_SOURCE_FREE',source_ids:['FIXTURE-PROVENANCE'],authority_state:'RESEARCH_ONLY',claim_ceiling:'SOURCE_BOUNDED'});
 const epoch=EPOCH;
 const role=(id,subject,arch,kind,st='WITNESSED',source_status='EXPLICIT_SOURCE')=>({
  contextual_role_assertion_id:id,subject_id:subject,architecture_id:arch,role_normalized:kind,
  source_status,adjudication_status:st,evidence_ids:['SYNTHETIC-'+id],
  interpretive_limit:'Only the described edge is admitted; no stronger endpoint conclusion',
  atelier_snapshot_id:epoch,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL'
 });
 return {schema:'td613.e3b4-src-invented-fixture/v1',epoch,rights:RIGHTS,synthetic_only:true,
  surfaces,formal_layers:Array.from({length:9},(_,i)=>`SYNTHETIC_FORMAL_LAYER_L${i+1}`),
  routes:Array.from({length:8},(_,i)=>({route_id:`READER_ROUTE_${i+1}`,coordinate:`reader:${i+1}`,
   source_id:'FIXTURE-READER',explore_address:i===0?'Explore: LA CARTOGRAFÍA DEL UMBRAL':i===1||i===2?'Explore: AMBIGUOUS HOST':`Explore: OTHER ROUTE ${i+1}`,
   signature:i===0?'Tú puedes clonarme, pero no tienes mis genes.':'SR, THE LAB.'})),
  edges:[edge('edge-AB','A','B'),edge('edge-BC','B','C'),edge('edge-reader','A','C','G_READER','NAVIGATES')],
  typed_edges:[edge('typed-AB','A','B'),edge('typed-BC','B','C')],
  history:[{previous_id:'PRIOR-A',current_id:'CURRENT-HUB',from_type:'FIELD',to_type:'FIELD',ancestry_witness:true},
           {previous_id:'PRIOR-B',current_id:'CURRENT-HUB',from_type:'FIELD',to_type:'FIELD',ancestry_witness:true},
           {previous_id:'OLD-FIELD',current_id:'NEW-PROGRAM',from_type:'FIELD',to_type:'EMBEDDED_PROGRAM',ancestry_witness:true}],
  identity:[
   {entity_type:'OPERATOR',operator_id:'OP-X',domain_binding:'DOMAIN-A',input_signature:'X',output_signature:'Y',lexical_label:'drift'},
   {entity_type:'OPERATOR',operator_id:'OP-X',domain_binding:'DOMAIN-B',input_signature:'X',output_signature:'Y',lexical_label:'drift'}
  ],
  resolver_rows:[{entity_id:'A',entity_type:'synthetic',source_id:'FIXTURE-CANON'}],
  role_assertions:[role('r1','A','B','DEFINES'),role('r2','B','C','TRANSLATES','CANDIDATE','ARCHIVE_INFERRED')],
  compilation_passes:[{compilation_pass_id:'p1',build_target_id:'B',atelier_snapshot_id:epoch,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',
   input_role_assertion_ids:['r1'],contextual_role_count:1,input_ids:['A']},
   {compilation_pass_id:'p2',build_target_id:'C',atelier_snapshot_id:epoch,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',
   input_role_assertion_ids:['r2'],contextual_role_count:1,input_ids:['B']}],
  claims:['LEXICON','HANDBOOK','CANON_MAP','DEPLOYMENT'].flatMap((role,i)=>[
   {role,claim_id:'PRESERVED_RELATION',source_id:surfaces[i].source_id,evidence_class:'SOURCE_DECLARATION'},
   {role,claim_id:`ROLE_${role}_ONLY`,source_id:surfaces[i].source_id,evidence_class:'ARCHIVE_OBSERVATION'}
  ])
 };
}
