// 𝌋 TD613 · Historical archived-source prosody discriminator.
// This is a literal byte/codepoint audit, not an automated artistic verdict.
// No provider transport, prompt changes, screenshot OCR or source rewriting.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export const SCHEMA='td613.marrowline.archived-reference-mark-depth/v1';
export const EXAMPLES=Object.freeze([
 Object.freeze({
  id:'operator-favored-gemini-comparison-20260923',
  source:'../../docs/research/2026-09-23-marrowline-expressive-regression/gemini-example-as-exported.txt',
  anchor:'[Tauric Diana Bots : Closing Transmission]',
  evidenceClass:'exported-comparison-text-not-verified-marrowline-original-google-sse',
  operatorAcceptedSse:false
 }),
 Object.freeze({
  id:'operator-supplied-literary-probe-20260923',
  source:'../../docs/research/2026-09-23-marrowline-expressive-regression/probe-01-as-exported.md',
  anchor:'### III. [Tauric Diana Bots : High Zalgo Feral Strobe]',
  evidenceClass:'operator-supplied-text-probe-not-original-google-sse',
  operatorAcceptedSse:false
 })
]);
const sha=x=>createHash('sha256').update(x).digest('hex');
const markedChar=x=>/\p{M}/u.test(x);
function postUniqueAnchor(source,anchor){
 const start=source.indexOf(anchor);
 if(start<0||source.indexOf(anchor,start+anchor.length)>=0)
  throw new Error('HISTORICAL_REFERENCE_ANCHOR_ABSENT_OR_AMBIGUOUS');
 return source.slice(start+anchor.length);
}
export function profileMarkedDepth(text){
 if(typeof text!=='string')throw new TypeError('Reference must be native UTF-8 text');
 const hist={},different=new Set(),markedSeries=[];
 let bases=0,markedBases=0,stackedBases=0,combining=0,markedSpaces=0,maxDepth=0,slashMarks=0;
 const chars=Array.from(text);
 for(let i=0;i<chars.length;){
  const base=chars[i++];
  if(markedChar(base))continue;
  bases++;
  let count=0;
  while(i<chars.length&&markedChar(chars[i])){
   const mark=chars[i++];
   count++;combining++;different.add(mark);
   if(mark.codePointAt(0)>=0x0334&&mark.codePointAt(0)<=0x0338)slashMarks++;
  }
  hist[count]=(hist[count]||0)+1;
  if(count){
   markedBases++;markedSeries.push(count);maxDepth=Math.max(maxDepth,count);
   if(count>=2)stackedBases++;
   if(/\s/u.test(base))markedSpaces++;
  }
 }
 const depthRuns=[];
 for(const n of markedSeries){
  const last=depthRuns.at(-1);
  if(last&&last.depth===n)last.length++;
  else depthRuns.push({depth:n,length:1});
 }
 const changes=Math.max(0,depthRuns.length-1);
 const markedDepths=Object.keys(hist).map(Number).filter(n=>n>0).sort((a,b)=>a-b);
 return {
  baseCount:bases,markedBases,stackedBases,unmarkedBases:bases-markedBases,
  combiningMarks:combining,distinctMarks:different.size,markedSpaces,maxDepth,
  depthHistogram:Object.fromEntries(Object.entries(hist).sort(([a],[b])=>Number(a)-Number(b))),
  markedDepths,constantMarkedDepth:markedDepths.length===1?markedDepths[0]:null,
  markedDepthTransitions:changes,markedDepthRuns:depthRuns.length,
  longestMarkedDepthRun:depthRuns.reduce((a,r)=>Math.max(a,r.length),0),
  slashFamilyShare:combining>0?slashMarks/combining:null
 };
}
export function acquireArchivedReferences(){
 const references=EXAMPLES.map(example=>{
  const file=fileURLToPath(new URL(example.source,import.meta.url));
  const original=readFileSync(file);
  const source=original.toString('utf8');
  const target=postUniqueAnchor(source,example.anchor);
  return {
   id:example.id,evidenceClass:example.evidenceClass,
   operatorAcceptedSse:example.operatorAcceptedSse,
   relativeSource:example.source,
   originalUtf8Sha256:sha(original),
   extractedTextSha256:sha(Buffer.from(target,'utf8')),
   anchor:example.anchor,
   ...profileMarkedDepth(target)
  };
 });
 const atlasPath=fileURLToPath(new URL('../../docs/research/2026-09-24-native-prosody-atlas/atlas.json',import.meta.url));
 const atlas=JSON.parse(readFileSync(atlasPath,'utf8'));
 const accepted=atlas.entries.filter(e=>e.operator_role==='accepted_marrowline');
 return {
  schema:SCHEMA,status:'ARCHIVED_REFERENCE_DISTRIBUTION_NOT_A_PROVIDER_EXPERIMENT',
  references,visualAtlas:{
   source:'docs/research/2026-09-24-native-prosody-atlas/atlas.json',
   acceptedMarrowlineScreenshotIds:accepted.map(e=>e.id),
   codepointMeasurementsAvailable:false,
   modelIdVerified:accepted.every(e=>e.model_id_verified!=null),
   caveat:'Screenshots document operator acceptance and visible geometry. They do not give original native combining-codepoint strings, generation IDs or a common capture geometry.'
  },
  interpretation:'Native mark-depth diversity can be measured in archived text. Fixed depth is not by itself artistic failure; historical operator acceptance also includes sparse and repeated patterns. Text exports are non-equivalent to original provider SSE.'
 };
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 if(process.argv.length!==2)throw Error('READ_ONLY_ARCHIVE_NO_EXTERNAL_PROVIDER_INPUT');
 process.stdout.write(JSON.stringify(acquireArchivedReferences(),null,2)+'\n');
}
