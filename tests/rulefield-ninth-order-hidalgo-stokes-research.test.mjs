import test from "node:test";
import assert from "node:assert/strict";
import {
  COMMISSION,CAPABILITY_TIERS,HISTORICAL_IDS,sharedPresence,assessCoalitions,
  financialOrderCounterexample,orientedStokesDoubleFace,loopAndDissipation,
  accountForResidual,transportShear,geographicalImpasseSeries,sourceFreeResearchReceipt
} from "../packages/rulefield/lab/ninth_order_hidalgo_stokes_research.mjs";

test("Ninth-Order source and covenant identities are retained without promotion",()=>{
  assert.equal(COMMISSION.id,"TD613-AAH-ORD9-CATASTROPHE-OF-CONFLUENCE");
  assert.equal(COMMISSION.covenantKey,"Khona\u200Clit-po");
  assert.equal(COMMISSION.emergenceName,"K\u02B0onapolit");
  assert.notEqual(COMMISSION.covenantKey,COMMISSION.emergenceName);
  assert.equal(COMMISSION.experimentB,"HELD");
  assert.equal(COMMISSION.scientificClosure,"HUMAN_RESERVED");
  assert.equal(CAPABILITY_TIERS.length,4);
  assert.equal(HISTORICAL_IDS.ruleAtlas.length,10);
  assert.equal(HISTORICAL_IDS.crossings.length,6);
});
test("Original Argon affine counterexample shows 0.4 reserve difference, not curvature",()=>{
  const x=financialOrderCounterexample();
  assert.ok(Math.abs(x.stipendThenSurcharge.reserve-1.4)<1e-10);
  assert.ok(Math.abs(x.surchargeThenStipend.reserve-1)<1e-10);
  assert.ok(Math.abs(x.reserveDifference-.4)<1e-10);
  assert.match(x.epistemicClass,/NOT_YET_CURVATURE/);
});
test("Stokes oriented two-face chain cancels the shared edge instead of double-counting",()=>{
  const x=orientedStokesDoubleFace();
  assert.equal(x.face135,-18);assert.equal(x.face235,-24);
  assert.equal(x.surface,6);assert.equal(x.boundary,6);
  assert.equal(x.commonEdgeCoefficient,0);assert.equal(x.passes,true);
});
test("SO3 alternative products differ, true reverse inverts, and cost survives a tree excursion",()=>{
  const x=loopAndDissipation();
  assert.equal(x.noncommutingOrderings,true);
  assert.equal(x.trueInverseCheck,true);
  assert.equal(x.sameTrace,true);
  assert.equal(x.costSeparatesIdenticalHolonomy,true);
  assert.match(x.groupExtension,/DIRECT_PRODUCT/);
});
test("Headcount deficit 42 alone is ambiguous; closed exhaustive accounting narrows aggregate only",()=>{
  const x=accountForResidual();
  assert.equal(x.netResidual,42);
  assert.equal(x.identifiedDisplacement,null);
  assert.deepEqual(x.rivalWorlds.map(w=>w.displaced),[42,0]);
  const c=accountForResidual({verifiedExits:12});
  assert.equal(c.identifiedDisplacement,30);
  assert.equal(c.identifiedPersons,false);
});
test("Interval co-presence distinguishes individual reachability, pairwise overlaps, and triple assembly",()=>{
  const A=[[0,3],[8,11]], B=[[0,3],[4,7]], C=[[4,7],[8,11]];
  assert.equal(sharedPresence([A,B]).maxContinuousOverlap,3);
  assert.equal(sharedPresence([A,C]).maxContinuousOverlap,3);
  assert.equal(sharedPresence([B,C]).maxContinuousOverlap,3);
  assert.equal(sharedPresence([A,B,C]).maxContinuousOverlap,0);
  const M=[[1,0,0],[0,1,0],[0,0,1]];
  assert.equal(assessCoalitions({matrix:M,carrierWindows:[A,B,C],requires:[0,1,2],dwell:2}).feasible,false);
  const good=assessCoalitions({matrix:M,carrierWindows:[[[0,5]],[[1,5]],[[2,5]]],requires:[0,1,2],dwell:2});
  assert.equal(good.feasible,true);
  assert.deepEqual(good.witness.carriers,[0,1,2]);
});
test("Faster radial links may coexist with longer effective travel under coupled queue changes",()=>{
  const q=transportShear({radial:9,queue:14});
  assert.equal(q.effectiveLateral,32);
  assert.equal(q.roundTripPlusDwell,84);
  assert.equal(q.feasible,false);
  const g=transportShear({radial:9,queue:0});
  assert.equal(g.feasible,true);
  const x=geographicalImpasseSeries();
  assert.equal(x.radialSpeedsIncrease,true);
  assert.equal(x.allCollaborationsUnfeasible,true);
});
test("Scientific receipt preserves speculative and empirical claim ceiling separately",()=>{
  const x=sourceFreeResearchReceipt();
  assert.match(x.claimCeilings.SigmaD,/speculative/);
  assert.match(x.claimCeilings.SigmaR,/holonomy/);
  assert.equal(x.humanScientificClosure,"RESERVED");
});
