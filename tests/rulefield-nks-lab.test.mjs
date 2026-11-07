import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {enumerate,enabledEvents,criticalPairs,resolveFork,finiteCA,runReferenceSuite} from '../packages/rulefield/lab/multiway_lab.mjs';
const mono=[{id:'R',from:'A',to:'B'}];
const open=[{id:'R1',from:'AB',to:'BA'},{id:'R2',from:'AB',to:'AA'}];
const repaired=[...open,{id:'R3',from:'BA',to:'AA'}];
test('NKS-LAB 01: events retain their distinct redex positions',()=>{
 const e=enabledEvents('AA',mono);assert.equal(e.length,2);
 assert.deepEqual(e.map(x=>x.offset),[0,1]);
 assert.deepEqual(new Set(e.map(x=>x.next)),new Set(['BA','AB']));
});
test('NKS-LAB 02: commuting local rewrites yield a two-history equal-state endpoint',()=>{
 const m=enumerate('AA',mono,{depth:2});
 assert.equal(m.endpoint.path_count,2);assert.equal(m.endpoint.unique_states,1);
 assert.equal(m.endpoint.weights[0].state,'BB');
 assert.equal(m.endpoint.weights[0].count,2);
 assert.equal(m.events.length,4);
 assert.equal(m.pathInstances.length,5);
 assert.deepEqual(m.layerCounts.map(x=>x.distinctStates),[1,2,1]);
 assert.equal(m.truncated,false);
});
test('NKS-LAB 03: exactly one bit of path identity disappears under state-only projection for uniform path weights',()=>{
 const m=enumerate('AA',mono,{depth:2});
 assert.ok(Math.abs(m.endpoint.uniform_path_entropy_bits-1)<1e-12);
 assert.ok(Math.abs(m.endpoint.state_entropy_bits)<1e-12);
 assert.ok(Math.abs(m.endpoint.conditional_history_entropy_bits-1)<1e-12);
 assert.match(m.model,/FINITE_STRING_SUBSTITUTION/);
 assert.equal(m.no_global_causal_invariance_claim,true);
});
test('NKS-LAB 04: local fork joins within declared horizon but is not global theorem',()=>{
 const f=resolveFork('BA','AB',mono,{horizon:1});
 assert.equal(f.joinable_within_bound,true);assert.equal(f.witness_state,'BB');
 assert.equal(f.disposition,'FINITE_JOIN_WITNESSED');
 assert.equal(f.left_depth,1);assert.equal(f.right_depth,1);
});
test('NKS-LAB 05: distinct terminal normal forms constitute a real counterexample to confluence for this rule set',()=>{
 const pairs=criticalPairs('AB',open,{depth:1,horizon:4});
 assert.ok(pairs.length>=1);
 const p=pairs.find(x=>x.left_state!==x.right_state);
 assert.ok(p);assert.equal(p.resolution.disposition,'PROVEN_NONJOINABLE_TERMINAL_PAIR');
 assert.equal(p.resolution.joinable_within_bound,false);
});
test('NKS-LAB 06: a proposed completion rule can make the selected fork join in finite search',()=>{
 const p=criticalPairs('AB',repaired,{depth:1,horizon:2}).find(x=>x.left_state!==x.right_state);
 assert.ok(p);assert.equal(p.resolution.joinable_within_bound,true);
 assert.equal(p.resolution.witness_state,'AA');
});
test('NKS-LAB 07: an unresolved finite search is not automatically labeled global failure',()=>{
 const p=resolveFork('AAAA','BBBB',[{id:'G',from:'A',to:'AA'},{id:'C',from:'B',to:'BB'}],{horizon:0});
 assert.equal(p.disposition,'UNKNOWN_OUTSIDE_SEARCH_BOUND');
 assert.equal(p.both_distinct_normal_forms,false);
});
test('NKS-LAB 08: finite CA evolution is reproducible with explicit periodic boundary',()=>{
 const a=finiteCA(30,{width:41,steps:24,perturb:22});
 const b=finiteCA(30,{width:41,steps:24,perturb:22});
 assert.deepEqual(a,b);assert.equal(a.rows.length,25);
 assert.equal(a.rows[0].split('1').length-1,1);
 assert.equal(a.perturbation_hamming_distance[0],1);
});
test('NKS-LAB 09: rule 90 is XOR of outer neighbors under the specified bit numbering',()=>{
 const a=finiteCA(90,{width:7,steps:1,boundary:'zero'});
 assert.equal(a.rows[0],'0001000');assert.equal(a.rows[1],'0010100');
});
test('NKS-LAB 10: Shannon entropy is a spatial finite-bit statistic, not Kolmogorov complexity',()=>{
 const a=finiteCA(30,{width:41,steps:24,perturb:22});
 assert.ok(a.spatial_binary_entropy_bits.every(x=>x>=0&&x<=1));
 assert.equal(a.proof_of_chaos,false);
 assert.match(a.warning,/NOT Kolmogorov complexity/);
});
test('NKS-LAB 11: cap exhaustion records truncation rather than false completeness',()=>{
 const a=enumerate('AAAAAA',mono,{depth:4,maxPaths:3,maxLength:24});
 assert.equal(a.truncated,true);
});
test('NKS-LAB 12: malicious or invalid source rule data cannot be executed',()=>{
 assert.throws(()=>enumerate('AA',[{id:'R',from:'',to:'B'}]),/left pattern/);
 assert.throws(()=>enumerate('AA',[{id:'R',from:'A',to:'B'}, {id:'R',from:'A',to:'C'}]),/Duplicate/);
 assert.throws(()=>enumerate('A<script>',mono),/Invalid bounded initial/);
});
test('NKS-LAB 13: candidate-generated completion remains a counterfactual proposal',()=>{
 const r=runReferenceSuite();
 assert.equal(r.status,'SOURCE_FREE_FINITE_TEST_ONLY');
 assert.equal(r.derivations.critical_pair.repair_candidate.status,'COUNTERFACTUAL_PROPOSAL_NOT_AUTO_ADOPTED');
 assert.equal(r.scope.protected_flight,'HELD');
 assert.equal(r.scope.empirical_novelty_credit,0);
 assert.equal(r.scope.real_wolfram_kernel_executed,false);
});
test('NKS-LAB 14: external model registry documents real tool affordances and no fabricated execution',()=>{
 const t=JSON.parse(readFileSync(new URL('../packages/rulefield/lab/tool_registry.json',import.meta.url),'utf8'));
 assert.equal(t.resources.length,12);
 assert.equal(t.native_wolfram_was_executed,false);
 assert.ok(t.resources.some(x=>x.id==='WFR-MULTIWAY'&&x.capabilities.includes('IncludeEventInstances')));
 assert.ok(t.resources.some(x=>x.id==='NETLOGO-WEB'));
});
