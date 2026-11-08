// 𝌋 Vixen Cybernetics Candidate 4 · source-free Node smoke test.
// Execute: node tests/vixen-candidate4-runtime.test.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(path.join(root,'app/encyclopedia/vix-cyb-candidate4.html'),'utf8');
const match=(re,label)=>{const m=html.match(re);assert(m,label+' missing');return m[1]};
const app=match(/<script>([\s\S]*?)<\/script>/,'inline runtime');
const data=JSON.parse(match(/<script type="application\/json" id="vixen-data">([\s\S]*?)<\/script>/,'Vixen metadata'));
assert.equal(data.works.length,32);assert.equal(data.human_gates.length,8);assert.equal(data.instruments.length,21);
assert.equal((html.match(/<script/g)||[]).length,2);
assert(!/<script[^>]*src=/.test(html));
assert(!/renderCart\(/.test(html));
assert(html.includes('Khona‌lit-po'));
assert.equal((html.match(/UNADJUDICATED_PAIR/g)||[]).length>0,true);
new vm.Script(app,{filename:'vixen-candidate4-runtime'});

class Element{
 constructor(tag){this.tag=tag;this.children=[];this.style={};this.h={};this.attributes={};this.textContent='';this.value='';this._inner=''}
 append(...items){this.children.push(...items);return this}
 replaceChildren(...items){this.children=[...items]}
 setAttribute(name,value){this.attributes[name]=value}
 addEventListener(kind,cb){this.h[kind]=cb}
 set innerHTML(value){this._inner=value}
 get innerHTML(){return this._inner}
 focus(){}
 click(){return this.h.click?.({preventDefault(){}})}
}
function harness(protocol='file:',alterReference=()=>{}){
 const ids={nav:new Element('nav'),main:new Element('main'),inspector:new Element('aside'),brand:new Element('a'),'fox-mark':new Element('template'),'vixen-data':new Element('script')};
 ids['vixen-data'].textContent=JSON.stringify(data);ids['fox-mark']._inner='<svg></svg>';
 let fetchCount=0;
 const document={getElementById:id=>ids[id],createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment')};
 const location=protocol==='file:'?{protocol,href:'file:///vix-cyb-candidate4.html',origin:'null'}:{protocol:'https:',href:'https://td613.example/encyclopedia/vix-cyb-candidate4.html',origin:'https://td613.example'};
 const fetch=async url=>{fetchCount++;assert.equal(url.origin,location.origin,'only same origin permitted');assert(url.pathname.startsWith('/encyclopedia/reference/'));const basename=url.pathname.split('/').at(-1);const pathname=path.join(root,'app/encyclopedia/reference',basename);const decoded=JSON.parse(readFileSync(pathname,'utf8'));alterReference(decoded,basename);return {ok:true,status:200,url:url.href,json:async()=>decoded}};
 const sandbox={document,location,window:{scrollTo(){}},URL,fetch};
 vm.runInNewContext(app,sandbox,{timeout:5000});
 const flatten=element=>{const out=[];function visit(x){out.push(x);for(const child of x.children||[])visit(child)}visit(element);return out};
 const click=label=>{const b=[...flatten(ids.nav),...flatten(ids.main),...flatten(ids.inspector)].find(x=>x.tag==='button'&&x.textContent.includes(label));assert(b,'Missing clickable control: '+label);return b.click()};
 const text=()=>flatten(ids.main).map(e=>e.textContent).filter(Boolean).join(' ');
 return {click,text,getFetchCount:()=>fetchCount};
}
const offline=harness('file:');
for(const label of ['02 / Works','Inspect','03 / Identity','Examine MERGE','Examine SPLIT','Rest / clear','04 / Methods','06 / Dossier','00 / Threshold','01 / Observatory'])offline.click(label);
offline.click('05 / Reference');await offline.click('Check read-only reference bridge');
assert.equal(offline.getFetchCount(),0,'file mode must not attempt external reference acquisition');
assert.match(offline.text(),/HELD \/ NOT ADMITTED/);

const hosted=harness('https:');
hosted.click('05 / Reference');await hosted.click('Check read-only reference bridge');
assert.equal(hosted.getFetchCount(),3,'three local reference resources expected');
assert.match(hosted.text(),/CENSUS_MATCHED · CRYPTOGRAPHIC PROOF HELD/);
assert.match(hosted.text(),/REFERENCE RECORDS · MAX 36/);

const tampered=harness('https:',(json,name)=>{if(name==='directory.json')json.pop()});
tampered.click('05 / Reference');await tampered.click('Check read-only reference bridge');
assert.match(tampered.text(),/HELD \/ NOT ADMITTED/);
assert.doesNotMatch(tampered.text(),/CENSUS_MATCHED/);

console.log('𝌋 VIXEN C4 static + DOM + reference bridge smoke: PASS');
console.log('32 Works; 8 unadjudicated Gates; 21 original protocols; 7 view routes; offline fail-closed; same-origin reference census; malformed source held.');
console.log('Note: this deterministic fake DOM is NOT independent Chromium, WebKit or Firefox browser qualification.');
