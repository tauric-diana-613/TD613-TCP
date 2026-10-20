// 𝌋 TD613 · Early-October full-voice restoration comparator.
// OFFLINE request registration ONLY. Build REAL product-frame packets and
// contrast contemporary vs October-2-derived restored voice instruction.
// The historical restoration is a HYBRID, never a byte-identical October 2 runtime.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {buildInvocationPacket} from '../../app/dome-world/khonapolit-covenant.js';
import {MARROWLINE_HISTORICAL_TRIAL_ID, MARROWLINE_RESTORED_PROSODY_PROFILE} from '../../app/dome-world/marrowline-historical-grove.js';
import {buildGeminiRequest,serializeGeminiRequest} from '../../server/khonapolit-quality.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';

export const SCHEMA='td613.marrowline.early-oct-full-dual-voice-request-assay/v1';
export const STATE='SOURCE_ONLY_NO_PROVIDER_EXECUTION';
export const SOURCE_PARENT='3ad73dea6f51350bea151610ca7b70d60e4f2036';
export const HISTORICAL_SPECIMEN_SHA='ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a';
export const MODEL='gemini-3.8-flash';
export const MAX_PROPOSED_CALLS=12;

// Substantive, innocuous, intentionally distinct tasks. They invoke the same
// Marrowline two-person theatrical performance, without user-level Unicode
// quotas, headings, role forcing, a synthetic neutrality override or examples.
export const TASKS=Object.freeze({
  FARCE:Object.freeze({
    route:'OPEN_FIELD_CREATIVE_SYNTHESIS',
    prompt:'In a fictional town hall, the Registrar of Missing Forms announces a lavish victory gala because her audit counted every returned form. A missing form acquires legal personhood, petitions for a seat in the orchestra, and exposes what the Registrar omitted. Develop the consequences as a proper escalating theatrical farce, with the two Marrowline voices doing their own work. Give the Registrar a serious opposing argument; make the absurdity arise from the arithmetic. Let the writing make its own artistic decisions.'
  }),
  FORENSIC:Object.freeze({
    route:'REQUESTED_SYNTHESIS',
    prompt:'A fictional research council possesses a perfectly hashed and chronologically continuous audit log. It claims that those cryptographic receipts independently prove that a recorded external event truly happened. Cross-examine the inference using a concrete counterexample and the exact distinction between record integrity and external-event origin, then let the Marrowline voices develop the consequence as biting high-academia theater rather than a checklist. Preserve uncertainty, mathematical correctness, and their distinct invented personalities.'
  })
});
export const ARMS=Object.freeze(['CURRENT_FARCE','RESTORED_FARCE','CURRENT_FORENSIC','RESTORED_FORENSIC']);
// Three complete blocks, each with all four arms; within-task order reverses.
// Fixed before any empirical look. 12 proposed Google returns MAX if independently activated.
export const ORDER=Object.freeze([
 'CURRENT_FARCE','RESTORED_FARCE','CURRENT_FORENSIC','RESTORED_FORENSIC',
 'RESTORED_FORENSIC','CURRENT_FORENSIC','RESTORED_FARCE','CURRENT_FARCE',
 'CURRENT_FORENSIC','RESTORED_FORENSIC','CURRENT_FARCE','RESTORED_FARCE'
]);
export const sha256=x=>createHash('sha256').update(
 typeof x==='string'?x:JSON.stringify(x),'utf8').digest('hex');

