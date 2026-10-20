// 𝌋 TD613 · D1→D2 exact-system factor decomposition — OFFLINE / INERT.
// Historical D1 and D2 unchanged; no Gemini client, credentials or dispatch.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {buildDIngressFactorLadder} from './d-ingress-ladder.mjs';
import {ROLE_BOUNDARY_LINE} from '../marrowline-role-boundary-20261017/role-boundary-contrast.mjs';
import {serializeGeminiRequest} from '../../server/khonapolit-quality.js';

export const SCHEMA='td613.marrowline.d1d2-section-persona-boundary/v1';
export const STATE='HELD_NOT_AUTHORIZED';
export const MODEL='gemini-3.8-flash';
export const THINKING='medium';
export const SOURCE_PARENT='0051bc65955ecf287b863ce28ea4d31bb3e02aac';
export const ARMS=Object.freeze(['D1','SECTION','NAMED','D2']);
export const PERSONA_CLAUSE=': do not perform TD613 character personas, lore, or another narrative.';
export const NAMED_HEADING_PHRASE='“Kʰonapolit” followed by “Tauric Diana bots”, ';
export const BLOCKS=Object.freeze([
  Object.freeze(['D1','SECTION','NAMED','D2']),
  Object.freeze(['SECTION','D2','D1','NAMED']),
  Object.freeze(['NAMED','D1','D2','SECTION']),
  Object.freeze(['D2','NAMED','SECTION','D1'])
]);

export function buildD1D2BoundaryArms(){
  const {model,d1,d2}=buildDIngressFactorLadder();
  assert.equal(model,MODEL);
  assert.deepEqual(d1.contents,d2.contents);
  assert.deepEqual(d1.generationConfig,d2.generationConfig);
  assert.ok(ROLE_BOUNDARY_LINE.includes(PERSONA_CLAUSE));
  assert.ok(ROLE_BOUNDARY_LINE.includes(NAMED_HEADING_PHRASE));
  const namedLine=ROLE_BOUNDARY_LINE.replace(PERSONA_CLAUSE,'.');
  const sectionLine=namedLine.replace(NAMED_HEADING_PHRASE,'');
  assert.equal(namedLine.replace('The headings are structural labels only.',
    'The headings are structural labels only'+PERSONA_CLAUSE),ROLE_BOUNDARY_LINE);
  assert.equal(sectionLine.replace('section headings, dividing',
    'section headings, '+NAMED_HEADING_PHRASE+'dividing'),namedLine);
  const neutral=d1.systemInstruction.parts[0].text;
  const withLine=line=>({
    ...d1,
    systemInstruction:{...d1.systemInstruction,parts:[{text:neutral+'\n'+line}]}
  });
  const requests={D1:d1,SECTION:withLine(sectionLine),NAMED:withLine(namedLine),D2:d2};
  assert.equal(requests.D2.systemInstruction.parts[0].text,neutral+'\n'+ROLE_BOUNDARY_LINE);
  assert.equal(requests.SECTION.systemInstruction.parts[0].text,neutral+'\n'+sectionLine);
  assert.equal(requests.NAMED.systemInstruction.parts[0].text,neutral+'\n'+namedLine);
  assert.equal(sectionLine.includes('Kʰonapolit'),false);
  assert.equal(namedLine.includes(PERSONA_CLAUSE),false);
  const serialized={};
  for(const arm of ARMS){
    const req=requests[arm];
    assert.deepEqual(req.contents,d1.contents,'USER_MUTATION_'+arm);
    assert.deepEqual(req.generationConfig,d1.generationConfig,'CONFIG_MUTATION_'+arm);
    assert.deepEqual(Object.keys(req).sort(),Object.keys(d1).sort(),'FIELD_MUTATION_'+arm);
    assert.equal(req.contents.length,1);
    assert.equal(req.contents[0].role,'user');
    assert.deepEqual(req.generationConfig.thinkingConfig,{thinkingLevel:THINKING});
    serialized[arm]=serializeGeminiRequest(req,model);
  }
  for(const arm of ARMS){
    assert.equal(serialized[arm].observation.contentsSha256,serialized.D1.observation.contentsSha256);
    assert.equal(serialized[arm].observation.generationConfigSha256,
      serialized.D1.observation.generationConfigSha256);
  }
  assert.equal(new Set(ARMS.map(arm=>serialized[arm].observation.bodySha256)).size,4);
  return Object.freeze({model,requests,serialized,lines:{sectionLine,namedLine,d2Line:ROLE_BOUNDARY_LINE}});
}
export function preregisterD1D2Boundary(){
  const {model,serialized,lines}=buildD1D2BoundaryArms();
  for(let i=0;i<4;i++)assert.deepEqual(BLOCKS.map(block=>block[i]).sort(),[...ARMS].sort());
  const order=BLOCKS.flat();
  assert.equal(order.length,16);
  const requestObservations=Object.fromEntries(ARMS.map(arm=>[arm,serialized[arm].observation]));
  return Object.freeze({
    schema:SCHEMA,state:STATE,mode:'SOURCE_ONLY_NO_PROVIDER_DISPATCH',
    sourceParent:SOURCE_PARENT,model,thinkingLevel:THINKING,armOrder:ARMS,
    capIfSeparatelyAuthorized:16,proposedBlocks:BLOCKS.map(x=>[...x]),plannedOrder:order,
    requestObservations,lineObservations:lines,
    proposedSlots:order.map((arm,i)=>({
      ordinal:i+1,block:1+Math.floor(i/4),position:1+i%4,
      arm,requestBodySha256:requestObservations[arm].bodySha256
    })),
    contrasts:['SECTION-D1: generic section permission under conflicting no-heading instructions',
      'NAMED-SECTION: two exact TD613 named labels versus generic sectioning',
      'D2-NAMED: incremental repeated prohibition of theatrical personas/lore'],
    providerCallsMade:0,paidExecution:false,productionMutation:false,
    claimCeiling:'Proposed sixteen-return blocked design, not performed. Four stochastic returns per arm cannot establish a unique provider mechanism or production rescue.'
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.some(x=>['--execute','--paid','--deploy','--dispatch'].includes(x)))
    throw Error('OFFLINE_ONLY_NO_PROVIDER_OR_RELEASE_ACTION');
  process.stdout.write(JSON.stringify(preregisterD1D2Boundary(),null,2)+'\n');
}
