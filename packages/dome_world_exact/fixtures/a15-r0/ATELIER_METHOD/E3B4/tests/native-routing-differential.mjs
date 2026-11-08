import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {explore} from '../src/src-compositional-v01.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export const runner=fileURLToPath(new URL('../native/run-projective-routing-grammar-assay.py',import.meta.url));
export const fixtureRoot=path.resolve('tests/fixtures/e3b41-invented');
export const runnerHash='46064cf61399cd228141f4f51949d2840422fbc0737202258114a68a4b1cce43';
export function verifyFixtures(){
 const manifest=JSON.parse(fs.readFileSync(path.join(fixtureRoot,'MANIFEST.json')));
 for(const row of manifest.files){const b=fs.readFileSync(path.join(fixtureRoot,row.path));if(b.length!==row.bytes||hash(b)!==row.sha256)throw Error('FIXTURE_MANIFEST_MISMATCH');}
 if(hash(fs.readFileSync(runner))!==runnerHash)throw Error('NATIVE_RUNNER_PIN_MISMATCH');
 return manifest;
}
export function loadInput(root){
 const dir=path.join(root,'03-DERIVATIVES/text/zenodo');
 const documents=fs.readdirSync(dir).filter(n=>/^zenodo-\d+-file-0.md$/.test(n)).sort().map(name=>{
  const id=name.match(/^zenodo-(\d+)/)[1],metadata='zenodo-'+id+'-metadata.md';
  const body_bytes=fs.readFileSync(path.join(dir,name)),metadata_bytes=fs.readFileSync(path.join(dir,metadata));
  return {entity_id:'zenodo:'+id,body_bytes,metadata_bytes,body_sha256:hash(body_bytes),metadata_sha256:hash(metadata_bytes),body_path:'03-DERIVATIVES/text/zenodo/'+name,metadata_path:'03-DERIVATIVES/text/zenodo/'+metadata,rights:'INVENTED_SOURCE_FREE'};
 });
 return {synthetic_only:true,evidence_class:'SYNTHETIC_REPLAY_ONLY',documents};
}
const bridge=`import sys,importlib.util,json
sys.dont_write_bytecode=True
from pathlib import Path
spec=importlib.util.spec_from_file_location('native_src_routing',sys.argv[1]);m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
docs=m.load_documents(Path(sys.argv[2]))
print(json.dumps({'explore':m.explore_observations(docs),'signatures':m.signature_observations(docs)},ensure_ascii=False))`;
function run(args){const r=spawnSync('python3',args,{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},timeout:15000});if(r.error||r.status!==0)throw Error('NATIVE_RUNNER_FAILED:'+r.stderr);return r.stdout;}
export function differential(root){
 if(hash(fs.readFileSync(runner))!==runnerHash)throw Error('NATIVE_RUNNER_PIN_MISMATCH');
 // Only a newly allocated synthetic directory is admitted to the original runner.
 const real=fs.realpathSync(root);
 if(path.dirname(real)!==os.tmpdir()||!path.basename(real).startsWith('e3b41-case-'))throw Error('ISOLATED_SYNTHETIC_ROOT_REQUIRED');
 const input=loadInput(real),before=JSON.stringify(input.documents.map(d=>[d.body_sha256,d.metadata_sha256]));
 const stdout=run([runner,'--self-test','--root',real]);
 const native=JSON.parse(run(['-c',bridge,runner,real]));
 const recipient=explore(input);
 if(JSON.stringify(loadInput(real).documents.map(d=>[d.body_sha256,d.metadata_sha256]))!==before)throw Error('READ_ONLY_FIXTURE_CHANGED');
 if(fs.existsSync(path.join(real,'04-RECEIPTS')))throw Error('UNEXPECTED_NATIVE_WRITE');
 return {evidence_class:'SYNTHETIC_REPLAY_ONLY',native_runner_sha256:runnerHash,
  command:['python3',runner,'--self-test','--root',real],write_flag:false,real_src_admission:false,
  historical_native_labels_are_not_source_authority:true,fixture_sources:input.documents.map(d=>({source_id:d.entity_id,body_sha256:d.body_sha256,metadata_sha256:d.metadata_sha256,raw_body:d.body_bytes.toString('utf8'),raw_metadata:d.metadata_bytes.toString('utf8')})),
  native_cli_stdout:stdout,native,recipient};
}
export const exploreKeys=['explore_observation_id','source_id','source_title','source_created','raw_token','normalized_token','machine_candidates','observation_status','human_disposition_required'];
export const signatureKeys=['signature_observation_id','normalized_signature','manifestation_count','observation_status','members','coordinate_class','coordinate_inference_permitted'];
export const project=(rows,keys)=>rows.map(row=>Object.fromEntries(keys.map(k=>[k,row[k]])));
export function copyCase(name){
 verifyFixtures();const dir=fs.mkdtempSync(path.join(os.tmpdir(),'e3b41-case-'));
 fs.cpSync(path.join(fixtureRoot,name),dir,{recursive:true});return dir;
}
