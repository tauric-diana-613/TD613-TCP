import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
const root=new URL('../packages/rulefield/rulefields/research/ninth_order_confluence_proposal.json',import.meta.url);
const p=JSON.parse(readFileSync(root,'utf8'));
const source=JSON.parse(readFileSync(new URL('../packages/rulefield/sources/wolfram-rule-atlas-20261107/TD613_NKS_Rule_Atlas_Convergence_Edition.json',import.meta.url),'utf8'));
test('source-anchored rule and crossing identity without invented entries',()=>{for(const id of p.anchors.rules)assert.ok(source.rules.some(x=>x.id===id),id);for(const id of p.anchors.crossings)assert.ok(source.crossings.some(x=>x.id===id),id)});
test('no canonical promotion or historic priority mutation',()=>{assert.equal(p.admission,'RESEARCH_PROPOSAL_ONLY');assert.equal(p.canonicalMutation,false);assert.equal(p.originalRulePriorityCount,70);assert.equal(p.proposedRulefieldsCount,86);assert.equal(p.retainedHistoricalRecords,596);assert.equal(p.experimentB,'HELD');assert.equal(p.humanClosure,'RESERVED')});
test('retains failed Argon rank claim and separate calibration scope',()=>{assert.ok(p.researchClaims.some(x=>x.id==='N9-C2'&&x.claim.includes('rank 5')));assert.ok(p.researchClaims.some(x=>x.id==='N9-C6'&&x.empirical==='HOLD'));assert.equal(p.type,'PROPOSE_ASSAY')});
