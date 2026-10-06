# TD613 Sequence 5.5 · Provenance Amendment: Credential and Billing Coordinate

**Document ID:** `11-CREDENTIAL_AND_BILLING_PROVENANCE_AMENDMENT.md`  
**Status:** `APPENDED_AMENDMENT`  
**Parent Contract:** Freeze A V4 (`70299c23b3e0b3d781ea9673cae1d1112ba281f3`)  
**Target Schema:** [`11-EXECUTION_RECEIPT_SCHEMA.json`](11-EXECUTION_RECEIPT_SCHEMA.json) (`v1.1`)  

---

### I · Context and Rationale

The partial pilot execution episode (`PILOT_RAW_FREEZE = 36f2aaf48a568d0a0171d34f6c1a22a25ff42a3b`) demonstrated an empirical boundary in execution provenance:
1. A valid provider endpoint (`generativelanguage.googleapis.com`) accepted invocations with HTTP 200 OK responses.
2. At call #21, the provider API rejected requests with HTTP 429 resource exhaustion under metric `generativelanguage.googleapis.com/generate_content_free_tier_requests` and quota ID `GenerateRequestsPerDayPerProjectPerModel-FreeTier` (daily limit: 20 requests).
3. The operator had funded an intended Google Cloud project with paid credits. However, the local workspace credential in `.env` was bound to an older Free Tier project, not the operator's intended paid project.
4. The Sequence 5.5 execution provenance receipt schema (`11-EXECUTION_RECEIPT_SCHEMA.json` v1.0) tracked model ID, runtime, endpoint, timings, inputs, outputs, tokens, and wire receipts, but **completely lacked credential source and billing context identity**.

Consequently, provenance receipts could not distinguish whether a model response was generated under a rate-limited Free Tier account or an authorized Paid Tier account.

---

### II · Governing Laws

This amendment institutes four mandatory governing laws:

```text
SAME_PROVIDER != SAME_BILLING_CONTEXT
AVAILABLE_OPERATOR_CREDITS != EXECUTION_CREDITS_PROVEN
API_KEY_PRESENT != INTENDED_API_KEY_USED
MODEL_EXECUTION_PROVENANCE_REQUIRES_CREDENTIAL_CONTEXT
```

1. **`SAME_PROVIDER != SAME_BILLING_CONTEXT`**: Identical provider API URLs and model IDs exhibit radically divergent rate limits, concurrency ceilings, priority tiers, and degradation behaviors depending on the account/billing context. Provenance of model behavior is incomplete without billing context.
2. **`AVAILABLE_OPERATOR_CREDITS != EXECUTION_CREDITS_PROVEN`**: The existence of paid credits on an operator's billing account does not establish that the specific active process or credential is routed to that billing account. Routing must be positively verified.
3. **`API_KEY_PRESENT != INTENDED_API_KEY_USED`**: The mere presence of an API key in a local `.env` file does not guarantee that it represents the intended project or billing tier. A stale key from an earlier session or free project may persist unnoticed.
4. **`MODEL_EXECUTION_PROVENANCE_REQUIRES_CREDENTIAL_CONTEXT`**: Every execution receipt must cryptographically fingerprint the active credential and record the verified billing tier and project identity without leaking secret key bytes.

---

### III · Zero-Secret Commitment

To preserve repository safety and prevent accidental credential leaks:
* **NEVER COMMIT RAW CREDENTIAL BYTES**: API keys, OAuth tokens, service account private keys, and bearer tokens must never be written into receipt files, git commits, or console logs.
* **ONE-WAY FINGERPRINTING**: The credential is uniquely identified by its one-way cryptographic SHA-256 digest:
  $$\text{credential\_fingerprint\_sha256} = \text{SHA-256}(\text{raw\_credential\_bytes})$$
  This allows retrospective matching against authorized operator credentials without exposing key bytes.
* **SAFE METADATA ONLY**: Only non-sensitive metadata (source type, variable name, project ID where available, billing tier, verification method) are admitted into receipt provenance.

---

### IV · Provenance Schema Amendment Specification

The execution receipt schema (`11-EXECUTION_RECEIPT_SCHEMA.json`) is amended to version `td613.sequence5.5.execution-receipt/v1.1`.

All future execution receipts (commencing with the fresh 25-unit sacrificial pilot episode) must include the following required object:

```json
"credential_and_billing_provenance": {
  "type": "object",
  "required": [
    "credential_source_type",
    "credential_source_name",
    "credential_fingerprint_sha256",
    "provider_project_id",
    "billing_tier_at_execution",
    "billing_context_verified",
    "billing_context_verification_method"
  ],
  "properties": {
    "credential_source_type": {
      "type": "string",
      "enum": [
        "ENVIRONMENT_VARIABLE",
        "DOTENV_FILE",
        "CONFIG_FILE",
        "WORKLOAD_IDENTITY",
        "OTHER"
      ]
    },
    "credential_source_name": {
      "type": "string",
      "description": "Safe identifier of credential source (e.g. GEMINI_API_KEY)."
    },
    "credential_fingerprint_sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$",
      "description": "One-way SHA-256 hex digest of raw credential bytes."
    },
    "provider_project_id": {
      "type": ["string", "null"],
      "description": "Provider-associated project identifier or GCP project ID where determinable."
    },
    "billing_tier_at_execution": {
      "type": "string",
      "description": "Classified provider billing tier at execution (e.g. FREE_TIER, TIER_1, TIER_2, TIER_3, UNVERIFIED)."
    },
    "billing_context_verified": {
      "type": "boolean",
      "description": "Whether the intended paid/production billing context was verified prior to execution."
    },
    "billing_context_verification_method": {
      "type": "string",
      "description": "Method by which billing context was evaluated (e.g. PREFLIGHT_API_CALL, QUOTA_ERROR_INSPECTION, MANUAL_DECLARATION)."
    }
  }
}
```

---

### V · Disposition of Historical Pilot Receipts

* Receipts generated under the partial pilot episode (`PILOT_RAW_FREEZE = 36f2aaf48a568d0a0171d34f6c1a22a25ff42a3b`) remain preserved under status `PARTIAL_PILOT_EPISODE_HELD_WRONG_BILLING_CONTEXT`.
* They remain valid historical evidence that those specific wire calls occurred and failed under the free tier quota.
* They are not retroactively mutated or re-executed.
* The fresh 25-unit sacrificial pilot will start anew from Unit 1 under a distinct episode identifier (`EPISODE_SACRIFICIAL_PILOT_V2`) strictly enforcing schema v1.1.
