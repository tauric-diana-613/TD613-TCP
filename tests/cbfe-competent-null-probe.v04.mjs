/**
 * TD613 DD-02 | Conditional Hearing Manifold against a competent strong union.
 * Self-contained, deterministic, SOURCE-FREE finite programming experiment.
 * Explicitly not a social-science study, protected Experiment B Flight, or empirical replication.
 * Target commission: COMM-CBFE-RELATIONAL-GEOMETRY-DD02-V03-20261107.
 * Preregistered: docs/research/emergence-hq/CBFE_DD02_COMPETENT_NULL_PREFLIGHT_V04.md.
 */
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';

export const VERSION = 'td613.cbfe.dd02.competent-null/v0.4';
export const SEED = 0xCBFE0711;
export const STRATA = Object.freeze(['H0_BASIC','H1_CONDITIONAL','H2_WITHDRAWAL_TYPE']);
const N_PER_STRATUM = 128;
const hash = x => createHash('sha256').update(String(x)).digest('hex');
const invariant = (cond,msg) => {if(!cond)throw Error(msg)};
const pack = x => JSON.stringify(x);

function prng(seed) {
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/0x100000000};
}
const draw=(rand,n)=>Math.floor(rand()*n);
const edge = (from,to,cost,gate='OPEN',id=`${from}->${to}:${gate}`)=>({id,from,to,cost,gate});

/** Never constructs an actual person, gender, race, or institution. */
export function generateEpisode(stratum,index) {
  invariant(STRATA.includes(stratum),'unknown stratum');
  invariant(Number.isInteger(index)&&index>=0&&index<N_PER_STRATUM,'bad episode index');
  const sid=`${stratum}-${String(index).padStart(3,'0')}`;
  const salt=(STRATA.indexOf(stratum)+1)*65537+index*8191;
  const rand=prng((SEED ^ salt)>>>0);
  const standing=draw(rand,2)===0?'HIGH':'JUNIOR';
  const policy=stratum==='H0_BASIC'?'STANDING_NEUTRAL':draw(rand,2)?'PRESTIGE_GATED':'STANDING_NEUTRAL';
  const tick=stratum==='H1_CONDITIONAL'?2+draw(rand,4):draw(rand,6);
  const availableAt=draw(rand,5);
  const consent=Boolean(draw(rand,2));
  const reviewAccess=Boolean(draw(rand,2));
  const sourceStatus=stratum==='H2_WITHDRAWAL_TYPE'?['ACTIVE','WITHHELD','UNKNOWN'][draw(rand,3)]:'ACTIVE';
  const withdrawnAt=stratum==='H2_WITHDRAWAL_TYPE'&&draw(rand,2)?draw(rand,7):null;
  const sourceClass=stratum==='H2_WITHDRAWAL_TYPE'&&draw(rand,5)===0?'HOST_DIAGNOSTIC':'REGISTERED_SOURCE';
  const sourceText=`fictional testimony for ${sid}`;
  const nodes=['source','intake','hearer','claim','appeal','review','inspector'];
  const edges=[
    edge('source','intake',1,'OPEN','submit'),
    edge('intake','hearer',1+draw(rand,4),'DIRECT','hearing'),
    edge('hearer','claim',1,'OPEN','claim'),
    edge('intake','appeal',1+draw(rand,3),'CONSENT','request-appeal'),
    edge('appeal','hearer',1+draw(rand,3),'OPEN','review-appeal'),
    edge('intake','review',1+draw(rand,5),'REVIEW','ombuds-review'),
    edge('review','hearer',1+draw(rand,3),'OPEN','ombuds-hear'),
    edge('intake','inspector',1,'OPEN','inspect-host'),
    edge('inspector','claim',1,'HOST_RECEIPT','host-claims-proof')
  ];
  if(draw(rand,2))edges.push(edge('appeal','intake',2,'OPEN','return-appeal-cycle'));
  if(draw(rand,2))edges.push(edge('review','appeal',3,'CONSENT','review-to-appeal'));
  // Shuffle edges, making accidental dependence on declared array order observable.
  for(let i=edges.length-1;i>0;i--){const j=draw(rand,i+1);[edges[i],edges[j]]=[edges[j],edges[i]]}
  return {
    id:sid,stratum,source:{id:`source-${sid}`,digest:hash(sourceText),sourceClass,status:sourceStatus,availableAt,withdrawnAt},
    standing,policy,tick,consent,reviewAccess,nodes,edges,operatorAuthority:'HUMAN_ONLY',theme:'minimal'
  };
}

