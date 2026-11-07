/**
 * 𝌋 Rulefield Finite Multiway Laboratory v1 — executable reference models.
 *
 * This is an independently specified SOURCE-FREE finite string rewrite engine,
 * NOT the Wolfram Function Repository implementation or a physics claim.
 * Node 20+, no dependencies; deterministic complete bounded enumeration.
 *
 * Invariants: preserve event instances even when states merge; keep bounded
 * joinability separate from global confluence and human/physical inference.
 */
import {createHash} from 'node:crypto';
const digest = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const insist = (ok,msg)=>{if(!ok)throw new Error(msg)};
const entropy = values => {
  if(!values.length)return 0;
  const counts=new Map();for(const x of values)counts.set(x,(counts.get(x)||0)+1);
  return [...counts.values()].reduce((sum,n)=>{const p=n/values.length;return sum-p*Math.log2(p)},0);
};
export function normalizeRules(rules){
 insist(Array.isArray(rules)&&rules.length&&rules.length<=16,'1–16 rules required');
 const ids=new Set();
 return rules.map(r=>{
  insist(r&&typeof r.id==='string'&&/^[A-Za-z0-9_-]{1,30}$/.test(r.id)&&!ids.has(r.id),'Duplicate or invalid rule ID');
  ids.add(r.id);
  insist(typeof r.from==='string'&&r.from.length>0&&r.from.length<=6,'Nonempty bounded left pattern required');
  insist(typeof r.to==='string'&&r.to.length<=6,'Bounded right pattern required');
  insist(/^[A-Z]+$/.test(r.from)&&/^[A-Z]*$/.test(r.to),'ASCII alphabet-only finite toy model');
  return Object.freeze({id:r.id,from:r.from,to:r.to});
 });
}
export function enabledEvents(state,rules){
 insist(typeof state==='string'&&/^[A-Z]*$/.test(state),'State must be ASCII uppercase');
 const norm=normalizeRules(rules),events=[];
 for(const r of norm){
  for(let offset=0;offset<=state.length-r.from.length;offset++){
   if(state.slice(offset,offset+r.from.length)===r.from){
    const next=state.slice(0,offset)+r.to+state.slice(offset+r.from.length);
    events.push({rule:r.id,offset,read:r.from,write:r.to,next,span:[offset,offset+r.from.length]});
   }
  }
 }
 return events.sort((a,b)=>a.rule.localeCompare(b.rule)||a.offset-b.offset||a.next.localeCompare(b.next));
}
export function enumerate(initial,rules,{depth=3,maxPaths=10000,maxLength=18}={}){
 insist(Number.isInteger(depth)&&depth>=0&&depth<=8,'Depth cap 0–8');
 insist(Number.isInteger(maxPaths)&&maxPaths>=2&&maxPaths<=100000,'Path cap 2–100000');
 insist(Number.isInteger(maxLength)&&maxLength>=1&&maxLength<=64,'Length cap 1–64');
 insist(typeof initial==='string'&&/^[A-Z]*$/.test(initial)&&initial.length<=maxLength,'Invalid bounded initial');
 const norm=normalizeRules(rules);
 let paths=[{id:'p0',state:initial,history:[],step:0}],frontier=[paths[0]];
 const events=[],layerCounts=[{step:0,instances:1,distinctStates:1}],f=()=>({});
 let truncated=false, eventId=0;
 for(let step=1;step<=depth;step++){
  const next=[];
  for(const p of frontier){
   for(const ev of enabledEvents(p.state,norm)){
    if(ev.next.length>maxLength){truncated=true;continue;}
    if(paths.length+next.length>=maxPaths){truncated=true;break;}
    const child={id:'p'+(paths.length+next.length),state:ev.next,
       history:[...p.history,{rule:ev.rule,offset:ev.offset,read:ev.read,write:ev.write}],
       step};
    next.push(child);
    events.push({event_id:'e'+eventId++,from:p.id,to:child.id,source_state:p.state,target_state:ev.next,step,rule:ev.rule,offset:ev.offset,span:ev.span});
   }
   if(truncated)break;
  }
  paths.push(...next);frontier=next;
  layerCounts.push({step,instances:frontier.length,distinctStates:new Set(frontier.map(p=>p.state)).size});
  if(truncated)break;
 }
 const states=[...new Set(paths.map(p=>p.state))].sort();
 const finals=paths.filter(p=>p.step===depth);
 const byState=new Map();for(const p of finals){if(!byState.has(p.state))byState.set(p.state,[]);byState.get(p.state).push(p);}
 const hPath=finals.length?Math.log2(finals.length):0; // uniform over event histories at depth
 const hState=entropy(finals.map(p=>p.state));
 const historyLoss=finals.length?hPath-hState:0; // exact for distinct event histories
 const forks=new Map();for(const ev of events){if(!forks.has(ev.from))forks.set(ev.from,[]);forks.get(ev.from).push(ev)}
 const branchPairs=[];
 for(const [source,es] of forks){
  for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){
   branchPairs.push({source_path:source,left_event:es[i].event_id,right_event:es[j].event_id,left_state:es[i].target_state,right_state:es[j].target_state,
     same_immediate_state:es[i].target_state===es[j].target_state});
  }
 }
 return {schema:'td613.finite-multiway-rewrite/v1',model:'FINITE_STRING_SUBSTITUTION_NOT_HYPERGRAPH_PHYSICS',
 initial,rules:norm,depth,maxPaths,maxLength,truncated,states,pathInstances:paths,
 events,layerCounts,branchPairs,
 endpoint:{step:depth,path_count:finals.length,unique_states:byState.size,uniform_path_entropy_bits:hPath,
  state_entropy_bits:hState,conditional_history_entropy_bits:historyLoss,
  weights:[...byState.entries()].map(([state,p])=>({state,count:p.length,probability:p.length/finals.length}))},
 evidence_ceiling:'BOUND_TO_DECLARED_DEPTH_AND_PATH_CAP',
 no_global_causal_invariance_claim:true,independent_external_observation:false};
}
function reachable(start,rules,horizon,maxStates=300){
 let frontier=[start],seen=new Map([[start,0]]);
 for(let step=1;step<=horizon;step++){
  const next=[];
  for(const s of frontier)for(const e of enabledEvents(s,rules)){
   if(e.next.length>40||seen.has(e.next))continue;
   seen.set(e.next,step);next.push(e.next);
   if(seen.size>maxStates)return {states:seen,truncated:true};
  }
  frontier=next;
 }
 return {states:seen,truncated:false};
}
export function resolveFork(left,right,rules,{horizon=3}={}){
 insist(Number.isInteger(horizon)&&horizon>=0&&horizon<=8,'Bounded horizon required');
 const a=reachable(left,rules,horizon),b=reachable(right,rules,horizon);
 const meet=[...a.states.keys()].filter(k=>b.states.has(k)).sort((x,y)=>a.states.get(x)+b.states.get(x)-(a.states.get(y)+b.states.get(y))||x.localeCompare(y));
 const terminal=(s)=>enabledEvents(s,rules).length===0;
 return {left,right,horizon,joinable_within_bound:meet.length>0,witness_state:meet[0]||null,
  left_depth:meet.length?a.states.get(meet[0]):null,right_depth:meet.length?b.states.get(meet[0]):null,
  both_distinct_normal_forms:left!==right&&terminal(left)&&terminal(right),
  disposition:meet.length?'FINITE_JOIN_WITNESSED':(left!==right&&terminal(left)&&terminal(right))?'PROVEN_NONJOINABLE_TERMINAL_PAIR':'UNKNOWN_OUTSIDE_SEARCH_BOUND',
  search_truncated:a.truncated||b.truncated};
}
export function criticalPairs(initial,rules,{depth=1,horizon=3}={}){
 const m=enumerate(initial,rules,{depth,maxPaths:1500,maxLength:32});
 return m.branchPairs.map(p=>({...p,resolution:resolveFork(p.left_state,p.right_state,rules,{horizon})}));
}
export function finiteCA(rule,{width=41,steps=24,seed=null,perturb=null,boundary='periodic'}={}){
 insist(Number.isInteger(rule)&&rule>=0&&rule<=255,'Elementary CA rule 0–255');
 insist(Number.isInteger(width)&&width>=5&&width<=201,'CA lattice width 5–201');
 insist(Number.isInteger(steps)&&steps>=1&&steps<=300,'CA steps 1–300');
 insist(boundary==='periodic'||boundary==='zero','Allowed boundary periodic / zero');
 let initial=Array(width).fill(0);initial[seed==null?Math.floor(width/2):seed]=1;
 let alternate=[...initial];
 if(perturb!==null){insist(Number.isInteger(perturb)&&perturb>=0&&perturb<width&&perturb!==seed,'Invalid perturb');alternate[perturb]^=1;}
 const evolution=[initial],comparison=[alternate];
 const stepOne=row=>row.map((_,i)=>{
   const left=i===0?(boundary==='periodic'?row[width-1]:0):row[i-1];
   const right=i===width-1?(boundary==='periodic'?row[0]:0):row[i+1];
   const key=(left<<2)|(row[i]<<1)|right;
   return (rule>>key)&1;
 });
 for(let t=0;t<steps;t++){evolution.push(stepOne(evolution.at(-1)));comparison.push(stepOne(comparison.at(-1)));}
 const occupancy=evolution.map(row=>row.reduce((a,b)=>a+b,0));
 const spatialBinaryEntropy=evolution.map(row=>{const p=row.reduce((a,b)=>a+b,0)/width;return p===0||p===1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p))});
 const hamming=evolution.map((row,i)=>row.reduce((a,b,j)=>a+(b!==comparison[i][j]),0));
 return {schema:'td613.elementary-ca-finite/v1',rule,width,steps,boundary,seed_index:seed==null?Math.floor(width/2):seed,perturb_index:perturb,
  rows:evolution.map(r=>r.join('')),occupancy,spatial_binary_entropy_bits:spatialBinaryEntropy,
  perturbation_hamming_distance:hamming,
  warning:'Finite spatial Shannon entropy and Hamming sensitivity are NOT Kolmogorov complexity or a Lyapunov exponent.',
  proof_of_chaos:false,experimental_origin:'DETERMINISTIC_SOURCE_FREE'};
}
export function runReferenceSuite(){
 const ruleA=[{id:'R',from:'A',to:'B'}];
 const diamond=enumerate('AA',ruleA,{depth:2,maxPaths:100});
 const diamondFork=resolveFork('BA','AB',ruleA,{horizon:1});
 const bad=[{id:'R1',from:'AB',to:'BA'},{id:'R2',from:'AB',to:'AA'}];
 const open=criticalPairs('AB',bad,{depth:1,horizon:4});
 const repair=[...bad,{id:'R3',from:'BA',to:'AA'}];
 const joined=criticalPairs('AB',repair,{depth:1,horizon:2});
 const ca30=finiteCA(30,{width:41,steps:24,perturb:22});
 const ca90=finiteCA(90,{width:41,steps:24,perturb:22});
 insist(diamond.endpoint.path_count===2&&diamond.endpoint.unique_states===1&&Math.abs(diamond.endpoint.conditional_history_entropy_bits-1)<1e-12,'Diamond path entropy invariant');
 insist(diamondFork.joinable_within_bound===true,'Diamond resolution invariant');
 insist(open.some(p=>p.resolution.disposition==='PROVEN_NONJOINABLE_TERMINAL_PAIR'),'True finite normal form counterexample absent');
 insist(joined.some(p=>p.resolution.joinable_within_bound),'Repair candidate bounded join missing');
 insist(ca30.rows.length===25&&ca90.rows.length===25&&ca30.perturbation_hamming_distance[0]===1,'Finite CA evidence invalid');
 return {schema:'td613.rulefield.nks-reference-suite/v1',status:'SOURCE_FREE_FINITE_TEST_ONLY',program:'rulefield/lab/multiway_lab.mjs',
  derivations:{
   critical_pair:{unresolved:open[0].resolution,repair_candidate:{id:'R3',from:'BA',to:'AA',status:'COUNTERFACTUAL_PROPOSAL_NOT_AUTO_ADOPTED'},after_candidate:joined[0].resolution},
   local_commutation:{init:'AA',rules:ruleA,step_2_histories:diamond.endpoint.path_count,step_2_unique_states:diamond.endpoint.unique_states,
     uniform_history_loss_bits:diamond.endpoint.conditional_history_entropy_bits,disposition:'BOUNDED_JOIN_WITNESSED_NOT_GLOBAL_CAUSAL_INVARIANCE'},
   cellular_automata:{rule_30:{final_ones:ca30.occupancy.at(-1),hamming:ca30.perturbation_hamming_distance.at(-1),finite_spatial_entropy:ca30.spatial_binary_entropy_bits.at(-1)},
                     rule_90:{final_ones:ca90.occupancy.at(-1),hamming:ca90.perturbation_hamming_distance.at(-1),finite_spatial_entropy:ca90.spatial_binary_entropy_bits.at(-1)}}
  },
  scope:{real_wolfram_kernel_executed:false,physical_causal_invariance_proven:false,empirical_novelty_credit:0,
  uniform_path_sampling_assumed:true,human_observer_intervention_unmeasured:true,protected_flight:'HELD',human_closure:'RESERVED'}};
}
