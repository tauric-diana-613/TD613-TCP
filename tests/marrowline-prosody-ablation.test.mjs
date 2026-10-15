import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
 buildGeminiRequest, ablateOneSyntheticSystemProsodyParagraph,
 allowSyntheticNativeSseWitness,allowSyntheticSystemProsodyAblation
} from '../server/khonapolit-quality.js';
import {buildInvocationPacket} from '../app/dome-world/khonapolit-covenant.js';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const message='In a fictional town, a committee counts only returned forms and concludes that every silent resident is content. Locate the denominator error, pursue its consequence, and complete the connected Kʰonapolit and Tauric Diana bots movements. Let the voices author their own prose and native typography.';
function context(){return buildInvocationPacket({message,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true});}
test('one synthetic system prosody paragraph is the only changed provider wire field',()=>{
 const packet=context();
 assert.equal(packet.canInvoke,true);
 const a=buildGeminiRequest(packet,{},'gemini-3.8-flash');
 const b=ablateOneSyntheticSystemProsodyParagraph(a);
 assert.equal(hash(a.contents),hash(b.contents));
 assert.equal(hash(a.generationConfig),hash(b.generationConfig));
 assert.notEqual(hash(a.systemInstruction),hash(b.systemInstruction));
 const full=a.systemInstruction.parts[0].text;
 const reduced=b.systemInstruction.parts[0].text;
 const prefix='- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION:';
 const all=full.split('\n');
 assert.equal(all.filter(line=>line.startsWith(prefix)).length,1);
 assert.deepEqual(reduced.split('\n'),all.filter(line=>!line.startsWith(prefix)));
 assert.equal(hash(a.systemInstruction),hash(buildGeminiRequest(packet,{},'gemini-3.8-flash').systemInstruction),'normal product generation preserved');
});
test('ablation fails closed when target prose was removed or duplicated',()=>{
 const base={systemInstruction:{parts:[{text:'alpha\nbeta'}]},contents:[],generationConfig:{}};
 assert.throws(()=>ablateOneSyntheticSystemProsodyParagraph(base),/NOT_UNIQUE/);
});
test('ordinary request, different synthetic text, uploads or history cannot activate ablation',()=>{
 const body={message,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
 const allow=x=>allowSyntheticNativeSseWitness({releaseCanary:true,witnessHeader:'1',body:x});
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:allow(body),assayHeader:'ablate-one-prosody-paragraph'}),true);
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:false,assayHeader:'ablate-one-prosody-paragraph'}),false);
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:allow({...body,message:'different text'}),assayHeader:'ablate-one-prosody-paragraph'}),false);
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:allow({...body,history:[{role:'user',text:'secret'}]}),assayHeader:'ablate-one-prosody-paragraph'}),false);
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:allow({...body,attachments:[{name:'private.pdf'}]}),assayHeader:'ablate-one-prosody-paragraph'}),false);
 assert.equal(allowSyntheticSystemProsodyAblation({nativeSseWitness:allow(body),assayHeader:'1'}),false);
});
 
// Offline whole-instruction-frame counterfactual tests run in the existing protected Marrowline CI lane.
import './marrowline-whole-frame-contrast.test.mjs';
