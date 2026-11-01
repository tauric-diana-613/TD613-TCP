import { canonical, digest } from './journal.mjs';
import { validatePolicy, usageRecord, canReserve } from './resources.mjs';

export const ARMS = ['ARM_2A_MODULAR', 'ARM_2B_MATCHED_UNION'];
const accepted = events => events.filter(e => e.type === 'TURN_ACCEPTED');
const turnKey = (lane, round, arm) => `${lane}/${round}/${arm}`;

export function validatePlan(plan) {
  if (!plan.experiment || !plan.episode || !plan.model?.requested || !plan.model.effort || !plan.runtimeBinding || !Number.isSafeInteger(plan.context?.inputLimit) || plan.context.inputLimit <= 0 || !Number.isSafeInteger(plan.context.outputLimit) || plan.context.outputLimit <= 0 || !plan.context.tokenizerBinding || !plan.analysisBinding || !plan.protocolBinding || !plan.kernelBinding || !plan.toolPolicyBinding || !plan.stage2Binding || !plan.baselineBinding) throw Error('FROZEN_CONDITIONS_REQUIRED');
  if (!Array.isArray(plan.lanes) || !plan.lanes.length || new Set(plan.lanes.map(l => l.id)).size !== plan.lanes.length) throw Error('FROZEN_LANES_REQUIRED');
  for (const l of plan.lanes) {
    if (!l.id || !Array.isArray(l.sourceOrder) || !l.sourceOrder.length || new Set(l.sourceOrder).size !== l.sourceOrder.length || !l.templates?.modular1 || !l.templates.modular2 || !l.templates.union1 || !l.templates.union2 || !l.templates.baseline || !l.templates.synthesis || !l.custodyLineage) throw Error('INCOMPLETE_LANE_CONTRACT');
  }
}
export function rounds(lane) {
  return [{ phase: 'BASELINE', prefix: 0 }, ...lane.sourceOrder.flatMap((_, i) => [{ phase: 'STAGE1', prefix: i + 1 }, { phase: 'STAGE2', prefix: i + 1 }]), { phase: 'SYNTHESIS', prefix: lane.sourceOrder.length }];
}
export function renderTurn(plan, lane, roundIndex, arm, events, broker) {
  const round = rounds(lane)[roundIndex];
  const prior = accepted(events).filter(e => e.payload.lane === lane.id && e.payload.arm === arm && e.payload.round < roundIndex);
  // Chamber 1 final outputs are the sole handoffs to chamber 2. Chamber 2 retains its own finals too.
  const retained = arm === ARMS[0] && round.phase === 'SYNTHESIS' ? prior.filter(e => e.payload.phase === 'STAGE2' || e.payload.phase === 'BASELINE') : prior;
  const prefix = broker.prefix(lane.sourceOrder.slice(0, round.prefix));
  const rawVisible = !(arm === ARMS[0] && ['STAGE2', 'SYNTHESIS'].includes(round.phase));
  const templateKey = round.phase === 'BASELINE' ? 'baseline' : round.phase === 'SYNTHESIS' ? 'synthesis' : arm === ARMS[0] ? round.phase === 'STAGE1' ? 'modular1' : 'modular2' : round.phase === 'STAGE1' ? 'union1' : 'union2';
  const history = retained.map(e => ({ turn: e.payload.turn, response: e.payload.response, response_digest: digest(e.payload.response), receipt_hash: e.hash }));
  const payload = { instruction: lane.templates[templateKey], phase: round.phase,
    sources: rawVisible ? prefix.sources : [], history: history.map(h => ({ turn: h.turn, response: h.response })),
    kernel: plan.kernelBinding, tool_policy: plan.toolPolicyBinding };
  return { prompt: canonical(payload), history, prefix_commitment: prefix.commitment, source_position: round.prefix,
    source_visibility: rawVisible ? 'AUTHORIZED_RAW_PREFIX' : 'OWN_FINAL_HANDOFFS_ONLY', phase: round.phase };
}

