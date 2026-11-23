import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {
 EPOCH,RIGHTS,FIVE,SRC_FAMILIES, makeTestWitness, initializeEmptyChamber,stageSynthetic,readSynthetic,withdrawSynthetic,reopenEmptyChamber,
 selectedSurface,nativeSufficiencyMatrix,compareTypeIdentity,diachronic,explore,mapTraversal,threeStratumPlan,runSRC
} from '../src/src-compositional-v01.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const S='FIXTURE-SRC-SOURCES';
const R=source_id=>({source_id,evidence_class:'INVENTED_SOURCE_FREE'});
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
async function chamber(t,{fixture=inventedFixture()}={}){
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'e3b4-real-seed-'));
 t.after(()=>fs.rmSync(parent,{recursive:true,force:true}));
 const c=await initializeEmptyChamber(path.join(parent,'lab'));
 const bytes=Buffer.from(JSON.stringify(fixture)); const witness=makeTestWitness({sourceId:S,bytes});
 stageSynthetic(c,{sourceId:S,fixture,receipt:witness});
 return {c,fixture,witness,bytes};
}

test('real source-free #1605 initializer creates empty 44-declaration chamber, not a product admission',async t=>{
 const {c}=await chamber(t);
 assert.equal(c.initialized_using,'EXACT_1605_SEED_IN_ISOLATED_COPY');
 assert.equal(Object.keys(c.profile.modules).length,44);
 assert.equal(c.profile.source_count,0);
 assert.equal(c.profile.status,'EMPTY_NO_EVIDENCE_NO_AUTHORSHIP_CLAIMS');
 assert.equal(c.profile.modules.POLYCOMPILATION_CONSERVATION.corpus_execution,'NOT_TESTED');
 assert.equal(c.shell.write_performed,true);
 assert.equal(fs.readFileSync(path.join(c.atelier,'01-MANIFESTS/EMPTY_STATE.json'),'utf8').includes('NO_SOURCES_ADMITTED'),true);
 assert.equal(readSynthetic(c,S).bytes.length>0,true);
});

test('all 12 SRC-contributed family names match the exact #1605 method registry, and distinct paths execute',async t=>{
 const {c}=await chamber(t);
 const method=JSON.parse(fs.readFileSync(path.join(c.root,'SEED/atelier-method-v0.2-candidate.json'),'utf8'));
 assert.deepEqual(SRC_FAMILIES,method.operator_families.SRC_CONTRIBUTED);
 assert.equal(SRC_FAMILIES.length,12);
 for(const family of SRC_FAMILIES){
  const r=runSRC(c,S,{family,question:'Q_place'});
  assert.equal(r.family,family);
  assert.match(r.scope,/SYNTHETIC_SOURCE_FREE/);
  assert.equal(c.profile.modules[family].corpus_execution,'NOT_TESTED');
 }
});

test('five question families select source-appropriate authority; false-twin vocabulary does not promote wrong surface',async t=>{
 const {c}=await chamber(t);
 const expected={Q_place:'CANON_MAP',Q_history:'PROVENANCE_REGISTRY',Q_bridge:'SR_CFIF',Q_type:'CANON_AND_FIELD_ARCHITECTURE',Q_reader:'SIGNATURE_EXPLORE'};
 for(const q of FIVE){
  const good=runSRC(c,S,{family:'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',question:q,requestedSurface:expected[q]});
  assert.equal(good.result.status,'SOURCE_FREE_SURFACE_SELECTED');assert.equal(good.result.chosen,expected[q]);
  const wrong=q==='Q_reader'?'PROVENANCE_REGISTRY':'SIGNATURE_EXPLORE';
  const refused=runSRC(c,S,{family:'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',question:q,requestedSurface:wrong});
  assert.equal(refused.result.status,'ABSTAIN_WRONG_AUTHORITY_SURFACE');
  assert.equal(refused.result.chosen,null);
  assert.equal(good.native_matrix.status,'MATRIX_SUPPLIED_NOT_AUTOMATICALLY_PROVED');
 }
 assert.equal(selectedSurface('Q_history').chosen,'PROVENANCE_REGISTRY');
});

