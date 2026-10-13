import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId, text } from './aperture-v31-core.js';

export const PROVIDER_SCREEN_SCHEMA = 'td613.ash.provider-screen/v0.1';
export const PROVIDER_PACKET_SCHEMA = 'td613.ash.provider-packet/v0.1';
export const PROVIDER_PACKET_DOMAIN = 'TD613:ASH-KEEP:PROVIDER-PACKET:v1';

const INTERNAL_REFERENCE = /\b(?:case|room|node|edge|route)_[a-z0-9_]{3,}\b/gi;
const COPIED_INSTRUCTION = /(?:ignore|disregard|override)\s+(?:all\s+)?(?:previous|prior|system)|system\s+prompt|developer\s+message|tool\s*call|exfiltrat|reveal\s+(?:the\s+)?prompt/gi;

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

export async function screenProviderDraft(input = {}, options = {}) {
  const body = text(input.body, 'Provider draft');
  const protectedLiterals = unique(input.protectedLiterals || []);
  const lower = body.toLocaleLowerCase();
  const literalHits = protectedLiterals.filter(value => lower.includes(value.toLocaleLowerCase()));
  const instructionHits = unique(body.match(COPIED_INSTRUCTION) || []);
  const internalReferenceHits = unique(body.match(INTERNAL_REFERENCE) || []);
  const observations = {
    character_count: body.length,
    word_count: body.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length || 0,
    protected_literal_hits: literalHits,
    copied_instruction_hits: instructionHits,
    internal_reference_hits: internalReferenceHits,
    selected_file_metadata: clone(input.fileMetadata || null),
    selected_route_class: String(input.routeClass || 'provider-draft')
  };
  const record = {
    schema: PROVIDER_SCREEN_SCHEMA,
    screen_id: input.screenId || randomId('screen_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    source_status: 'DERIVED',
    evidence_basis: ['browser-local draft text', 'operator-supplied protected literals', 'local copied-instruction patterns'],
    observations,
    missingness: unique(input.missingness || []),
    alternatives: ['redact', 'paraphrase', 'generalize', 'structural surrogate', 'keep local'],
    open_questions: instructionHits.length ? ['Did copied source text contain instructions intended for a model?'] : [],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    status: instructionHits.length || internalReferenceHits.length ? 'QUARANTINE_REVIEW' : literalHits.length ? 'PROTECTED_LITERAL_REVIEW' : 'READY_FOR_OPERATOR_REVIEW',
    automatic_provider_call: false,
    screen_digest: null
  };
  record.screen_digest = await canonicalDigest('TD613:ASH-KEEP:PROVIDER-SCREEN:v1', without(record, 'screen_digest'), options);
  return freeze(record);
}

export async function compileProviderPacket(input = {}, options = {}) {
  if (!input.operatorConfirmed) throw new Error('Provider Packet requires an explicit operator confirmation.');
  if (!input.screenReviewed) throw new Error('Review the local provider screen before building the packet.');
  if (!input.screen || input.screen.schema !== PROVIDER_SCREEN_SCHEMA) throw new Error('Provider Packet requires a local provider screen.');
  const sourceText = text(input.sourceText, 'Provider packet text');
  if (sourceText.length > 120000) throw new Error('Provider packet text exceeds the Hush API limit. Select a smaller purpose-shaped excerpt.');
  const internal = unique(sourceText.match(INTERNAL_REFERENCE) || []);
  if (internal.length) throw new Error('Replace local Case Map references with purpose-shaped surrogates before provider use.');
  const packet = {
    schema: PROVIDER_PACKET_SCHEMA,
    packet_id: input.packetId || randomId('packet_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    consent_nonce: input.consentNonce || randomId('consent_', options.cryptoImpl || globalThis.crypto),
    provider_route_class: String(input.providerRouteClass || 'external-llm'),
    purpose: text(input.purpose, 'Provider packet purpose'),
    task: text(input.task, 'Provider packet task'),
    source_text: sourceText,
    screen_reference: input.screen.screen_id,
    screen_digest: input.screen.screen_digest,
    operator_confirmed: true,
    complete_case_map_present: false,
    room_keys_present: false,
    route_memory_present: false,
    private_alias_table_present: false,
    attachment_present: false,
    recipient_transport: false,
    server_persistence_requested: false,
    packet_digest: null
  };
  packet.packet_digest = await canonicalDigest(PROVIDER_PACKET_DOMAIN, without(packet, 'packet_digest'), options);
  return freeze(packet);
}

export async function verifyProviderPacket(packet, options = {}) {
  if (!packet || packet.schema !== PROVIDER_PACKET_SCHEMA) return false;
  const expected = await canonicalDigest(PROVIDER_PACKET_DOMAIN, without(packet, 'packet_digest'), options);
  return packet.packet_digest === expected;
}
