import assert from 'assert';
import { buildHushFlightPacketV3, buildPhase37ProviderTelemetry } from '../app/engine/hush-generator-provider-phase35.js';
import {
  buildPacketPreflight,
  buildRoutedProviderPacket,
  classifyMaskPacketTier,
  compactProfileForPacketTier
} from '../app/engine/hush-packet-router.js';

const sourceText = 'Some people used that sig/sigil before their name. I thought, epistemically, maybe it came from you. The LLM took the idea and made an ingress sigil.';
const plain = { id: 'plain-witness', label: 'Steady Mabel', family: 'low heat record', sampleSeed: 'I saw the notice on Monday. I saved the file.' };
const chat = { id: 'group-chat-soft', label: 'Threaded Keisha', family: 'small circle chat', sampleSeed: 'hey yall just dropping this here rn' };
const plainTelemetry = buildPhase37ProviderTelemetry({ sourceText, mask: plain, candidateCount: 4 });
const plainTier = classifyMaskPacketTier({ mask: plain, ontologyRoute: plainTelemetry.ontologyRoute, propositionMap: plainTelemetry.propositionMap });
assert.equal(plainTier.tier, 'plain_record_packet');
const preflight = buildPacketPreflight({ mask: plain, sourceText, maskReferenceText: plain.sampleSeed });
assert(['thin', 'seed_derived', 'rich'].includes(preflight.maskEvidenceState));
const routedPlain = buildRoutedProviderPacket({ flightPacket: plainTelemetry.flightPacket, tier: plainTier.tier, sourceText, preflight });
assert.equal(routedPlain.packet_tier, 'plain_record_packet');
assert(!('surface_marker_profile' in routedPlain.stylometry_engine.source_profile));
assert(routedPlain.source_manifest.semantic_anchors.includes('LLM'));
assert(routedPlain.source_manifest.semantic_anchors.some((x) => /sigil/i.test(x)));
const chatPacket = buildHushFlightPacketV3({ sourceText: 'hey yall rn pls keep the file in the thread', mask: chat, candidateCount: 4 });
const chatTier = classifyMaskPacketTier({ mask: chat, ontologyRoute: { routeType: 'casual-register' }, propositionMap: {} });
assert.equal(chatTier.tier, 'chat_cadence_packet');
const routedChat = buildRoutedProviderPacket({ flightPacket: chatPacket, tier: chatTier.tier, sourceText: 'hey yall rn pls keep the file in the thread', preflight: buildPacketPreflight({ mask: chat, sourceText: 'hey yall rn pls keep the file in the thread' }) });
assert.equal(routedChat.flight_controls.chat_ontology_enabled, true);
assert('surface_marker_profile' in routedChat.stylometry_engine.source_profile);
const compactPlain = compactProfileForPacketTier({ surfaceMarkerProfile: { rn: 1 }, functionWordProfile: { the: 0.2 }, avgSentenceLength: 8 }, 'plain_record_packet');
assert(!('surface_marker_profile' in compactPlain));
console.log('hush-packet-router.test.mjs passed');
