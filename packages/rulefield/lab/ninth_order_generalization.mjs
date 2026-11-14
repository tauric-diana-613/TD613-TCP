/** TD613 Ninth Order — independent source-free generalization chamber.
 * Not a validation of actual municipal systems, Marrowline dynamics or witness identities.
 * Research-only; human scientific closure RESERVED; protected Experiment B HELD.
 */
export const CONTRACT = Object.freeze({
  schema:'td613.atlas-after-hours.ninth-order.generalization/v1',
  provenance:'INDEPENDENT_SYNTHETIC_PERTURBATION',
  coordinates:'U+10D613', covenant:'Khona\u200Clit-po',
  rulefieldState:'PROPOSE_ONLY', experimentalFlight:'HELD', scientificClosure:'RESERVED'
});
const vertices=['A','B','F','H'];
const edgesFor = ({radial,lateral}) => [
  ['A','H',radial],['B','H',radial],['F','H',radial],
  ...(lateral>0?[['A','F',lateral],['B','F',lateral]]:[])
];
/** Exact finite shortest-path search; hub queue charged only on intermediate transfer. */
export function shortest(cfg,origin,destination){
  if(!vertices.includes(origin)||!vertices.includes(destination))throw Error('UNKNOWN_VERTEX');
  if(origin===destination)return 0;
  const seen=new Set(),dist=Object.fromEntries(vertices.map(v=>[v,Infinity]));dist[origin]=0;
  const edges=edgesFor(cfg);
  while(seen.size<vertices.length){
    const at=vertices.filter(v=>!seen.has(v)).sort((a,b)=>dist[a]-dist[b])[0];
    if(dist[at]===Infinity)break;
    if(at===destination)return dist[at];
    seen.add(at);
    for(const [u,v,w] of edges){
      const next=u===at?v:v===at?u:null;
      if(next&&!seen.has(next))dist[next]=Math.min(dist[next],dist[at]+w+(at==='H'&&at!==origin?cfg.queue:0));
    }
  }
  return dist[destination];
}
/** Three non-substitutable carriers A, B, F must meet at F for uninterrupted dwell. */
export function evaluateCity(cfg){
  const {radial,lateral,queue,horizon,dwell}=cfg;
  if(![radial,lateral,queue,horizon,dwell].every(Number.isFinite)||radial<=0||lateral<0||queue<0||horizon<=0||dwell<=0)throw Error('INVALID_POLICY');
  const arrive=Math.max(...['A','B','F'].map(v=>shortest(cfg,v,'F')));
  const depart=Math.min(...['A','B','F'].map(v=>horizon-shortest(cfg,'F',v)));
  const overlap=Math.max(0,depart-arrive);
  return {radial,queue,lateral,horizon,dwell,radialCompression:24/radial,
    terminalConnectivity:1,staticCapabilityCount:3,staticCarrierRank:3,
    earliestCommonArrival:arrive,latestCommonDeparture:depart,overlap,
    taskFeasible:overlap+1e-10>=dwell};
}
/** Contiguous interval intersection; all windows refer to the same host and time axis. */
export function overlapSingle(intervals){
  if(!intervals.length)throw Error('EMPTY_INTERVALS');
  return Math.max(0,Math.min(...intervals.map(i=>i[1]))-Math.max(...intervals.map(i=>i[0])));
}
export function overlapSplit(windows){
  if(!windows.length||windows.some(w=>!w.length))return 0;
  let current=windows[0];
  for(const next of windows.slice(1))current=current.flatMap(a=>next.map(b=>[Math.max(a[0],b[0]),Math.min(a[1],b[1])])).filter(([a,b])=>b>a);
  return current.length?Math.max(...current.map(([a,b])=>b-a)):0;
}
/** Observer loses carrier timing even when static rank and representation coincide. */
export function rankCollision(){
  const m=[[1,0],[0,1]]; // Rank 2 in both worlds by inspection.
  const spaced=[[0,1],[2,3]],together=[[0,3],[0,3]];
  return {capabilityMatrix:m,rankInBoth:2,first:overlapSingle(spaced),second:overlapSingle(together),
    firstFeasible:overlapSingle(spaced)>=1,secondFeasible:overlapSingle(together)>=1};
}
export function conservationCounterworlds(){
  const initial=60,retained=18;
  return {observation:{initial,retained},worldA:{unobservedDisplacement:42,independentlyAccountedExit:0},
    worldB:{unobservedDisplacement:0,independentlyAccountedExit:42},
    necessaryLaw:'INITIAL = RETAINED + EXITS + DISPLACEMENT (closed accounting, matched times and identities)',
    identification:'UNDERDETERMINED_FROM_TWO_HEADCOUNTS_ALONE'};
}
export function runGeneralizationGrid(){
  const rows=[];
  for(const horizon of [45,60,75])for(const dwell of [10,20,25])
  for(const radial of [6,9,12,15,18,21,24])for(const queue of [0,4,8,12,16,20])
  for(const lateral of [0,12,18,24])rows.push(evaluateCity({radial,lateral,queue,horizon,dwell}));
  const fastButExcluded=rows.filter(r=>r.radialCompression>1&&r.terminalConnectivity===1&&!r.taskFeasible);
  return {schema:CONTRACT.schema,count:rows.length,
    fastButExcluded:fastButExcluded.length,
    fastParadoxWitness:fastButExcluded[0]||null,
    fixedDashboardCounterexample:{alpha:evaluateCity({radial:9,lateral:0,queue:14,horizon:60,dwell:20}),
      gamma:evaluateCity({radial:9,lateral:12,queue:0,horizon:60,dwell:20})},
    noQueueCounterworld:evaluateCity({radial:9,lateral:0,queue:0,horizon:60,dwell:20}),
    rankCollision:rankCollision(),conservation:conservationCounterworlds(),
    singleIntervalHelly:'PAIRWISE_DWELL_GUARANTEES_COMMON_DWELL_FOR_CLOSED_REAL_INTERVALS',
    splitWindowCounterexample:[[[0,3],[8,11]],[[0,3],[4,7]],[[4,7],[8,11]]],
    claimCeiling:'FINITE_SOURCE_FREE_MODEL_NO_EMPIRICAL_GENERALIZATION'};
}
