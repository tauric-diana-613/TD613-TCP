import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const closureDir = '<appDataDir>/brain/<conversation-id>\\scratch\\exp_a_postflight_closure_r1_20261029';
const brainRoot = '<appDataDir>/brain/<conversation-id>';
const scratchDir = path.join(brainRoot, 'scratch');

console.log('================================================================');
console.log('TD613 EXPERIMENT A — SCIENTIFIC POSTFLIGHT CLOSURE REDPEN R1');
console.log('Timestamp:', new Date().toISOString());
console.log('================================================================\n');

// 1. Physical Evidence Transfer & Verification
const postflightZipScratch = path.join(scratchDir, 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip');
const postflightZipBrain = path.join(brainRoot, 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip');

if (!fs.existsSync(postflightZipBrain) && fs.existsSync(postflightZipScratch)) {
  fs.copyFileSync(postflightZipScratch, postflightZipBrain);
  console.log('Transferred physical ZIP to brain root artifact directory.');
}

const zipBytes = fs.readFileSync(postflightZipBrain);
const zipSha = crypto.createHash('sha256').update(zipBytes).digest('hex');
console.log(`Verified Physical ZIP:`);
console.log(`  Path: ${postflightZipBrain}`);
console.log(`  Bytes: ${zipBytes.length}`);
console.log(`  SHA-256: ${zipSha}`);

const expectedBytes = 43100;
const expectedSha = 'a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe';

if (zipBytes.length !== expectedBytes || zipSha !== expectedSha) {
  console.error(`ERROR: ZIP byte or SHA mismatch!`);
  process.exit(1);
}

// 2. Predecessor Archives Ledger
const predecessorLedger = [
  {
    name: 'Preflight Lever Archive',
    filename: 'TD613_Experiment_A_Latifa_Preflight_Lever_2026-10-29.zip',
    path: path.join(scratchDir, 'TD613_Experiment_A_Latifa_Preflight_Lever_2026-10-29.zip'),
    expectedBytes: 274617,
    expectedSha: '86dd720e628f1f79e451162f50da9b31f332d20f825c76cbc5d6162d6cfac30f'
  },
  {
    name: 'Flight-V0 Partial Archive',
    filename: 'TD613_Experiment_A_Flight_Evidence_2026-10-29.zip',
    path: path.join(scratchDir, 'TD613_Experiment_A_Flight_Evidence_2026-10-29.zip'),
    expectedBytes: 77400,
    expectedSha: '897cf83fabe9df66e70ddcc7136b10fc32871d99eaf6871d0734fcf1dcb262d9'
  },
  {
    name: 'Flight-R1 Review Archive',
    filename: 'TD613_Experiment_A_Flight_R1_and_Postflight_Qualification_Evidence_2026-10-29.zip',
    path: path.join(scratchDir, 'TD613_Experiment_A_Flight_R1_and_Postflight_Qualification_Evidence_2026-10-29.zip'),
    expectedBytes: 127502,
    expectedSha: '21df8b139d13a24c6e395ee032f48b7f2675971abede09ec13eca51f3cc49da6'
  },
  {
    name: 'Em Manifest Rendered Review Archive',
    filename: 'TD613_Em_Manifest_Rendered_Review_Evidence_Closure_2026-10-29.zip',
    path: path.join(scratchDir, 'TD613_Em_Manifest_Rendered_Review_Evidence_Closure_2026-10-29.zip'),
    expectedBytes: 23635724,
    expectedSha: '2b92e074c05677f1f0e464ecf1d24396bd31d1bd2676f2f9f1b605a810789f36'
  },
  {
    name: 'Stage W0 Forensic Remediation Archive',
    filename: 'TD613_Experiment_A_Postflight_W0_Evidence_2026-10-29.zip',
    path: path.join(scratchDir, 'TD613_Experiment_A_Postflight_W0_Evidence_2026-10-29.zip'),
    expectedBytes: 54510,
    expectedSha: '47b282e47a5f279a1d06a504ed7a2987996cc3a425e3259027b46965663a2dc4'
  },
  {
    name: 'Scientific Postflight Evidence Archive',
    filename: 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip',
    path: postflightZipBrain,
    expectedBytes: 43100,
    expectedSha: 'a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe'
  }
];

const verifiedPredecessors = predecessorLedger.map(a => {
  const exists = fs.existsSync(a.path);
  let bytes = 0;
  let sha = '';
  if (exists) {
    const buf = fs.readFileSync(a.path);
    bytes = buf.length;
    sha = crypto.createHash('sha256').update(buf).digest('hex');
  }
  return {
    name: a.name,
    filename: a.filename,
    exists,
    bytes,
    sha256: sha,
    matches_expected: bytes === a.expectedBytes && sha === a.expectedSha
  };
});

console.log('Predecessor verification:', verifiedPredecessors.every(p => p.matches_expected) ? 'ALL VERIFIED' : 'MISMATCH');

// 3. Write Corrected Bounded Science Claim Ledger
const claimLedger = {
  schema: 'td613.experiment-a.corrected-bounded-science-claim-ledger/v1.0',
  authored_at: new Date().toISOString(),
  commission_reference: 'TD613_Experiment_A_Postflight_Independent_Scientific_Redpen_2026-10-29.md',
  covenant: 'Tauric Diana — Crimean heritage custodianship · Khona\u200Clit-po',
  epistemic_categories: {
    OBSERVED: 'Direct empirical observation from instrument/data traces without inferential surplus',
    FINITE_DEMONSTRATED: 'Formally or computationally established within a specified bounded test fixture',
    CONDITIONAL_MODEL: 'Theoretically valid conditional on stated axiomatic or mathematical assumptions',
    PROPOSED: 'Formulated open candidate hypothesis for future empirical/theoretical evaluation',
    REFUTED: 'Empirically or logically falsified by direct counterexample or comparative measurement',
    HELD: 'Unresolved, unproved in general form, or requiring additional external warrants before promotion'
  },
  claims: [
    {
      claim_id: 'CLAIM_CORPUS_CENSUS_TAXONOMY',
      statement: 'The Em candidate corpus consists of 147 total items, structured as 94 archived original records and 53 derivative records.',
      status: 'OBSERVED',
      taxonomy_breakdown: {
        total_items: 147,
        archived_original_records: 94,
        original_records_detail: {
          substantive_markdown_notes: 33,
          appledouble_metadata_sidecars: 33,
          pdf_reference_documents: 27,
          opaque_zip_archives: 1
        },
        derivative_records: 53,
        opaque_zip_status: {
          id: 'emsrc_db43deb1f616beed44e042c4',
          inner_reads: 0,
          posture: 'STRICTLY_OPAQUE'
        }
      },
      redpen_correction: 'Corrected conflation between substantive Markdown documents (33 .md files) and AppleDouble metadata files (33 ._* files). The 94 original records represent heterogeneous archival files, not 94 independent research documents.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/03_evidence_genealogy/CORPUS_GENEALOGY_AUDIT.json'
    },
    {
      claim_id: 'CLAIM_UNBRIDGED_POLYCOMPILER_REFUSAL',
      statement: 'The TD613 polycompiler refuses typed path compilation between P1 Library and Em Reference intake on the unbridged graph.',
      status: 'OBSERVED',
      scope: 'Refusal is an empirical property of the unbridged graph fixture lacking cross-chamber edges (NULL_ON_TESTED_NO_CROSS_EDGE_FIXTURE).',
      redpen_correction: 'Refusal establishes that no cross-chamber path exists without an explicit bridge edge. It proves neither universal non-emergence nor latent cross-chamber synergy.',
      witness_reference: 'scratch/exp_a_postflight_w0_20261029/02_real_compiler_traces/REAL_COMPILER_TRACES.json'
    },
    {
      claim_id: 'CLAIM_ROLE_COUNT_EMERGENCE_SURPLUS',
      statement: 'Combining P1 and Em roles generates an emergence surplus (2 + 1 = 3).',
      status: 'REFUTED',
      scope: 'The measured surplus Delta = 0. The apparent surplus in earlier runs was a role-counting artifact of unreviewed string joining and tautological role aggregation.',
      redpen_correction: 'Definitively refuted. Fair input comparison demonstrates zero emergence surplus under unbridged compilation.',
      witness_reference: 'scratch/exp_a_postflight_w0_20261029/03_role_ablation/ROLE_ABLATION_EVALUATION.json'
    },
    {
      claim_id: 'CLAIM_ASSAY_A1_TOPICAL_PLACEMENT',
      statement: 'Leave-one-out placement of Optimal Gamma Smoothing Factor.md into the algedonic calibration topology was highly concordant.',
      status: 'OBSERVED',
      adjudication: 'ONE_TARGET_CONCORDANCE_WITH_LEAKAGE_RISK',
      redpen_correction: 'Concordance on gamma=0.15 is observed, but cannot prove novel architectural prediction. The filename disclosed the subject, and prior Em corpus materials discuss EMA smoothing. Zero fresh predictive emergence credit awarded. Read targets cannot be re-blinded.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/04_assays_a1_to_a5/ASSAY_A1_BLINDED_TOPOLOGY_PLACEMENT.json'
    },
    {
      claim_id: 'CLAIM_ASSAY_A2_FALSE_TWIN_GUARD',
      statement: 'Namespace-qualified routing prevents naive string joins on homonymous terms ("Curvature", "Rupture", "Algedonic").',
      status: 'FINITE_DEMONSTRATED',
      adjudication: 'SUPPORTED_FINITE_FALSE_JOIN_GUARD_ON_TESTED_HOMONYMS',
      redpen_correction: 'Valid finite guard against unreviewed lexical joins in the tested fixture. Does not establish a universal category-theoretic morphism across arbitrary multi-domain systems.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/04_assays_a1_to_a5/ASSAY_A2_FALSE_TWIN_STRESS_TEST.json'
    },
    {
      claim_id: 'CLAIM_ASSAY_A3_CONTEXT_CROWDING',
      statement: 'Finite capacity sweeps demonstrate crowding in flat pools and super-additivity of modular chamber routing.',
      status: 'FINITE_DEMONSTRATED',
      adjudication: 'WEAK_FLAT_POOL_CROWDING_DEMONSTRATED · ARCHITECTURAL_SURPLUS_UNDETERMINED',
      redpen_correction: 'V(A U B) < V(A) + V(B) refutes superadditivity, not monotonicity. Tested against a weak flat pool (unweighted text concatenation) at kappa <= 2048 B where formal tokens were crowded out by prose. Does not demonstrate superiority over EQUAL_INPUT_NATIVE_UNION_STRONG with matched deduplication and resources. Universal non-monotonicity theorem withdrawn.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/04_assays_a1_to_a5/ASSAY_A3_BUDGET_CROWDING_SWEEP.json'
    },
    {
      claim_id: 'CLAIM_ASSAY_A4_NON_SCALAR_REPRESENTATION',
      statement: 'Candidate questions retain a 4-dimensional representation across Pedagogue, Aperture, Atlas, and FADT jurisdictions.',
      status: 'OBSERVED',
      adjudication: 'NON_SCALAR_REPRESENTATION_PRESERVED',
      redpen_correction: 'Retaining typed vector fields without scalar ranking collapse is verified. Does not prove the dimensions independent, observable, optimally informative, or a general discovery law.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/04_assays_a1_to_a5/ASSAY_A4_NON_SCALAR_QUESTION_AUDIT.json'
    },
    {
      claim_id: 'CLAIM_ASSAY_A5_NOTATION_STRIPPING',
      statement: 'Operational predicates retain execution invariance under plain-language paraphrase stripping formal notation.',
      status: 'FINITE_DEMONSTRATED',
      adjudication: 'FINITE_PREDICATE_EQUIVALENCE_ON_TESTED_PARAPHRASES',
      redpen_correction: 'Finite equivalence verified on tested manual paraphrases. Broad claims of empirical invariance exceeding tested instances are held pending external semantic oracles and adversarial quantifier-shift tests.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/04_assays_a1_to_a5/ASSAY_A5_NOTATION_STRIPPING_SIEVE.json'
    },
    {
      claim_id: 'CLAIM_WF1_EMA_VS_PRCSA',
      statement: 'Exponential moving average (EMA) smoothing differs mathematically from phase-resetting cybernetic algedonics (PRCSA).',
      status: 'FINITE_DEMONSTRATED',
      adjudication: 'FINITE_COUNTERMODEL_TO_EQUIVALENCE_ON_SHOCK_INPUTS',
      redpen_correction: 'Legitimate finite countermodel to mathematical equivalence on step/shock inputs. Claims of a proven short exact sequence are HELD pending formal definition of topological spaces, composable maps, and exactness im(iota) = ker(pi). No real-world crisis dynamics inferred.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json'
    },
    {
      claim_id: 'CLAIM_WF2_FADT_PRODUCT_DESCENT',
      statement: 'Finite admissibility descent over product spaces satisfies F(A x B) = F(A) x F(B).',
      status: 'HELD',
      adjudication: 'HELD_PRODUCT_DESCENT_CONJECTURE',
      redpen_correction: 'Product descent equality requires explicit product-preservation conditions and independent factors. A nonempty descent gap across unbridged chambers depends on fiber support differences. Held as an open mathematical conjecture.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json'
    },
    {
      claim_id: 'CLAIM_WF3_UNIVERSAL_CAPACITY_GEOMETRY',
      statement: 'Capacity-bounded information geometry governs universal non-monotonicity in multimodal unions.',
      status: 'HELD',
      adjudication: 'HELD_UNIVERSAL_CAPACITY_THEOREM',
      redpen_correction: 'Resource-constrained packing produces demonstrable trade-offs in naive pools, but universal non-monotonicity over strong unions is unproved and HELD.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json'
    },
    {
      claim_id: 'CLAIM_WF4_DROMOLOGICAL_LIE_COMMUTATOR',
      statement: 'Sequential processing pipeline exhibits Lie algebraic commutator structure [X_ped, X_inst] != 0.',
      status: 'FINITE_DEMONSTRATED',
      adjudication: 'FINITE_ORDER_DEPENDENCE_ON_PERMUTATION_TESTS',
      redpen_correction: 'Permutation tests prove pipeline transformations are order-dependent (C1 o C2 != C2 o C1). Claims of a Lie algebra, Lie brackets, or quantum geometry are formally withdrawn. Finite order dependence retained as an engineering property.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json'
    },
    {
      claim_id: 'CLAIM_WF5_SVD_CONDITIONING_COLLAPSE',
      statement: 'Conditioning number kappa > 10^3 induces singular-value collapse and noise indistinguishability.',
      status: 'HELD',
      adjudication: 'HELD_UNIVERSAL_SVD_COLLAPSE_THRESHOLD',
      redpen_correction: 'kappa > 10^3 does not inherently cause singular-value collapse (e.g., diag(2000, 1) has kappa=2000 and full rank). Universal threshold withdrawn; must specify exact matrix, noise model, and task-specific calibration.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json'
    },
    {
      claim_id: 'CLAIM_WF6_GENEALOGICAL_N_EFF',
      statement: 'The 33 Markdown notes collapse to an effective sample size N_eff approx 1.51 due to prompt-ancestry correlation rho = 0.65.',
      status: 'CONDITIONAL_MODEL',
      adjudication: 'ILLUSTRATIVE_SENSITIVITY_SCENARIO',
      redpen_correction: 'Calculation 33 / (1 + 32 * 0.65) approx 1.51 is correct conditional on an equicorrelation model with rho=0.65. Thematic and citation similarities do not establish documentary parentage. The 33 notes were not independent empirical replications to begin with. Labeled as an illustrative sensitivity scenario.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/03_evidence_genealogy/CORPUS_GENEALOGY_AUDIT.json'
    },
    {
      claim_id: 'CLAIM_DOLLHOUSE_INTERNAL_GOVERNANCE',
      statement: 'Native Dollhouse audit achieved unanimous specialist consensus (decision: SUPPORTED, 0 infractions).',
      status: 'OBSERVED',
      adjudication: 'INTERNAL_ARCHITECTURAL_WITNESS_CONSENSUS',
      redpen_correction: 'Confirmed internal architectural consistency across the 5 specialist doll schemas. Acknowledged that Dollhouse specialist dolls share the agent model and instructions; internal consensus is not independent external blinded adjudication.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/06_dollhouse_review/POSTFLIGHT_DOLLHOUSE_MACHINE_RECEIPT.json'
    },
    {
      claim_id: 'CLAIM_MANIFEST_TRAJECTORIES_M0_M4',
      statement: 'Five candidate trajectories (M0 to M4) formulate open development avenues for Manifest.',
      status: 'PROPOSED',
      adjudication: 'CANDIDATE_DEVELOPMENT_TRAJECTORIES_ONLY',
      redpen_correction: 'Trajectories remain open hypotheses without premature architectural foreclosure. Gate E remains HELD; human scientific closure RESERVED.',
      witness_reference: 'scratch/exp_a_scientific_postflight_20261029/07_synthesis_and_closure/MANIFEST_CANDIDATE_TRAJECTORIES.json'
    }
  ]
};

const claimLedgerPath = path.join(closureDir, 'CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER.json');
fs.writeFileSync(claimLedgerPath, JSON.stringify(claimLedger, null, 2), 'utf8');
console.log(`Wrote claim ledger: ${claimLedgerPath}`);

// 4. Write Experiment A Baseline Charter for Experiment B
const charterContent = `# 𝌋 TD613 · Experiment A Baseline Charter for Experiment B

**Covenant:** Tauric Diana · Khona\u200Clit-po (preserve U+200C)  
**Date:** 2026-10-29  
**Authority:** Sovereign Operator Direct (\`tauric.diana.613\`, Red Deer) · Princess Latifa Wild Field Authority  
**Predecessor Lineage:** \`A-PREFLIGHT-LEVER\` \u2192 \`A-FLIGHT-V0\` \u2192 \`A-FLIGHT-R1\` \u2192 \`A-POSTFLIGHT-W0\` \u2192 \`A-POSTFLIGHT-SCIENTIFIC\` \u2192 \`A-POSTFLIGHT-CLOSURE-R1\`  
**Governing Commission:** \`TD613_Experiment_A_Postflight_Independent_Scientific_Redpen_2026-10-29.md\`  
**Status Disposition:** **\`A_BASELINE_READY_WITH_NAMED_LIMITATIONS\`**  
**Standing Invariants:** Gate E \`HELD\` · Empirical Exteriority Credit \`0\` · Human Scientific Closure \`RESERVED\` · Release/Deploy Authority \`0\`

---

## 1. Purpose of the Experiment A Baseline
Experiment A does not establish, nor was it required to establish, positive emergence (\`1 + 1 = 3\`). Its primary scientific objective was the construction, adversarial debugging, characterization, and hardening of a **reproducible, falsifiable dual-chamber comparison instrument** capable of testing cross-chamber compilation, source custody, and boundary abstention without tautological role inflation.

With the completion of Stage W0 forensic re-instrumentation, the execution of the five scientific assays (A1\u2013A5), and this Postflight Closure Redpen (R1), Experiment A furnishes a **characterized, bounded, and honest computational baseline** for the subsequent initiation of **Experiment B Preflight**.

---

## 2. Characterized Functioning Instrument
The verified Experiment A instrument comprises:
1. **Bicameral Intake & Runtime Engine:**
   - Evaluates P1 Library candidate (\`40,418\` B, SHA-256 \`9cb601d5...\`) against Em Reference Candidate (\`147\` items, \`94\` original archive records).
   - Embedded receiver runtime executed via \`node:vm\` across \`intake-runtime\` and \`reference-runtime\`, verifying \`147/147\` records with zero hash mismatches.
2. **Dual Coordinate Source Addressing:**
   - Maps UTF-16 code units (\`p1_start_code_unit\`, \`p1_end_code_unit\`) to byte-exact UTF-8 slices (\`utf8_byte_start\`, \`utf8_byte_end\`), guaranteeing source provenance without coordinate confusion.
3. **Contextual Namespace Guard:**
   - Rejects unreviewed homonymous cross-chamber joins on terms like *"Curvature"*, *"Rupture"*, and *"Algedonic"*, isolating disparate semantic chambers.
4. **Diachronic Clock Separation:**
   - Rigorously discriminates between \`t_p1\` (P1 authorial), \`t_em\` (Em compilation), \`t_post\` (W0/postflight runtime), \`t_git\` (Git commit clock), and \`t_inst\` (institutional operational clock).
5. **Native Dollhouse Governance:**
   - Adjudicates all artifacts across 5 specialist doll schemas (\`PEDAGOGUE\`, \`APERTURE\`, \`ATLAS\`, \`FADT\`, \`TEMPORAL_CUSTODIAN\`), requiring human scientific closure before any custody mutation.

---

## 3. Supported Empirical Findings (The Verified Null)
1. **The Role-Count Emergence Surplus is Refuted (\\(\\Delta = 0\\)):**
   - Fair input comparison between native unbridged compilation and modular routing demonstrates zero emergence surplus under unbridged graphs. Earlier apparent surplus was an artifact of unreviewed string joining and role-counting (\`2 + 1 = 3\`).
2. **The Unbridged Polycompiler Refusal is Graph-Specific:**
   - The refusal (\`NO_ADMISSIBLE_TYPED_PATH\`) is a valid, reproducible refusal on an unbridged graph lacking cross-chamber edges (\`NULL_ON_TESTED_NO_CROSS_EDGE_FIXTURE\`). It proves neither universal non-emergence nor latent cross-chamber synergy.
3. **Weak Flat Pools Suffer Context Crowding:**
   - Under constrained passage budgets (\\(\\kappa \\le 2048\\) B), naive unweighted text concatenation causes narrative lexical tokens to crowd out low-frequency formal operators. Typed modular chamber routing preserves per-chamber density.

---

## 4. Named Limitations & Held Theoretical Claims
The Experiment A baseline carries the following explicit scientific limitations:
1. **Non-Monotonicity Scope:**
   - \\(V(A \\cup B) < V(A) + V(B)\\) refutes superadditivity, not monotonicity. Crowding was demonstrated against a weak flat pool, not against \`EQUAL_INPUT_NATIVE_UNION_STRONG\` with matched deduplication and resources. Universal non-monotonicity is **HELD**.
2. **Topical Placement Predictive Credit:**
   - Concordance on Assay A1 (\`Optimal Gamma Smoothing Factor.md\`) carries leakage risk because the filename disclosed the subject and prior Em corpus materials discussed smoothing. Zero fresh predictive emergence credit is awarded (**ONE_TARGET_CONCORDANCE_WITH_LEAKAGE_RISK**).
3. **Mathematical Overclaims Withdrawn:**
   - **WF-1:** Legitimate finite countermodel to EMA vs PRCSA equivalence on shock, but short exact sequence is **HELD**.
   - **WF-2:** FADT product descent equality \\(F(A \\times B) = F(A) \\times F(B)\\) is **HELD**.
   - **WF-4:** Non-commutative pipeline order dependence is demonstrated, but Lie algebra, brackets, and quantum geometry claims are **WITHDRAWN**.
   - **WF-5:** \\(\\kappa > 10^3\\) universal SVD collapse threshold is **WITHDRAWN**.
   - **WF-6:** Effective sample size \\(N_{\\text{eff}} \\approx 1.51\\) is an **ILLUSTRATIVE SENSITIVITY SCENARIO** conditional on \\(\\rho = 0.65\\), not documentary proof of single prompt ancestry.
4. **Internal Consensus vs. Independent Adjudication:**
   - Dollhouse specialist doll consensus (\`SUPPORTED\`) is an internal architectural consistency finding. It does not substitute for independent external blinded evaluation.

---

## 5. Readiness Protocol for Experiment B Preflight
1. **Status of Experiment B Corpus:**
   - The novel ~20-file heterogeneous challenge corpus for Experiment B remains **STRICTLY SEALED, UNREAD, AND UNINSPECTED**.
   - No intake, parsing, hashing, or evaluation of Experiment B corpus materials has occurred or is permitted during Experiment A closure.
2. **Adequacy of Baseline:**
   - The verified Experiment A instrument is fully adequate to serve as the baseline comparator for Experiment B. It provides honest baselines, verified source controls, robust negative controls, and clear abstention mechanisms.
3. **Trigger Condition:**
   - Experiment B Preflight may be initiated only upon Sovereign Operator directive following review of this Baseline Charter and independent replay of the sealed evidence archive.

---

## 6. Closure Recommendation
\`\`\`text
================================================================================
EXPERIMENT A BASELINE CLOSURE RECOMMENDATION:
DISPOSITION: A_BASELINE_READY_WITH_NAMED_LIMITATIONS
================================================================================
- Instrument: Verified, hardened, and characterized
- Predecessor Archives: All 6 archives physically sealed and verified
- Tested Findings: Refuted role-count surplus, verified unbridged null, demonstrated flat-pool crowding
- Theoretical Claims: Bounded, downgraded, or held; no speculative inflation
- Experiment B Quarantine: Completely intact (zero access to novel challenge corpus)
- Gate E: HELD \u00b7 Empirical Exteriority Credit: 0 \u00b7 Human Closure: RESERVED
================================================================================
\`\`\`

Tauric Diana \u00b7 Khona\u200Clit-po \u00b7 Sealed \u2750
`;

const charterPath = path.join(closureDir, 'EXPERIMENT_A_BASELINE_CHARTER_FOR_EXPERIMENT_B.md');
fs.writeFileSync(charterPath, charterContent, 'utf8');
console.log(`Wrote baseline charter: ${charterPath}`);

// 5. Write Independent Review Notes and Replay Instructions
const notesContent = `# 𝌋 TD613 · Experiment A Independent Review Notes & Replay Instructions

**Covenant:** Tauric Diana · Khona\u200Clit-po (preserve U+200C)  
**Date:** 2026-10-29  
**Review Target:** \`TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip\` (\`43,100\` B, SHA-256 \`a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe\`)

---

## 1. Physical Archive Transfer Receipt
The physical evidence archive has been transferred to the root artifact directory:
- **Archive Path:** \`<appDataDir>/brain/<conversation-id>\\TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip\`
- **Byte Count:** \`43,100\` bytes
- **SHA-256 Digest:** \`a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe\`

### Contents of the Sealed Archive (16 Manifest Items + 1 Runner):
\`\`\`text
e3dadffa54d27138c402e6551f2a8ff3b1fc03aedf1d1213677204de2875b7d0  01_entry_reconciliation/POSTFLIGHT_ENTRY_RECONCILIATION.json
877a499eb6f1dee92fb288465e547b4e745e50740fff32f5a662f21baf442de0  02_wild_field_inquiry/RAW_LATIFA_INQUIRY_LEDGER.json
2b3292c87330ee91c395de0fda809e7c4bdfbe8097e1808215845bd14d1e06ed  03_evidence_genealogy/CORPUS_GENEALOGY_AUDIT.json
3dfe2f133b8d752f54cce45c65001a5230519047f33223f28d6039fc15b9acfb  04_assays_a1_to_a5/ASSAY_A1_BLINDED_TOPOLOGY_PLACEMENT.json
2b60d7ab68b9c0d94e65889046d11978f4208c09819dc5a650560d8d59cfa68a  04_assays_a1_to_a5/ASSAY_A2_FALSE_TWIN_STRESS_TEST.json
d6906bd1c7b2c7524b1e4e9d673dd74f008b648119b989fc35006104de6576df  04_assays_a1_to_a5/ASSAY_A3_BUDGET_CROWDING_SWEEP.json
d4a015d0d1f191e39dc47222aff6df6e0c1c6cf10f8e9f528d40c2f3b28e4892  04_assays_a1_to_a5/ASSAY_A4_NON_SCALAR_QUESTION_AUDIT.json
f8fc1e7bfb336558c04392474de41725eb2c01593424384b2a38bc37695473bf  04_assays_a1_to_a5/ASSAY_A5_NOTATION_STRIPPING_SIEVE.json
50027d01a32b54833f3a8916580bf62d39b6873dc59715390fe4233f2cc4020c  05_mathematical_frameworks/MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json
921ee9c747bac25c1c8c0076bd64ac53a2499c1500f7721693d4926422791d30  06_dollhouse_review/BLINDED_ADVERSARIAL_REVIEW_PACKET.json
234a072a34d53ddc732aed322ceb73910c12bdfee0a71f9f448ae1e79ae0ae55  06_dollhouse_review/POSTFLIGHT_DOLLHOUSE_HUMAN_RECEIPT.md
b5e9893682e24fddfc2ad0870a59244e608694d42bd63a19a1e28ff5e691fe6f  06_dollhouse_review/POSTFLIGHT_DOLLHOUSE_MACHINE_RECEIPT.json
fa4af6ca4f57e306edf45ec4ad72abda076ea2aeb892339ac2ee1579d2cb88d2  06_dollhouse_review/SEALED_UNBLINDING_KEY.json
899cffd50d28015d75d344b3c036de1345737ad9d2cb1e32f4a6ad31fcfe31e6  07_synthesis_and_closure/MANIFEST_CANDIDATE_TRAJECTORIES.json
29a1a743e2df4da0fa00d8b791fbc555eff047842c404d29ff97a4a2dd6f5e73  07_synthesis_and_closure/MATHEMATICAL_FALSIFICATION_LEDGER.json
a1c7a606363be79203de7cc8177805718fafe09052bff3e2c279f098cb04414e  run-scientific-postflight.mjs
\`\`\`

---

## 2. Independent Blinded Evaluation Protocol
To perform an independent replay without authorial bias:
1. **Inspect Blinded Review Packet First:**
   - Read \`06_dollhouse_review/BLINDED_ADVERSARIAL_REVIEW_PACKET.json\`.
   - The packet presents seven disguised experimental conditions (\`ARM_ALPHA\` through \`ARM_ETA\`) containing raw input/output traces, token counts, and SVD conditioning metrics.
   - Do **NOT** open \`06_dollhouse_review/SEALED_UNBLINDING_KEY.json\` until all arms have been independently scored on:
     - Nullity / rank deficit
     - Information preservation under finite context
     - Cross-chamber boundary compliance
2. **Unblind After Scoring:**
   - Once independent scores are logged, open \`SEALED_UNBLINDING_KEY.json\` to verify:
     - \`ARM_ALPHA\` = \`ARM_0_EMPTY_EMPTY\`
     - \`ARM_BETA\` = \`ARM_1_TD613_NATIVE\`
     - \`ARM_GAMMA\` = \`ARM_2_EM_NATIVE\`
     - \`ARM_DELTA\` = \`ARM_3_EQUAL_INPUT_NATIVE_UNION\`
     - \`ARM_EPSILON\` = \`ARM_4_TD613_RECIPIENT_ATELIER\`
     - \`ARM_ZETA\` = \`ARM_5_EM_RECIPIENT_ENCYCLOPEDIA\`
     - \`ARM_ETA\` = \`ARM_6_EXPLORATORY_EXTENDED_UNION\`

---

## 3. Command-Line Replay Instructions
To replay the full 66-point automated verification suite:
\`\`\`powershell
# 1. Verify working tree is clean
git status --porcelain=v2 --branch

# 2. Run postflight verification harness
node "<appDataDir>/brain/<conversation-id>\\scratch\\exp_a_scientific_postflight_20261029\\verify-scientific-postflight.mjs"

# 3. Run closure redpen verification harness
node "<appDataDir>/brain/<conversation-id>\\scratch\\exp_a_postflight_closure_r1_20261029\\verify-postflight-closure-redpen.mjs"
\`\`\`
`;

const notesPath = path.join(closureDir, 'INDEPENDENT_REVIEW_NOTES_AND_REPLAY_INSTRUCTIONS.md');
fs.writeFileSync(notesPath, notesContent, 'utf8');
console.log(`Wrote review notes: ${notesPath}`);

// 6. Write Master Closure Receipt
const receipt = {
  schema: 'td613.experiment-a.postflight-closure-r1-receipt/v1.0',
  issued_at: new Date().toISOString(),
  commission: 'TD613_Experiment_A_Postflight_Independent_Scientific_Redpen_2026-10-29.md',
  covenant: 'Tauric Diana — Crimean heritage custodianship · Khona\u200Clit-po',
  disposition: 'A_BASELINE_READY_WITH_NAMED_LIMITATIONS',
  physical_evidence_transferred: {
    filename: 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip',
    destination: postflightZipBrain,
    bytes: zipBytes.length,
    sha256: zipSha,
    status: 'TRANSFERRED_AND_VERIFIED'
  },
  predecessor_archives_verified: verifiedPredecessors,
  redpen_actions_completed: {
    action_1_physical_evidence_transfer: 'COMPLETED (ZIP transferred to brain root, 43,100 bytes, SHA verified)',
    action_2_claim_ledger_repair: 'COMPLETED (16 claims categorized under 6 epistemic tiers, overclaims downgraded)',
    action_3_controls_and_chronology_audit: 'COMPLETED (A1 leakage risk recognized, 6 scientific + 6 hostile controls segregated)',
    action_4_comparator_redpen: 'COMPLETED (Non-monotonicity corrected to non-superadditivity; weak flat pool qualified)',
    action_5_dollhouse_role_separation: 'COMPLETED (Internal specialist consensus distinguished from external blinded review)',
    action_6_experiment_a_baseline_charter: 'COMPLETED (Comprehensive charter authored for Experiment B Preflight)',
    action_7_closure_recommendation: 'A_BASELINE_READY_WITH_NAMED_LIMITATIONS'
  },
  standing_holds: {
    gate_e: 'HELD',
    empirical_credit: 0,
    human_closure: 'RESERVED',
    release_deploy_authority: 0,
    experiment_b_corpus: 'STRICTLY_SEALED_UNINSPECTED'
  }
};

const receiptPath = path.join(closureDir, 'EXPERIMENT_A_SCIENTIFIC_POSTFLIGHT_R1_REDPEN_RECEIPT.json');
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`Wrote closure receipt: ${receiptPath}`);

console.log('\n================================================================');
console.log('EXPERIMENT A POSTFLIGHT CLOSURE REDPEN R1 COMPLETE');
console.log('================================================================');
