import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {packetTemplate,reviewPacket,registryDigest} from '../packages/rulefield/amendments/receiver.mjs';
const original=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url);
const review=()=>{const packet=packetTemplate({packet_id:'RF-AP-IX-RELAY-CONTROL',author:'SYNTHETIC_TEST_RECEIVER',thread:'SOURCE_FREE_CONTROL'});const item=packet.proposals[0];item.kind='PROPOSE_ASSAY';item.id='NIX01';item.label='Conditional time-space capability assembly trial';item.anchors={rules:['X-086','X-095'],crossings:['C-25','C-30'],queue_ranks:[]};item.hypothesis='When does a synchronized task-bearing capability coalition fail under a change in topology or queue despite lower radial travel time?';item.evidence={source_class:'SOURCE_FREE_SYNTHETIC',source_refs:['packages/rulefield/rulefields/research/ninth_order_confluence_proposal.json'],observation_status:'SOURCE_FREE_FINITE_PROPOSAL',independent_replication:false};item.uncertainty={claim_ceiling:'UNQUALIFIED_PROPOSAL',unresolved:['no independent empirical transit witness']};return packet};
test('cross-agent typed amendment relay produces a review without modifying canonical Rulefield bytes',()=>{
 const originalBytes=readFileSync(original),digest=registryDigest();
 const packet=review(),result=reviewPacket(packet);
 assert.equal(packet.baseline.registry_sha256,digest);
 assert.equal(packet.operator_authority.auto_apply,false);
 assert.equal(packet.operator_authority.auto_merge,false);
 assert.equal(packet.operator_authority.protected_flight,'HELD');
 assert.equal(result.original_registry_mutated,false);
 assert.equal(result.historical_190_mutated,false);
 assert.equal(result.human_closure,'RESERVED');
 assert.equal(result.operator_review_required,true);
 assert.equal(result.as_source_free.proposals[0].kind,'PROPOSE_ASSAY');
 assert.deepEqual(originalBytes,readFileSync(original));
});
test('a model cannot self-grant canonical adoption through a returned amendment packet',()=>{
 const packet=review();packet.operator_authority.auto_apply=true;
 assert.throws(()=>reviewPacket(packet),{code:'AUTHORITY_ESCAPE_ATTEMPT'});
});
test('stale or forged registry digest blocks review and relay',()=>{
 const packet=review();packet.baseline.registry_sha256='0'.repeat(64);
 assert.throws(()=>reviewPacket(packet),{code:'STALE_REGISTRY_BASELINE'});
});
test('ninth-order research remains separate from 596/70/86 canonical source planes',()=>{
 const p=JSON.parse(readFileSync(new URL('../packages/rulefield/rulefields/research/ninth_order_confluence_proposal.json',import.meta.url)));
 assert.equal(p.canonicalMutation,false);
 assert.equal(p.retainedHistoricalRecords,596);
 assert.equal(p.originalRulePriorityCount,70);
 assert.equal(p.proposedRulefieldsCount,86);
 assert.equal(p.humanClosure,'RESERVED');
});