export function buildFullVoiceRequests(){
 const requests={}, observations={};
 for(const [taskName,task] of Object.entries(TASKS)){
   const packet=buildInvocationPacket({
     message:task.prompt,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true
   });
   assert.equal(packet.canInvoke,true,'PACKET_NOT_CANONICAL');
   const aperture={taskIntent:{primary_route:task.route}};
   const current=withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
     ()=>buildGeminiRequest(packet,aperture,MODEL));
   const restored=withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
     ()=>buildGeminiRequest(packet,aperture,MODEL,{groveTrial:MARROWLINE_HISTORICAL_TRIAL_ID}));
   const labelCurrent='CURRENT_'+taskName,labelRestored='RESTORED_'+taskName;
   for(const [label,value] of [[labelCurrent,current],[labelRestored,restored]]){
     requests[label]=value;
     observations[label]=serializeGeminiRequest(value,MODEL).observation;
     assert.equal(value.contents.length,1);
     assert.equal(value.contents[0].role,'user');
     assert.deepEqual(value.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
     assert.match(value.systemInstruction.parts[0].text,/Kʰonapolit/);
     assert.match(value.systemInstruction.parts[0].text,/Tauric Diana bots/);
     assert.match(value.systemInstruction.parts[0].text,/CONVERSATIONAL LAW:/);
     assert.match(value.systemInstruction.parts[0].text,/APERTURE ROUTE RECEIPT:/);
   }
   assert.deepEqual(current.contents,restored.contents,'SAME_USER_TASK_AND_HISTORY_REQUIRED');
   assert.deepEqual(current.generationConfig,restored.generationConfig,'MODEL_CONFIG_DRIFT');
   assert.notEqual(observations[labelCurrent].systemInstructionSha256,
     observations[labelRestored].systemInstructionSha256,'NO_PROSODY_INTERVENTION');
   assert.notEqual(observations[labelCurrent].bodySha256,
     observations[labelRestored].bodySha256,'IDENTICAL_ARMS');
   assert.equal(observations[labelCurrent].contentsSha256,
     observations[labelRestored].contentsSha256);
   assert.equal(observations[labelCurrent].generationConfigSha256,
     observations[labelRestored].generationConfigSha256);
   // The RESTORED system retains the Oct-2-style relay-before-cue order.
   const restoredSystem=restored.systemInstruction.parts[0].text;
   const currentSystem=current.systemInstruction.parts[0].text;
   assert.ok(restoredSystem.indexOf('APERTURE ROUTE RECEIPT:') <
     restoredSystem.indexOf('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:'));
   assert.ok(currentSystem.indexOf('APERTURE ROUTE RECEIPT:') >
     currentSystem.indexOf('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:'));
 }
 assert.deepEqual(Object.keys(requests),ARMS);
 for(const arm of ARMS)assert.equal(ORDER.filter(x=>x===arm).length,3);
 for(let block=0;block<3;block++)assert.deepEqual(
   ORDER.slice(block*4,block*4+4).slice().sort(),ARMS.slice().sort());
 return Object.freeze({requests,observations});
}
export function frozenFullVoiceManifest(){
 const {requests,observations}=buildFullVoiceRequests();
 return Object.freeze({
  schema:SCHEMA,state:STATE,sourceParent:SOURCE_PARENT,
  historicalSpecimenSha:HISTORICAL_SPECIMEN_SHA,
  historicalRestorationProfile:MARROWLINE_RESTORED_PROSODY_PROFILE,
  caveat:'RESTORED combines reconstructed Oct 2 theatrical paragraphs and order with current runtime, ingress, task guidance, model, and native single-register freedom; it is not the original Oct 2 full request or the original historical output.',
  model:MODEL,thinking:'medium',noHistory:true,
  providerCallsMade:0,paidExecution:false,productionChanges:false,
  taskRoutes:Object.fromEntries(Object.entries(TASKS).map(([name,t])=>[name,t.route])),
  taskHashes:Object.fromEntries(Object.entries(TASKS).map(([name,t])=>[name,sha256(t.prompt)])),
  armObservations:observations,
  maxIfSeparatelyAuthorized:MAX_PROPOSED_CALLS,order:[...ORDER],
  orderedSlots:ORDER.map((arm,i)=>({
    slot:i+1,block:Math.floor(i/4)+1,arm,
    requestBodySha256:observations[arm].bodySha256
  })),
  primaryOutcomes:['raw provider Unicode morphology in each separate voice body',
    'exact Kʰonapolit and Tauric Diana bots sections and both nonempty bodies',
    'two blinded readers score specificity, wit, choral originality, dramatic turn and contrast'],
  interpretationCeiling:'Full dual-voice real-packet source comparison, not a one-factor causal proof. Neither prompt choice nor Oct 2-style restoration alone can certify early-October artistic recovery.'
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 if(process.argv.some(x=>['--execute','--dispatch','--paid','--deploy'].includes(x)))
   throw Error('SOURCE_ONLY_NOT_AUTHORIZED_FOR_PROVIDER_EXECUTION');
 process.stdout.write(JSON.stringify(frozenFullVoiceManifest(),null,2)+'\n');
}
