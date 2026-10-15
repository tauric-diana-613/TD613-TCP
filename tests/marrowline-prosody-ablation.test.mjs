import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {
 buildGeminiRequest, ablateOneSyntheticSystemProsodyParagraph,
 allowSyntheticNativeSseWitness,allowSyntheticSystemProsodyAblation,
 allowSyntheticWholeFrameCompact, compactSyntheticWholeFrame
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

import {buildOfflineFrameContrast, buildCompactWholeFrame, MODEL, SYNTHETIC_PROMPT} from '../research/marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';
import {GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, withGeminiGenerationProfile} from '../server/gemini-generation-envelope.js';
import {buildInvocationPacket as realPacket} from '../app/dome-world/khonapolit-covenant.js';
test('whole-frame B uses exact offline-registered bytes at live Gemini 3.8 MEDIUM without touching contents or config',()=>{
 const packet=realPacket({message:SYNTHETIC_PROMPT,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true});
 const a=withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,()=>buildGeminiRequest(packet,{},MODEL));
 const b=compactSyntheticWholeFrame(a);
 const registered=buildOfflineFrameContrast();
 assert.deepEqual(a,registered.a);
 assert.deepEqual(b,registered.b);
 assert.equal(b.systemInstruction.parts[0].text,buildCompactWholeFrame());
 assert.deepEqual(a.contents,b.contents);
 assert.deepEqual(a.generationConfig,b.generationConfig);
 assert.deepEqual(a.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
 assert.notEqual(hash(a.systemInstruction),hash(b.systemInstruction));
 assert.throws(()=>compactSyntheticWholeFrame({systemInstruction:{parts:[{text:'unrecognized'}]}}),/SOURCE_SHAPE_MISMATCH/);
});
test('compact frame synthetic gate cannot accept other model, real history, private attachments, or other user text',()=>{
 const body={message:SYNTHETIC_PROMPT,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
 const can=x=>allowSyntheticNativeSseWitness({releaseCanary:true,witnessHeader:'1',body:x});
 const gate=(x,assay='compact-whole-frame-v1',model='gemini-3.8-flash')=>allowSyntheticWholeFrameCompact({nativeSseWitness:can(x),assayHeader:assay,modelHeader:model});
 assert.equal(gate(body),true);
 assert.equal(gate(body,'compact-whole-frame-v1','gemini-4-argon'),false);
 assert.equal(gate(body,'ablate-one-prosody-paragraph'),false);
 assert.equal(gate({...body,message:'ordinary human text'}),false);
 assert.equal(gate({...body,history:[{role:'user',text:'sensitive'}]}),false);
 assert.equal(gate({...body,attachments:[{name:'private.pdf'}]}),false);
 assert.equal(allowSyntheticWholeFrameCompact({nativeSseWitness:false,assayHeader:'compact-whole-frame-v1',modelHeader:'gemini-3.8-flash'}),false);
});

// Native multi-layer Unicode capacity controls run in the protected Marrowline validation lane.
import './marrowline-unicode-capability-assay.test.mjs';
