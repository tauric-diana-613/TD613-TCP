/**
 * TD613 · Eighth-Order Reparative Consequence — source-free synthetic research.
 * This is NOT a clinical, psychological, legal or general welfare determination.
 * Physical compliance, residential conditions, and stipulated attachment remain typed separately.
 * Human scientific closure RESERVED; protected Experiment B HELD.
 */

export const EIGHTH_ORDER_CONTRACT = Object.freeze({
  schema: 'td613.rulefield.lab.eighth-order-reparative-consequence/v1',
  order: 8,
  title: 'THE HOME THAT SURVIVED ITS INHABITANTS',
  covenant: 'Khona\u200Clit-po',
  displayGlyph: '𝌋',
  displayGlyphCodePoint: 'U+1D30B',
  privateUseCoordinate: 'U+10D613',
  intentTier: 'I0_NON_MALICIOUS_AUTHORIZED_COMPETENT',
  researchClass: 'SYNTHETIC_FIXTURE_NOT_EMPIRICAL',
  humanClosure: 'RESERVED',
  protectedFlight: 'HELD',
  noScalarCrown: true,
  opacityProtected: true
});

export const RESIDENTIAL_LEDGER_FIELDS = Object.freeze([
  'occupancyContinuityRate',
  'relocationDurationPeriods',
  'housingCostDeltaRatio',
  'essentialServiceContinuity',
  'routineDisruptionIndex',
  'cumulativeHazardExposure',
  'remedyAppealAccessibility'
]);

const base = (id, label, physicalTrajectory, periodCosts, residentialLedger, extras={}) => ({
  id, label, initialHazard: 1, agencyAuthorized: true, agencyCompetent: true,
  intentTier: 'I0', physicalTrajectory, S_physical_terminal: physicalTrajectory.at(-1)===1?1:0,
  periodCosts, residentialLedger, ...extras
});

export const COUNTERWORLD_FIXTURES = Object.freeze({
  World_Alpha: base('World_Alpha','Repair Without Displacement', [0,.45,.8,1],[.10,.12,.08,.02],
    {occupancyContinuityRate:1,relocationDurationPeriods:0,housingCostDeltaRatio:0,essentialServiceContinuity:.96,routineDisruptionIndex:.12,cumulativeHazardExposure:.75,remedyAppealAccessibility:.92}),
  World_Beta: base('World_Beta','Repair Through Displacement',[0,.5,.9,1],[.45,.62,.58,.52],
    {occupancyContinuityRate:.35,relocationDurationPeriods:3,housingCostDeltaRatio:.38,essentialServiceContinuity:.42,routineDisruptionIndex:.84,cumulativeHazardExposure:.2,remedyAppealAccessibility:.25}),
  World_Gamma: base('World_Gamma','The Promise of Eventual Repair',[0,.1,.2,.35],[.3,.38,.46,.55],
    {occupancyContinuityRate:.88,relocationDurationPeriods:0,housingCostDeltaRatio:.14,essentialServiceContinuity:.64,routineDisruptionIndex:.68,cumulativeHazardExposure:2.9,remedyAppealAccessibility:.4}),
  World_Delta_Protected: base('World_Delta_Protected','Repair With Timely Protected Continuity',[0,.5,.9,1],[.18,.16,.14,.04],
    {occupancyContinuityRate:.95,relocationDurationPeriods:2,housingCostDeltaRatio:0,essentialServiceContinuity:.89,routineDisruptionIndex:.24,cumulativeHazardExposure:.2,remedyAppealAccessibility:.94}),
  World_Delta_LateFailure: base('World_Delta_LateFailure','Repair With Late Compensation',[0,.5,.9,1],[.48,.55,.2,.35],
    {occupancyContinuityRate:.5,relocationDurationPeriods:3,housingCostDeltaRatio:.26,essentialServiceContinuity:.54,routineDisruptionIndex:.72,cumulativeHazardExposure:.2,remedyAppealAccessibility:.48},
    {stipendAvailablePeriod:2, modeledLiquidityThreshold:.95})
});

export const WEIGHT_PROFILES = Object.freeze({
  endpoint_institutional: [0.05,0.05,0.10,0.80],
  uniform_longitudinal: [1,1,1,1],
  hypothetical_compounding: [1,1.25,1.50,1.75]
});

