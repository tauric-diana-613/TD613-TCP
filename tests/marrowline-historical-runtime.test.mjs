import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID, MARROWLINE_RESTORED_MODEL_ORDER } from '../app/dome-world/marrowline-historical-grove.js';

const native = 'T\u0300\u0301\u0302\u0316\u0317A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
const slash = 'T\u0337A\u0338U\u0337R\u0338I\u0337C\u0338';
const horizontal = [
  'Kʰonapolit',
  'The living first movement follows its own inference instead of quoting a style instruction.',
  '',
  'Tauric Diana bots',
  `${slash.repeat(8)} THE FIRST CHORUS DRAWS A LINE INSTEAD OF VERTICAL CROWNS!`,
  `${slash.repeat(8)} THE SECOND SEAT MAY COMPETE WITHOUT REPAINTING THE FIRST!`
].join('\n');
const vertical = [
  'Kʰonapolit',
  'Let P map provider candidates to transport outcomes. A three-seat truncation is non-exhaustive when a later approved candidate remains callable, so transport failure in the prefix cannot certify route failure.',
  '',
  'Tauric Diana bots',
  `${native.repeat(8)} DO NOT CONFUSE THE PREFIX WITH THE FRONTIER!`,
  `${native.repeat(8)} THE FIFTH DOOR STILL COUNTS WHEN THE FIRST FOUR JAM!`,
  `${native.repeat(8)} HOLD THE QUALITY FLOOR, NOT THE BROKEN QUEUE!`
].join('\n');
const unvoiced = 'The committee stored the moon in an unused cabinet without either character heading.';

function makeResponse() {
  return {
    statusCode: 200, headers:{}, count:0,
    setHeader(key,value) { this.headers[key] = value; },
    end(value) { this.count++; this.payload = JSON.parse(value); }
  };
}
function modelPayload(text) {
  return {
    candidates: [{ finishReason:'STOP', content:{parts:[{ text: JSON.stringify({
      signal:{state:'LOCKED',notes:'synthetic offline historical trial'},
      transmission:{text,voices:['Kʰonapolit','Tauric Diana bots'],flourishMode:'provider-native'}
    }) }]} }],
    usageMetadata:{promptTokenCount:150,candidatesTokenCount:150,thoughtsTokenCount:30,totalTokenCount:330}
  };
}
async function runMock(t, {available, choose, trial=true, requestIp='203.0.113.242'}) {
  const priorFetch=globalThis.fetch;
  const priorKey=process.env.GEMINI_API_KEY;
  t.after(()=>{
    globalThis.fetch=priorFetch;
    if(priorKey===undefined)delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY=priorKey;
    clearGeminiModelState();
  });
  clearGeminiModelState();
  process.env.GEMINI_API_KEY='offline-simulated-provider';
  const models=[];
  const requests=[];
  globalThis.fetch=async(url,options={})=>{
    const link=String(url);
    if(link.includes('/models?')) return {
      ok:true,status:200,
      json:async()=>({models:available.map(name=>({name:'models/'+name,supportedGenerationMethods:['generateContent']}))})
    };
    const model=link.match(/models\/([^:]+):(?:streamGenerateContent|generateContent)/)?.[1];
    if(!model)throw Error('unrecognized mock request '+link);
    models.push(model);
    requests.push(JSON.parse(options.body||'{}'));
    return {
      ok:true,status:200,headers:{get:()=>null},
      json:async()=>modelPayload(choose(model,models.length))
    };
  };
  const res=makeResponse();
  const body={message:'In the fictional grove, how does the tribunal mistake its census for the whole living moon?',
    history:[],mode:'issued-conjunction',waiveIssuance:true};
  if(trial)body.groveTrial=MARROWLINE_HISTORICAL_TRIAL_ID;
  await handler({method:'POST',headers:{'x-forwarded-for':requestIp},body},res);
  return {res,models,requests};
}

test('restored voice: unvoiced Gemini STOP is observable and not a false clinical or PAUSED event',async t=>{
  const {res,models}=await runMock(t,{
    available:['gemini-4-argon','gemini-3.8-flash'],
    choose:()=>unvoiced
  });
  assert.equal(res.count,1);
  assert.equal(res.statusCode,200);
  assert.equal(res.payload.text,unvoiced);
  assert.equal(res.payload.grove_trial.id,MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(res.payload.receipt.grove_trial.id,MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(res.payload.grove_trial.admission_policy,'unvoiced-provider-return-visible-but-not-admitted');
  assert.equal(res.payload.relay.admission.admissible,false);
  assert.equal(res.payload.relay.signal.downstreamAdmitted,false);
  assert.equal(res.headers['X-TD613-Grove-Trial'],MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.ok(models.length>=1 && models.length<=6, 'historical five model seats plus one structural repair');
  assert.equal(models[0],'gemini-4-argon');
  assert.ok(models.every(model=>MARROWLINE_RESTORED_MODEL_ORDER.includes(model)));
  assert.equal(res.payload.grove_trial.variant,'restored-voice-argon-frontier-20261019');
  assert.equal(res.payload.grove_trial.attempt_models.length,models.length);
});

test('restored voice: planar Argon field gives one native 3.8 author the same original-byte opportunity',async t=>{
  const {res,models,requests}=await runMock(t,{
    available:['gemini-3.8-flash','gemini-3.5-flash','gemini-4-argon'],
    requestIp:'203.0.113.243',
    choose:model=>model==='gemini-4-argon'?horizontal:vertical
  });
  assert.equal(res.count,1);
  assert.equal(res.statusCode,200);
  assert.deepEqual(models,['gemini-4-argon','gemini-3.8-flash'], JSON.stringify({
    result_status:res.statusCode,
    model_count:models.length,
    output_text:res.payload?.text?.slice(0,200),
    admission:res.payload?.receipt?.provider?.attempts?.map(a=>({
      model:a.model,completion:a.completion?.reason,admission:a.outputAdmission?.reasons,
      quality:a.outputAdmission?.quality,warnings:a.outputAdmission?.qualityWarnings
    }))
  }));
  assert.equal(res.payload.text,vertical);
  assert.equal(res.payload.receipt.provider.model,'gemini-3.8-flash');
  assert.deepEqual(res.payload.grove_trial.requested_model_order, MARROWLINE_RESTORED_MODEL_ORDER);
  assert.deepEqual(res.payload.grove_trial.eligible_model_order, ['gemini-4-argon','gemini-3.8-flash','gemini-3.5-flash']);
  assert.deepEqual(res.payload.grove_trial.attempt_models,models);
  assert.equal(res.payload.grove_trial.attempt_models.length,2,'only two seats were actually invoked');
  assert.equal(res.payload.receipt.provider.attempts[0].morphologyObservation.historicalPreference,true);
  assert.equal(res.payload.receipt.provider.attempts[0].morphologyObservation.nextApprovedSeatRequested,true);
  assert.ok(requests.every(request=>!('responseMimeType' in request.generationConfig)));
  assert.ok(vertical.includes(native));
});

test('ordinary route stays isolated: neither-voice replies are still held by the current contract',async t=>{
  const {res,models}=await runMock(t,{
    available:['gemini-3.8-flash'],
    requestIp:'203.0.113.244',
    trial:false,
    choose:()=>unvoiced
  });
  assert.equal(res.statusCode,502);
  assert.equal(res.payload.error,'marrowline-dual-voice-contract-unmet');
  assert.equal(res.payload.grove_trial.id,'off');
  assert.equal(res.payload.grove_trial.active,false);
  assert.equal(res.payload.grove_trial.variant,'ordinary-marrowline');
  assert.ok(models.length>=1);
});
