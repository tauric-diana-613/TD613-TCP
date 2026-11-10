#!/usr/bin/env node
/**
 * Native Dollhouse Design, RGI09: inspect historical source records with full
 * content and retain two internally non-equivalent possible stagings.
 * Its returned score is a proposal until code + screenshots qualify it.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {runDollhouseDesignCycle,getReferenceFullContent}
 from '../app/engine/dollhouse-design-conductor.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await readFile(resolve(root,
 'artifacts/vixen-dual-estate/RGI09_DOLLHOUSE_DESIGN_OBSERVATORY.json'),'utf8'));
assert.equal(config.operator_requirements.operator_correction_20261110.includes('four-model'),true);
assert.equal(config.operator_requirements.conservation.includes('NO preservation authority'),true);
const result=await runDollhouseDesignCycle(config);
assert.equal(result.schema,'td613.dollhouse-design.return-receipt/v0.2');
assert.equal(result.candidates.length>=2,true);
assert.equal(result.output_contract.requested_deliverables,1);
assert.equal(result.governance.scientific_proof,false);
assert.equal(result.governance.human_closure_required,true);
assert.equal(result.governance.release_authority,false);
assert.equal(result.historical_references.length,5);
for(const r of result.historical_references){
 assert.equal(r.content_manifest?.inspection_protocol,'FULL_SOURCE_INGESTION');
 assert(getReferenceFullContent(r).length>200);
}
const out=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'rgi09-vixen-native-design.json'):
 resolve(root,'artifacts/vixen-dual-estate/rgi09-vixen-native-design-local.json');
await writeFile(out,JSON.stringify({
 schema:'emstd613.vixen.rgi09.native-dollhouse-completion/v1',
 design_return:result,
 implementation_verdict:'AWAITING_EXACT_HEAD_LIVE_RENDER_AND_HUMAN_REVIEW',
 source_visual_engine_roles:'DO_NOT_MERGE_WITH_PERFORMER',
 empirical_credit:0,experiment_b_flight:'HELD',human_closure:'RESERVED'
},null,2)+'\n');
console.log(JSON.stringify({state:'DESIGN_CYCLE_EXECUTED_NOT_QUALITY_CERTIFIED',
 candidates:result.candidates.map(x=>x.concept_title),
 instruments:result.selected_instruments,receipt:out}));