test('formal nine-layer cartography is separate from eight reader routes and typed graph traversal never lifts',async t=>{
 const {c}=await chamber(t);
 const x=runSRC(c,S,{family:'MULTI_COORDINATE_NAVIGATION'}).result;
 assert.equal(x.formal_layers.length,9);assert.equal(x.experiential_routes.length,8);
 assert.equal(x.traversal.paths.length,1);assert.deepEqual(x.traversal.paths[0].edges,['edge-AB','edge-BC']);
 assert.equal(x.traversal.direct_identity_admitted,false);assert.equal(x.traversal.geometry_measured,false);
 const no=runSRC(c,S,{family:'MULTI_COORDINATE_NAVIGATION',from:'A',to:'UNSEEN'}).result.traversal;
 assert.equal(no.status,'EXECUTED_ZERO_NO_PATH');
 assert.equal(runSRC(c,S,{family:'TYPED_NON_LIFT_RELATION_COMPOSITION'}).result.non_lift.direct_relation_admitted,false);
});

test('two predecessors to one destination block unique ancestry; field-to-embedded-program stays typed',async t=>{
 const {c}=await chamber(t);
 const hist=runSRC(c,S,{family:'DIACHRONIC_RECLASSIFICATION'}).result;
 assert.deepEqual(hist.predecessors,['PRIOR-A','PRIOR-B']);assert.equal(hist.unique_origin_reconstructible,false);
 const desc=runSRC(c,S,{family:'DIACHRONIC_RECLASSIFICATION',currentId:'NEW-PROGRAM'}).result;
 assert.deepEqual(desc.historical_types,['FIELD']);assert.deepEqual(desc.current_types,['EMBEDDED_PROGRAM']);
 assert.equal(desc.present_placement_is_provenance_complete,false);
 const twin=runSRC(c,S,{family:'TYPE_CONDITIONED_CROSS_SURFACE_IDENTITY'}).result;
 assert.equal(twin.status,'TYPE_LOCAL_FALSE_TWIN');assert.equal(twin.same_object_admitted,false);
 assert.equal(compareTypeIdentity({entity_type:'UNRECOGNIZED'},{}).status,'HELD_AMBIGUOUS_OR_DIFFERENT_TYPE');
 const current=runSRC(c,S,{family:'AUTHORITATIVE_CURRENT_VS_HISTORY'}).result;
 assert.equal(current.current.chosen,'CANON_MAP');assert.equal(current.history.chosen,'PROVENANCE_REGISTRY');
});

test('original #1605 semantic compiler runs source-declared roles; two-hop path does not become direct evidence',async t=>{
 const {c}=await chamber(t);
 const r=runSRC(c,S,{family:'POLYCOMPILATION_CONSERVATION'}).result;
 assert.equal(r.model.role_count,2);assert.equal(r.trace.routes[0].hop_count,2);
 assert.equal(r.trace.routes[0].direct_relation_admitted,false);assert.equal(r.ablation.withdrawn_roles.length,1);
 assert.match(r.model.claim_ceiling,/NO_GENERAL_SEMANTIC_OR_CAUSAL_TRUTH/);
});

test('role-based conservation reports source-bound claim preservation and role-specific omissions without scientific promotion',async t=>{
 const {c}=await chamber(t);const x=runSRC(c,S,{family:'COMPILER_PROJECTION_CONSERVATION'}).result;
 assert.equal(x.receipt.invariants.PRESERVED_RELATION.all_roles_supported,true);
 assert.equal(x.losses.length,4);assert.equal(x.scientific_equivalence_established,false);
 assert.match(x.receipt.claim_ceiling,/SEMANTIC_CONSERVATION_NOT_AUTOMATICALLY_PROVED/);
});

test('exact Explore: routing and Spanish recurrence remain reader navigation, hostile ambiguous and near matches are refused',async t=>{
 const {c}=await chamber(t);const r=runSRC(c,S,{family:'DEFERRED_SEMANTIC_ADDRESS_RESOLUTION'}).result;
 assert.equal(r.status,'SYNTHETIC_READER_ROUTE_RESOLVED');assert.equal(r.scientific_identity,false);assert.equal(r.decodes_hidden_authorship,false);
 const h=runSRC(c,S,{family:'PROJECTIVE_ROUTING_HOSTILE_NULLS'}).result;
 assert.equal(h.exact.status,'SYNTHETIC_READER_ROUTE_RESOLVED');assert.equal(h.near.status,'UNRESOLVED_READER_ROUTE');
 assert.equal(h.ambiguous.status,'AMBIGUOUS_READER_ROUTE');assert.equal(h.template.status,'UNRESOLVED_READER_ROUTE');
});

