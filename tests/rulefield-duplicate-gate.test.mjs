import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readRulefield} from '../packages/rulefield/rulefield.mjs';
import {packetTemplate,inspectPacket,reviewPacket} from '../packages/rulefield/amendments/receiver.mjs';
import {buildOperatorDisclosure,renderOperatorDisclosure} from '../packages/rulefield/operator/disclosure.mjs';
import {inspectHumanDecision} from '../packages/rulefield/operator/decision.mjs';
const registry=new URL('../packages/rulefield/data/rulefield.v1.json',import.meta.url),
 before=readFileSync(registry),index=readRulefield();
const make=()=>packetTemplate({packet_id:'RF-AP-20261107-DUPLICATEGATE'});
const statement=id=>index.rules.find(x=>x.id===id).statement;
test('DUP 01 exact prior rule statement HELD with original matching ID',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-001');const r=inspectPacket(p);
 assert.equal(r.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.equal(r.duplicate_gate.status,'HELD_REVIEW_REQUIRED');
 assert.equal(r.proposals[0].scientific_state,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.equal(r.issues.at(-1).kind,'EXISTING_RULEFIELD_ENTRY_DUPLICATE');
 assert.equal(r.issues.at(-1).items[0].matched_id,'I-001');
 assert.equal(r.issues.at(-1).items[0].comparison,'NORMALIZED_TEXT_EXACT');
});
test('DUP 02 near lexical overlap HELD without claiming semantic identity',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-043').replace('theoretical','philosophical');
 const r=inspectPacket(p);assert.equal(r.status,'HELD_POSSIBLE_ENTRY_OVERLAP');
 assert.equal(r.issues.at(-1).items[0].matched_id,'I-043');
 assert.equal(r.issues.at(-1).items[0].comparison,'TOKEN_SET_JACCARD');
 assert.equal(r.duplicate_gate.semantic_equivalence_proven,false);
});
test('DUP 03 new entry proposed with existing ID cannot be admitted',()=>{
 const p=make();p.proposals[0].proposed_entry={id:'X-083',statement:'A distinctive proposed law whose identifier is still registered already in the Rulefield corpus.'};
 const r=inspectPacket(p);assert.equal(r.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.ok(r.issues.at(-1).items.some(x=>x.match_type==='EXPLICIT_ID_COLLISION'&&x.matched_id==='X-083'));
});
test('DUP 04 legitimate existing rule anchor is not treated as attempted reentry',()=>{
 const p=make();p.proposals[0].anchors.rules=['I-001'];
 const r=inspectPacket(p);assert.equal(r.status,'STAGED_FOR_REVIEW');
 assert.equal(r.duplicate_gate.checks[0].status,'NO_DUPLICATE_FOUND');
});
test('DUP 05 existing crossing recurs as new statement: HELD with source type',()=>{
 const p=make();p.proposals[0].crossing_statement=index.crossings.find(x=>x.id==='C-01').statement;
 const r=inspectPacket(p);assert.equal(r.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.ok(r.issues.at(-1).items.some(x=>x.matched_id==='C-01'&&x.matched_kind==='CROSSING'));
});
test('DUP 06 repeated current-packet candidate held even under different proposal IDs',()=>{
 const p=make();p.proposals[0].hypothesis='An original and wholly synthetic proposition about preserving several observer histories under admissible source-free transitions.';
 p.proposals.push({...p.proposals[0],id:'AP02'});
 const r=inspectPacket(p);assert.equal(r.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.equal(r.duplicate_gate.checks[1].matches[0].match_type,'EXACT_INTRA_PACKET');
 assert.equal(r.duplicate_gate.checks[1].matches[0].matched_id,'AP01');
});
test('DUP 07 human- or agent-declared possible semantic collision always prompts review',()=>{
 const p=make();p.proposals[0].duplicate_disclosure={suspected_existing_ids:['I-001'],novelty_basis:'Perhaps this is a genuinely distinct extension.'};
 const r=inspectPacket(p);assert.equal(r.status,'HELD_POSSIBLE_ENTRY_OVERLAP');
 assert.ok(r.duplicate_gate.checks[0].matches.some(x=>x.comparison==='DECLARED_POTENTIAL_MATCH'));
});
test('DUP 08 Light, Medium and Heavy disclosure preserve prior match and source',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-001');
 const r=reviewPacket(p),d=buildOperatorDisclosure(p,r),md=renderOperatorDisclosure(d);
 assert.equal(d.duplicate_admission_gate.status,'HELD_REVIEW_REQUIRED');
 assert.equal(d.known_consequences[0].duplicate_gate.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.match(md,/Prior-entry duplicate gate/);assert.match(md,/I-001/);
 assert.match(md,/NORMALIZED_TEXT_EXACT/);
 assert.equal(d.complete_receiver_review.disposition,'HELD_EXISTING_ENTRY_DUPLICATE');
});
test('DUP 09 held synthesis cannot be authorized by self-declared approval',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-001');
 const d=buildOperatorDisclosure(p,reviewPacket(p));
 const a={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_STAGED_SYNTHESIS',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
 baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:['AP01'],
 scope:'STAGED_CANDIDATE_ONLY',human_statement:'Please stage the proposal after reviewing my separate authorization and human source constraints.',
 accepts_unknown_future_patch:false};
 const r=inspectHumanDecision(a,d);assert.equal(r.status,'HELD');
 assert.ok(r.issues.includes('HELD_OR_UNQUALIFIED_REVIEW'));
});
test('DUP 10 an operator may request revision of a held packet, without executing synthesis',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-001');
 const d=buildOperatorDisclosure(p,reviewPacket(p));
 const a={schema:'td613.rulefield.operator-decision/v1',decision:'REQUEST_REVISION',
 packet_id:d.packet_id,packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
 baseline_registry_sha256:d.baseline_registry_sha256,selected_proposal_ids:['AP01'],
 scope:'STAGED_CANDIDATE_ONLY',human_statement:'Examine whether this repeats an earlier rule.',
 accepts_unknown_future_patch:false};
 const r=inspectHumanDecision(a,d);assert.equal(r.status,'READY_FOR_INDEPENDENT_HUMAN_CONFIRMATION');
 assert.equal(r.action_executed,false);
});
test('DUP 11 mathematical not-equal and equal do not become normalized exact identity',()=>{
 const p=make();p.proposals[0].hypothesis='A mathematically typed rule states that A != B given the available witness history and current source coordinates.';
 p.proposals.push({...p.proposals[0],id:'AP02',hypothesis:'A mathematically typed rule states that A = B given the available witness history and current source coordinates.'});
 const r=inspectPacket(p);
 assert.ok(!r.duplicate_gate.checks[1].matches.some(x=>x.match_type==='EXACT_INTRA_PACKET'));
});
test('DUP 12 quoting an old rule in an analysis of failure is not a new-rule attempt',()=>{
 const p=make();p.proposals[0].kind='DOCUMENT_FAILED_ASSAY';p.proposals[0].hypothesis=statement('I-001');
 assert.equal(inspectPacket(p).status,'STAGED_FOR_REVIEW');
});
test('DUP 13 proposing a second priority-heading is held; referencing one is lawful',()=>{
 const p=make();p.proposals[0].proposed_queue_title='Ambiance';
 const r=inspectPacket(p);assert.equal(r.status,'HELD_EXISTING_ENTRY_DUPLICATE');
 assert.ok(r.issues.at(-1).items.some(x=>x.matched_id==='Q01'&&x.matched_kind==='PRIORITY'));
});
test('DUP 14 original canonical registry stays byte-identical through held review',()=>{
 const p=make();p.proposals[0].hypothesis=statement('I-001');
 const r=reviewPacket(p);assert.equal(r.as_source_free.scientific_credit,0);
 assert.equal(r.original_registry_mutated,false);assert.deepEqual(readFileSync(registry),before);
});