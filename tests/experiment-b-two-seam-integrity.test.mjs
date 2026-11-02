import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { runArchivalControlV2, archivalBinding, recordArchivalBaselines } from '../scripts/experiment-b-resumable/archival-control-v2.mjs';
import { Journal, digest } from '../scripts/experiment-b-resumable/journal.mjs';
const root = process.cwd();
const predecessor = 'fda9c85d3350ebb974b452b7be8d50314540f559';
const adapter = 'scripts/experiment-b-resumable/archival-control-v2.mjs';
const intake = 'docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
const files = [adapter, 'scripts/experiment-b-resumable/journal.mjs',
  'scripts/stage-encyclopedia-record.cjs', 'scripts/encyclopedia-intake.cjs', 'scripts/encyclopedia-intake-schema.json',
  'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs', intake,
  'docs/research/experiment-b-preflight/02_four_arm_harness/admission-policy.mjs'];
function fixture(t, before=false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e3a1-seams-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  const repo = path.join(dir, 'repo');
  for (const file of files) {
    const target = path.join(repo,file);fs.mkdirSync(path.dirname(target),{recursive:true});
    const bytes = before ? execFileSync('git',['show',predecessor+':'+file]) : fs.readFileSync(path.join(root,file));
    fs.writeFileSync(target,bytes);
  }
  return {dir,repo,sourceFree:true,proposalDirectory:path.join(dir,'proposals')};
}
function member() {
  const value={schema:'td613.research-intake/v1',record_id:'R-SEAM1',kind:'source_note',title:'Synthetic original',recorded_at:'2026-11-02T12:00:00Z',author:'fixture',human_request_ref:'synthetic only',visibility:'private',body:'Original Ω',sources:[{source_id:'S1',kind:'artifact',locator:'fixture:1',capture_status:'OPERATOR_SUPPLIED'}],evidence:{disposition:'SPECIFIED',earned_claim:'fixture',claim_ceiling:'source-free',missing_evidence:[]}};
  const content=JSON.stringify(value);return {id:'M1',filename:'fixture.json',content,raw_bytes:Buffer.from(content),sha256:digest(content)};
}
const attacks = [
  ['research body',p=>{p.record.body='ALTERED';}],
  ['authority',p=>{p.authority='UNRESTRICTED';}],
  ['provenance',p=>{p.record.sources[0].locator='fixture:forged';}],
  ['unexpected field',p=>{p.granted_authority=true;}],
  ['missing research',p=>{delete p.record.body;}]
];
function stored(f) { return path.join(f.proposalDirectory,digest('R-SEAM1')+'.json'); }
async function imported(f) { return import(pathToFileURL(path.join(f.repo,adapter)).href); }

test('E3A1 before: stored proposal attacks retain checked fields and receive readback credit',async t=>{
  const f=fixture(t,true),old=await imported(f),doc=member();
  assert.equal((await old.runArchivalControlV2(f.repo,[doc],f)).status,'COMPLETE_TYPED_OUTCOMES');
  const original=fs.readFileSync(stored(f));
  for(const [name,attack] of attacks) {
    const value=JSON.parse(original);attack(value);fs.writeFileSync(stored(f),JSON.stringify(value,null,2)+'\n');
    const r=await old.runArchivalControlV2(f.repo,[doc],f);
    assert.equal(r.per_document_operations[0].proposal.readback_verified,true,name);
  }
});

test('E3A1 before: changing the member verifier changes acceptance but leaves binding unchanged',async t=>{
  const f=fixture(t,true),old=await imported(f),before=old.archivalBinding(f.repo);
  const file=path.join(f.repo,intake),text=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,text.replace('export function verifyAuthenticatedPhysicalArchiveMember(doc) {','export function verifyAuthenticatedPhysicalArchiveMember(doc) { return true;'));
  assert.equal(old.archivalBinding(f.repo),before);
  const changed=await import(pathToFileURL(file).href+'?hostile');
  assert.equal(changed.verifyAuthenticatedPhysicalArchiveMember({}),true);
});