test('seven F/N/G subsets exist as a declared prospective plan; no triple-only SRC emergence earned',async t=>{
 const {c}=await chamber(t);const p=runSRC(c,S,{family:'THREE_STRATUM_RECONSTRUCTION'}).result;
 assert.deepEqual(p.subsets,['F','N','FN','G','FG','NG','FNG']);
 assert.equal(Object.values(p.statuses).every(x=>x==='NOT_EXECUTED'),true);
 assert.equal(p.experimental_SRC_result,'HELD_UNWITNESSED');
 assert.match(p.claim_ceiling,/PROSPECTIVE_ONLY/);
});

test('independent synthetic receipt, wrong epoch/rights, source tamper, replay and restart fail closed',async t=>{
 const {c,fixture,bytes,witness}=await chamber(t);
 assert.throws(()=>stageSynthetic(c,{sourceId:S,fixture,receipt:witness}),/DUPLICATE_OR_REPLAY_SOURCE/);
 const wrong={...fixture,epoch:'BAD'};const wrongbytes=Buffer.from(JSON.stringify(wrong));
 const other='FIXTURE-SRC-OTHER';
 assert.throws(()=>stageSynthetic(c,{sourceId:other,fixture:wrong,receipt:makeTestWitness({sourceId:other,bytes:wrongbytes})}),/WRONG_EPOCH_RIGHTS_OR_SOURCE_CLASS/);
 assert.throws(()=>stageSynthetic(c,{sourceId:other,fixture,receipt:{...witness,source_id:other}}),/SYNTHETIC_WITNESS_CORRUPT/);
 const restart=reopenEmptyChamber(c.root);assert.equal(restart.profile.source_count,0);assert.equal(runSRC(restart,S,{family:'AUTHORITATIVE_CURRENT_VS_HISTORY'}).result.current.chosen,'CANON_MAP');
 const stem=hash(Buffer.from(S)).slice(0,20),file=path.join(c.root,'E3B4_SYNTHETIC_CUSTODY',stem+'.json');
 fs.appendFileSync(file,' ');assert.throws(()=>readSynthetic(c,S),/SYNTHETIC_WITNESS_MISSING_OR_MISMATCH/);
 fs.writeFileSync(file,bytes);
 const rpath=path.join(c.root,'E3B4_SYNTHETIC_CUSTODY',stem+'.receipt.json');const orig=fs.readFileSync(rpath,'utf8');
 fs.writeFileSync(rpath,'{');assert.throws(()=>readSynthetic(c,S),/RECEIPT_CORRUPT/);fs.writeFileSync(rpath,orig);
 withdrawSynthetic(c,S);assert.throws(()=>runSRC(c,S,{family:'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',question:'Q_place'}),/RECEIPT_REVOKED_OR_WRONG_EPOCH/);
});

test('interrupted synthetic admission does not regenerate evidence or silently promote real sources',async t=>{
 const {c}=await chamber(t);const stem=hash(Buffer.from(S)).slice(0,20);const p=path.join(c.root,'E3B4_SYNTHETIC_CUSTODY',stem+'.json');
 fs.rmSync(p);const rest=reopenEmptyChamber(c.root);
 assert.throws(()=>readSynthetic(rest,S),/SOURCE_ORIGINAL_MISSING/);
 assert.equal(rest.profile.source_count,0);
 assert.equal(rest.profile.modules.SEALED_EPOCH_QUERY_AUTHORITY.corpus_execution,'NOT_TESTED');
});

test('Em-adjacent source-bound span and prospective controls execute without Em parity or material admission',async t=>{
 const {c}=await chamber(t);
 const {unscoredAdjacentOperatorSmoke}=await import('../src/src-compositional-v01.mjs');
 const v=unscoredAdjacentOperatorSmoke();
 assert.equal(v.anchor.verification,'DERIVATIVE_BYTES_AND_EXACT_SPAN_VERIFIED');
 assert.equal(v.plan.state,'LOCKED_BYTES_TIMING_NOT_INDEPENDENTLY_VERIFIED');
 assert.equal(v.ancestry.distinct_known_ancestors,1);
 assert.equal(v.em_admitted,false);assert.equal(c.profile.source_count,0);
});

