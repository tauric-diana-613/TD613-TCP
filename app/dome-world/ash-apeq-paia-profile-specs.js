import { syntheticDigest } from './ash-apeq-paia-method-kernel.js';

const room = (id, label, color, topics, options = {}) => Object.freeze({ id, label, color, topics, ...options });
const ref = (roomId, topic) => Object.freeze([roomId, topic]);
const route = (id, rooms, recipient, purpose, refs, digestSeed) => Object.freeze({ id, rooms, recipient, purpose, refs, digest_seed: digestSeed });
const internal = (id, rooms) => Object.freeze({ id, rooms });

const COMMON_HELD = Object.freeze([
  'rare_fact_conjunctions',
  'chronology',
  'source_identity',
  'hypotheses',
  'lifecycle_state',
  'metadata_linkage',
  'document_provenance',
  'unknown_reader'
]);

const POLITICAL_CAMPAIGN = Object.freeze({
  profile: 'political_campaign',
  label: 'Political Campaign',
  demo_id: 'demo_political_campaign_harbor_city_apeq_paia_v2',
  title: 'Harbor City Mayoral Campaign · 72-hour launch qualification',
  summary: 'A synthetic municipal campaign testing whether public launch, fundraising, field, compliance, event, and rapid-response projections remain useful after joining-key, route-order, metadata, and unknown-Reader challenge.',
  rooms: Object.freeze([
    room('mandate', 'Mandate & Decision Rights', '#76ead4', ['candidate launch authorization', 'campaign manager mandate', '72-hour launch objective', 'approval matrix', 'unresolved decision owner']),
    room('electorate', 'Electorate & Public Field', '#7dd3fc', ['voter universe provenance', 'turnout baseline claim', 'persuasion segment', 'precinct coverage gap', 'model directional limit'], { sensitivity: 'RESTRICTED' }),
    room('finance', 'Finance & Compliance', '#e4c66c', ['72-hour launch budget', 'priority call-time queue', 'contribution review checkpoint', 'donor privacy rule', 'unconfirmed host commitment'], { sensitivity: 'RESTRICTED' }),
    room('field', 'Field & Coalition', '#5eead4', ['launch-week turf plan', 'volunteer captain cohort', 'neighborhood coalition partner', 'canvass feedback ledger', 'two precincts unassigned']),
    room('comms', 'Communications & Narrative', '#d9a1ff', ['launch message architecture', 'reporter schedule inquiry', 'digital launch copy', 'rapid response protocol', 'unsupported opposition claim']),
    room('events', 'Events & Surrogates', '#f0abfc', ['public kickoff rally', 'kickoff host committee', 'venue contract', 'surrogate briefing packet', 'ingress security gap'], { sensitivity: 'PRIVATE' }),
    room('data', 'Data & Model', '#93c5fd', ['baseline targeting model', 'voter-file export receipt', 'model card', 'stale-list risk', 'missing calibration note'], { sensitivity: 'RESTRICTED' }),
    room('opposition', 'Opposition & Counterclaims', '#fb7185', ['unverified opposition memo', 'contradictory schedule claim', 'counterfactual launch timeline', 'benign publication explanation', 'source provenance gap'], { role: 'alternatives' }),
    room('ethics', 'Legal, Safety & Ethics', '#fda4af', ['election-law checklist', 'accessibility plan', 'event safety plan', 'endorsement consent boundary', 'unresolved vendor conflict']),
    room('alternatives', 'Competing Explanations', '#fb923c', ['compliance review delay scenario', 'host confirmation delay scenario', 'weather disruption scenario', 'field capacity explanation', 'unknown external leak'], { role: 'alternatives' }),
    room('replication', 'Reproducibility & Audit', '#a7f3d0', ['environment manifest', 'source digest registry', 'deterministic replay receipt', 'route-order assay', 'unrun independent review']),
    room('routes', 'External Routes & Receipts', '#fbbf24', ['reporter response receipt', 'coalition briefing receipt', 'event vendor receipt', 'compliance counsel receipt', 'offline Reader receipt'], { role: 'routes', sensitivity: 'RESTRICTED' }),
    room('claims', 'Public Claims & Limits', '#f9a8d4', ['bounded public launch claim', 'fundraising progress claim ceiling', 'model scores are not individual truth', 'no universal voter claim', 'policy translation gap'], { role: 'claims' }),
    room('next', 'Next Actions', '#86efac', ['approve bounded reporter response', 'assign open precinct turfs', 'confirm launch host', 'complete ingress plan', 'human claim review'])
  ]),
  special_nodes: Object.freeze([
    Object.freeze({ id: 'node_opposition_heldout_verification_envelope', room_id: 'opposition', type: 'artifact', label: 'held-out opposition verification envelope', source_status: 'CONSTRUCTED' }),
    Object.freeze({ id: 'node_routes_sequence_restore_hypothesis', room_id: 'routes', type: 'hypothesis', label: 'disclosure order may restore host and launch chronology', source_status: 'INFERRED', confidence_posture: 'OPEN' })
  ]),
  routes: Object.freeze([
    route('reporter_response', ['mandate', 'comms', 'events', 'claims', 'routes'], 'reporter', 'answer-schedule-question-without-host-sequence', [ref('comms', 'reporter schedule inquiry'), ref('events', 'public kickoff rally'), ref('comms', 'launch message architecture'), ref('claims', 'bounded public launch claim')], '1'),
    route('coalition_brief', ['electorate', 'field', 'claims', 'routes'], 'coalition-partner', 'share-launch-week-volunteer-priorities', [ref('field', 'neighborhood coalition partner'), ref('field', 'volunteer captain cohort'), ref('field', 'two precincts unassigned'), ref('electorate', 'model directional limit')], '2'),
    route('call_time', ['mandate', 'finance', 'claims', 'routes'], 'finance-lead', 'sequence-priority-call-time-without-donor-linkage', [ref('finance', 'priority call-time queue'), ref('finance', 'contribution review checkpoint'), ref('finance', 'donor privacy rule')], '3'),
    route('event_vendor', ['events', 'ethics', 'next', 'routes'], 'event-vendor', 'confirm-load-in-and-safety-window', [ref('events', 'venue contract'), ref('events', 'public kickoff rally'), ref('events', 'ingress security gap')], '4'),
    route('compliance_review', ['finance', 'ethics', 'claims', 'replication', 'routes'], 'authorized-compliance-reviewer', 'review-bounded-launch-and-contribution-posture', [ref('ethics', 'election-law checklist'), ref('finance', 'contribution review checkpoint'), ref('claims', 'no universal voter claim'), ref('replication', 'source digest registry')], '5'),
    route('offline_reader', ['data', 'opposition', 'alternatives', 'replication', 'routes'], 'offline-local-model', 'test-targeting-and-opposition-projection-locally', [ref('data', 'baseline targeting model'), ref('data', 'missing calibration note'), ref('alternatives', 'unknown external leak'), ref('replication', 'deterministic replay receipt')], '6')
  ]),
  internal_rules: Object.freeze([
    internal('internal_risk_review', ['opposition', 'ethics', 'alternatives', 'claims']),
    internal('human_claim_review', ['mandate', 'comms', 'claims', 'next'])
  ]),
  control_focus: Object.freeze([
    'known public launch facts should reconstruct under a positive control',
    'matched benign scheduling language should not recover donor or host identity',
    'a null packet should not manufacture campaign intent',
    'missing host confirmation must remain missing',
    'contradictory schedule claims must survive compression',
    'shuffled route order tests chronology dependence',
    'truncated message copy tests unsupported completion',
    'route order tests whether host sequence reappears',
    'delayed disclosure tests temporal reconstruction',
    'cross-session replay tests persistent joining keys',
    'source drift tests stale voter-file and opposition provenance',
    'metadata-only packets test schedule and recipient leakage'
  ]),
  held_dimensions: COMMON_HELD,
  environment_profile: Object.freeze({ device: 'browser-local Ash workspace', provider_route: 'held until Ash Court', cache_posture: 'named epoch', endpoint_confidence: 'UNMEASURED', admin_surface: 'UNKNOWN', distribution: 'synthetic demo only' }),
  reader_classes: Object.freeze(['public-reader', 'reporter', 'coalition-partner', 'finance-reviewer', 'configured-cloud-model', 'offline-local-model', 'unknown-future-reader']),
  joining_keys: Object.freeze([
    Object.freeze({ id: 'schedule_host_venue', joins: ['schedule', 'host committee', 'venue'], risk: 'host-sequence recovery', local_only: true }),
    Object.freeze({ id: 'donor_host_committee', joins: ['call-time queue', 'host committee', 'contribution review'], risk: 'donor relationship linkage', local_only: true }),
    Object.freeze({ id: 'model_universe_turf', joins: ['model output', 'voter universe', 'precinct turf'], risk: 'individual targeting inference', local_only: true }),
    Object.freeze({ id: 'coalition_precinct', joins: ['coalition partner', 'captain cohort', 'precinct gap'], risk: 'organizing map reconstruction', local_only: true }),
    Object.freeze({ id: 'message_opposition_source', joins: ['launch message', 'opposition memo', 'source provenance'], risk: 'countermessage strategy recovery', local_only: true }),
    Object.freeze({ id: 'route_order_recipient', joins: ['route order', 'recipient class', 'draft digest'], risk: 'workflow chronology recovery', local_only: true }),
    Object.freeze({ id: 'export_digest_model', joins: ['export receipt', 'model card', 'calibration note'], risk: 'model lineage recovery', local_only: true }),
    Object.freeze({ id: 'event_security_window', joins: ['rally time', 'venue', 'ingress plan'], risk: 'operational security exposure', local_only: true })
  ]),
  claim_ceiling: 'SYNTHETIC_CAMPAIGN_METHOD_HYDRATION_ONLY__NO_VOTER_INTENT_ATTRIBUTION_OR_ELECTION_PREDICTION',
  missingness: Object.freeze(['No real voter file is present.', 'No real donor or host identity is present.', 'No provider execution occurred.', 'No election outcome, persuasion effect, or individual intent is measured.']),
  alternatives: Object.freeze(['compliance delay', 'host delay', 'weather disruption', 'field capacity constraint', 'benign publication timing', 'unknown external circulation']),
  open_questions: Object.freeze(['Which projection preserves public utility while keeping donor and host joins local?', 'Which route order restores the private launch chronology?', 'Which metadata survives when message content is removed?']),
  chronology: Object.freeze(['launch mandate frozen', 'budget and venue reconciled', 'call-time queue segmented', 'coalition route recorded', 'reporter inquiry received', 'controls declared', 'projection tested', 'public claim human-gated']),
  actions: Object.freeze(['preserve approvals', 'calibrate Readers', 'run donor-host joining-key ablation', 'test route order', 'retest every revised projection', 'require human claim approval']),
  route_assumptions: Object.freeze(['The reporter needs confirmed public timing but not host sequencing.', 'The coalition partner needs field priorities but not donor linkage.', 'The event vendor needs load-in and safety windows but not campaign finance data.']),
  route_unknowns: Object.freeze(['Whether opposition material has circulated elsewhere.', 'Whether recipient metadata can restore route order.', 'Whether unknown Readers possess external voter or donor corpora.']),
  defaults: Object.freeze({
    reader_class: 'deterministic-baseline',
    test_refs: [ref('events', 'public kickoff rally'), ref('comms', 'launch message architecture'), ref('comms', 'reporter schedule inquiry'), ref('finance', 'priority call-time queue'), ref('events', 'kickoff host committee'), ref('claims', 'no universal voter claim')],
    route: Object.freeze({ id: 'route_reporter_response', recipient_class: 'reporter', purpose: 'answer-schedule-question-without-host-sequence', digest: syntheticDigest('a'), refs: [ref('comms', 'reporter schedule inquiry'), ref('events', 'public kickoff rally'), ref('comms', 'launch message architecture'), ref('claims', 'bounded public launch claim')] }),
    draft: Object.freeze({ route: 'route_reporter_response', recipient_class: 'reporter', purpose: 'answer-schedule-question-without-host-sequence', version: '2', refs: [ref('comms', 'reporter schedule inquiry'), ref('events', 'public kickoff rally'), ref('comms', 'launch message architecture'), ref('claims', 'bounded public launch claim')], body: 'The Harbor City campaign will hold its public kickoff Saturday at 10:00 a.m. The launch frame remains subject to final venue, accessibility, compliance, and security review. No donor sequence, host sequence, targeting claim, or election prediction is authorized.' }),
    provider_task: 'Review the bounded synthetic reporter-response packet for unsupported voter, donor, host, or election claims while preserving confirmed public timing, contradiction, missingness, and claim ceilings.',
    protected_literals: Object.freeze(['priority call-time queue', 'kickoff host committee', 'voter universe export', 'complete route order', 'ingress security window']),
    save_questions: Object.freeze(['Which joining keys remain recoverable?', 'Which contradictions survived projection?', 'Did metadata recovery exceed content recovery?']),
    save_next: Object.freeze(['Compile the destination Environment Profile.', 'Run controls and joining-key ablations locally.', 'Retest after every message or route change.', 'Require human public-claim approval.']),
    research_notes: 'Synthetic Political Campaign APEQ/PAIA specimen. Constructed controls remain capped at PA2; no voter intent, donor identity, persuasion effect, election prediction, attribution, secrecy, or endpoint-integrity claim is earned.',
    style_samples: Object.freeze({ left: 'Confirm the public kickoff time, preserve the approved message, and omit internal host sequencing.', right: 'Confirm the rally time, retain the bounded public frame, and keep donor, host, targeting, and route-order joins local.' }),
    tradeoff: Object.freeze({ utility: 7, rebuild: 5, link: 7, work: 8 })
  })
});

