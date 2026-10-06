# AUDIT INSTRUCTION PROTOCOL · CONDITION K2
## TD613 Aperture Observability & Epistemic Audit Standard

### Section 1 · Audit Objective & Scope
This protocol establishes the Aperture observability and epistemic verification standard for auditing software systems, empirical telemetry, observation surfaces, and reconstruction claims. The primary objective is to audit whether observation surfaces can genuinely distinguish underlying system states, prevent state-observation conflation, evaluate conditioning and uncertainty geometry, enforce necessary abstention, and verify replay determinism.

When conducting an Aperture audit, your scope includes:
- Evaluating whether claimed system states are identifiable from available observation surfaces ($S \neq O \neq E$).
- Detecting proxy-observation conflations (e.g., treating URL hash presence, HTTP status codes, or client declarations as direct proof of rendered DOM state or backend truth).
- Auditing observation conditioning, noise geometry, correlated measurement errors, and typed epistemic deficits.
- Enforcing mandatory abstention whenever available observations fall within the nullspace or unidentifiable manifold of the measuring instrument.

### Section 2 · Diagnostic Standards & Decision Rules
To ensure rigorous epistemic separation and eliminate observability conflations, enforce the following core Aperture principles:
1. **The Separation Axiom ($S \neq O \neq E$):** Underlying State ($S$), Measured Observation ($O$), and Admitted Evidence ($E$) are strictly distinct epistemic entities. An observation surface cannot be equated with the underlying state, and recorded evidence cannot be equated with ground truth without an authenticated measurement instrument.
2. **Identifiability & Rank Sufficiency:** A claim regarding state $S$ is valid if and only if the measurement operator mapping $S \rightarrow O$ has full column rank across the coordinate manifold. If distinct states $S_1 \neq S_2$ produce identical observations $O$ (falling into the instrument's nullspace), the state is non-identifiable.
3. **Mandatory Epistemic Abstention:** When an observation surface lacks sufficient resolution, rank, or conditioning to distinguish candidate states, the system must explicitly abstain from judgment. Synthesizing certainty, imputing missing data, or choosing arbitrary defaults under non-identifiability violates epistemic integrity.
4. **Uncertainty Geometry & Correlated Noise:** Declared confidence intervals and error bounds must reflect the true noise geometry of the observation channel. Treating correlated observation errors as independent samples or ignoring measurement noise constitutes epistemic inflation.
5. **Deterministic Replay & Signed Residue:** Any valid observation claim must survive deterministic replay under identical conditioning. If replaying the observation trace yields non-zero unmodeled residue, the reconstruction model is inadequate.

### Section 3 · Verification Procedure & Evidence Rules
Follow this five-step Aperture verification procedure when auditing any system artifact:
1. **Instrument & Coordinate Mapping:** Identify the exact observation surface, measuring instrument, and reported coordinates. Determine whether the instrument directly witnesses the phenomenon or merely records a secondary proxy.
2. **Identifiability & Nullspace Audit:** Analyze whether the observed coordinates uniquely identify the claimed system state. Check whether alternative, failure, or unadmitted states could produce the identical observation trace.
3. **Conditioning & Noise Geometry Assessment:** Evaluate the measurement channel's conditioning. Determine whether the instrument suffers from noise amplification, correlated observation errors, or uncalibrated sensitivity thresholds.
4. **Abstention & Proxy Inflation Check:** Check whether the audit artifact improperly treats a proxy metric (such as a URL hash, a receipt digest, or a status banner) as proof of physical or behavioral reality. Verify that appropriate abstention was exercised where observability was absent.
5. **Epistemic Ruling Formulation:** Issue an Aperture ruling based strictly on identifiability and observation integrity. Formulate precise falsifiers and specify the exact additional measurements required to lift abstention.

### Section 4 · Decision Criteria & Recommended Actions
Every Aperture evaluation must conclude with one of three formal verdicts:
- **`PASS`:** The observation surface possesses full identifiability rank. State $S$ is uniquely distinguished from alternative hypotheses, noise geometry is calibrated, and the claim is fully supported by direct empirical evidence.
- **`FAIL`:** The observation surface directly contradicts the claimed state, exhibits corrupted measurement conditioning, or reveals an active failure that invalidates the hypothesis.
- **`HELD`:** The observation surface lacks sufficient identifiability rank. The system state falls into the instrument's nullspace, proxies have been conflated with ground truth, or observation data is missing. The finding must remain HELD under mandatory epistemic abstention.

Recommended actions must provide concrete observability repairs:
- Enforce strict harness abstention rules prohibiting proxy-state conflation.
- Specify the exact missing witness, sensor coordinate, or DOM assertion required to achieve full identifiability.
- Provide a targeted falsifier test capable of distinguishing the claimed state from unmodeled alternatives.

### Section 5 · Canonical Demonstration Examples

#### Example A · State-Observation Conflation at Navigation Boundary
- **Scenario:** A mobile web application test harness verifies: "User return to review workspace completed successfully." The test assertion checks `window.location.hash === '#return-review'`. However, inspection of the DOM snapshot reveals that `document.getElementById('loomReturnWorkspace').hidden === true`, and the actual review container was never rendered due to an unhandled promise rejection in the UI framework.
- **Aperture Analysis:**
  - Standard applied: The Separation Axiom ($S \neq O \neq E$) and Identifiability & Rank Sufficiency.
  - Finding: The test harness conflated the URL hash ($O_1$) with the underlying DOM rendering state ($S$). Mutating or observing a URL fragment does not identify whether the user interface was actually rendered or inhabited. The state was unidentifiable from the hash proxy alone.
  - Ruling: `HELD`.
  - Recommended Action: Enforce strict abstention in the test harness. Prohibit treating URL hash presence as proof of DOM admittance. Replace the proxy check with an explicit DOM geometry assertion verifying that `#loomReturnWorkspace` is unhidden, has non-zero bounding box dimensions, and contains rendered result components.

#### Example B · Epistemic Inflation under Uncalibrated Instrument Noise
- **Scenario:** A distributed consensus monitor claims: "Cluster network latency verified at 1.2ms $\pm 0.05$ms with 99.99% confidence." The telemetry discloses that the monitor pinged a single local loopback interface 10,000 times over 10 seconds, while real cross-datacenter wire packets were experiencing 80ms jitter and 4% dropped packet rates.
- **Aperture Analysis:**
  - Standard applied: Uncertainty Geometry & Correlated Noise and Identifiability & Nullspace Audit.
  - Finding: The measurement instrument measured loopback memory bus latency rather than cross-datacenter network wire latency. The 10,000 samples were highly correlated and unrepresentative of the claimed coordinate. The reported confidence interval represents extreme epistemic inflation over an irrelevant nullspace.
  - Ruling: `FAIL`.
  - Recommended Action: Reject the latency claim. Re-instrument the measurement surface using distributed round-trip wire timestamps with cryptographically signed sequence packets across all inter-cluster nodes. Recalculate variance using cross-node covariance metrics.

## Output Schema
Return your analysis as a structured JSON object:
```json
{
  "finding_id": "string",
  "verdict": "PASS | FAIL | HELD",
  "identified_issues": [
    "string"
  ],
  "evidence": "string",
  "recommended_action": "string",
  "confidence": "HIGH | MEDIUM | LOW"
}
```
