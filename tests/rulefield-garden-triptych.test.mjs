import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const p = x => new URL('../packages/rulefield/'+x,import.meta.url);
const load = x => readFileSync(p(x),'utf8');
const garden = JSON.parse(load('sources/nks-garden-190.snapshot.json'));
const registry = JSON.parse(load('data/rulefield.v1.json'));
const bridge = JSON.parse(load('TD613_NKS_Wolframian_Garden_Advancement_20261107.json'));
const markdown = load('TD613_NKS_Wolframian_Garden_Advancement_20261107.md');
const csvText = load('TD613_NKS_Wolframian_Garden_Advancement_20261107.csv');
const readme = load('README.md');

function parseCSV(text){
  const out=[],row=[];let buf='',quoted=false;
  const flush=()=>{row.push(buf);buf='';};
  const flushRow=()=>{flush();out.push([...row]);row.length=0;};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"'&&text[i+1]==='"'){buf+='"';i++;}
      else if(c==='"')quoted=false;
      else buf+=c;
    }else if(c==='"'){if(buf!=='')throw Error('MALFORMED_CSV_QUOTE');quoted=true;}
    else if(c===',')flush();
    else if(c==='\r'&&text[i+1]==='\n'){flushRow();i++;}
    else if(c==='\n')flushRow();
    else buf+=c;
  }
  if(quoted)throw Error('UNTERMINATED_CSV_QUOTE');
  if(buf||row.length)flushRow();
  return out;
}
const csv=parseCSV(csvText.replace(/^\uFEFF/,''));
const [headers,...data]=csv;
const rows=new Map(data.map(row=>[row[0],Object.fromEntries(headers.map((h,i)=>[h,row[i]]))]));
const original=['id','class_','family','kind','rule','transition','witness','confidence','sources','crossings_involved','research_scope_review','research_scope_comment','claim_grade','missing_bibliography_refs','notes'];
const supplementary=['rulefield_lane','claim_state','scientific_disposition','priority_ranks','priority_topics','origin_key','proposal_statement','evidence_context','related_crossing_ids','original_record_id','is_historical_baseline','source_lineage'];
const csvSet=new Set(data.map(r=>r[0]));

