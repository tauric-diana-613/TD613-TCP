#!/usr/bin/env node
/**
 * RGI-08 · Real /dollhouse-design creative conductor (OPEN_FIELD).
 * Its returned composition proposes form. It does not materialize or
 * independently qualify the Opera; code materialization is the next stage.
 */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runDollhouseDesignCycle,getReferenceFullContent} from '../app/engine/dollhouse-design-conductor.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const path=resolve(root,'artifacts/vixen-dual-estate/RGI08_DOLLHOUSE_DESIGN_COMMISSION.json');
const spec=JSON.parse(await readFile(path,'utf8'));
const receipt=await runDollhouseDesignCycle(spec);
assert.equal(receipt.schema,'td613.dollhouse-design.return-receipt/v0.2');
assert.equal(receipt.output_contract.requested_deliverables,1);
assert(receipt.candidates.length>=2,'Two non-equivalent internal alternatives required');
assert.equal(receipt.governance.scientific_proof,false);
assert.equal(receipt.governance.human_closure_required,true);
assert.equal(receipt.governance.release_authority,false);
assert(receipt.historical_references.length>=5,'Full historical provenance not admitted');
for(const r of receipt.historical_references){
 assert.equal(r.inspection_protocol,'FULL_SOURCE_INGESTION',
  'No binding predecessor may be reduced to a search snippet');
 assert(getReferenceFullContent(r).length>100,
  'Native conductor must actually ingest complete source');
}
const out=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'rgi08-vixen-dollhouse-design-return.json'):
 resolve(root,'artifacts/vixen-dual-estate/rgi08-dd02-local-receipt.json');
await writeFile(out,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({
 status:'NATIVE_DD02_COMMISSION_EXECUTED',
 commission_id:receipt.commission_id,
 schema:receipt.schema,
 selected_instruments:receipt.selected_instruments,
 alternatives:receipt.candidates.map(x=>x.concept_title),
 materialization_title:receipt.primary_materialization.title,
 reference_count:receipt.historical_references.length,
 output_contract:receipt.output_contract,
 scientific_proof:false,experiment_b_flight:'HELD',
 receipt_path:out
}));
