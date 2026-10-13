import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifestPath='docs/pedagogue/experiments/receipts/WESTERN_HORIZON_MAIN_ACCESSION_MANIFEST_V0_1.json';
const constitutionPath='docs/pedagogue/experiments/WESTERN_HORIZON_MAIN_ACCESSION_CONSTITUTION_V0_1.md';
const scarsPath='docs/pedagogue/experiments/WESTERN_HORIZON_RED_SCAR_LEDGER_V0_1.md';
const concordancePath='docs/pedagogue/experiments/WESTERN_HORIZON_CURRENT_ESTATE_CONCORDANCE_V0_1.md';

for(const path of [manifestPath,constitutionPath,scarsPath,concordancePath]){
  assert.equal(fs.existsSync(path),true,`${path} must remain present in the accession packet.`);
}

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const constitution=fs.readFileSync(constitutionPath,'utf8');
const scars=fs.readFileSync(scarsPath,'utf8');
const concordance=fs.readFileSync(concordancePath,'utf8');

assert.equal(manifest.schema,'td613.western-horizon.main-accession-manifest/v0.1');
assert.equal(manifest.status,'ACCESSION_CANDIDATE_SYNTHESIS_ONLY');
assert.equal(manifest.accession_stage,1);
assert.equal(manifest.new_science,false);
assert.equal(manifest.runtime_mutation,false);

assert.equal(manifest.installation_parent.branch,'main');
assert.equal(manifest.installation_parent.commit,'d652c5e151471be7e40ff6a08936ba26c0cef1ad');
assert.equal(manifest.scientific_tip.pr,992);
assert.equal(manifest.scientific_tip.head,'22c49c9b4f4e322924aa660984674d47fc9a0fb9');
assert.equal(manifest.scientific_tip.run_number,2474);
assert.equal(manifest.scientific_tip.run_id,33613117687);
assert.notEqual(manifest.installation_parent.commit,manifest.scientific_tip.head,'Installation parent must not collapse into the Western science tip.');

const expectedScience=[
  [986,'783fdf0c6fa0a75607e23845700c0963bca6e575','10da68f064a49f658a534a37a72fd716a8638429',2470,33603285465],
  [988,'4474b65c5ecd6dfc8c19cbaf0146bfdeea078a4d','5a6a0f6bc7503212115ee40cb77d69341e609d55',2472,33606487481],
  [990,'28ba14628326db37282d3d78335d6ee707b087b4','8f12e24b4a0a7598449a6c732a90bd4b875e630c',2473,33607462701],
  [992,'22c49c9b4f4e322924aa660984674d47fc9a0fb9','a503c0aca6e40f92edcb638308d722ab1f65a9ff',2474,33613117687]
];
assert.deepEqual(manifest.scientific_ancestry.map(x=>[x.pr,x.head,x.executable.blob,x.run_number,x.run_id]),expectedScience);
for(const item of manifest.scientific_ancestry)assert.equal(item.conclusion,'success');
for(let i=1;i<manifest.scientific_ancestry.length;i++)assert.equal(manifest.scientific_ancestry[i].parent,manifest.scientific_ancestry[i-1].head,'Compact return spine must retain exact scientific parentage.');

assert.equal(manifest.historical_governance.a15_r0_rest.blob,'bf02a8ff157d9f275536d7b161fa93b223ba2d55');
assert.equal(manifest.historical_governance.a15_r0_rest.required_state.sequence_authority,false);
assert.equal(manifest.historical_governance.a15_r0_rest.required_state.next_stage,null);
assert.deepEqual(manifest.historical_governance.a15_r0_rest.required_state.stage_unlocks,[]);
assert.equal(manifest.historical_governance.a16_a19_handoff.blob,'40a5e79abe87fa3b0ede4e9319b40353c04a7b96');
assert.equal(manifest.historical_governance.a16_a19_handoff.required_state.a16_mutation_authority,false);

assert.equal(manifest.flowcore_gate.blob,'539bf40b59066e65572f55547b7091740b4f8e96');
assert.equal(manifest.flowcore_gate.required_state.default_enabled,false);
assert.equal(manifest.flowcore_gate.required_state.governed_state_mutation_allowed,false);
assert.equal(manifest.flowcore_gate.required_state.route_promotion_authorized,false);
assert.equal(manifest.flowcore_gate.required_state.human_promotion_required,true);
assert.equal(manifest.live_loom_source_custody.blob,'695d22ec77339bc54512fe6a6a7c0203240ff135');
assert.equal(manifest.live_loom_source_custody.mutated_by_accession,false);

const flowcoreSource=fs.readFileSync('app/dome-world/data/flowcore-promotion-config-v01.js','utf8');
assert.match(flowcoreSource,/default_enabled:\s*false/,'Current Flow-Core gate must remain default OFF during Landing I.');
assert.match(flowcoreSource,/governed_state_mutation_allowed:\s*false/,'Landing I must not widen Flow-Core governed-state mutation.');
assert.match(flowcoreSource,/route_promotion_authorized:\s*false/,'Landing I must not promote guarded Flow-Core routes.');
assert.match(flowcoreSource,/human_promotion_required:\s*true/,'Human Flow-Core promotion gate must remain explicit.');

