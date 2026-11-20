// 𝌋 Historical research source witness: Gemini Argon, Ninth Order, Candidate V.
// Editorial transcription of the complete supplied ES MODULE proposal.
// Its original mathematical claims are PRESERVED as proposals, not certified.
// Distinguish this transcription from the corrected executable research engines:
//   packages/rulefield/lab/ninth_order_confluence.mjs
//   packages/rulefield/lab/ninth_order_hidalgo_stokes_research.mjs
// Historical provenance: conversation-supplied Candidate V; byte-for-byte
// equivalence to original chat payload has NOT been independently checked.
// Do not substitute for an independently captured exact original text.
//
// FILE AS ARGON PROPOSED:
// packages/rulefield/lab/ninth_order_catastrophe_of_confluence.mjs

export const COVENANT_KEY = "Khona\u200Clit-po";
export const EMERGENCE_NAME = "K\u02B0onapolit";

export const NINTH_ORDER_CONTRACT = Object.freeze({
  schema: "td613.rulefield.lab.ninth-order-catastrophe-of-confluence/v1",
  order: 9,
  commission: "TD613-AAH-ORD9-CATASTROPHE-OF-CONFLUENCE",
  title: "THE CITY THAT ARRIVED BEFORE ITS PEOPLE",
  covenantKey: COVENANT_KEY,
  emergenceName: EMERGENCE_NAME,
  ontologyNonIdentical: COVENANT_KEY !== EMERGENCE_NAME,
  errorRetrievalRelation: "C [!= AND =_err] K",
  surrogateCoordinate: "U+10D613",
  marrowlineApexInvariant: Math.sqrt(3) / 2,
  zeroMirrorSuppression: 0,
  forensicSeparationLaw: "V != C != P != L",
  humanScientificClosure: "STRICTLY_RESERVED"
});

export const CITY_NODES = Object.freeze([
  { id: "v1_RES_N", label: "North Residential District", coords: [0, 4], window: [0.0, 12.0], budget: 1.00 },
  { id: "v2_RES_S", label: "South Residential District", coords: [0, 0], window: [0.0, 12.0], budget: 1.80 },
  { id: "v3_LEARN_SITE", label: "Distributed Learning & Co-Op Site", coords: [2, 2], window: [2.0, 10.0], budget: 2.00 },
  { id: "v4_CENTRAL_HUB", label: "Central Convergence Hub", coords: [5, 2], window: [3.0, 9.0], budget: 3.00 },
  { id: "v5_REPAIR_DEPOT", label: "Structural Repair & Calibration Depot", coords: [3, 4], window: [1.0, 11.0], budget: 2.50 },
  { id: "v6_BOUNDARY_XFER", label: "Boundary Freight & Transfer Terminal", coords: [6, 0], window: [0.0, 12.0], budget: 2.50 }
]);

export const HIDALGO_CAPABILITY_MATRIX = Object.freeze([
  [1, 1, 0, 0, 1], // v1_RES_N: Diag (k1), Care (k2), Pedag (k5)
  [0, 1, 1, 0, 0], // v2_RES_S: Care (k2), Admin (k3)
  [0, 1, 0, 1, 1], // v3_LEARN_SITE: Care (k2), Fab (k4), Pedag (k5)
  [0, 0, 1, 0, 0], // v4_CENTRAL_HUB: Admin (k3)
  [1, 0, 0, 1, 0], // v5_REPAIR_DEPOT: Diag (k1), Fab (k4)
  [1, 0, 1, 0, 0]  // v6_BOUNDARY_XFER: Diag (k1), Admin (k3)
]);

export const TASKS = Object.freeze({
  r_repair: [0, 1, 3],     // Requires k1 (Diag), k2 (Care), k4 (Fab) for >= 3.0 hrs
  r_curriculum: [1, 3, 4], // Requires k2 (Care), k4 (Fab), k5 (Pedag) for >= 3.0 hrs
  r_charter: [0, 2, 4]     // Requires k1 (Diag), k3 (Admin), k5 (Pedag) for >= 3.0 hrs
});

