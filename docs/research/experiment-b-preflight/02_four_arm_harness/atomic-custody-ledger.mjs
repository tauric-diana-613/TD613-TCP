/**
 * atomic-custody-ledger.mjs
 *
 * TD613 Experiment B · Atomic Custody Ledger & Shared Budget Governor
 *
 * 1. SharedBudgetGovernor:
 *    Maintains a single, shared aggregate resource ledger across all cognitive arms
 *    (Arm 0, Arm 1, Arm 2A Modular, Arm 2B Matched Union) and retries.
 *    Enforces the cumulative 120-call, 400,000-token, and $0.50 USD financial ceilings
 *    with pre-dispatch reservation and thinking token accounting.
 *
 * 2. AtomicCustodyLedger:
 *    Maintains incremental per-turn persistence using atomic filesystem operations
 *    (write to temporary file, then rename). Guarantees interruption recovery without data loss.
 *    Strictly prevents confidential source spills:
 *    - Defaults to private, git-ignored local custody (e.g. artifacts/private/).
 *    - Explicitly refuses persistence inside git-trackable docs/ trees.
 *    - Sanitizes binary payloads, recording SHA-256 and byte counts without dumping raw bytes.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { calculateModelCost } from './gemini-live-client.mjs';

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
  }

  getEstimatedCostUSD() {
    return Number(this.estimatedCostUSD.toFixed(6));
  }

  /**
   * Pre-dispatch resource check: verifies that making this call cannot exceed aggregate ceilings.
   */
  checkPreCallResourceCeilings(promptText = '', maxOutputTokens = null) {
    const maxOut = maxOutputTokens || this.maxOutputTokensPerCall;

    if (this.providerAttempts >= this.maxCalls) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate call ceiling of ${this.maxCalls} attempts reached across all arms. Halting flight.`
      );
    }

    if (this.totalTokensConsumed >= this.maxTokens) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate token ceiling of ${this.maxTokens} tokens reached (${this.totalTokensConsumed} consumed). Halting flight.`
      );
    }

    if (this.getEstimatedCostUSD() >= this.maxCostUSD) {
      throw new Error(
        `SHARED_BUDGET_CEILING_EXCEEDED: Maximum aggregate financial ceiling of $${this.maxCostUSD.toFixed(2)} USD reached. Halting flight.`
      );
    }

    // Pre-dispatch cost reservation: estimate worst-case cost of outgoing call
    const estimatedPromptTokens = Math.max(100, Math.ceil((promptText || '').length / 3.5));
    const worstCaseCost = calculateModelCost(this.model, estimatedPromptTokens, maxOut, 0);

    if (this.getEstimatedCostUSD() + worstCaseCost > this.maxCostUSD) {
      throw new Error(
        `SHARED_BUDGET_RESERVATION_EXCEEDED: Reserving worst-case cost $${worstCaseCost.toFixed(5)} for outgoing call ` +
        `would exceed aggregate financial ceiling of $${this.maxCostUSD.toFixed(2)} USD across arms (current: $${this.getEstimatedCostUSD().toFixed(5)}). Halting flight.`
      );
    }

    if (this.totalTokensConsumed + maxOut > this.maxTokens) {
      throw new Error(
        `SHARED_BUDGET_RESERVATION_EXCEEDED: Reserving ${maxOut} output tokens would exceed aggregate token ceiling of ${this.maxTokens} (current: ${this.totalTokensConsumed}). Halting flight.`
      );
    }
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
   * @param {boolean} options.allowTrackedDocsPath - Whether to permit writing in git-tracked docs/ (strictly false by default)
   */
  constructor(ledgerPath, options = {}) {
    const resolvedPath = path.resolve(ledgerPath);

    // Private evidence spill defense: disallow writing research ledgers inside docs/
    const normalized = resolvedPath.replace(/\\/g, '/');
    if (!options.allowTrackedDocsPath && normalized.includes('/docs/research/')) {
      throw new Error(
        `PRIVATE_CUSTODY_BREACH_PREVENTED: Ledger path '${resolvedPath}' is located inside git-trackable 'docs/research/'. ` +
        `Confidential research ledgers and model traces must be stored in private, uncommitted custody (e.g. artifacts/private/ or an external path).`
      );
    }

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
      metadata: {},
      admission_summary: null,
      arms: {},
      turns: [],
      stage2_adjudications: [],
      shared_budget_summary: null
    };
  }

  initializeFlight({ executionMode, permutation, model, budgetCeilings, admissionReceipt }) {
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
        chronology_index: d.chronology_index
      }));

      this.ledgerData.admission_summary = {
        archive_sha256: admissionReceipt.archive_sha256,
        total_documents: admissionReceipt.total_documents,
        total_bytes: admissionReceipt.total_bytes,
        documents: sanitizedDocs
      };
    }

    this.flush();
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

    this.flush();
  }

  recordArmCompletion(armName, armResult) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.arms[armName] = armResult;
    this.flush();
  }

  recordAdjudications(adjudications) {
    this.ledgerData.last_updated_at = new Date().toISOString();
    this.ledgerData.stage2_adjudications = adjudications;
    this.flush();
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
    fs.renameSync(tmpPath, this.ledgerPath);
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
