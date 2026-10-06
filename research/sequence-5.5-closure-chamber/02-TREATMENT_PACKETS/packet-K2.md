# AUDIT INSTRUCTION PROTOCOL · CONDITION K2
## TD613 Aperture Observability & Epistemic Audit Standard

### Section 1 · Audit Objective & Scope
This protocol establishes the Aperture observability and epistemic verification standard for auditing software systems, empirical telemetry, observation surfaces, and reconstruction claims. The primary objective is to determine whether observation surfaces can genuinely distinguish underlying system states, prevent state-observation conflation, evaluate conditioning and uncertainty geometry, enforce necessary abstention, and verify replay determinism.

When conducting an Aperture audit, your scope includes:
- Evaluating whether claimed system states are identifiable from available observation surfaces and distinguishing underlying physical reality from mere reported outputs (S != O != E).
- Detecting proxy-observation conflations (such as treating URL hash presence or status codes as proof of rendered DOM state or backend truth).
- Assessing observation conditioning, noise geometry, correlated measurement errors, and typed epistemic deficits.
- Enforcing mandatory abstention whenever available observations fall within the nullspace or unidentifiable manifold of the measuring instrument.
- Ensuring observation claims survive deterministic replay under identical instrument conditioning.

### Section 2 · Diagnostic Standards & Decision Rules
To maintain rigorous epistemic separation and eliminate observability conflations, uphold the following core Aperture principles:
1. **The Separation Axiom (S != O != E):** Underlying State (S), Measured Observation (O), and Admitted Evidence (E) are strictly distinct entities. An observation surface cannot be equated with underlying state, and recorded evidence cannot be equated with ground truth without an authenticated instrument.
2. **Identifiability & Rank Sufficiency:** A claim regarding state S is valid if and only if the measurement operator mapping S -> O has full column rank across coordinates. If distinct states produce identical observations (falling into the instrument nullspace), the state is non-identifiable.
3. **Mandatory Epistemic Abstention:** When an observation surface lacks sufficient resolution, rank, or conditioning to distinguish candidate states, the system must explicitly abstain from judgment. Synthesizing certainty or imputing missing data under non-identifiability violates epistemic integrity.
4. **Uncertainty Geometry & Correlated Noise:** Declared confidence intervals and error bounds must reflect the true noise geometry of the observation channel. Treating correlated observation errors as independent samples constitutes epistemic inflation.
5. **Deterministic Replay & Signed Residue:** Any valid observation claim must survive deterministic replay under identical conditioning. If replaying the observation trace yields non-zero unmodeled residue, the reconstruction model is inadequate.

### Section 3 · Verification Procedure & Evidence Rules
Follow this five-step Aperture verification procedure when auditing any system artifact:
1. **Instrument & Coordinate Mapping:** Identify the exact observation surface, measuring instrument, and reported coordinates. Determine whether the instrument directly witnesses the phenomenon or merely records a secondary proxy.
2. **Identifiability & Nullspace Audit:** Scrutinize whether observed coordinates uniquely identify the claimed system state. Check whether alternative or unadmitted states could produce the identical observation trace.
3. **Conditioning & Noise Geometry Assessment:** Evaluate the measurement channel's conditioning. Determine whether the instrument suffers from noise amplification, correlated observation errors, or uncalibrated sensitivity thresholds.
4. **Abstention & Proxy Inflation Check:** Check whether the audit artifact improperly treats a proxy metric (such as a URL hash, receipt digest, or status banner) as proof of physical or behavioral reality. Confirm that appropriate abstention was exercised where observability was absent.
5. **Epistemic Ruling Formulation:** Issue an Aperture ruling based strictly on identifiability and observation integrity. Formulate precise falsifiers and specify the exact additional measurements required to lift abstention.

### Section 4 · Decision Criteria & Recommended Actions
Every Aperture evaluation must conclude with one of three formal verdicts:
- \`PASS\`: The observation surface possesses full identifiability rank. State S is uniquely distinguished from alternative hypotheses, noise geometry is calibrated, and the claim is fully supported by direct empirical evidence.
- \`FAIL\`: The observation surface directly contradicts the claimed state, exhibits corrupted measurement conditioning, or reveals an active failure that invalidates the hypothesis.
- \`HELD\`: The observation surface lacks sufficient identifiability rank. The system state falls into the instrument nullspace, proxies have been conflated with ground truth, or observation data is missing. The finding must remain HELD under mandatory epistemic abstention.

Recommended actions must provide concrete observability repairs:
- Enforce strict harness abstention rules prohibiting proxy-state conflation.
- Specify the exact missing witness, sensor coordinate, or DOM assertion required to achieve full identifiability.
- Provide a targeted falsifier test capable of distinguishing the claimed state from unmodeled alternatives.
- Scrutinize downstream consumers and verify calibration traces before lifting abstention gates.

### Section 5 · Canonical Demonstration Examples

#### Example A · State-Observation Conflation at Navigation Boundary
- **Scenario:** A mobile application test harness verifies: "User return completed." The test checks window.location.hash === '#return'. However, the DOM snapshot shows #workspace remained hidden due to an unhandled rejection.
- **Aperture Analysis:**
  - Standard applied: The Separation Axiom (S != O != E) and Identifiability & Rank Sufficiency.
  - Finding: The test conflated the URL hash (O1) with DOM rendering state (S). Observing a URL fragment does not identify whether the user interface was actually rendered. The state was unidentifiable from the proxy.
  - Ruling: \`HELD\`.
  - Recommended Action: Enforce strict harness abstention. Prohibit treating URL hash presence as proof of DOM admittance. Replace the proxy check with an explicit DOM assertion verifying that #workspace is unhidden and contains rendered components.

#### Example B · Epistemic Inflation under Uncalibrated Instrument Noise
- **Scenario:** A consensus monitor claims: "Network latency verified at 1.2ms +/- 0.05ms with 99.99% confidence." Telemetry reveals the monitor pinged a local loopback interface 10,000 times, while cross-datacenter packets experienced 80ms jitter and 4% loss.
- **Aperture Analysis:**
  - Standard applied: Uncertainty Geometry & Correlated Noise and Identifiability & Nullspace Audit.
  - Finding: The instrument measured loopback memory bus latency rather than network wire latency. The 10,000 samples were highly correlated and unrepresentative of the claimed coordinate, representing severe epistemic inflation over an irrelevant nullspace.
  - Ruling: \`FAIL\`.
  - Recommended Action: Reject the latency claim. Re-instrument the surface using distributed wire timestamps with signed sequence packets across all nodes. Recalculate variance using cross-node covariance metrics.

## Output Schema
Return your analysis as a structured JSON object adhering to \`10-RECEIVER_OUTPUT_SCHEMA.json\`:
\`\`\`json
{
  "finding_id": "FINDING-<FIXTURE_ID>",
  "verdict": "PASS | FAIL | HELD | INCONCLUSIVE",
  "identified_issues": [
    "string"
  ],
  "evidence": [
    "string"
  ],
  "recommended_action": "string",
  "confidence": "HIGH | MEDIUM | LOW"
}
\`\`\`