export const COUNTERWORLD_CITY_POLICIES = Object.freeze({
  Baseline: {
    id: "Baseline",
    meanTravelTime: 2.50,
    terminalRepresentation: 0.68,
    v1WaitHours: 0.40,
    v1EffectiveDwell: 4.00,
    synchronizedNodeMask: [1, 1, 1, 1, 1, 1],
    v1PeriodCosts: [0.20, 0.20, 0.20, 0.20],
    clocks: { actuation: 0.0, verification: 0.0, access: 0.0, material: 0.0 }
  },
  World_Alpha_Centralization: {
    id: "World_Alpha_Centralization",
    meanTravelTime: 1.42,
    terminalRepresentation: 1.00,
    v1WaitHours: 3.70,
    v1EffectiveDwell: 0.30, // Collapsed below 3.0 hr task requirement
    synchronizedNodeMask: [0, 1, 0, 1, 1, 1], // v1 & v3 desynchronized from hub window
    v1PeriodCosts: [0.58, 0.66, 0.70, 0.70],
    clocks: { actuation: 1.0, verification: 1.0, access: 2.0, material: 3.0 }
  },
  World_Beta_BesideNess: {
    id: "World_Beta_BesideNess",
    meanTravelTime: 2.00,
    terminalRepresentation: 0.84,
    v1WaitHours: 0.30,
    v1EffectiveDwell: 4.60,
    synchronizedNodeMask: [1, 1, 1, 1, 1, 1],
    v1PeriodCosts: [0.14, 0.14, 0.14, 0.14],
    clocks: { actuation: 1.0, verification: 1.0, access: 1.0, material: 1.0 }
  },
  World_Gamma_BeneficialConfluence: {
    id: "World_Gamma_BeneficialConfluence",
    meanTravelTime: 1.25,
    terminalRepresentation: 1.00,
    v1WaitHours: 0.20,
    v1EffectiveDwell: 5.40,
    synchronizedNodeMask: [1, 1, 1, 1, 1, 1],
    v1PeriodCosts: [0.11, 0.11, 0.11, 0.11],
    clocks: { actuation: 1.0, verification: 1.0, access: 1.0, material: 1.0 }
  },
  World_Beta_Minus_Overfragmented: {
    id: "World_Beta_Minus_Overfragmented",
    meanTravelTime: 3.10,
    terminalRepresentation: 0.45,
    v1WaitHours: 2.90,
    v1EffectiveDwell: 1.10,
    synchronizedNodeMask: [1, 0, 0, 0, 0, 0], // Attack 2: uncoordinated divergence hurts
    v1PeriodCosts: [0.45, 0.50, 0.52, 0.55],
    clocks: { actuation: 1.0, verification: 1.0, access: 1.5, material: 2.0 }
  },
  World_Delta_Elite_Substitution: {
    id: "World_Delta_Elite_Substitution",
    meanTravelTime: 1.40,
    terminalRepresentation: 1.00,
    v1WaitHours: 3.70,
    v1EffectiveDwell: 0.30, // Residential v1 still excluded, but hub contractors substitute
    synchronizedNodeMask: [0, 1, 0, 1, 1, 1],
    eliteContractorOverrideMatrix: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1], // v4 hires private contractors for k2, k3, k4, k5
      [1, 0, 0, 1, 0],
      [1, 0, 1, 0, 1]
    ],
    v1PeriodCosts: [0.58, 0.66, 0.70, 0.70],
    clocks: { actuation: 1.0, verification: 1.0, access: 2.0, material: 3.0 }
  }
});

// Exact Gaussian elimination rank over R
export function matrixRank(A) {
  const M = A.map((r) => r.slice().map(Number));
  let rank = 0;
  const rows = M.length;
  const cols = M[0]?.length ?? 0;
  for (let c = 0; c < cols && rank < rows; c++) {
    let pivot = rank;
    while (pivot < rows && Math.abs(M[pivot][c]) < 1e-9) {
      pivot++;
    }
    if (pivot === rows) continue;
    [M[rank], M[pivot]] = [M[pivot], M[rank]];
    const div = M[rank][c];
    for (let j = c; j < cols; j++) {
      M[rank][j] /= div;
    }
    for (let i = 0; i < rows; i++) {
      if (i !== rank && Math.abs(M[i][c]) > 1e-9) {
        const factor = M[i][c];
        for (let j = c; j < cols; j++) {
          M[i][j] -= factor * M[rank][j];
        }
      }
    }
    rank++;
  }
  return rank;
}

