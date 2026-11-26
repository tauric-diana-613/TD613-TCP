#!/usr/bin/env node
/**
 * Executable SRC/Wendbine Vixen research-to-product method custody matrix.
 * Structural presence != executed original code != product consumer != parity.
 * This is an accountable finite scope, not an inventory of all source-side tools.
 */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {BOUNDED_ENGINE_OPERATIONS} from '../app/encyclopedia/reference/vixen-podium.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const srcRoot='packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/';
const wenRoot='packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/';
const sh=b=>createHash('sha256').update(b).digest('hex');
const assert=(x,s)=>{if(!x)throw Error(s)};
const sourcePath=p=>resolve(ROOT,p);
const read=p=>readFileSync(sourcePath(p),'utf8');

const S='SRC_ATELIER',W='WENDBINE_ATELIER';
const sj='app/encyclopedia/vixen-estate/src-atelier-engines.mjs';
const salon='app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
const search='app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs';
const srcHost='scripts/vixen-podium-native-adapters.mjs';
const bridge='scripts/vixen-native-atelier-bridge.mjs';
const wtransfer='scripts/vixen-wendbine-method-transfer.mjs';
const method='scripts/wendbine-proscenium-assay.mjs';
const tests='tests/vixen-native-atelier-bridge.test.mjs';
const srcNativeTest='tests/vixen-src-original-phase2-host.test.mjs';
const srcTraversalTest='tests/vixen-src-original-typed-traversal.test.mjs';
const wenTest='tests/vixen-wendbine-method-transfer.test.mjs';

/**
 * Human-reviewed *candidate* contract list. Assertions below compare these
 * declarations with executable files, authorized operation registry, named
 * real-byte integration witnesses, and original estate hashes.
 */
const e=(key,estate,source,engine,operation,adapter,consumer,mode,tests)=>({
 key,estate,source,engine,operation,adapter,consumer,mode,tests});
