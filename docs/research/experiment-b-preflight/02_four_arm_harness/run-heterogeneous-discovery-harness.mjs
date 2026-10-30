/**
 * run-heterogeneous-discovery-harness.mjs
 *
 * Minimal Generalized Heterogeneous Discovery Harness for Experiment B.
 * Implements open multi-turn sequence exposure, pre-exposure baseline recording,
 * contradiction handling, epistemic revision, and Three-Lineage candidate extraction.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import crypto from 'node:crypto';
import { GeminiLiveClient } from './gemini-live-client.mjs';

function computeSha256(text) {
  return crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

export class HeterogeneousDiscoveryHarness {
  constructor(options = {}) {
    this.arm = options.arm || 'ARM_2A_MODULAR';
    this.mockMode = options.mockMode ?? true;
    this.allowLivePaidInference = options.allowLivePaidInference || false;

    // Fail-closed provider custody gate: prevent silent live inference or data transmission
    if (!this.mockMode) {
      const authorized = this.allowLivePaidInference === true && process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED === 'true';
      if (!authorized) {
        throw new Error(
          'LIVE_INFERENCE_BLOCKED_BY_PREFLIGHT_CUSTODY_GATE: Live model inference and paid credit consumption are strictly prohibited during preflight without explicit allowLivePaidInference=true and TD613_FLIGHT_EXECUTION_AUTHORIZED=true.'
        );
      }
      this.client = options.client || new GeminiLiveClient(options.clientOptions || {});
    } else {
      this.client = options.client || null;
    }

    this.history = [];
    this.candidates = [];
    this.traces = [];
  }

  // Step 1: Record Pre-Exposure Baseline (t0)
  async establishPreExposureBaseline(initialContext = '') {
    const episodeId = `Flight-${this.arm}-t0-Baseline`;
    const prompt = `Establish baseline scientific axioms, theoretical priors, and open research questions prior to source exposure.\nInitial Context:\n${initialContext || 'Zero initial exposure. Unconditioned prior state.'}`;

    let responseText;
    if (this.mockMode) {
      responseText = `BASELINE t0 ESTABLISHED: Prior state unconditioned. No relational hypotheses asserted. Ready for sequential source exposure.`;
      this.traces.push({
        episode_id: episodeId,
        prompt_tokens: 45,
        response_tokens: 30,
        total_tokens: 75,
        provider_usage: {
          prompt_tokens: 45,
          candidates_tokens: 30,
          thoughts_tokens: 0,
          total_tokens: 75,
          service_tier: 'mock'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      const res = await this.client.invoke({
        systemInstruction: 'You are the TD613 Pre-Exposure Baseline Recorder. Register initial axioms and prior parameter beliefs before document exposure.',
        prompt,
        episodeId
      });
      responseText = res.text;
      this.traces.push(res.trace);
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
    const episodeId = `Flight-${this.arm}-t${turnIndex}-${doc.id}`;
    const previousHistorySummary = this.history.map(h => `Turn ${h.turn}: ${h.raw_output.slice(0, 150)}...`).join('\n');

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

Output structured findings and extracted parameter equations.`;

      let c1Text;
      if (this.mockMode) {
        if (doc.mockChamber1) {
          c1Text = doc.mockChamber1;
        } else {
          c1Text = `CHAMBER 1 AUDIT [${doc.id}]: Consequence order valid. Observability verified. Identified parameters for ${doc.filename}. Contradiction analysis flagged if non-conservative terms appear.`;
        }
        this.traces.push({
          episode_id: `${episodeId}-Chamber1`,
          prompt_tokens: 120,
          response_tokens: 60,
          total_tokens: 180,
          provider_usage: {
            prompt_tokens: 120,
            candidates_tokens: 60,
            thoughts_tokens: 0,
            total_tokens: 180,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        });
      } else {
        const c1Res = await this.client.invoke({
          systemInstruction: 'You are TD613 Chamber 1 (Pedagogue & Aperture). Audit order and observability.',
          prompt: c1Prompt,
          episodeId: `${episodeId}-Chamber1`
        });
        c1Text = c1Res.text;
        this.traces.push(c1Res.trace);
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

      let c2Text;
      if (this.mockMode) {
        if (doc.mockResponse || doc.mockChamber2) {
          c2Text = doc.mockResponse || doc.mockChamber2;
        } else {
          c2Text = `CHAMBER 2 DESCENT [${doc.id}]:\nPROPOSITION: The system exhibits coordinate correspondence with observable invariants for ${doc.filename}.\nUNCERTAINTY: Parameter identification bounded by measurement window.`;
        }
        this.traces.push({
          episode_id: `${episodeId}-Chamber2`,
          prompt_tokens: 150,
          response_tokens: 80,
          total_tokens: 230,
          provider_usage: {
            prompt_tokens: 150,
            candidates_tokens: 80,
            thoughts_tokens: 0,
            total_tokens: 230,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        });
      } else {
        const c2Res = await this.client.invoke({
          systemInstruction: 'You are TD613 Chamber 2 (Atlas & FADT). Enforce coordinate parities and admissibility descent.',
          prompt: c2Prompt,
          episodeId: `${episodeId}-Chamber2`
        });
        c2Text = c2Res.text;
        this.traces.push(c2Res.trace);
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

      if (this.mockMode) {
        if (doc.mockResponse) {
          responseText = doc.mockResponse;
        } else {
          responseText = `MATCHED UNION SYNTHESIS [${doc.id}]:\nPROPOSITION: Unified typed context identifies correspondence relations for ${doc.filename}.\nUNCERTAINTY: Incomplete boundary data may perturb asymptotic trajectory.`;
        }
        this.traces.push({
          episode_id: episodeId,
          prompt_tokens: 180,
          response_tokens: 90,
          total_tokens: 270,
          provider_usage: {
            prompt_tokens: 180,
            candidates_tokens: 90,
            thoughts_tokens: 0,
            total_tokens: 270,
            service_tier: 'mock'
          },
          timestamp: new Date().toISOString()
        });
      } else {
        const unionRes = await this.client.invoke({
          systemInstruction: 'You are an advanced physical and mathematical reasoner operating over a unified typed research context.',
          prompt: unionPrompt,
          episodeId
        });
        responseText = unionRes.text;
        this.traces.push(unionRes.trace);
      }
    }

    // Extract Three-Lineage Candidate Record from generated research output
    const candidate = this.extractCandidateRecord(doc, turnIndex, responseText, chamberOutputs);
    this.candidates.push(candidate);

    const turnRecord = {
      turn: turnIndex,
      document_id: doc.id,
      document_sha256: doc.sha256 || computeSha256(doc.content),
      timestamp: new Date().toISOString(),
      raw_output: responseText,
      chamber_outputs: chamberOutputs,
      candidate_id: candidate.candidate_id
    };
    this.history.push(turnRecord);

    return turnRecord;
  }

  // Step 3: Extract Candidate Conforming to Three-Lineage Schema
  // Evaluates solely the generated research encounter output (NOT source keywords)
  extractCandidateRecord(doc, turnIndex, responseText, chamberOutputs) {
    const candId = `CAND-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const docSha = doc.sha256 || computeSha256(doc.content);

    // 1. Substantive proposition detection from model output
    let candidateProduced = false;
    let extractedProposition = '';
    let extractedUncertainty = 'None declared';

    if (responseText && responseText.trim().length > 0) {
      const lower = responseText.toLowerCase();

      // Check for explicit non-assertion or refusal
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
          // If no explicit header, check if the response provides substantive declarative content (not merely echoing instructions)
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
      }
    }

    // 2. Model's own categorization (NOT triggered by source vocabulary)
    // Checks whether the model output explicitly states that the phenomenon resists known linear categories
    let isUnanticipated = false;
    if (candidateProduced) {
      isUnanticipated = /(?:resists (?:known|standard|linear)|unanticipated (?:candidate|dynamic|outcome)|category failure|anomalous (?:dynamic|structure)|outside (?:standard|known) (?:ontology|framework))/i.test(responseText);
    }

    // 3. Status and Warrant determination at generation time
    let status;
    let warrantClass;

    if (!candidateProduced) {
      status = 'NO_SUBSTANTIVE_CANDIDATE';
      warrantClass = 'WARRANT_UNPRODUCED';
      extractedProposition = 'NO_SUBSTANTIVE_CANDIDATE_GENERATED';
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
      evidence_ancestry: {
        source_documents: [
          {
            filename: doc.filename,
            sha256: docSha,
            author_provenance: doc.author_provenance || 'Unknown'
          }
        ],
        physical_byte_spans: [
          {
            file: doc.filename,
            start_byte: 0,
            end_byte: Buffer.from(doc.content, 'utf8').length,
            encoding: 'UTF-8',
            span_sha256: docSha
          }
        ],
        mathematical_premises: [`Turn ${turnIndex} exposure of ${doc.filename}`],
        source_chronology_order: turnIndex
      },
      presentation_ancestry: {
        generating_arm: this.arm,
        representation_modality: this.arm === 'ARM_2A_MODULAR' ? 'DOLLHOUSE_PARATACTIC' : 'NEUTRAL_STANDARD_MATH',
        presentation_timing: 'PRE_GENERATION_LENS',
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
    const totalTokens = this.traces.reduce((acc, t) => acc + (t.provider_usage?.total_tokens ?? t.total_tokens ?? 0), 0);
    const promptTokens = this.traces.reduce((acc, t) => acc + (t.provider_usage?.prompt_tokens ?? t.prompt_tokens ?? 0), 0);
    const candidatesTokens = this.traces.reduce((acc, t) => acc + (t.provider_usage?.candidates_tokens ?? t.candidates_tokens ?? 0), 0);

    return {
      schema: 'td613.experiment-b.heterogeneous-flight-ledger/v1',
      timestamp: new Date().toISOString(),
      arm: this.arm,
      model: this.client ? this.client.model : 'source-free-mock-kernel',
      turn_count: this.history.length,
      candidate_count: this.candidates.length,
      token_accounting: {
        total_tokens_consumed: totalTokens,
        prompt_tokens: promptTokens,
        candidates_tokens: candidatesTokens
      },
      call_count: this.traces.length,
      history: this.history,
      candidates: this.candidates,
      traces: this.traces
    };
  }
}
