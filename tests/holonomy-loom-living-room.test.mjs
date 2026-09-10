import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountLivingRoom } from '../app/dome-world/holonomy-loom/living-room.js';
const packet=(phase,extra={})=>({phase,shared:2,local:1,selected_document_ids:['a','b'],scene:{id:`room-${phase}`,project_title:'A fictional archive',rules_count:3,documents:[{id:'a',name:'interviews.txt',share:true,content:'RAW NEVER RENDER'},{id:'b',name:'<img onerror=steal()>',share:true},{id:'private',name:'SECRET IDENTITY FILENAME',share:false,content:'SECRET BODY'}]},...extra});
function rig(t){const dom=new JSDOM('<div id="host"></div>');t.after(()=>dom.window.close());const host=dom.window.document.querySelector('#host');const room=mountLivingRoom(host);const get=name=>host.querySelector(`[data-room="${name}"]`);return {host,room,get};}
const frame=(packet,extra={})=>({packet,progress:1,motionTimeMs:0,rest:false,reducedMotion:false,...extra});

test('room renders selected document labels safely and excludes private names and all bodies',t=>{
 const {host,room,get}=rig(t);room.render(frame(packet('prepared')));
 assert.equal(host.querySelectorAll('.lr-world').length,1);
 assert.match(get('title').textContent,/fictional archive/);
 assert.equal(get('papers').querySelectorAll('title').length,2);
 assert.match(get('papers').textContent,/<img onerror=steal\(\)>/);
 assert.equal(host.querySelectorAll('img').length,0);
 assert.doesNotMatch(host.innerHTML,/SECRET IDENTITY FILENAME|SECRET BODY|RAW NEVER RENDER/);
 assert.match(get('local-count').textContent,/1 stay/);
 assert.equal(get('courier').getAttribute('visibility'),'hidden');
 assert.equal(get('reply').getAttribute('visibility'),'hidden');
 assert.equal(get('gate-bars').getAttribute('visibility'),'visible');
});

test('one submission moves once toward the gate then waits; reply appears only after observation',t=>{
 const {room,get}=rig(t), pending=packet('pending',{binding_verified:true});
 room.render(frame(pending,{progress:0,motionTimeMs:0}));const departure=get('courier').getAttribute('transform');
 room.render(frame(pending,{progress:1,motionTimeMs:3000}));const arrival=get('courier').getAttribute('transform');
 assert.notEqual(departure,arrival);
 room.render(frame(pending,{progress:1,motionTimeMs:15000}));assert.equal(get('courier').getAttribute('transform'),arrival,'waiting never resends the envelope');
 assert.equal(get('reply').getAttribute('visibility'),'hidden');
 assert.match(get('receiver-caption').textContent,/activity unknown/);
 room.render(frame(packet('received',{used_document_ids:['a'],missing_information:['A signed consent record is missing.']})));
 assert.equal(get('reply').getAttribute('visibility'),'visible');
 assert.equal(get('courier').getAttribute('visibility'),'hidden');
 assert.match(get('receiver-caption').textContent,/1 source references reported/);
 assert.equal((get('return-path').getAttribute('d').match(/M/g)||[]).length,2,'one missing item cuts the strand into two segments');
});

test('held after submission preserves departure and return facts while blocking review',t=>{
 const {room,get}=rig(t);
 room.render(frame(packet('held',{outbound_submitted:true,response_received:true,used_document_ids:['a'],missing_information:[]})));
 assert.equal(get('held-mark').getAttribute('visibility'),'visible');
 assert.equal(get('gate-bars').getAttribute('visibility'),'visible');
 assert.equal(get('reply').getAttribute('visibility'),'visible');
 assert.match(get('reply-label').textContent,/held/);
 assert.equal(get('receiver-glyph').textContent,'𝄐');
});

test('rest, reduced motion and replay keep an identical static consequence and bounded DOM',t=>{
 const {host,room,get}=rig(t), pending=packet('pending');
 room.render(frame(pending,{reducedMotion:true,motionTimeMs:42,progress:.1}));const staticFrame=host.innerHTML;
 room.render(frame(pending,{reducedMotion:true,motionTimeMs:9000,progress:.9}));assert.equal(host.innerHTML,staticFrame);
 room.render(frame(pending,{rest:true,motionTimeMs:2,progress:.2}));assert.equal(get('courier').getAttribute('transform'),'translate(466.00 144.00) rotate(0)');
 const replay=frame(pending,{motionTimeMs:730,progress:.25});room.render(replay);const first=host.innerHTML;
 room.render(frame(packet('completed',{used_document_ids:['a','b'],missing_information:[]})));
 room.render(replay);assert.equal(host.innerHTML,first,'replaying the same admitted frame restores exact geometry and copy');
 assert.ok(host.querySelectorAll('*').length<200);
 const svg=host.querySelector('svg'), paper=get('papers').firstElementChild;
 for(let index=0;index<100;index++)room.render(frame(pending,{progress:1,motionTimeMs:index*100}));
 assert.equal(host.querySelector('svg'),svg);assert.equal(get('papers').firstElementChild,paper,'steady frames retain geometry');
 room.dispose();assert.equal(host.children.length,0);
 room.render(replay);assert.equal(host.children.length,0);
});

test('child and auditor projections keep the same route geometry and ownership facts',t=>{
 const {room,get}=rig(t), current=packet('pending',{binding_verified:true});
 room.render(frame(current,{progress:.6,motionTimeMs:1500}));const courier=get('courier').getAttribute('transform'), local=get('local-count').textContent;
 room.render(frame(current,{progress:.6,motionTimeMs:1500,auditor:true}));
 assert.match(get('now').textContent,/PENDING/);assert.equal(get('courier').getAttribute('transform'),courier);assert.equal(get('local-count').textContent,local);
 assert.match(get('why').textContent,/binding verified/);
});

test('an admitted completion may visibly arrive once without delaying the answer or losing rest',t=>{
 const {room,get}=rig(t);
 const completed=packet('completed',{presentation:{settling:true},used_document_ids:['a'],missing_information:['An unresolved consent question.']});
 room.render(frame(completed,{progress:0,motionTimeMs:2000}));
 const departure=get('answer-tray').getAttribute('transform');
 assert.equal(get('reply').getAttribute('visibility'),'visible');
 assert.match(get('now').textContent,/answer is ready/,'admission stays immediate during visual arrival');
 assert.equal(get('receiver-glyph').textContent,'出');
 assert.equal(get('return-path').getAttribute('stroke-dashoffset'),'1.000');
 room.render(frame(completed,{progress:.5,motionTimeMs:3000}));
 assert.notEqual(get('answer-tray').getAttribute('transform'),departure);
 room.render(frame(completed,{progress:1,motionTimeMs:4000}));
 assert.equal(get('answer-tray').getAttribute('transform'),'translate(378 353)');
 assert.equal(get('receiver-glyph').textContent,'𝄐');
 assert.equal(get('return-path').getAttribute('stroke-dashoffset'),'0.000');
 room.render(frame(completed,{progress:0,motionTimeMs:2000,reducedMotion:true}));
 assert.equal(get('answer-tray').getAttribute('transform'),'translate(378 353)');
 assert.equal(get('receiver-glyph').textContent,'𝄐');
});
