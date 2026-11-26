#!/usr/bin/env node
/** Executable EMSTD613 custody and method matrix, isolated from SRC/Wendbine.
 * This is a finite mapped-capability census, NOT historical-method parity.
 * External original archive is explicitly an unavailable input of this branch.
 */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base='packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/';
const entries=[
 ['em_native_text','em-native-text-search-v1.py','ORIGINAL_TD613_ARCHIVAL_RETRIEVAL','HOST_ONLY_EXTERNAL_SOURCE_CHECKOUT_AND_PRIVATE_INDEX_REQUIRED'],
 ['em_native_semantic','native-semantic-search-v1.py','ORIGINAL_TD613_ARCHIVAL_RETRIEVAL','HOST_ONLY_PRIVATE_VECTOR_MODEL_AND_INDEX_REQUIRED'],
 ['em_native_work_route','em-work-route-v1.py','ORIGINAL_TD613_WORK_IDENTITY_ROUTE','HOST_ONLY_EXTERNAL_SOURCE_REGISTRIES_REQUIRED'],
 ['em_native_research_journey','em-research-journey-v1.py','ORIGINAL_TD613_READONLY_DERIVATIVE_TO_WORK_JOURNEY','HOST_ONLY_EXTERNAL_SOURCE_REGISTRIES_REQUIRED'],
 ['em_verified_vixen_native_span_identity','em-motif-mechanism-control-v1.py','TD613_DERIVED_NATIVE_SOURCE_ANATOMY_FIREWALL','HOST_ONLY_REAL_VERIFIED_VIXEN_PAIR_EXECUTED'],
 ['em_hostile_method_expedition','em-motif-mechanism-control-v1.py','TD613_DERIVED_NATIVE_FIREWALL_WITH_SYNTHETIC_ADVERSARIAL_CONTROLS','HOST_ONLY_REAL_VERIFIED_VIXEN_PAIR_EXECUTED']
];
const sh=x=>createHash('sha256').update(x).digest('hex');
const blob=x=>{const b=Buffer.from(x);return createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
const must=(x,s)=>{if(!x)throw Error(s)};
const html=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
function census(){
 const m=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 must(m,'HELD_EM_VIXEN_ORIGINAL_CATALOGUE');
 const w=JSON.parse(m[1]).works;
 must(w?.length===32&&w.reduce((n,x)=>n+x.linked_sources.length,0)===53&&
  w.filter(x=>x.human_gate_required).length===8,'HELD_EM_ORIGINAL_CENSUS');
 must(w.every(x=>/^emwork_[a-f0-9]{24}$/.test(x.work_id)&&
  x.linked_sources.every(s=>/^emsrc_[a-f0-9]{24}$/.test(s.source_file_id))),'HELD_EM_SOURCE_IDENTITY');
 return w;
}
export function buildVixenEmAtelierMatrix(){
 const works=census();
 const bridge=readFileSync(resolve(ROOT,'scripts/vixen-native-atelier-bridge.mjs'),'utf8');
 const host=readFileSync(resolve(ROOT,'scripts/vixen-podium-native-adapters.mjs'),'utf8');
 const runner=readFileSync(resolve(ROOT,'scripts/vixen-em-native-work-transfer.mjs'),'utf8');
 const allowed=BOUNDED_ENGINE_OPERATIONS.EM_ATELIER;
 const rows=entries.map(([operation,executable,classification,grade])=>{
  must(allowed.includes(operation),'HELD_EM_OPERATION_NOT_AUTHORIZED_'+operation);
  const path=base+executable,absolute=resolve(ROOT,path);
  must(existsSync(absolute),'HELD_EM_ORIGINAL_CONTROL_MISSING_'+executable);
  must((bridge+host+runner).includes(operation),'HELD_EM_METHOD_NOT_WIRED_'+operation);
  const bytes=readFileSync(absolute);
  return {operation,original_recovered_program:path,git_blob_sha:blob(bytes),
   sha256:sh(bytes),method_authority:classification,real_execution_grade:grade,
   public_browser_executes_original_python:false,
   em_public_original_text_imported:false,source_historical_author_authored_this_executable:false,
   verified_vixen_derivative_consumer:['em_verified_vixen_native_span_identity','em_hostile_method_expedition'].includes(operation)?
    'scripts/vixen-em-native-work-transfer.mjs':null,
   full_native_method_equivalence:'HELD_UNPROVEN',
   external_empirical_credit:0};
 });
 const restored='em-identity-sensitivity-v1.py';
 const restoredBytes=readFileSync(resolve(ROOT,base+restored));
 must(blob(restoredBytes)==='c548196ad4628577f2154f6f4f8f0a903c90d1e1',
  'HELD_EM_RESTORED_IDENTITY_GIT_BLOB_DRIFT');
 must(blob(readFileSync(resolve(ROOT,base+'em-motif-mechanism-control-v1.py')))==='890a822ca70231679bd7cc2709a5fde9ef910d01',
  'HELD_EM_ORIGINAL_FIREWALL_GIT_BLOB_DRIFT');
 return {
  schema:'td613.vixen.em-proscenium-method-custody/v1',
  state:'NATIVE_CONTROL_RECOVERY_EXPLICIT_SOURCE_REGIME_HOLD',
  exact_historical_em_archive_ref:'70b5a0f9e94626cba6068f41c6117e7978800bbd',
  exact_standalone_runtime_ref:'9b9c9392d99975a8770b336eeae3c6ab1ae88d55',
  exact_identity_sensitivity_ref:'30630575ade616a5a47e4066b30d2159c2bd32be',
  historical_archive_github_read_observation:{
   original_git_fixture_entries:267,
   source_manifest_git_blob:'0c33ea0daea21d9c6fffdd8344bd79878b7ea9e5',
   work_manifest_git_blob:'9c6c2976386dcd70cb040db6728dbdfcd4cf8059',
   work_source_relations_git_blob:'aa836272ea09d14a828d56982720e4e9eafd4e71',
   derivative_manifest_git_blob:'b85837df315bb4d79a472a13f5025a1261871e37',
   historical_external_bytes_reverified_by_this_local_run:false,
   historical_originals_not_checked_out_into_vixen:true
  },
  vixen_documented_performer_source_identity:{
   works:works.length,manifestations:works.reduce((n,w)=>n+w.linked_sources.length,0),
   gated_supported_identity_groups:works.filter(w=>w.human_gate_required).length,
   asserted_historical_match_requires_independent_source_read:true,
   human_identity_gates_adjudicated:0
  },
  original_firewall_github_blob_verified:true,restored_identity_github_blob_verified:true,
  native_methods_with_named_podium_operations:rows.length,
  original_historical_author_programs_authenticated:0,
  native_controls_executed_on_real_vixen_bodies_by_separate_host:true,
  documentary_human_protocol_stages:[
   'BLIND_CUSTODY','WORK_IDENTITY_SPLIT_COLLAPSE','BRUTAL_ANATOMY','MOTIF_NULL',
   'CONVERGENCE_DIVERGENCE','GENEALOGY','EMERGENCE_ADVERSARIAL_WITHDRAWAL',
   'EXTERNAL_SCIENCE_WITNESS','CLAIM_CEILING_HUMAN_RETURN'],
  human_determined_protocol_stages_verified_executed:0,
  public_vixen_em_browser_native_method_consumer:false,
  rows,scientific_credit:0,full_original_method_parity:'HELD',
  no_automatic_foreign_author_ownership:true,no_operahouse_performer_collapse:true,
  operator_approval_to_publish:false,release_authority:false,
  human_closure_required:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.stdout.write(JSON.stringify(buildVixenEmAtelierMatrix())+'\n')}
 catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e?.message||e)})+'\n');process.exitCode=2}
}
