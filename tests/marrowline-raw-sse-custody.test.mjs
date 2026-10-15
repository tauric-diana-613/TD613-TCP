import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {readGeminiSse, extractGeminiText} from '../server/khonapolit-quality.js';

const sha = s => createHash('sha256').update(s).digest('hex');
const mockStream = (raw, step = 11) => {
 const bytes=Buffer.from(raw,'utf8');
 let i=0;
 return {body:new ReadableStream({pull(ctrl){if(i>=bytes.length){ctrl.close();return;}ctrl.enqueue(bytes.subarray(i,i+step));i+=step;}})};
};
const progress = () => ({startedAt:Date.now(),firstChunkMs:null,chunkCount:0,authoredTextChunkCount:0,parseErrors:0,byteCount:0,streamInterrupted:false});

test('synthetic-only upstream witness preserves exact SSE bytes and text even across Unicode byte splits',async()=>{
 const title='Kʰonapolit\nStep.\nTauric Diana bots\n';
 const marks='G\u0357a\u0335t\u0324e\u030b 🌘\u0345⟐';
 const line=title+marks;
 const chunks=[
  {candidates:[{content:{parts:[{text:title}]}}],modelVersion:'gemini-3.8-flash'},
  {candidates:[{content:{parts:[{text:marks}]},finishReason:'STOP'}],usageMetadata:{candidatesTokenCount:28}}
 ];
 const raw=chunks.map(x=>'data: '+JSON.stringify(x)+'\n\n').join('');
 const witness=progress();
 const returned=await readGeminiSse(mockStream(raw,3),witness,null,true);
 assert.equal(extractGeminiText(returned),line);
 assert.equal(witness.nativeSseEvidence.captureComplete,true);
 assert.equal(witness.nativeSseEvidence.rawSseSha256,sha(Buffer.from(raw,'utf8')));
 assert.equal(Buffer.from(witness.nativeSseEvidence.rawSseBase64,'base64').toString('utf8'),raw);
 assert.equal(witness.nativeSseEvidence.originalEventTextSha256,sha(line));
 assert.equal(witness.nativeSseEvidence.mergedTextSha256,sha(line));
 assert.equal(witness.nativeSseEvidence.textEquivalent,true);
 assert.equal(witness.nativeSseEvidence.eventCount,2);
 assert.equal(witness.nativeSseEvidence.parseErrors,0);
});

test('no opt-in capture cannot return raw provider transcript',async()=>{
 const raw='data: '+JSON.stringify({candidates:[{content:{parts:[{text:'only server text'}]}}]})+'\n\n';
 const p=progress();
 await readGeminiSse(mockStream(raw),p,null,false);
 assert.equal(p.nativeSseEvidence,undefined);
});

test('oversized provider stream retains only digest and is marked incomplete rather than publishing unbounded bytes',async()=>{
 const body='k'.repeat(270000);
 const raw='data: '+JSON.stringify({candidates:[{content:{parts:[{text:body}]},finishReason:'STOP'}]})+'\n\n';
 const p=progress();
 const result=await readGeminiSse(mockStream(raw,4096),p,null,true);
 assert.equal(extractGeminiText(result),body);
 assert.equal(p.nativeSseEvidence.rawSseBase64,null);
 assert.equal(p.nativeSseEvidence.captureComplete,false);
 assert.equal(p.nativeSseEvidence.rawSseSha256,sha(Buffer.from(raw,'utf8')));
 assert.equal(p.nativeSseEvidence.textEquivalent,true);
});

test('live code confines raw SSE release to synthetic canary, never to normal chat',()=>{
 const source=readFileSync(new URL('../server/khonapolit-quality.js',import.meta.url),'utf8');
 assert.match(source,/nativeSseWitness = releaseCanary/);
 assert.match(source,/requestHeader\(req, 'x-td613-native-sse-witness'\) === '1'/);
 assert.match(source,/body\.message === NATIVE_SSE_WITNESS_PROMPT/);
 assert.match(source,/Array\.isArray\(body\.history\) && body\.history\.length === 0/);
 assert.match(source,/captureNativeSse: nativeSseWitness/);
 assert.match(source,/rawSseBase64: wireOverflow \? null/);
});
