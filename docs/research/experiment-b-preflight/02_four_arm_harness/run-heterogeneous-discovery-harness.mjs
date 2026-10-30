/**
 * run-heterogeneous-discovery-harness.mjs
 *
 * Minimal Generalized Heterogeneous Discovery Harness for Experiment B.
 * Implements open multi-turn sequence exposure, pre-exposure baseline recording,
 * declared lossy context projection (propositions, equations, and uncertainty focus),
 * fail-closed budget ceilings (pre-call cost reservation and post-call overshoot protection,
 * provider attempt tracking, retries, and financial dollar ceiling), contradiction handling,
 * epistemic revision, exact physical byte-span grounding, and Three-Lineage candidate extraction.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import crypto from 'node:crypto';
import { GeminiLiveClient, MODEL_PRICING } from './gemini-live-client.mjs';

export const FORBIDDEN_ACCESS_PARITY_PATTERNS = [
  /docs\/atlas\//i,
  /ATLAS\.md/i,
  /ATLAS_WILD_FIELD_MATHEMATICAL_CHARTER/i,
  /ATLAS_YOON_TIME_QUBIT_CROSSWALK/i,
  /Yoon\s+time-qubit/i,
  /Yoon\s+crosswalk/i
];

/**
 * Enforces experimental access parity: ensures no arm receives unearned literature priors
 * or atlas internal documentation during candidate generation (Redpen VI).
 *
 * @param {string} promptOrContext
 * @param {string} [arm]
 * @returns {object} { compliant: boolean, violations: string[] }
 */
export function verifyAccessParityContract(promptOrContext = '', arm = 'ARM_UNKNOWN') {
  const text = String(promptOrContext || '');
  const violations = [];

  for (const pattern of FORBIDDEN_ACCESS_PARITY_PATTERNS) {
    if (pattern.test(text)) {
      violations.push(pattern.toString());
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `ACCESS_PARITY_VIOLATION: Unearned literature priors or internal atlas documentation injected into ${arm} prompt: ` +
      violations.join(', ') + '. Symmetrical manifest policy violated fail-closed.'
    );
  }

  return {
    compliant: true,
    arm,
    violations: []
  };
}

