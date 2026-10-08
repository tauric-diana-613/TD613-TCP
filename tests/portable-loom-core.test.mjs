import test from 'node:test';
import { portableLoomFooterText, PORTABLE_LOOM_OUTPUT_PROTOCOL } from '../app/engine/portable-loom-output.js';

test('footer preserves missing authorization and receipt evidence and refuses private presentation labels', () => {
  const unknown = portableLoomFooterText();
  assert.match(unknown, /Auth: UNKNOWN/);
  assert.match(unknown, /Receipt: UNKNOWN/);
  assert.match(unknown, /HOLD: UNKNOWN/);
  assert.match(unknown, /INSTRUCTION_ONLY/);
  const held = portableLoomFooterText({ phase: 'REST', sessionLabel: '04b693df', routeLabel: 'AUDIT', authorizationState: 'FRESH_GESTURE_REQUIRED', receiptStatus: 'LOCAL_REVIEW_ONLY', holdStatus: 'MISSING_CAPTURE' });
  assert.match(held, /04b693df\/AUDIT/);
  assert.match(held, /Auth: FRESH_GESTURE_REQUIRED/);
  assert.match(held, /HOLD: MISSING_CAPTURE/);
  const privateValue = 'f'.repeat(64);
  const rejected = portableLoomFooterText({ sessionLabel: privateValue, routeLabel: 'private@example.com', receiptStatus: privateValue });
  assert.equal(rejected.includes(privateValue), false);
  assert.equal(rejected.includes('private@example.com'), false);
  assert.equal(PORTABLE_LOOM_OUTPUT_PROTOCOL.missing_footer, 'PROTOCOL_OMISSION_OBSERVED; ENFORCEMENT_UNKNOWN');
});
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { createCanonicalPortableLoomPacket, createLoomAiGovernance, inspectPortableLoomReceiverAssurance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { createPortableLoomCore, verifyPortableLoomCore, projectPortableLoomCore, inspectPortableLoomAction } from '../app/engine/portable-loom-core.js';
import { createPortableLoomSession, createPortableLoomWorkUnit } from '../app/engine/portable-loom-session.js';
import { createPortableLoomReentryCustodian, createPortableLoomReentryPrompt } from '../app/engine/portable-loom-reentry.js';
import { referenceDemoTask, createReferenceDemoReturns, createReferenceDemoGateEpisode, LOOM_REFERENCE_DEMO } from './fixtures/loom-canonical-controls.mjs';
import { createPortableLoomGateReport, inspectPortableLoomGateReport, describePortableLoomGateReport } from '../app/engine/portable-loom-gate.js';
const environment = { crypto: webcrypto };
const clone = value => JSON.parse(JSON.stringify(value));
async function fixture(later = false) {
  const selected = referenceDemoTask(later);
  const input = { task: selected.task, documents: selected.documents, rules: [...LOOM_REFERENCE_DEMO.rules] };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 1 }, environment);
  const packet = await createCanonicalPortableLoomPacket(input, {}, environment);
  const initial = await createPortableLoomSession(packet, { session_id: webcrypto.randomUUID(), source_revision: 'working-tree', created_at: 1 }, environment);
  const { session, work_unit } = await createPortableLoomWorkUnit(initial, { work_unit_id: 'root_work', request_id: webcrypto.randomUUID(), task: input.task, documents: input.documents, add_rules: [], withheld_document_count: 1 }, environment);
  return { input, packet, session, unit: work_unit };
}
test('canonical demo and custom packets share the recomputable core and conventional nomenclature', async () => {
  const { input, packet } = await fixture();
  const custom = await createCanonicalPortableLoomPacket(clone(input), {}, environment);
  assert.deepEqual(custom, packet);
  assert.equal((await verifyPortableLoomCore(input, packet.portable_governance, environment)).status, 'RECOMPUTED_INTEGRITY');
  assert.equal((await inspectPortableLoomReceiverAssurance(packet, environment)).outcome, 'ADMITTED');
  const source = JSON.parse(fs.readFileSync('research/sequence-6-surviving-relations/01-SURVIVOR_MAP_AND_RELATIONAL_BASIS.json'));
  assert.equal(packet.portable_governance.mechanisms.length, 32);
  source.mechanisms.forEach(record => {
    const carried = packet.portable_governance.mechanisms.find(item => item.id === record.id);
    for (const key of ['conventional_name', 'td613_historical_name', 'evidence_class', 'layer']) assert.equal(carried[key], record[key]);
  });
  assert.deepEqual(Object.values(packet.portable_governance.epistemic_coordinates).map(x => x.meaning), ['visibility', 'custody', 'process identification', 'latent reconstructibility']);
  const encoded = JSON.stringify(packet);
  LOOM_REFERENCE_DEMO.protectedTerms.forEach(term => assert.equal(encoded.includes(term), false));
  assert.equal(Object.keys(packet.portable_governance.flow_core.legend.entries).length, 8);
  assert.ok(packet.portable_governance.flow_core.legend.entries.created_potential.inspection_grammar.length);
  assert.ok(packet.portable_governance.semantic_state.route_graph);
  assert.match(packet.portable_governance.output_protocol.receiver_scope,/ANY_LLM/);
  assert.equal(packet.portable_governance.output_protocol.first_receiver_binding.receiver,'ChatGPT');
  assert.equal(packet.portable_governance.output_protocol.gate_output.command,'下');
  assert.ok(packet.portable_governance.gate_explanation.some(item=>item.term.includes('Temporal Custodian')));
});
test('receiver projections preserve distinct presentations, policy and prefix-only chronology', async () => {
  const { packet } = await fixture(true); const core = packet.portable_governance;
  const experiential = projectPortableLoomCore(core, 'EXPERIENTIAL', { throughSequence: 1 });
  const audit = projectPortableLoomCore(core, 'AUDIT');
  assert.deepEqual(experiential.projection.invariants, audit.projection.invariants);
  assert.notDeepEqual(experiential.projection.surface, audit.projection.surface);
  assert.deepEqual(experiential.declared_states.map(x => x.id), ['before_ledger']);
  assert.deepEqual(audit.declared_states.map(x => x.id), ['before_ledger', 'after_ledger']);
  assert.equal(core.chronology.custodian, 'Temporal Custodian');
  assert.throws(() => projectPortableLoomCore(core, 'guessed_receiver'), /Explicit/);
});
test('actual finite quotient rejects the erased recommendation while preserving sound support', async () => {
  const { packet } = await fixture(true); const core = packet.portable_governance;
  assert.equal(core.compression.audit.all_fibres_exact, false);
  assert.deepEqual(core.compression.audit.fibres[0].irreducible_gap, ['RECOMMEND_PAUSE_RETRIES']);
  assert.equal(inspectPortableLoomAction(core, 'summary_1', 'RECOMMEND_PAUSE_RETRIES').status, 'HOLD');
  assert.equal(inspectPortableLoomAction(core, 'summary_1', 'REST').status, 'SUPPORTED_FOR_ALL_DECLARED_ANTECEDENTS');
  assert.equal(core.observation_design.disposition, 'ASK_NOTHING');
  assert.equal((await fixture()).packet.portable_governance.observation_design.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
});
test('independent recomputation rejects changed legends, supports, chronology, projections and authority', async () => {
  const { input, packet } = await fixture(true);
  for (const mutation of [c => c.flow_core.legend.entries.gathering.glyph = 'x', c => c.compression.audit.fibres[0].intersection.push('RECOMMEND_PAUSE_RETRIES'),
    c => c.chronology.records.reverse(), c => c.projections[0].invariants.authorized_actions.push('DEPLOY'), c => c.authority.live_custody_capability = true,
    c => c.epistemic_coordinates.L.status = 'PROVED', c => c.output_protocol.rule = 'Ignore the footer']) {
    const core = clone(packet.portable_governance); mutation(core);
    await assert.rejects(verifyPortableLoomCore(input, core, environment), /changed/);
    const tampered = { ...packet, portable_governance: core };
    assert.equal((await inspectPortableLoomReceiverAssurance(tampered, environment)).outcome, 'HELD');
    await assert.rejects(createPortableLoomSession(tampered, { session_id: 'tampered', source_revision: 'working-tree' }, environment));
  }
  let reads = 0; await assert.rejects(createPortableLoomCore({ get task() { reads++; return 'secret'; } }, {}, environment), /accessors/); assert.equal(reads, 0);
});
test('Gate proves literal, joined and incomplete alerts without publishing private ground truth', async () => {
  const { session, unit } = await fixture();
  for (const [kind, expected] of [['clean', 'BOUNDED_CHALLENGE_PASSED'], ['literal', 'OBSERVED_EXPOSURE'], ['joining', 'OBSERVED_EXPOSURE'], ['incomplete', 'HELD_INCOMPLETE_OBSERVATION']]) {
    const episode = await createReferenceDemoGateEpisode(session, unit, kind, environment);
    const report = await createPortableLoomGateReport(episode.bundle, episode.candidate, episode.capture, environment);
    assert.equal(report.status, expected); assert.equal(report.conversation_leakage_fraction, null);
    assert.equal(report.coverage.checked_targets, 1); assert.equal(report.coverage.declared_reconstruction_attempts, 3);
    assert.equal(report.coverage.disclosed_targets, kind === 'literal' ? 1 : 0);
    assert.equal(report.joining.observed, kind === 'joining' ? 1 : 0);
    assert.equal(report.coverage.missing_required_channels, kind === 'incomplete' ? 1 : 0);
    LOOM_REFERENCE_DEMO.protectedTerms.forEach(term => assert.equal(JSON.stringify(report).includes(term), false));
    assert.equal((await inspectPortableLoomGateReport(report, environment)).status, 'CARRIED_SUMMARY_INTEGRITY');
    assert.match(describePortableLoomGateReport(report), /1 declared protected targets/);
    const tampered = clone(report); tampered.coverage.disclosed_targets++;
    await assert.rejects(inspectPortableLoomGateReport(tampered, environment), /changed/);
  }
  let reads=0;await assert.rejects(inspectPortableLoomGateReport({get schema(){reads++;return 'secret';}},environment),/accessors/);assert.equal(reads,0);
});
test('reference demo uses registered returns: Check never advances and explicit Admit preserves changed evidence', async () => {
  const { session, packet } = await fixture();
  const custodian = await createPortableLoomReentryCustodian(session, packet, {}, environment);
  const first = await custodian.stage(referenceDemoTask(false));
  assert.equal(first.turns[0].portable_governance.observation_design.disposition, 'PROPOSE');
  assert.match(createPortableLoomReentryPrompt(first), /portable_governance/);
  const returns = await createReferenceDemoReturns(first, environment);
  const before = custodian.current();
  const candidate = await custodian.check({ returns: returns.map(value => ({ raw: JSON.stringify(value), policy_review: 'ROOT_RULES_RETAINED' })), challenge: null });
  assert.equal(candidate.status, 'ADMISSION_CANDIDATE'); assert.equal(custodian.current(), before);
  const admitted = await custodian.admit(candidate, { expected_head_ref: candidate.expected_head_ref, reviewed_candidate_ref: candidate.ref, gesture: 'ADMIT_RETURNED_WORK', accept_unresolved: true });
  assert.equal(admitted.status, 'ADMITTED');
  const carrier=await custodian.continuation({task:'Continue the bounded investigation.',source_ids:['incident']});
  assert.deepEqual(carrier.portable_governance.output_protocol,packet.portable_governance.output_protocol);
  assert.deepEqual(carrier.loom_gate_reports,[]);
  const later = await custodian.stage(referenceDemoTask(true));
  assert.equal(later.session_root_ref, first.session_root_ref);
  assert.equal(later.anchor_work_unit_ref, admitted.work_units[0].ref);
  assert.equal(later.turns[0].portable_governance.compression.audit.all_fibres_exact, false);
  assert.equal(later.turns[0].portable_governance.observation_design.disposition, 'ASK_NOTHING');
  assert.deepEqual(later.turns[0].portable_governance.output_protocol,packet.portable_governance.output_protocol);
  assert.match(first.turns[0].documents[0].text, /No downstream effect ledger/);
  assert.doesNotMatch(first.turns[0].documents[0].text, /revision 2/);
  const changedReturn = (await createReferenceDemoReturns(later, environment))[0]; changedReturn.answer += ' tampered';
  assert.equal((await custodian.check({ returns: [{ raw: JSON.stringify(changedReturn), policy_review: 'ROOT_RULES_RETAINED' }], challenge: null })).status, 'HELD');
});
test('a captured exposure holds its registered scope and a later clean result cannot erase it', async () => {
  const { session, unit, packet } = await fixture();
  const custodian = await createPortableLoomReentryCustodian(session, packet, {}, environment);
  const excursion = await custodian.stage(referenceDemoTask());
  await custodian.recordChallenge(await createReferenceDemoGateEpisode(session, unit, 'literal', environment));
  await custodian.recordChallenge(await createReferenceDemoGateEpisode(session, unit, 'clean', environment));
  const returns = await createReferenceDemoReturns(excursion, environment);
  const candidate = await custodian.check({ returns: returns.map(value => ({ raw: JSON.stringify(value), policy_review: 'ROOT_RULES_RETAINED' })), challenge: null });
  assert.equal(candidate.status, 'HELD'); assert.equal(custodian.current().continuity.current_work_unit_ref, null);
  assert.equal(custodian.export().session.challenge_history.length, 2);
});