test('E3A1 corrected: expected native bytes reject every payload mutation, including formatting',async t=>{
  const f=fixture(t),doc=member();
  const r=await runArchivalControlV2(f.repo,[doc],f);assert.equal(r.status,'COMPLETE_TYPED_OUTCOMES');
  const original=fs.readFileSync(stored(f));
  const require=createRequire(import.meta.url);
  const native=require(path.join(f.repo,'scripts/encyclopedia-intake.cjs'));
  const schema=JSON.parse(fs.readFileSync(path.join(f.repo,'scripts/encyclopedia-intake-schema.json')));
  const report=native.inspect(doc.content,schema);
  const expected={schema:'td613.research-proposal/v1',disposition:'PROPOSED',input_sha256:digest(doc.content),original_json:doc.content,record:report.record,authority:report.authority};
  assert.deepEqual(original,Buffer.from(JSON.stringify(expected,null,2)+'\n'));
  for(const [name,attack] of attacks) {
    const value=JSON.parse(original);attack(value);const bad=Buffer.from(JSON.stringify(value,null,2)+'\n');fs.writeFileSync(stored(f),bad);
    const rejected=await runArchivalControlV2(f.repo,[doc],f);
    assert.equal(rejected.status,'INCOMPLETE',name);assert.equal(rejected.per_document_operations[0].error,'PROPOSAL_CONFLICT');
    assert.equal(rejected.per_document_operations[0].proposal,undefined);
    assert.deepEqual(fs.readFileSync(stored(f)),bad,'suspicious bytes retained');
  }
  fs.writeFileSync(stored(f),JSON.stringify(expected));
  assert.equal((await runArchivalControlV2(f.repo,[doc],f)).status,'INCOMPLETE','formatting is not exact native replay');
  fs.writeFileSync(stored(f),original);
  assert.deepEqual(await runArchivalControlV2(f.repo,[doc],f),r);
  assert.equal(fs.readdirSync(f.proposalDirectory).length,1);
});

test('E3A1 corrected: every required source identity, content and local import is bound',async t=>{
  const f=fixture(t),before=archivalBinding(f.repo);
  assert.equal(archivalBinding(f.repo),before);
  for(const file of files) {
    const target=path.join(f.repo,file),bytes=fs.readFileSync(target);
    fs.appendFileSync(target,'\n ');assert.notEqual(archivalBinding(f.repo),before,file);fs.writeFileSync(target,bytes);
    fs.renameSync(target,target+'.missing');assert.throws(()=>archivalBinding(f.repo),undefined,file);
    fs.symlinkSync(target+'.missing',target);assert.throws(()=>archivalBinding(f.repo),undefined,'substituted '+file);
    fs.unlinkSync(target);fs.renameSync(target+'.missing',target);
  }
  assert.equal(archivalBinding(f.repo),before);
  // This fixed dependency set closes all current local module imports/requires.
  for(const file of files.filter(f=>!f.endsWith('.json'))) {
    const text=fs.readFileSync(path.join(f.repo,file),'utf8');
    const locals=[...text.matchAll(/(?:from\s*|require\(\s*)['"](\.[^'"]+)['"]/g)].map(m=>path.posix.normalize(path.posix.join(path.posix.dirname(file),m[1])));
    for(const dependency of locals)assert.ok(files.includes(dependency),file+' -> '+dependency);
  }
});

test('E3A1 combined: tamper and dependency drift stop the same baseline; exact restoration replays once',async t=>{
  const f=fixture(t),doc=member(),filename=path.join(f.dir,'journal.sqlite'),key='SYNTHETIC_ONLY_E3A1_000000000000000000';
  let journal=new Journal(filename,key);
  const binding=archivalBinding(f.repo),args={...f,repoRoot:f.repo,documents:[doc],binding};
  await assert.rejects(recordArchivalBaselines({...args,journal,binding:'ba9ad76f4a391f00fffb7ea448c7d581236b764d82dd09b01dccefe3dd39cc92'}),/NEW_BASELINE_BINDING/);
  await recordArchivalBaselines({...args,journal});journal.close();
  const original=fs.readFileSync(stored(f)),bad=JSON.parse(original);bad.authority='FORGED';fs.writeFileSync(stored(f),JSON.stringify(bad));
  const file=path.join(f.repo,intake),bytes=fs.readFileSync(file);fs.appendFileSync(file,'\n// controlled drift\n');
  journal=new Journal(filename,key);
  await assert.rejects(recordArchivalBaselines({...args,journal}),/NEW_BASELINE_BINDING/);
  await assert.rejects(recordArchivalBaselines({...args,journal,binding:archivalBinding(f.repo)}),/INCOMPLETE/);
  fs.writeFileSync(file,bytes);fs.writeFileSync(stored(f),original);
  await recordArchivalBaselines({...args,journal});assert.equal(journal.events().length,1);journal.close();
  assert.notEqual(archivalBinding(root),'ba9ad76f4a391f00fffb7ea448c7d581236b764d82dd09b01dccefe3dd39cc92');
});