const restSource=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_4.md','utf8');
assert.match(restSource,/sequence_authority = false/);
assert.match(restSource,/next_stage = null/);
assert.match(restSource,/stage_unlocks = \[\]/);
assert.match(restSource,/golden_egg_earned = false/);

const a16Source=fs.readFileSync('app/dome-world/docs/ash/closure/ASH_KEEP_A16_A19_ENTRY_HANDOFF_V0_1.md','utf8');
assert.match(a16Source,/IMPLEMENTATION-HELD/);
assert.match(a16Source,/A16 mutation authority:\*\* NONE UNTIL ENTRY GATES ARE ADMITTED/);
assert.match(a16Source,/A16 begins with an admissibility gate, not a feature/);

const scarsExpected=[
  [963,'5ae5d3faa1bff0e92273bf4fd3f569b37f0e979e',2436,33567853315,'d19d4f8d48c10df624f9c0574aeee9c687cfb4af',2437,33571045042],
  [988,'573e6a4b1860c678b13b89c0637599a41e8f04c9',2471,33605319396,'4474b65c5ecd6dfc8c19cbaf0146bfdeea078a4d',2472,33606487481]
];
for(const expected of scarsExpected){
  const item=manifest.late_red_scars.find(x=>x.pr===expected[0]);
  assert.ok(item,`RED scar PR #${expected[0]} must remain registered.`);
  assert.deepEqual([item.pr,item.failed_head,item.failed_run_number,item.failed_run_id,item.repaired_head,item.repaired_run_number,item.repaired_run_id],expected);
}
const p982=manifest.late_red_scars.find(x=>x.pr===982);
assert.ok(p982);
assert.equal(p982.failed_head,'e71e8c9c1b6b7baca52437e067dff820958c21f8');
assert.equal(p982.failed_run_number,2462);
assert.equal(p982.failed_run_id,33596892300);
assert.equal(p982.second_failed_head,'feda9450850fda3ad451b8a4c4916b3612883340');
assert.equal(p982.second_failed_run_number,2465);
assert.equal(p982.second_failed_run_id,33597660356);
assert.equal(p982.repaired_head,'3bb479aac6ce4791eec37cee8d1c438357dd860c');
assert.equal(p982.repaired_run_number,2468);
assert.equal(p982.repaired_run_id,33598338452);

for(const [key,value] of Object.entries(manifest.membranes))assert.equal(value,true,`Accession membrane ${key} must remain true.`);
for(const [key,value] of Object.entries(manifest.authority))assert.equal(value,false,`Landing I authority ${key} must remain false.`);

assert.equal(manifest.landing_stage_1.western_executable_transplantation,false);
assert.equal(manifest.landing_stage_1.app_index_mutation,false);
assert.equal(manifest.landing_stage_1.flowcore_config_mutation,false);
assert.equal(manifest.landing_stage_1.ash_runtime_mutation,false);
assert.equal(manifest.landing_stage_1.loom_runtime_mutation,false);
assert.equal(manifest.landing_stage_1.a16_implementation,false);
assert.equal(manifest.landing_stage_1.deployment_mutation,false);
assert.equal(manifest.future_stages.landing_2_minimal_executable_accession,'HELD');
assert.equal(manifest.future_stages.landing_3_current_estate_a16_readmission_audit,'HELD');
assert.equal(manifest.future_stages.a16_implementation,'HELD');

for(const law of [
  'INSTALLATION_PARENT != SCIENTIFIC_PARENT',
  'SCIENTIFIC_ANCESTRY != SOURCE_CUSTODY',
  'INSTALLATION != ACTIVATION',
  'A16_HUMAN_EMPIRICISM != GOLDEN_EGG_MATCHED_ROUTE_EMPIRICISM',
  'REPAIR != ERASURE'
])assert.ok(constitution.includes(law),`Constitution must preserve ${law}.`);

assert.match(scars,/GREEN_SUCCESSOR != RETROACTIVE_GREEN_PREDECESSOR/);
assert.match(scars,/SCIENCE_ANCESTRY != SOURCE_EVIDENCE/);
assert.match(concordance,/DIRECT_WESTERN_BRANCH_MERGE = REJECTED_AS_ACCESSION_MECHANISM/);
assert.match(concordance,/A16_MUTATION_AUTHORITY = HELD/);
assert.match(concordance,/FLOWCORE_PUBLIC_PROMOTION = NOT_GRANTED/);
assert.match(concordance,/GOLDEN_EGG_EARNED = FALSE/);
assert.match(concordance,/LANDING != ACTIVATION/);

const forbiddenStage1Paths=[
  'app/dome-world/index.html',
  'app/dome-world/data/flowcore-promotion-config-v01.js',
  'app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js',
  'app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js',
  'app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js',
  'app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js'
];
for(const path of forbiddenStage1Paths)assert.equal(manifest.landing_stage_1.allowed_path_classes.includes(path),false,`${path} cannot be a Landing-I admitted path.`);

console.log('Western Horizon Main Accession Constitution hardening passed.');
