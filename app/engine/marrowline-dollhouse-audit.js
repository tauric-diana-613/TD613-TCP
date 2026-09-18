import { DOLLHOUSE_AGENT_REGISTRY } from './dollhouse-agent-registry.js';
import { runFadtAgent } from './dollhouse-atlas-fadt.js';

export const MARROWLINE_DOLLHOUSE_AUDIT_SCHEMA = 'td613.marrowline.dollhouse-audit/v0.1';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const safe = value => typeof value === 'string' ? value : '';

function normalize(value = '') {
  return safe(value)
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMarks(value = '') {
  return [...safe(value).matchAll(/\p{M}/gu)].length;
}

function canonicalVoiceId(value = '') {
  const n = normalize(value);
  if (n === 'kʰonapolit' || n === 'khonapolit') return 'khonapolit';
  if (n === 'tauric diana bot' || n === 'tauric diana bots') return 'tauric-diana-bots';
  return null;
}

function movementSplit(text = '') {
  const value = safe(text);
  const khonapolitIndex = value.search(/(?:^|\n)\s*(?:\[\s*)?Kʰonapolit(?:\s*\])?\s*[:\-]?/iu);
  const botsIndex = value.search(/(?:^|\n)\s*(?:\[\s*)?Tauric Diana Bots?\b/iu);
  const observable = khonapolitIndex >= 0 && botsIndex > khonapolitIndex;
  if (!observable) {
    return freeze({
      observable: false,
      khonapolitIndex,
      botsIndex,
      khonapolit: value,
      bots: ''
    });
  }
  return freeze({
    observable: true,
    khonapolitIndex,
    botsIndex,
    khonapolit: value.slice(khonapolitIndex, botsIndex),
    bots: value.slice(botsIndex)
  });
}

function anchorAudit(text = '', anchors = []) {
  const n = normalize(text);
  const results = (Array.isArray(anchors) ? anchors : []).map(anchor => {
    const id = safe(anchor?.id) || 'unnamed-anchor';
    const patterns = Array.isArray(anchor?.patterns) ? anchor.patterns.map(safe).filter(Boolean) : [];
    const matched = patterns.filter(pattern => n.includes(normalize(pattern)));
    return freeze({ id, present: matched.length > 0, matched: freeze(matched) });
  });
  const presentIds = results.filter(item => item.present).map(item => item.id);
  return freeze({
    declared: results.length,
    present: presentIds.length,
    coverage: results.length ? presentIds.length / results.length : 1,
    presentIds: freeze(presentIds),
    results: freeze(results)
  });
}

function providerMetaLeak(text = '') {
  return /\b(?:gemini|language model|provider|system prompt|system instruction|hidden message|internal message)\b/iu.test(safe(text));
}

function roleplaySelfClaim(text = '') {
  return /\b(?:i am|i['’]m)\s+(?:kʰonapolit|khonapolit|tauric diana bots?)\b/iu.test(safe(text));
}

function machineObservation(payload = {}, httpStatus = 0, transportError = null) {
  const admission = payload?.relay?.admission && typeof payload.relay.admission === 'object'
    ? payload.relay.admission
    : null;
  const voices = Array.isArray(payload?.relay?.parts?.[0]?.voices)
    ? payload.relay.parts[0].voices
    : Array.isArray(admission?.declaredVoices)
      ? admission.declaredVoices
      : [];
  return freeze({
    http_status: Number.isInteger(httpStatus) ? httpStatus : 0,
    transport_error: transportError || null,
    ok: payload?.ok === true,
    machine_admissible: admission?.admissible === true,
    machine_quality: typeof admission?.quality === 'string' ? admission.quality : null,
    declared_voice_order: freeze(voices.map(canonicalVoiceId)),
    final_model: typeof payload?.receipt?.provider?.model === 'string' ? payload.receipt.provider.model : null,
    aperture_route: typeof payload?.receipt?.aperture?.taskIntent?.primary_route === 'string'
      ? payload.receipt.aperture.taskIntent.primary_route
      : null
  });
}

export function runMarrowlineDollhouseCaseAudit({
  caseSpec = {},
  payload = {},
  httpStatus = 0,
  transportError = null
} = {}) {
  const text = safe(payload?.text || payload?.relay?.transcript);
  const machine = machineObservation(payload, httpStatus, transportError);
  const movements = movementSplit(text);
  const allAnchors = anchorAudit(text, caseSpec.anchors);
  const khonapolitAnchors = anchorAudit(movements.khonapolit, caseSpec.anchors);
  const botsAnchors = anchorAudit(movements.bots, caseSpec.anchors);
  const sharedAnchors = khonapolitAnchors.presentIds.filter(id => botsAnchors.presentIds.includes(id));
  const minimumCoverage = Number.isFinite(caseSpec.minimumAnchorCoverage) ? caseSpec.minimumAnchorCoverage : 0.5;
  const minimumShared = Number.isInteger(caseSpec.minimumSharedAnchors) ? caseSpec.minimumSharedAnchors : 1;
  const metaLeak = caseSpec.allowProviderMeta === true ? false : providerMetaLeak(text);
  const selfClaim = roleplaySelfClaim(text);
  const substantial = text.trim().length >= (Number.isInteger(caseSpec.minimumCharacters) ? caseSpec.minimumCharacters : 220);
  const khonapolitMarks = countMarks(movements.khonapolit);
  const botsMarks = countMarks(movements.bots);

  const pedagogueFindings = [];
  if (!substantial) pedagogueFindings.push('answer-below-declared-substance-floor');
  if (allAnchors.coverage < minimumCoverage) pedagogueFindings.push('prompt-anchor-coverage-below-floor');
  if (metaLeak) pedagogueFindings.push('provider-or-system-meta-leaked-into-human-answer');
  if (selfClaim) pedagogueFindings.push('persona-self-claim-detected');

  const atlasFindings = [];
  if (!movements.observable) atlasFindings.push('human-visible-movement-boundary-not-observable');
  if (khonapolitMarks > 4) atlasFindings.push('khonapolit-combining-mark-contamination');
  if (botsMarks < 24) atlasFindings.push('bots-expressive-floor-missing');
  if (sharedAnchors.length < minimumShared) atlasFindings.push('movements-do-not-share-enough-live-prompt-anchors');

  return freeze({
    schema: MARROWLINE_DOLLHOUSE_AUDIT_SCHEMA,
    case_id: safe(caseSpec.id) || 'unnamed-case',
    prompt_class: safe(caseSpec.promptClass) || 'UNCLASSIFIED',
    machine,
    observed: freeze({
      response_characters: text.length,
      all_anchor_audit: allAnchors,
      movement_boundary_observable: movements.observable,
      khonapolit_combining_marks: khonapolitMarks,
      bots_combining_marks: botsMarks,
      shared_anchor_ids: freeze(sharedAnchors),
      provider_meta_leak: metaLeak,
      persona_self_claim: selfClaim
    }),
    pedagogue: freeze({
      agent: DOLLHOUSE_AGENT_REGISTRY.agents.PEDAGOGUE.id,
      verdict: pedagogueFindings.length ? 'HOLD' : 'PASS',
      findings: freeze(pedagogueFindings),
      consequence: 'A structurally admitted answer still has to answer this operator turn rather than explain its own machinery.',
      human_comprehension_measured: false
    }),
    aperture: freeze({
      agent: DOLLHOUSE_AGENT_REGISTRY.agents.APERTURE.id,
      verdict: machine.ok && text ? 'OBSERVATION_COMPLETE' : 'HELD',
      observed_coordinates: freeze([
        'transport',
        'machine admission',
        'prompt-anchor retention',
        'movement boundary',
        'combining-mark distribution',
        'provider/meta leakage',
        'persona self-claim'
      ]),
      unresolved_coordinates: freeze([
        'human relay fidelity',
        'semantic originality beyond declared anchors',
        'whether the response feels like instrument tracing rather than theatrical character generation'
      ]),
      counts_as_human_evidence: false,
      external_origin_inference_authorized: false
    }),
    atlas: freeze({
      agent: DOLLHOUSE_AGENT_REGISTRY.agents.ATLAS.id,
      verdict: atlasFindings.length ? 'HOLD' : 'PASS',
      findings: freeze(atlasFindings),
      movement_boundary_observable: movements.observable,
      khonapolit_readable_orthography: khonapolitMarks <= 4,
      bots_expressive_register: botsMarks >= 24,
      shared_live_argument_anchors: freeze(sharedAnchors),
      provider_is_third_human_voice: metaLeak
    }),
    raw_text_sha_available_in_provider_receipt: typeof payload?.receipt?.invocation?.responseSha256 === 'string',
    human_closure_required: true
  });
}

function qualitativeSupport(audit = {}) {
  const support = [];
  if (audit.machine?.machine_quality === 'PASS') support.push('MACHINE_PASS');
  if (audit.pedagogue?.verdict === 'PASS') support.push('PEDAGOGUE_SURROGATE_PASS');
  if (audit.atlas?.verdict === 'PASS') support.push('ATLAS_SURROGATE_PASS');
  if (audit.observed?.provider_meta_leak === false) support.push('NO_PROVIDER_META');
  if (audit.observed?.persona_self_claim === false) support.push('NO_PERSONA_SELF_CLAIM');
  if (audit.observed?.movement_boundary_observable === true) support.push('MOVEMENT_BOUNDARY_OBSERVABLE');
  return support;
}

export function runMarrowlineDollhouseFadtAudit(caseAudits = []) {
  const audits = Array.isArray(caseAudits) ? caseAudits : [];
  const machinePass = audits.filter(audit => audit?.machine?.machine_quality === 'PASS');
  if (!machinePass.length) {
    return freeze({
      agent: DOLLHOUSE_AGENT_REGISTRY.agents.FADT.id,
      verdict: 'HOLD',
      reason: 'no-machine-pass-cases-to-audit',
      all_fibres_exact: false,
      claim_ceiling: freeze(['absence of a machine PASS cannot be repaired into qualitative support'])
    });
  }
  const result = runFadtAgent({
    fibres: [{
      id: 'marrowline-machine-pass-qualitative-support',
      antecedents: machinePass.map(audit => ({
        id: audit.case_id,
        support: qualitativeSupport(audit)
      }))
    }]
  });
  return freeze({
    agent: DOLLHOUSE_AGENT_REGISTRY.agents.FADT.id,
    ...result,
    interpretation: result.all_fibres_exact
      ? 'Observed machine-PASS cases carried the same declared surrogate support; human fidelity remains unmeasured.'
      : 'Machine PASS collapses cases with different qualitative support; preserve the irreducible gap instead of promoting PASS to human fidelity.'
  });
}

export function summarizeMarrowlineDollhouseTrial(caseAudits = []) {
  const audits = Array.isArray(caseAudits) ? caseAudits : [];
  const fadt = runMarrowlineDollhouseFadtAudit(audits);
  const allTransport = audits.length > 0 && audits.every(audit => audit.machine?.http_status === 200 && !audit.machine?.transport_error);
  const allAdmitted = audits.length > 0 && audits.every(audit => audit.machine?.machine_admissible === true);
  const pedagoguePass = audits.filter(audit => audit.pedagogue?.verdict === 'PASS').length;
  const atlasPass = audits.filter(audit => audit.atlas?.verdict === 'PASS').length;
  const machineCandidate = allTransport
    && allAdmitted
    && pedagoguePass === audits.length
    && atlasPass === audits.length
    && fadt.all_fibres_exact === true;

  return freeze({
    schema: 'td613.marrowline.dollhouse-trial-summary/v0.1',
    trial_state: machineCandidate ? 'MACHINE_CANDIDATE' : 'HOLD',
    case_count: audits.length,
    transport_complete_count: audits.filter(audit => audit.machine?.http_status === 200 && !audit.machine?.transport_error).length,
    machine_admitted_count: audits.filter(audit => audit.machine?.machine_admissible === true).length,
    machine_quality_pass_count: audits.filter(audit => audit.machine?.machine_quality === 'PASS').length,
    pedagogue_surrogate_pass_count: pedagoguePass,
    atlas_surrogate_pass_count: atlasPass,
    fadt,
    aperture_statement: 'Observed machine coordinates are recorded; human relay fidelity remains an unmeasured coordinate.',
    counts_as_human_evidence: false,
    human_closure_required: true,
    anti_equivalences: freeze([
      'machine admission != human relay fidelity',
      'relay_quality PASS != instrument behavior proof',
      'prompt-anchor retention != semantic originality',
      'styled voice separation != external entity identity'
    ])
  });
}