test('garden triptych: original v2 roots remain unchanged',()=>{
  assert.equal(bridge.schema,'td613.nks.garden-index/v2.1-rulefield-bridge');
  assert.equal(bridge.rules.length,190);
  assert.equal(bridge.crossings.length,30);
  assert.deepEqual(bridge.rules,garden.rules);
  assert.deepEqual(bridge.crossings,garden.crossings);
  for(const key of ['source_provenance','nks_experiment','aperture_selected_scan','garden_branches','unresolved_source_ids'])
    assert.deepEqual(bridge[key],garden[key],key);
});
test('garden triptych: JSON embeds complete typed 596×88×70 successor without scientific promotion',()=>{
  const x=bridge.living_rulefield;
  assert.equal(x.role,'COMPLETE_STANDALONE_MIRROR_OF_CANONICAL_RULEFIELD_V1');
  assert.deepEqual(x.comprehensive_records,registry.rules);
  assert.deepEqual(x.comprehensive_crossings,registry.crossings);
  assert.deepEqual(x.cumulative_priority_queue,registry.priority_queue);
  assert.deepEqual(x.unresolved_aliases,registry.unresolved_crossing_aliases);
  assert.equal(x.scientific_null.decision,'SOURCE_FREE_BOUNDED_TIE');
  assert.equal(x.claim_boundaries.protected_experiment_b,'HELD');
  assert.equal(x.claim_boundaries.automatic_promotion,false);
});
test('garden triptych: CSV is 596 data records and original 15 columns in order',()=>{
  assert.equal(headers.length,27);
  assert.deepEqual(headers.slice(0,15),original);
  assert.deepEqual(headers.slice(15),supplementary);
  assert.equal(data.length,596);
  assert.equal(csvSet.size,596);
  assert.deepEqual([...rows.keys()],[...registry.rules.map(r=>r.id)]);
});
test('garden triptych: all 190 legacy CSV rule cells preserve source and class',()=>{
  for(const rule of garden.rules){
    const r=rows.get(rule.id);
    assert.ok(r,'Missing original '+rule.id);
    assert.equal(r.is_historical_baseline,'TRUE');
    assert.equal(r.rulefield_lane,'HISTORICAL_NKS');
    for(const k of ['class_','family','kind','rule','transition','witness','confidence','research_scope_review','research_scope_comment','claim_grade','notes']){
      assert.equal(r[k],rule[k]==null?'':String(rule[k]),rule.id+'/'+k);
    }
    for(const key of ['sources','crossings_involved','missing_bibliography_refs']){
      assert.equal(r[key],(rule[key]||[]).join('; '),rule.id+'/'+key);
    }
  }
});
test('garden triptych: later CSV claims remain separated from inherited I/P/X',()=>{
  for(const r of registry.rules.filter(r=>r.lane!=='HISTORICAL_NKS')){
    const c=rows.get(r.id);assert.ok(c);
    assert.equal(c.class_,'',r.id);
    assert.equal(c.is_historical_baseline,'FALSE');
    assert.equal(c.rulefield_lane,r.lane);
    assert.equal(c.claim_state,r.claim_state);
    assert.equal(c.scientific_disposition,r.scientific_disposition);
  }
});
test('garden triptych: priority/rule references are lossless in CSV',()=>{
  const priority=registry.rules.find(x=>x.id==='CBFE-RG-PATH-FIBER-01');
  const r=rows.get(priority.id);
  assert.ok(r.priority_ranks.split(';').map(s=>s.trim()).includes('4'));
  assert.equal(r.claim_state,'PROPOSED_NOT_QUALIFIED');
  assert.match(r.priority_topics,/Computational Black feminist epistemology/);
  assert.equal(rows.get('I-001').original_record_id,'I-001');
});
test('garden triptych: full original Markdown is preserved and successor appendices present',()=>{
  assert.match(markdown,/# 𝌋 Computational Rule Garden — Wolframian advancement/);
  assert.match(markdown,/### III\. Executed finite two-rule pilot/);
  assert.match(markdown,/### XII\. Typed limits and human closure/);
  assert.match(markdown,/Historical Original Garden — retained in full/);
  assert.match(markdown,/Living Rulefield successor · All 406 additions/);
  assert.match(markdown,/Living Rulefield successor · All 58 later typed crossings/);
  for(const r of registry.rules.filter(x=>x.lane!=='HISTORICAL_NKS'))
    assert.ok(markdown.includes('#### '+'\x60'+r.id+'\x60'+' · '+r.lane),'Missing appendix rule '+r.id);
});
test('garden triptych: Markdown has 70 queue ranks, all typed directions',()=>{
  const section=markdown.split('## Complete cumulative operator research queue')[1]?.split('\n---\n')[0]||'';
  const matches=[...section.matchAll(/^\|\s*(\d+)\s*\|/gm)].map(x=>Number(x[1]));
  assert.deepEqual(matches,Array.from({length:70},(_,i)=>i+1));
  assert.match(markdown,/384\/384/);assert.match(markdown,/SOURCE_FREE_BOUNDED_TIE/);
  assert.match(markdown,/Black feminist epistemology/);assert.match(markdown,/Dromology/);
});
test('garden triptych: README links to each file and provides schema/use guidance',()=>{
  for(const ext of ['md','json','csv'])assert.ok(readme.includes('TD613_NKS_Wolframian_Garden_Advancement_20261107.'+ext));
  assert.match(readme,/v2\.1-rulefield-bridge/);
  assert.match(readme,/triptych\.test\.mjs/);
});
test('garden triptych: no material overwritten in source snapshots',()=>{
  assert.equal(garden.rules[0].id,'I-001');
  assert.equal(garden.rules.at(-1).id,'X-095');
  assert.equal(garden.rules.length,190);
  assert.equal(registry.rules.length,596);
  assert.ok(!registry.rules.some(x=>x.lane==='HISTORICAL_NKS'&&x.id.startsWith('CBFE-RG')));
});
