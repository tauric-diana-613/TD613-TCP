import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EIGHTH_ORDER_CONTRACT, COUNTERWORLD_FIXTURES, RESIDENTIAL_LEDGER_FIELDS,
  WEIGHT_PROFILES, computeLongitudinalAttrition, auditAttachmentOpacity,
  SYNTHETIC_SUBJECTS, adjudicateObserverEquivalence, evaluateWeightSensitivity,
  evaluateFiniteExample, terminalObservationNullity, evaluateProtectionTiming,
  runEighthOrderTrial
} from '../packages/rulefield/lab/eighth_order_reparative_consequence.mjs';

test('covenant, operator glyph identity and source-free hold',()=>{
  assert.equal(EIGHTH_ORDER_CONTRACT.covenant,'Khona\u200Clit-po');
  assert.equal(EIGHTH_ORDER_CONTRACT.displayGlyph.codePointAt(0),0x1D30B);
  assert.equal('\uDBF5\uDE13'.codePointAt(0),0x10D613);
  assert.equal(EIGHTH_ORDER_CONTRACT.protectedFlight,'HELD');
});
test('physical success identical despite divergent residential continuity',()=>{
  for(const id of ['World_Alpha','World_Beta','World_Delta_Protected','World_Delta_LateFailure'])
    assert.equal(COUNTERWORLD_FIXTURES[id].S_physical_terminal,1);
  assert.equal(COUNTERWORLD_FIXTURES.World_Gamma.S_physical_terminal,0);
  assert.equal(COUNTERWORLD_FIXTURES.World_Alpha.residentialLedger.occupancyContinuityRate,1);
  assert.equal(COUNTERWORLD_FIXTURES.World_Beta.residentialLedger.occupancyContinuityRate,.35);
  for(const w of Object.values(COUNTERWORLD_FIXTURES))
    for(const f of RESIDENTIAL_LEDGER_FIELDS)assert.equal(typeof w.residentialLedger[f],'number');
});
test('corrected exact weighted material burden calculations',()=>{
  const c=(id,p)=>computeLongitudinalAttrition(COUNTERWORLD_FIXTURES[id].periodCosts,WEIGHT_PROFILES[p]).totalAttrition;
  assert.equal(c('World_Alpha','uniform_longitudinal'),.32);
  assert.equal(c('World_Beta','uniform_longitudinal'),2.17);
  assert.equal(c('World_Gamma','uniform_longitudinal'),1.69);
  assert.equal(c('World_Beta','hypothetical_compounding'),3.005);
  assert.equal(c('World_Gamma','hypothetical_compounding'),2.4275);
  assert.equal(c('World_Delta_LateFailure','hypothetical_compounding'),2.08);
  assert.equal(c('World_Delta_Protected','hypothetical_compounding'),.66);
});
test('no false institution-vs-uniform rank reversal; extreme weights are not invariant',()=>{
  const x=evaluateWeightSensitivity();
  assert.equal(x.betaMinusGamma.rankingReversal,false);
  assert.ok(x.betaMinusGamma.endpointDelta>0 && x.betaMinusGamma.uniformDelta>0);
  const weighted=computeLongitudinalAttrition([.45,.62,.58,.52],[.85,.85,.85,.85]);
  assert.equal(weighted.exhaustionPeriod,2); // not 1
});
test('opacity of stipulated attachment despite equal observable occupancy',()=>{
  const [a,b]=SYNTHETIC_SUBJECTS.map(auditAttachmentOpacity);
  assert.deepEqual(a.observedBehavior,b.observedBehavior);
  assert.equal(a.observerBPermitted,b.observerBPermitted);
  assert.notDeepEqual(a.observerCPermitted,b.observerCPermitted);
});
test('observer partitions are computed from permitted evidence, not invented claims',()=>{
  const x=adjudicateObserverEquivalence();
  assert.deepEqual(x.Observer_A_ComplianceInspector.equivalenceClasses[0],
    ['World_Alpha','World_Beta','World_Delta_Protected','World_Delta_LateFailure']);
  assert.equal(x.Observer_B_HousingContinuityAuditor.equivalenceClasses.length,5);
  assert.equal(x.Observer_C_SyntheticResearchObserver.sourceStatus,'SIMULATED');
});
test('terminal projection fails to identify cumulative trajectory',()=>{
  assert.equal(terminalObservationNullity(3).nullity,3);
  const low=[.02,.02,.02,.04], high=[.48,.55,.4,.04];
  assert.equal(low.at(-1),high.at(-1));
  assert.notEqual(computeLongitudinalAttrition(low).totalAttrition,computeLongitudinalAttrition(high).totalAttrition);
});
test('timing and finite counterexample retain claim ceilings',()=>{
  assert.equal(evaluateProtectionTiming().late,true);
  const f=evaluateFiniteExample();
  assert.equal(f.samePhysicalProjection,true);
  assert.equal(f.distinctTerminalOccupancy,true);
  assert.equal(runEighthOrderTrial().auditStatus,'POST_EXECUTION_AUDIT_NOT_RUN_BY_MODULE');
});
test('invalid cost geometry fails closed',()=>{
  assert.throws(()=>computeLongitudinalAttrition([.2,-.1]),/INVALID_COST/);
  assert.throws(()=>computeLongitudinalAttrition([.2,.3],[1]),/INVALID_COST/);
  assert.throws(()=>terminalObservationNullity(0),/T_MUST/);
});
