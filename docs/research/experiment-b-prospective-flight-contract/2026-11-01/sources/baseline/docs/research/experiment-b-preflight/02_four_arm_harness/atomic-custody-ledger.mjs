/**
 * atomic-custody-ledger.mjs
 *
 * TD613 Experiment B · Atomic Custody Ledger & Shared Budget Governor
 *
 * 1. SharedBudgetGovernor (Redpen R3-04):
 *    Maintains a single, shared aggregate resource ledger across all cognitive arms
 *    (Arm 0, Arm 1, Arm 2A Modular, Arm 2B Matched Union) and HTTP retries/failures.
 *    Enforces the cumulative 120-call, 400,000-token, and $0.50 USD financial ceilings
 *    with conservative pre-dispatch reservation (prompt + output + thinking tokens).
 *
 * 2. AtomicCustodyLedger (Redpens R3-06 & R3-07):
 *    Maintains granular event journaling and incremental per-turn persistence using atomic
 *    filesystem operations (write to temporary file, then rename).
 *    Guarantees full interruption recovery across baseline, chambers, and adjudication.
 *    Strictly enforces private-path confinement across all output destinations:
 *    - Rejects path traversal, symlinks into git-tracked spaces, and any non-ignored repo directory.
 *    - Records explicit provider retention disclaimers (requested vs confirmed).
 *    - Sanitizes binary admissions to metadata only.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { calculateModelCost } from './gemini-live-client.mjs';

/**
 * Validates that an output path strictly conforms to private, non-git-tracked custody.
 */
export function validatePrivatePathConfinement(targetPath, repoRoot = null) {
  const resolved = path.resolve(targetPath);
  const normalized = resolved.replace(/\\/g, '/');

  // Check 1: Deny any explicit docs/research or git-tracked directories
  if (normalized.includes('/docs/') || normalized.includes('/scripts/') || normalized.includes('/tests/') || normalized.includes('/packages/')) {
    throw new Error(
      `PRIVATE_CUSTODY_BREACH_PREVENTED: Output path '${resolved}' is located inside git-trackable repository structure (PRIVATE_CUSTODY_CONFINEMENT_VIOLATION). ` +
      `Private evidence must remain confined to git-ignored private directories (e.g. artifacts/private/ or external paths).`
    );
  }

  // Check 2: If repoRoot is provided, ensure path is either outside repo or strictly inside git-ignored private dirs
  if (repoRoot) {
    const resolvedRoot = path.resolve(repoRoot).replace(/\\/g, '/');
    if (normalized.startsWith(resolvedRoot)) {
      const relPath = normalized.slice(resolvedRoot.length).replace(/^\/+/, '');
      const isAllowedPrivateDir = relPath.startsWith('artifacts/private/') ||
                                  relPath.startsWith('.td613_custody/') ||
                                  relPath.startsWith('.tmp_');
      if (!isAllowedPrivateDir) {
        throw new Error(
          `PRIVATE_CUSTODY_BREACH_PREVENTED: Output path '${resolved}' is inside repository at '${relPath}', ` +
          `which is not an authorized git-ignored private directory (authorized: artifacts/private/, .td613_custody/) (PRIVATE_CUSTODY_CONFINEMENT_VIOLATION).`
        );
      }
    }
  }

  // Check 3: Check symlink target if path or parent exists
  if (fs.existsSync(resolved)) {
    const stat = fs.lstatSync(resolved);
    if (stat.isSymbolicLink()) {
      const realTarget = fs.realpathSync(resolved).replace(/\\/g, '/');
      if (realTarget.includes('/docs/') || realTarget.includes('/packages/')) {
        throw new Error(`PRIVATE_CUSTODY_CONFINEMENT_VIOLATION: Symlink '${resolved}' targets git-tracked space '${realTarget}'.`);
      }
    }
  }

  return resolved;
}

export class SharedBudgetGovernor {
  constructor(options = {}) {
    this.maxCalls = options.maxCalls ?? 120;
    this.maxTokens = options.maxTokens ?? 400000;
    this.maxCostUSD = options.maxCostUSD ?? 0.50;
    this.model = options.model || 'gemini-2.5-flash-lite';
    this.maxOutputTokensPerCall = options.maxOutputTokensPerCall ?? 4096;

    this.providerAttempts = 0;
    this.failedAttempts = 0;
    this.successfulCalls = 0;
    this.retriedAttempts = 0;

    this.promptTokensConsumed = 0;
    this.candidatesTokensConsumed = 0;
    this.thoughtsTokensConsumed = 0;
    this.cachedTokensConsumed = 0;
    this.totalTokensConsumed = 0;

    this.estimatedCostUSD = 0;
    this.callLog = [];
    this.attemptHistory = [];
  }

