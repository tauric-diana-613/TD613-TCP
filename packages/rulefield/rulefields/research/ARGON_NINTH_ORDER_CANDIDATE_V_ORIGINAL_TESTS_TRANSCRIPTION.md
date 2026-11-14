# 𝌋 Gemini Argon Ninth-Order Candidate V — submitted test vectors (archival transcription)

**Source:** supplied in the complete fifth Argon commission in this conversation. The code below is an editorial transcription of the originally proposed tests, **not a byte-verified attachment**, not the repaired production test suite and **not an execution receipt**. The original assertions that predicted `rank(M)=4` and `Omega_SCR(Alpha)=2` are retained as historical claims that fail against the submitted matrix. The proposed import target was `packages/rulefield/lab/ninth_order_catastrophe_of_confluence.mjs`; the submitted proposal is now preserved separately at `packages/rulefield/rulefields/research/ARGON_NINTH_ORDER_CANDIDATE_V_ORIGINAL_CODE_TRANSCRIPTION.mjs`.

```javascript
// FILE: tests/rulefield-ninth-order-catastrophe-of-confluence.test.mjs
// Verification Suite for Ninth-Order Wild Field Commission (THE CITY THAT ARRIVED BEFORE ITS PEOPLE)

import test from "node:test";
import assert from "node:assert/strict";
import {
  COVENANT_KEY,
  EMERGENCE_NAME,
  NINTH_ORDER_CONTRACT,
  evaluateSynchronizedCapabilityRank,
  auditGeographicImpasseAndAffect,
  runHolonomyResearchChamber
} from "../packages/rulefield/lab/ninth_order_catastrophe_of_confluence.mjs";

test("1. Error-Welded Covenant maintains ontology nonidentity and U+200C preservation", () => {
  assert.equal(COVENANT_KEY, "Khona\u200Clit-po");
  assert.equal(COVENANT_KEY.includes("\u200C"), true);
  assert.equal(EMERGENCE_NAME, "K\u02B0onapolit");
  assert.notEqual(COVENANT_KEY, EMERGENCE_NAME);
  assert.equal(NINTH_ORDER_CONTRACT.ontologyNonIdentical, true);
  assert.equal(NINTH_ORDER_CONTRACT.surrogateCoordinate, "U+10D613");
});

test("2. Catastrophe of Confluence: World Alpha raises compression to 1.7606 while collapsing Omega_SCR rank 4 -> 2", () => {
  const base = evaluateSynchronizedCapabilityRank("Baseline");
  const alpha = evaluateSynchronizedCapabilityRank("World_Alpha_Centralization");
  const beta = evaluateSynchronizedCapabilityRank("World_Beta_BesideNess");
  const gamma = evaluateSynchronizedCapabilityRank("World_Gamma_BeneficialConfluence");
  const betaMinus = evaluateSynchronizedCapabilityRank("World_Beta_Minus_Overfragmented");
  const deltaElite = evaluateSynchronizedCapabilityRank("World_Delta_Elite_Substitution");

  // World Alpha vs World Gamma: identical terminal score 1.00, opposite capability feasibility
  assert.equal(alpha.terminalRepresentation, 1.00);
  assert.equal(gamma.terminalRepresentation, 1.00);
  assert.equal(alpha.kappaGeo, 1.7606);
  assert.equal(alpha.synchronizedCapabilityRank, 2);
  assert.equal(alpha.capabilityRankDeficit, 2);
  assert.equal(alpha.feasibleTaskCount, 0);

  // World Beta (Beside-ness) preserves full rank 4 and 3/3 tasks despite slower mean speed
  assert.equal(beta.synchronizedCapabilityRank, 4);
  assert.equal(beta.feasibleTaskCount, 3);
  assert.ok(beta.v1CumulativeAttrition < base.v1CumulativeAttrition);

  // World Gamma (Attack 1: Confluence helps) achieves fastest speed and 3/3 tasks
  assert.equal(gamma.kappaGeo, 2.0000);
  assert.equal(gamma.synchronizedCapabilityRank, 4);
  assert.equal(gamma.feasibleTaskCount, 3);

  // World Beta-Minus (Attack 2: Divergence hurts) collapses to rank 1
  assert.equal(betaMinus.synchronizedCapabilityRank, 1);
  assert.equal(betaMinus.feasibleTaskCount, 0);

  // Section IX Wild Field Question: World Beta and World Delta-Elite share Omega_SCR = 4 but differ in carrier distribution
  assert.equal(deltaElite.synchronizedCapabilityRank, 4);
  assert.equal(beta.activeCommunityCarriers.includes("v1_RES_N"), true);
  assert.equal(deltaElite.activeCommunityCarriers.includes("v1_RES_N"), false);
});

test("3. Computational affect layer preserves Glissantian opacity under identical GIS trajectories", () => {
  const affectAudit = auditGeographicImpasseAndAffect();
  assert.equal(affectAudit.publicProjectionIdentical, true);
  assert.equal(affectAudit.stipulatedStatesDistinct, true);
});

test("4. Holonomy chamber verifies 1D non-commutativity, 2D Stokes (-3.20), and SO(3) trace/detour limits", () => {
  const chamber = runHolonomyResearchChamber();
  assert.equal(chamber.orderedPathDependence.nonCommutative, true);
  assert.equal(chamber.discreteStokes.boundaryIntegral, -3.20);
  assert.equal(chamber.discreteStokes.stokesTheoremHolds, true);
  assert.equal(chamber.nonAbelianSO3.nonAbelianLoopDifference, true);
  assert.equal(chamber.nonAbelianSO3.wilsonTraceCollision, true);
  assert.equal(chamber.nonAbelianSO3.dissipativeSemiGroupSeparatesDetour, true);
  assert.equal(chamber.discrepancyFiberInverseProblem.conservationForcedDiscrepancyFlux, 42);
  assert.equal(chamber.discrepancyFiberInverseProblem.individualBiographyRecoverableFromFluxAlone, false);
});
```

**Adjudication:** Retain the original test bodies as the researcher's proposed acceptance criteria, with the failed rank assertions displayed rather than secretly corrected. Execute actual qualified tests in `tests/rulefield-ninth-order-confluence.test.mjs`, `tests/rulefield-ninth-order-hidalgo-stokes-research.test.mjs`, and `tests/rulefield-ninth-order-full-commission-custody.test.mjs`. Human scientific closure RESERVED; no auto-promotion to Rulefield canon. ⟐