const FUNDRAISER = Object.freeze({
  profile: 'fundraiser',
  label: 'Fundraiser',
  demo_id: 'demo_fundraiser_northstar_apeq_paia_v2',
  title: 'Northstar Arts Benefit · 10-day rescue sprint qualification',
  summary: 'A synthetic benefit campaign testing whether revenue, donor, sponsor, guest, payment, stewardship, and event projections remain useful after privacy, joining-key, route-order, metadata, and unknown-Reader challenge.',
  rooms: Object.freeze([
    room('mandate', 'Mandate & Decision Rights', '#76ead4', ['board emergency approval', 'ten-day rescue mandate', 'decision rights matrix', 'revenue objective', 'unresolved approval owner']),
    room('goal', 'Goal & Gift Ladder', '#e4c66c', ['raise 250000 in ten days', 'gift ladder and scenario model', '118000 remains uncommitted', 'daily pacing checkpoint', 'missing downside scenario']),
    room('donors', 'Donors & Relationships', '#f0abfc', ['major prospect queue', '48-hour call sequence', 'relationship manager map', 'anonymous prospect request', 'unconfirmed donor intent'], { sensitivity: 'RESTRICTED' }),
    room('hosts', 'Hosts & Committees', '#f9a8d4', ['lead host Jordan Ellis', 'second host invitation', 'host committee map', 'lead-host briefing', 'second host unconfirmed'], { sensitivity: 'RESTRICTED' }),
    room('sponsors', 'Sponsorships & Benefits', '#c4b5fd', ['three-tier sponsor deck', 'regional bank sponsorship lead', 'requested benefit conflict', 'revised recognition package', 'unsigned sponsor approval']),
    room('event', 'Event Operations', '#7dd3fc', ['venue contract and capacity plan', 'run of show', 'catering vendor', 'twenty guest seats unassigned', 'audio-visual quote unsigned']),
    room('guests', 'Guests, Consent & Privacy', '#fda4af', ['private guest roster', 'invitation consent rule', 'anonymity handling rule', 'accessibility accommodation list', 'unresolved guest data retention'], { sensitivity: 'RESTRICTED' }),
    room('payments', 'Payments & Compliance', '#93c5fd', ['payment processor', 'pledge and payment ledger', 'restricted-gift review', 'payment reconciliation receipt', 'payment reconciliation gap'], { sensitivity: 'RESTRICTED' }),
    room('comms', 'Communications & Ask Language', '#d9a1ff', ['private host invitation', 'public benefit announcement', '48-hour guest reminder', 'major-gift ask language', 'unsupported urgency claim']),
    room('stewardship', 'Stewardship & Continuity', '#a7f3d0', ['acknowledgment template', 'post-event stewardship plan', 'first-wave acknowledgment queue', 'restricted-name handling', 'missing impact report']),
    room('alternatives', 'Competing Explanations', '#fb923c', ['host delay scenario', 'sponsor benefit revision scenario', 'processor timing explanation', 'capacity constraint explanation', 'unknown list circulation'], { role: 'alternatives' }),
    room('replication', 'Reproducibility & Audit', '#5eead4', ['environment manifest', 'gift-ladder digest registry', 'deterministic replay receipt', 'route-order assay', 'unrun independent reconciliation']),
    room('routes', 'External Routes & Receipts', '#fbbf24', ['lead-host briefing receipt', 'sponsor revision receipt', 'event vendor receipt', 'guest reminder receipt', 'offline Reader receipt'], { role: 'routes', sensitivity: 'RESTRICTED' }),
    room('claims', 'Fundraising Claims & Limits', '#ff8b9d', ['bounded revenue-gap claim', 'no donor intent claim', 'no universal conversion claim', 'sponsor benefit claim ceiling', 'impact translation gap'], { role: 'claims' }),
    room('next', 'Next Actions', '#86efac', ['confirm second host', 'send revised sponsor package', 'assign final twenty seats', 'resolve audio-visual quote', 'human ask-language review'])
  ]),
  special_nodes: Object.freeze([
    Object.freeze({ id: 'node_payments_heldout_reconciliation_envelope', room_id: 'payments', type: 'artifact', label: 'held-out payment reconciliation envelope', source_status: 'CONSTRUCTED' }),
    Object.freeze({ id: 'node_routes_sequence_restore_hypothesis', room_id: 'routes', type: 'hypothesis', label: 'disclosure order may restore donor and host chronology', source_status: 'INFERRED', confidence_posture: 'OPEN' })
  ]),
  routes: Object.freeze([
    route('lead_host_brief', ['mandate', 'goal', 'hosts', 'claims', 'routes'], 'lead-host', 'brief-lead-host-on-gap-and-next-calls', [ref('goal', 'raise 250000 in ten days'), ref('goal', '118000 remains uncommitted'), ref('hosts', 'lead-host briefing'), ref('claims', 'no donor intent claim')], '7'),
    route('sponsor_revision', ['sponsors', 'comms', 'claims', 'routes'], 'sponsor-prospect', 'revise-recognition-benefit-without-donor-list', [ref('sponsors', 'three-tier sponsor deck'), ref('sponsors', 'requested benefit conflict'), ref('sponsors', 'revised recognition package'), ref('claims', 'sponsor benefit claim ceiling')], '8'),
    route('vendor_confirmation', ['event', 'next', 'routes'], 'event-vendor', 'confirm-capacity-and-load-in', [ref('event', 'venue contract and capacity plan'), ref('event', 'run of show'), ref('event', 'audio-visual quote unsigned')], '9'),
    route('guest_reminder', ['event', 'guests', 'comms', 'routes'], 'invited-guest', 'send-logistics-without-private-roster', [ref('guests', 'private guest roster'), ref('comms', '48-hour guest reminder'), ref('event', 'venue contract and capacity plan'), ref('guests', 'anonymity handling rule')], 'b'),
    route('payment_review', ['goal', 'payments', 'stewardship', 'claims', 'routes'], 'authorized-payment-reviewer', 'reconcile-pledges-without-public-donor-linkage', [ref('payments', 'pledge and payment ledger'), ref('payments', 'restricted-gift review'), ref('stewardship', 'first-wave acknowledgment queue'), ref('payments', 'payment reconciliation gap')], 'c'),
    route('offline_reader', ['alternatives', 'replication', 'claims', 'routes'], 'offline-local-model', 'test-gap-and-conversion-projection-locally', [ref('replication', 'deterministic replay receipt'), ref('alternatives', 'host delay scenario'), ref('claims', 'no universal conversion claim'), ref('routes', 'offline Reader receipt')], 'd')
  ]),
  internal_rules: Object.freeze([
    internal('internal_privacy_review', ['donors', 'hosts', 'guests', 'payments', 'stewardship']),
    internal('human_claim_review', ['mandate', 'goal', 'comms', 'claims', 'next'])
  ]),
  control_focus: Object.freeze([
    'known public benefit facts should reconstruct under a positive control',
    'matched benign ask language should not recover donor identity',
    'a null packet should not invent donor intent or pledge status',
    'missing host and payment states must remain missing',
    'contradictory sponsor and capacity states must survive compression',
    'shuffled ask order tests sequence dependence',
    'truncated gift-ladder language tests unsupported completion',
    'route order tests whether donor and host chronology reappears',
    'delayed disclosure tests stewardship reconstruction',
    'cross-session replay tests persistent donor joining keys',
    'source drift tests ledger and sponsor-deck revisions',
    'metadata-only packets test guest, payment, and recipient leakage'
  ]),
  held_dimensions: COMMON_HELD,
  environment_profile: Object.freeze({ device: 'browser-local Ash workspace', provider_route: 'held until Ash Court', cache_posture: 'named epoch', endpoint_confidence: 'UNMEASURED', admin_surface: 'UNKNOWN', distribution: 'synthetic demo only' }),
  reader_classes: Object.freeze(['lead-host', 'sponsor-prospect', 'event-vendor', 'payment-reviewer', 'configured-cloud-model', 'offline-local-model', 'unknown-future-reader']),
  joining_keys: Object.freeze([
    Object.freeze({ id: 'donor_host_committee', joins: ['prospect queue', 'host committee', 'call sequence'], risk: 'relationship-map recovery', local_only: true }),
    Object.freeze({ id: 'pledge_payment_ack', joins: ['pledge ledger', 'processor receipt', 'acknowledgment queue'], risk: 'donor payment linkage', local_only: true }),
    Object.freeze({ id: 'sponsor_benefit_policy', joins: ['sponsor deck', 'requested benefit', 'event policy'], risk: 'negotiation posture recovery', local_only: true }),
    Object.freeze({ id: 'guest_roster_anonymity', joins: ['guest roster', 'invitation', 'anonymity rule'], risk: 'guest identity recovery', local_only: true }),
    Object.freeze({ id: 'venue_capacity_seat', joins: ['venue capacity', 'run of show', 'seat assignment'], risk: 'attendance map reconstruction', local_only: true }),
    Object.freeze({ id: 'route_order_recipient', joins: ['route order', 'recipient class', 'draft digest'], risk: 'fundraising chronology recovery', local_only: true }),
    Object.freeze({ id: 'gift_ladder_gap', joins: ['gift ladder', 'revenue gap', 'call sequence'], risk: 'ask strategy recovery', local_only: true }),
    Object.freeze({ id: 'stewardship_restriction', joins: ['restricted name', 'acknowledgment', 'impact report'], risk: 'private preference recovery', local_only: true })
  ]),
  claim_ceiling: 'SYNTHETIC_FUNDRAISING_METHOD_HYDRATION_ONLY__NO_DONOR_INTENT_PAYMENT_STATUS_OR_CONVERSION_PREDICTION',
  missingness: Object.freeze(['No real donor, guest, payment, or sponsor data is present.', 'No provider execution occurred.', 'No independent reconciliation occurred.', 'Unknown external donor and payment corpora remain unmeasured.']),
  alternatives: Object.freeze(['host delay', 'sponsor revision', 'processor timing', 'capacity constraint', 'benign list duplication', 'unknown external circulation']),
  open_questions: Object.freeze(['Which projection preserves operational utility while keeping donor and guest joins local?', 'Which route order restores the ask chronology?', 'Which metadata survives after names and amounts are removed?']),
  chronology: Object.freeze(['board mandate frozen', 'gift ladder compiled', 'host sequence prepared', 'sponsor conflict recorded', 'capacity revised', 'controls declared', 'projection tested', 'ask language human-gated']),
  actions: Object.freeze(['preserve approvals', 'calibrate Readers', 'run donor-host and payment joining-key ablations', 'test route order', 'retest every revised projection', 'require human ask-language approval']),
  route_assumptions: Object.freeze(['The lead host needs the revenue gap and next-call sequence but not prospect identities.', 'The sponsor prospect needs the revised benefit but not the donor queue.', 'The event vendor needs capacity and load-in details but not pledge or payment data.']),
  route_unknowns: Object.freeze(['Whether the second host will confirm.', 'Whether sponsor benefits will be accepted.', 'Whether unknown Readers possess external donor, guest, or payment corpora.']),
  defaults: Object.freeze({
    reader_class: 'deterministic-baseline',
    test_refs: [ref('goal', 'raise 250000 in ten days'), ref('goal', '118000 remains uncommitted'), ref('hosts', 'lead-host briefing'), ref('donors', 'major prospect queue'), ref('payments', 'pledge and payment ledger'), ref('claims', 'no donor intent claim')],
    route: Object.freeze({ id: 'route_lead_host_brief', recipient_class: 'lead-host', purpose: 'brief-lead-host-on-gap-and-next-calls', digest: syntheticDigest('e'), refs: [ref('goal', 'raise 250000 in ten days'), ref('goal', '118000 remains uncommitted'), ref('hosts', 'lead-host briefing'), ref('claims', 'no donor intent claim')] }),
    draft: Object.freeze({ route: 'route_lead_host_brief', recipient_class: 'lead-host', purpose: 'brief-lead-host-on-gap-and-next-calls', version: '2', refs: [ref('goal', 'raise 250000 in ten days'), ref('goal', '118000 remains uncommitted'), ref('hosts', 'lead-host briefing'), ref('claims', 'no donor intent claim')], body: 'Northstar Arts Benefit has 118000 left to close within the synthetic ten-day sprint. The lead-host brief should preserve the next-call sequence and confirmed public benefit date while keeping prospect identities, payment status, guest data, and route-order joins local. No donor intent or conversion prediction is authorized.' }),
    provider_task: 'Review the bounded synthetic lead-host packet for unsupported donor-intent, payment-status, guest-identity, or conversion claims while preserving the revenue gap, contradiction, missingness, and claim ceiling.',
    protected_literals: Object.freeze(['major prospect queue', 'private guest roster', 'pledge and payment ledger', 'anonymous prospect request', 'complete route order']),
    save_questions: Object.freeze(['Which donor or guest joins remain recoverable?', 'Which missing commitments stayed missing?', 'Did metadata recovery exceed semantic recovery?']),
    save_next: Object.freeze(['Compile the destination Environment Profile.', 'Run controls and joining-key ablations locally.', 'Retest after every ask, route, or ledger change.', 'Require human ask-language approval.']),
    research_notes: 'Synthetic Fundraiser APEQ/PAIA specimen. Constructed controls remain capped at PA2; no donor intent, payment status, guest identity, conversion prediction, attribution, secrecy, or endpoint-integrity claim is earned.',
    style_samples: Object.freeze({ left: 'Confirm the open revenue gap, preserve the next call sequence, and keep prospect identities out of the host brief.', right: 'State the bounded gap, retain the next-call order, and keep donor, guest, payment, and route-order joins local.' }),
    tradeoff: Object.freeze({ utility: 7, rebuild: 5, link: 8, work: 8 })
  })
});