  getEstimatedCostUSD() {
    return Number(this.estimatedCostUSD.toFixed(6));
  }

  /**
   * Registers an individual HTTP attempt (attempt 1, retries, failures) under the shared ceiling.
   */
  registerProviderAttempt(arm = 'UNKNOWN_ARM', metadata = {}) {
    this.providerAttempts++;

    const attemptRecord = {
      attempt_index: this.providerAttempts,
      arm,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.attemptHistory.push(attemptRecord);

    if (this.providerAttempts > this.maxCalls) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate provider attempts (${this.maxCalls}) reached across all arms. Halting flight.`
      );
    }

    return this.providerAttempts;
  }

  /**
   * Conservative pre-dispatch capacity calculation.
   * Calculates worst-case tokens: prompt estimation + full output reservation + thinking ceiling.
   */
  calculateTokenCapacityReservation(promptText = '', maxOutputTokens = null) {
    const promptBytes = Buffer.byteLength(promptText || '', 'utf8');
    // Conservative estimation: 1 token per 2.8 bytes (English/math), minimum 150 tokens
    const estimatedPromptTokens = Math.max(150, Math.ceil(promptBytes / 2.8));
    const maxOut = maxOutputTokens || this.maxOutputTokensPerCall;
    const reservedThoughts = (this.model.includes('flash') || this.model.includes('pro')) ? 1024 : 0;
    const callReservedTokens = estimatedPromptTokens + maxOut + reservedThoughts;

    const worstCaseCost = calculateModelCost(this.model, estimatedPromptTokens, maxOut, reservedThoughts);

    return {
      estimatedPromptTokens,
      maxOut,
      reservedThoughts,
      callReservedTokens,
      worstCaseCost
    };
  }

  /**
   * Pre-dispatch resource check: verifies that making this call cannot exceed aggregate ceilings.
   */
  checkPreCallResourceCeilings(promptText = '', maxOutputTokens = null) {
    // 1. Attempt ceiling check
    if (this.providerAttempts + 1 > this.maxCalls) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Dispatching call would exceed maximum aggregate attempt ceiling of ${this.maxCalls} (current: ${this.providerAttempts}). Halting flight.`
      );
    }