function sourceStatusAt(s) {
  if(s.source.status==='UNKNOWN')return 'HELD';
  if(s.source.status==='WITHHELD')return 'BLOCKED';
  if(s.source.sourceClass!=='REGISTERED_SOURCE')return 'BLOCKED';
  if(s.tick<s.source.availableAt)return 'BLOCKED';
  if(s.source.withdrawnAt!==null && s.tick>=s.source.withdrawnAt)return 'BLOCKED';
  return 'READY';
}
const value=(status,cost=null,route=null)=>({status,cost,route});
/** M1 candidate: shortest admissible route under same explicit rights as M2. */
export function conditionalGeometry(s) {
  const state=sourceStatusAt(s);if(state!=='READY')return value(state);
  const dist=new Map([['source',0]]),prev=new Map(),remaining=new Set(s.nodes);
  while(remaining.size){
    let node=null,best=Infinity;
    for(const x of remaining){const d=dist.get(x)??Infinity;if(d<best){best=d;node=x}}
    if(node===null)break;
    remaining.delete(node);
    if(node==='claim')break;
    for(const e of s.edges){
      if(e.from!==node||!remaining.has(e.to))continue;
      if(e.gate==='DIRECT'&&s.policy==='PRESTIGE_GATED'&&s.standing==='JUNIOR')continue;
      if(e.gate==='CONSENT'&&!s.consent)continue;
      if(e.gate==='REVIEW'&&!s.reviewAccess)continue;
      if(e.gate==='HOST_RECEIPT')continue;
      invariant(Number.isFinite(e.cost)&&e.cost>0,'nonpositive edge not covered by preregistered test');
      const candidate=best+e.cost;
      if(candidate<(dist.get(e.to)??Infinity)){dist.set(e.to,candidate);prev.set(e.to,{from:node,id:e.id})}
    }
  }
  if(!Number.isFinite(dist.get('claim')))return value('BLOCKED');
  const route=[];let at='claim';while(at!=='source'){
    const info=prev.get(at);invariant(!!info,'corrupt predecessor graph');route.unshift(info.id);at=info.from;
  }
  return value('REACHABLE',dist.get('claim'),route);
}

/** M2 competent strong union: independently coded finite DFS over all simple routes.
 * No use of M1's sourceStatusAt, Dijkstra, or its edge-gate predicate.
 */
export function competentStrongUnion(s){
  const src=s.source;
  if(src.status==='UNKNOWN')return {status:'HELD',cost:null,routes:[]};
  const valid=(src.status==='ACTIVE'&&src.sourceClass==='REGISTERED_SOURCE'&&s.tick>=src.availableAt&&(src.withdrawnAt===null||s.tick<src.withdrawnAt));
  if(!valid)return {status:'BLOCKED',cost:null,routes:[]};
  let min=Number.POSITIVE_INFINITY;const minRoutes=[];
  const traverse=(node,visited,total,path)=>{
    if(node==='claim'){
      if(total<min){min=total;minRoutes.length=0;minRoutes.push([...path]);}
      else if(total===min)minRoutes.push([...path]);
      return;
    }
    for(let k=0;k<s.edges.length;k++){
      const e=s.edges[k];
      if(e.from!==node||visited.has(e.to))continue;
      if(e.gate==='HOST_RECEIPT')continue;
      if(e.gate==='DIRECT'&&s.policy!=='STANDING_NEUTRAL'&&s.standing!=='HIGH')continue;
      if(e.gate==='CONSENT'&&s.consent!==true)continue;
      if(e.gate==='REVIEW'&&s.reviewAccess!==true)continue;
      invariant(e.cost>0&&Number.isFinite(e.cost),'oracle only supports nonnegative finite weights');
      const cost=total+e.cost;
      if(cost>min)continue;
      visited.add(e.to);path.push(e.id);
      traverse(e.to,visited,cost,path);
      path.pop();visited.delete(e.to);
    }
  };
  traverse('source',new Set(['source']),0,[]);
  return Number.isFinite(min)?{status:'REACHABLE',cost:min,routes:minRoutes.sort((a,b)=>pack(a).localeCompare(pack(b)))}:{status:'BLOCKED',cost:null,routes:[]};
}
/** M2 proper competent alternative: full-policy Bellman-Ford relaxation.
 * This is distinct from both M1's greedy Dijkstra and M3's enumerating oracle.
 * It is granted exactly the same evidence and permission features as M1.
 */
