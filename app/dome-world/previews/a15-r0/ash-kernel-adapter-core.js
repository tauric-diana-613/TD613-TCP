import {
  compileCaseMap,
  verifyCaseMap,
  compileRoomRules,
  verifyRoomRules,
  compileRouteMemory,
  verifyRouteMemory,
  compileReaderProfile,
  compileRebuildTest,
  verifyRebuildTest,
  runDeterministicReader
} from '../../../engine/ash-keep-core.js';
import { compileSavePoint, verifySavePoint } from '../../../engine/ash-keep-continuity.js';
import { canonicalDigest } from '../../ash/canonical-json.js';
import {
  A15_R0_AUTHORITY_FLAGS,
  A15_R0_SCHEMAS,
  immutableCopy,
  validateGovernedTaskFixture,
  validateProjectionRunReceipt
} from './a15-r0-contracts.js';

export const ASH_KERNEL_ADAPTER_VERSION = 'td613.ash.a15-r0.kernel-adapter/v0.1';

const RECEIPT_DOMAIN = 'TD613:ASH:A15-R0:PROJECTION-RUN-RECEIPT:v1';

const ACTIONS = Object.freeze({
  BIND_REFERENCE: Object.freeze({
    required: 'ARRIVE',
    after: 'BIND_REFERENCE',
    worldAnswerId: 'world_bind_reference',
    worldAnswer: 'The Case Map now contains a governed reference relation.\nThe raw synthetic source remains local.'
  }),
  FORM_RELATION: Object.freeze({
    required: 'BIND_REFERENCE',
    after: 'FORM_RELATION',
    worldAnswerId: 'world_form_relation',
    worldAnswer: 'One named relation has been added to the synthetic case.\nThe receipt records the prior state, current state, and remaining unknowns.'
  }),
  COMPARE_ROUTE: Object.freeze({
    required: 'FORM_RELATION',
    after: 'COMPARE_ROUTE',
    worldAnswerId: 'world_compare_route',
    worldAnswer: 'Route A and Route B produced declared observations.\nShared, differing, missing, and unresolved material remain separated.\nNo intent or authorship is attributed.'
  }),
  PRESERVE: Object.freeze({
    required: 'COMPARE_ROUTE',
    after: 'PRESERVE',
    worldAnswerId: 'world_preserve',
    worldAnswer: 'A local continuity record has been prepared.\nTransport, destination crossing, release, and closure remain closed.'
  }),
  RETURN: Object.freeze({
    required: 'PRESERVE',
    after: 'RETURN',
    worldAnswerId: 'world_return',
    worldAnswer: 'The source/reference posture, route sequence, returned material, unresolved residue, and external unknowns are visible.\nHuman closure remains open.'
  }),
  REST: Object.freeze({
    required: null,
    after: null,
    worldAnswerId: 'world_rest',
    worldAnswer: 'Active demand has stopped.\nThe current synthetic state remains available for inspection or return.'
  }),
  RESET: Object.freeze({
    required: null,
    after: 'ARRIVE',
    worldAnswerId: 'world_reset',
    worldAnswer: 'The synthetic preview returned to ARRIVE.\nProduction state was not read, changed, or erased.'
  })
});

function unique(values = []) {
  return [...new Set(values.map(value => String(value)).filter(Boolean))];
}

function withoutDigest(value) {
  const output = structuredClone(value);
  delete output.receipt_digest;
  return output;
}

function intersection(left, right) {
  const rightSet = new Set(right);
  return unique(left.filter(value => rightSet.has(value)));
}

function difference(left, right) {
  const rightSet = new Set(right);
  return unique(left.filter(value => !rightSet.has(value)));
}

function coreReference(owner, record, verified) {
  return Object.freeze({
    owner,
    schema: record?.schema || null,
    record_id: record?.case_id || record?.test_id || record?.reader_id || record?.save_point_id || null,
    verification: verified ? 'VERIFIED' : 'HELD'
  });
}

