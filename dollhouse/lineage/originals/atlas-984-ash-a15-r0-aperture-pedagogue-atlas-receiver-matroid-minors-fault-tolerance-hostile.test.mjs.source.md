import assert from 'node:assert/strict';
import {
  ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,
  atlasMatroidalReceiverClosureBasisExchangeCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-matroidal-receiver-closure-basis-exchange.js';

// Independent hostile reconstruction from the exact earned parent. Do not import the child until all deletion/minor targets are rebuilt.
const parent=atlasMatroidalReceiverClosureBasisExchangeCertificate();
assert.equal(ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,'td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange/v0.1');
assert.equal(parent.passed,true);
assert.equal(parent.D.matroid_type,'U_1_2_PLUS_TWO_LOOPS');
assert.equal(parent.Q.matroid_type,'U_2_3_PLUS_ONE_LOOP');
assert.deepEqual(parent.D.combinatorics.basis_masks,[2,4]);
assert.deepEqual(parent.Q.combinatorics.basis_masks,[3,5,6]);

const bitCount=n=>n.toString(2).replace(/0/g,'').length;
const sub=(a,b)=>(a&~b)===0;
const freq=values=>values.reduce((o,v)=>(o[v]=(o[v]||0)+1,o),{});

function deletionAudit(r){
  const R=r[15],ok=[],bad=[];
  for(let f=0;f<16;f++) (r[15&~f]===R?ok:bad).push(f);
  const coc=[];
  for(const f of bad){
    let minimal=true;
    for(const g of bad) if(g!==f&&sub(g,f)) minimal=false;
    if(minimal)coc.push(f);
  }
  const safeBy=Array(5).fill(0),badBy=Array(5).fill(0);
  for(const f of ok)safeBy[bitCount(f)]++;
  for(const f of bad)badBy[bitCount(f)]++;
  const singles=[0,1,2,3].map(e=>r[15&~(1<<e)]);
  return {R,ok,bad,coc,safeBy,badBy,singles,coloops:[0,1,2,3].filter(e=>singles[e]<R),distance:Math.min(...bad.map(bitCount))};
}

const dDel=deletionAudit(parent.D.rank.values),qDel=deletionAudit(parent.Q.rank.values);
assert.deepEqual(dDel,{R:1,ok:[0,1,2,3,4,5,8,9,10,11,12,13],bad:[6,7,14,15],coc:[6],safeBy:[1,4,5,2,0],badBy:[0,0,1,2,1],singles:[1,1,1,1],coloops:[],distance:2});
assert.deepEqual(qDel,{R:2,ok:[0,1,2,4,8,9,10,12],bad:[3,5,6,7,11,13,14,15],coc:[3,5,6],safeBy:[1,4,3,0,0],badBy:[0,0,3,4,1],singles:[2,2,2,2],coloops:[],distance:2});
assert.notDeepEqual(dDel.coc,qDel.coc);
assert.notDeepEqual(dDel.safeBy,qDel.safeBy);

function lift(local,remaining){let out=0;for(let i=0;i<3;i++)if((local>>i)&1)out|=1<<remaining[i];return out;}
function minorTable(r,e,contract){
  const rem=[0,1,2,3].filter(x=>x!==e),base=r[1<<e],a=[];
  for(let s=0;s<8;s++){const m=lift(s,rem);a.push(contract?r[m|(1<<e)]-base:r[m]);}
  return a;
}
function analyze(r){
  let norm=1,normFail=r[0]===0?0:1,up=0,upFail=0,mono=0,prem=0,monoFail=0,subm=0,subFail=0;
  for(let s=0;s<8;s++){up++;if(r[s]<0||r[s]>bitCount(s))upFail++;}
  for(let a=0;a<8;a++)for(let b=0;b<8;b++){
    mono++;if(sub(a,b)){prem++;if(r[a]>r[b])monoFail++;}
    subm++;if(r[a]+r[b]<r[a|b]+r[a&b])subFail++;
  }
  const R=r[7],ind=[];for(let m=0;m<8;m++)if(r[m]===bitCount(m))ind.push(m);
  const isInd=new Set(ind),bases=ind.filter(m=>bitCount(m)===R&&r[m]===R),circuits=[];
  for(let m=1;m<8;m++)if(!isInd.has(m)){
    let minimal=true;for(let e=0;e<3;e++)if((m>>e)&1&&!isInd.has(m&~(1<<e)))minimal=false;
    if(minimal)circuits.push(m);
  }
  const loops=circuits.filter(m=>bitCount(m)===1).map(m=>[0,1,2].find(e=>m===(1<<e)));
  const coloops=[0,1,2].filter(e=>r[7&~(1<<e)]<R);
  let type=null;
  if(R===0&&loops.length===3)type='U_0_3';
  else if(R===1&&loops.length===2&&coloops.length===1)type='U_1_1_PLUS_TWO_LOOPS';
  else if(R===1&&loops.length===1&&coloops.length===0)type='U_1_2_PLUS_ONE_LOOP';
  else if(R===2&&loops.length===1&&coloops.length===2)type='U_2_2_PLUS_ONE_LOOP';
  else if(R===2&&loops.length===0&&coloops.length===0&&JSON.stringify(circuits)==='[7]')type='U_2_3';
  return {R,ind,bases,circuits,loops,coloops,type,axioms:{norm,normFail,up,upFail,mono,prem,monoFail,subm,subFail}};
}
const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function pmask(m,p){let o=0;for(let i=0;i<3;i++)if((m>>i)&1)o|=1<<p[i];return o;}
function iso(a,b){return perms.some(p=>a.every((v,m)=>v===b[pmask(m,p)]));}

const families={D:{del:[],con:[]},Q:{del:[],con:[]}};
let norm=0,normFail=0,up=0,upFail=0,mono=0,prem=0,monoFail=0,subm=0,subFail=0,rankValues=0;
for(const [name,r] of [['D',parent.D.rank.values],['Q',parent.Q.rank.values]])for(let e=0;e<4;e++)for(const [kind,contract] of [['del',false],['con',true]]){
  const table=minorTable(r,e,contract),a=analyze(table);rankValues+=table.length;
  families[name][kind][e]={table,...a};
  norm+=a.axioms.norm;normFail+=a.axioms.normFail;up+=a.axioms.up;upFail+=a.axioms.upFail;mono+=a.axioms.mono;prem+=a.axioms.prem;monoFail+=a.axioms.monoFail;subm+=a.axioms.subm;subFail+=a.axioms.subFail;
}
assert.equal(rankValues,128);
assert.deepEqual({norm,normFail,up,upFail,mono,prem,monoFail,subm,subFail},{norm:16,normFail:0,up:128,upFail:0,mono:1024,prem:432,monoFail:0,subm:1024,subFail:0});
assert.deepEqual(freq(families.D.del.map(x=>x.type)),{U_1_2_PLUS_ONE_LOOP:2,U_1_1_PLUS_TWO_LOOPS:2});
assert.deepEqual(freq(families.D.con.map(x=>x.type)),{U_1_2_PLUS_ONE_LOOP:2,U_0_3:2});
assert.deepEqual(freq(families.Q.del.map(x=>x.type)),{U_2_2_PLUS_ONE_LOOP:3,U_2_3:1});
assert.deepEqual(freq(families.Q.con.map(x=>x.type)),{U_1_2_PLUS_ONE_LOOP:3,U_2_3:1});

let bridge=0;
for(const q of [0,1,2])for(const d of [0,3]){
  bridge++;
  assert.equal(families.Q.con[q].type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(families.D.del[d].type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(families.D.con[d].type,'U_1_2_PLUS_ONE_LOOP');
  assert.equal(iso(families.Q.con[q].table,families.D.del[d].table),true);
  assert.equal(iso(families.Q.con[q].table,families.D.con[d].table),true);
}
assert.equal(bridge,6);
for(const e of [1,2]){assert.equal(families.D.con[e].type,'U_0_3');assert.equal(families.D.con[e].R,0);}
for(const e of [0,3])assert.deepEqual(families.D.del[e].table,families.D.con[e].table);
assert.deepEqual(families.Q.del[3].table,families.Q.con[3].table);

// Cardinality hostile: a three-element contraction minor cannot be identified with the four-element parent D.
assert.equal(families.Q.con[0].table.length,8);
assert.equal(parent.D.rank.values.length,16);
assert.notEqual(families.Q.con[0].table.length,parent.D.rank.values.length);

const child=await import('../app/dome-world/previews/a15-r0/atlas-receiver-matroid-minors-fault-tolerance.js');
const c=child.atlasReceiverMatroidMinorsFaultToleranceCertificate();
assert.equal(c.passed,true);
assert.deepEqual(c.D.deletion.rank_preserving_masks,dDel.ok);
assert.deepEqual(c.D.deletion.cocircuit_masks,dDel.coc);
assert.deepEqual(c.Q.deletion.rank_preserving_masks,qDel.ok);
assert.deepEqual(c.Q.deletion.cocircuit_masks,qDel.coc);
assert.equal(c.cross_control_bridge.obligations,bridge);
assert.equal(c.cross_control_bridge.passed,true);
assert.equal(c.minor_burden.minor_rank_values,rankValues);
assert.equal(c.minor_burden.monotonicity_inclusion_premises,prem);
assert.equal(c.laws.Q_nonloop_contraction_is_parent_D,false);

console.log('Ash A15-R0 Atlas receiver matroid minors fault tolerance independent hostile passed.');
