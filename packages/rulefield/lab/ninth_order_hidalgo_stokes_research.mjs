/**
 * 𝌋 Ninth-Order Catastrophe of Confluence — restored *additional* research chamber.
 * Historical Argon research threads: Wolfram/NKS, Berlant, Hidalgo, Hägerstrand,
 * Harvey/Virilio, GIS, simplicial Stokes, non-Abelian and dissipative transport.
 * Research provenance: TD613-AAH-ORD9-CATASTROPHE-OF-CONFLUENCE; ΣB finite model.
 * This module complements, rather than overwrites, ninth_order_confluence.mjs.
 * No external urban observation, human interiority inference, or automatic closure.
 */
export const COMMISSION = Object.freeze({
  id: "TD613-AAH-ORD9-CATASTROPHE-OF-CONFLUENCE",
  title: "THE CITY THAT ARRIVED BEFORE ITS PEOPLE",
  covenantKey: "Khona\u200Clit-po",
  emergenceName: "K\u02B0onapolit",
  privateUseCoordinate: "U+10D613",
  dimensions: ["Wolframian rewriting","computational affect","Hidalgo capabilities","GIS/time-geography","time-space compression","Stokes/holonomy"],
  warrant: "SOURCE_FREE_SYNTHETIC",
  disposition: "RESEARCH_PROPOSAL",
  experimentB: "HELD",
  scientificClosure: "HUMAN_RESERVED"
});
export const CAPABILITY_TIERS = Object.freeze([
  "AGGREGATE_EXISTENCE", "GRAPH_REACHABILITY",
  "INDIVIDUAL_TIME_PRISM", "COLLECTIVE_SYNCHRONIZED_FEASIBILITY"
]);
export const HISTORICAL_IDS = Object.freeze({
  ruleAtlas: ["X-086","X-087","X-088","X-089","X-090","X-091","X-092","X-093","X-094","X-095"],
  crossings: ["C-25","C-26","C-27","C-28","C-29","C-30"]
});
/** Co-presence windows may be nonconvex, with arbitrarily many closed intervals.
 * Return duration and a recoverable interval witness, not a rank-based proxy. */
export function sharedPresence(intervalFamilies) {
  if (!Array.isArray(intervalFamilies) || !intervalFamilies.length) throw Error("EMPTY_COHORTS");
  let current = [[-Infinity, Infinity]];
  for (const family of intervalFamilies) {
    if (!Array.isArray(family)) throw Error("INVALID_WINDOWS");
    const next = [];
    for (const [a,b] of family) {
      if (!Number.isFinite(a)||!Number.isFinite(b)||a>b) throw Error("INVALID_INTERVAL");
      for (const [lo,hi] of current) {
        const x=Math.max(a,lo),y=Math.min(b,hi);
        if (y>x) next.push([x,y]);
      }
    }
    current=next;
    if (!current.length) break;
  }
  current.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]));
  return {maxContinuousOverlap:current.length?current[0][1]-current[0][0]:0,
          witness:current[0]||null};
}
export function assessCoalitions({matrix,carrierWindows,requires,dwell}) {
  if (!Number.isFinite(dwell)||dwell<=0||!matrix?.length||matrix.length!==carrierWindows?.length)throw Error("INVALID_TASK_INPUT");
  if (!Array.isArray(requires)||!requires.length)throw Error("INVALID_REQUIREMENTS");
  const candidates=[];
  for(let mask=1;mask<(1<<matrix.length);mask++){
    const carriers=matrix.map((_,i)=>i).filter(i=>mask&(1<<i));
    if (!requires.every(k=>carriers.some(i=>matrix[i]?.[k]===1)))continue;
    const overlap=sharedPresence(carriers.map(i=>carrierWindows[i]));
    if(overlap.maxContinuousOverlap+1e-10>=dwell)
      candidates.push({carriers,meetingInterval:overlap.witness,overlap:overlap.maxContinuousOverlap});
  }
  candidates.sort((a,b)=>a.carriers.length-b.carriers.length||b.overlap-a.overlap);
  return {feasible:candidates.length>0,witness:candidates[0]||null,
          testedCoalitionCount:(1<<matrix.length)-1};
}
/** Source candidate I: surcharge then stipend != stipend then surcharge. */
export function financialOrderCounterexample(initial={reserve:1,participation:1}) {
  const surcharge=s=>({reserve:s.reserve-.4,participation:s.participation*.5});
  const stipend=s=>({reserve:s.reserve+.8*s.participation,participation:s.participation});
  const stipendThenSurcharge=surcharge(stipend(initial));
  const surchargeThenStipend=stipend(surcharge(initial));
  return {stipendThenSurcharge,surchargeThenStipend,
          reserveDifference:stipendThenSurcharge.reserve-surchargeThenStipend.reserve,
          epistemicClass:"ORDER_DEPENDENCE_NOT_YET_CURVATURE"};
}
/** Candidate III: two triangles, oriented as F=[v1,v3,v5]-[v2,v3,v5].
 * The common [v3,v5] edge cancels (unlike F1+F2). */