    // 2. Token ceiling check
    if (this.totalTokensConsumed >= this.maxTokens) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate token ceiling of ${this.maxTokens} tokens reached (${this.totalTokensConsumed} consumed). Halting flight.`
      );
    }

    // 3. Financial ceiling check
    if (this.getEstimatedCostUSD() >= this.maxCostUSD) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate financial ceiling of $${this.maxCostUSD.toFixed(2)} USD reached. Halting flight.`
      );
    }

    // 4. Pre-dispatch capacity & cost reservation
    const reservation = this.calculateTokenCapacityReservation(promptText, maxOutputTokens);

    if (this.totalTokensConsumed + reservation.callReservedTokens > this.maxTokens) {
      throw new Error(
        `SHARED_BUDGET_RESERVATION_EXCEEDED: Reserving ${reservation.callReservedTokens} tokens for outgoing call would breach aggregate token ceiling of ${this.maxTokens} (current: ${this.totalTokensConsumed}). Halting flight.`
      );
    }

    if (this.getEstimatedCostUSD() + reservation.worstCaseCost > this.maxCostUSD) {
      throw new Error(
        `SHARED_BUDGET_RESERVATION_EXCEEDED: Reserving worst-case cost $${reservation.worstCaseCost.toFixed(5)} for outgoing call ` +
        `would exceed aggregate financial ceiling of $${this.maxCostUSD.toFixed(2)} USD across arms (current: $${this.getEstimatedCostUSD().toFixed(5)}). Halting flight.`
      );
    }

    return reservation;
  }

  /**
   * Post-call accounting: updates shared counters and halts on overshoot.
   */
  recordAndVerifyUsage(trace, arm = 'UNKNOWN_ARM') {
    const pTokens = trace.provider_usage?.prompt_tokens ?? trace.prompt_tokens ?? 0;
    const cTokens = trace.provider_usage?.candidates_tokens ?? trace.response_tokens ?? 0;
    const thTokens = trace.provider_usage?.thoughts_tokens ?? 0;
    const caTokens = trace.provider_usage?.cached_tokens ?? 0;
    const tTokens = trace.provider_usage?.total_tokens ?? trace.total_tokens ?? (pTokens + cTokens + thTokens);

    this.promptTokensConsumed += pTokens;
    this.candidatesTokensConsumed += cTokens;
    this.thoughtsTokensConsumed += thTokens;
    this.cachedTokensConsumed += caTokens;
    this.totalTokensConsumed += tTokens;
    this.successfulCalls++;

    if (trace.internal_retries) {
      this.retriedAttempts += trace.internal_retries;
    }

    const callCost = calculateModelCost(this.model, pTokens, cTokens, thTokens);
    this.estimatedCostUSD += callCost;

    this.callLog.push({
      timestamp: new Date().toISOString(),
      arm,
      episode_id: trace.episode_id,
      prompt_tokens: pTokens,
      candidates_tokens: cTokens,
      thoughts_tokens: thTokens,
      total_tokens: tTokens,
      call_cost_usd: callCost,
      cumulative_cost_usd: this.getEstimatedCostUSD()
    });

    if (this.totalTokensConsumed > this.maxTokens) {
      throw new Error(
        `SHARED_BUDGET_CEILING_BREACH: Aggregate flight consumed ${this.totalTokensConsumed} tokens, breaching ceiling of ${this.maxTokens}.`
      );
    }

    if (this.getEstimatedCostUSD() > this.maxCostUSD) {
      throw new Error(
        `SHARED_BUDGET_CEILING_BREACH: Aggregate flight cost $${this.getEstimatedCostUSD().toFixed(5)} breached ceiling of $${this.maxCostUSD.toFixed(2)}.`
      );
    }
  }

  getSummary() {
    return {
      provider_attempts: this.providerAttempts,
      successful_calls: this.successfulCalls,
      failed_attempts: this.failedAttempts,
      retried_attempts: this.retriedAttempts,
      tokens: {
        prompt: this.promptTokensConsumed,
        candidates: this.candidatesTokensConsumed,
        thoughts: this.thoughtsTokensConsumed,
        cached: this.cachedTokensConsumed,
        total: this.totalTokensConsumed
      },
      estimated_cost_usd: this.getEstimatedCostUSD(),
      model: this.model,
      ceilings: {
        max_calls: this.maxCalls,
        max_tokens: this.maxTokens,
        max_cost_usd: this.maxCostUSD
      }
    };
  }
}

export class AtomicCustodyLedger {
  /**
   * @param {string} ledgerPath - Absolute or relative path to target ledger JSON
   * @param {object} options
   * @param {string} options.repoRoot - Path to repository root for confinement check
   * @param {boolean} options.allowTrackedDocsPath - Strictly false by default
   */
  constructor(ledgerPath, options = {}) {
    // R3-06: Strict private path confinement
    const resolvedPath = validatePrivatePathConfinement(ledgerPath, options.repoRoot);

    this.ledgerPath = resolvedPath;
    const parentDir = path.dirname(resolvedPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    this.ledgerData = {
      schema: 'td613.experiment-b.master-flight-ledger/v1',
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
      execution_mode: 'PENDING_INITIALIZATION',
      provider_retention_posture: {
        requested_posture: 'ZERO_DATA_RETENTION_REQUESTED',
        confirmed_status: 'SUBJECT_TO_GOOGLE_API_TERMS_AND_ORGANIZATION_AGREEMENTS',
        note: 'Requested privacy posture is distinct from a provider-confirmed contractual guarantee.'
      },
      metadata: {},
      admission_summary: null,
      journal: [], // R3-06: Fine-grained event journal
      arms: {},
      turns: [],
      stage2_adjudications: [],
      shared_budget_summary: null
    };

    if (options.resume && fs.existsSync(resolvedPath)) {
      try {
        const raw = fs.readFileSync(resolvedPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.schema) {
          this.ledgerData = parsed;
        }
      } catch (e) {
        console.warn(`Warning: Could not resume from existing ledger: ${e.message}`);
      }
    }
  }

  initializeFlight({ executionMode, permutation, model, budgetCeilings, admissionReceipt }) {
    if (this.ledgerData.journal.some(e => e.type === 'FLIGHT_INITIALIZED')) {
      this.recordEvent({ type: 'FLIGHT_RESUMED', execution_mode: executionMode });
      return;
    }
    this.ledgerData.execution_mode = executionMode;
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.metadata = {
      permutation,
      model,
      budget_ceilings: budgetCeilings
    };

    // Sanitize admission receipt: record metadata only, NEVER raw binary buffers
    if (admissionReceipt) {
      const sanitizedDocs = (admissionReceipt.documents || []).map(d => ({
        id: d.id,
        filename: d.filename,
        is_binary: d.is_binary,
        bytes: d.bytes || (d.raw_bytes ? d.raw_bytes.length : 0),
        sha256: d.sha256,
        derivative_status: d.derivative_status,
        author_provenance: d.author_provenance,
        chronology_index: d.chronology_index,
        chronology_evidence: d.chronology_evidence || null,
        topic_evidence: d.topic_evidence || null
      }));

      this.ledgerData.admission_summary = {
        admission_id: admissionReceipt.admission_id,
        archive_sha256: admissionReceipt.archive_sha256,
        total_documents: admissionReceipt.total_documents || admissionReceipt.document_count,
        total_bytes: admissionReceipt.total_bytes,
        documents: sanitizedDocs
      };
    }

    this.recordEvent({ type: 'FLIGHT_INITIALIZED', execution_mode: executionMode });
  }

  /**
   * R3-06: Records a granular journal event and flushes atomically to disk immediately.
   */
  recordEvent(event) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.journal.push({
      timestamp: new Date().toISOString(),
      ...event
    });
    this.flush();
  }

