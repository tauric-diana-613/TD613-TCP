/**
 * Vixen presentation palette contract · Class A/B Zero Purple Law guard.
 *
 * Separates Class A/B rendered-palette protection from Class C exact hex locks:
 * - Prohibits visible purple, violet, plum, and eggplant declarations across Opera CSS.
 * - Permits microscopic dark raven-feathered / pearlescent optical edge interference.
 * - Leaves original manuscript prose, illustrations, and dormant fixtures untouched.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';

// Discover active Opera stylesheets rather than source manuscripts or fixtures.
const cssFiles=[
 '../app/encyclopedia/reference/vixen-operator-encounter.css',
 ...readdirSync(new URL('../app/encyclopedia/vixen-estate/',import.meta.url))
  .filter(name=>name.endsWith('.css')).sort()
  .map(name=>'../app/encyclopedia/vixen-estate/'+name)
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
function isMicroscopicRavenOrPearl([r,g,b]){
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),spread=mx-mn;
 const deepRaven=mx<36&&spread<=12;
 const palePearl=mn>=225&&spread<=10;
 return deepRaven||palePearl;
}
function isVisiblePurpleField([r,g,b]){
 if(isMicroscopicRavenOrPearl([r,g,b]))return false;
 const R=r/255,G=g/255,B=b/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;
 if(!d)return false;
 const l=(mx+mn)/2,s=l>0.5?d/(2-mx-mn):d/(mx+mn);
 let h=mx===R?60*(((G-B)/d)%6):mx===G?60*((B-R)/d+2):60*((R-G)/d+4);
 if(h<0)h+=360;
 return ((d>.045&&h>=235&&h<=327&&b>g+4&&b>=r-17)||
  (Math.max(r,g,b)<130&&r>g+7&&b>g+5&&h>=316&&h<360)||
  (h>=235&&h<=327&&s*100>8&&(b-g)>=8));
}
test('Opera CSS files exclude visible plum/violet fields while allowing microscopic raven interference',()=>{
 assert.equal(isVisiblePurpleField([16,16,24]),false,'Microscopic raven interference is permitted');
 assert.equal(isVisiblePurpleField([106,27,154]),true,'Visible violet/purple fill must be rejected');
 assert.equal(isVisiblePurpleField([74,36,88]),true,'Visible plum/eggplant fill must be rejected');
 for(const path of cssFiles){
  const css=readFileSync(new URL(path,import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  const tokens=css.match(/#[a-f\d]{3,8}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/gi)||[];
  const rejected=tokens.filter(s=>{const c=rgb(s);return c&&isVisiblePurpleField(c);});
  assert.deepEqual(rejected,[],path+' reintroduced a visible plum/violet/purple declaration');
 }
});
test('Palette token vocabulary & protected Arc-Flash yellow accent survive without Class C hex locks',()=>{
 const css=readFileSync(new URL('../app/encyclopedia/vixen-estate/glinda-cybergoth-rgi10.css',import.meta.url),'utf8');
 for(const token of ['--graphite:','--porcelain:','--gold:','--vixen-pink:','--vf-metal:','--arc-flash:']){
  assert(css.includes(token),'Missing semantic Opera token: '+token);
 }
 const arcMatch=css.match(/--arc-flash:\s*(#[0-9a-f]{6})\b/i);
 assert.ok(arcMatch,'--arc-flash yellow hex must remain defined');
 const arcRgb=rgb(arcMatch[1]);
 assert.ok(arcRgb[0]>=220&&arcRgb[1]>=210&&arcRgb[2]<=200,'--arc-flash must remain warm yellow light: '+arcMatch[1]);
});
test('Active Opera inline styles and dynamic shaders exclude --violet and visible purple washes',()=>{
 const operaDocs=['../app/encyclopedia/vix-cyb.html','../app/encyclopedia/vix-cyb/podium.html','../app/encyclopedia/vix-cyb/human-podium.html'];
 const sourcesToCheck=[];
 for(const docRel of operaDocs){
  const url=new URL(docRel,import.meta.url);
  if(!existsSync(url))continue;
  const docHtml=readFileSync(url,'utf8');
  const styles=[...docHtml.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
  sourcesToCheck.push({label:docRel+' <style>',body:styles});
 }
 for(const mod of ['../app/encyclopedia/vixen-estate/vixen-opaline-couture-rgi14.mjs','../app/encyclopedia/vixen-estate/observatory-computational-score.mjs']){
  sourcesToCheck.push({label:mod,body:readFileSync(new URL(mod,import.meta.url),'utf8')});
 }
 for(const {label,body} of sourcesToCheck){
  assert(!/--violet\b/i.test(body),label+' must not declare --violet');
  const clean=body.replace(/\/\*[\s\S]*?\*\//g,'');
  const tokens=clean.match(/#[a-f\d]{3,8}\b|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/gi)||[];
  const bad=tokens.filter(t=>{const c=rgb(t);return c&&isVisiblePurpleField(c);});
  assert.deepEqual(bad,[],label+' contains visible purple/violet wash');
 }
});