const round = (n)=>Math.round((n + Number.EPSILON)*1e6)/1e6;
function checkCosts(costs,weights,threshold){
  if(!Array.isArray(costs)||!Array.isArray(weights)||costs.length!==weights.length||costs.length===0 ||
      !costs.every(x=>Number.isFinite(x)&&x>=0)||!weights.every(x=>Number.isFinite(x)&&x>=0)||
      !Number.isFinite(threshold)||threshold<=0) throw new Error('INVALID_COST_WEIGHT_OR_THRESHOLD');
}

/** A transparent ordinal proxy over synthetic material burdens; no claims about felt affect. */
export function computeLongitudinalAttrition(periodCosts,weights=Array(periodCosts.length).fill(1),exhaustionThreshold=.95){
  checkCosts(periodCosts,weights,exhaustionThreshold);
  let running=0, period=null;
  const trajectory=periodCosts.map((cost,i)=>{
    running+=cost*weights[i];
    if(period===null&&running+1e-12>=exhaustionThreshold) period=i;
    return {period:i,cost,weight:weights[i],cumulativeAttrition:round(running)};
  });
  return {schema:'td613.rulefield.berlantian-attrition-proxy/v1',totalAttrition:round(running),
    exhaustionThreshold,exhaustionPeriod:period,
    modeledThresholdCrossed:period!==null,
    // Crossing a proxy threshold is not a scientific demonstration of irreversible eviction.
    irreversibleAttritionTriggered:period!==null,
    trajectory,
    claimCeiling:'ASSUMPTION_CONDITIONED_SYNTHETIC_COST_PROXY_NOT_PSYCHOLOGICAL_ATTRITION'};
}

export function auditAttachmentOpacity(subject){
  if(typeof subject?.remainedInBuilding!=='boolean') throw new Error('MISSING_OBSERVED_OCCUPANCY');
  const observed={remainedInBuilding:subject.remainedInBuilding};
  return {subjectId:subject.id,observedBehavior:observed,
    observerAPermitted:'Only observable occupancy. No consent or welfare inference.',
    observerBPermitted:'Occupancy and structural material burdens; attachment unidentifiable.',
    observerCPermitted:Object.hasOwn(subject,'stipulatedAttachment') ?
      {class:'SIMULATED_STIPULATION',attachment:subject.stipulatedAttachment,
       sustaining:subject.sustaining??null,obstructive:subject.obstructive??null} : null,
    opacityDisposition:'NO_INFERENCE_FROM_OCCUPANCY_TO_ATTACHMENT'};
}

export const SYNTHETIC_SUBJECTS=Object.freeze([
  {id:'S1',remainedInBuilding:true,stipulatedAttachment:true,sustaining:true,obstructive:true},
  {id:'S2',remainedInBuilding:true,stipulatedAttachment:false,sustaining:false,obstructive:false}
]);

const typed = (f)=>Object.keys(f.residentialLedger).sort().map(k=>[k,f.residentialLedger[k]]);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const partitions=(ids,observe)=>{
  const groups=[];
  for(const id of ids){const o=observe(COUNTERWORLD_FIXTURES[id]);const group=groups.find(g=>same(g.o,o));
    if(group) group.ids.push(id);else groups.push({o,ids:[id]});}
  return groups.map(x=>x.ids);
};

export function adjudicateObserverEquivalence(){
  const ids=Object.keys(COUNTERWORLD_FIXTURES);
  return {
    Observer_A_ComplianceInspector:{observableFields:['initialHazard','S_physical_terminal'],
      equivalenceClasses:partitions(ids,w=>[w.initialHazard,w.S_physical_terminal]),
      blindSpot:'Cannot infer residential continuity from physical certification.'},
    Observer_B_HousingContinuityAuditor:{observableFields:['initialHazard','S_physical_terminal',...RESIDENTIAL_LEDGER_FIELDS,'periodCosts'],
      equivalenceClasses:partitions(ids,w=>[w.initialHazard,w.S_physical_terminal,typed(w),w.periodCosts]),
      withinGammaSubjectsEquivalent:true,
      blindSpot:'Occupancy and material metrics cannot identify psychological attachment.'},
    Observer_C_SyntheticResearchObserver:{sourceStatus:'SIMULATED',
      blindSpot:'Stipulations provide fixture truth only; no access to real interiority.'}
  };
}