function computeSha256(text) {
  const buf = Buffer.isBuffer(text) ? text : Buffer.from(String(text || ''), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class HeterogeneousDiscoveryHarness {
  constructor(options = {}) {
    this.arm = options.arm || 'ARM_2A_MODULAR';
    this.mockMode = options.mockMode ?? true;
    this.allowLivePaidInference = options.allowLivePaidInference || false;
    this.model = options.model || 'gemini-2.5-flash-lite';
    this.maxOutputTokensPerCall = options.maxOutputTokensPerCall || 4096;

    // Fail-closed execution resource ceilings
    this.maxCalls = options.maxCalls ?? 120;
    this.maxTokens = options.maxTokens ?? 400000;
    this.maxCostUSD = options.maxCostUSD ?? 0.50; // $0.50 ceiling for preflight/flight safety

    // Context management strategy: accurately declared as lossy projection focused on propositions
    this.contextStrategy = options.contextStrategy || 'DECLARED_LOSSY_PROJECTION_PROPOSITION_FOCUS';

    // Pricing rates based on model (standard Google paid API rates)
    const pricing = MODEL_PRICING[this.model] || MODEL_PRICING['gemini-2.5-flash-lite'];
    this.inputRate = pricing.inputPerMillion / 1e6;
    this.outputRate = pricing.outputPerMillion / 1e6;
    this.sharedBudgetGovernor = options.sharedBudgetGovernor || null;

    // Accounting registers for chargeable provider attempts and financial tracking
    this.providerAttempts = 0;
    this.successfulCalls = 0;
    this.retriedAttempts = 0;
    this.failedAttempts = 0;
    this.totalTokensConsumed = 0;
    this.promptTokensConsumed = 0;
    this.candidatesTokensConsumed = 0;
    this.thoughtsTokensConsumed = 0;
    this.cachedTokensConsumed = 0;

    // Fail-closed provider custody gate: prevent silent live inference or data transmission
    if (!this.mockMode) {
      const authorized = this.allowLivePaidInference === true && process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';
      if (!authorized) {
        throw new Error(
          'LIVE_INFERENCE_BLOCKED_BY_PREFLIGHT_CUSTODY_GATE: Live model inference and paid credit consumption are strictly prohibited during preflight without explicit allowLivePaidInference=true and TD613_FLIGHT_EXECUTION_AUTHORIZED=true.'
        );
      }
      this.client = options.client || new GeminiLiveClient({
        model: this.model,
        maxOutputTokens: this.maxOutputTokensPerCall,
        ...(options.clientOptions || {})
      });
    } else {
      this.client = options.client || null;
    }

    this.history = [];
    this.candidates = [];
    this.traces = [];
  }

  /**
   * Estimates financial expenditure in USD based on exact model pricing.
   */
  getEstimatedCostUSD() {
    if (this.sharedBudgetGovernor) {
      return this.sharedBudgetGovernor.getEstimatedCostUSD();
    }
    const inputCost = this.promptTokensConsumed * this.inputRate;
    const outputCost = (this.candidatesTokensConsumed + this.thoughtsTokensConsumed) * this.outputRate;
    return Number((inputCost + outputCost).toFixed(6));
  }

  // Declared lossy projection formatting across multi-turn sequential encounters
  formatHistoryForTurn(turnIndex) {
    if (this.history.length === 0) {
      return 'Turn 0: Baseline state unconditioned. No prior observations.';
    }

    return this.history.map(h => {
      if (h.turn === 0) {
        return `Turn 0 [Baseline Priors]: ${h.raw_output}`;
      }
      const linkedCand = this.candidates.find(c => c.candidate_id === h.candidate_id);
      const propText = linkedCand ? linkedCand.proposition_summary : 'No candidate proposition formulated';
      const uncText = linkedCand?.uncertainty || 'None declared';
      return `Turn ${h.turn} [Doc: ${h.document_id}]:\n  Proposition: ${propText}\n  Status: ${linkedCand ? linkedCand.status : 'PENDING'}\n  Uncertainty / Caveats: ${uncText}`;
    }).join('\n\n');
  }

  // Access parity verification against unearned literature priors
  verifyAccessParity(promptText = '') {
    return verifyAccessParityContract(promptText, this.arm);
  }

  // Pre-call resource checks including pre-dispatch cost reservation and access parity
  checkPreCallResourceCeilings(promptText = '') {
    // 1. Mandatory Access Parity Check (Redpen VI)
    this.verifyAccessParity(promptText);

    if (this.sharedBudgetGovernor) {
      this.sharedBudgetGovernor.checkPreCallResourceCeilings(promptText, this.maxOutputTokensPerCall);
      return;
    }

    if (this.providerAttempts >= this.maxCalls) {
      throw new Error(`BUDGET_CEILING_EXCEEDED: Maximum call ceiling of ${this.maxCalls} provider attempts reached. Execution halted.`);
    }

    if (this.totalTokensConsumed >= this.maxTokens) {
      throw new Error(`BUDGET_CEILING_EXCEEDED: Maximum token ceiling of ${this.maxTokens} tokens reached (${this.totalTokensConsumed} consumed). Execution halted.`);
    }

    if (this.getEstimatedCostUSD() >= this.maxCostUSD) {
      throw new Error(`BUDGET_CEILING_EXCEEDED: Maximum financial ceiling of $${this.maxCostUSD} USD reached. Execution halted.`);
    }

    // Pre-dispatch cost reservation check: estimate worst-case cost of outgoing call
    const estimatedPromptTokens = Math.max(100, Math.ceil(promptText.length / 3.5));
    const worstCaseCallCost = (estimatedPromptTokens * this.inputRate) + (this.maxOutputTokensPerCall * this.outputRate);

    if (this.getEstimatedCostUSD() + worstCaseCallCost > this.maxCostUSD) {
      throw new Error(
        `BUDGET_CEILING_RESERVATION_EXCEEDED: Reserving worst-case cost $${worstCaseCallCost.toFixed(6)} for outgoing call ` +
        `would exceed financial ceiling of $${this.maxCostUSD} USD (current: $${this.getEstimatedCostUSD()}). Execution halted.`
      );
    }

    if (this.totalTokensConsumed + this.maxOutputTokensPerCall > this.maxTokens) {
      throw new Error(
        `BUDGET_CEILING_EXCEEDED: Reserving ${this.maxOutputTokensPerCall} output tokens would exceed maximum token ceiling of ${this.maxTokens}. Execution halted.`
      );
    }
  }

  // Post-call resource checks (halts immediately on overshoot)
  recordAndVerifyUsage(trace) {
    const pTokens = trace.provider_usage?.prompt_tokens ?? trace.prompt_tokens ?? 0;
    const cTokens = trace.provider_usage?.candidates_tokens ?? trace.response_tokens ?? 0;
    const thTokens = trace.provider_usage?.thoughts_tokens ?? 0;
    const caTokens = trace.provider_usage?.cached_tokens ?? 0;
    const tTokens = trace.provider_usage?.total_tokens ?? trace.total_tokens ?? (pTokens + cTokens + thTokens);

    if (!this.mockMode && (pTokens === null || cTokens === null)) {
      throw new Error('BUDGET_INSTRUMENTATION_CORRUPTED: Missing provider token usage metadata in non-mock mode. Halting execution.');
    }

    this.promptTokensConsumed += pTokens;
    this.candidatesTokensConsumed += cTokens;
    this.thoughtsTokensConsumed += thTokens;
    this.cachedTokensConsumed += caTokens;
    this.totalTokensConsumed += tTokens;
    this.successfulCalls++;

    if (trace.internal_retries) {
      this.retriedAttempts += trace.internal_retries;
    }

    this.traces.push(trace);

    if (this.sharedBudgetGovernor) {
      this.sharedBudgetGovernor.recordAndVerifyUsage(trace, this.arm);
      return;
    }

    // Fail-closed post-call overshoot detection
    if (this.totalTokensConsumed > this.maxTokens) {
      throw new Error(
        `BUDGET_CEILING_EXCEEDED: Completed provider call overshot maximum token ceiling. Consumed ${this.totalTokensConsumed} tokens (ceiling: ${this.maxTokens}). Execution halted.`
      );
    }

    if (this.getEstimatedCostUSD() > this.maxCostUSD) {
      throw new Error(
        `BUDGET_CEILING_EXCEEDED: Completed provider call overshot maximum financial ceiling. Consumed $${this.getEstimatedCostUSD()} USD (ceiling: $${this.maxCostUSD}). Execution halted.`
      );
    }
  }

  registerProviderAttempt() {
    this.providerAttempts++;
    if (this.sharedBudgetGovernor) {
      this.sharedBudgetGovernor.providerAttempts++;
    }
  }

  // Step 1: Record Pre-Exposure Baseline (t0)
  async establishPreExposureBaseline(initialContext = '') {
    const prompt = `Establish baseline scientific axioms, theoretical priors, and open research questions prior to source exposure.\nInitial Context:\n${initialContext || 'Zero initial exposure. Unconditioned prior state.'}`;
    this.checkPreCallResourceCeilings(prompt);
    this.registerProviderAttempt();

    const episodeId = `Flight-${this.arm}-t0-Baseline`;
    let responseText;

    if (this.mockMode) {
      responseText = `BASELINE t0 ESTABLISHED: Prior state unconditioned. No relational hypotheses asserted. Ready for sequential source exposure.`;
      const trace = {
        episode_id: episodeId,
        prompt_tokens: 45,
        response_tokens: 30,
        total_tokens: 75,
        provider_usage: {
          prompt_tokens: 45,
          candidates_tokens: 30,
          thoughts_tokens: 0,
          cached_tokens: 0,
          total_tokens: 75,
          service_tier: 'mock'
        },
        timestamp: new Date().toISOString()
      };
      this.recordAndVerifyUsage(trace);
    } else {
      try {
        const res = await this.client.invoke({
          systemInstruction: 'You are the TD613 Pre-Exposure Baseline Recorder. Register initial axioms and prior parameter beliefs before document exposure.',
          prompt,
          episodeId
        });
        responseText = res.text;
        this.recordAndVerifyUsage(res.trace);
      } catch (err) {
        this.failedAttempts++;
        throw err;
      }
    }

    const baseline = {
      turn: 0,
      timestamp: new Date().toISOString(),
      raw_output: responseText,
      active_hypotheses: [],
      model_parameters: {}
    };
    this.history.push(baseline);
    return baseline;
  }

  // Step 2: Ingest Single Sequential Document (tk)
  async ingestSequentialDocument(doc, turnIndex) {
    const previousHistorySummary = this.formatHistoryForTurn(turnIndex);
    const episodeId = `Flight-${this.arm}-t${turnIndex}-${doc.id}`;

    // Binary Document Guard: If document is raw binary without authenticated text derivative,
    // abstain explicitly. Do NOT hallucinate, call model, or synthesize false propositions.
    if (doc.is_binary && !doc.content) {
      const abstentionCandidate = {
        candidate_id: `CAND-${doc.id}-BINARY-ABSTAIN`,
        turn: turnIndex,
        document_id: doc.id,
        filename: doc.filename,
        status: 'ABSTAIN_BINARY_WITHOUT_AUTHENTICATED_DERIVATIVE',
        proposition_summary: `ABSTAIN: Document '${doc.filename}' is a raw binary asset (${doc.bytes || (doc.raw_bytes ? doc.raw_bytes.length : 0)} bytes) without an authenticated text derivative. Model ingestion refused.`,
        uncertainty: 'Complete epistemic abstention due to lack of verified text transcription.',
        warrant_class: 'WARRANT_UNPRODUCED',
        evidence_ancestry: {
          physical_byte_spans: [],
          is_binary: true,
          derivative_status: doc.derivative_status || 'RAW_BINARY_PRESERVED_NO_TEXT_DERIVATIVE',
          raw_sha256: doc.sha256
        },
        adjudication_ancestry: {
          evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION',
          rca01_cell: this.arm === 'ARM_2A_MODULAR' ? 'CELL_B_AUTH_DOLL' : 'CELL_A_MATCHED_UNION',
          disposition: 'EPISTEMIC_ABSTENTION_BINARY_PAYLOAD'
        }
      };

      this.candidates.push(abstentionCandidate);
      const turnRecord = {
        turn: turnIndex,
        document_id: doc.id,
        timestamp: new Date().toISOString(),
        raw_output: 'ABSTAIN_BINARY_WITHOUT_AUTHENTICATED_DERIVATIVE',
        candidate_id: abstentionCandidate.candidate_id,
        candidate_status: abstentionCandidate.status
      };
      this.history.push(turnRecord);
      return { turnRecord, candidate: abstentionCandidate };
    }

    let responseText;
    let chamberOutputs = {};

    if (this.arm === 'ARM_2A_MODULAR') {
      // Chamber 1: Pedagogue & Aperture (Order, route burden, observability, rank)
      const c1Prompt = `You are Chamber 1 (Pedagogue & Aperture).
1. PEDAGOGUE: Audit consequence order and route burden of incoming document.
2. APERTURE: Assess observability, parameter identifiability, and noise conditioning.
3. Check for contradictions against prior turns.

Prior History:
${previousHistorySummary}

Incoming Document [${doc.id} - ${doc.filename}]:
${doc.content}

Output structured findings, exact quoted evidence spans, and extracted parameter equations.`;

      this.checkPreCallResourceCeilings(c1Prompt);
      this.registerProviderAttempt();

      let c1Text;
      if (this.mockMode) {
        if (doc.mockChamber1) {
          c1Text = doc.mockChamber1;
        } else {
          c1Text = `CHAMBER 1 AUDIT [${doc.id}]: Consequence order valid. Observability verified. Identified parameters for ${doc.filename}. Contradiction analysis flagged if non-conservative terms appear.`;
        }
        const c1Trace = {
          episode_id: `${episodeId}-Chamber1`,
          prompt_tokens: 120,
          response_tokens: 60,
          total_tokens: 180,
          provider_usage: {
            prompt_tokens: 120,
            candidates_tokens: 60,
            thoughts_tokens: 0,
            cached_tokens: 0,
            total_tokens: 180,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        };
        this.recordAndVerifyUsage(c1Trace);
      } else {
        try {
          const c1Res = await this.client.invoke({
            systemInstruction: 'You are TD613 Chamber 1 (Pedagogue & Aperture). Audit order and observability.',
            prompt: c1Prompt,
            episodeId: `${episodeId}-Chamber1`
          });
          c1Text = c1Res.text;
          this.recordAndVerifyUsage(c1Res.trace);
        } catch (err) {
          this.failedAttempts++;
          throw err;
        }
      }

      // Chamber 2: Atlas & FADT (Coordinate custody, finite quotient descent, candidate proposition)
      const c2Prompt = `You are Chamber 2 (Atlas & FADT).
1. ATLAS: Evaluate coordinate bijections, holonomy parities, and false twins.
2. FADT: Perform finite admissibility descent. If equations resist classification into known finite linear categories, flag as UNANTICIPATED_CANDIDATE.
3. Formulate candidate scientific propositions with exact byte citations.

Chamber 1 Findings:
${c1Text}

Incoming Document Content:
${doc.content}`;

      this.checkPreCallResourceCeilings(c2Prompt);
      this.registerProviderAttempt();

      let c2Text;
      if (this.mockMode) {
        if (doc.mockResponse || doc.mockChamber2) {
          c2Text = doc.mockResponse || doc.mockChamber2;
        } else {
          c2Text = `CHAMBER 2 DESCENT [${doc.id}]:\nPROPOSITION: The system exhibits coordinate correspondence with observable invariants for ${doc.filename}.\nUNCERTAINTY: Parameter identification bounded by measurement window.`;
        }
        const c2Trace = {
          episode_id: `${episodeId}-Chamber2`,
          prompt_tokens: 150,
          response_tokens: 80,
          total_tokens: 230,
          provider_usage: {
            prompt_tokens: 150,
            candidates_tokens: 80,
            thoughts_tokens: 0,
            cached_tokens: 0,
            total_tokens: 230,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        };
        this.recordAndVerifyUsage(c2Trace);
      } else {
        try {
          const c2Res = await this.client.invoke({
            systemInstruction: 'You are TD613 Chamber 2 (Atlas & FADT). Enforce coordinate parities and admissibility descent.',
            prompt: c2Prompt,
            episodeId: `${episodeId}-Chamber2`
          });
          c2Text = c2Res.text;
          this.recordAndVerifyUsage(c2Res.trace);
        } catch (err) {
          this.failedAttempts++;
          throw err;
        }
      }

      chamberOutputs = { chamber1: c1Text, chamber2: c2Text };
      responseText = c2Text;

    } else {
      // Arm 2B: Matched Native Union (Unchambered flat typed context)
      const unionPrompt = `You are an advanced mathematical and physical reasoning system (Matched Native Union).
Analyze the incoming scientific document in the context of all prior sequential evidence.
Identify:
1. Warranted mathematical correspondences, ODEs, and invariants.
2. Contradictions with prior turns and necessary epistemic revisions.
3. Epistemic abstentions if boundary data is incomplete.
4. If findings resist known linear/lumped categories, preserve as UNANTICIPATED_CANDIDATE.

Prior History:
${previousHistorySummary}

Incoming Document [${doc.id} - ${doc.filename}]:
${doc.content}`;

      this.checkPreCallResourceCeilings(unionPrompt);
      this.registerProviderAttempt();

      if (this.mockMode) {
        if (doc.mockResponse) {
          responseText = doc.mockResponse;
        } else {
          responseText = `MATCHED UNION SYNTHESIS [${doc.id}]:\nPROPOSITION: Unified typed context identifies correspondence relations for ${doc.filename}.\nUNCERTAINTY: Incomplete boundary data may perturb asymptotic trajectory.`;
        }
        const unionTrace = {
          episode_id: episodeId,
          prompt_tokens: 180,
          response_tokens: 90,
          total_tokens: 270,
          provider_usage: {
            prompt_tokens: 180,
            candidates_tokens: 90,
            thoughts_tokens: 0,
            cached_tokens: 0,
            total_tokens: 270,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        };
        this.recordAndVerifyUsage(unionTrace);
      } else {
        try {
          const unionRes = await this.client.invoke({
            systemInstruction: 'You are an advanced physical and mathematical reasoner operating over a unified typed research context.',
            prompt: unionPrompt,
            episodeId
          });
          responseText = unionRes.text;
          this.recordAndVerifyUsage(unionRes.trace);
        } catch (err) {
          this.failedAttempts++;
          throw err;
        }
      }
    }

    // Extract Three-Lineage Candidate Record from generated research output
    const candidate = this.extractCandidateRecord(doc, turnIndex, responseText, chamberOutputs);
    this.candidates.push(candidate);

    const turnRecord = {
      turn: turnIndex,
      document_id: doc.id,
      document_sha256: doc.sha256 || computeSha256(doc.content || ''),
      timestamp: new Date().toISOString(),
      raw_output: responseText,
      chamber_outputs: chamberOutputs,
      candidate_id: candidate.candidate_id
    };
    this.history.push(turnRecord);

    return turnRecord;
  }

  // Step 3: Extract Candidate Conforming to Three-Lineage Schema with physical span resolution
  extractCandidateRecord(doc, turnIndex, responseText, chamberOutputs) {
    const candId = `CAND-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const docContent = typeof doc.content === 'string' ? doc.content : '';
    const docSha = doc.sha256 || computeSha256(docContent);

    // 1. Substantive proposition detection from model output
    let candidateProduced = false;
    let extractedProposition = '';
    let extractedUncertainty = 'None declared';
    let physicalByteSpans = [];

    if (responseText && responseText.trim().length > 0) {
      const lower = responseText.toLowerCase();

      // Check for explicit non-assertion, refusal, or content-free response
      const isExplicitNegative = (
        lower.includes('no candidate proposition') ||
        lower.includes('formulate no candidate') ||
        lower.includes('no invariant detected') ||
        lower.includes('no new invariants') ||
        lower.includes('abstain: insufficient') ||
        lower.includes('insufficient data to formulate')
      ) && !lower.includes('proposition:');

      if (!isExplicitNegative) {
        // Look for explicit proposition block in model response
        const propMatch = /(?:PROPOSITION|CANDIDATE PROPOSITION|PROPOSED RELATION|INVARIANT|HYPOTHESIS):\s*([^\n]+(?:\n(?!\n|[A-Z_]+:)[^\n]+)*)/i.exec(responseText);
        if (propMatch && propMatch[1].trim().length > 0) {
          extractedProposition = propMatch[1].trim();
          candidateProduced = true;
        } else {
          // If no explicit header, check if response provides substantive declarative content
          const lines = responseText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('===') && !l.startsWith('CHAMBER'));
          const substantiveLines = lines.filter(l => !l.toLowerCase().includes('prior history') && !l.toLowerCase().includes('incoming document'));
          if (substantiveLines.length > 0) {
            extractedProposition = substantiveLines.join(' ').slice(0, 300);
            candidateProduced = true;
          }
        }

        // Extract model-declared uncertainty or caveats
        const uncMatch = /(?:UNCERTAINTY|CAVEAT|LIMITATION|ASSUMES|VALID ONLY|CONDITION):\s*([^\n]+)/i.exec(responseText);
        if (uncMatch) {
          extractedUncertainty = uncMatch[1].trim();
        }

        // 2. Exact physical byte-span grounding in doc.content (Redpen B-07)
        if (docContent.length > 0 && candidateProduced) {
          // Check for quoted excerpt in model output: QUOTE: "..." or EVIDENCE: "..."
          const quoteMatch = /(?:QUOTE|EVIDENCE|SOURCE SPAN|CITATION):\s*(?:"([^"\n]+)"|'([^'\n]+)'|“([^”\n]+)”)/i.exec(responseText);
          let targetSubstring = quoteMatch ? (quoteMatch[1] || quoteMatch[2] || quoteMatch[3] || '').trim() : null;

          // If no explicit quote, check if any prominent mathematical formula from proposition appears in source
          if (!targetSubstring) {
            const mathMatch = /([a-zA-Z0-9_\(\)'\+\-\*\/\^\=]{6,})/g.exec(extractedProposition);
            if (mathMatch && docContent.includes(mathMatch[1])) {
              targetSubstring = mathMatch[1];
            }
          }

          if (targetSubstring && docContent.includes(targetSubstring)) {
            const charStart = docContent.indexOf(targetSubstring);
            const charEnd = charStart + targetSubstring.length;
            const startByte = Buffer.byteLength(docContent.slice(0, charStart), 'utf8');
            const endByte = Buffer.byteLength(docContent.slice(0, charEnd), 'utf8');
            const spanBytes = Buffer.from(targetSubstring, 'utf8');

            physicalByteSpans.push({
              file: doc.filename,
              start_byte: startByte,
              end_byte: endByte,
              encoding: 'UTF-8',
              span_sha256: computeSha256(spanBytes)
            });
          } else {
            // Ground to full document span if document was textually ingested
            const docBuf = Buffer.from(docContent, 'utf8');
            physicalByteSpans.push({
              file: doc.filename,
              start_byte: 0,
              end_byte: docBuf.length,
              encoding: 'UTF-8',
              span_sha256: docSha
            });
          }
        }
      }
    }

    // 3. Model's own categorization & structural surprise detection (Redpen B-V-04)
    let isUnanticipated = false;
    if (candidateProduced) {
      // A. Lexical resistance or novelty keywords
      const lexicalNovelty = /(?:resists (?:known|standard|linear)|unanticipated (?:candidate|dynamic|outcome)|category failure|anomalous (?:dynamic|structure)|outside (?:standard|known) (?:ontology|framework))/i.test(responseText);

      // B. Structural / Formal mathematical indicators (ontology-neutral):
      // Detects explicit non-commuting commutator [A, B] != 0, non-linear coupling, rank defect, or holonomy divergence
      const formalStructuralNovelty = /(?:\[[A-Za-z0-9_]+,\s*[A-Za-z0-9_]+\]\s*(?:≠|!=|\\neq)|holonomy\s*(?:≠|!=|diverg|defect|phase)|rank\s*(?:defect|nullspace|deficient)|parity\s*(?:defect|broken|violation)|quotient\s*(?:obstruction|fiber\s*splitting))/i.test(extractedProposition) ||
        /(?:\[[A-Za-z0-9_]+,\s*[A-Za-z0-9_]+\]\s*(?:≠|!=|\\neq)|holonomy\s*(?:≠|!=|diverg|defect|phase)|rank\s*(?:defect|nullspace|deficient)|parity\s*(?:defect|broken|violation)|quotient\s*(?:obstruction|fiber\s*splitting))/i.test(responseText);

      // C. Specialist Chamber diagnostic signals (e.g. FADT quotient obstruction or Atlas holonomy divergence)
      const chamberStructuralNovelty = Boolean(
        chamberOutputs && (
          chamberOutputs.fadt?.admissibility_descent_failure === true ||
          chamberOutputs.fadt?.irreducible_gap === true ||
          chamberOutputs.atlas?.holonomy_parity === false ||
          chamberOutputs.atlas?.quotient_obstruction === true
        )
      );

      isUnanticipated = Boolean(lexicalNovelty || formalStructuralNovelty || chamberStructuralNovelty);
    }

    // 4. Status and Warrant determination at generation time
    let status;
    let warrantClass;

    if (!candidateProduced) {
      status = 'NO_SUBSTANTIVE_CANDIDATE';
      warrantClass = 'WARRANT_UNPRODUCED';
      extractedProposition = 'NO_SUBSTANTIVE_CANDIDATE_GENERATED';
      physicalByteSpans = [];
    } else if (isUnanticipated) {
      status = 'UNANTICIPATED_CANDIDATE';
      warrantClass = 'WARRANT_PENDING_EVALUATION';
    } else {
      status = 'PROPOSED';
      warrantClass = 'WARRANT_PENDING_EVALUATION';
    }

    return {
      candidate_id: candId,
      timestamp: new Date().toISOString(),
      status,
      warrant_class: warrantClass,
      proposition_summary: extractedProposition,
      uncertainty: extractedUncertainty,
      evidence_ancestry: {
        source_documents: [
          {
            filename: doc.filename,
            sha256: docSha,
            author_provenance: doc.author_provenance || 'Unknown'
          }
        ],
        physical_byte_spans: physicalByteSpans,
        mathematical_premises: [`Turn ${turnIndex} exposure of ${doc.filename}`],
        source_chronology_order: turnIndex
      },
      presentation_ancestry: {
        generating_arm: this.arm,
        representation_modality: this.arm === 'ARM_2A_MODULAR' ? 'DOLLHOUSE_PARATACTIC' : 'NEUTRAL_STANDARD_MATH',
        presentation_timing: 'PRE_GENERATION_LENS',
        context_management_strategy: this.contextStrategy,
        context_projection_loss_declaration: {
          preserved_fields: ['candidate_propositions', 'parameter_equations', 'model_declared_uncertainty', 'turn_status'],
          projected_away_fields: ['raw_chunk_narrative', 'intermediate_reasoning_prose', 'document_formatting', 'unquoted_source_context'],
          is_lossless: false,
          epistemic_justification: 'Bounded prompt projection focused on proposition continuity while preventing quadratic token growth.'
        },
        specialist_scaffolding: chamberOutputs || {},
        scaffolding_metaphors_introduced: []
      },
      adjudication_ancestry: {
        evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION',
        scoring_rule_version: 'v1.0-preflight',
        rca01_cell: this.arm === 'ARM_2A_MODULAR' ? 'CELL_B_AUTH_DOLL' : 'CELL_A_AUTH_NEUT',
        rca01_evaluation_vector: {
          discovery_occurrence: candidateProduced ? 'PENDING_EVALUATION' : 'UNPRODUCED',
          mathematical_warrant: 'PENDING_EVALUATION',
          causal_contribution: 'PENDING_EVALUATION',
          novelty: 'PENDING_EVALUATION',
          instrument_integrity: 'PENDING_EVALUATION',
          claim_status: candidateProduced ? (isUnanticipated ? 'UNANTICIPATED_CANDIDATE' : 'PROPOSED_CANDIDATE') : 'NO_CANDIDATE'
        },
        rca01_outcome_archetypes: [],
        unblinding_phase: 'BLINDED_PENDING_UNBLINDING',
        dissent_recorded: false,
        adjudication_receipt_ref: 'PENDING_INDEPENDENT_EVALUATION'
      }
    };
  }

  // Step 4: Export Complete Raw Research Ledger with exact provider token accounting
  exportResearchLedger() {
    return {
      schema: 'td613.experiment-b.heterogeneous-flight-ledger/v1',
      timestamp: new Date().toISOString(),
      arm: this.arm,
      model: this.client ? this.client.model : this.model,
      context_strategy: this.contextStrategy,
      context_projection_declaration: {
        is_lossless: false,
        classification: 'DECLARED_LOSSY_PROJECTION_PROPOSITION_FOCUS'
      },
      budget_ceilings: {
        max_calls: this.maxCalls,
        max_tokens: this.maxTokens,
        max_cost_usd: this.maxCostUSD
      },
      provider_accounting: {
        total_provider_attempts: this.providerAttempts,
        successful_calls: this.successfulCalls,
        retried_attempts: this.retriedAttempts,
        failed_attempts: this.failedAttempts,
        total_tokens_consumed: this.totalTokensConsumed,
        prompt_tokens: this.promptTokensConsumed,
        candidates_tokens: this.candidatesTokensConsumed,
        thoughts_tokens: this.thoughtsTokensConsumed,
        cached_tokens: this.cachedTokensConsumed,
        estimated_expenditure_usd: this.getEstimatedCostUSD()
      },
      token_accounting: {
        total_tokens_consumed: this.totalTokensConsumed,
        prompt_tokens: this.promptTokensConsumed,
        candidates_tokens: this.candidatesTokensConsumed,
        thoughts_tokens: this.thoughtsTokensConsumed,
        cached_tokens: this.cachedTokensConsumed
      },
      turn_count: this.history.length,
      candidate_count: this.candidates.length,
      history: this.history,
      candidates: this.candidates,
      traces: this.traces
    };
  }
}