export const CAPABILITY_CONTRACTS=Object.freeze([
 e('SRC_PROJECTIVE_JS',S,srcRoot+'run-projective-routing-grammar-assay.py',S,'src_projective_routing',sj,salon,'ADAPTED_BROWSER_JS',['tests/vixen-synthesis-salon.test.mjs']),
 e('SRC_TOMOGRAPHY_JS',S,srcRoot+'build-phase2-assays.py',S,'src_phase2_tomography',sj,salon,'ADAPTED_BROWSER_JS',['tests/vixen-synthesis-salon.test.mjs']),
 e('SRC_CONTEXT_ROLE_JS',S,srcRoot+'build-phase2-assays.py',S,'src_phase2_context_roles',sj,salon,'ADAPTED_BROWSER_JS',[srcNativeTest]),
 e('SRC_TYPED_BROWSER',S,srcRoot+'src-evidence-rabbit-hole-v1.py',S,'src_rabbit_hole_traversal',sj,search,'ADAPTED_BROWSER_JS',['tests/src-atelier-boundary.test.mjs']),
 e('SRC_EPOCH_HOST',S,srcRoot+'srcquery.py',S,'src_native_epoch_query',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_TEXT_HOST',S,srcRoot+'src-native-text-search-v1.py',S,'src_native_text',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_SEMANTIC_HOST',S,srcRoot+'native-semantic-search-v1.py',S,'src_native_semantic',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_PROJECTIVE_HOST',S,srcRoot+'run-projective-routing-grammar-assay.py',S,'src_native_projective_assay',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_EVIDENCE_HOST',S,srcRoot+'src-evidence-rabbit-hole-v1.py',S,'src_native_evidence_traverse',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_JOURNEY_HOST',S,srcRoot+'src-research-journey-v1.py',S,'src_native_research_journey',bridge,null,'ORIGINAL_HOST_PRIVATE_OR_SEALED',[tests]),
 e('SRC_SIGNATURE_BROWSER',S,srcRoot+'native-semantic-search-v1.py',S,'src_untypical_retrieval',sj,search,'ADAPTED_BROWSER_JS',['tests/src-atelier-boundary.test.mjs']),
 e('SRC_HETEROSTRAT_AUDIT',S,null,S,'src_heterostratigraphic_audit',sj,null,'DERIVED_HOST_OR_BROWSER_ADAPTER',['tests/src-atelier-boundary.test.mjs']),
 e('SRC_VERIFIED_WORK_PAIR',S,null,S,'src_verified_vixen_work_pair',srcHost,null,'HOST_ONLY_REAL_VIXEN_WORK',[tests]),
 e('SRC_ORIGINAL_PROJECTIVE_ON_VIXEN',S,srcRoot+'run-projective-routing-grammar-assay.py',S,'src_verified_vixen_original_projective_differential',srcHost,null,'ORIGINAL_PYTHON_ON_VERIFIED_VIXEN_PAIR',[tests]),
 e('SRC_ORIGINAL_TYPED_ON_VIXEN',S,srcRoot+'src-evidence-rabbit-hole-v1.py',S,'src_verified_vixen_original_typed_traversal',srcHost,null,'ORIGINAL_PYTHON_ON_VERIFIED_VIXEN_PAIR',[srcTraversalTest]),
 e('SRC_ORIGINAL_PHASE2_ON_VIXEN',S,srcRoot+'build-phase2-assays.py',S,'src_verified_vixen_original_phase2',srcHost,null,'ORIGINAL_PYTHON_ON_VERIFIED_VIXEN_PAIR',[srcNativeTest]),
 e('WENDBINE_PUBLIC_QUERY',W,wenRoot+'wendbine-query.mjs',W,'wendbine_public_query',bridge,null,'REGISTERED_NATIVE_PUBLIC_HOST',['tests/wendbine-public-atelier-compiler.test.mjs']),
 e('WENDBINE_PUBLIC_INVENTORY',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_inventory',bridge,null,'REGISTERED_NATIVE_PUBLIC_HOST',['tests/wendbine-proscenium-assay.test.mjs']),
 e('WENDBINE_PUBLIC_RECONSTRUCTION',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_reconstruction',method,null,'TD613_DERIVED_HOST',['tests/wendbine-proscenium-assay.test.mjs']),
 e('WENDBINE_PUBLIC_SWEEP',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_sweep',method,null,'TD613_DERIVED_HOST',['tests/wendbine-proscenium-assay.test.mjs']),
 e('WENDBINE_ORIGINAL_COMPILER_TRANSFER',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_verified_vixen_method_transfer',wtransfer,null,'TD613_HEURISTIC_ON_VERIFIED_VIXEN_PAIR',[wenTest]),
 e('WENDBINE_CAPTURE_LENS',W,wenRoot+'wendbine-capture-contract.mjs',W,'wendbine_local_bitemporal_capture','scripts/wendbine-bitemporal-capture-v1.py',null,'LOCAL_CAPTURE_CLOCK_UNWITNESSED',['tests/test_wendbine_bitemporal_capture_v1.py']),
 e('WENDBINE_EVIDENCE_ROUTES',W,null,W,'wendbine_observed_evidence_routes','scripts/wendbine-evidence-routes-v1.py',null,'TD613_DERIVED_HOST_PRIVATE',['tests/test_wendbine_evidence_routes_v1.py']),
 e('WENDBINE_MAESTRO_METHOD',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_maestro_research_step','scripts/wendbine-maestro-research-loop.mjs',null,'TD613_DERIVED_HOST_ONLY',['tests/wendbine-maestro-research-loop.test.mjs']),
 e('WENDBINE_FREQUENCY_NULL',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_frequency_null','scripts/wendbine-frequency-null-challenge.mjs',null,'TD613_DERIVED_HOST_FALSIFIER',['tests/wendbine-frequency-null-challenge.test.mjs']),
 e('WENDBINE_TOPOLOGY_REWIRE',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_topology_rewire','scripts/wendbine-topology-rewire-challenge.mjs',null,'TD613_DERIVED_HOST_FALSIFIER',['tests/wendbine-topology-rewire-challenge.test.mjs']),
 e('WENDBINE_DIRECTED_WALK',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_directed_walk','scripts/wendbine-directed-walk-falsification.mjs',null,'TD613_DERIVED_HOST_FALSIFIER',['tests/wendbine-directed-walk-falsification.test.mjs']),
 e('WENDBINE_OPEN_WORLD_CEILING',W,wenRoot+'wendbine-compile.mjs',W,'wendbine_public_open_world_ceiling','scripts/wendbine-open-world-ceiling.mjs',null,'TD613_DERIVED_HOST_FALSIFIER',['tests/wendbine-open-world-ceiling.test.mjs']),
 e('WENDBINE_PRIVATE_STATUS',W,wenRoot+'wendbine-private-custody-audit.mjs',W,'wendbine_private_status',bridge,null,'CONDITIONAL_PRIVATE_HOST',[tests]),
 e('WENDBINE_PRIVATE_SEARCH',W,wenRoot+'wendbine-private-unified-query.py',W,'wendbine_private_search',bridge,null,'CONDITIONAL_PRIVATE_HOST',[tests]),
 e('WENDBINE_SEALED_EPOCH',W,wenRoot+'wendbine-query.mjs',W,'wendbine_sealed_epoch_query',bridge,null,'CONDITIONAL_SEALED_HOST',[tests])
]);
function codeCheck(entry){
 assert(entry.source===null||existsSync(sourcePath(entry.source)),'HELD_MATRIX_MISSING_ORIGINAL_'+entry.key);
 assert(existsSync(sourcePath(entry.adapter)),'HELD_MATRIX_MISSING_ADAPTER_'+entry.key);
 for(const p of entry.tests)assert(existsSync(sourcePath(p)),'HELD_MATRIX_MISSING_NAMED_TEST_'+entry.key);
 const allowable=BOUNDED_ENGINE_OPERATIONS[entry.engine];
 assert(allowable?.includes(entry.operation),'HELD_MATRIX_UNAUTHORIZED_OPERATION_'+entry.key);
 const adapters=[read(srcHost),read(bridge),read(method),read(entry.adapter)].join('\n');
 assert(adapters.includes(entry.operation),'HELD_MATRIX_UNWIRED_OPERATION_'+entry.key);
 if(entry.consumer)assert(existsSync(sourcePath(entry.consumer)),'HELD_MATRIX_MISSING_CONSUMER_'+entry.key);
 return {
  key:entry.key,estate:entry.estate,mode:entry.mode,
  operation:entry.operation,authority:'EXPLICIT_HOST_WHERE_APPLICABLE',
  source_executable:entry.source,source_sha256:entry.source?sh(readFileSync(sourcePath(entry.source))):null,
  adapter_executable:entry.adapter,adapter_sha256:sh(readFileSync(sourcePath(entry.adapter))),
  actual_product_consumer:entry.consumer,
  product_wiring_grade:entry.consumer?'STATIC_CONSUMER_REFERENCE_PRESENT_NOT_NATIVE_RUNTIMES':'NO_PUBLIC_PRODUCT_CONSUMER_PROVEN',
  named_test_files:entry.tests,
  named_test_witness:'FILE_PRESENT_CI_EXECUTION_MUST_BE_VERIFIED_SEPARATELY',
  full_method_parity:'HELD_UNPROVEN',
  source_estate_admitted_as_vixen_performer:false,
  independent_empirical_credit:0
 };
}
export function buildDualAtelierCapabilityMatrix(){
 const srcFiles=readdirSync(sourcePath(srcRoot)).filter(x=>x.endsWith('.py')).sort();
 const wenFiles=readdirSync(sourcePath(wenRoot)).filter(x=>x.endsWith('.mjs')||x.endsWith('.py')).sort();
 const rows=CAPABILITY_CONTRACTS.map(codeCheck);
 assert(new Set(rows.map(r=>r.key)).size===rows.length,'HELD_MATRIX_DUPLICATE_CAPABILITY');
 assert(rows.filter(x=>x.estate===S).length===16,'HELD_MATRIX_SRC_CAPABILITY_DECLARATION_DRIFT');
 const matchedSrc=new Set(rows.filter(r=>r.estate===S&&r.source_executable)
  .map(r=>r.source_executable.split('/').at(-1)));
 const matchedWen=new Set(rows.filter(r=>r.estate===W&&r.source_executable)
  .map(r=>r.source_executable.split('/').at(-1)));
 const inventories={
  SRC:{original_python_total:srcFiles.length,mapped_reference_files:srcFiles.filter(p=>matchedSrc.has(p)),
   source_side_not_mapped:srcFiles.filter(p=>!matchedSrc.has(p)),
   note:'UNMAPPED_IS_NOT_A_REQUEST_TO_TRANSPLANT_ALL_SOURCE_BUILDERS'},
  WENDBINE:{registered_admin_executable_total:wenFiles.length,
   mapped_reference_files:wenFiles.filter(p=>matchedWen.has(p)),
   source_side_not_mapped:wenFiles.filter(p=>!matchedWen.has(p)),
   provenance:'TD613_FIXTURE_PROGRAM_NOT_REDDIT_AUTHOR_PROGRAM'}
 };
 const counts=Object.fromEntries([S,W].map(estate=>[estate,{
  declared:rows.filter(r=>r.estate===estate).length,
  public_browser_consumer_references:rows.filter(r=>r.estate===estate&&r.actual_product_consumer).length,
  real_vixen_pair_routes:rows.filter(r=>r.estate===estate&&/VIXEN_PAIR/.test(r.mode)).length,
  full_native_method_parity_established:0
 }]));
 return {schema:'td613.vixen.dual-atelier-capability-matrix/v1',
  state:'SOURCE_GROUNDED_STATIC_CAPABILITY_CENSUS_PARITY_HELD',
  original_to_vixen_constitution:'OPERAHOUSE_NE_OPERA_NE_PERFORMER',
  source_unit_and_authority_distinct:true,source_versus_product_receipts_separate:true,
  source_root_inventory:inventories,counts,rows,
  bounded_scope:'NAMED_COMPUTATIONAL_CAPABILITIES_ONLY_NOT_ALL_SOURCE_SIDE_TOOLS',
  source_presence_is_not_execution:true,named_test_file_is_not_CI_PASS:true,
  product_reference_is_not_RUNTIME_NATIVE_METHOD_PARITY:true,
  original_creator_intent_claimed:false,external_scientific_replication_credit:0,
  automatic_public_admission:false,authority_grant:false,release_authority:false,
  human_closure_required:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('HELD_MATRIX_NO_CLI_ARGUMENTS');
  process.stdout.write(JSON.stringify(buildDualAtelierCapabilityMatrix())+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e?.message||e)})+'\n');process.exitCode=2;}
}
