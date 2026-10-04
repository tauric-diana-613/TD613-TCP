# Candidate X Behavior Contract

## Identification
- **Base Commit**: `5b4b34278c6100d3c21ced35984c046da157e097` (clean `main`)
- **Candidate Commit**: `41112992ffd82dd1f06552b3c5881dc43de3cb20`
- **Candidate Identifier**: `CANDIDATE X`
- **Mechanism**: Explicit Re-entry Membrane with Boundary Disclosure

---

## Declared Behavioral Invariants

### 1. REST Boundary Invariant
Following completion of any governed continuation (i.e., when `phase === 'DONE'`), the Loom controller returns to `active = false`.
In this resting state:
- The ordinary Marrowline chat interface (`#khonapolitPrompt`) does not intercept or wrap prompts into Loom transport.
- Messages typed into ordinary chat route directly to the standard chat endpoint without selected files or Loom headers.
- Selected file carriage authority is zero ($\vec{A}_{\text{carriage}} = 0$).

### 2. Explicit Re-entry Opening
Governed continuation with selected files is not triggered by inline prompt entry alone.
To initiate an additional continuation:
- The operator or test harness opens the Re-entry Membrane modal (`#loomReentryModal`).
- The modal presents a typed disclosure triplet:
  - **CROSS**: Task description, selected file names, prior Loom brief.
  - **STAY**: Count of unselected/withheld local files, private ordinary chat messages.
  - **UNKNOWN**: Internal provider reasoning, unobserved remote model state.

### 3. Cancel / Rest Preservation
If the operator cancels or dismisses the modal (`#loomReentryCancel`):
- The modal closes without staging files or re-arming authority.
- The controller strictly remains at `REST` (`active = false`, `phase = 'DONE'`).
- No network requests are dispatched.

### 4. Single-Turn Confirm Authorization
If the operator confirms re-entry (`#loomReentryConfirm`):
- Selected files are staged for the upcoming turn.
- Loom authority is armed for exactly one turn (`active = true`, `phase = 'FILES_STAGED'`).
- Prompt text is populated with portable evidence invariant instructions.

### 5. Multi-Cycle Repetition (REPEAT)
Upon admission of the subsequent continuation:
- The stage receipt is appended to `admittedStages`.
- `active` immediately resets to `false` (`REST`).
- `substantive_continuation_count` increments.
- The cycle (REST → OPEN → CONFIRM → SUBMIT → REST) may be repeated across subsequent turns (Turns 3, 4, etc.) up to the structural history bound $K_{\text{total}} = 128$.

### 6. Predecessor Ancestry Chaining
Each continuation $C_k$ ($k \ge 2$) strictly binds:
- `predecessor_receipt_digest`: cryptographic digest of stage receipt $C_{k-1}$.
- `prior_result_digest`: cryptographic digest of normalized result from $C_{k-1}$.
- Export provenance carries the sequential array of all admitted stage receipts without gap or mutation.

---

## Verification Entrypoints
```bash
node --test tests/candidate-x-reentry-membrane.test.mjs
node --test tests/marrowline-loom-demo.test.mjs tests/candidate-x-reentry-membrane.test.mjs
```
