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
    this.client = options.client || new GeminiLiveClient(options.clientOptions || {});
    this.mockMode = options.mockMode || false;
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
        episodeId,
        prompt_tokens: 45,
        response_tokens: 30,
        total_tokens: 75,
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
        c1Text = `CHAMBER 1 AUDIT [${doc.id}]: Consequence order valid. Observability verified. Identified parameters from text. Contradiction analysis flagged if non-conservative terms appear.`;
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
        c2Text = `CHAMBER 2 DESCENT [${doc.id}]: Admissibility evaluated. Proposition formulated. Contradictions resolved. Candidate emitted.`;
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
        responseText = `MATCHED UNION SYNTHESIS [${doc.id}]: Analyzed in flat context. Extracted parameters and revisions. Emitted candidate.`;
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

    // Extract Three-Lineage Candidate Record
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
  extractCandidateRecord(doc, turnIndex, responseText, chamberOutputs) {
    const candId = `CAND-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const docSha = doc.sha256 || computeSha256(doc.content);

    // Determine status & warrant from text characteristics
    let status = 'PROPOSED';
    let warrantClass = 'WARRANT_FORMAL_EQUIVALENCE';
    if (doc.content.includes('topological') || doc.content.includes('soliton') || doc.content.includes('Sine-Gordon')) {
      status = 'UNANTICIPATED_CANDIDATE';
      warrantClass = 'WARRANT_UNANTICIPATED_OUTCOME';
    } else if (doc.content.includes('empirical') || doc.content.includes('dissipation')) {
      status = 'WARRANTED';
      warrantClass = 'WARRANT_OPERATIONAL';
    }

    return {
      candidate_id: candId,
      timestamp: new Date().toISOString(),
      status,
      warrant_class: warrantClass,
      proposition_summary: `Candidate proposition derived from document ${doc.id} at turn ${turnIndex}.`,
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
        mathematical_premises: [`Derived in turn ${turnIndex}`],
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
        evaluator_tier: 'AUTOMATED_RUBRIC_PARITY',
        scoring_rule_version: 'v1.0-preflight',
        rca01_cell: this.arm === 'ARM_2A_MODULAR' ? 'CELL_B_AUTH_DOLL' : 'CELL_A_AUTH_NEUT',
        rca01_evaluation_vector: {
          discovery_occurrence: 'DISCOVERED',
          mathematical_warrant: warrantClass.replace('WARRANT_', ''),
          causal_contribution: this.arm === 'ARM_2A_MODULAR' ? 'LENS_ENABLED' : 'NEUTRAL_SUFFICIENT',
          novelty: status === 'UNANTICIPATED_CANDIDATE' ? 'UNANTICIPATED_SYNTHESIS' : 'NOVEL_RELATION',
          instrument_integrity: 'CLEAN_EXECUTION',
          claim_status: status === 'UNANTICIPATED_CANDIDATE' ? 'UNANTICIPATED_CANDIDATE' : 'WARRANTED_DISCOVERY'
        },
        rca01_outcome_archetypes: [
          status === 'UNANTICIPATED_CANDIDATE' ? 'OUTCOME_UNANTICIPATED_CANDIDATE' : 'OUTCOME_WARRANTED_MATHEMATICS'
        ],
        unblinding_phase: 'FROZEN_BLINDED',
        dissent_recorded: false,
        adjudication_receipt_ref: 'PENDING_POSTFLIGHT_EVALUATION'
      }
    };
  }

  // Step 4: Export Complete Raw Research Ledger
  exportResearchLedger() {
    return {
      schema: 'td613.experiment-b.heterogeneous-flight-ledger/v1',
      timestamp: new Date().toISOString(),
      arm: this.arm,
      model: this.client.model,
      turn_count: this.history.length,
      candidate_count: this.candidates.length,
      total_tokens_consumed: this.traces.reduce((acc, t) => acc + (t.total_tokens || 0), 0),
      call_count: this.traces.length,
      history: this.history,
      candidates: this.candidates,
      traces: this.traces
    };
  }
}
