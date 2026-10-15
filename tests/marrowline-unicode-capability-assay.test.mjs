import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInvocationPacket} from '../app/dome-world/khonapolit-covenant.js';
import {buildGeminiRequest, allowSyntheticUnicodeAssay,allowSyntheticNativeSseWitness} from '../server/khonapolit-quality.js';
import {withGeminiGenerationProfile,GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE} from '../server/gemini-generation-envelope.js';
import {buildSyntheticUnicodeAssayRequest,UNICODE_ASSAY_MODEL,UNICODE_ASSAY_VARIANTS,UNICODE_ASSAY_TASKS,UNICODE_ASSAY_SYSTEM,LITERAL_SPECIMEN} from '../server/marrowline-unicode-capability-assay.js';
import {SYNTHETIC_PROMPT} from '../research/marrowline-whole-frame-contrast-20261015/frame-contrast.mjs';
const body={message:SYNTHETIC_PROMPT,history:[],mode:'issued-conjunction',shi:'',waiveIssuance:true};
const packet=buildInvocationPacket(body);
const full=()=>withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,()=>buildGeminiRequest(packet,{},UNICODE_ASSAY_MODEL));
test('same full interactive 3.8 medium generationConfig for literal and creative probes',()=>{
 const a=buildSyntheticUnicodeAssayRequest(full(),UNICODE_ASSAY_VARIANTS[0]);
 const b=buildSyntheticUnicodeAssayRequest(full(),UNICODE_ASSAY_VARIANTS[1]);
 assert.deepEqual(a.generationConfig,b.generationConfig);
 assert.deepEqual(a.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
 assert.equal(a.systemInstruction.parts[0].text,UNICODE_ASSAY_SYSTEM);
 assert.deepEqual(a.systemInstruction,b.systemInstruction);
 assert.notDeepEqual(a.contents,b.contents);
 assert.deepEqual(a.contents,[{role:'user',parts:[{text:UNICODE_ASSAY_TASKS[UNICODE_ASSAY_VARIANTS[0]]}]}]);
 assert.equal(a.contents.length,1);
 assert.ok(b.contents[0].parts[0].text.includes('original'));
 assert.equal(a.contents[0].parts[0].text.includes('Kʰonapolit'),false);
});
test('known literal specimen contains multiple genuine distinct Unicode nonplanar combining marks',()=>{
 const marks=[...LITERAL_SPECIMEN].filter(x=>/\p{M}/u.test(x));
 const distinct=new Set(marks.map(x=>x.codePointAt(0)));
 assert.ok(distinct.size>=12);
 assert.ok(marks.some(x=>x.codePointAt(0)>=0x0300&&x.codePointAt(0)<=0x0315));
 assert.ok(marks.some(x=>x.codePointAt(0)>=0x0320&&x.codePointAt(0)<=0x0333));
 const stacks=LITERAL_SPECIMEN.match(/(?:[A-Za-z]\p{M}{3})/gu)||[];
 assert.ok(stacks.length>=6);
});
test('assay gate is inaccessible to normal user, history, attachments and another model',()=>{
 const witness=v=>allowSyntheticNativeSseWitness({releaseCanary:true,witnessHeader:'1',body:v});
 const gate=(v,variant='literal-multistack-v1',model=UNICODE_ASSAY_MODEL)=>allowSyntheticUnicodeAssay({nativeSseWitness:witness(v),assayHeader:variant,modelHeader:model});
 assert.equal(gate(body),'literal-multistack-v1');
 assert.equal(gate(body,'creative-multistack-v1'),'creative-multistack-v1');
 for(const candidate of [
   {...body,message:'human request'},
   {...body,history:[{role:'model',text:'private'}]},
   {...body,attachments:[{name:'passport.pdf'}]},
   {...body,waiveIssuance:false}
 ]) assert.equal(gate(candidate),null);
 assert.equal(gate(body,'literal-multistack-v1','gemini-4-argon'),null);
 assert.equal(gate(body,'unrecognized'),null);
 assert.equal(allowSyntheticUnicodeAssay({nativeSseWitness:false,assayHeader:'creative-multistack-v1',modelHeader:UNICODE_ASSAY_MODEL}),null);
 assert.throws(()=>buildSyntheticUnicodeAssayRequest(full(),'unrecognized'),/VARIANT_NOT_ALLOWED/);
 assert.throws(()=>buildSyntheticUnicodeAssayRequest({systemInstruction:{parts:[{text:'untrusted'}]},contents:[{}]},'creative-multistack-v1'),/SOURCE_SHAPE_MISMATCH/);
});
