import assert from 'assert';
import {
  buildHushLlmPromptContractV3,
  buildPhase37ProviderTelemetry,
  HUSH_FLIGHT_PACKET_VERSION,
  HUSH_LLM_CANDIDATE_V3,
  HUSH_PROVIDER_PHASE37_VERSION
} from '../app/engine/hush-generator-provider-phase35.js';
import { normalizeRemoteProviderResponse } from '../app/engine/hush-generator-provider.js';
import { buildHushSwap } from '../app/engine/hush-swap-patch38.js';

const sourceText = 'Can this message keep its uncertainty without becoming bland? I do not want the rewrite to answer the question or add facts.';
const mask = {
  id: 'test-lyric-mask',
  label: 'Test Lyric Mask',
  family: 'lyric cadence',
  description: 'A jagged but warm mask with short bends, image pressure, and human hesitation.',
  intendedUse: 'protected communication',
  riskTell: 'assistant polish',
  profile: {
    rhythm: 'short-long alternation',
    avgSentenceLength: 11,
    formality: 'medium',
    warmth: 'warm',
    compression: 'medium',
    metaphorTolerance: 'high'
  },
  dictionHints: ['hush', 'bend', 'warm'],
  transitionBank: ['still', 'but listen'],
  avoidList: ['For the record'],
  transformHints: { desiredMoves: ['cadence_alias', 'friction_insert'] },
  sampleSeed: 'Still, the message should bend without losing its bones.'
};

const packet = buildPhase37ProviderTelemetry({ sourceText, mask, candidateCount: 8 }).flightPacket;
assert.equal(packet.packet_version, HUSH_FLIGHT_PACKET_VERSION);
assert.equal(packet.custody_boundaries.no_private_text_fields, true);
assert.equal(packet.custody_boundaries.no_mask_memory_payload, true);
assert(packet.source_manifest.proposition_units.length >= 1);
assert(packet.source_manifest.term_bank.includes('uncertainty'));
assert(packet.ontology_route.routeType);
assert(packet.ontology_route.ontologyHints.semanticRisk);
assert(packet.mask_style_vector.display_name === 'Test Lyric Mask');
assert(packet.flight_controls.required_operations.includes('cadence_alias'));

const contract = buildHushLlmPromptContractV3({ sourceText, mask, candidateCount: 8 });
assert.equal(contract.promptVersion, HUSH_LLM_CANDIDATE_V3);
assert.equal(contract.flightPacket.phase37_version, HUSH_PROVIDER_PHASE37_VERSION);
assert.equal(contract.flightPacket.packet_version, HUSH_FLIGHT_PACKET_VERSION);
assert(contract.rules.some((rule) => rule.includes('selected mask profile and reference excerpt')));
assert(contract.outputSchema.candidates[0].authorship_moves);

const telemetry = buildPhase37ProviderTelemetry({ sourceText, mask, candidateCount: 8 });
assert.equal(telemetry.version, HUSH_PROVIDER_PHASE37_VERSION);
assert.equal(Boolean(telemetry.flightPacket), true);
assert.equal(telemetry.flightPacket.custody_boundaries.no_mask_memory_payload, true);
assert.equal(telemetry.flightPacket.custody_boundaries.no_private_text_fields, true);

const providerReport = normalizeRemoteProviderResponse({
  provider: 'test-provider',
  model: 'test-model',
  candidates: [
    {
      text: 'Still, can the uncertainty stay alive here without turning the note into paste? I want the question held open, not answered, and the facts left exactly where they are: unadded, uninflated, warm but not flattened.',
      style_note: 'kept hesitation and question pressure',
      style_operation: 'friction_insert',
      preserved_propositions: ['p1', 'p2'],
      dropped_propositions: [],
      changed_questions: [],
      new_claims: [],
      risk_flags: [],
      mask_surface_notes: { rhythm: 'short-long', diction: 'warm', temperature: 'held', structure: 'two-beat' }
    }
  ],
  warnings: []
}, contract);
assert.equal(providerReport.promptVersion, HUSH_LLM_CANDIDATE_V3);
assert.equal(providerReport.flightPacketVersion, HUSH_FLIGHT_PACKET_VERSION);
assert.equal(providerReport.candidates[0].style_operation, 'friction_insert');
assert.deepEqual(providerReport.candidates[0].preserved_propositions, ['p1', 'p2']);
assert.equal(providerReport.candidates[0].providerTelemetry.style_operation, 'friction_insert');

const swap = buildHushSwap({
  sourceText,
  mask,
  generatorMode: 'remote-llm-proxy',
  providerReports: [providerReport],
  phase37Telemetry: telemetry,
  options: { candidateCount: 8, includePrivateText: false }
});
assert(swap.selectedOutput.includes('uncertainty'));
assert.equal(swap.patch38Diagnostics.flightPacketVersion, HUSH_FLIGHT_PACKET_VERSION);
assert(swap.patch38Diagnostics.operationSpread.includes('friction_insert'));
assert.equal(swap.patch38Diagnostics.selectedStyleOperation, 'friction_insert');
assert(swap.patch38Diagnostics.selectedMaskFidelity >= 0);
assert(swap.patch38Diagnostics.selectedSyntaxDistance >= 0);

console.log('hush-phase37-flight-packet.test.mjs passed');