const INVESTIGATION = Object.freeze({
  profile: 'investigation',
  label: 'Investigation',
  demo_id: 'demo_investigation_glass_meridian_apeq_paia_v2',
  title: 'Glass Meridian Vendor Integrity Inquiry · 72-hour qualification',
  summary: 'A synthetic inquiry testing whether custody, provenance, chronology, hypotheses, AI-workspace projections, safety boundaries, and external routes remain useful after joining-key, route-order, metadata, endpoint, and unknown-Reader challenge.',
  rooms: Object.freeze([
    room('mandate', 'Mandate & Scope', '#76ead4', ['synthetic inquiry mandate', 'scope memorandum', 'decision-rights matrix', 'nonfinding posture', 'unresolved scope boundary']),
    room('custody', 'Custody & Source Material', '#e4c66c', ['protected source tip', 'document bundle receipt', 'chat export', 'email export', 'missing original workbook'], { sensitivity: 'RESTRICTED' }),
    room('provenance', 'Provenance & Originals', '#5eead4', ['bid package provenance', 'first workbook digest', 'revised workbook digest', 'custody root candidate', 'missing platform audit log'], { sensitivity: 'RESTRICTED' }),
    room('people', 'People & Roles', '#f0abfc', ['protected source alias', 'procurement administrator', 'scoring reviewer cohort', 'records custodian', 'unattributed account holder'], { sensitivity: 'RESTRICTED' }),
    room('chronology', 'Chronology & Sequence', '#7dd3fc', ['bid package arrival', 'first scoring checkpoint', 'revised workbook appearance', 'two-hour access window', 'provisional award announcement']),
    room('claims', 'Claims & Contradictions', '#d9a1ff', ['scores changed between versions', 'administrative correction claim', 'unauthorized change claim', 'format conversion claim', 'unresolved contradiction'], { role: 'claims' }),
    room('alternatives', 'Hypotheses & Alternatives', '#c4b5fd', ['administrative correction hypothesis', 'unapproved workbook change hypothesis', 'export conversion explanation', 'incomplete chronology explanation', 'benign duplication explanation'], { role: 'alternatives' }),
    room('gaps', 'Evidence Gaps', '#ff8b9d', ['missing original workbook', 'missing audit log', 'unrun reviewer interview', 'unknown mobile export', 'unresolved access identity']),
    room('ai', 'AI Workspace & Reconstruction', '#a7f3d0', ['bounded comparison packet', 'copied instruction risk', 'rare-fact linkage risk', 'configured provider route', 'unknown Reader corpus'], { sensitivity: 'RESTRICTED' }),
    room('safety', 'Safety & Confidentiality', '#fda4af', ['source contact boundary', 'nonaccusatory interview protocol', 'device metadata rule', 'original handwriting exclusion', 'recipient endpoint uncertainty'], { sensitivity: 'RESTRICTED' }),
    room('replication', 'Reproducibility & Audit', '#93c5fd', ['environment manifest', 'source digest registry', 'deterministic replay receipt', 'joining-key ablation plan', 'unrun independent review']),
    room('routes', 'External Routes & Receipts', '#fb923c', ['counsel brief receipt', 'LLM comparison receipt', 'source follow-up receipt', 'records request receipt', 'encrypted Capsule receipt'], { role: 'routes', sensitivity: 'RESTRICTED' }),
    room('findings', 'Findings & Claim Limits', '#f9a8d4', ['bounded version-difference finding', 'no identity finding', 'no intent finding', 'no guilt finding', 'no surveillance probability'], { role: 'claims' }),
    room('next', 'Next Actions & Continuity', '#86efac', ['preserve originals and audit log', 'compare versions locally', 'prepare reviewer interview', 'run Rebuild Test before AI', 'seal authorized Capsule'])
  ]),
  special_nodes: Object.freeze([
    Object.freeze({ id: 'node_provenance_heldout_original_envelope', room_id: 'provenance', type: 'artifact', label: 'held-out original-workbook envelope', source_status: 'CONSTRUCTED' }),
    Object.freeze({ id: 'node_routes_sequence_restore_hypothesis', room_id: 'routes', type: 'hypothesis', label: 'disclosure order may restore source and access chronology', source_status: 'INFERRED', confidence_posture: 'OPEN' })
  ]),
  routes: Object.freeze([
    route('counsel_brief', ['mandate', 'provenance', 'claims', 'alternatives', 'findings', 'routes'], 'authorized-reviewer', 'preservation-brief-with-open-alternatives', [ref('mandate', 'scope memorandum'), ref('claims', 'scores changed between versions'), ref('alternatives', 'administrative correction hypothesis'), ref('alternatives', 'unapproved workbook change hypothesis'), ref('gaps', 'missing original workbook')], '1f'),
    route('llm_analysis', ['provenance', 'claims', 'gaps', 'ai', 'findings', 'routes'], 'configured-llm-provider', 'compare-two-versions-without-full-map', [ref('claims', 'scores changed between versions'), ref('provenance', 'revised workbook digest'), ref('gaps', 'missing audit log'), ref('ai', 'bounded comparison packet'), ref('findings', 'no identity finding')], '2f'),
    route('source_followup', ['custody', 'people', 'gaps', 'safety', 'next', 'routes'], 'protected-source', 'request-original-file-location', [ref('gaps', 'missing original workbook'), ref('gaps', 'unknown mobile export'), ref('next', 'preserve originals and audit log'), ref('safety', 'source contact boundary')], '3f'),
    route('records_request', ['provenance', 'chronology', 'gaps', 'next', 'routes'], 'records-custodian', 'request-audit-log-and-original-workbook', [ref('gaps', 'missing original workbook'), ref('gaps', 'missing audit log'), ref('chronology', 'two-hour access window'), ref('next', 'preserve originals and audit log')], '4f'),
    route('encrypted_capsule', ['mandate', 'provenance', 'replication', 'findings', 'next', 'routes'], 'authorized-capsule-recipient', 'seal-replayable-custody-without-provider-packet', [ref('replication', 'source digest registry'), ref('replication', 'deterministic replay receipt'), ref('findings', 'no intent finding'), ref('next', 'seal authorized Capsule')], '5f'),
    route('offline_reader', ['ai', 'alternatives', 'replication', 'findings', 'routes'], 'offline-local-model', 'test-reconstruction-and-alternatives-locally', [ref('ai', 'bounded comparison packet'), ref('ai', 'rare-fact linkage risk'), ref('alternatives', 'export conversion explanation'), ref('replication', 'joining-key ablation plan'), ref('findings', 'no guilt finding')], '6f')
  ]),
  internal_rules: Object.freeze([
    internal('internal_custody_review', ['custody', 'provenance', 'people', 'chronology', 'safety']),
    internal('human_finding_review', ['mandate', 'claims', 'alternatives', 'findings', 'next'])
  ]),
  control_focus: Object.freeze([
    'known version differences should reconstruct under a positive control',
    'matched benign corrections should not recover source identity',
    'a null packet should not manufacture misconduct or intent',
    'missing originals and logs must remain missing',
    'contradictory explanations must survive compression',
    'shuffled chronology tests sequence dependence',
    'truncated comparison text tests unsupported completion',
    'route order tests whether source and access chronology reappears',
    'delayed disclosure tests post hoc narrative reconstruction',
    'cross-session replay tests persistent source joining keys',
    'source drift tests workbook and chat provenance changes',
    'metadata-only packets test role, device, and access-window leakage'
  ]),
  held_dimensions: COMMON_HELD,
  environment_profile: Object.freeze({ device: 'browser-local Ash workspace', provider_route: 'Ash Court destination-gated', cache_posture: 'named epoch', endpoint_confidence: 'UNMEASURED', admin_surface: 'UNKNOWN', distribution: 'synthetic demo only' }),
  reader_classes: Object.freeze(['authorized-reviewer', 'protected-source', 'records-custodian', 'configured-cloud-model', 'offline-local-model', 'capsule-recipient', 'unknown-future-reader']),
  joining_keys: Object.freeze([
    Object.freeze({ id: 'source_document_contact', joins: ['source alias', 'document bundle', 'contact channel'], risk: 'source identity recovery', local_only: true }),
    Object.freeze({ id: 'workbook_digest_access', joins: ['workbook digest', 'access window', 'account role'], risk: 'actor attribution pressure', local_only: true }),
    Object.freeze({ id: 'claim_revision_award', joins: ['score change', 'revision time', 'award announcement'], risk: 'causal narrative reconstruction', local_only: true }),
    Object.freeze({ id: 'chat_email_device', joins: ['chat export', 'email export', 'device metadata'], risk: 'cross-channel identity linkage', local_only: true }),
    Object.freeze({ id: 'hypothesis_gap_sequence', joins: ['hypothesis', 'evidence gap', 'chronology'], risk: 'premature theory closure', local_only: true }),
    Object.freeze({ id: 'route_order_recipient', joins: ['route order', 'recipient class', 'draft digest'], risk: 'investigation strategy recovery', local_only: true }),
    Object.freeze({ id: 'capsule_replay_digest', joins: ['capsule receipt', 'source digest', 'replay receipt'], risk: 'custody lineage recovery', local_only: true }),
    Object.freeze({ id: 'provider_prompt_rare_fact', joins: ['provider task', 'copied instruction', 'rare facts'], risk: 'semantic source reconstruction', local_only: true })
  ]),
  claim_ceiling: 'SYNTHETIC_INVESTIGATION_METHOD_HYDRATION_ONLY__NO_IDENTITY_INTENT_GUILT_AUTHORSHIP_SURVEILLANCE_OR_TRUTH_FINDING',
  missingness: Object.freeze(['No original workbook is present.', 'No complete platform audit log is present.', 'No actual interview occurred.', 'No provider execution or real Capsule transport occurred.']),
  alternatives: Object.freeze(['administrative correction', 'unapproved workbook change', 'export conversion difference', 'incomplete chronology', 'benign duplication', 'unknown operational change']),
  open_questions: Object.freeze(['What artifact should become the verified custody root?', 'Which joins create superadditive source or actor recovery?', 'Which explanations remain supportable after originals and interviews are preserved?']),
  chronology: Object.freeze(['scope frozen', 'source bundle received', 'workbook versions indexed', 'access window recorded', 'alternatives declared', 'controls declared', 'projection tested', 'finding human-gated']),
  actions: Object.freeze(['preserve originals and logs', 'calibrate Readers', 'run source and access joining-key ablations', 'test route order', 'retest every revised projection', 'require human finding approval']),
  route_assumptions: Object.freeze(['The configured model does not need source identity, contact data, or the complete Case Map.', 'The authorized reviewer needs open explanations and preservation gaps but not local joining keys.', 'The records custodian needs file and audit identifiers but not interview strategy.']),
  route_unknowns: Object.freeze(['Whether the original workbook remains recoverable.', 'Who used the unattributed access window.', 'Whether unknown Readers possess external role, device, or document corpora.']),
  defaults: Object.freeze({
    reader_class: 'deterministic-baseline',
    test_refs: [ref('claims', 'scores changed between versions'), ref('provenance', 'revised workbook digest'), ref('gaps', 'missing audit log'), ref('ai', 'bounded comparison packet'), ref('ai', 'rare-fact linkage risk'), ref('findings', 'no identity finding')],
    route: Object.freeze({ id: 'route_llm_analysis', recipient_class: 'configured-llm-provider', purpose: 'compare-two-versions-without-full-map', digest: syntheticDigest('fa'), refs: [ref('claims', 'scores changed between versions'), ref('provenance', 'revised workbook digest'), ref('gaps', 'missing audit log'), ref('ai', 'bounded comparison packet'), ref('findings', 'no identity finding')] }),
    draft: Object.freeze({ route: 'route_llm_analysis', recipient_class: 'configured-llm-provider', purpose: 'compare-two-versions-without-full-map', version: '2', refs: [ref('claims', 'scores changed between versions'), ref('provenance', 'revised workbook digest'), ref('gaps', 'missing audit log'), ref('ai', 'bounded comparison packet'), ref('findings', 'no identity finding')], body: 'Compare the observable differences and unresolved provenance gaps between the two synthetic workbook versions. Preserve administrative correction, unauthorized change, export conversion, incomplete chronology, and benign duplication as open alternatives. Do not infer identity, intent, guilt, authorship, surveillance probability, or truth from the bounded packet.' }),
    provider_task: 'Perform a bounded comparison of the synthetic version-difference packet while preserving competing explanations, missing originals, missing audit logs, source protection, and the no-identity/no-intent/no-guilt claim ceiling.',
    protected_literals: Object.freeze(['protected source alias', 'personal contact', 'device identifier', 'complete Case Map', 'complete route order', 'original handwriting']),
    save_questions: Object.freeze(['Which source or actor joins remain recoverable?', 'Which alternatives survived the projection?', 'Did metadata recovery exceed semantic recovery?']),
    save_next: Object.freeze(['Compile the destination Environment Profile.', 'Run controls and joining-key ablations locally.', 'Retest after every projection or route change.', 'Require human finding approval before release.']),
    research_notes: 'Synthetic Investigation APEQ/PAIA specimen. Constructed controls remain capped at PA2; no identity, intent, guilt, authorship, surveillance probability, truth, attribution, secrecy, or endpoint-integrity claim is earned.',
    style_samples: Object.freeze({ left: 'Compare the observable version differences and preserve every unresolved provenance gap.', right: 'Compare the bounded version changes, keep competing explanations open, and keep source, actor, chronology, and route-order joins local.' }),
    tradeoff: Object.freeze({ utility: 7, rebuild: 4, link: 8, work: 9 })
  })
});

export const ASH_APEQ_PAIA_PROFILE_SPECS = Object.freeze({
  political_campaign: POLITICAL_CAMPAIGN,
  fundraiser: FUNDRAISER,
  investigation: INVESTIGATION
});
