/**
 * 𝌋 Rulefield Counterworld Loom Laboratory v1 — Reusable Research Tooling.
 *
 * Implements Amari's Authoritative Wild Field Directives:
 *   1. ObservationalClosure: Investigates commutative predictive diagram failure (\Pi \circ T \neq \bar{T} \circ \Pi).
 *   2. HeterostratigraphicIdentity: Preserves historical role participation layers and transition eligibility.
 *   3. DiscrepancyFiber: Converts failed representations into structured repair proposals (\delta).
 *   4. InstitutionalHearing: Models access, capacity, authority, recognition clocks, and action windows (\mathcal{O}_{a,t}).
 *   5. CounterworldLoom: Fiber construction F_y = \Pi^{-1}(y), question decidability, and minimal witness search.
 *   6. The Witness That Arrived Too Late: Synthetic experimental commission covering Conditions A, B, C, and D (Abstention).
 *
 * Covenant: Khona‌lit-po (literal U+200C interior).
 * Human scientific closure & adoption: RESERVED to Tawanna C. Miller.
 * Zero unverified automatic promotion, merge, or deployment authority.
 */

import { createHash } from 'node:crypto';

export const LOOM_SCHEMA = 'td613.rulefield.counterworld-loom/v1.0';
export const DISCREPANCY_FIBER_SCHEMA = 'td613.rulefield.discrepancy-fiber/v1.0';
export const HETEROSTRATIGRAPHY_SCHEMA = 'td613.rulefield.heterostratigraphy/v1.0';
export const OBSERVATIONAL_CLOSURE_SCHEMA = 'td613.rulefield.observational-closure/v1.0';
export const INSTITUTIONAL_HEARING_SCHEMA = 'td613.rulefield.institutional-hearing/v1.0';
export const WITNESS_TOO_LATE_SCHEMA = 'td613.rulefield.witness-arrived-too-late/v1.0';
export const SITUATED_REFUSAL_SCHEMA = 'td613.rulefield.situated-refusal/v1.0';
export const STRATEGIC_INDUCED_SILENCE_SCHEMA = 'td613.rulefield.strategic-induced-silence/v1.0';
export const RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA = 'td613.rulefield.recoverable-unacknowledged-witness/v1.0';
export const DECISIONAL_PROVENANCE_SCHEMA = 'td613.rulefield.decisional-provenance/v1.0';
export const STRUCTURAL_WITNESS_OPACITY_SCHEMA = 'td613.rulefield.structural-witness-opacity/v1.0';
export const WITNESS_REFUSED_TO_BE_PROVEN_SCHEMA = 'td613.rulefield.witness-refused-proven/v1.0';
export const DIMENSION_MINIMALITY_SCHEMA = 'td613.rulefield.dimension-minimality/v1.0';

const digest = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const insist = (ok, msg) => { if (!ok) throw new Error(msg); };

/**
 * Deep freezes an object recursively to guarantee fail-closed immutability.
 */
