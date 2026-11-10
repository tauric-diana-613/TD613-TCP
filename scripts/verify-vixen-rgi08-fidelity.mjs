#!/usr/bin/env node
/**
 * RGI08 bottom-up exact predecessor fidelity & successor capability witness.
 * This script compares immutable baseline source with the present checkout,
 * rather than trusting a screenshot or an authored narrative about retention.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {checkSalonCorpus,composeSalonPlan,refractSalonPlan,toyClockAssay} from '../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const baseline='adaf4da2b13abed98bbefcef30d89ac05aeee3c3';
const rel='app/encyclopedia/vix-cyb.html';
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const original=execFileSync('git',['show',baseline+':'+rel],{cwd:root,encoding:'utf8',maxBuffer:3000000});
const current=await readFile(resolve(root,rel),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=(s,id)=>{
 const m=s.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'));
 assert(m,'Script missing: '+id);return m[1]
};
const oldCorpus=read(original,'vixen-corpus-bundle');
const newCorpus=read(current,'vixen-corpus-bundle');
assert.equal(sha(newCorpus),sha(oldCorpus),'Historical Vixen source archive bytes changed');
const corpus=JSON.parse(newCorpus);
const census=checkSalonCorpus(corpus);
const oldSignature='VIXENCYBERNETICS$S_e≡[x+y]=z+1$';
const checks=[
 ['IMMUTABLE_ARCHIVE_BYTE_IDENTITY',sha(newCorpus)===sha(oldCorpus)],
 ['HISTORICAL_SIGNATURE_PRESENT',current.includes(oldSignature)],
 ...['overview','observatory','works','gates','protocols','holds','collection','reference']
  .map(id=>['VIEW_'+id.toUpperCase(),current.includes('id="view-'+id+'"')]),
 ['ORIGINAL_4_MODEL_OBSERVATORY',current.includes('data-obs-tab="planes"')&&
   current.includes('data-obs-tab="clocks"')&&
   current.includes('data-obs-tab="svd"')],
 ['CANVAS_RETAINED',current.includes('id="observatoryCanvas"')],
 ['22_ORIGINAL_FORMULA_FOLIOS',corpus.formula_folios.length===22],
 ['THE_ORIGINAL_8_GATES_REMAIN_UNADJUDICATED',
  corpus.human_gates.every(x=>x.default_state==='UNADJUDICATED_PAIR')],
 ['ORIGINAL_CART_REUSED',current.includes('window.VIXEN_STUDY_TRAY=Object.freeze(')&&
  current.includes('id="collectionItemsContainer"')],
 ['SALON_CREATIVE_ENGINE_PRESENT',current.includes('id="vixenSynthesisSalon"')],
 ['SALON_CREATED_FROM_SAME_SOURCE_CORPUS',current.includes('synthesis-salon.mjs')&&
  current.includes('id="vixen-corpus-bundle"')],
 ['OPERAHOUSE_SEPARATION',current.includes('id="operahouseEncounter"')&&
  !current.includes('Eclipse–Omega')&&!current.includes('Eclipse-Omega')],
 ['MACHINE_TASK_INTERFACE_SEPARATE',current.includes('podium/manifest.json')],
 ['HUMAN_AUTHORSHIP_NOT_PROMOTED',corpus.works.every(x=>x.authorship==='UNRESOLVED')],
 ['ORIGINAL_HUMAN_GATE_SENSITIVITY_UNALTERED',corpus.human_gates.length===8],
 ['NO_AUTOMATIC_PROTECTED_FLIGHT',current.includes('"experiment_b_flight":"HELD"')]
];
for(const [name,pass] of checks)assert(pass,'EXACT_SOURCE_FIDELITY_FAILURE: '+name);
const sample={
 work_ids:[corpus.works[0].work_id,corpus.works[13].work_id],
 track_id:corpus.giveback_tracks[0].id,
 protocol_id:corpus.instruments[0].instrument_id,
 lag_ticks:64,route_order:'A_B'
};
const plan=composeSalonPlan(corpus,sample),refracted=refractSalonPlan(corpus,sample);
assert.equal(plan.status,'OPEN_FIELD_UNRATIFIED_QUESTION');
assert.equal(plan.experiment_b.status,'HELD_NO_PROTECTED_FLIGHT');
assert.equal(plan.authority.manifest_successor,'UNKNOWN');
assert.equal(refracted.route_memory_non_equivalent,true);
assert.notDeepEqual(toyClockAssay({lag:0}).arrival_order,toyClockAssay({lag:120}).arrival_order,
 'Toy clock sensitivity must be consequential under perturbation');
const result={
 schema:'td613.vixen.rgi08.reparative-exact-head-retention/v1',
 original_predecessor_sha:baseline,current_head:head,
 original_corpus_sha256:sha(oldCorpus),successor_corpus_sha256:sha(newCorpus),
 checks:checks.map(([name,pass])=>({name,pass})),
 corpus_census:census,
 performed_probes:['SOURCE_REJECTION','CLOCK_SENSITIVITY','SOURCE_ORDER_NON_EQUIVALENCE'],
 source_free_read_only:true,independent_empirical_acquisition_credit:0,
 experiment_b_flight:'HELD',scientific_qualification:'NOT_GRANTED',
 authored_by:'NATIVE_SOURCE_RETENTION_ASSAY',human_creative_closure:'RESERVED'
};
const path=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'rgi08-vixen-source-fidelity.json'):
 resolve(root,'artifacts/vixen-dual-estate/rgi08-source-fidelity.json');
await writeFile(path,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({head,base:baseline,checks:checks.length,
 source_digest:sha(newCorpus),status:'SOURCE_ARCHIVE_BYTE_IDENTICAL',
 experiment_b:'HELD',out:path}));
