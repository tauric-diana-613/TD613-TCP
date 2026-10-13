import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('docs/pedagogue/experiments/receipts/WESTERN_HORIZON_EXECUTABLE_ACCESSION_MANIFEST_V0_1.json','utf8'));

function gitBlobSha(path){
  const body=fs.readFileSync(path);
  const header=Buffer.from(`blob ${body.length}\0`,'utf8');
  return crypto.createHash('sha1').update(header).update(body).digest('hex');
}

assert.equal(manifest.schema,'td613.western-horizon.executable-accession-manifest/v0.1');
assert.equal(manifest.status,'LANDING_II_EXECUTABLE_ACCESSION_CANDIDATE');
assert.equal(manifest.new_science,false);
assert.equal(manifest.installation_root,'d652c5e151471be7e40ff6a08936ba26c0cef1ad');
assert.deepEqual(
  [manifest.accession_parent.pr,manifest.accession_parent.head,manifest.accession_parent.run_number,manifest.accession_parent.run_id,manifest.accession_parent.conclusion],
  [994,'a47ad6fa61be669d6b737eb679bb5d632f7965aa',2475,33617238395,'success']
);

for(const item of manifest.scientific_spine){
  assert.equal(fs.existsSync(item.path),true,`${item.path} must be installed.`);
  assert.equal(gitBlobSha(item.path),item.blob,`${item.path} must retain exact source Git blob identity.`);
  for(const test of item.tests){
    assert.equal(fs.existsSync(test.path),true,`${test.path} must be installed.`);
    assert.equal(gitBlobSha(test.path),test.blob,`${test.path} must retain exact source Git blob identity.`);
  }
}

for(const item of manifest.inherited_current_main_dependencies){
  assert.equal(fs.existsSync(item.path),true,`${item.path} current-main dependency must exist.`);
  assert.equal(gitBlobSha(item.path),item.blob,`${item.path} current-main dependency drifted during executable accession.`);
}

for(const item of manifest.protected_current_estate){
  assert.equal(fs.existsSync(item.path),true,`${item.role} protected path must exist.`);
  assert.equal(gitBlobSha(item.path),item.blob,`${item.role} protected current-estate blob drifted during executable accession.`);
}

assert.equal(manifest.transplant_method.git_object_reuse,true);
assert.equal(manifest.transplant_method.source_blob_identity_preserved,true);
assert.equal(manifest.transplant_method.semantic_reimplementation,false);
assert.equal(manifest.transplant_method.scientific_parent_rewritten,false);
assert.equal(manifest.transplant_method.source_receipts_rewritten,false);

assert.equal(manifest.scope.new_executable_modules,4);
assert.equal(manifest.scope.source_test_files,8);
for(const [key,value] of Object.entries(manifest.scope)){
  if(!['new_executable_modules','source_test_files'].includes(key))assert.equal(value,false,`Landing-II scope ${key} must remain false.`);
}
for(const [key,value] of Object.entries(manifest.authority))assert.equal(value,false,`Landing-II authority ${key} must remain false.`);
for(const [key,value] of Object.entries(manifest.membranes))assert.equal(value,true,`Landing-II membrane ${key} must remain true.`);
assert.equal(manifest.claims.scientific_ancestry_unchanged,true);
assert.equal(manifest.claims.golden_egg_earned,false);
assert.equal(manifest.claims.live_loom_mutated,false);

// Execute the exact transplanted canonical and hostile source tests.
await import('./ash-a15-r0-golden-egg-metric-connection-reopening.test.mjs');
await import('./ash-a15-r0-golden-egg-metric-connection-reopening-hostile.test.mjs');
await import('./ash-a15-r0-golden-egg-coobservation-admissibility.test.mjs');
await import('./ash-a15-r0-golden-egg-coobservation-admissibility-hostile.test.mjs');
await import('./ash-a15-r0-golden-egg-evidence-closure-nogo.test.mjs');
await import('./ash-a15-r0-golden-egg-evidence-closure-nogo-hostile.test.mjs');
await import('./ash-a15-r0-loom-golden-egg-same-episode-acquisition.test.mjs');
await import('./ash-a15-r0-loom-golden-egg-same-episode-acquisition-hostile.test.mjs');

const { GOLDEN_EGG_METRIC_CONNECTION_REOPENING_CERTIFICATE: G986 } = await import('../app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js');
const { GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_CERTIFICATE: G988 } = await import('../app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js');
const { GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_CERTIFICATE: G990 } = await import('../app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js');
const { LOOM_GOLDEN_EGG_ACQUISITION_CERTIFICATE: G992 } = await import('../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js');

assert.equal(G986.passed,true);
assert.equal(G986.golden_egg.golden_egg_earned,false);
assert.equal(G988.passed,true);
assert.equal(G988.golden_egg_earned,false);
assert.equal(G990.passed,true);
assert.equal(G990.golden_egg_earned,false);
assert.equal(G992.passed,true);
assert.equal(G992.golden_egg_earned,false);
assert.equal(G992.live_loom_mutated,false);
assert.equal(G992.merge_authority,false);
assert.equal(G992.production_authority,false);
assert.deepEqual(G992.statuses,{candidate:'CANDIDATE',held:'HELD',failed:'FAILED'});

const flowcore=fs.readFileSync('app/dome-world/data/flowcore-promotion-config-v01.js','utf8');
assert.match(flowcore,/default_enabled:\s*false/);
assert.match(flowcore,/route_promotion_authorized:\s*false/);
assert.match(flowcore,/human_promotion_required:\s*true/);
const rest=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_4.md','utf8');
assert.match(rest,/sequence_authority = false/);
assert.match(rest,/next_stage = null/);
assert.match(rest,/stage_unlocks = \[\]/);
const a16=fs.readFileSync('app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md','utf8');
assert.match(a16,/IMPLEMENTATION-HELD/);
assert.match(a16,/A16 mutation authority:\*\* NONE UNTIL ENTRY GATES ARE ADMITTED/);

console.log('Western Horizon minimal executable accession hardening passed.');
