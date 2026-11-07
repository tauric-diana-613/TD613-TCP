import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL('../packages/rulefield/'+path,import.meta.url),'utf8');
const parse = path => JSON.parse(read(path));
const roadmap=read('ROADMAP.md'),backlog=parse('lab/integration_backlog.json'),hooks=parse('amendments/hooks.json');
const schema=parse('amendments/schema.json'),tools=parse('lab/tool_registry.json'),locator=parse('rulebook/source_locator.json');
const names=['AGENTS.md','README.md','rulebook/LLM_QUICK_START.md','rulebook/ANTIGRAVITY_KENOUGH_ACTIVATION.md',
 'amendments/RECEIVER.md','amendments/templates/amendment.template.json','lab/README.md','lab/wolfram_comparator.wl'];
test('RULEFIELD-ROADMAP 01: 22 declared roadmap capabilities and no duplicate IDs',()=>{
 const ids=[...roadmap.matchAll(/^\| (RMAP-\d{3}) \|/gm)].map(x=>x[1]);
 assert.equal(ids.length,22);assert.equal(new Set(ids).size,22);
});
test('RULEFIELD-ROADMAP 02: all 16 machine backlog items map to canonical tiers and some roadmap item',()=>{
 assert.equal(backlog.items.length,16);
 const tiers=new Set(backlog.tiers.map(t=>t.id));
 for(const item of backlog.items){
  assert.ok(tiers.has(item.tier),item.id);
  assert.ok(item.corresponding_human_roadmap_ids?.length>0,item.id);
  for(const id of item.corresponding_human_roadmap_ids)assert.ok(roadmap.includes(id),item.id+'/'+id);
 }
 assert.equal(backlog.automatic_integration,false);
});
test('RULEFIELD-ROADMAP 03: original noncanonical tier labels retained for reconciliation',()=>{
 assert.equal(backlog.items.filter(x=>x.historical_tier_label_before_normalization).length,5);
 assert.match(backlog.normalization_note,/preserved/);
});
test('RULEFIELD-ROADMAP 04: source locator gives usable retrieval surfaces but not fictive access',()=>{
 assert.equal(locator.source_surfaces.length,10);
 assert.ok(locator.source_surfaces.some(s=>s.id==='GITHUB_REPO'));
 assert.ok(locator.source_surfaces.some(s=>s.id==='CHATGPT_LIBRARY'&&s.access==='IF_CONNECTED'));
 assert.equal(locator.required_packet_fields.includes('proposals[].controls.falsifier'),true);
});
test('RULEFIELD-ROADMAP 05: bounded scientific hook stage and no automatic adoption',()=>{
 assert.equal(hooks.stages.length,10);
 assert.deepEqual(hooks.stages.map(x=>x.stage),Array.from({length:10},(_,i)=>i));
 assert.equal(hooks.stages[4].hook,'on_finite_experiment');
 assert.equal(hooks.apply_mode,'REVIEW_FIRST_NO_AUTOMUTATION');
 assert.equal(hooks.continuous_behavior.automatic_watching_enabled,false);
});
test('RULEFIELD-ROADMAP 06: experiment schema allows exactly the three implemented engines',()=>{
 const choices=schema.properties.proposals.items.properties.experiment.oneOf.map(x=>x.properties.engine.const);
 assert.deepEqual(choices,['FINITE_STRING_MULTIWAY','FINITE_CRITICAL_PAIRS','ELEMENTARY_CA']);
 assert.equal(schema.properties.operator_authority.properties.auto_apply.const,false);
});
test('RULEFIELD-ROADMAP 07: external resources exist as references, not invented execution',()=>{
 assert.equal(tools.resources.length,12);
 assert.equal(tools.native_wolfram_was_executed,false);
 assert.equal(tools.external_wolfram_computation_credit,0);
 assert.ok(tools.resources.every(x=>x.url.startsWith('https://')));
});
test('RULEFIELD-ROADMAP 08: all significant entrances are present and documented',()=>{
 for(const name of names){assert.ok(read(name).length>300,name);}
 assert.match(read('README.md'),/ROADMAP\.md/);
 assert.match(read('AGENTS.md'),/LLM_QUICK_START\.md/);
 assert.match(read('rulebook/ANTIGRAVITY_KENOUGH_ACTIVATION.md'),/NKS/);
});
test('RULEFIELD-ROADMAP 09: original three Garden files remain linked by README',()=>{
 for(const ext of ['md','json','csv'])assert.match(read('README.md'),new RegExp('Garden_Advancement_20261107\\.'+ext));
});
test('RULEFIELD-ROADMAP 10: Wolfram comparison is staged, never presented as executed',()=>{
 assert.match(read('lab/wolfram_comparator.wl'),/NOT EXECUTED/);
 assert.match(read('lab/wolfram_comparator.wl'),/ResourceFunction\["MultiwaySystem"\]/);
 assert.match(roadmap,/no current implementation credit|not a promise/i);
});
