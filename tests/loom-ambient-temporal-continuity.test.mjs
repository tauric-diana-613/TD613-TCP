import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { selectFlowcoreChoreography } from '../app/dome-world/holonomy-loom/flowcore-choreography.js';
import { compileLoomInstrumentStateView, mountLoomInstrumentStateView } from '../app/dome-world/holonomy-loom/instrument-state-view.js';

test('ambient time cannot switch carrier identities or field topology without an event',async()=>{
  const packet={phase:'prepared',task_present:false,shared:0,local:3,selected_document_ids:[],
    outbound_submitted:false,response_received:false,binding_verified:false,
    scene:{id:'first-crossing-notice',rules_count:1},presentation:{flowcore_choreography:selectFlowcoreChoreography(0)}};
  const view=await compileLoomInstrumentStateView(packet,{cryptoImpl:webcrypto});
  const dom=new JSDOM('<div id="field"></div>'),root=dom.window.document.querySelector('#field');
  const renderer=mountLoomInstrumentStateView(root);
  const sample=seconds=>{
    renderer.update(view,{packet,progress:1,timeMs:4000,motionTimeMs:seconds*1000,viewport:{width:390,height:844,dpr:1}});
    return {carriers:[...root.querySelectorAll('.loom-field-flight text')].map(node=>({glyph:node.textContent,relation:node.dataset.flightRelation,
      evidence:node.dataset.flightEvidence,x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y')),opacity:Number(node.getAttribute('opacity'))})),
      paths:[...root.querySelectorAll('.loom-glyph-field path')].map(node=>node.getAttribute('d'))};
  };
  try{
    const initial=sample(0),identities=initial.carriers.map(node=>node.relation);
    assert.equal(initial.carriers.length,39);assert.equal(new Set(identities).size,8);
    assert.ok(initial.carriers.every(node=>node.evidence==='presentation-only'));
    for(const edge of [1.35,1.65,2.7,3.3]){
      const before=sample(edge-.0001),after=sample(edge+.0001);
      assert.deepEqual(after.carriers.map(node=>node.relation),identities);
      assert.deepEqual(after.carriers.map(node=>node.glyph),initial.carriers.map(node=>node.glyph));
      assert.ok(after.carriers.every((node,index)=>Math.hypot(node.x-before.carriers[index].x,node.y-before.carriers[index].y)<.2),
        `No global glyph/position pop at prior hard-switch time ${edge}`);
      for(let index=0;index<after.paths.length;index++){
        const numbers=path=>(path??'').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)?.map(Number)??[];
        const a=numbers(before.paths[index]),b=numbers(after.paths[index]);
        assert.equal(a.length,b.length,'ambient time preserves field topology');
        assert.ok(b.every((value,n)=>Math.abs(value-a[n])<.2),'ambient center curves change continuously');
      }
    }
    // Carrier 1 gathers along a nonclosed path. Its periodic reset must have
    // an invisible lifetime edge, rather than an opaque spatial teleport.
    const seed=1.5/39,speed=(.014+.0033)*3.4,wrap=(1-seed)/speed;
    const before=sample(wrap-.0001),after=sample(wrap+.0001);
    assert.equal(before.carriers[1].opacity,0);assert.equal(after.carriers[1].opacity,0);
    assert.equal(before.carriers[1].relation,'gathering');assert.equal(after.carriers[1].relation,'gathering');
    assert.ok(sample((.5-seed)/speed).carriers[1].opacity>.1);
    assert.equal(view.empirical_credit,0);assert.equal(view.custody_admission_credit,0);
  }finally{renderer.destroy();dom.window.close();}
});
