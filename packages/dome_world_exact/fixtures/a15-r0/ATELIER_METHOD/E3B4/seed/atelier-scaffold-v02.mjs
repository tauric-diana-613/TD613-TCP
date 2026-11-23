#!/usr/bin/env node
/**
 * Offline initializer for EMPTY Ateliers (e.g. ATILLA_OZY).
 * Preview by default; --create requires explicit flag and an unoccupied destination.
 * Does not acquire sources, publish, contact people, or create scientific findings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blankProfile, validateProfile, METHOD } from './atelier-core-v02.mjs';
const current=path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PARENT=path.resolve(current,'..');

const shell=(id,display)=>({
  'ATELIER_PROFILE.json':JSON.stringify(blankProfile(id,{display_name:display}),null,2)+'\n',
  'README.md':'# '+display+' · TD613 Atelier (EMPTY)\n\nResearch-only, source-free chamber. The name supplies no evidence of involvement or source ownership.\n\nStatus: EMPTY / NO SOURCES / NO FINDINGS / NO SCIENTIFIC PROMOTION.\n\nAll 44 common module interfaces are represented in ATELIER_PROFILE.json. Their implementations and corpus runs remain held until independently observed. Source acquisition requires separate authorization, rights check and custody receipt.\n',
  'CONNECTOR_ENTRY.md':'# '+id+' connector gate\n\nRead the local profile and common method. Bind an exact source epoch before each query. Return NO_SOURCES_ADMITTED while the source register is empty. No outbound contact, source access, author identity assertion, merge, publication, release, or scientific promotion without separate authority.\n',
  'ATTRIBUTION.md':'# Attribution boundary\n\nThe label '+display+' is a prospective research chamber only and supplies no proof of any named person involvement, permission, authorship, or endorsement. Retain source-specific rights and attribution.\n',
  '01-MANIFESTS/EMPTY_STATE.json':JSON.stringify({schema:'td613.atelier-empty-state/v0.2-candidate',atelier_id:id,snapshot_id:'UNINITIALIZED',source_count:0,work_count:0,findings_count:0,acquisition_authority:false,source_status:'NO_SOURCES_ADMITTED'},null,2)+'\n',
  '05-OPERATIONS/CAPABILITY_REST.md':'# Capability rest · '+id+'\n\nAll '+METHOD.required_capability_ids.length+' common interfaces are registered. None has earned implementation/corpus execution or scientific evidence at initialization.\n\nModule families: '+Object.keys(METHOD.operator_families).join(', ')+'.\n\nRecognition routes are optional, dormant, public-facing and never perform contact.\n',
  '06-INSTRUMENTS/ASSAY_REGISTER.md':'# Preregistered assays\n\nNone. Specify frozen targets, controls and evaluation frame before observing outcomes.\n',
  '07-ARCHIVE-LEDGER/EMPTY_LEDGER.md':'# Source custody ledger\n\nEmpty. No admission or authorship transfer.\n',
  '02-ORIGINALS/.gitkeep':'',
  '03-DERIVATIVES/.gitkeep':'',
  '04-RECEIPTS/.gitkeep':'',
  '08-EXTERNAL-CORPORA/.gitkeep':'',
  '99-ADMIN/.gitkeep':''
});
export function preview(id,display=id){
 const p=blankProfile(id,{display_name:display});validateProfile(p);
 return {atelier_id:id,display_name:display,method:p.method_version,
    registered_module_count:Object.keys(p.modules).length,
    callable_module_count:Object.values(p.modules).filter(m=>m.callable_available).length,source_count:0,
    files:Object.keys(shell(id,display)).sort(),authority:'NONE',write_performed:false};
}
export function createEmptyAtelier(id,{display_name=id,destination,create=false}={}){
 const record=preview(id,display_name);
 if(!create)return record;
 if(typeof destination!=='string'||!path.isAbsolute(destination))throw Error('EXPLICIT_ABSOLUTE_DESTINATION_REQUIRED');
 const target=path.resolve(destination);
 if(fs.existsSync(target))throw Error('TARGET_ALREADY_EXISTS_NO_OVERWRITE');
 const relative=path.relative(DEFAULT_PARENT,target);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative!==id)
   throw Error('DESTINATION_MUST_MATCH_ATELIER_ID_UNDER_COMMON_PARENT');
 fs.mkdirSync(target,{recursive:false});
 for(const [rel,bytes] of Object.entries(shell(id,display_name))){
   const out=path.join(target,rel);
   fs.mkdirSync(path.dirname(out),{recursive:true});
   fs.writeFileSync(out,bytes,{flag:'wx'});
 }
 return {...record,write_performed:true,destination:target};
}
const direct=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){
 const args=process.argv.slice(2);
 const value=key=>{const i=args.indexOf(key);return i>=0?args[i+1]:undefined};
 const id=value('--id'),display=value('--label')||id,create=args.includes('--create');
 if(!id)throw Error('USAGE: node atelier-scaffold-v02.mjs --id ATILLA_OZY [--label "Atilla & Ozy"] [--create --destination ABSOLUTE_TARGET]');
 const out=createEmptyAtelier(id,{display_name:display,create,destination:value('--destination')});
 console.log(JSON.stringify(out,null,2));
}
