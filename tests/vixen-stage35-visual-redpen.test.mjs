/**
 * Stage III.5 CSS regression contracts; screenshots still require separate
 * independent optical adjudication before preview publication.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
const read=name=>readFileSync(resolve(root,'app/encyclopedia/vixen-estate',name),'utf8');
const journey=read('vixen-ai-journey.css');
const reading=read('vixen-obsidian-reading-rgi26.css');
const mesh=read('vixen-opaline-couture-rgi14.css');
const earlier=read('vixen-redpen-couture-rgi18.css');
const lastRule=(css,selector)=>{
 const i=css.lastIndexOf(selector);
 assert.ok(i>=0,'Missing selector: '+selector);
 const start=css.indexOf('{',i),end=css.indexOf('}',start);
 assert.ok(start>=0&&end>start,'Missing CSS declaration');
 return css.slice(start+1,end);
};
const luminance=hex=>{
 const weighted=(hex.match(/[0-9a-f]{2}/gi)||[]).map(h=>parseInt(h,16)/255)
  .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return .2126*weighted[0]+.7152*weighted[1]+.0722*weighted[2];
};
const contrast=(a,b)=>{
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
test('Maestro text sits above a gently visible field, not a flattened canvas',()=>{
 const rule=lastRule(journey,'body:not([data-active-research-stage="OPERAHOUSE"]) #vixenAiJourney');
 assert.match(rule,/position:\s*relative/);
 assert.match(rule,/z-index:\s*2\s*!important/);
 assert.match(rule,/isolation:\s*isolate/);
 assert.match(rule,/linear-gradient\(120deg,rgba\(16,26,32,\.86\),rgba\(22,30,33,\.87\) 45%,rgba\(12,20,25,\.88\)\)/);
 assert.match(journey,/#vixenAiJourney \.vma-panel/);
 assert.match(mesh,/#vixenLivingMesh/);
 assert.match(mesh,/z-index:1\s*!important/);
 assert.match(html,/id="vixenAiJourney"/);
 assert.doesNotMatch(rule,/display:\s*none|opacity:\s*0|filter:\s*blur/);
});
test('Desktop editorial folio supersedes obsolete poster-scale title without touching source',()=>{
 const sel='.vix-reader-heading.vix-pdf-source-title';
 assert.ok(earlier.includes(sel));
 assert.ok(reading.includes(sel),'Legacy dark stylesheet remains source-preserved');
 const desktop=read('vixen-desktop-manuscript-opera-rgi28.css');
 const rule=lastRule(desktop,sel);
 assert.match(rule,/display:none!important/,'duplicate PDF title yields to the readable semantic Work heading');
 const article=lastRule(desktop,'#expaCompanionBodyPre.vix-couture-reader.vix-manuscript');
 assert.ok(article.includes('font:400 16.5px/1.58'),'Desktop body is comfortable literary size');
 assert.match(article,/max-height:none!important/);
 assert.match(article,/background:#fffaf6!important/);
 assert.ok(desktop.includes('.term-name'),'Catalogue rows use compact serif typography');
 assert.ok(html.indexOf('vixen-desktop-manuscript-opera-rgi28.css') > html.indexOf('vixen-obsidian-reading-rgi26.css'),
  'Desktop editorial CSS must load after its inherited theatrical rules');
 assert.match(reading,/vix-reader-paragraph/);
});