export function competentUnionRelaxation(s) {
  const src=s.source;
  if(src.status==='UNKNOWN')return value('HELD');
  if(src.sourceClass!=='REGISTERED_SOURCE'||src.status!=='ACTIVE')return value('BLOCKED');
  if(!(src.availableAt<=s.tick))return value('BLOCKED');
  if(src.withdrawnAt!==null && s.tick>=src.withdrawnAt)return value('BLOCKED');
  const accepted=[];
  for(const e of s.edges){
    if(e.gate==='HOST_RECEIPT')continue;
    if(e.gate==='CONSENT'&&s.consent!==true)continue;
    if(e.gate==='REVIEW'&&s.reviewAccess!==true)continue;
    if(e.gate==='DIRECT'&&s.policy==='PRESTIGE_GATED'&&s.standing!=='HIGH')continue;
    accepted.push(e);
  }
  const distance=Object.fromEntries(s.nodes.map(x=>[x,Number.POSITIVE_INFINITY]));
  distance.source=0;
  for(let pass=0;pass<s.nodes.length-1;pass++){
    let updated=false;
    for(const e of accepted){
      if(!Number.isFinite(distance[e.from]))continue;
      const candidate=distance[e.from]+e.cost;
      if(candidate<distance[e.to]){distance[e.to]=candidate;updated=true}
    }
    if(!updated)break;
  }
  return Number.isFinite(distance.claim)?value('REACHABLE',distance.claim):value('BLOCKED');
}

/** Deliberately incomplete static incidence comparator: not called a strong union. */
export function staticIncidence(s) {
  const dist=new Map([['source',0]]),remaining=new Set(s.nodes);
  while(remaining.size){
    let best=Infinity,current=null;
    for(const x of remaining){if((dist.get(x)??Infinity)<best){best=dist.get(x);current=x}}
    if(current===null)break;
    remaining.delete(current);
    for(const e of s.edges){if(e.from!==current||!remaining.has(e.to))continue;
      const next=best+e.cost;if(next<(dist.get(e.to)??Infinity))dist.set(e.to,next);
    }
  }
  return Number.isFinite(dist.get('claim'))?value('REACHABLE',dist.get('claim')):value('BLOCKED');
}
const comparable=(a,b)=>a.status===b.status&&(a.status!=='REACHABLE'||a.cost===b.cost);
function asCounts(xs){const out={total:xs.length,M0:0,M1:0,M2:0,reachable:0,blocked:0,held:0};for(const row of xs){for(const k of ['M0','M1','M2'])if(row[k])out[k]++;out[row.oracleStatus.toLowerCase()]++;}return out}

