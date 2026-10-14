import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { JSDOM } from 'jsdom';
import { callGemini } from '../../server/khonapolit-quality.js';
import { buildInvocationPacket } from '../../app/dome-world/khonapolit-covenant.js';
import { parseRelayEnvelope } from '../../app/dome-world/khonapolit-relay.js';
import { createMarrowlineThreadLibrary } from '../../app/dome-world/marrowline-threads.js';
import { withGeminiGenerationProfile, GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE } from '../../server/gemini-generation-envelope.js';

const digest = value => crypto.createHash('sha256').update(value).digest('hex');
// Transport sentinel only. No historical art, typography rating or production instructions.
const text = 'Kʰonapolit\nExact transport sentinel.\n\nTauric Diana bots\nA\u0316\u0301\u034f\u035c\u0338e\u0301 / é / \u{1D165} / \u{10D613} / \u200c / 👩🏾‍⚖️\n\nBlank line retained.\n⟐';
// Split the JSON-authored text at every UTF-16 unit across separate SSE events,
// including surrogate pairs; then split the UTF-8 stream at every byte boundary.
const events = Array.from({length:text.length},(_,i)=>({candidates:[{content:{parts:[{text:text[i]}]}}]}));
events.splice(2,0,{candidates:[{content:{parts:[{thought:true,text:'THOUGHT_SENTINEL_DO_NOT_SURFACE'}]}}]});
events.push({candidates:[{content:{parts:[]},finishReason:'STOP'}],usageMetadata:{promptTokenCount:1,candidatesTokenCount:1}});
const bytes = Buffer.from(events.map(payload=>'data: '+JSON.stringify(payload)+'\n\n').join(''));
const originalFetch = globalThis.fetch;
const packet = buildInvocationPacket({message:'Run an offline Unicode transport check.',waiveIssuance:true});
let requests = 0;
function response(segments) {
  return new Response(new ReadableStream({start(controller){for(const segment of segments)controller.enqueue(segment);controller.close();}}),{headers:{'content-type':'text/event-stream'}});
}
let offsetsChecked = 0;
try {
  // All cuts inside multibyte UTF-8 scalars plus one-byte delivery cover the
  // decoder's consequential boundaries without thousands of redundant requests.
  const cuts=[];
  for(let i=1;i<bytes.length;i++)if((bytes[i]&0xc0)===0x80)cuts.push(i);
  for(const cut of cuts){
    globalThis.fetch=async()=>{requests++;return response([bytes.subarray(0,cut),bytes.subarray(cut)]);};
    const result=await withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,()=>callGemini('gemini-3.8-flash',packet,{},1000));
    assert.equal(result.text,text);assert.equal(result.parseErrors,0);assert.equal(result.payload.candidates[0].finishReason,'STOP');
    offsetsChecked++;
  }
  globalThis.fetch=async()=>{requests++;return response(Array.from(bytes,byte=>Uint8Array.of(byte)));};
  const result=await callGemini('gemini-3.8-flash',packet,{},1000);
  assert.equal(result.text,text);assert.equal(result.parseErrors,0);
  assert.equal(parseRelayEnvelope(result.text).transcript,text);
  const serialized=JSON.stringify({text:result.text,relay:parseRelayEnvelope(result.text)});
  const restored=JSON.parse(serialized);
  assert.equal(restored.text,text);assert.equal(restored.relay.transcript,text);
  const dom=new JSDOM('<body><div class="relay-stage-text"></div></body>',{url:'https://td613.invalid'});
  const node=dom.window.document.querySelector('.relay-stage-text');node.textContent=restored.text;
  assert.equal(node.textContent,text);
  const archive=await createMarrowlineThreadLibrary(dom.window);
  const thread=await archive.create({conversationTitle:'Offline transport',messages:[{role:'model',text:restored.text,relay:restored.relay}]});
  const carried=await archive.get(thread.id);
  assert.equal(carried.messages[0].text,text);assert.equal(carried.messages[0].relay.transcript,text);
  archive.close();dom.window.close();
  const report={schema:'td613.marrowline.unicode-transport-audit/v1',evidenceClass:'SYNTHETIC_OFFLINE_TRANSPORT',productionSource:'7f28a864da5a2a1af207e55eba7b27bb0ebff2ad',providerCalls:0,syntheticFetches:requests,multibyteCutsChecked:offsetsChecked,oneByteDelivery:true,providerEvents:events.length,wireSha256:digest(bytes),expectedTextSha256:digest(Buffer.from(text)),preserved:['SSE text-event concatenation','UTF-8 multibyte boundaries','UTF-16 surrogate halves across events','thought-part exclusion','STOP finish witness','relay transcript','JSON roundtrip','DOM textContent','local thread storage'],artisticQualityMeasured:false,physicalDeviceObserved:false};
  if (!process.argv[2] || fs.existsSync(process.argv[2])) throw new Error('Provide a new report file.');
  fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify(report)+'\n');
} finally {globalThis.fetch=originalFetch;}
