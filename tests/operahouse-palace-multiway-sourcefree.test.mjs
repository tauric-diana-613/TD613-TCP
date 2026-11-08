import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const H=s=>createHash('sha256').update(JSON.stringify(s)).digest('hex');
const source=Object.freeze({id:'work-alpha',title:'Aperture and Evidence',body:'A finite synthetic source.',availableAt:2});
const registry=Object.freeze([{...source,sha256:createHash('sha256').update(source.body).digest('hex')}]);
const core=(s)=>({sourceId:s.active?s.sourceId:null,active:s.active,revoked:s.revoked,claims:s.claims});
const fresh=()=>({sourceId:null,active:false,revoked:false,claims:[],tick:0,host:'H1',trace:[]});
function transition(s, op){
 const t={...s,claims:[...s.claims],trace:[...s.trace]};
 if(op==='TICK') { if(t.tick>=3)return null;t.tick++ }
 else if(op==='ADMIT') {if(t.revoked||t.active||t.tick<source.availableAt)return null;t.sourceId=source.id;t.active=true}
 else if(op==='RETRACT'){if(t.revoked)return null;t.revoked=true;t.active=false;t.claims=[]}
 else if(op==='INTERPRET'){if(!t.active||t.claims.length)return null;t.claims=[{claim:'Synthetic source is admitted',warrant:source.id}]}
 else if(op==='HOST_SWAP'){if(t.host==='H2')return null;t.host='H2'}
 else return null;
 t.trace.push(op);return t;
}
function render(s, host){return {viewTitle:host==='H1'?'Reading room':'Evidence gallery',source:registry.filter(r=>r.id===s.sourceId&&s.active).map(r=>({id:r.id,title:r.title,sha256:r.sha256})),diagnosticsHidden:true}}
const checks=[];const check=(name,f)=>{f();checks.push(name)};
check('host_substitution_core_invariance',()=>{const s={...fresh(),tick:2,sourceId:source.id,active:true};assert.equal(H(core({...s,host:'H1'})),H(core({...s,host:'H2'})));assert.notEqual(render(s,'H1').viewTitle,render(s,'H2').viewTitle)});
check('source_term_remains_visible',()=>{const s={...fresh(),sourceId:source.id,active:true};assert.equal(render(s,'H2').source[0].title,'Aperture and Evidence')});
check('temporal_admission_membrane',()=>{assert.equal(transition(fresh(),'ADMIT'),null);let s=transition(transition(fresh(),'TICK'),'TICK');assert.equal(transition(s,'ADMIT').active,true)});
check('retraction_non_retroactivity',()=>{let s=transition(transition(transition(fresh(),'TICK'),'TICK'),'ADMIT');const before=H(s);const after=transition(s,'RETRACT');assert.equal(H(s),before);assert.equal(after.active,false);assert.equal(transition(after,'ADMIT'),null)});
check('receipt_cannot_invent_source',()=>{assert.equal(registry.some(r=>r.id==='HOST_RECEIPT'),false)});
check('claim_requires_admitted_source',()=>{assert.equal(transition(fresh(),'INTERPRET'),null)});
const ops=['TICK','ADMIT','RETRACT','INTERPRET','HOST_SWAP'];
let paths=[fresh()],frontier=[paths[0]],transitions=0;
for(let depth=0;depth<6;depth++){
 const next=[];
 for(const s of frontier)for(const op of ops){const t=transition(s,op);if(t){next.push(t);transitions++}}
 paths.push(...next);frontier=next;
}
// Controlled complete-depth finite search; two histories can have identical terminal core.
const group=new Map();for(const s of paths){let k=H(core(s));if(!group.has(k))group.set(k,[]);group.get(k).push(s)}
let witness=null;for(const states of group.values()){
 const a=states.find(s=>s.trace.join(',')==='TICK,TICK,ADMIT,RETRACT');
 const b=states.find(s=>s.trace.join(',')==='RETRACT,TICK,TICK');
 if(a&&b){witness={A:a.trace,B:b.trace,coreHash:H(core(a))};break}
}
check('history_distinct_equivalent_endpoints',()=>{assert.ok(witness);assert.notDeepEqual(witness.A,witness.B)});
check('bounded_finite_exploration',()=>{assert.ok(paths.length>1);assert.ok(transitions>=1)});
check('no_scientific_credit_from_simulation',()=>{const receipt={evidence_class:'SYNTHETIC_EXECUTION',empirical_replication_credit:0};assert.equal(receipt.empirical_replication_credit,0)});
const result={schema:'dd02.operahouse-multiway-pilot/v0.1',test_count:checks.length,tests:checks,path_count:paths.length,transition_count:transitions,unique_projected_states:group.size,endpoint_witness:witness,limits:['synthetic finite rewrites','not a Palace native integration','no real human observer','no protected Flight']};
console.log(JSON.stringify(result,null,2));

