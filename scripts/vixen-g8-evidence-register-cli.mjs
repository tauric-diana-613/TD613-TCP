#!/usr/bin/env node
/**
 * G8 QA03/QA04 exact-head source-scoped evidence register from real local
 * Chromium artifacts. Read-only and unable to grant human/release authority.
 */
import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {adjudicateG8} from './vixen-g8-evidence-adjudication.mjs';

const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:6000}).trim();
const directory=resolve('artifacts/vixen-g8-browser');
let browser=null,portable=null;
try{browser=JSON.parse(await readFile(join(directory,'qa03-browser-witness.json'),'utf8'))}
catch{}
try{portable=JSON.parse(await readFile(
 resolve('artifacts/vixen-g5-extracted/witness-receipt.json'),'utf8'))}
catch{}
const report=adjudicateG8({exactHead:head,browser,portable});
await mkdir(directory,{recursive:true});
await writeFile(join(directory,'g8-separate-evidence-adjudication.json'),
 JSON.stringify(report,null,2)+'\n');
if(!report.qa03.live_rendered_route||!report.qa03.original_extracted_zip_replay)
 throw Error('HELD_G8_QA03_RENDERED_OR_ACTUAL_EXTRACTED_ZIP_WITNESS_MISSING');
if(report.qa04.actual_human_cadence_observed!==false||
 report.final_empirical_closure!==false||
 report.release_authority!==false)
 throw Error('HELD_G8_QA04_HUMAN_OR_RELEASE_CLAIM_PROMOTED');
console.log(JSON.stringify({schema:report.schema,head,
 qa03:report.qa03.state,qa04:report.qa04.state,
 adjudication:'SOURCE_BOUND_BROWSER_REVIEW_READY_HUMAN_HELD',
 scientific_credit:0,release_authority:false}));