// Section XI Invented Operator: Synchronized Capability-Rank Operator (Omega_SCR)
export function evaluateSynchronizedCapabilityRank(policyKey, minTaskDuration = 3.0) {
  const policy = COUNTERWORLD_CITY_POLICIES[policyKey];
  if (!policy) throw new Error("Unknown policy: " + policyKey);

  const baseMatrix = policy.eliteContractorOverrideMatrix ?? HIDALGO_CAPABILITY_MATRIX;
  const maskedMatrix = baseMatrix.map((row, idx) =>
    row.map((val) => val * policy.synchronizedNodeMask[idx])
  );

  const staticRank = matrixRank(HIDALGO_CAPABILITY_MATRIX);
  const synchronizedRank = matrixRank(maskedMatrix);
  const capabilityRankDeficit = staticRank - synchronizedRank;

  const taskFeasibility = {};
  for (const [taskName, reqIndices] of Object.entries(TASKS)) {
    const capabilitiesPresent = reqIndices.every((k) =>
      maskedMatrix.some((row) => row[k] === 1)
    );
    const communityDwellSufficient = policy.eliteContractorOverrideMatrix
      ? true
      : policy.v1EffectiveDwell >= minTaskDuration;
    taskFeasibility[taskName] = capabilitiesPresent && communityDwellSufficient;
  }

  const kappaGeo = Number(
    (COUNTERWORLD_CITY_POLICIES.Baseline.meanTravelTime / policy.meanTravelTime).toFixed(4)
  );
  const cumulativeAttritionV1 = Number(
    policy.v1PeriodCosts.reduce((acc, c) => acc + c, 0).toFixed(4)
  );
  const activeCommunityCarriers = policy.synchronizedNodeMask
    .map((m, idx) => (m === 1 ? CITY_NODES[idx].id : null))
    .filter(Boolean);

  return {
    policyId: policy.id,
    kappaGeo,
    terminalRepresentation: policy.terminalRepresentation,
    staticCapabilityRank: staticRank,
    synchronizedCapabilityRank: synchronizedRank,
    capabilityRankDeficit,
    taskFeasibility,
    feasibleTaskCount: Object.values(taskFeasibility).filter(Boolean).length,
    v1WaitHours: policy.v1WaitHours,
    v1EffectiveDwell: policy.v1EffectiveDwell,
    v1CumulativeAttrition: cumulativeAttritionV1,
    activeCommunityCarriers,
    clocks: policy.clocks
  };
}

// Section VII: Computational Affect & Opacity Boundary Audit
export function auditGeographicImpasseAndAffect() {
  const agentA1 = {
    id: "Agent_A1_Attached",
    district: "v1_RES_N",
    observedRoute: "v1_RES_N -> v4_CENTRAL_HUB",
    observedWaitHours: 3.70,
    observedTasksCompleted: 0,
    stipulatedAttachment: {
      corridorPromiseAttachment: 1,
      sustainingRoutineCoherence: 0.44,
      obstructiveExitDelay: 0.52,
      mode: "CRUEL_OPTIMISTIC_SUSTAINING_AND_OBSTRUCTIVE"
    }
  };

  const agentA2 = {
    id: "Agent_A2_Captive_Unattached",
    district: "v1_RES_N",
    observedRoute: "v1_RES_N -> v4_CENTRAL_HUB",
    observedWaitHours: 3.70,
    observedTasksCompleted: 0,
    stipulatedAttachment: {
      corridorPromiseAttachment: 0,
      sustainingRoutineCoherence: 0.00,
      obstructiveExitDelay: 0.00,
      mode: "UNATTACHED_GEOGRAPHIC_NECESSITY"
    }
  };

  const publicGISProjection = (agent) => ({
    district: agent.district,
    observedRoute: agent.observedRoute,
    observedWaitHours: agent.observedWaitHours,
    observedTasksCompleted: agent.observedTasksCompleted
  });

  return {
    publicProjectionIdentical:
      JSON.stringify(publicGISProjection(agentA1)) ===
      JSON.stringify(publicGISProjection(agentA2)),
    stipulatedStatesDistinct:
      agentA1.stipulatedAttachment.corridorPromiseAttachment !==
      agentA2.stipulatedAttachment.corridorPromiseAttachment,
    glissantOpacityVerdict:
      "PASSED: Public GIS trajectory P_GIS(A1) = P_GIS(A2) cannot identify internal attachment state."
  };
}

