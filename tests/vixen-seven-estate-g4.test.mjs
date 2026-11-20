import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
 VIXEN_LOCAL_EXIT_SCHEMA,collectVixenLocalExitBoundary,attachVixenLocalExitToArchive
} from '../app/encyclopedia/vixen-estate/vixen-local-exit.mjs';

const reportA=Object.freeze({
 schema:'td613.vixen.visitor-hostile-source-challenge-receipt/v1',
 scientific_credit:0,composer_publication_authority:false,
 browser_untrusted_sha256:'a'.repeat(64),
 visitor_review:{judgment:'NO_RELATION_EARNED'}
});
const reportB=Object.freeze({
 schema:'td613.vixen.human-operator-comparative-field-session/v1',
 independent_empirical_replication_credit:0,
 composer_publication_authority:false,
 operator_interaction:'VISITOR_FORM_SUBMISSION_BROWSER_LOCAL_UNATTESTED',
 browser_untrusted_sha256:'b'.repeat(64)
});
const side=(receipt,draft={})=>({
 draftStatus:()=>({
  schema:'td613.vixen.unsent-draft-status/v1',role:'MAESTRO',
  has_unsent_draft:false,unsent_characters:0,...draft}),
 copyLocalReceipt:()=>receipt
});
const archive=role=>({
 schema:'vixen.ai.session-archive/v1',id:'synthetic-session',role,active:false,
 notes_permission:'GRANTED',route_history:[{node_id:'source'}],release_authority:false,
 empirical_replication_credit:0,portable_local_export_only:true
});

test('G4-A: captures two completed local field reports before role-exit zeroization',()=>{
 const observation=collectVixenLocalExitBoundary({
  source_challenge:side(reportA,{has_unsent_draft:true,unsent_characters:34}),
  comparative_field:side(reportB,{has_unsent_draft:false})
 });
 assert.equal(observation.schema,VIXEN_LOCAL_EXIT_SCHEMA);
 assert.equal(observation.has_unsent_drafts,true);
 assert.equal(observation.unsent_drafts[0].unsent_characters,34);
 assert.equal(observation.has_completed_receipts,true);
 assert.deepEqual(Object.keys(observation.completed_receipts).sort(),
  ['comparative_field','source_challenge']);
 const original=archive('MAESTRO'),result=attachVixenLocalExitToArchive(original,observation);
 assert.equal(original.operator_side_receipts,undefined,'original archive object must be unchanged');
 assert.equal(result.schema,original.schema);
 assert.deepEqual(result.route_history,original.route_history);
 assert.equal(result.notes_permission,'GRANTED','prior historical permission must remain recorded');
 assert.equal(result.auto_restore_notes_permission,false,'future note consent cannot follow the archive');
 assert.equal(result.auto_restore_role,false);
 assert.equal(result.operator_side_receipts.completed_receipts.comparative_field.schema,reportB.schema);
 assert.equal(result.original_archive_schema_preserved,true);
 assert.equal(result.independent_empirical_credit,0);
 assert.equal(JSON.stringify(result).includes('unsubmitted evidence:'),false);
 assert.equal(result.operator_side_receipts.local_browser_observation_only,true);
});

test('G4-B: unsubmitted form content never enters a new session export',()=>{
 const draft=side(null,{has_unsent_draft:true,unsent_characters:321});
 const result=collectVixenLocalExitBoundary({source_challenge:draft});
 assert.equal(result.has_unsent_drafts,true);
 assert.equal(result.has_completed_receipts,false);
 assert.deepEqual(result.completed_receipts,{});
 assert(!JSON.stringify(result).includes('unsubmitted evidence:'));
 assert.equal(result.notes_consent_carry_forward,false);
 assert.equal(result.rehydration_permission,false);
});

test('G4-C: promoted, untyped and cross-role side receipts fail closed',()=>{
 const bad={...reportA,scientific_credit:1};
 const held=collectVixenLocalExitBoundary({source_challenge:side(bad)});
 assert.equal(held.observations.source_challenge,'HELD_SIDE_RECEIPT_OR_DRAFT_STATUS_INVALID');
 assert.equal(held.has_completed_receipts,false);
 assert.throws(()=>attachVixenLocalExitToArchive(archive('COMPOSER'),
  collectVixenLocalExitBoundary({source_challenge:side(reportA)})),
  /HELD_CROSS_ROLE_FIELD_RECEIPT/);
 assert.throws(()=>attachVixenLocalExitToArchive({...archive('MAESTRO'),active:true},
  collectVixenLocalExitBoundary({})),/HELD_ROLE_OR_SESSION_NOT_FINISHED/);
});

test('G4-D: offline ZIP includes the new read-only exit module and both browser entrypoints',()=>{
 const zip=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vixen-estate/session-zip.mjs',import.meta.url)),'utf8');
 assert.match(zip,/'vixen-local-exit\.mjs'/);
 const journey=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vixen-estate/vixen-ai-journey.mjs',import.meta.url)),'utf8');
 assert.match(journey,/collectVixenLocalExitBoundary/);
 assert.match(journey,/attachVixenLocalExitToArchive/);
 assert.match(journey,/has_unsent_drafts/);
 assert.match(journey,/auto_restore_notes_permission|lastArchive/);
});