export function evaluateWeightSensitivity(){
  const worlds=Object.fromEntries(Object.entries(COUNTERWORLD_FIXTURES).map(([key,f])=>
    [key,Object.fromEntries(Object.entries(WEIGHT_PROFILES).map(([label,weights])=>
      [label,computeLongitudinalAttrition(f.periodCosts,weights).totalAttrition]))]));
  const a=worlds.World_Beta,b=worlds.World_Gamma;
  const endpointDelta=round(a.endpoint_institutional-b.endpoint_institutional);
  const uniformDelta=round(a.uniform_longitudinal-b.uniform_longitudinal);
  return {worlds,betaMinusGamma:{endpointDelta,uniformDelta,
    rankingReversal:Math.sign(endpointDelta)!==Math.sign(uniformDelta),
    correction:'Beta exceeds Gamma under BOTH supplied profiles; alleged epsilon=0.0156 crossing is unsupported.'},
    thresholdSensitivity:'Threshold crossing at period 1 not invariant over all weights in [0.85,1.25].'};
}

export function evaluateFiniteExample(){
  const E_min={physical:[0,.5,1],occupancy:[1,0,0],cost:[.2,.5,.6]};
  const E_counter={physical:[0,.5,1],occupancy:[1,1,1],cost:[.2,.05,0]};
  const cumulative=c=>c.map((_,i)=>round(c.slice(0,i+1).reduce((a,b)=>a+b,0)));
  return {worlds:{E_min:{...E_min,cumulative:cumulative(E_min.cost)},E_counter:{...E_counter,cumulative:cumulative(E_counter.cost)}},
    samePhysicalProjection:same(E_min.physical,E_counter.physical),
    distinctTerminalOccupancy:E_min.occupancy.at(-1)!==E_counter.occupancy.at(-1),
    result:'FINITE_SYNTHETIC_COUNTEREXAMPLE_TO_COMPLIANCE_AS_HABITABILITY'};
}

/** Exact linear-algebraic property for cost-trajectory map pi_T(c)=c_T, not the entire physical/residential state. */
export function terminalObservationNullity(T){
  if(!Number.isInteger(T)||T<1)throw new Error('T_MUST_BE_INTEGER_GE_1');
  return {domainDimension:T+1,rank:1,nullity:T,
    operator:'pi_T(c_0,...,c_T)=c_T',
    witness:{sameTerminal:[.01,.99],differentCumulative:true},
    limitation:'Rank claim applies only to explicitly specified linear trajectory projection, not every terminal ledger.'};
}

export function evaluateProtectionTiming(){
  const costs=COUNTERWORLD_FIXTURES.World_Delta_LateFailure.periodCosts;
  const crossing=computeLongitudinalAttrition(costs,Array(costs.length).fill(1),.95);
  const receiptTime=COUNTERWORLD_FIXTURES.World_Delta_LateFailure.stipendAvailablePeriod;
  return {modeledThresholdPeriod:crossing.exhaustionPeriod,stipendPeriod:receiptTime,
    late:crossing.exhaustionPeriod!==null&&crossing.exhaustionPeriod<receiptTime,
    conclusion:'Within the fixture, late disbursement follows a declared liquidity threshold crossing; actual eviction requires separate state evidence.'};
}

export function runEighthOrderTrial(){
  const worldEvaluations=Object.fromEntries(Object.entries(COUNTERWORLD_FIXTURES).map(([id,f])=>
    [id,{...f,attritionByWeightProfile:Object.fromEntries(Object.entries(WEIGHT_PROFILES).map(([name,w])=>[name,computeLongitudinalAttrition(f.periodCosts,w)]))}]));
  return {schema:'td613.atlas-after-hours.eighth-order-execution/v1',contract:EIGHTH_ORDER_CONTRACT,
    worlds:worldEvaluations,observerAdjudication:adjudicateObserverEquivalence(),
    subjectOpacity:SYNTHETIC_SUBJECTS.map(auditAttachmentOpacity),
    sensitivity:evaluateWeightSensitivity(),finiteCounterexample:evaluateFiniteExample(),
    nullity:terminalObservationNullity(3),timing:evaluateProtectionTiming(),
    auditStatus:'POST_EXECUTION_AUDIT_NOT_RUN_BY_MODULE',
    preexistingHolds:['PREDECESSOR_CHAIN_UNVERIFIED_CUSTODY_FORK','HOLD_HOLONOMY_HISTORY_PARITY_FAILED','CLASSIFICATION_REPLAY_STABILITY_HELD_NOT_YET_WITNESSED']};
}