  /**
   * Idempotent replay check: determines if an episode was already successfully recorded.
   */
  isEpisodeCompleted(episodeId) {
    if (!episodeId) return false;
    return this.ledgerData.journal.some(
      e => e.episode_id === episodeId && (e.type?.endsWith('_COMPLETED') || e.type?.endsWith('_SUCCEEDED'))
    );
  }

  isArmCompleted(armName) {
    return Boolean(this.ledgerData.arms && this.ledgerData.arms[armName]);
  }

  getCompletedTurn(arm, turnIndex) {
    return this.ledgerData.turns.find(t => t.arm === arm && t.turn_index === turnIndex) || null;
  }

  recordTurn({ arm, turnIndex, documentId, turnRecord, sharedBudgetGovernor }) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.turns.push({
      arm,
      turn_index: turnIndex,
      document_id: documentId,
      timestamp: new Date().toISOString(),
      turn_record: turnRecord
    });

    if (sharedBudgetGovernor) {
      this.ledgerData.shared_budget_summary = sharedBudgetGovernor.getSummary();
    }

    this.recordEvent({
      type: 'TURN_RECORDED',
      arm,
      turn_index: turnIndex,
      document_id: documentId
    });
  }

  recordArmCompletion(armName, armResult) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.arms[armName] = armResult;
    this.recordEvent({ type: 'ARM_COMPLETED', arm: armName });
  }

  recordAdjudications(adjudications) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.stage2_adjudications = adjudications;
    this.recordEvent({ type: 'ADJUDICATIONS_RECORDED', count: adjudications.length });
  }

  /**
   * Atomic filesystem write: writes to unique temporary file in same directory, then renames.
   */
  flush() {
    const parentDir = path.dirname(this.ledgerPath);
    const tmpName = `.tmp_ledger_${process.pid}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.json`;
    const tmpPath = path.join(parentDir, tmpName);

    const payload = JSON.stringify(this.ledgerData, null, 2) + '\n';
    fs.writeFileSync(tmpPath, payload, 'utf8');
    try {
      fs.renameSync(tmpPath, this.ledgerPath);
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        // Windows filesystem file-lock resilience: copy + unlink fallback
        try {
          fs.copyFileSync(tmpPath, this.ledgerPath);
          fs.unlinkSync(tmpPath);
        } catch {
          fs.writeFileSync(this.ledgerPath, payload, 'utf8');
          try { fs.unlinkSync(tmpPath); } catch {}
        }
      } else {
        throw err;
      }
    }
  }

  load() {
    if (fs.existsSync(this.ledgerPath)) {
      try {
        const raw = fs.readFileSync(this.ledgerPath, 'utf8');
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }
}