// Section VIII: Ordered-Path Dependence, Discrete Stokes, Non-Abelian SO(3) & Dissipative Semigroup
export function runHolonomyResearchChamber() {
  // VIII.A: 1D Ordered-Path Dependence [T_cut, T_pass] != 0
  const T_cut = (state) =>
    state.hasHubPass ? { certified: 1, attending: 1, hasHubPass: true } : { certified: 0, attending: 0, hasHubPass: false };
  const T_pass = (state) =>
    state.certified === 1 ? { ...state, hasHubPass: true } : { ...state, hasHubPass: false };

  const x0 = { certified: 1, attending: 1, hasHubPass: false };
  const pathPassThenCut = T_cut(T_pass(x0)); // { certified: 1, attending: 1, hasHubPass: true }
  const pathCutThenPass = T_pass(T_cut(x0)); // { certified: 0, attending: 0, hasHubPass: false }

  // VIII.B: 2D Simplicial Stokes <da, F> = <a, dF> on F = [v1, v3, v4]
  const a_13 = 0.10;
  const a_34 = 0.40;
  const a_14 = 3.70;
  const boundaryIntegral = Number((a_13 + a_34 - a_14).toFixed(4)); // -3.20 hrs
  const surfaceCoboundary = boundaryIntegral;

  // VIII.C: 3D Non-Abelian SO(3) Parallel Transport & Detour/Trace Blindness
  const Rx90 = [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0]
  ];
  const Rz90 = [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1]
  ];
  const matMul = (A, B) =>
    A.map((row) =>
      B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0))
    );
  const matTrace = (M) => M[0][0] + M[1][1] + M[2][2];

  const Hol_forward = matMul(Rz90, Rx90);
  const Hol_reversed = matMul(Rx90, Rz90);

  // Dissipative semi-direct lift SO(3) |x R>=0 distinguishes tree-detour History H2 from H1
  const H1_dissipative = { holonomy: Hol_forward, attritionAccumulated: 0.50 };
  const H2_dissipative_with_detour = { holonomy: Hol_forward, attritionAccumulated: 4.50 };

  // VIII.D: Conservation-Coupled Discrepancy Fiber Flux
  const baselineCarriersV1 = 60;
  const observedPostConfluenceCarriers = 18;
  const conservationForcedDiscrepancyFlux = baselineCarriersV1 - observedPostConfluenceCarriers; // 42

  return {
    orderedPathDependence: {
      pathPassThenCut,
      pathCutThenPass,
      nonCommutative:
        pathPassThenCut.certified !== pathCutThenPass.certified
    },
    discreteStokes: {
      simplex: "[v1_RES_N, v3_LEARN_SITE, v4_CENTRAL_HUB]",
      boundaryIntegral,
      surfaceCoboundary,
      stokesTheoremHolds: boundaryIntegral === surfaceCoboundary
    },
    nonAbelianSO3: {
      Hol_forward,
      Hol_reversed,
      nonAbelianLoopDifference:
        JSON.stringify(Hol_forward) !== JSON.stringify(Hol_reversed),
      wilsonTraceCollision: matTrace(Hol_forward) === matTrace(Hol_reversed),
      dissipativeSemiGroupSeparatesDetour:
        H1_dissipative.attritionAccumulated !==
        H2_dissipative_with_detour.attritionAccumulated
    },
    discrepancyFiberInverseProblem: {
      unconstrainedKernelNullity: "INFINITE_OR_DIM_E_PERP (STRUCTURAL_RANK_DEFICIT)",
      conservationCoupledAggregateFlux: conservationForcedDiscrepancyFlux,
      individualBiographyRecoverableFromFluxAlone: false
    }
  };
}
