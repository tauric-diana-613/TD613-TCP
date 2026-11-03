import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {inspectPreflightDecisionPacket,REQUIRED_DECISIONS} from '../scripts/experiment-b-preflight/pe08-decision-packet-validator-v01.mjs';
const filename=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
 '../docs/research/experiment-b-preflight/2026-11-03/PE08_D01_D20_FREEZE_READY_DECISIONS.json');
const original=()=>JSON.parse(fs.readFileSync(filename,'utf8'));
test('PE08: every D01-D20 remains explicit unresolved and no authority manufactured',()=>{
 const p=original(),x=inspectPreflightDecisionPacket(p);
 assert.equal(x.unresolved,20);assert.equal(x.approved,0);
 assert.equal(x.final_execution_authorized,false);assert.deepEqual(x.decisions,REQUIRED_DECISIONS);
 assert.equal(p.proposed_unadopted_budget_options[0],720000);
});
test('PE08: missing, duplicate, mutated decision and preselected D20 fail',()=>{
 const p=original();p.decisions.pop();assert.throws(()=>inspectPreflightDecisionPacket(p),/PE08_DECISION_COUNT/);
 const q=original();q.decisions[19].id='D01';assert.throws(()=>inspectPreflightDecisionPacket(q),/PE08_FORGED_OR_DUPLICATED_DECISION/);
 const r=original();r.decisions[19].status='APPROVED';assert.throws(()=>inspectPreflightDecisionPacket(r),/PE08_FORGED_OR_DUPLICATED_DECISION/);
 const s=original();s.final_grant_issued=true;assert.throws(()=>inspectPreflightDecisionPacket(s),/PE08_PREMATURE_FLIGHT_AUTHORITY/);
});
