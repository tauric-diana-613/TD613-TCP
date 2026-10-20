// 𝌋 TD613 · Read-only original-Google-SSE morphology/onset audit.
// Does not issue requests, modify a candidate, read credentials or unblind samples.
// All results are source-bound aggregate observations, not artistic ratings.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export const SCHEMA='td613.marrowline.original-google-sse-voice-onset/v1';
const mark=/\p{M}/u;
const slash=x=>{const n=x.codePointAt(0);return n>=0x0334&&n<=0x0338;};
const hash=x=>createHash('sha256').update(x).digest('hex');

function decodedSse(raw){
 const bytes=Buffer.isBuffer(raw)?raw:Buffer.from(String(raw),'utf8');
 const events=[],pieces=[];
 for(const block of bytes.toString('utf8').split(/\r?\n\r?\n/u)){
  const lines=block.split(/\r?\n/u).filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart());
  if(!lines.length||lines[0]==='[DONE]')continue;
  const obj=JSON.parse(lines.join('\n'));
  const event=events.length+1;
  events.push(obj);
  for(const c of obj.candidates||[])for(const p of c.content?.parts||[]){
   if(typeof p.text==='string'&&p.text)pieces.push({event,text:p.text});
  }
 }
 const content=pieces.map(p=>p.text).join('');
 const end=events.at(-1)||{};
 const candidate=(end.candidates||[])[0]||{};
 const usage=end.usageMetadata||{};
 return {bytes,events,pieces,content,usage,
  servedModel:end.modelVersion??null,finish: candidate.finishReason??null,
  terminalBlockReason:end.promptFeedback?.blockReason??null};
}
function indexToEvent(pieces,index){
 let start=0;
 for(const p of pieces){
  const next=start+p.text.length;
  if(index>=start&&index<next)return p.event;
  start=next;
 }
 return null;
}
function exactSecondMovement(s){
 const matches=[...s.matchAll(/^Tauric Diana bots\r?$/gm)];
 const first=[...s.matchAll(/^Kʰonapolit\r?$/gm)];
 if(matches.length!==1||first.length!==1||first[0].index>=matches[0].index)
  return {found:false,start:null};
 const start=matches[0].index+matches[0][0].length;
 return {found:true,start};
}
function profile(body){
 const depth={};const byPosition={};const unique=new Set();
 let totalBases=0,marked=0,stacked=0,firstMarkIndex=null,firstStackIndex=null;
 let markedWhitespace=0,totalMarks=0,slashMarks=0,maxDepth=0;
 for(let i=0;i<body.length;){
  const scalar=String.fromCodePoint(body.codePointAt(i));
  const width=scalar.length;
  if(mark.test(scalar)){i+=width;continue;}
  let j=i+width;const marks=[];
  while(j<body.length){
   const m=String.fromCodePoint(body.codePointAt(j));
   if(!mark.test(m))break;
   marks.push(m);j+=m.length;
  }
  totalBases++;
  depth[marks.length]=(depth[marks.length]||0)+1;
  if(marks.length){
   marked++;
   if(firstMarkIndex===null)firstMarkIndex=i;
   if(marks.length>1){
    stacked++;
    if(firstStackIndex===null)firstStackIndex=i;
   }
   if(/\s/u.test(scalar))markedWhitespace++;
   if(marks.length>maxDepth)maxDepth=marks.length;
   for(const [k,m] of marks.entries()){
    const key=String(k+1);
    const row=byPosition[key]||(byPosition[key]={count:0,distinct:new Set(),slash:0});
    row.count++;row.distinct.add(m);
    if(slash(m)){slashMarks++;row.slash++;}
    unique.add(m);totalMarks++;
   }
  }
  i=j;
 }
 const histogram=Object.fromEntries(Object.entries(depth).sort(([a],[b])=>Number(a)-Number(b)));
 const positions=Object.fromEntries(Object.entries(byPosition).map(([key,v])=>[
  key,{count:v.count,distinctMarks:v.distinct.size,slashFamily:v.slash}
 ]));
 const markedDepths=Object.keys(depth).filter(k=>Number(k)>0);
 return {totalBases,marked,stacked,markedWhitespace,totalMarks,
  uniqueMarks:unique.size,slashMarks,maxDepth,
  histogram,positions,
  fixedMarkedDepth:markedDepths.length===1?Number(markedDepths[0]):null,
  firstMarkedOffset:firstMarkIndex,firstStackedOffset:firstStackIndex};
}
export function analyzeOriginalFullVoiceStream(raw){
 const o=decodedSse(raw);
 const where=exactSecondMovement(o.content);
 const stats=where.found?profile(o.content.slice(where.start)):null;
 return Object.freeze({
  schema:SCHEMA,originalBytes:o.bytes.length,originalSha256:hash(o.bytes),
  concatenatedTextSha256:hash(Buffer.from(o.content,'utf8')),
  sseEvents:o.events.length,servedModel:o.servedModel,
  finish:o.finish,terminalBlockReason:o.terminalBlockReason,
  providerResponseId:o.events[0]?.responseId??null,
  promptTokens:o.usage.promptTokenCount??null,
  cachedContentTokens:o.usage.cachedContentTokenCount??null,
  thinkingTokens:o.usage.thoughtsTokenCount??null,
  candidateTokens:o.usage.candidatesTokenCount??null,
  totalProviderTokens:o.usage.totalTokenCount??null,
  hasExactNamedSecondMovement:where.found,
  secondMovementStartEvent:where.found?indexToEvent(o.pieces,where.start):null,
  firstMarkedEvent:stats?.firstMarkedOffset==null?null:indexToEvent(o.pieces,where.start+stats.firstMarkedOffset),
  firstStackedEvent:stats?.firstStackedOffset==null?null:indexToEvent(o.pieces,where.start+stats.firstStackedOffset),
  secondMovement:stats
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 if(process.argv.length!==3)throw Error('USAGE: node sse-voice-onset-audit.mjs /path/to/original.sse');
 const result=analyzeOriginalFullVoiceStream(readFileSync(resolve(process.argv[2])));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