async function buildInitialState(fixture, options) {
  const caseMap = await compileCaseMap({
    caseId: fixture.case_id,
    profile: fixture.profile,
    title: fixture.title,
    createdAt: fixture.created_at,
    updatedAt: fixture.created_at,
    rooms: fixture.rooms,
    nodes: [
      {
        id: fixture.case_anchor.node_id,
        type: 'entity',
        label: fixture.case_anchor.label,
        room_id: 'room_source',
        sensitivity: 'SYNTHETIC',
        source_status: 'SIMULATED',
        confidence_posture: 'DECLARED',
        disclosure_state: 'LOCAL',
        chronology_index: 0
      },
      {
        id: fixture.question.node_id,
        type: 'claim',
        label: fixture.question.label,
        room_id: 'room_question',
        sensitivity: 'SYNTHETIC',
        source_status: 'SIMULATED',
        confidence_posture: 'OPEN',
        disclosure_state: 'LOCAL',
        chronology_index: 1
      }
    ],
    relationships: [],
    privateChronology: ['Synthetic fixture arrived; no production record was read.'],
    intendedActions: fixture.allowed_action_sequence.slice(1),
    sourceStatus: 'SIMULATED',
    evidenceBasis: ['deterministic synthetic A15-R0 fixture'],
    observations: ['A synthetic case anchor and bounded question are present.'],
    missingness: ['source reference not yet bound', 'route comparison not yet run'],
    alternatives: ['reset the synthetic fixture'],
    openQuestions: ['Which declared route changes the bounded observation?']
  }, options);
  if (!await verifyCaseMap(caseMap, options)) throw new Error('Existing Case Map owner failed verification.');

  const roomRules = await compileRoomRules({
    caseId: fixture.case_id,
    createdAt: fixture.created_at,
    rules: fixture.route_rules,
    sourceStatus: 'SIMULATED',
    evidenceBasis: ['deterministic synthetic route rules'],
    observations: ['Two fixture-local routes are declared.'],
    missingness: ['no external route observation'],
    alternatives: ['keep the synthetic source local']
  }, options);
  if (!await verifyRoomRules(roomRules, options)) throw new Error('Existing Room Rules owner failed verification.');

  const routeMemory = await compileRouteMemory({
    caseId: fixture.case_id,
    createdAt: fixture.created_at,
    entries: [],
    controlledTestRecovery: [],
    operatorDeclaredAssumptions: ['Both route observations are simulated fixture declarations.'],
    unknown: ['External route knowledge was not measured.'],
    sourceStatus: 'SIMULATED',
    evidenceBasis: ['deterministic synthetic A15-R0 fixture'],
    observations: [],
    missingness: ['no route comparison yet'],
    alternatives: ['run the two declared fixture routes']
  }, options);
  if (!await verifyRouteMemory(routeMemory, options)) throw new Error('Existing Route Memory owner failed verification.');

  return {
    taskState: 'ARRIVE',
    restActive: false,
    caseMap,
    roomRules,
    routeMemory,
    reader: null,
    rebuildTest: null,
    savePoint: null,
    returnSummary: null,
    lastReceipt: null
  };
}

class AshKernelAdapter {
  #fixture;

  constructor(fixture, options = {}) {
    this.#fixture = immutableCopy(validateGovernedTaskFixture(fixture));
    Object.defineProperty(this, 'fixture', {
      enumerable: true,
      configurable: false,
      get: () => this.#fixture
    });
    this.cryptoImpl = options.cryptoImpl || globalThis.crypto;
    this.sequence = 0;
    this.disposed = false;
    this.state = null;
    this.mutationTail = Promise.resolve();
  }

  options() {
    return { cryptoImpl: this.cryptoImpl };
  }

