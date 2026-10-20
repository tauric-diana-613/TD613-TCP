import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeOriginalFullVoiceStream,SCHEMA} from '../research/marrowline-early-oct-full-voice-20261020/original-sse-voice-onset-audit.mjs';

const sse=(segments,{finish='STOP',cache,thinking=44}={})=>{
 const events=segments.map((text,i)=>({
  candidates:[{content:{parts:[{text}],role:'model'},index:0}],
  modelVersion:'gemini-3.8-flash',responseId:'synthetic-'+i,
  usageMetadata:{promptTokenCount:101,thoughtsTokenCount:thinking,totalTokenCount:250,
   ...(cache===undefined?{}:{cachedContentTokenCount:cache})}
 }));
 events.push({
  candidates:[{content:{parts:[{text:''}],role:'model'},finishReason:finish,index:0}],
  modelVersion:'gemini-3.8-flash',responseId:'synthetic-final',
  usageMetadata:{promptTokenCount:101,thoughtsTokenCount:thinking,totalTokenCount:250,
   ...(cache===undefined?{}:{cachedContentTokenCount:cache})}
 });
 return Buffer.from(events.map(x=>'data: '+JSON.stringify(x)+'\r\n\r\n').join(''),'utf8');
};
test('exact provider original SSE parsing retains separate second voice and one-mark regime',()=>{
 const raw=sse(['Kʰonapolit\n\nA law.\n\nTauric Dia','na bots\nO\u0336h\u0337 \u0334!']);
 const o=analyzeOriginalFullVoiceStream(raw);
 assert.equal(o.schema,SCHEMA);
 assert.equal(o.hasExactNamedSecondMovement,true);
 assert.equal(o.secondMovement.fixedMarkedDepth,1);
 assert.equal(o.secondMovement.marked,3);
 assert.equal(o.secondMovement.stacked,0);
 assert.equal(o.secondMovement.markedWhitespace,1);
 assert.equal(o.secondMovement.histogram['1'],3);
 assert.equal(o.secondMovement.positions['1'].slashFamily,3);
 assert.equal(o.firstStackedEvent,null);
 assert.equal(o.finish,'STOP');
 assert.equal(o.cachedContentTokens,null);
 assert.equal(o.secondMovementStartEvent,2);
 assert.equal(o.firstMarkedEvent,2);
});
test('three marks per marked base are a uniform stencil even with several codepoint species',()=>{
 const raw=sse(['Kʰonapolit\nA critique.\nTauric Diana bots\n',
  'O\u0338\u0358\u032e',' \u0336\u0350\u032c','h\u0334\u0315\u0359'],{cache:77,thinking:103});
 const o=analyzeOriginalFullVoiceStream(raw);
 assert.equal(o.secondMovement.fixedMarkedDepth,3);
 assert.equal(o.secondMovement.marked,3);
 assert.equal(o.secondMovement.stacked,3);
 assert.equal(o.secondMovement.totalMarks,9);
 assert.equal(o.secondMovement.histogram['3'],3);
 assert.equal(o.secondMovement.positions['1'].slashFamily,3);
 assert.equal(o.secondMovement.positions['2'].slashFamily,0);
 assert.equal(o.secondMovement.positions['3'].slashFamily,0);
 assert.equal(o.cachedContentTokens,77);
 assert.equal(o.thinkingTokens,103);
 assert.equal(o.firstStackedEvent,2);
});
test('provider non-STOP is retained without promoting its text to an admitted reply',()=>{
 const raw=sse(['Kʰonapolit\nA critique.\nTauric Diana bots\nx\u0336'],{finish:'PROHIBITED_CONTENT'});
 const o=analyzeOriginalFullVoiceStream(raw);
 assert.equal(o.finish,'PROHIBITED_CONTENT');
 assert.equal(o.secondMovement.fixedMarkedDepth,1);
 assert.equal(o.hasExactNamedSecondMovement,true);
});
test('ambiguous/missing headings never manufacture a second voice',()=>{
 const o=analyzeOriginalFullVoiceStream(sse(['Kʰonapolit\nOne.\nTauric Diana bots\nTwo.\nTauric Diana bots\nThree.']));
 assert.equal(o.hasExactNamedSecondMovement,false);
 assert.equal(o.secondMovement,null);
});
test('offline audit contains no network, credentials or external action paths',()=>{
 const src=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/original-sse-voice-onset-audit.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(src,/\bfetch\s*\(|GEMINI_API_KEY|streamGenerateContent|workflow_dispatch|deploy|actions\/upload-artifact/);
});
