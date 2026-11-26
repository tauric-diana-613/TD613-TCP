/**
 * Stage III.5 CSS regression contracts · Class A/B/C separated.
 * Preserves Class B layering, duplicate-title suppression, unclipped reading,
 * and Class A footer scrub while releasing Class C decorative tokens for Turn II.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
const humanPodiumPath=resolve(root,'app/encyclopedia/vix-cyb/human-podium.html');
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
test('Maestro text sits above a gently visible field, not a flattened canvas',()=>{
 const rule=lastRule(journey,'body:not([data-active-research-stage="OPERAHOUSE"]) #vixenAiJourney');
 assert.match(rule,/position:\s*relative/);
 assert.match(rule,/z-index:\s*2/);
 assert.match(rule,/isolation:\s*isolate/);
 assert.match(journey,/#vixenAiJourney \.vma-panel/);
 assert.match(mesh,/#vixenLivingMesh/);
 assert.match(mesh,/z-index:1\s*!important/);
 const podiumHostHtml=existsSync(humanPodiumPath)?readFileSync(humanPodiumPath,'utf8'):html;
 assert.match(podiumHostHtml,/id="vixenAiJourney"/);
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
 assert.match(article,/font:\s*400\s+(?:1[5-9]|2\d|\d+\.\d+px|clamp\()/i,'Desktop body remains readable editorial size');
 assert.match(article,/max-height:\s*none!important/);
 assert.ok(desktop.includes('.term-name'),'Catalogue rows use compact serif typography');
 assert.ok(html.indexOf('vixen-desktop-manuscript-opera-rgi28.css') > html.indexOf('vixen-obsidian-reading-rgi26.css'),
  'Desktop editorial CSS must load after its inherited theatrical rules');
 assert.match(reading,/vix-reader-paragraph/);
});

test('Public Opera footer contains editorial navigation, never operator adjudication or replication status',()=>{
 const section=html.match(/<footer class="footer" role="contentinfo">([\s\S]*?)<\/footer>/)?.[1];
 assert.ok(section,'Public footer must remain available');
 assert.match(section,/VIXEN\s+CYBERNETICS/i);
 assert.doesNotMatch(section,/Recorded Work Status|Human Closure Required|Empirical Replication Credit|<code>HELD<\/code>/i,
  'Backstage release and replication state must remain outside visitor-facing Opera furniture');
});
