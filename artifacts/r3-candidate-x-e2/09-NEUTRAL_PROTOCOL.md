# Operational Protocol for Verifiable Distributed Software Extraction

## 1. Scope and Purpose
This document specifies the operational discipline required when an automated development system prepares software artifacts for evaluation by an independent external receiver. The protocol establishes verifiable boundaries between what a producing system observes, what it claims, and what an external evaluator must inspect.

---

## 2. Fundamental Epistemic Invariants

### 2.1 Separation of State, Observation, and Registration
Systems governed by this protocol must treat three tiers of information as structurally distinct:
1. **Internal State**: Hidden model activations, transient memory structures, and private tool states.
2. **Observed Local State**: DOM elements, process exit codes, and network payloads captured during execution.
3. **Externally Recorded Events**: Durable records committed to an addressable carrier, cryptographically signed, or witnessed by an external receiver.
Proof in one tier does not imply equivalence in another tier.

### 2.2 Endogenous Review Versus Exogenous Witness
Evaluation performed within the producing environment—including fresh sessions, isolated subprocesses, and temporary directories—constitutes **same-system validation**. 
- Same-system validation measures internal consistency and clean-room reproducibility.
- Same-system validation cannot establish external reproducibility.
- An independent witness requires an exogenous receiver situated outside the runtime, toolchain, and prompt context of the producing system.

### 2.3 Explicit Preservation of Absence and Missingness
Parameters, hardware environments, and cryptographic signatures that have not been directly observed must be explicitly designated as **unmeasured** or **held**. A producing system is prohibited from inferring completion from the absence of visible errors.

### 2.4 Separation of Operational Permission from Empirical Proof
Authorization to execute a command, dispatch a request, or access a repository is an administrative grant. Administrative permission does not establish the scientific validity, ergonomic viability, or objective truth of the resulting system state.

### 2.5 Sequence of Consequence and Categorization
Evaluation must strictly follow this temporal progression:
1. **Notice**: Identify the initial state and incoming constraints without altering them.
2. **Act**: Execute the declared operational step.
3. **Observe Consequence**: Capture the objective outcome returned by the environment.
4. **Name**: Categorize the state based strictly on observed consequences.
5. **Rest**: Return the system to an unprivileged baseline state where automated carriage is disarmed.
6. **Transfer**: Handoff verifiable artifacts to the next receiver.
A producing system must never apply a success category before the empirical consequence has completed.

### 2.6 Historical Non-Retroactivity
Historical execution failures, timeout events, and intermediate holds are permanent empirical data points. When a defect is repaired, earlier failure records must remain intact. Retrospective rewriting of earlier records to match a later successful outcome is prohibited.

---

## 3. Boundary Control and Authority De-escalation

### 3.1 Principle of Baseline Rest
Following the completion of any privileged or context-carrying operation, the interface must automatically return to an unprivileged rest posture. 
- In the rest posture, ordinary communication channels must not carry protected background context, private file data, or specialized routing tokens.
- Ordinary user messages must route exclusively through standard unprivileged endpoints.

### 3.2 Pre-Carriage Typed Disclosure
Before private or contextual files are attached to an outgoing transmission, the user interface must display an explicit three-part disclosure:
1. **Items Crossing the Boundary**: Exact task descriptions, specific file identifiers, and summaries of prior responses that will be transmitted.
2. **Items Retained Locally**: The count of local unselected files and private chat histories that remain withheld on the client device.
3. **Unobserved Remote States**: Unmeasured remote provider reasoning and backend variables that cannot be audited locally.

### 3.3 Transient Single-Turn Carriage Authorization
Carriage permission granted by explicit user confirmation must be transient.
- Confirmation arms the carriage mechanism for exactly one transmission turn.
- Immediately upon admission of the response, carriage authority expires and the interface resets to baseline rest.
- Chaining multiple contextual turns requires repeated explicit user confirmation for each discrete turn.

### 3.4 Cryptographic Predecessor Chaining
Each successive response stage in a multi-turn sequence must cryptographically bind:
1. The exact digest of the immediate predecessor stage receipt.
2. The exact digest of the normalized predecessor result.
Skipping intermediate predecessors or referencing non-contiguous ancestry is invalid.

---

## 4. Handoff Discipline to External Receivers

### 4.1 Cessation at the Boundary
When a producing system completes local extraction, it must halt before the external evaluation occurs. The producing system must not:
- Simulate the external receiver.
- Pre-generate the expected external conclusion.
- Declare that the external evaluation has passed.

### 4.2 Minimum Contents of a Verification Packet
A compliant transfer packet must contain:
1. An explicit manifest declaring all member artifacts and their cryptographic hashes.
2. An exact reference to the clean parent source commit from which the candidate was branched.
3. A standalone patch or bundle applicable solely against that declared base.
4. An empirical behavior contract describing the expected invariants in testable, neutral language.
5. A list of known holds and unmeasured parameters.
6. Standalone verification instructions executable without access to the producing system's internal logs.
