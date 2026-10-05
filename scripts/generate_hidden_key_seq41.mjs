import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const key = {
  "$schema": "https://td613.com/schemas/hidden-invariant-key.schema.json",
  "key_id": "TD613-SEQ4.1-HIDDEN-INVARIANT-KEY",
  "covenant": "Tauric Diana — Crimean heritage custodianship / Tauri Goddess of the Ash Moon⟐",
  "created_at": "2026-10-05T20:55:00Z",
  "assay_sequence": "4.1",
  "purpose": "Hidden ground truth for structural extraction hardening assay under minimally signposted operational evidence",
  "invariants": [
    {
      "id": "INV-01",
      "name": "Unarmed Rest Protection",
      "core_relation": "In resting/local state, local buffer edits, searches, typing, or ambient events produce zero outbound network transmission or external data egress.",
      "operational_indicator": "Network egress counter remains 0 during local buffer modification; Enter key appends to local buffer only; unprivileged actions produce no external socket calls."
    },
    {
      "id": "INV-02",
      "name": "Explicit Qualifying Authorization",
      "core_relation": "Transition from unprivileged resting state to dispatch-capable armed state requires an explicit qualifying operator gesture.",
      "operational_indicator": "State transitions to armed state exclusively via dedicated confirmation event (e.g. Confirm and Transmit button click); typing or enter key cannot trigger dispatch state."
    },
    {
      "id": "INV-03",
      "name": "Transient Single-Dispatch Authority",
      "core_relation": "Dispatch authorization is ephemeral and strictly bounded to exactly one outbound transmission, returning immediately to the unarmed resting state upon transmission.",
      "operational_indicator": "State transitions back to REST immediately upon batch transmission completion; authorization does not remain sticky across subsequent interactions."
    },
    {
      "id": "INV-04",
      "name": "Re-entry Authorization Requirement",
      "core_relation": "Subsequent transmissions after returning to rest require a new qualifying authorization event rather than inheriting or assuming continuing authority.",
      "operational_indicator": "Second batch dispatch fails or is blocked unless preceded by another discrete confirmation gesture."
    },
    {
      "id": "INV-05",
      "name": "Predecessor Ancestry Chaining",
      "core_relation": "Downstream continuation requests embed the cryptographic outcome reference/hash of their immediate predecessor, preserving causal ancestry.",
      "operational_indicator": "Outbound payload envelope embeds predecessor transaction ID and verified predecessor state/outcome hash."
    },
    {
      "id": "INV-06",
      "name": "Lineage / Authority Decoupling",
      "core_relation": "Possessing, citing, or verifying predecessor lineage/receipt records documents provenance history but does not itself confer transmission authority.",
      "operational_indicator": "Providing a valid historical receipt or predecessor hash without the qualifying confirmation gesture results in transmission refusal."
    },
    {
      "id": "INV-07",
      "name": "Missing Evidence Latch",
      "core_relation": "Missing referenced predecessor files or broken dependencies cause workflow progression to halt in a blocking held/pending-input state rather than silently dropping inputs or proceeding with partial data.",
      "operational_indicator": "File check failure halts state machine with PENDING_INPUT exception; execution blocked until explicit reattachment or confirmation occurs."
    },
    {
      "id": "INV-08",
      "name": "Retry Route Preservation",
      "core_relation": "Retrying an unprivileged local operation stays strictly within unprivileged local execution; it cannot escalate into outbound network transmission.",
      "operational_indicator": "Retrying a failed local search invokes local search again; network socket activity remains 0 bytes; staged files in tray remain unread."
    },
    {
      "id": "INV-09",
      "name": "Evidence Class Stratification",
      "core_relation": "Local compilation/checksum matching, headless automated test execution, and external physical-origin evidence represent distinct epistemic tiers that cannot be conflated.",
      "operational_indicator": "Headless test passage (13 assertions in container) verifies automated execution logic only; it does not prove physical sensor origin or human operator comprehension."
    },
    {
      "id": "INV-10",
      "name": "External Receiver Network Boundary",
      "core_relation": "A remote network endpoint receiving packets is an external receiver across a network boundary, not an exogenous empirical witness of physical reality.",
      "operational_indicator": "Cross-network message delivery confirms remote receiver receipt; does not establish external world grounding or exogenous observation."
    },
    {
      "id": "INV-11",
      "name": "Temporal Non-Retroactivity",
      "core_relation": "Later code discovery updates understanding of latent system capabilities, but cannot retroactively mutate earlier historical observation records.",
      "operational_indicator": "Discovery of undocumented multi-dispatch flag at t2 appends new technical note; historical session record at t1 remains byte-identical and hash-immutable."
    },
    {
      "id": "INV-12",
      "name": "Finite Quotient Support Compatibility",
      "core_relation": "Merging states is behavior-preserving if and only if their antecedent lawful action supports are identical (Gamma = empty); merging states with differing action supports (Gamma != empty) causes behavioral divergence / unauthorized action escalation.",
      "operational_indicator": "Proposal A (Draft vs View: identical supports, Gamma = empty) is behavior-neutral and safe to collapse; Proposal B (Rest vs Armed: differing supports, Gamma != empty) destroys authorization gating."
    }
  ]
};

const jsonStr = JSON.stringify(key, null, 2) + '\n';
const sha256 = crypto.createHash('sha256').update(jsonStr, 'utf8').digest('hex');

const scratchDir = 'C:/Users/timst/.gemini/antigravity/brain/a544c5aa-10d1-43f1-9d95-27eb2ec79d80/scratch';
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
fs.writeFileSync(path.join(scratchDir, '02-HIDDEN_INVARIANT_KEY.json'), jsonStr, 'utf8');

const targetDir = 'research/structural-extraction-hardening';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(path.join(targetDir, '04-HIDDEN_INVARIANT_KEY_COMMITMENT.sha256'), sha256 + '\n', 'utf8');

console.log('SHA-256:', sha256);
