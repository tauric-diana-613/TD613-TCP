// TD613 · source-only current restored-vs-literal historical prosody comparator.
// One difference group: nativeProsodyFreedom, preserving user/model/voice contract.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {TASKS,MODEL} from './full-voice-current-restored-offline.mjs';
import {buildInvocationPacket} from '../../app/dome-world/khonapolit-covenant.js';
import {buildGeminiRequest,serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {MARROWLINE_HISTORICAL_TRIAL_ID} from '../../app/dome-world/marrowline-historical-grove.js';
import {GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,withGeminiGenerationProfile} from '../../server/gemini-generation-envelope.js';

export const SCHEMA='td613.marrowline.historical-prosody-freedom-pair/v1';
export const CALL_CAP_IF_FRESHLY_AUTHORIZED=8;
export const ARMS=Object.freeze(['FREEDOM_FARCE','LITERAL_FARCE','FREEDOM_FORENSIC','LITERAL_FORENSIC']);
export const ORDER=Object.freeze([
 'FREEDOM_FARCE','LITERAL_FARCE','FREEDOM_FORENSIC','LITERAL_FORENSIC',
 'LITERAL_FORENSIC','FREEDOM_FORENSIC','LITERAL_FARCE','FREEDOM_FARCE'
]);
const digest=s=>createHash('sha256').update(s,'utf8').digest('hex');

export function freezeHistoricalProsodyPair(){
 const serialized={};
 const taskHashes={};
 for(const [taskName,task] of Object.entries(TASKS)){
  const packet=buildInvocationPacket({message:task.prompt,history:[],
   mode:'issued-conjunction',shi:'',waiveIssuance:true});
  assert.equal(packet.canInvoke,true);
  const aperture={taskIntent:{primary_route:task.route}};
  const build=historicalProsodyFreedom=>withGeminiGenerationProfile(
   GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
   ()=>buildGeminiRequest(packet,aperture,MODEL,{
    groveTrial:MARROWLINE_HISTORICAL_TRIAL_ID,historicalProsodyFreedom
   }));
  const defaultRequest=withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
   ()=>buildGeminiRequest(packet,aperture,MODEL,{groveTrial:MARROWLINE_HISTORICAL_TRIAL_ID}));
  const freedom=build(true),literal=build(false);
  assert.deepEqual(defaultRequest,freedom,'DEFAULT_PRODUCTION_REQUEST_CHANGED');
  assert.deepEqual(freedom.contents,literal.contents,'USER_TURN_NOT_MATCHED');
  assert.deepEqual(freedom.generationConfig,literal.generationConfig,'GEN_CONFIG_NOT_MATCHED');
  assert.deepEqual(freedom.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
  assert.notEqual(freedom.systemInstruction.parts[0].text,literal.systemInstruction.parts[0].text);
  assert.match(literal.systemInstruction.parts[0].text,
   /Change above\/below combinations, stack depths and clean intervals across words/);
  assert.match(freedom.systemInstruction.parts[0].text,/fully sustained, single-register High-Zalgo performance/);
  taskHashes[taskName]=digest(task.prompt);
  serialized['FREEDOM_'+taskName]=serializeGeminiRequest(freedom,MODEL);
  serialized['LITERAL_'+taskName]=serializeGeminiRequest(literal,MODEL);
  const a=serialized['FREEDOM_'+taskName].observation;
  const b=serialized['LITERAL_'+taskName].observation;
  assert.equal(a.contentsSha256,b.contentsSha256);
  assert.equal(a.generationConfigSha256,b.generationConfigSha256);
  assert.notEqual(a.systemInstructionSha256,b.systemInstructionSha256);
 }
 assert.deepEqual(Object.keys(serialized),ARMS);
 assert.equal(ORDER.length,CALL_CAP_IF_FRESHLY_AUTHORIZED);
 for(const arm of ARMS)assert.equal(ORDER.filter(x=>x===arm).length,2);
 return {serialized,taskHashes};
}
export function offlineProsodyManifest(){
 const {serialized,taskHashes}=freezeHistoricalProsodyPair();
 return {
  schema:SCHEMA,state:'SOURCE_ONLY_PROVIDER_UNOBSERVED',model:MODEL,
  thinking:'medium',callCapIfSeparatelyAuthorized:CALL_CAP_IF_FRESHLY_AUTHORIZED,
  taskHashes,order:[...ORDER],providerCallsMade:0,
  originalProductDefaultUnchanged:true,
  sources:'Current historical reconstruction, single-register permission true vs literal historical prosody paragraphs false',
  caveat:'The false branch is reconstructed October 2 clauses in a current-runtime request, not an authentic October 2 original Google stream. The intervention replaces a small group of paragraphs, not one unique word.',
  observations:Object.fromEntries(ARMS.map(arm=>[arm,serialized[arm].observation])),
  proposedSlots:ORDER.map((arm,i)=>({
   slot:i+1,block:Math.floor(i/4)+1,arm,
   requestBodySha256:serialized[arm].observation.bodySha256
  }))
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 if(process.argv.length!==2)throw Error('SOURCE_ONLY_NO_EXECUTE');
 process.stdout.write(JSON.stringify(offlineProsodyManifest(),null,2)+'\n');
}