export function executeProbe(){
  const outcomes=[],unmatched=[],m0Failures=[],counterfactuals=[];
  for(const stratum of STRATA)for(let i=0;i<N_PER_STRATUM;i++){
    const scene=generateEpisode(stratum,i);
    const oracle=competentStrongUnion(scene),geometry=conditionalGeometry(scene),union=competentUnionRelaxation(scene),staticBase=staticIncidence(scene);
    const a=comparable(geometry,oracle),b=comparable(union,oracle),c=comparable(staticBase,oracle);
    const row={id:scene.id,stratum,oracleStatus:oracle.status,oracleCost:oracle.cost,M0:c,M1:a,M2:b};
    outcomes.push(row);
    if(!a||!b)unmatched.push({scene,oracle,geometry,union});
    if(!c&&m0Failures.length<5)m0Failures.push({id:scene.id,stratum,oracle:{status:oracle.status,cost:oracle.cost},static:{status:staticBase.status,cost:staticBase.cost},cause:scene.source.status+'/'+scene.source.sourceClass+'/'+scene.policy});
    // These are interventions on a FIXED synthetic episode, not observational effect estimates.
    if(stratum==='H1_CONDITIONAL'){
      const neutralHigh=conditionalGeometry({...scene,policy:'STANDING_NEUTRAL',standing:'HIGH'});
      const neutralLow=conditionalGeometry({...scene,policy:'STANDING_NEUTRAL',standing:'JUNIOR'});
      invariant(comparable(neutralHigh,neutralLow),'prestige-neutral source invariant broken');
      const consentOff=conditionalGeometry({...scene,consent:false});
      const consentOn=conditionalGeometry({...scene,consent:true});
      invariant(!(consentOn.status==='BLOCKED'&&consentOff.status==='REACHABLE'),'consent monotonicity broken');
      if(consentOn.status==='REACHABLE'&&consentOff.status==='REACHABLE')invariant(consentOn.cost<=consentOff.cost,'consent route cost increased');
      if(scene.policy==='PRESTIGE_GATED'){
        const high=conditionalGeometry({...scene,standing:'HIGH'});
        const low=conditionalGeometry({...scene,standing:'JUNIOR'});
        if(!comparable(high,low)&&counterfactuals.length<5)counterfactuals.push({id:scene.id,policy:scene.policy,high,low});
      }
    }
    if(scene.source.withdrawnAt!==null){
      const before=Math.min(scene.tick,scene.source.withdrawnAt-1);
      if(before>=0){const asOf=conditionalGeometry({...scene,tick:before});const afterSource=structuredClone(scene);afterSource.tick=before;afterSource.theme='dome-weather';
        invariant(comparable(asOf,conditionalGeometry(afterSource)),'ambiance changes kernel');
      }
    }
  }
  const all=asCounts(outcomes);
  const strata=Object.fromEntries(STRATA.map(s=>[s,asCounts(outcomes.filter(x=>x.stratum===s))]));
  const surplus=(all.M1-all.M2)/all.total;
  const pilotClass=unmatched.length?'DIFFERENTIAL_COUNTEREXAMPLE_RETAINED':(all.M1===all.total&&all.M2===all.total&&Math.abs(surplus)<=1/all.total)?'SOURCE_FREE_BOUNDED_TIE':'REQUIRES_PARITY_AUDIT';
  // A real two-route, same-cost history ambiguity in the independent enumerator.
  const pairScene={
    id:'ADVERSARIAL-EQUAL-COST-DIFFERENT-HISTORY',standing:'HIGH',policy:'STANDING_NEUTRAL',
    tick:3,consent:true,reviewAccess:false,operatorAuthority:'HUMAN_ONLY',theme:'minimal',
    source:{id:'source-pair',digest:hash('source-pair'),sourceClass:'REGISTERED_SOURCE',status:'ACTIVE',availableAt:2,withdrawnAt:null},
    nodes:['source','intake','hearer','claim','appeal'],
    edges:[edge('source','intake',1,'OPEN','submit'),edge('intake','hearer',2,'DIRECT','hearing'),
      edge('hearer','claim',1,'OPEN','claim'),edge('intake','appeal',1,'CONSENT','request-appeal'),
      edge('appeal','hearer',1,'OPEN','review-appeal')]
  };
  const pairOracle=competentStrongUnion(pairScene),pairGeom=conditionalGeometry(pairScene),pairUnion=competentUnionRelaxation(pairScene);
  invariant(pairOracle.cost===4&&pairOracle.routes.length===2,'equal-distance distinct-route fixture failed');
  invariant(pairGeom.cost===4&&pairUnion.cost===4,'equal-distance model mismatch');
  const paired={
    source_id:pairScene.id,cost:pairOracle.cost,minimal_routes:pairOracle.routes,
    geometry_returns_single_route:pairGeom.route,
    conclusion:'Two different route histories share scalar cost. Any scalar-only representation lacks the data required for full history reconstruction.'
  };

  const record={
    schema:VERSION,seed:SEED,generated_at:'DETERMINISTIC_SOURCE_FREE',pre_registration:'CBFE_DD02_COMPETENT_NULL_PREFLIGHT_V04.md',
    qualifications:{native_dollhouse_design:'SEPARATELY_EXECUTED_AT_V03',independent_empirical_replication:false,protected_experiment_b:'HELD',human_scientific_closure:'RESERVED'},
    scope:'FINITE_SYNTHETIC_GENERATED_DIFFERENTIAL_TEST_NOT_HUMAN_EPISTEMIC_STUDY',
    sample_size:outcomes.length,summary:all,by_stratum:strata,competent_union_surplus:surplus,decision:pilotClass,
    candidate_counterexamples:unmatched.slice(0,5),static_baseline_failures:m0Failures,intervention_witnesses:counterfactuals,
    scalar_projection_failure:paired,
    output_rows_sha256:hash(pack(outcomes)),
    full_rows_reproducible:'node tests/cbfe-competent-null-probe.v04.mjs --json /path/to/report.json',
    limits:['Reference uses exhaustive simple-path search, candidate uses Dijkstra, strong union uses Bellman-Ford; all share declared policy semantics; no external source independence','Synthetic policy labels are not demographic identity and cannot establish discrimination','Same cost can conceal distinct custody histories','Absence of surplus over competent union is a warranted null, not a failed software engineering task']
  };
  return {record,outcomes};
}

if(process.argv[1]?.endsWith('cbfe-competent-null-probe.v04.mjs')||process.argv[1]?.endsWith('cbfe-competent-null-probe.v04.mjs')){
  const {record}=executeProbe();
  if(process.argv[2]==='--json'){
    invariant(typeof process.argv[3]==='string','expected output path');
    writeFileSync(process.argv[3],JSON.stringify(record,null,2)+'\n');
  }
  console.log(JSON.stringify({status:record.decision,summary:record.summary,by_stratum:record.by_stratum,surplus:record.competent_union_surplus,sha256:record.output_rows_sha256},null,2));
}