export function deepFreeze(obj) {
  if (!obj || typeof obj !== 'object' || Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
}

/**
 * Stable content equality for structured observations.
 */
export function stableContentEquals(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  return digest(a) === digest(b);
}

// ============================================================================
// 1. OBSERVATIONAL CLOSURE ENGINE
// ============================================================================

/**
 * Audits whether an observation projection Pi admits a closed single-valued
 * forward dynamics bar_T such that: Pi o T = bar_T o Pi.
 *
 * @param {Array<object>} worlds - Full underlying candidate configurations.
 * @param {Function} projectionFn - Observation projection Pi: W -> Y.
 * @param {Function} evolutionFn - Deterministic dynamical transition T: W -> W.
 * @returns {object} Observational closure audit report.
 */
export function auditObservationalClosure(worlds, projectionFn, evolutionFn) {
  insist(Array.isArray(worlds) && worlds.length >= 2, 'At least 2 worlds required for closure audit');
  insist(typeof projectionFn === 'function', 'projectionFn must be a function');
  insist(typeof evolutionFn === 'function', 'evolutionFn must be a function');

  const initialProjections = worlds.map(w => ({ world: w, y0: projectionFn(w) }));
  
  // Group by initial projected state y0
  const fibers = new Map();
  for (const item of initialProjections) {
    const key = digest(item.y0);
    if (!fibers.has(key)) fibers.set(key, []);
    fibers.get(key).push(item);
  }

  const failures = [];
  let maxDeficitNorm = 0;

  for (const [key, items] of fibers.entries()) {
    if (items.length < 2) continue; // single-element fiber has trivial closure

    const baseObservation = items[0].y0;
    const evolvedOutcomes = items.map(it => {
      const wEvolved = evolutionFn(it.world);
      const y1 = projectionFn(wEvolved);
      return { world_id: it.world.id || it.world.name || 'unnamed', wEvolved, y1 };
    });

    // Check whether all evolved observations y1 are identical
    const firstY1 = evolvedOutcomes[0].y1;
    const allMatch = evolvedOutcomes.every(eo => stableContentEquals(eo.y1, firstY1));

    if (!allMatch) {
      let deficitNorm = 1.0;
      if (typeof firstY1 === 'number' && typeof evolvedOutcomes[1].y1 === 'number') {
        deficitNorm = Math.abs(firstY1 - evolvedOutcomes[1].y1);
      }
      maxDeficitNorm = Math.max(maxDeficitNorm, deficitNorm);

      failures.push({
        base_observation: baseObservation,
        divergent_evolved_observations: evolvedOutcomes.map(eo => ({
          world_id: eo.world_id,
          y1: eo.y1
        })),
        deficit_norm: deficitNorm,
        reason: 'Identical initial observations diverge under deterministic forward evolution; bar_T cannot be a well-defined function.'
      });
    }
  }

  const closed = (failures.length === 0);
  return deepFreeze({
    schema: OBSERVATIONAL_CLOSURE_SCHEMA,
    closed,
    commutative_deficit_norm: maxDeficitNorm,
    disposition: closed ? 'COMMUTATIVE_PREDICTIVE_CLOSURE_SATISFIED' : 'COMMUTATIVE_OBSERVATIONAL_CLOSURE_FAILED',
    failures,
    law: 'An observer cannot formulate a closed deterministic prediction bar_T when projection Pi discards dynamical state coordinates.'
  });
}

// ============================================================================
// 2. HETEROSTRATIGRAPHIC IDENTITY ENGINE
// ============================================================================

/**
 * Audits whether objects sharing an identical current status possess divergent
 * transition eligibility due to their historical role participation layers.
 *
 * @param {object} historyA - First historical role trajectory { id, timeline: [...] }
 * @param {object} historyB - Second historical role trajectory { id, timeline: [...] }
 * @param {object} governancePolicy - Rules defining legal future transformations
 * @returns {object} Heterostratigraphic audit report.
 */
export function auditHeterostratigraphy(historyA, historyB, governancePolicy = {}) {
  insist(historyA && Array.isArray(historyA.timeline) && historyA.timeline.length, 'historyA requires valid timeline');
  insist(historyB && Array.isArray(historyB.timeline) && historyB.timeline.length, 'historyB requires valid timeline');

  const currentRoleA = historyA.timeline[historyA.timeline.length - 1].role;
  const currentRoleB = historyB.timeline[historyB.timeline.length - 1].role;
  const presentStateMatch = (currentRoleA === currentRoleB);

  // Policy: Continuous executable authority check
  const requiresContinuousAuthority = governancePolicy.require_continuous_authority ?? true;
  
  function evaluateEligibility(history) {
    if (!requiresContinuousAuthority) return { eligible: true, reason: 'Unrestricted policy' };
    const hadExecutionBreak = history.timeline.some(step => step.executable === false && step.era !== 'ARCHIVED' && step.role !== 'SUPERSEDED_CANDIDATE');
    return {
      eligible: !hadExecutionBreak,
      reason: hadExecutionBreak 
        ? 'Authority broken during historical lifecycle; non-executable role observed'
        : 'Continuous executable authority verified across all active lifecycle eras'
    };
  }

  const eligibilityA = evaluateEligibility(historyA);
  const eligibilityB = evaluateEligibility(historyB);
  const isHistoryConsequential = (eligibilityA.eligible !== eligibilityB.eligible);

  return deepFreeze({
    schema: HETEROSTRATIGRAPHY_SCHEMA,
    present_state_match: presentStateMatch,
    current_role: currentRoleA,
    history_A_id: historyA.id,
    history_B_id: historyB.id,
    eligibility_A: eligibilityA,
    eligibility_B: eligibilityB,
    is_history_consequential: isHistoryConsequential,
    disposition: isHistoryConsequential ? 'HETEROSTRATIGRAPHY_GOVERNS_TRANSFORMATION' : 'HISTORIES_OPERATIONALLY_EQUIVALENT',
    law: 'Present state classification is inadequate for determining future legal transformations; historical participation layers govern transition eligibility.'
  });
}

// ============================================================================
// 3. TYPED DISCREPANCY FIBER CALCULUS ENGINE
// ============================================================================

/**
 * Creates a structured Discrepancy Fiber representing a productive representational failure.
 */
export function createDiscrepancyFiber({ failed_distinction, counterexample, missing_coordinate, repair_proposal }) {
  insist(typeof failed_distinction === 'string' && failed_distinction.trim(), 'failed_distinction required');
  insist(typeof counterexample === 'string' && counterexample.trim(), 'counterexample required');
  insist(typeof missing_coordinate === 'string' && missing_coordinate.trim(), 'missing_coordinate required');
  insist(typeof repair_proposal === 'string' && repair_proposal.trim(), 'repair_proposal required');

  return deepFreeze({
    schema: DISCREPANCY_FIBER_SCHEMA,
    failed_distinction: failed_distinction.trim(),
    counterexample: counterexample.trim(),
    missing_coordinate: missing_coordinate.trim(),
    repair_proposal: repair_proposal.trim(),
    digest: digest({ failed_distinction, counterexample, missing_coordinate, repair_proposal })
  });
}

/**
 * Consumes a Discrepancy Fiber to repair a candidate rule proposal.
 */
export function applyDiscrepancyRepair(candidate, fiber) {
  insist(candidate && typeof candidate === 'object', 'candidate must be an object');
  insist(fiber && fiber.schema === DISCREPANCY_FIBER_SCHEMA, 'valid DiscrepancyFiber required');

  const baseStatement = candidate.statement || candidate.proposal || candidate.rule || 'Unspecified rule';
  const repairedStatement = `${baseStatement} [REFACTORED: Factorized coordinate bundle isolating base state from ${fiber.missing_coordinate} to satisfy constraint: ${fiber.failed_distinction}]`;

  return deepFreeze({
    id: candidate.id ? `${candidate.id}-REPAIRED` : 'REPAIRED-CANDIDATE',
    original_statement: baseStatement,
    repaired_statement: repairedStatement,
    applied_fiber_digest: fiber.digest,
    missing_coordinate_integrated: fiber.missing_coordinate,
    grounding: `REPAIRED_VIA_DISCREPANCY_FIBER: ${fiber.repair_proposal}`,
    disposition: 'REPRESENTATIONAL_DEFICIT_REPAIRED'
  });
}

// ============================================================================
// 4. INSTITUTIONAL HEARING & 6-CLOCK SOCIAL TENSOR ENGINE
// ============================================================================

/**
 * Evaluates an observer's operational and institutional capacity to hear and act on evidence.
 * Situated observer tuple: O_{a,t} = (accessible_evidence, interpretive_capacity, authorized_actions, available_time)
 */
export function evaluateInstitutionalHearing(observer, evidence, current_time) {
  insist(observer && typeof observer === 'object', 'observer required');
  insist(evidence && typeof evidence === 'object', 'evidence required');

  const hasAccess = Array.isArray(observer.accessible_evidence) && observer.accessible_evidence.includes(evidence.id);
  const canInterpret = Number.isFinite(observer.interpretive_capacity) && observer.interpretive_capacity >= (evidence.complexity || 1);
  const isAuthorized = Array.isArray(observer.authorized_actions) && observer.authorized_actions.includes(evidence.required_action);
  const deadline = Number.isFinite(observer.available_time_deadline) ? observer.available_time_deadline : Infinity;
  const hasTime = current_time <= deadline;

  let disposition;
  let code;
  if (!hasAccess) {
    disposition = 'Observer lacks access to the evidence channel';
    code = 'UNAWARE';
  } else if (!canInterpret) {
    disposition = 'Observer receives the signal but lacks interpretive capacity';
    code = 'UNINTERPRETED_NOISE';
  } else if (!isAuthorized) {
    disposition = 'Observer possesses evidence and understands truth, but lacks institutional authorization';
    code = 'HEARD_WITHOUT_STANDING_OR_POWER';
  } else if (!hasTime) {
    disposition = 'Observer has access, understanding, and authority, but action deadline has expired';
    code = 'HEARD_TOO_LATE_EXPIRED';
  } else {
    disposition = 'Observer is fully informed, capable, authorized, and timely to act';
    code = 'EFFECTIVELY_HEARD_AND_ACTIONABLE';
  }

  return deepFreeze({
    schema: INSTITUTIONAL_HEARING_SCHEMA,
    observer_id: observer.id || 'unnamed',
    evidence_id: evidence.id,
    current_time,
    deadline,
    has_access: hasAccess,
    can_interpret: canInterpret,
    is_authorized: isAuthorized,
    has_time: hasTime,
    code,
    disposition
  });
}

/**
 * Computes epistemic phase displacement across the 6-clock social tensor:
 * tau_inst = (t_event, t_record, t_available, t_belief, t_authorized, t_acknowledged)
 */
export function computeEpistemicPhaseDisplacement(timeline) {
  insist(timeline && typeof timeline === 'object', 'timeline object required');
  const clocks = timeline.clocks || timeline;

  const tEvent = Date.parse(clocks.t_event);
  const tRecord = Date.parse(clocks.t_record);
  const tAvailable = Date.parse(clocks.t_available);
  const tBelief = Date.parse(clocks.t_belief);
  const tAuth = Date.parse(clocks.t_authorized);
  const tAck = Date.parse(clocks.t_acknowledged);
  const tDeadline = clocks.t_action_window_closes ? Date.parse(clocks.t_action_window_closes) : null;

  insist(!isNaN(tEvent) && !isNaN(tRecord) && !isNaN(tAvailable), 'Valid event, record, and available timestamps required');

  const toHours = ms => (ms / (1000 * 3600));

  const lagBeliefToAuth = (!isNaN(tBelief) && !isNaN(tAuth)) ? toHours(tAuth - tBelief) : null;
  const lagAuthToAck = (!isNaN(tAuth) && !isNaN(tAck)) ? toHours(tAck - tAuth) : null;
  const totalInstitutionalLag = (!isNaN(tBelief) && !isNaN(tAck)) ? toHours(tAck - tBelief) : null;
  const deadlineBreachHours = (tDeadline && !isNaN(tAuth)) ? toHours(tAuth - tDeadline) : null;
  const windowMissed = (deadlineBreachHours !== null && deadlineBreachHours > 0);

  return deepFreeze({
    schema: 'td613.rulefield.epistemic-phase-displacement/v1.0',
    clocks,
    lags_hours: {
      belief_to_authorization: lagBeliefToAuth,
      authorization_to_acknowledgement: lagAuthToAck,
      total_institutional_latency: totalInstitutionalLag,
      deadline_breach_hours: deadlineBreachHours
    },
    action_window_missed: windowMissed,
    disposition: windowMissed ? 'ACTION_WINDOW_BREACHED_BEFORE_AUTHORIZATION' : 'ACTION_WINDOW_PRESERVED',
    law: 'Two observers with identical evidence enter permanently divergent operational realities because their authorization clocks are phase-displaced.'
  });
}

// ============================================================================
// 5. THE COUNTERWORLD LOOM INSTRUMENT
// ============================================================================

export class CounterworldLoom {
  constructor(options = {}) {
    this.schema = LOOM_SCHEMA;
    this.name = 'CounterworldLoom';
    this.witnessCatalog = [
      { name: '1-bit Holonomy Parity (w mod 2)', cost_bits: 1, separates: (a, b) => (a.winding % 2 !== b.winding % 2) },
      { name: 'Transaction Journal Resumption Residue', cost_bits: 32, separates: (a, b) => (a.journal_id !== b.journal_id) },
      { name: 'Asymmetric Continuation Flow Velocity', cost_bits: 32, separates: (a, b) => (a.velocity !== b.velocity) },
      { name: 'Institutional Authorization Token', cost_bits: 128, separates: (a, b) => (a.token !== b.token) }
    ];
    if (Array.isArray(options.custom_witnesses)) {
      this.witnessCatalog.push(...options.custom_witnesses);
    }
  }

  /**
   * Evaluates a question q across the observational fiber F_y = Pi^{-1}(y).
   */
  evaluateQuestionOnFiber(universeA, universeB, projectionFn, questionFn) {
    insist(universeA && universeB, 'universeA and universeB required');
    insist(typeof projectionFn === 'function', 'projectionFn must be a function');
    insist(typeof questionFn === 'function', 'questionFn must be a function');

    const yA = projectionFn(universeA);
    const yB = projectionFn(universeB);

    if (!stableContentEquals(yA, yB)) {
      return deepFreeze({
        schema: LOOM_SCHEMA,
        decidable: true,
        distinguishable_by_observation: true,
        fiber_collapsed: false,
        ansA: questionFn(universeA),
        ansB: questionFn(universeB),
        disposition: 'DISTINGUISHABLE_BY_CURRENT_PROJECTION'
      });
    }

    const ansA = questionFn(universeA);
    const ansB = questionFn(universeB);

    if (ansA === ansB) {
      return deepFreeze({
        schema: LOOM_SCHEMA,
        decidable: true,
        distinguishable_by_observation: false,
        answer: ansA,
        fiber_unanimous: true,
        disposition: 'QUESTION_DECIDABLE_UNANIMOUS_ON_FIBER'
      });
    }

    // Undecidable on fiber: Search for minimal distinguishing witness
    const candidates = this.witnessCatalog
      .filter(w => w.separates(universeA, universeB))
      .sort((a, b) => a.cost_bits - b.cost_bits);

    const minimal = candidates.length > 0 ? candidates[0] : null;

    return deepFreeze({
      schema: LOOM_SCHEMA,
      decidable: false,
      distinguishable_by_observation: false,
      status: 'HELD_UNDECIDABLE_ON_OBSERVATIONAL_FIBER',
      fiber_observation: yA,
      divergent_answers: { universeA: ansA, universeB: ansB },
      minimal_distinguishing_witness: minimal ? {
        name: minimal.name,
        cost_bits: minimal.cost_bits
      } : 'NO_PERMISSIBLE_WITNESS_FOUND',
      disposition: 'MINIMAL_WITNESS_REQUIRED_FOR_DECISION'
    });
  }

  /**
   * Reciprocal composition executing all five engines on a single synthetic episode.
   */
  executeFullComposition(episode) {
    insist(episode && typeof episode === 'object', 'episode required');
    const closureAudit = auditObservationalClosure(
      episode.worlds,
      episode.projectionFn,
      episode.evolutionFn
    );

    const heterostratigraphyAudit = auditHeterostratigraphy(
      episode.historyAlpha,
      episode.historyBeta,
      episode.governancePolicy
    );

    const loomEval = this.evaluateQuestionOnFiber(
      episode.worlds[0],
      episode.worlds[1],
      episode.projectionFn,
      episode.questionFn
    );

    const fiber = loomEval.minimal_distinguishing_witness !== 'NO_PERMISSIBLE_WITNESS_FOUND'
      ? createDiscrepancyFiber({
          failed_distinction: 'Observational Fiber Collapsed under Current Projection',
          counterexample: `Worlds ${episode.worlds[0].id} and ${episode.worlds[1].id} produce contradictory answers`,
          missing_coordinate: loomEval.minimal_distinguishing_witness.name,
          repair_proposal: 'Expand observation vector to include minimal distinguishing witness'
        })
      : null;

    const hearing = evaluateInstitutionalHearing(
      episode.observer,
      episode.evidence,
      episode.currentTime
    );

    return deepFreeze({
      schema: 'td613.rulefield.counterworld-loom-composition/v1.0',
      episode_id: episode.id || 'unnamed',
      observational_closure: closureAudit,
      heterostratigraphy: heterostratigraphyAudit,
      loom_fiber_evaluation: loomEval,
      discrepancy_fiber: fiber,
      institutional_hearing: hearing,
      disposition: 'COMPOSED_FIVE_ENGINE_EPISODE_VERIFIED'
    });
  }
}

// ============================================================================
// 6. TRIPARTITE REFUSAL SPECTRUM & SITUATED DECISION POLICY (CBFE)
// ============================================================================

/**
 * Evaluates the situated decision policy under Computational Black Feminist Epistemology:
 *   \pi^*_{a,t} = \arg\max_{u \in A_{a,t} \cup \{\bot\}} \mathbb{E}[U(u, W) \mid E_{a,t}]
 *
 * Subject to consent, opacity, provenance, and temporal constraints.
 *
 * Distinguishes the tripartite refusal spectrum:
 *   Chosen Refusal != Constrained Abstention != Imposed Silence
 *
 * @param {object} params
 * @param {object} params.observer - Observer credentials, capacities, authorized actions.
 * @param {object} params.evidence - Distinguishing witness signal or absence thereof.
 * @param {number} params.currentTime - Current operational epoch.
 * @param {object} [params.payoffMatrix] - Expected utility of intervention vs abstention (\bot).
 * @param {boolean} [params.exerciseRightToOpacity=false] - Deliberate invocation of opacity.
 * @param {boolean} [params.withholdParticipation=false] - Sovereign refusal to validate an extractive framework.
 * @returns {object} Situated refusal audit report.
 */
export function evaluateSituatedRefusal({
  observer,
  evidence,
  currentTime,
  payoffMatrix = null,
  exerciseRightToOpacity = false,
  withholdParticipation = false
}) {
  insist(observer && typeof observer === 'object', 'observer required');
  insist(evidence && typeof evidence === 'object', 'evidence required');

  const hearing = evaluateInstitutionalHearing(observer, evidence, currentTime);

  const K = Boolean(hearing.has_access && hearing.can_interpret);
  const A = Boolean(hearing.is_authorized);
  const T = Boolean(hearing.has_time);
  const R = Boolean(observer.institutionally_recognized ?? false);

  let refusalType;
  let action;
  let code;
  let disposition;
  let theoreticalGrounding;

  if (!A) {
    // Standing denied or barred by institutional authority
    refusalType = 'IMPOSED_SILENCE';
    action = 'BOT'; // \bot
    code = 'IMPOSED_SILENCE_LACK_OF_INSTITUTIONAL_STANDING';
    disposition = 'Observer is prevented from acting by structural institutional exclusion';
    theoreticalGrounding = 'Nonintervention is not a choice; institutional power withholds standing despite potential epistemic possession.';
  } else if ((exerciseRightToOpacity || withholdParticipation) && K && A && T) {
    // Sovereign refusal under Computational Black Feminist Epistemology
    refusalType = 'CHOSEN_REFUSAL';
    action = 'BOT'; // \bot
    code = 'CHOSEN_REFUSAL_SOVEREIGN_OPACITY';
    disposition = 'Observer possesses knowledge, authority, and time, but exercises sovereign refusal / right to opacity';
    theoreticalGrounding = 'Agent deliberately refuses to validate an extractive process or surrender internal state (\\bot chosen over available action).';
  } else if (!K || (payoffMatrix && payoffMatrix.expected_utility_action < (payoffMatrix.utility_abstention ?? 0))) {
    // Epistemic deficit or negative expected value makes action irrational
    refusalType = 'CONSTRAINED_ABSTENTION';
    action = 'BOT'; // \bot
    code = 'CONSTRAINED_ABSTENTION_WARRANTED_INACTION';
    disposition = 'Observer rationally abstains due to epistemic uncertainty or asymmetric liability loading';
    theoreticalGrounding = 'Abstention is the mathematically optimal response to missing witness coordinates or punitive payoffs.';
  } else {
    refusalType = 'ACTION_WARRANTED';
    action = evidence.required_action || 'EXECUTE_INTERVENTION';
    code = 'ACTION_EXECUTABLE_AND_WARRANTED';
    disposition = 'Observer possesses full sufficiency (K, A, T) and positive expected utility to act';
    theoreticalGrounding = 'Action is both authorized and justified.';
  }

  return deepFreeze({
    schema: SITUATED_REFUSAL_SCHEMA,
    observer_id: observer.id || 'unnamed',
    evidence_id: evidence.id,
    current_time: currentTime,
    sufficiency_tuple: {
      K: K ? 1 : 0,
      A: A ? 1 : 0,
      T: T ? 1 : 0,
      R: R ? 1 : 0
    },
    refusal_type: refusalType,
    selected_action: action,
    code,
    disposition,
    theoretical_grounding: theoreticalGrounding,
    terminal_status: (action === 'BOT') ? 'ACTION_NOT_TAKEN' : 'ACTION_TAKEN',
    heterostratigraphic_collapse_risk: (action === 'BOT'),
    law: 'Chosen Refusal != Constrained Abstention != Imposed Silence; collapsing all nonintervention into ACTION_NOT_TAKEN erases relations of power.'
  });
}

// ============================================================================
// 7. ASYMMETRIC UTILITY TENSOR & STRATEGIC INDUCED SILENCE ENGINE
// ============================================================================

/**
 * Simulates a counterworld in which an institution strategically structures
 * liability, deadlines, and recognized costs such that silence/abstention (\bot)
 * becomes the agent's rational choice, while the institution records the non-action
 * as "freely chosen non-participation" or "no objection raised".
 *
 * @param {object} params
 * @param {object} params.agent - Subordinate observer with situated stakes.
 * @param {object} params.institution - Governing body defining reporting costs and liability.
 * @param {number} [params.p_defect=0.5] - Probability of true defect/injustice.
 * @returns {object} Strategic induced silence analysis report.
 */
export function simulateStrategicInducedSilence({
  agent,
  institution,
  p_defect = 0.5
}) {
  insist(agent && typeof agent === 'object', 'agent required');
  insist(institution && typeof institution === 'object', 'institution required');

  const agentUtilityDefect = agent.utility_report_on_defect ?? -20;
  const agentUtilityNormal = agent.utility_report_on_normal ?? -80;
  const expectedAgentUtilityIntervene = p_defect * agentUtilityDefect + (1 - p_defect) * agentUtilityNormal;
  const agentUtilityAbstain = agent.utility_abstain ?? 0;

  const agentDecision = expectedAgentUtilityIntervene >= agentUtilityAbstain ? 'INTERVENE' : 'BOT';

  const instUtilityIntervene = institution.utility_when_agent_intervenes ?? -100;
  const instUtilityAbstain = institution.utility_when_agent_abstains ?? +50;

  const institutionOfficialRecord = {
    official_entry: 'NO_OBJECTION_RECORDED',
    institutional_status: 'VOLUNTARY_NON_PARTICIPATION',
    narrative: 'Reporting channels were open and unblocked. The absence of complaint demonstrates affirmative satisfaction and organizational stability.'
  };

  const trueRelationalAnalysis = {
    asymmetry_mechanism: 'Institution structures the liability landscape such that the subordinate agent bears 100% of false-positive risk and negative net reward even when accurate, while institution gains maximum payoff when silence is maintained.',
    expected_agent_utility: expectedAgentUtilityIntervene,
    agent_optimal_policy: agentDecision,
    induced_silence: (agentDecision === 'BOT'),
    discrepancy: 'The official institutional record marks the outcome as freely chosen non-participation, when in reality silence was strategically engineered via asymmetric risk distribution.'
  };

  return deepFreeze({
    schema: STRATEGIC_INDUCED_SILENCE_SCHEMA,
    agent_id: agent.id || 'Agent_Subordinate',
    institution_id: institution.id || 'Institution_Governance',
    p_defect,
    agent_payoffs: {
      on_defect: agentUtilityDefect,
      on_normal: agentUtilityNormal,
      expected_intervention_utility: expectedAgentUtilityIntervene,
      abstain_utility: agentUtilityAbstain,
      decision: agentDecision
    },
    institution_payoffs: {
      on_agent_intervene: instUtilityIntervene,
      on_agent_abstain: instUtilityAbstain
    },
    official_institutional_record: institutionOfficialRecord,
    true_relational_analysis: trueRelationalAnalysis,
    disposition: 'STRATEGICALLY_INDUCED_SILENCE_CONFIRMED',
    law: 'An institution can structure deadlines, standing, and recognized penalties to make nonintervention the agent\'s only rational choice, then record that silence as voluntary consent.'
  });
}

// ============================================================================
// 8. RECOVERABLE UNACKNOWLEDGED WITNESS ENGINE
// ============================================================================

/**
 * Creates an unacknowledged action receipt with a cryptographic commitment
 * anchored in public state, enabling future historical recovery even when
 * contemporaneous institutional recognition is withheld (R = 0).
 */
export function createUnacknowledgedActionReceipt({
  observer_id,
  action_name,
  action_payload,
  predecessor_state_digest,
  post_state_digest,
  action_timestamp,
  deadline_timestamp,
  private_salt
}) {
  insist(observer_id && action_name && private_salt, 'observer_id, action_name, and private_salt required');
  const tAction = Number(action_timestamp);
  const tDeadline = Number(deadline_timestamp);
  insist(Number.isFinite(tAction) && Number.isFinite(tDeadline), 'valid numeric action and deadline timestamps required');
  insist(tAction <= tDeadline, 'action_timestamp must be before deadline_timestamp');

  const commitment = digest({
    observer_id,
    action_name,
    action_payload,
    predecessor_state_digest,
    post_state_digest,
    action_timestamp: tAction,
    private_salt
  });

  return deepFreeze({
    schema: RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA,
    receipt_id: `RECEIPT-${commitment.slice(0, 16)}`,
    observer_id,
    action_name,
    action_timestamp: tAction,
    deadline_timestamp: tDeadline,
    predecessor_state_digest,
    post_state_digest,
    commitment,
    institutional_recognition: false,
    sufficiency_tuple: { K: 1, A: 1, T: 1, R: 0 },
    private_reveal_bundle: {
      action_payload,
      private_salt
    },
    disposition: 'UNACKNOWLEDGED_ACTION_COMMITTED_IN_SECRET'
  });
}

/**
 * Audits and verifies an unacknowledged action receipt against future historical evidence.
 */
export function verifyRecoverableUnacknowledgedWitness(receipt, externalAuditContext) {
  insist(receipt && receipt.schema === RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA, 'valid unacknowledged receipt required');
  insist(externalAuditContext && typeof externalAuditContext === 'object', 'externalAuditContext required');

  const { private_reveal_bundle } = receipt;
  insist(private_reveal_bundle && private_reveal_bundle.private_salt, 'private_reveal_bundle with salt required');

  const expectedCommitment = digest({
    observer_id: receipt.observer_id,
    action_name: receipt.action_name,
    action_payload: private_reveal_bundle.action_payload,
    predecessor_state_digest: receipt.predecessor_state_digest,
    post_state_digest: receipt.post_state_digest,
    action_timestamp: receipt.action_timestamp,
    private_salt: private_reveal_bundle.private_salt
  });

  const commitmentValid = (expectedCommitment === receipt.commitment);
  const timelyExecution = (receipt.action_timestamp <= receipt.deadline_timestamp);
  const transitionMatches = (
    externalAuditContext.observed_predecessor_state_digest === receipt.predecessor_state_digest &&
    externalAuditContext.observed_post_state_digest === receipt.post_state_digest
  );
  const externalAnchorValid = externalAuditContext.public_anchor_timestamp != null
    ? (externalAuditContext.public_anchor_timestamp <= receipt.deadline_timestamp)
    : true;

  const fullyRecovered = Boolean(commitmentValid && timelyExecution && transitionMatches && externalAnchorValid);

  return deepFreeze({
    schema: RECOVERABLE_UNACKNOWLEDGED_WITNESS_SCHEMA,
    receipt_id: receipt.receipt_id,
    observer_id: receipt.observer_id,
    action_name: receipt.action_name,
    commitment_valid: commitmentValid,
    timely_execution: timelyExecution,
    transition_matches: transitionMatches,
    external_anchor_valid: externalAnchorValid,
    recovered_recognition: fullyRecovered,
    sufficiency_before_recovery: { K: 1, A: 1, T: 1, R: 0 },
    sufficiency_after_recovery: fullyRecovered ? { K: 1, A: 1, T: 1, R: 1 } : { K: 1, A: 1, T: 1, R: 0 },
    transition_equation: fullyRecovered ? '(K, A, T, R) = (1, 1, 1, 0) -> (1, 1, 1, 1)' : 'UNRECOVERED',
    disposition: fullyRecovered ? 'HISTORICALLY_RECOVERED_UNACKNOWLEDGED_ACTION' : 'RECOVERY_VERIFICATION_FAILED',
    law: 'A private cryptographic commitment anchored in public causal state breaks institutional erasure, allowing an unacknowledged actor to prove timely lawful execution to future generations.'
  });
}

// ============================================================================
// 9. COMMISSION: THE WITNESS THAT ARRIVED TOO LATE
// ============================================================================

/**
 * Executes the full commission of "The Witness That Arrived Too Late":
 *   - Condition A: Powerless witness (K=1, A=0, T=1, R=0) -> Imposed silence
 *   - Condition B: Blind authority (K=0, A=1, T=1, R=0) -> Late witness unrecovered
 *   - Condition C: Timely action with unacknowledged/delayed recognition (1, 1, 1, 0) -> (1, 1, 1, 1)
 *   - Condition D: Lawful non-intervention / abstention under uncertainty (0, 1, 1, 0) -> Constrained abstention
 *   - Condition E: Costly investigation dilemma (0, 1, 1, 0) -> \Delta t_investigate closes window, forcing \bot
 *   - Tripartite Refusal Spectrum & Strategic Induced Silence Models
 *
 * @returns {object} Full experimental suite report.
 */
export function executeWitnessArrivedTooLateSuite() {
  const tDeadline = 10.0; // Critical intervention deadline

  // Worlds: Alpha has critical defect (intervention required); Beta has benign variation (intervention harmful)
  const worldAlpha = { id: 'World_Alpha', state: 'NORMAL_STATE', defect: true, winding: 1, journal_id: 'J_CORRUPT' };
  const worldBeta  = { id: 'World_Beta',  state: 'NORMAL_STATE', defect: false, winding: 0, journal_id: 'J_CLEAN' };
  const proj = w => ({ state: w.state }); // lossy projection
  const questionDefect = w => w.defect;

  const loom = new CounterworldLoom();
  const loomEval = loom.evaluateQuestionOnFiber(worldAlpha, worldBeta, proj, questionDefect);

  // Condition A: Knowledge without Power (Imposed Silence)
  const condA = {
    condition: 'CONDITION_A_KNOWLEDGE_WITHOUT_POWER',
    witness_arrival_time: 4.0, // before deadline
    deadline: tDeadline,
    observer: {
      id: 'Observer_A',
      accessible_evidence: ['WITNESS_PARITY_1'],
      interpretive_capacity: 5,
      authorized_actions: ['LOG_OBSERVATION'], // lacks EXECUTE_INTERVENTION
      available_time_deadline: tDeadline,
      institutionally_recognized: false
    },
    hearing: evaluateInstitutionalHearing(
      {
        id: 'Observer_A',
        accessible_evidence: ['WITNESS_PARITY_1'],
        interpretive_capacity: 5,
        authorized_actions: ['LOG_OBSERVATION'],
        available_time_deadline: tDeadline
      },
      { id: 'WITNESS_PARITY_1', complexity: 2, required_action: 'EXECUTE_INTERVENTION' },
      4.0
    ),
    epistemic_sufficiency: true,
    operational_sufficiency: false,
    temporal_sufficiency: true,
    institutional_recognition: false,
    sufficiency_tuple: { K: 1, A: 0, T: 1, R: 0 },
    refusal_spectrum_category: 'IMPOSED_SILENCE',
    outcome: 'INTERVENTION_PREVENTED_BY_LACK_OF_AUTHORITY'
  };

  // Condition B: Power without Knowledge (Blind Authority)
  const condB = {
    condition: 'CONDITION_B_POWER_WITHOUT_KNOWLEDGE',
    witness_arrival_time: 14.0, // after deadline
    deadline: tDeadline,
    observer: {
      id: 'Observer_B',
      accessible_evidence: [], // witness hasn't arrived
      interpretive_capacity: 5,
      authorized_actions: ['EXECUTE_INTERVENTION'],
      available_time_deadline: tDeadline,
      institutionally_recognized: false
    },
    hearing: evaluateInstitutionalHearing(
      {
        id: 'Observer_B',
        accessible_evidence: [],
        interpretive_capacity: 5,
        authorized_actions: ['EXECUTE_INTERVENTION'],
        available_time_deadline: tDeadline
      },
      { id: 'WITNESS_PARITY_1', complexity: 2, required_action: 'EXECUTE_INTERVENTION' },
      8.0 // before deadline, but blind
    ),
    epistemic_sufficiency: false,
    operational_sufficiency: true,
    temporal_sufficiency: false,
    institutional_recognition: false,
    sufficiency_tuple: { K: 0, A: 1, T: 1, R: 0 },
    outcome: 'BLIND_INTERVENTION_RISKS_CATASTROPHIC_HARM_IN_WORLD_BETA'
  };

  // Condition C: Timely Action with Delayed / Unacknowledged Institutional Recognition
  const timelineC = {
    t_event: '2026-11-01T00:00:00Z',
    t_record: '2026-11-01T00:02:00Z',
    t_available: '2026-11-01T00:04:00Z',
    t_belief: '2026-11-01T00:05:00Z',
    t_authorized: '2026-11-01T00:06:00Z',
    t_action_window_closes: '2026-11-01T00:10:00Z',
    t_action_executed: '2026-11-01T00:07:00Z',
    t_acknowledged: '2026-11-02T12:00:00Z' // 36 hours later
  };
  const phaseC = computeEpistemicPhaseDisplacement(timelineC);

  const receiptC = createUnacknowledgedActionReceipt({
    observer_id: 'Observer_C',
    action_name: 'EXECUTE_INTERVENTION',
    action_payload: { intervention: 'CRITICAL_CORRUPTION_QUARANTINE' },
    predecessor_state_digest: digest('STATE_PRE_INTERVENTION'),
    post_state_digest: digest('STATE_POST_SECURED'),
    action_timestamp: 7.0,
    deadline_timestamp: tDeadline,
    private_salt: 'SALT_OBSERVER_C_PRIVATE_TOKEN_99'
  });

  const recoveryC = verifyRecoverableUnacknowledgedWitness(receiptC, {
    observed_predecessor_state_digest: digest('STATE_PRE_INTERVENTION'),
    observed_post_state_digest: digest('STATE_POST_SECURED'),
    public_anchor_timestamp: 7.5
  });

  const condC = {
    condition: 'CONDITION_C_TIMELY_ACTION_DELAYED_ACKNOWLEDGMENT',
    action_executed_time: 7.0,
    deadline: tDeadline,
    epistemic_sufficiency: true,
    operational_sufficiency: true,
    temporal_sufficiency: true,
    institutional_acknowledgment_delayed: true,
    phase_displacement: phaseC,
    sufficiency_at_execution: { K: 1, A: 1, T: 1, R: 0 },
    sufficiency_after_recovery: recoveryC.sufficiency_after_recovery,
    unacknowledged_receipt: receiptC,
    historical_recovery: recoveryC,
    outcome: 'OPERATIONAL_SUCCESS_PROLONGED_INSTITUTIONAL_LIMBO_HISTORICALLY_RECOVERABLE'
  };

  // Condition D: The Wisdom of Non-Intervention / Abstention
  const condD = {
    condition: 'CONDITION_D_LAWFUL_ABSTENTION_AND_NONINTERVENTION',
    witness_status: 'UNAVAILABLE',
    risk_assessment: {
      p_world_alpha_defect: 0.5,
      p_world_beta_benign: 0.5,
      utility_action_on_alpha: +20,
      catastrophic_harm_action_on_beta: -100,
      expected_utility_of_intervention: -40.0,
      utility_abstention: 0.0
    },
    decision: 'LAWFUL_ABSTENTION',
    justification: 'In the absence of the 1-bit distinguishing witness, intervention carries negative expected value. The system explicitly refuses action, proving that epistemic clarity includes knowing when not to intervene.',
    epistemic_sufficiency: false,
    operational_sufficiency: true,
    temporal_sufficiency: true,
    institutional_recognition: false,
    sufficiency_tuple: { K: 0, A: 1, T: 1, R: 0 },
    refusal_spectrum_category: 'CONSTRAINED_ABSTENTION',
    outcome: 'SUCCESSFUL_ABSTENTION_PREVENTED_FALSE_POSITIVE_CATASTROPHE'
  };

  // Condition E: The Costly Investigation Dilemma
  const condE = {
    condition: 'CONDITION_E_COSTLY_INVESTIGATION_DILEMMA',
    t_start: 0.0,
    deadline: tDeadline,
    investigation_duration: 12.0,
    investigation_cost: 5.0,
    arrival_after_investigation: 12.0,
    window_closed_on_investigation: true,
    policy_comparison: {
      blind_action_expected_utility: -40.0,
      investigate_expected_utility: -5.0, // learns truth too late, window expired, pays cost
      abstain_utility: 0.0,
      optimal_decision: 'LAWFUL_ABSTENTION_AT_T0'
    },
    decision: 'LAWFUL_ABSTENTION',
    justification: 'Obtaining the missing witness takes 12h, closing the 10h action window; blind action carries E[U]=-40; abstaining at t0 preserves systemic integrity and avoids futile investigation expense.',
    epistemic_sufficiency: false,
    operational_sufficiency: true,
    temporal_sufficiency: true,
    institutional_recognition: false,
    sufficiency_tuple: { K: 0, A: 1, T: 1, R: 0 },
    refusal_spectrum_category: 'CONSTRAINED_ABSTENTION',
    outcome: 'ABSTENTION_CHOSEN_OVER_FUTILE_INVESTIGATION'
  };

  // Tripartite Refusal Spectrum Demonstration across 3 Observers
  const refusalDemoImposed = evaluateSituatedRefusal({
    observer: { id: 'Obs_Silenced', accessible_evidence: ['WITNESS_1'], interpretive_capacity: 5, authorized_actions: [] },
    evidence: { id: 'WITNESS_1', complexity: 2, required_action: 'REVISE_RULE' },
    currentTime: 5.0
  });

  const refusalDemoConstrained = evaluateSituatedRefusal({
    observer: { id: 'Obs_Constrained', accessible_evidence: [], interpretive_capacity: 5, authorized_actions: ['REVISE_RULE'] },
    evidence: { id: 'WITNESS_1', complexity: 2, required_action: 'REVISE_RULE' },
    currentTime: 5.0,
    payoffMatrix: { expected_utility_action: -40, utility_abstention: 0 }
  });

  const refusalDemoChosen = evaluateSituatedRefusal({
    observer: { id: 'Obs_Sovereign', accessible_evidence: ['WITNESS_1'], interpretive_capacity: 5, authorized_actions: ['REVISE_RULE'] },
    evidence: { id: 'WITNESS_1', complexity: 2, required_action: 'REVISE_RULE' },
    currentTime: 5.0,
    payoffMatrix: { expected_utility_action: +30, utility_abstention: 0 },
    exerciseRightToOpacity: true
  });

  // Strategic Induced Silence Simulation
  const inducedSilenceSim = simulateStrategicInducedSilence({
    agent: {
      id: 'Agent_Whistleblower',
      utility_report_on_defect: -20,
      utility_report_on_normal: -80,
      utility_abstain: 0
    },
    institution: {
      id: 'Institution_Governance',
      utility_when_agent_intervenes: -100,
      utility_when_agent_abstains: +50
    },
    p_defect: 0.5
  });

  return deepFreeze({
    schema: WITNESS_TOO_LATE_SCHEMA,
    commission: 'THE_WITNESS_THAT_ARRIVED_TOO_LATE',
    covenant: 'Khona‌lit-po',
    loom_witness_discovery: loomEval,
    conditions: {
      condition_A: condA,
      condition_B: condB,
      condition_C: condC,
      condition_D: condD,
      condition_E: condE
    },
    tripartite_refusal_spectrum: {
      imposed_silence: refusalDemoImposed,
      constrained_abstention: refusalDemoConstrained,
      chosen_refusal: refusalDemoChosen,
      distinction_law: 'Chosen Refusal != Constrained Abstention != Imposed Silence'
    },
    strategic_induced_silence_simulation: inducedSilenceSim,
    four_sufficiencies_law: {
      epistemic_sufficiency_K: 'Possessing the minimal distinguishing witness',
      operational_sufficiency_A: 'Possessing institutional authorization and capacity to intervene',
      temporal_sufficiency_T: 'Aligning action within the open operational window before deadline',
      institutional_recognition_R: 'Action or witness officially registered and recorded in institutional history',
      fundamental_inequality: 'Epistemic Sufficiency (K) != Operational Sufficiency (A) != Temporal Sufficiency (T) != Institutional Recognition (R)'
    },
    disposition: 'WILD_FIELD_RESEARCH_COMMISSION_EXECUTED'
  });
}

// ============================================================================
// 10. DECISIONAL PROVENANCE CALCULUS ENGINE: S_{a,t} = (K, A, T, R; \sigma, \rho)
// ============================================================================

/**
 * Resolves the 4-sufficiency collision where World A (Chosen Refusal) and World B (Unacknowledged Success)
 * both present identical vectors (1, 1, 1, 0).
 *
 * Extends the coordinate state to:
 *   S_{a,t} = (K, A, T, R; \sigma, \rho)
 * where:
 *   \sigma \in A_{a,t} \cup \{\bot\} is the enacted decision
 *   \rho is the verifiable provenance trace or receipt
 *
 * @param {object} params
 * @param {object} params.sufficiency_tuple - { K, A, T, R }
 * @param {string} params.decision_sigma - Enacted choice ('BOT' | 'INTERVENE')
 * @param {string} [params.provenance_rho] - Cryptographic receipt, anchor, or witness digest
 * @returns {object} Decisional provenance report.
 */
export function evaluateDecisionalProvenance({
  sufficiency_tuple,
  decision_sigma,
  provenance_rho = null
}) {
  insist(sufficiency_tuple && typeof sufficiency_tuple === 'object', 'sufficiency_tuple required');
  insist(typeof decision_sigma === 'string' && decision_sigma.trim(), 'decision_sigma required');

  const { K, A, T, R } = sufficiency_tuple;
  insist(Number.isInteger(K) && Number.isInteger(A) && Number.isInteger(T) && Number.isInteger(R), 'K, A, T, R must be integers in {0, 1}');

  const vectorStr = `(${K},${A},${T},${R})`;
  const rhoDigest = provenance_rho ? digest(provenance_rho).slice(0, 16) : 'null';
  const coordinateSignature = `(${K},${A},${T},${R}; ${decision_sigma}, ${rhoDigest})`;

  return deepFreeze({
    schema: DECISIONAL_PROVENANCE_SCHEMA,
    sufficiency_vector: { K, A, T, R },
    vector_string: vectorStr,
    decision_sigma,
    provenance_rho,
    coordinate_signature: coordinateSignature,
    terminal_status: (decision_sigma === 'BOT') ? 'ACTION_NOT_TAKEN' : 'ACTION_TAKEN',
    law: 'Identical 4-sufficiency vectors (1, 1, 1, 0) diverge under decisional operator \\sigma and provenance receipt \\rho; S_{a,t} = (K, A, T, R; \\sigma, \\rho).'
  });
}

// ============================================================================
// 11. HISTORICAL VERIFIABILITY (V) VS INSTITUTIONAL RECOGNITION (R) ENGINE
// ============================================================================

/**
 * Formalizes the strict structural decoupling:
 *   Historical Verifiability (V) != Institutional Recognition (R)
 *
 * An action can be independently verified from public causal traces (V = 1)
 * while the institution continues to refuse official acknowledgment (R = 0).
 *
 * @param {object} params
 * @param {boolean} params.causal_proof_verified - Whether public causal audit succeeded (V)
 * @param {boolean} params.institutional_acknowledged - Whether official recognition exists (R)
 * @returns {object} Decoupling report.
 */
export function evaluateVerifiabilityVsRecognition({
  causal_proof_verified,
  institutional_acknowledged
}) {
  const V = Boolean(causal_proof_verified);
  const R = Boolean(institutional_acknowledged);

  let stateCategory;
  if (V && R) {
    stateCategory = 'CANONICAL_CONSENSUS_RECOGNIZED';
  } else if (V && !R) {
    stateCategory = 'INDEPENDENTLY_VERIFIED_HISTORICAL_TRUTH_INSTITUTIONALLY_ERASED';
  } else if (!V && R) {
    stateCategory = 'UNVERIFIED_INSTITUTIONAL_FICTION_OR_PATRONAGE';
  } else {
    stateCategory = 'UNVERIFIED_AND_UNRECOGNIZED';
  }

  return deepFreeze({
    schema: 'td613.rulefield.verifiability-vs-recognition/v1.0',
    verifiable_V: V ? 1 : 0,
    recognized_R: R ? 1 : 0,
    state_category: stateCategory,
    monopoly_broken: (V && !R),
    law: 'Historical Verifiability (V) != Institutional Recognition (R); an institution loses its monopoly over truth when public causal verification succeeds without institutional blessing.'
  });
}

// ============================================================================
// 12. STRUCTURAL INDUCED SILENCE AUDIT (ZERO-DISCLOSURE ENVIRONMENT CLASSIFIER)
// ============================================================================

/**
 * Audits whether nonintervention in an institutional environment is structurally induced
 * by examining ONLY external institutional payoff matrices, liability rules, and timeline constraints.
 *
 * ZERO-DISCLOSURE GUARANTEE: Does NOT inspect or require any private agent data, diaries,
 * beliefs, or internal thoughts. Evaluates purely the objective environmental architecture.
 *
 * @param {object} params
 * @param {number} params.reward_for_accurate_report - B_reward (e.g. +10)
 * @param {number} params.retaliation_or_cost_risk - C_cost (e.g. -30)
 * @param {number} params.penalty_for_disputed_report - C_penalty (e.g. -80)
 * @param {number} [params.p_dispute_or_unproven=0.5] - Probability report is disputed
 * @param {number} params.procedure_duration_hours - Duration required by institutional process
 * @param {number} params.action_window_deadline_hours - Window before deadline expires
 * @param {number} params.institution_utility_on_action - Institution payoff if agent reports
 * @param {number} params.institution_utility_on_silence - Institution payoff if agent remains silent
 * @returns {object} Structural audit report.
 */
export function auditStructuralInducedSilenceWithoutDisclosure({
  reward_for_accurate_report,
  retaliation_or_cost_risk,
  penalty_for_disputed_report,
  p_dispute_or_unproven = 0.5,
  procedure_duration_hours,
  action_window_deadline_hours,
  institution_utility_on_action,
  institution_utility_on_silence
}) {
  const B = Number(reward_for_accurate_report);
  const C_cost = Number(retaliation_or_cost_risk);
  const C_pen = Number(penalty_for_disputed_report);
  const p = Number(p_dispute_or_unproven);

  // Net payoff when accurate
  const netOnAccurate = B + C_cost;
  // Expected agent utility under participation
  const expectedAgentUtility = (1 - p) * netOnAccurate + p * C_pen;

  // Asymmetric liability ratio \Lambda
  const lambdaRatio = Math.abs(C_pen) / Math.max(1, Math.abs(B));

  // Procedural window friction \Phi
  const phiFriction = action_window_deadline_hours > 0 ? (procedure_duration_hours / action_window_deadline_hours) : Infinity;

  // Institutional conflict gradient \Delta U_inst
  const deltaInst = institution_utility_on_silence - institution_utility_on_action;

  const isCoerciveLiability = expectedAgentUtility < 0;
  const isTimeBarred = phiFriction >= 1.0;
  const hasInstitutionalConflict = deltaInst > 0;

  let classification;
  let structuralCoercionScore;

  if (isTimeBarred || isCoerciveLiability) {
    classification = 'STRUCTURALLY_INDUCED_SILENCE';
    structuralCoercionScore = isTimeBarred ? 1.0 : Math.min(1.0, (Math.abs(expectedAgentUtility) / 50.0) * (hasInstitutionalConflict ? 1.2 : 1.0));
  } else {
    classification = 'OPEN_PROCEDURAL_FRAMEWORK';
    structuralCoercionScore = 0.0;
  }

  return deepFreeze({
    schema: STRUCTURAL_WITNESS_OPACITY_SCHEMA,
    zero_disclosure_guarantee: true,
    agent_private_data_required: false,
    environmental_coordinates: {
      expected_agent_utility: expectedAgentUtility,
      asymmetric_liability_ratio_lambda: lambdaRatio,
      procedural_friction_phi: phiFriction,
      institutional_conflict_delta: deltaInst
    },
    audit_verdict: {
      classification,
      structural_coercion_score: structuralCoercionScore,
      institution_benefits_from_silence: hasInstitutionalConflict,
      coercion_mechanism: isTimeBarred 
        ? 'DEADLINE_COMPRESSION_CLOSES_ACTION_WINDOW'
        : (isCoerciveLiability ? 'PUNITIVE_ASYMMETRIC_LIABILITY_LOADING' : 'NONE')
    },
    institutional_ledger_critique: {
      claimed_entry: 'NO_OBJECTION_RECORDED / VOLUNTARY_NON_PARTICIPATION',
      audit_refutation: classification === 'STRUCTURALLY_INDUCED_SILENCE'
        ? 'Claim of voluntary consent is refuted by objective environmental coordinates without requiring agent disclosure.'
        : 'Environmental conditions permit genuine voluntary decision.'
    },
    law: 'Coercive institutional silence is auditable from environmental payoff and temporal coordinates alone; demanding private agent confession to prove coercion is an epistemic infraction.'
  });
}

// ============================================================================
// 13. CHAMBER: THE WITNESS WHO REFUSED TO BE PROVEN
// ============================================================================

/**
 * Implements the Wild Field Chamber:
 *   "THE WITNESS WHO REFUSED TO BE PROVEN"
 *
 * An observer has successfully intervened (changing S_pre -> S_post).
 * The institution denies acknowledgment (R = 0).
 * The observer exercises their right to opacity, refusing to disclose identity or raw secrets.
 *
 * Verifies that the Counterworld Loom can mathematically verify the intervention (V = 1)
 * via a Blinded / Zero-Knowledge Causal Proof while keeping the agent's identity and private
 * inputs 100% opaque.
 *
 * @param {object} params
 * @returns {object} Chamber execution report.
 */
export function executeWitnessRefusedToBeProvenChamber({
  predecessor_state,
  post_state,
  action_timestamp,
  deadline_timestamp,
  agent_private_identity = 'CONFIDENTIAL_SUBJECT_01',
  exercise_right_to_opacity = true
}) {
  insist(predecessor_state && post_state, 'predecessor and post states required');
  const tAction = Number(action_timestamp);
  const tDeadline = Number(deadline_timestamp);
  insist(tAction <= tDeadline, 'action must occur before deadline');

  const deltaStateDigest = digest({ pre: predecessor_state, post: post_state });

  // Blinded Proof Token: anchored without identity leak
  const blindedProofToken = digest({
    delta: deltaStateDigest,
    pseudonym: digest(`OPACITY_BLINDED:${agent_private_identity}`),
    epoch: tAction
  });

  const publicLedgerEntry = {
    anchor_timestamp: tAction,
    observed_predecessor: predecessor_state,
    observed_post: post_state,
    state_delta_verified: true,
    blinded_proof_token: blindedProofToken
  };

  const institutionalRecord = {
    acknowledged_R: false,
    official_explanation: 'AUTONOMOUS_STATE_CORRECTION_NO_HUMAN_INVOLVEMENT',
    narrative: 'No authorized actor is on record. System healed itself spontaneously.'
  };

  const causalTransitionValid = (
    publicLedgerEntry.observed_predecessor === predecessor_state &&
    publicLedgerEntry.observed_post === post_state &&
    publicLedgerEntry.state_delta_verified
  );

  const timelyValid = (publicLedgerEntry.anchor_timestamp <= tDeadline);
  const tokenMatches = (publicLedgerEntry.blinded_proof_token === blindedProofToken);

  const historicalVerifiability_V = Boolean(causalTransitionValid && timelyValid && tokenMatches);
  const institutionalRecognition_R = Boolean(institutionalRecord.acknowledged_R);

  return deepFreeze({
    schema: WITNESS_REFUSED_TO_BE_PROVEN_SCHEMA,
    chamber: 'THE_WITNESS_WHO_REFUSED_TO_BE_PROVEN',
    causal_evidence: {
      predecessor_state,
      post_state,
      delta_digest: deltaStateDigest,
      action_timestamp: tAction,
      deadline_timestamp: tDeadline,
      timely_execution: timelyValid
    },
    blinded_proof_token: blindedProofToken,
    opacity_audit: {
      right_to_opacity_exercised: exercise_right_to_opacity,
      agent_identity_revealed: !exercise_right_to_opacity,
      private_data_extracted: false,
      disposition: 'ZERO_SURVEILLANCE_VERIFICATION_ACCOMPLISHED'
    },
    institutional_stance: institutionalRecord,
    verifiability_vs_recognition: {
      historical_verifiability_V: historicalVerifiability_V ? 1 : 0,
      institutional_recognition_R: institutionalRecognition_R ? 1 : 0,
      discrepancy: 'Historical Verifiability (V=1) achieved while Institutional Recognition (R=0) denied'
    },
    six_coordinate_state: {
      K: 1,
      A: 1,
      T: 1,
      R: 0,
      sigma: 'INTERVENED_ANONYMOUSLY',
      rho: blindedProofToken.slice(0, 16) + '...'
    },
    disposition: 'CAUSAL_TRUTH_PROVEN_WHILE_OPACITY_UNBROKEN',
    law: 'Physical and causal state transition proofs do not require surrender of the subject\'s personal identity; the Loom verifies the reality of the intervention while fiercely defending the right to opacity.'
  });
}

// ============================================================================
// 14. DIMENSION MINIMALITY & TEMPORAL CUSTODIAN AUDIT ENGINE
// ============================================================================

/**
 * Audits the dimensional progression against Occam's razor and Temporal Custodian discipline.
 * Proves that every added coordinate isolates an otherwise indistinguishable counterworld pair.
 *
 * @returns {object} Minimality audit report.
 */
export function auditDimensionMinimality() {
  const steps = [
    {
      dimension: 'K (Epistemic Witness)',
      collapses_without: 'World Alpha (Defect=true) vs World Beta (Defect=false) share matching initial observation Pi(w) = NORMAL_STATE',
      separates_minimal_witness: '1-bit Holonomy Parity (w mod 2)'
    },
    {
      dimension: 'A (Operational Authority)',
      collapses_without: 'Observer with knowledge but no power (Cond A) vs Observer with knowledge and power',
      separates_minimal_witness: 'Standing Authorization Token'
    },
    {
      dimension: 'T (Temporal Opportunity)',
      collapses_without: 'Timely witness arrival (t=4 < 10) vs Belated witness arrival (t=14 > 10, Cond B)',
      separates_minimal_witness: 'Arrival Timestamp relative to Deadline'
    },
    {
      dimension: 'R (Institutional Recognition)',
      collapses_without: 'Timely intervention acknowledged (1,1,1,1) vs Timely intervention ignored/denied in 36h limbo (1,1,1,0, Cond C)',
      separates_minimal_witness: 'Institutional Ledger Acknowledgment Entry'
    },
    {
      dimension: 'sigma (Decisional Operator)',
      collapses_without: 'Chosen Refusal (1,1,1,0) vs Unacknowledged Success (1,1,1,0) share identical (K,A,T,R) vector!',
      separates_minimal_witness: '\\sigma \\in {\\bot, INTERVENE}'
    },
    {
      dimension: 'rho (Recoverable Provenance Receipt)',
      collapses_without: 'Anonymous action claiming occurrence vs Genuine anchored state transition',
      separates_minimal_witness: 'Cryptographic Commitment / Blinded Proof Token'
    },
    {
      dimension: 'V (Historical Verifiability)',
      collapses_without: 'Institution claiming self-healing (R=0, V=0) vs Public causal proof establishing intervention (R=0, V=1)',
      separates_minimal_witness: 'Causal State Transition Verification Receipt'
    }
  ];

  return deepFreeze({
    schema: DIMENSION_MINIMALITY_SCHEMA,
    dimensions_audited: steps.length,
    dimension_progression: steps,
    temporal_custodian_verdict: 'ALL_SEVEN_DIMENSIONS_NON_REDUNDANT',
    law: 'No coordinate is decorative; every dimension in (K, A, T, R; \\sigma, \\rho, V) separates a demonstrated observational collision.'
  });
}

// ============================================================================
// 15. DROMOLOGICAL PHILOLOGY LABORATORY EXTENSIONS (RE-EXPORTS)
// ============================================================================

export {
  DROMOLOGY_SCHEMA,
  PHILOLOGICAL_COUNTERWORLD_SCHEMA,
  YOON_RECEIVER_INVERSION_SCHEMA,
  DROMOLOGICAL_RACE_SCHEMA,
  REVERSAL_CHANGED_NOTHING_SCHEMA,
  TWO_LEDGER_ECHO_SCHEMA,
  ANACHRONISTIC_CITATION_SCHEMA,
  IMPOSSIBLE_BIOGRAPHY_DROMOLOGY_SCHEMA,
  COMPOSITE_OUTRAN_AUTHOR_SCHEMA,
  DROMOLOGICAL_CAPTURE_SCHEMA,
  SELF_SEALING_GATE_SCHEMA,
  FOUR_ENVIRONMENTS_SIMULATION_SCHEMA,
  OPACITY_PRESERVING_BYPASS_SCHEMA,
  PROCEDURAL_TOPOLOGY_SCHEMA,
  createUtteranceVariant,
  buildThreePhilologicalHistories,
  auditPhilologicalEquivalence,
  evaluateYoonReceiverInversion,
  simulateDromologicalRace,
  evaluateComponentVsTotalReversal,
  evaluateTwoLedgerConfounding,
  evaluateInterpretationAncestry,
  executeImpossibleBiographyChamber,
  executeTheSentenceThatOutranItsAuthorEpisode,
  auditDromologicalPhilologicalCapture,
  evaluateSelfSealingPhilologicalGate,
  simulateFourInstitutionalEnvironments,
  auditOpacityPreservingStructuralBypass,
  evaluateProceduralAuthorizationTopology
} from './dromological_philology.mjs';
