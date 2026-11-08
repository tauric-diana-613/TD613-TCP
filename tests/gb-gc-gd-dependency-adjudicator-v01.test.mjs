import test from 'node:test';
import assert from 'node:assert/strict';
import {
 PUBLIC_SYNC_EVIDENCE,scopeHistoricalBackfill,assessRestoration,
 evaluateExperimentBDesign,compileAllGateDecisions,D_ITEMS
} from '../scripts/gb-gc-gd-dependency-adjudicator-v01.mjs';
test('GB01/GB02: verify distinct existing bounded-sync receipts, no duplicate gestures',()=>{
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB01.observed,2063);
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB01.new_source_ids,41);
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB01.unchanged,2021);
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB01.held,1);
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB01.new_zip_operator_local_custody,'UNVERIFIED');
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB02.new_zenodo_records,84);
 assert.equal(PUBLIC_SYNC_EVIDENCE.GB02.gate,'DORMANT');
});
test('GB03: missing inception witness prevents fabricated backfill, complete specification still not a sync permission',()=>{
 const incomplete=scopeHistoricalBackfill({});
 assert.equal(incomplete.state,'HELD_SCOPE_INCOMPLETE');
 assert.ok(incomplete.missing.includes('independent earliest-source/coverage witness'));
 const ready=scopeHistoricalBackfill({author:'Upset-Ratio502',subreddit:'Wendbine',
  start_utc:'2026-01-01T00:00:00.000Z',end_utc:'2026-09-09T00:00:00.000Z',
  earliest_source_evidence_sha256:'a'.repeat(64),
  rights_basis:'A separately evidenced lawful archived-public-source retrieval basis',
  max_requests:50,surface:'POSTS_ONLY',acquisition_head:'b'.repeat(64)});
 assert.equal(ready.state,'DESIGN_READY_EXECUTION_NOT_GRANTED');
 assert.equal(ready.approved_operation_count,0);
 assert.equal(ready.archive_complete_from_inception,false);
});
test('GB04: full synthetic prerequisites never auto-enable private decryption or authorization',()=>{
 const empty=assessRestoration({});
 assert.ok(empty.unsatisfied.length>=8);
 const all=assessRestoration({new_zip_verification:true,key_custody_attested:true,
  rights_completed:true,restorer_reviewed:true,windows_acceptance:true,
  trust_anchor_attested:true,global_rights_reviewed:true,synthetic_crypto_tested:true});
 assert.equal(all.unsatisfied.length,0);
 assert.equal(all.authorized_real_decryption,false);
 assert.equal(all.state,'HELD_NO_REAL_RESTORATION_GRANT');
});
test('GC02: full four-arm blinded Em design can be specified without source opening',()=>{
 const s=evaluateExperimentBDesign({challenge_corpus_class:'BLINDED_CHALLENGE_ARCHIVE_EM',
  challenge_file_count:20,
  arms:['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'],
  strong_union_comparator:true,RCA01_full_crossing:true,
  three_lineages_separate:true,T4_T5_not_promoted:true});
 assert.equal(s.state,'SOURCE_FREE_PROTOCOL_SPECIFIED_ONLY');
 assert.equal(s.blinded_contents_seen,0);
 assert.equal(s.spending_authority,false);
});
test('GC/GD: do not count operator choices as independent evidence or manufacture D20',()=>{
 const r=compileAllGateDecisions();
 assert.deepEqual(r.every_gate,['GB01','GB02','GB03','GB04','GC01','GC02','GC03','GD01','GD02']);
 assert.equal(r.gates.GC02.unresolved.length,20);
 assert.equal(r.gates.GD01.state,'HELD');
 assert.equal(r.consolidated_future_human_handoff_count_max,1);
 assert.equal(r.original_private_sources_read,0);
 assert.equal(r.protected_flight,'HELD');
 const choices=D_ITEMS.map(id=>({id,status:'OPERATOR_ADOPTED',human_choice:'test',independent_witness:null}));
 const selected=compileAllGateDecisions({d01_d20:choices,external:{fresh_d20_operator_grant:true}});
 assert.equal(selected.gates.GC02.d01_d19_adopted,19);
 assert.equal(selected.gates.GC02.d01_d19_independently_accepted,0);
 assert.equal(selected.gates.GD01.state,'HELD');
 assert.throws(()=>compileAllGateDecisions({d01_d20:choices.slice(0,19)}),/D01_D20_EXACT_COMPLETE/);
});
