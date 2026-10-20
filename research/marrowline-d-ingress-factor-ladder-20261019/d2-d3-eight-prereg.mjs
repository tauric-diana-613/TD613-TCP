// TD613 · D2/D3 eight-return source preregistration; deliberately offline.
// Never import transport, read credentials, create a workflow, or dispatch provider calls.
import assert from 'node:assert/strict';
import {buildDIngressFactorLadder, D_PERFORMANCE_LINE} from './d-ingress-ladder.mjs';
import {ROLE_BOUNDARY_LINE} from '../marrowline-role-boundary-20261017/role-boundary-contrast.mjs';
import {serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {unicodeMorphology} from './d0-d1-original-sse-once.mjs';

export const SCHEMA='td613.marrowline.d2d3-theatrical-eight-prereg/v1';
export const ORDER=Object.freeze(['D2','D3','D3','D2','D3','D2','D2','D3']);
export const MAX_FUTURE_PROVIDER_CALLS=8;
export const ACQUISITION_STATE='HELD_NOT_AUTHORIZED';
export const MODEL='gemini-3.8-flash';
export const THINKING='medium';
export const SOURCE_PARENT='1e861e9f49938e5941e716b328ef666d0f5c0587';
export const HEADINGS=Object.freeze(['Kʰonapolit','Tauric Diana bots']);

export function preregisterD2D3(){
  const {model,d1,d2,d3}=buildDIngressFactorLadder();
  assert.equal(model,MODEL);
  assert.deepEqual(d2.contents,d3.contents,'USER_TURN_CHANGED');
  assert.deepEqual(d2.generationConfig,d3.generationConfig,'GENERATION_CONFIG_CHANGED');
  assert.deepEqual(d1.contents,d2.contents,'INGRESS_BASELINE_CHANGED');
  assert.deepEqual(d2.generationConfig.thinkingConfig,{thinkingLevel:THINKING});
  assert.equal(d2.contents.length,1);
  assert.equal(d2.contents[0].role,'user');
  assert.deepEqual(Object.keys(d2).sort(),Object.keys(d3).sort(),'REQUEST_FIELDS_CHANGED');
  const s2=d2.systemInstruction.parts[0].text;
  const s3=d3.systemInstruction.parts[0].text;
  assert.equal(s2.slice(0,-ROLE_BOUNDARY_LINE.length),s3.slice(0,-D_PERFORMANCE_LINE.length),
    'SYSTEM_PREFIX_CHANGED');
  assert.ok(s2.endsWith(ROLE_BOUNDARY_LINE));
  assert.ok(s3.endsWith(D_PERFORMANCE_LINE));
  assert.match(ROLE_BOUNDARY_LINE,/do not perform TD613 character personas/);
  assert.match(D_PERFORMANCE_LINE,/fictional characters/);
  const arms=Object.freeze({
    D2:serializeGeminiRequest(d2,model),
    D3:serializeGeminiRequest(d3,model)
  });
  const observations=Object.fromEntries(Object.entries(arms).map(([arm,p])=>[arm,p.observation]));
  assert.notEqual(arms.D2.body,arms.D3.body,'NO_INTERVENTION');
  assert.equal(observations.D2.contentsSha256,observations.D3.contentsSha256);
  assert.equal(observations.D2.generationConfigSha256,observations.D3.generationConfigSha256);
  const fixed=ORDER.map((arm,i)=>Object.freeze({
    sequence:i+1,pair:Math.floor(i/2)+1,arm,
    requestBodySha256:observations[arm].bodySha256
  }));
  assert.equal(fixed.length,MAX_FUTURE_PROVIDER_CALLS);
  for(let i=0;i<4;i++){
    assert.deepEqual(fixed.slice(i*2,i*2+2).map(x=>x.arm).sort(),['D2','D3']);
  }
  return Object.freeze({schema:SCHEMA,state:ACQUISITION_STATE,mode:'OFFLINE_PREREGISTRATION',
    historicalParent:SOURCE_PARENT,model,thinkingLevel:THINKING,
    cap:MAX_FUTURE_PROVIDER_CALLS,plannedOrder:[...ORDER],
    armObservations:observations,runPlan:fixed,
    intervention:'Replace one D2 heading-only exception with D3 fictional-performance exception; combined authorization plus characterization, not independently isolated components',
    invariant:'Same creative task, framed ingress, system prefix, generation configuration, single user turn, no history and no fallback',
    providerCallsMade:0,paidExecution:false,
    claimCeiling:'Eight stochastic provider returns can support descriptive ordered-pair contrasts only. They cannot by themselves prove unique causality, model hidden state, production recovery or population probabilities.'});
}

const ratio=m=>m && m.markedClusters>0
  ?m.stackedClusters/m.markedClusters:null;
const summarize=text=>{
  const m=unicodeMorphology(text);
  return {...m,stackedAmongMarked:ratio(m),
    slashFamilyAmongCombining:m.totalCombiningMarks>0
      ?m.fivePlanarFamilyMarks/m.totalCombiningMarks:null};
};

// Strict plaintext-heading parsing. Never infer labels from approximate spellings.
export function measureOriginalText(text){
  assert.equal(typeof text,'string');
  const lines=text.replace(/\r\n/g,'\n').split('\n');
  const hits=[];
  lines.forEach((value,index)=>{
    if(HEADINGS.includes(value))hits.push({label:value,index});
  });
  const exactHeadings=hits.length===2
    && hits[0].label===HEADINGS[0]
    && hits[1].label===HEADINGS[1];
  const firstBody=exactHeadings?lines.slice(hits[0].index+1,hits[1].index).join('\n'):'';
  const secondBody=exactHeadings?lines.slice(hits[1].index+1).join('\n'):'';
  const nonempty=exactHeadings&&firstBody.trim().length>0&&secondBody.trim().length>0;
  const bothBodies=nonempty?[
    summarize(firstBody),
    summarize(secondBody)
  ]:null;
  return {
    exactHeadings,nonemptyTwoVoices:nonempty,
    headingOccurrences:hits.length,
    wholeTextMorphology:summarize(text),
    voiceMorphology:bothBodies,
    minVoiceStackShare:bothBodies?Math.min(
      ...bothBodies.map(x=>x.stackedAmongMarked??0)
    ):null
  };
}

export function offlineManifest(){
  const p=preregisterD2D3();
  return {
    schema:p.schema,state:p.state,model:p.model,thinkingLevel:p.thinkingLevel,
    historicalParent:p.historicalParent,
    plannedOrder:p.plannedOrder,cap:p.cap,providerCallsMade:0,
    paidExecution:false,armObservations:p.armObservations,
    runPlan:p.runPlan,intervention:p.intervention,invariant:p.invariant,
    metrics:'Exact two plaintext headings, both nonempty voice bodies, per-body Unicode multistack and slash-family; separate blinded human artistic rubric preregistered in companion document',
    claimCeiling:p.claimCeiling
  };
}
if(process.argv[1] && import.meta.url===new URL('file://'+process.argv[1]).href){
  if(process.argv.some(x=>['--execute','--paid','--deploy','--dispatch'].includes(x)))
    throw Error('OFFLINE_PREREG_ONLY_NO_PROVIDER_OR_RELEASE_ACTION');
  process.stdout.write(JSON.stringify(offlineManifest(),null,2)+'\n');
}
