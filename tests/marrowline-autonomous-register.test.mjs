import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../app/dome-world/marrowline-historical-grove.js';
import { MARROWLINE_AUTONOMOUS_REGISTER_ID, INHERITED_COMPULSION_RELEASES, releaseInheritedRegisterCompulsion } from '../app/dome-world/marrowline-autonomous-register.js';
import { MARROWLINE_GROVE_TRIAL_TAB_KEY, groveTrialFromLocation, resolveMarrowlineGroveTrialTab, selectMarrowlineGroveTrial } from '../app/dome-world/marrowline-grove-trial.js';

const packet = buildInvocationPacket({
  message: 'Stage a fictional systems tribunal hearing on a misplaced denominator. Let the dual-voice scene be inventive and argumentative.',
  history: [{role:'user',text:'The committee misplaced its appendix.'},{role:'model',text:'Kʰonapolit\nA witness.\nTauric Diana bots\nH\u0300\u0316'}],
  mode:'issued-conjunction',waiveIssuance:true
});

test('historical archive stays byte-identical; each compulsory style clause is relaxed exactly once',()=>{
  const preserved = buildGeminiRequest(packet,{},'gemini-3.8-flash',{groveTrial:MARROWLINE_HISTORICAL_TRIAL_ID});
  const fresh = buildGeminiRequest(packet,{},'gemini-3.8-flash',{groveTrial:MARROWLINE_AUTONOMOUS_REGISTER_ID});
  const original = preserved.systemInstruction.parts[0].text;
  const changed = fresh.systemInstruction.parts[0].text;
  assert.equal(releaseInheritedRegisterCompulsion(original), changed);
  assert.deepEqual(fresh.contents,preserved.contents);
  assert.deepEqual(fresh.generationConfig,preserved.generationConfig);
  assert.equal(INHERITED_COMPULSION_RELEASES.length,8);
  let undone = changed;
  for(const {inherited,autonomous} of INHERITED_COMPULSION_RELEASES){
    assert.equal(original.split(inherited).length,2, 'one inherited clause');
    assert.equal(changed.includes(inherited),false, 'compulsory phrase removed');
    assert.equal(changed.split(autonomous).length,2, 'one replacement clause');
    undone=undone.replace(autonomous,inherited);
  }
  assert.equal(undone,original,'all non-compulsion text and ordering remain byte-identical');
  assert.match(original,/Change above\/below combinations, stack depths and clean intervals across words/);
  assert.match(changed,/neither persistence nor variation is compulsory/);
  assert.match(changed,/any register may persist for the entire movement/);
  assert.match(changed,/Deliberate repeated patterns remain available creative choices/);
  assert.match(changed,/GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:/);
  assert.match(changed,/APERTURE ROUTE RECEIPT:/);
  assert.throws(()=>releaseInheritedRegisterCompulsion(changed),/INHERITED_CLAUSE_DRIFT/);
});

test('normal historic and no-trial requests remain untouched for both approved models',()=>{
  assert.equal(packet.canInvoke,true);
  for(const model of ['gemini-4-argon','gemini-3.8-flash']){
    const defaultRequest=buildGeminiRequest(packet,{},model);
    const historical=buildGeminiRequest(packet,{},model,{groveTrial:MARROWLINE_HISTORICAL_TRIAL_ID});
    const candidate=buildGeminiRequest(packet,{},model,{groveTrial:MARROWLINE_AUTONOMOUS_REGISTER_ID});
    assert.deepEqual(defaultRequest.contents,historical.contents);
    assert.deepEqual(historical.contents,candidate.contents);
    assert.deepEqual(defaultRequest.generationConfig,candidate.generationConfig);
    assert.deepEqual(historical.generationConfig,candidate.generationConfig);
    assert.equal(candidate.systemInstruction.parts[0].text,releaseInheritedRegisterCompulsion(historical.systemInstruction.parts[0].text));
    assert.notEqual(candidate.systemInstruction.parts[0].text,historical.systemInstruction.parts[0].text);
  }
});

test('autonomous trial is URL-only, not sticky, not available to attachments or release canaries',()=>{
  const storageMap=new Map([[MARROWLINE_GROVE_TRIAL_TAB_KEY,MARROWLINE_HISTORICAL_TRIAL_ID]]);
  const storage={getItem:key=>storageMap.get(key),setItem:(key,value)=>storageMap.set(key,value)};
  assert.equal(groveTrialFromLocation({search:'?groveTrial='+MARROWLINE_AUTONOMOUS_REGISTER_ID}),MARROWLINE_AUTONOMOUS_REGISTER_ID);
  const selected=resolveMarrowlineGroveTrialTab({search:'?groveTrial='+MARROWLINE_AUTONOMOUS_REGISTER_ID},storage);
  assert.equal(selected.id,MARROWLINE_AUTONOMOUS_REGISTER_ID);
  assert.equal(selected.persistence,'url-only');
  assert.equal(storageMap.get(MARROWLINE_GROVE_TRIAL_TAB_KEY),MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(resolveMarrowlineGroveTrialTab({search:''},storage).id,MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(selectMarrowlineGroveTrial({groveTrial:MARROWLINE_AUTONOMOUS_REGISTER_ID}),MARROWLINE_AUTONOMOUS_REGISTER_ID);
  assert.equal(selectMarrowlineGroveTrial({groveTrial:MARROWLINE_AUTONOMOUS_REGISTER_ID,attachments:[{name:'private.pdf'}]}),null);
  assert.equal(selectMarrowlineGroveTrial({groveTrial:MARROWLINE_AUTONOMOUS_REGISTER_ID},{releaseCanary:true}),null);
  const code=readFileSync(new URL('../server/khonapolit-quality.js',import.meta.url),'utf8');
  assert.match(code,/const isHistoricalGrove = groveTrial === MARROWLINE_HISTORICAL_TRIAL_ID \|\| autonomousRegisterTrial/);
  assert.match(code,/id: groveTrial,/);
  assert.match(code,/restored-voice-autonomous-register-opt-in-20261019/);
});