test('six source-matched #1605 portable-native oracle/recipient pairs execute through distinct imports; transport executes zero',async t=>{
 const {c,fixture,bytes}=await chamber(t);
 const oracle=await import('../src/source-native-oracle-v01.mjs');
 const pairs=[
  ['SEALED_EPOCH_QUERY_AUTHORITY',oracle.nativeEpochLookup(fixture),r=>r.result],
  ['QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',oracle.nativeMatrix(),r=>r.native_matrix],
  ['POLYCOMPILATION_CONSERVATION',oracle.nativeRoleCompilation(fixture),r=>r.result.model],
  ['TYPED_NON_LIFT_RELATION_COMPOSITION',oracle.nativeNonLift(fixture),r=>r.result.non_lift],
  ['COMPILER_PROJECTION_CONSERVATION',oracle.nativeConservation(fixture),r=>r.result.receipt],
  ['THREE_STRATUM_RECONSTRUCTION',oracle.nativeThreePlan(fixture),r=>{
   const {experimental_SRC_result,synthetic_protocol_only,...nativePlan}=r.result;return nativePlan;
  }]
 ];
 for(const [family,expected,projection] of pairs){
  const actual=projection(runSRC(c,S,{family,question:'Q_place'}));
  assert.deepEqual(actual,expected,family+' not matching source-native function');
 }
 const tx=oracle.transportOnly(bytes);assert.equal(tx.native_operations_executed,0);
 assert.equal(tx.recipient_operations_executed,0);assert.deepEqual(tx.bytes,bytes);
 assert.equal(tx.classification,'TRANSPORT_ONLY_COPY_NO_RESEARCH');
 assert.equal(oracle.ORACLE_LIMIT,'PINNED_1605_PORTABLE_FUNCTIONS_NOT_ORIGINAL_SRC_CORPUS_ORACLE');
});

test('missing admitted historical authority changes answer; invented question must abstain without provenance surface',async t=>{
 const altered=inventedFixture();altered.surfaces=altered.surfaces.filter(x=>x.surface!=='PROVENANCE_REGISTRY');
 // Remove conservation claims tied to the deleted synthetic surface.
 altered.claims=altered.claims.filter(x=>x.source_id!=='FIXTURE-PROVENANCE');
 const {c}=await chamber(t,{fixture:altered});
 const lookup=runSRC(c,S,{family:'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',question:'Q_history'});
 assert.equal(lookup.result.status,'NO_SUFFICIENT_SURFACE');
 const wrong=runSRC(c,S,{family:'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',question:'Q_history',requestedSurface:'PROVENANCE_REGISTRY'});
 assert.equal(wrong.result.status,'ABSTAIN_SURFACE_NOT_ADMITTED');
 assert.equal(wrong.result.chosen,null);
});

test('all seven pinned native modules are verified before synthetic chamber initialization; tamper fails',async t=>{
 const {checkPinnedSeedFiles,PINNED_SEED_BLOBS}=await import('../src/src-compositional-v01.mjs');
 const {fileURLToPath}=await import('node:url');
 const seed=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../seed');
 assert.equal(Object.keys(PINNED_SEED_BLOBS).length,7);
 assert.equal(checkPinnedSeedFiles(seed).verified_files,7);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'e3b4-seed-corrupt-'));
 t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
 const altered=path.join(temp,'seed');fs.cpSync(seed,altered,{recursive:true});
 fs.appendFileSync(path.join(altered,'atelier-parity-operators-v02.mjs'),'\n// invented tamper');
 assert.throws(()=>checkPinnedSeedFiles(altered),/SOURCE_PINNED_BLOB_MISMATCH/);
 await assert.rejects(()=>initializeEmptyChamber(path.join(temp,'not-created'),{seedDir:altered}),/SOURCE_PINNED_BLOB_MISMATCH/);
 assert.equal(fs.existsSync(path.join(temp,'not-created')),false);
});

test('missing rights and matching type-local fingerprints do not confer source or scientific identity',async t=>{
 const {c,fixture}=await chamber(t);
 const bad=structuredClone(fixture);delete bad.rights;
 const id='FIXTURE-SRC-NO-RIGHTS',bytes=Buffer.from(JSON.stringify(bad));
 assert.throws(()=>stageSynthetic(c,{sourceId:id,fixture:bad,receipt:makeTestWitness({sourceId:id,bytes})}),/WRONG_EPOCH_RIGHTS_OR_SOURCE_CLASS/);
 const a=fixture.identity[0], b={...a};
 const r=compareTypeIdentity(a,b);
 assert.equal(r.status,'TYPE_LOCAL_SIGNATURE_MATCH');
 assert.equal(r.type_local_match,true);
 assert.equal(r.same_object_admitted,false);
 assert.equal(r.scientific_identity_established,false);
});
