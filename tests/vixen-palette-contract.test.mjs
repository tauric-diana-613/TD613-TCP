/**
 * Vixen presentation palette contract · lexical guard for inherited CSS hues.
 * Source-level colors only; browser compositing and artistic judgment remain separate.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const files=[
 '../app/encyclopedia/reference/vixen-operator-encounter.css',
 '../app/encyclopedia/vixen-estate/glinda-cybergoth-rgi10.css',
 '../app/encyclopedia/vixen-estate/vixen-stage-architecture-rgi10b.css',
 '../app/encyclopedia/vixen-estate/glinda-spectacle-rgi11.css',
 '../app/encyclopedia/vixen-estate/glinda-luminous-proscenium-rgi12.css',
 '../app/encyclopedia/vixen-estate/vixen-electrical-breath-rgi13.css',
 '../app/encyclopedia/vixen-estate/vixen-opaline-couture-rgi14.css',
 '../app/encyclopedia/vixen-estate/synthesis-salon.css',
 '../app/encyclopedia/vixen-estate/vixen-foyer.css',
 '../app/encyclopedia/vixen-estate/observatory-electric-foundry.css',
 '../app/encyclopedia/vixen-estate/research-chamber.css',
];
function rgb(s){
 const m=s.match(/^#([a-f\d]{3,8})$/i);
 if(m){
  let h=m[1];
  if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
 }
 const n=s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
 return n?n.slice(1,4).map(Number):null;
}
function isPlum([r,g,b]){
 const R=r/255,G=g/255,B=b/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;
 let h=0;
 if(d)h=mx===R?60*(((G-B)/d)%6):mx===G?60*((B-R)/d+2):60*((R-G)/d+4);
 if(h<0)h+=360;
 return (d>.045&&h>=242&&h<=326&&b>g+4&&b>=r-17)||
  (Math.max(r,g,b)<130&&r>g+7&&b>g+5&&h>=316&&h<360)||
  (Math.max(r,g,b)<60&&h>=240&&h<=325&&b>g+2&&b>=r+2);
}
test('inherited Vixen CSS contains no residual plum/violet chromatic literals',()=>{
 for(const path of files){
  const css=readFileSync(new URL(path,import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  const tokens=css.match(/#[a-f\d]{3,8}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/gi)||[];
  const rejected=tokens.filter(s=>{const c=rgb(s);return c&&isPlum(c)});
  assert.deepEqual(rejected,[],path+' reintroduced a plum/violet declaration');
 }
});
test('Glinda root palette preserves graphite/pearl/champagne/pink/chrome',()=>{
 const css=readFileSync(new URL('../app/encyclopedia/vixen-estate/glinda-cybergoth-rgi10.css',import.meta.url),'utf8');
 for(const token of ['--graphite:#12181d','--porcelain:#fff7f1','--gold:#f5ddb1',
  '--vixen-pink:#ff65aa','--vf-metal:#d2dde0']){
  assert(css.includes(token),token);
 }
});
test('Zero-purple / zero-violet hue guard enforces Baker-Miller rose across inline styles and couture modules',()=>{
 const extraSources=[
  ...files,
  '../app/encyclopedia/vixen-estate/vixen-opaline-couture-rgi14.mjs',
  '../app/encyclopedia/vixen-estate/observatory-computational-score.mjs'
 ];
 const isVioletOrOrchid=([r,g,b])=>{
  const R=r/255,G=g/255,B=b/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;
  if(!d)return false;
  const l=(mx+mn)/2,s=l>0.5?d/(2-mx-mn):d/(mx+mn);
  let h=mx===R?60*(((G-B)/d)%6):mx===G?60*((B-R)/d+2):60*((R-G)/d+4);
  if(h<0)h+=360;
  return h>=235&&h<=327&&s*100>5;
 };
 const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
 const styleMatch=html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
 const sourcesToCheck=[
  {label:'vix-cyb.html <style>',body:(styleMatch?styleMatch[1]:'')},
  ...extraSources.map(p=>({label:p,body:readFileSync(new URL(p,import.meta.url),'utf8')}))
 ];
 for(const {label,body} of sourcesToCheck){
  assert(!/--violet\b/i.test(body),label+' must not redeclare --violet');
  const clean=body.replace(/\/\*[\s\S]*?\*\//g,'');
  const tokens=clean.match(/#[a-f\d]{3,8}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/gi)||[];
  const bad=tokens.filter(t=>{const c=rgb(t);return c&&isVioletOrOrchid(c);});
  assert.deepEqual(bad,[],label+' contains purple/violet hue (235-327 deg)');
 }
});