export function orientedStokesDoubleFace() {
  const a13=8,a23=9,a35=6,a15=32,a25=39;
  const face135=a35-a15+a13;   // -18
  const face235=a35-a25+a23;   // -24
  const surface=face135-face235;
  const boundary=(-a15+a13)+(a25-a23);
  return {face135,face235,surface,boundary,
          commonEdgeCoefficient:0,
          passes:surface===boundary&&surface===6,
          claimCeiling:"COCHAIN_STOKES_ONLY; NO UNOBSERVED WITNESS RECOVERY"};
}
const multiply=(A,B)=>A.map(row=>B[0].map((_,j)=>row.reduce((s,v,k)=>s+v*B[k][j],0)));
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const equal=(A,B)=>JSON.stringify(A)===JSON.stringify(B);
const identity=[[1,0,0],[0,1,0],[0,0,1]];
/** Distinguish different orderings from a true reversed path.
 * Lift SO(3) to the product monoid SO(3) × (R_{>=0},+) for independent cost.
 * 'Semidirect product' would require an explicit nontrivial group action. */
export function loopAndDissipation() {
  const rx=[[1,0,0],[0,0,-1],[0,1,0]];
  const rz=[[0,-1,0],[1,0,0],[0,0,1]];
  const forward=multiply(rz,rx);
  const swapped=multiply(rx,rz);
  const reverse=transpose(forward);
  const excursions=[{path:"original",rotation:forward,cost:.5},
                    {path:"original+canceling-out-and-back",rotation:forward,cost:4.5}];
  return {forward,swapped,reverse,
          noncommutingOrderings:!equal(forward,swapped),
          trueInverseCheck:equal(multiply(forward,reverse),identity),
          sameTrace:forward[0][0]+forward[1][1]+forward[2][2]===
                    swapped[0][0]+swapped[1][1]+swapped[2][2],
          excursions,costSeparatesIdenticalHolonomy:excursions[0].cost!==excursions[1].cost,
          groupExtension:"DIRECT_PRODUCT_MONOID_UNTIL_ACTION_PROVED"};
}
/** Candidate IV correction: public accounting deficit is conditional on complete ledger.
 * With only two headcounts, displaced and legitimate exits are observationally confounded. */
export function accountForResidual({starting=60,retained=18,admitted=0,verifiedExits=null}={}) {
  const net=starting+admitted-retained;
  if (![starting,retained,admitted].every(Number.isFinite)||net<0)throw Error("INVALID_ACCOUNTING");
  if(verifiedExits===null)return {netResidual:net,identifiedDisplacement:null,
                                  admissibility:"HELD_UNCLOSED_ACCOUNTING_BOUNDARY",
                                  rivalWorlds:[{verifiedExits:0,displaced:net},{verifiedExits:net,displaced:0}]};
  if(!Number.isFinite(verifiedExits)||verifiedExits<0||verifiedExits>net)throw Error("INVALID_EXITS");
  return {netResidual:net,identifiedDisplacement:net-verifiedExits,
          admissibility:"CONDITIONAL_ON_VERIFIED_EXHAUSTIVE_FLOW_LEDGER",
          identifiedPersons:false};
}
/** Three agents, 60-minute prism, 20-minute common dwell.
 * Faster *radial* transportation can coexist with longer effective transfers
 * when route deletion and hub queues vary. Not a universal speed-harms claim. */
export function transportShear({radial,queue,dwell=20,budget=60}) {
  if(![radial,queue,dwell,budget].every(Number.isFinite)||Math.min(radial,queue,dwell,budget)<0)
    throw Error("INVALID_TIMES");
  const effectiveLateral=2*radial+queue;
  const roundTripPlusDwell=2*effectiveLateral+dwell;
  return {radial,queue,effectiveLateral,roundTripPlusDwell,
          feasible:roundTripPlusDwell<=budget,
          compressionFrom24:24/radial};
}
export function geographicalImpasseSeries() {
  const sequence=[[9,14],[8,16],[7,18]].map(([radial,queue])=>transportShear({radial,queue}));
  return {sequence,radialSpeedsIncrease:sequence.every((x,i)=>i===0||x.radial<sequence[i-1].radial),
          allCollaborationsUnfeasible:sequence.every(x=>!x.feasible),
          classification:"CONSTRUCTED_KINETIC_IMPASSE_NOT_EVIDENCE_OF_REAL_CITY"};
}
/** Source candidates' explicit ΣA / ΣB / ΣC / ΣD / ΣR namespace. */
export function sourceFreeResearchReceipt() {
  return {commission:COMMISSION.id,capabilityTiers:CAPABILITY_TIERS,
    historicalIds:HISTORICAL_IDS,
    stokes:orientedStokesDoubleFace(),ordered:financialOrderCounterexample(),
    transport:geographicalImpasseSeries(),holonomy:loopAndDissipation(),
    hiddenFlow:accountForResidual(),
    claimCeilings:{
      SigmaA:"source identity requires historical Git blob custody; none asserted by this function",
      SigmaB:"algebraic properties of declared finite fixtures",
      SigmaC:"Berlant/Hidalgo/Hagerstrand/Harvey/Virilio/Sedgwick interpretive hypotheses",
      SigmaD:"phasonic conservation and Marrowline sqrt(3)/2 phase attraction remain speculative",
      SigmaR:"rank != collaboration; holonomy != complete history; mobility != consent"},
    humanScientificClosure:"RESERVED"};
}