  assertAvailable() {
    if (this.disposed || !this.state || !this.#fixture) throw new Error('The A15-R0 preview adapter is disposed.');
  }

  enqueueMutation(operation) {
    const run = this.mutationTail.then(operation, operation);
    this.mutationTail = run.then(() => undefined, () => undefined);
    return run;
  }

  mutationCheckpoint() {
    return Object.freeze({
      state: this.state ? { ...this.state } : null,
      sequence: this.sequence
    });
  }

  restoreMutationCheckpoint(checkpoint) {
    this.state = checkpoint.state ? { ...checkpoint.state } : null;
    this.sequence = checkpoint.sequence;
  }

  stateSummary(state = this.state) {
    return {
      task_state: state.taskState,
      rest_active: state.restActive,
      nodes: state.caseMap?.nodes?.length || 0,
      relationships: state.caseMap?.relationships?.length || 0,
      route_entries: state.routeMemory?.entries?.length || 0,
      controlled_route_observations: state.routeMemory?.controlled_test_recovery?.length || 0,
      rebuild_state: state.rebuildTest?.calibration_state || 'NOT_RUN',
      continuity_state: state.savePoint?.closure?.status || 'NOT_PREPARED',
      return_state: state.returnSummary ? 'VISIBLE' : 'NOT_RETURNED'
    };
  }

  caseMapInput(changes = {}) {
    const current = this.state.caseMap;
    return {
      caseId: current.case_id,
      profile: current.profile,
      title: current.title,
      createdAt: current.created_at,
      updatedAt: changes.updatedAt || current.updated_at,
      custodyReference: current.custody_reference,
      tamperState: current.tamper_state,
      rooms: changes.rooms || current.rooms,
      nodes: changes.nodes || current.nodes,
      relationships: changes.relationships || current.relationships,
      privateChronology: changes.privateChronology || current.private_chronology,
      intendedActions: current.intended_actions,
      sourceStatus: current.source_status,
      evidenceBasis: current.evidence_basis,
      observations: changes.observations || current.observations,
      missingness: changes.missingness || current.missingness,
      alternatives: current.alternatives,
      openQuestions: current.open_questions,
      operatorNotes: current.operator_notes,
      closureStatus: current.closure.status
    };
  }

  async sealReceipt(actionId, {
    before,
    status = 'OPEN',
    ownerReceipts = [],
    observations = [],
    missingness = [],
    alternatives = [],
    openQuestions = [],
    returnSummary = null,
    worldAnswer = null,
    worldAnswerId = null
  } = {}) {
    const action = ACTIONS[actionId];
    const nextSequence = this.sequence + 1;
    const receipt = {
      schema: A15_R0_SCHEMAS.runReceipt,
      receipt_id: `a15r0_receipt_${String(nextSequence).padStart(3, '0')}_${actionId.toLowerCase()}`,
      fixture_id: this.#fixture.fixture_id,
      case_id: this.#fixture.case_id,
      action_id: actionId,
      status,
      created_at: this.#fixture.action_times[actionId] || this.#fixture.created_at,
      state_before: before,
      state_after: this.stateSummary(),
      source_status: 'SIMULATED',
      sensor_id: 'simulated-fixture',
      authority_class: 'A2_DERIVATIONAL',
      world_answer_id: worldAnswerId || action.worldAnswerId,
      world_answer: worldAnswer || action.worldAnswer,
      owner_receipts: ownerReceipts,
      observations,
      missingness,
      alternatives,
      open_questions: openQuestions,
      claim_ceiling: [...this.#fixture.claim_ceiling],
      authority: { ...A15_R0_AUTHORITY_FLAGS },
      human_closure_required: true,
      receipt_digest: null
    };
    if (returnSummary) receipt.return_summary = returnSummary;
    receipt.receipt_digest = await canonicalDigest(RECEIPT_DOMAIN, withoutDigest(receipt), this.options());
    validateProjectionRunReceipt(receipt);
    this.sequence = nextSequence;
    this.state.lastReceipt = immutableCopy(receipt);
    return immutableCopy(receipt);
  }

  async hold(actionId, required, before) {
    return this.sealReceipt(actionId, {
      before,
      status: 'HELD',
      observations: [`${actionId} was held because the fixture is at ${this.state.taskState}.`],
      missingness: [`required state ${required}`],
      alternatives: [`Complete ${required} through its visible control.`],
      openQuestions: ['Will the operator continue the synthetic sequence?'],
      worldAnswerId: `world_hold_${actionId.toLowerCase()}`,
      worldAnswer: `${actionId} is held until ${required} is complete. No Ash authority or production state changed.`
    });
  }

  async transition(actionId, operation) {
    return this.enqueueMutation(async () => {
      this.assertAvailable();
      const action = ACTIONS[actionId];
      const before = this.stateSummary();
      if (action.required && this.state.taskState !== action.required) return this.hold(actionId, action.required, before);
      const checkpoint = this.mutationCheckpoint();
      try {
        this.state.restActive = false;
        const detail = await operation();
        this.state.taskState = action.after;
        return await this.sealReceipt(actionId, { before, ...detail });
      } catch (error) {
        this.restoreMutationCheckpoint(checkpoint);
        throw error;
      }
    });
  }

  async snapshot() {
    await this.mutationTail;
    this.assertAvailable();
    return immutableCopy({
      schema: 'td613.ash.a15-r0.kernel-snapshot/v0.1',
      adapter: ASH_KERNEL_ADAPTER_VERSION,
      fixture_id: this.#fixture.fixture_id,
      case_id: this.#fixture.case_id,
      task_state: this.state.taskState,
      rest_active: this.state.restActive,
      case_map: this.state.caseMap,
      room_rules: this.state.roomRules,
      route_memory: this.state.routeMemory,
      rebuild_test: this.state.rebuildTest,
      save_point: this.state.savePoint,
      return_summary: this.state.returnSummary,
      last_receipt: this.state.lastReceipt,
      production_state_read: false,
      production_state_mutated: false,
      raw_bytes_moved: false,
      human_closure_required: true
    });
  }

  async bindReference() {
    return this.transition('BIND_REFERENCE', async () => {
      const fixture = this.#fixture;
      const sourceNode = {
        id: fixture.local_source.reference_id,
        type: 'source',
        label: fixture.local_source.label,
        room_id: 'room_source',
        sensitivity: 'SYNTHETIC',
        source_status: 'SIMULATED',
        confidence_posture: 'DECLARED',
        custody_reference: null,
        disclosure_state: 'LOCAL',
        chronology_index: 2
      };
      const attachedRelation = {
        id: 'relation_reference_attached',
        from: sourceNode.id,
        to: fixture.case_anchor.node_id,
        type: 'attached-to',
        room_id: 'room_source',
        sensitivity: 'SYNTHETIC',
        source_status: 'SIMULATED',
        confidence_posture: 'DECLARED',
        disclosure_state: 'LOCAL'
      };
      const caseMap = await compileCaseMap(this.caseMapInput({
        updatedAt: fixture.action_times.BIND_REFERENCE,
        nodes: [...this.state.caseMap.nodes, sourceNode],
        relationships: [...this.state.caseMap.relationships, attachedRelation],
        privateChronology: [...this.state.caseMap.private_chronology, 'Synthetic source reference attached to the case anchor.'],
        observations: [...this.state.caseMap.observations, 'A governed synthetic reference relation was added.'],
        missingness: this.state.caseMap.missingness.filter(item => item !== 'source reference not yet bound')
      }), this.options());
      const verified = await verifyCaseMap(caseMap, this.options());
      if (!verified) throw new Error('Existing Case Map owner failed after BIND_REFERENCE.');
      this.state.caseMap = caseMap;
      return {
        ownerReceipts: [coreReference('app/engine/ash-keep-core.js#compileCaseMap', caseMap, verified)],
        observations: ['A governed reference relation is present.', 'The synthetic raw-byte posture remains local.'],
        missingness: ['question relation not yet formed', 'external knowledge not measured'],
        alternatives: ['leave the reference attached without further comparison'],
        openQuestions: ['Should the reference be connected to the bounded question?']
      };
    });
  }

  async formRelation() {
    return this.transition('FORM_RELATION', async () => {
      const fixture = this.#fixture;
      const relation = {
        id: 'relation_source_informs_question',
        from: fixture.local_source.reference_id,
        to: fixture.question.node_id,
        type: 'informs',
        room_id: null,
        sensitivity: 'SYNTHETIC',
        source_status: 'SIMULATED',
        confidence_posture: 'OPEN',
        disclosure_state: 'LOCAL'
      };
      const caseMap = await compileCaseMap(this.caseMapInput({
        updatedAt: fixture.action_times.FORM_RELATION,
        relationships: [...this.state.caseMap.relationships, relation],
        privateChronology: [...this.state.caseMap.private_chronology, 'Synthetic reference connected to the bounded question.'],
        observations: [...this.state.caseMap.observations, 'One named synthetic relation was added.']
      }), this.options());
      const verified = await verifyCaseMap(caseMap, this.options());
      if (!verified) throw new Error('Existing Case Map owner failed after FORM_RELATION.');
      this.state.caseMap = caseMap;
      return {
        ownerReceipts: [coreReference('app/engine/ash-keep-core.js#compileCaseMap', caseMap, verified)],
        observations: ['One named relation connects the source reference to the bounded question.'],
        missingness: ['route effects not yet compared', 'external knowledge not measured'],
        alternatives: ['retain only the attachment relation'],
        openQuestions: ['How do the two declared routes differ?']
      };
    });
  }

  async compareRoute() {
    return this.transition('COMPARE_ROUTE', async () => {
      const routeA = this.#fixture.route_observations.route_a;
      const routeB = this.#fixture.route_observations.route_b;
      const emptyRouteMemory = this.state.routeMemory;
      const observationA = runDeterministicReader({
        caseMap: this.state.caseMap,
        routeMemory: emptyRouteMemory,
        proposedReferences: routeA.proposed_references
      });
      const observationB = runDeterministicReader({
        caseMap: this.state.caseMap,
        routeMemory: emptyRouteMemory,
        proposedReferences: routeB.proposed_references
      });

      const routeMemory = await compileRouteMemory({
        caseId: this.#fixture.case_id,
        createdAt: this.#fixture.action_times.COMPARE_ROUTE,
        entries: [],
        controlledTestRecovery: [
          { route_id: 'route_a', label: routeA.label, recovered: observationA.after },
          { route_id: 'route_b', label: routeB.label, recovered: observationB.after }
        ],
        operatorDeclaredAssumptions: ['Both routes are fixture-declared simulations.'],
        unknown: ['No external reader or platform was contacted.', 'External retention and inference remain unknown.'],
        sourceStatus: 'SIMULATED',
        evidenceBasis: ['deterministic reader over fixture-declared opaque references'],
        observations: ['Route A and Route B were compared locally.'],
        missingness: unique([...routeA.missingness, ...routeB.missingness]),
        alternatives: ['different route projections may produce different bounded observations']
      }, this.options());
      const routeVerified = await verifyRouteMemory(routeMemory, this.options());
      if (!routeVerified) throw new Error('Existing Route Memory owner failed after COMPARE_ROUTE.');

      const reader = await compileReaderProfile({
        readerId: 'reader_a15r0_deterministic',
        label: 'A15-R0 deterministic fixture reader',
        readerClass: 'deterministic-baseline',
        version: 'v0.1',
        sourceStatus: 'SIMULATED',
        repeatCount: 2,
        seeded: true,
        evidenceBasis: ['fixture-declared opaque references'],
        observations: ['Two bounded route projections were computed.'],
        missingness: ['no external reader observation'],
        alternatives: ['another declared reader may produce a different result']
      }, this.options());

      const rebuildTest = await compileRebuildTest({
        testId: 'rebuild_a15r0_route_pair',
        caseMap: this.state.caseMap,
        routeMemory,
        reader,
        createdAt: this.#fixture.action_times.COMPARE_ROUTE,
        trials: [
          { trial_id: 'trial_route_a', seed: 101, state: 'OBSERVED', before: observationA.before, after: observationA.after, observations: [routeA.label], missingness: routeA.missingness },
          { trial_id: 'trial_route_b', seed: 202, state: 'OBSERVED', benign_control: true, held_out: true, before: observationB.before, after: observationB.after, observations: [routeB.label], missingness: routeB.missingness }
        ],
        calibration: {
          preregisteredFixture: true,
          sourceDriftCheck: true,
          alternativeReader: false,
          exactThresholds: {}
        },
        sourceDriftState: 'SOURCE_HELD',
        signedResidue: [{
          shared: intersection(routeA.proposed_references, routeB.proposed_references),
          route_a_only: difference(routeA.proposed_references, routeB.proposed_references),
          route_b_only: difference(routeB.proposed_references, routeA.proposed_references),
          unresolved: ['external response unavailable']
        }],
        sourceStatus: 'SIMULATED',
        evidenceBasis: ['deterministic fixture reader', 'two declared route projections'],
        observations: ['Shared and differing opaque references remain separate.'],
        missingness: ['alternative reader absent', 'external response unavailable'],
        alternatives: ['another declared reader may disagree'],
        openQuestions: ['Would another declared reader preserve the same residue?']
      }, this.options());
      const rebuildVerified = await verifyRebuildTest(rebuildTest, this.options());
      if (!rebuildVerified) throw new Error('Existing Rebuild Test owner failed after COMPARE_ROUTE.');

      this.state.routeMemory = routeMemory;
      this.state.reader = reader;
      this.state.rebuildTest = rebuildTest;
      return {
        ownerReceipts: [
          coreReference('app/engine/ash-keep-core.js#compileRouteMemory', routeMemory, routeVerified),
          coreReference('app/engine/ash-keep-core.js#compileReaderProfile', reader, true),
          coreReference('app/engine/ash-keep-core.js#compileRebuildTest', rebuildTest, rebuildVerified)
        ],
        observations: ['Route A and Route B produced declared local observations.', 'Shared and differing material remain separated.'],
        missingness: ['alternative reader absent', 'external response unavailable', 'calibration not earned'],
        alternatives: ['run a later assay with an independently declared Reader'],
        openQuestions: ['Does a second lawful Reader reproduce the same bounded difference?']
      };
    });
  }

  async preserve() {
    return this.transition('PRESERVE', async () => {
      const savePoint = await compileSavePoint({
        savePointId: 'save_a15r0_fixed_kernel',
        caseId: this.#fixture.case_id,
        createdAt: this.#fixture.action_times.PRESERVE,
        caseMapDigest: this.state.caseMap.case_map_digest,
        routeMemoryDigest: this.state.routeMemory.route_memory_digest,
        evidenceInventory: ['synthetic Case Map', 'synthetic Route Memory', 'synthetic Rebuild Test'],
        unansweredQuestions: ['external route response unavailable', 'alternative Reader absent'],
        corroborationState: [{ status: 'NOT_APPLICABLE', reason: 'synthetic fixture' }],
        hypothesisPosture: [{ status: 'OPEN', statement: 'Declared routes expose different bounded relations.' }],
        nextStepPosture: ['return the local synthetic result to custody for inspection'],
        tamperState: 'CLEAR',
        observations: ['A local continuity record was prepared from verified synthetic records.'],
        missingness: ['no release receipt', 'no external return evidence'],
        alternatives: ['leave the synthetic result unpreserved'],
        openQuestions: ['Will the operator inspect the return posture?']
      }, this.options());
      const verified = await verifySavePoint(savePoint, this.options());
      if (!verified) throw new Error('Existing Save Point owner failed after PRESERVE.');
      this.state.savePoint = savePoint;
      return {
        ownerReceipts: [coreReference('app/engine/ash-keep-continuity.js#compileSavePoint', savePoint, verified)],
        observations: ['A verified local Save Point now references the synthetic Case Map and Route Memory.'],
        missingness: ['no release receipt', 'no destination', 'no external return evidence'],
        alternatives: ['retain the current state without a Save Point'],
        openQuestions: ['What returned, what stayed local, and what remains unknown?']
      };
    });
  }

  async returnToCustody() {
    return this.transition('RETURN', async () => {
      const verifications = {
        case_map: await verifyCaseMap(this.state.caseMap, this.options()),
        room_rules: await verifyRoomRules(this.state.roomRules, this.options()),
        route_memory: await verifyRouteMemory(this.state.routeMemory, this.options()),
        rebuild_test: await verifyRebuildTest(this.state.rebuildTest, this.options()),
        save_point: await verifySavePoint(this.state.savePoint, this.options())
      };
      if (Object.values(verifications).some(value => value !== true)) throw new Error('Return composition held because one existing owner failed verification.');

      const returnSummary = {
        what_was_sent: [],
        what_returned: [
          'declared Route A observation',
          'declared Route B observation',
          'bounded signed residue',
          'verified local continuity reference'
        ],
        what_remained_local: [
          'synthetic source posture',
          'Case Map',
          'Room rules',
          'Route Memory',
          'Save Point'
        ],
        what_remains_unknown_externally: [
          'No external system was contacted.',
          'External retention, knowledge, and reconstruction were not measured.'
        ],
        authority_stayed_open: [
          'release',
          'destination crossing',
          'human projection selection',
          'human closure'
        ]
      };
      this.state.returnSummary = returnSummary;
      return {
        ownerReceipts: [
          coreReference('app/engine/ash-keep-core.js#verifyCaseMap', this.state.caseMap, verifications.case_map),
          coreReference('app/engine/ash-keep-core.js#verifyRoomRules', this.state.roomRules, verifications.room_rules),
          coreReference('app/engine/ash-keep-core.js#verifyRouteMemory', this.state.routeMemory, verifications.route_memory),
          coreReference('app/engine/ash-keep-core.js#verifyRebuildTest', this.state.rebuildTest, verifications.rebuild_test),
          coreReference('app/engine/ash-keep-continuity.js#verifySavePoint', this.state.savePoint, verifications.save_point)
        ],
        observations: ['The bounded synthetic return composition verified all participating owner records.'],
        missingness: ['external return evidence', 'external deletion evidence', 'human closure'],
        alternatives: ['continue local inspection without closing the run'],
        openQuestions: ['Which projection, if any, should a human select later?'],
        returnSummary
      };
    });
  }

  async rest(reason = 'operator selected Rest') {
    return this.enqueueMutation(async () => {
      this.assertAvailable();
      const checkpoint = this.mutationCheckpoint();
      const before = this.stateSummary();
      try {
        this.state.restActive = true;
        return await this.sealReceipt('REST', {
          before,
          observations: [String(reason), 'No new demand or state transition was introduced.'],
          missingness: [...(this.state.lastReceipt?.missingness || [])],
          alternatives: ['resume the current synthetic sequence', 'reset the synthetic fixture'],
          openQuestions: ['Will the operator resume or reset?']
        });
      } catch (error) {
        this.restoreMutationCheckpoint(checkpoint);
        throw error;
      }
    });
  }

  async resetFixture() {
    return this.enqueueMutation(async () => {
      if (this.disposed) throw new Error('Disposed A15-R0 preview adapters are terminal; create a new adapter.');
      this.assertAvailable();
      const checkpoint = this.mutationCheckpoint();
      const before = this.stateSummary();
      try {
        this.state = await buildInitialState(this.#fixture, this.options());
        return await this.sealReceipt('RESET', {
          before,
          observations: ['Only the in-memory synthetic preview run was reset.'],
          missingness: ['no prior synthetic run remains in this adapter instance'],
          alternatives: ['begin the governed sequence'],
          openQuestions: ['Will the operator keep the synthetic reference?']
        });
      } catch (error) {
        this.restoreMutationCheckpoint(checkpoint);
        throw error;
      }
    });
  }

  async dispose() {
    return this.enqueueMutation(async () => {
      if (this.disposed) throw new Error('The A15-R0 preview adapter is already disposed.');
      this.assertAvailable();
      const fixtureId = this.#fixture.fixture_id;
      this.state = null;
      this.#fixture = null;
      this.disposed = true;
      return Object.freeze({
        schema: 'td613.ash.a15-r0.preview-disposal-receipt/v0.1',
        fixture_id: fixtureId,
        preview_memory_released: true,
        case_migration_required: false,
        indexeddb_mutated: false,
        caches_mutated: false,
        workers_mutated: false,
        release_rollback_required: false,
        deployment_required: false,
        external_erasure_claimed: false,
        human_closure_required: true
      });
    });
  }
}

export async function createAshKernelAdapter(fixture, options = {}) {
  const adapter = new AshKernelAdapter(fixture, options);
  adapter.state = await buildInitialState(adapter.fixture, adapter.options());
  return adapter;
}
