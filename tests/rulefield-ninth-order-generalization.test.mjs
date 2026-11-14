import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTRACT,shortest,evaluateCity,overlapSingle,overlapSplit,rankCollision,conservationCounterworlds,runGeneralizationGrid} from '../packages/rulefield/lab/ninth_order_generalization.mjs';
const C=(radial,lateral,queue,horizon=60,dwell=20)=>({radial,lateral,queue,horizon,dwell});
test('custody and promotion boundaries',()=>{
  assert.equal(CONTRACT.covenant,'Khona\u200Clit-po');assert.equal(CONTRACT.experimentalFlight,'HELD');assert.equal(CONTRACT.scientificClosure,'RESERVED');
});
test('genuine path costs include transfer queuing and alternate bypass',()=>{
  assert.equal(shortest(C(9,0,14),'A','F'),32);
  assert.equal(shortest(C(9,12,14),'A','F'),12);
  assert.equal(shortest(C(9,0,0),'A','F'),18);
});
test('same terminal projection and radial compression need not fix collaboration',()=>{
  const a=evaluateCity(C(9,0,14)),g=evaluateCity(C(9,12,0));
  assert.equal(a.radialCompression,g.radialCompression);assert.equal(a.terminalConnectivity,g.terminalConnectivity);
  assert.equal(a.taskFeasible,false);assert.equal(g.taskFeasible,true);
});
test('speed alone cannot destroy accessibility with unchanged queue and topology',()=>{
  for(const q of [0,4,8,12,16,20])for(const lateral of [0,12,18,24])for(const h of [45,60,75])for(const dwell of [10,20,25]){
    let prev=evaluateCity(C(24,lateral,q,h,dwell));
    for(const speed of [21,18,15,12,9,6]){
      const current=evaluateCity(C(speed,lateral,q,h,dwell));
      assert.ok(current.overlap+1e-10>=prev.overlap,JSON.stringify({q,lateral,h,dwell,speed,current,prev}));
      prev=current;
    }
  }
});
test('rank 2 can coexist with both feasible and infeasible co-presence',()=>{
  const r=rankCollision();assert.equal(r.rankInBoth,2);assert.equal(r.firstFeasible,false);assert.equal(r.secondFeasible,true);
});
test('interval Helly: pairwise dwell implies collective dwell at one host',()=>{
  const intervals=[];for(let a=0;a<7;a++)for(let b=a+1;b<8;b++)intervals.push([a,b]);
  for(const a of intervals)for(const b of intervals)for(const c of intervals){
    if(overlapSingle([a,b])>=1&&overlapSingle([a,c])>=1&&overlapSingle([b,c])>=1)assert.ok(overlapSingle([a,b,c])>=1);
  }
});
test('split nonconvex windows defeat pairwise-to-triple inference',()=>{
  const w=[[[0,3],[8,11]],[[0,3],[4,7]],[[4,7],[8,11]]];
  assert.equal(overlapSplit([w[0],w[1]]),3);assert.equal(overlapSplit([w[1],w[2]]),3);
  assert.equal(overlapSplit([w[0],w[2]]),3);assert.equal(overlapSplit(w),0);
});
test('headcount difference 42 needs exit accounting before displacement claim',()=>{
  const c=conservationCounterworlds();assert.equal(c.worldA.unobservedDisplacement,42);
  assert.equal(c.worldB.unobservedDisplacement,0);assert.equal(c.observation.retained,18);
});
test('finite grid is independently generated and contains constructive counterworlds',()=>{
  const r=runGeneralizationGrid();assert.equal(r.count,1512);assert.ok(r.fastButExcluded>0);
  assert.equal(r.noQueueCounterworld.taskFeasible,true);
  assert.equal(r.fixedDashboardCounterexample.alpha.taskFeasible,false);
  assert.equal(r.fixedDashboardCounterexample.gamma.taskFeasible,true);
});
test('invalid parameters rejected',()=>assert.throws(()=>evaluateCity(C(0,3,5)),/INVALID_POLICY/));