/** Transport contract: result is durable before accept; thrown/ambiguous calls are never retried. */
export class ResumableFlight {
  constructor({ journal, plan, policy, broker, transport, measureInput, observeRuntime, mirror = () => {}, pauseRequested = () => false, afterCapture = () => {} }) {
    validatePlan(plan); validatePolicy(policy);
    this.journal = journal; this.plan = plan; this.policy = policy; this.broker = broker;
    this.transport = transport; this.measureInput = measureInput; this.observeRuntime = observeRuntime;
    this.mirror = mirror; this.pauseRequested = pauseRequested; this.afterCapture = afterCapture;
    const root = journal.events().find(e => e.type === 'ROOT');
    if (root && root.payload.plan_digest !== digest(plan)) throw Error('FROZEN_CONDITION_DRIFT_HOLD');
    const manifestDigest = digest(broker.manifest());
    if (root && root.payload.source_manifest_digest !== manifestDigest) throw Error('SOURCE_MANIFEST_DRIFT_HOLD');
    if (!root) journal.append('ROOT', { experiment: plan.experiment, episode: plan.episode, plan_digest: digest(plan), source_manifest_digest: manifestDigest, plan });
  }
  pause(reason, detail = {}) { this.journal.append('PAUSE', { reason, ...detail }); return { status: 'PAUSED', reason, ...detail }; }
  async run({ windowId, policyAuthorization, runtimeAuthorization }) {
    if (!windowId || !policyAuthorization || !runtimeAuthorization) throw Error('EXTERNAL_POLICY_AND_RUNTIME_AUTHORIZATION_REQUIRED');
    const events = this.journal.events();
    const oldWindow = events.find(e => e.type === 'QUOTA_WINDOW' && e.payload.window === windowId);
    if (oldWindow && oldWindow.payload.policy_digest !== digest(this.policy)) throw Error('WINDOW_POLICY_REUSE_MISMATCH');
    if (!oldWindow) this.journal.append('QUOTA_WINDOW', { window: windowId, policy: this.policy, policy_digest: digest(this.policy), authorization: policyAuthorization });
    const observed = await this.observeRuntime();
    if (digest(observed) !== this.plan.runtimeBinding) return this.pause('MODEL_OR_RUNTIME_DRIFT_HOLD');
    this.journal.append('RUNTIME_CHECK', { observed, authorization: runtimeAuthorization, window: windowId });
    // Reconstruct mirrors ONLY from the authoritative journal. A failed mirror never licenses another call.
    for (const e of accepted(this.journal.events())) this.mirror(e);
    for (const lane of this.plan.lanes) {
      for (let r = 0; r < rounds(lane).length; r++) {
        const pair = `${lane.id}/${r}`;
        if (this.journal.events().some(e => e.type === 'PAIR_COMMITTED' && e.payload.pair === pair)) continue;
        const order = r % 2 === 0 ? ARMS : [...ARMS].reverse();
        for (const arm of order) {
          const turn = turnKey(lane.id, r, arm);
          let historyEvents = this.journal.events();
          if (accepted(historyEvents).some(e => e.payload.turn === turn)) continue;
          const pending = historyEvents.filter(e => e.type === 'DISPATCH_INTENT' && e.payload.turn === turn).filter(i => !historyEvents.some(e => ['TURN_ACCEPTED', 'REJECTED_NO_EXECUTION'].includes(e.type) && e.payload.attempt === i.payload.attempt));
          if (pending.length > 1) throw Error('DUPLICATE_PENDING_ATTEMPTS_HOLD');
          let intent = pending[0], captured;
          if (intent) {
            captured = historyEvents.find(e => e.type === 'RESULT_CAPTURED' && e.payload.attempt === intent.payload.attempt);
            if (!captured) return this.pause('UNCERTAIN_CALL_HOLD', { turn, attempt: intent.payload.attempt, pair_complete: false });
          } else {
            if (this.pauseRequested()) return this.pause('OPERATOR_PAUSE', { pair, pair_complete: false });
            const permission = canReserve(historyEvents, this.policy, windowId);
            if (!permission.permitted) return this.pause(permission.reason, { pair, accounting: permission, pair_complete: false });
            if (digest(await this.observeRuntime()) !== this.plan.runtimeBinding) return this.pause('MODEL_OR_RUNTIME_DRIFT_HOLD', { turn });
            const rendered = renderTurn(this.plan, lane, r, arm, historyEvents, this.broker);
            const count = this.measureInput(rendered.prompt);
            if (!Number.isSafeInteger(count) || count < 0 || count + this.plan.context.outputLimit > this.plan.context.inputLimit || count + this.plan.context.outputLimit > this.policy.reservationTokens) return this.pause('PHYSICAL_CONTEXT_OR_RESERVATION_HOLD', { turn, input_tokens: Number.isFinite(count) ? count : null });
            const rejectedCount = historyEvents.filter(e => e.type === 'REJECTED_NO_EXECUTION' && e.payload.turn === turn).length;
            if (rejectedCount > this.policy.maxRejectedRetries) return this.pause('REJECTED_RETRY_AUTHORITY_EXHAUSTED', { turn });
            const attempt = `${turn}/attempt-${rejectedCount + 1}`;
            intent = this.journal.append('DISPATCH_INTENT', { experiment: this.plan.experiment, episode: this.plan.episode,
              turn, pair, lane: lane.id, arm, round: r, phase: rendered.phase, attempt, window: windowId,
              configuration: this.plan.model, context: this.plan.context, runtime: observed,
              rendered, input_tokens_measured: count, reservation: permission.reservation,
              custody_lineage: lane.custodyLineage, kernel_binding: this.plan.kernelBinding, tool_policy_binding: this.plan.toolPolicyBinding });
            // The complete intent is committed with FULL synchronous durability BEFORE dispatch.
            try {
              const result = await this.transport({ ...intent.payload, capture: (channel, bytes) => this.journal.append('TRANSPORT_CHUNK', { attempt, channel, base64: Buffer.from(bytes).toString('base64') }) });
              captured = this.journal.append('RESULT_CAPTURED', { attempt, result });
              this.afterCapture(captured);
            } catch (error) {
              return this.pause('UNCERTAIN_CALL_HOLD', { turn, attempt, error_code: String(error.code ?? 'TRANSPORT_OR_CAPTURE_INTERRUPTED'), pair_complete: false });
            }
          }
          const result = captured.payload.result;
          if (result.status === 'REJECTED_NO_EXECUTION' && result.definitiveRejectionEvidence && this.plan.definitiveRejectionBinding === digest(result.definitiveRejectionEvidence.standard)) {
            this.journal.append('REJECTED_NO_EXECUTION', { turn, attempt: intent.payload.attempt, evidence: result.definitiveRejectionEvidence });
            return this.pause('PROVIDER_REJECTION_PAUSE', { turn, pair_complete: false });
          }
          if (result.status !== 'COMPLETED' || typeof result.response !== 'string' || !result.response.length || !result.completeEvidence || !result.observedIdentity || digest(result.observedIdentity) !== this.plan.runtimeBinding || !Array.isArray(result.tools) || !Array.isArray(result.kernelActivity) || result.isolationViolation === true) return this.pause('UNVERIFIED_RESULT_HOLD', { turn, pair_complete: false });
          const receipt = this.journal.append('TURN_ACCEPTED', { ...intent.payload, response: result.response,
            complete_evidence: result.completeEvidence, tools: result.tools, deterministic_kernel_activity: result.kernelActivity,
            usage: usageRecord(result), result_capture_hash: captured.hash, observed_identity: result.observedIdentity,
            execution_status: 'ACCEPTED', recovery_eligibility: 'EXACT_FINAL_OUTPUT_REPLAY_ONLY' });
          this.mirror(receipt);
        }
        const pairTurns = accepted(this.journal.events()).filter(e => e.payload.lane === lane.id && e.payload.round === r);
        if (pairTurns.length !== 2 || new Set(pairTurns.map(e => e.payload.arm)).size !== 2) throw Error('INCOMPLETE_PAIR_HOLD');
        this.journal.append('PAIR_COMMITTED', { pair, lane: lane.id, round: r, receipts: pairTurns.map(e => e.hash), score_eligible: false });
      }
    }
    return { status: 'REASONING_COMPLETE_STAGE2_REQUIRED', scientific_acceptance: false };
  }
}
