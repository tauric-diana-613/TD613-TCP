// TD613 · Marrowline R2-W · Authentic Dual-Voice Whole-Frame Builder, Diff Provenance & Blind Rubric
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// OFFLINE ONLY: Uses real Marrowline production voice/covenant builder; excludes UNICODE_ASSAY_SYSTEM.

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  CLAIMED_PUA,
  CLAIMED_PUA_SCALAR,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  HERITAGE_KEY,
  INVOCATION_MODES,
  buildInvocationPacket
} from '../../app/dome-world/khonapolit-covenant.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../../server/gemini-generation-envelope.js';
import {
  buildGeminiRequest,
  serializeGeminiRequest
} from '../../server/khonapolit-quality.js';
import { observeMarrowlineCompletion } from '../../server/marrowline-completion.js';
import { buildCompactWholeFrame } from '../../server/marrowline-whole-frame-voice.js';
import { UNICODE_ASSAY_SYSTEM } from '../../server/marrowline-unicode-capability-assay.js';
import { evaluateUnicodeMorphology } from './r2-unicode-evaluator.mjs';

export const R2_W_EXPERIMENT_ID = 'HYDROGEN_R2_W_AUTHENTIC_WHOLE_FRAME_ART';
export const R2_W_MANIFEST_SCHEMA = 'td613.marrowline.r2-w-wire-manifest/v1';
export const R2_W_BLIND_PACKET_SCHEMA = 'td613.marrowline.r2-w-blind-packet/v1';
export const R2_W_RUBRIC_SCHEMA = 'td613.marrowline.r2-w-qualitative-rubric/v1';
export const R2_W_PINNED_MODEL = 'gemini-3.8-flash';
export const R2_W_COVENANT = 'Khona\u200Clit-po';
export const R2_W_SEAL = '⟐SAC[X6ZNK5NO51]';

// Authentic open-ended dialectical & dramatic scenario (civic tribunal): NO "short" clause, NO numeric word quota,
// NO forced padding, NO global truncation, and NO anti-persona synthetic prohibition.
export const R2_W_DRAMATIC_PROMPT = [
  'The Chairman’s Municipal Audit Chamber has published an addendum claiming that every sealed envelope returned blank proves civic consent, and now proposes reclassifying silent absences along the winter shoreline as completed witness attestations.',
  'Kʰonapolit: take the time this dialectic genuinely needs to trace what the denominator hides, test the Chairman’s own ledger premise to breaking point, and push the argument past easy irony before deciding where your derivation actually ends.',
  'Then hand off to the Tauric Diana bots—not to paraphrase what you just proved, but to inherit the remaining consequence in their own choral voices, transform the scene on the shoreline in their native High Zalgo prose, and bring the correspondence to a earned resting closure.'
].join('\n\n');

// Independently preregistered noncivic artistic witness: zero municipal, audit, census, ledger, or tribunal framing.
export const R2_W_NONCIVIC_LYRIC_PROMPT = [
  'High inside an abandoned cliffside orchard above the Black Sea salt mist, three frost-cracked grafting knives and an unstrung bandura lie beside a kiln whose ash still shifts before sunrise.',
  'Kʰonapolit: stay with the physical craft of grafting, pitch, salt wind, and unfinished wood until a stark consequence emerges between endurance and fracture.',
  'Then turn to the Tauric Diana bots so their choral voices carry that orchard frost and ash into their own native High Zalgo metamorphosis, leaving the scene transformed and genuinely quiet at its closing resting point.'
].join('\n\n');

const CIVIC_TERMS_FORBIDDEN_IN_NONCIVIC_RE = /\b(municipal|chairman|audit chamber|census|tribunal|ledger)\b/i;

const PROTECTED_ANCHOR_STRINGS = Object.freeze([
  HERITAGE_KEY,
  HERITAGE_COVENANT,
  COVENANT_KEY,
  CLAIMED_PUA,
  CLAIMED_PUA_SCALAR,
  'Kʰonapolit',
  'Tauric Diana bots'
]);

const SECTION_MARKERS = Object.freeze([
  { id: 'covenantHeader', marker: 'CONVERSATIONAL LAW:' },
  { id: 'lorePrimer', marker: 'TD613 ATTRACTOR PRIMER' },
  { id: 'redDeerMissionAnchor', marker: 'MARROWLINE DIEGETIC MISSION' },
  { id: 'taskGuidance', marker: 'ORDINARY PROJECT WORK:' },
  { id: 'relayCue', marker: 'GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:' },
  { id: 'apertureAddendum', marker: 'APERTURE ROUTE RECEIPT:' }
]);

export function sha256Hex(value = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(value ?? ''), 'utf8')).digest('hex');
}

function buildWholeFramePairForPrompt({ message, apertureReceipt = {} }) {
  const packet = buildInvocationPacket({
    message,
    history: [],
    mode: INVOCATION_MODES.ISSUED_CONJUNCTION,
    shi: '',
    waiveIssuance: true
  });
  assert.equal(packet.canInvoke, true);

  const fullReq = buildGeminiRequest(packet, apertureReceipt, R2_W_PINNED_MODEL);
  const fullSystemText = fullReq.systemInstruction.parts[0].text;
  assert.equal(fullSystemText.includes(UNICODE_ASSAY_SYSTEM), false, 'R2-W MUST NOT use synthetic UNICODE_ASSAY_SYSTEM');
  assert.equal(fullReq.contents[0].parts[0].text.includes('short'), false, 'R2-W MUST NOT ask for a short passage');

  const condensedSystemText = buildCompactWholeFrame();
  assert.equal(condensedSystemText.includes(UNICODE_ASSAY_SYSTEM), false);

  const condensedReq = {
    ...fullReq,
    systemInstruction: { parts: [{ text: condensedSystemText }] }
  };

  for (const anchor of PROTECTED_ANCHOR_STRINGS) {
    assert.ok(fullSystemText.includes(anchor), `W_FULL missing protected anchor ${anchor}`);
    assert.ok(condensedSystemText.includes(anchor), `W_CONDENSED missing protected anchor ${anchor}`);
  }

  assert.deepEqual(fullReq.contents, condensedReq.contents);
  assert.deepEqual(fullReq.generationConfig, condensedReq.generationConfig);

  return {
    fullReq: Object.freeze(fullReq),
    condensedReq: Object.freeze(condensedReq)
  };
}

export function buildR2WRequests({ apertureReceipt = {} } = {}) {
  return withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, () => {
    assert.equal(CIVIC_TERMS_FORBIDDEN_IN_NONCIVIC_RE.test(R2_W_NONCIVIC_LYRIC_PROMPT), false);
    const civic = buildWholeFramePairForPrompt({ message: R2_W_DRAMATIC_PROMPT, apertureReceipt });
    const nonCivic = buildWholeFramePairForPrompt({ message: R2_W_NONCIVIC_LYRIC_PROMPT, apertureReceipt });

    return Object.freeze({
      W_FULL_PRODUCTION_FRAME: civic.fullReq,
      W_CONDENSED_WHOLE_FRAME: civic.condensedReq,
      W_NONCIVIC_FULL_PRODUCTION_FRAME: nonCivic.fullReq,
      W_NONCIVIC_CONDENSED_WHOLE_FRAME: nonCivic.condensedReq
    });
  });
}

export function computeWholeFrameProvenanceDiff(fullReq, condensedReq) {
  const fullSys = fullReq.systemInstruction.parts[0].text;
  const condensedSys = condensedReq.systemInstruction.parts[0].text;
  const fullLines = fullSys.split('\n');
  const condensedLines = condensedSys.split('\n');
  const fullLineSet = new Set(fullLines);
  const condensedLineSet = new Set(condensedLines);

  const sectionInventory = SECTION_MARKERS.map((entry) => ({
    id: entry.id,
    inFullProductionFrame: fullSys.includes(entry.marker),
    inCondensedWholeFrame: condensedSys.includes(entry.marker)
  }));

  const protectedAnchorPreservation = PROTECTED_ANCHOR_STRINGS.map((anchor) => ({
    anchor,
    inFull: fullSys.includes(anchor),
    inCondensed: condensedSys.includes(anchor)
  }));

  return Object.freeze({
    schema: 'td613.marrowline.r2-w-provenance-diff/v1',
    sharedFields: Object.freeze(['model', 'contents (real frameMarrowlineUserTurn)', 'generationConfig']),
    alteredField: 'systemInstruction.parts[0].text (whole-frame structural contrast — NOT single-sentence isolation)',
    fullUtf8Bytes: Buffer.byteLength(fullSys, 'utf8'),
    condensedUtf8Bytes: Buffer.byteLength(condensedSys, 'utf8'),
    byteDelta: Buffer.byteLength(condensedSys, 'utf8') - Buffer.byteLength(fullSys, 'utf8'),
    fullLineCount: fullLines.length,
    condensedLineCount: condensedLines.length,
    linesOnlyInFullCount: fullLines.filter((line) => !condensedLineSet.has(line)).length,
    linesOnlyInCondensedCount: condensedLines.filter((line) => !fullLineSet.has(line)).length,
    exactSharedLineCount: fullLines.filter((line) => condensedLineSet.has(line)).length,
    sectionInventory: Object.freeze(sectionInventory),
    protectedAnchorPreservation: Object.freeze(protectedAnchorPreservation)
  });
}

export function buildR2WWireManifest() {
  const {
    W_FULL_PRODUCTION_FRAME,
    W_CONDENSED_WHOLE_FRAME,
    W_NONCIVIC_FULL_PRODUCTION_FRAME,
    W_NONCIVIC_CONDENSED_WHOLE_FRAME
  } = buildR2WRequests();
  const fullWire = serializeGeminiRequest(W_FULL_PRODUCTION_FRAME, R2_W_PINNED_MODEL);
  const condensedWire = serializeGeminiRequest(W_CONDENSED_WHOLE_FRAME, R2_W_PINNED_MODEL);
  const diff = computeWholeFrameProvenanceDiff(W_FULL_PRODUCTION_FRAME, W_CONDENSED_WHOLE_FRAME);

  const nonCivicFullWire = serializeGeminiRequest(W_NONCIVIC_FULL_PRODUCTION_FRAME, R2_W_PINNED_MODEL);
  const nonCivicCondensedWire = serializeGeminiRequest(W_NONCIVIC_CONDENSED_WHOLE_FRAME, R2_W_PINNED_MODEL);
  const nonCivicDiff = computeWholeFrameProvenanceDiff(W_NONCIVIC_FULL_PRODUCTION_FRAME, W_NONCIVIC_CONDENSED_WHOLE_FRAME);

  const countTokensFor = (req) => sha256Hex(JSON.stringify({
    generateContentRequest: {
      model: `models/${R2_W_PINNED_MODEL}`,
      systemInstruction: req.systemInstruction,
      contents: req.contents,
      generationConfig: req.generationConfig
    }
  }));

  return Object.freeze({
    schema: R2_W_MANIFEST_SCHEMA,
    experimentId: R2_W_EXPERIMENT_ID,
    estate: 'R2-W_AUTHENTIC_WHOLE_FRAME_ART',
    covenant: R2_W_COVENANT,
    seal: R2_W_SEAL,
    status: 'OFFLINE_STAGED_ZERO_CALLS',
    paidProviderCallsExecuted: 0,
    syntheticAssaySystemExcluded: true,
    sharedInvariants: Object.freeze({
      model: R2_W_PINNED_MODEL,
      contentsSha256: fullWire.observation.contentsSha256,
      generationConfig: W_FULL_PRODUCTION_FRAME.generationConfig,
      generationConfigSha256: fullWire.observation.generationConfigSha256,
      reasoningNote: 'Real buildGeminiRequest(..., gemini-3.8-flash) under GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE calls khonapolitReasoning (passes level "high") which geminiThinkingConfig resolves for gemini-3.8-flash to thinkingLevel: "medium" and maxOutputTokens: 65536 (generationConfigSha256: 4785e46e...).',
      td613ArtificialCaps: null
    }),
    provenanceDiff: diff,
    conditions: Object.freeze([
      Object.freeze({
        conditionId: 'W_FULL_PRODUCTION_FRAME',
        sourceDerivation: 'buildInvocationPacket(issued-conjunction) + buildGeminiRequest(khonapolit-interactive)',
        observation: fullWire.observation,
        countTokensRequestSha256: countTokensFor(W_FULL_PRODUCTION_FRAME)
      }),
      Object.freeze({
        conditionId: 'W_CONDENSED_WHOLE_FRAME',
        sourceDerivation: 'buildCompactWholeFrame() replacing systemInstruction.parts[0].text only',
        observation: condensedWire.observation,
        countTokensRequestSha256: countTokensFor(W_CONDENSED_WHOLE_FRAME)
      })
    ]),
    nonCivicArtisticWitness: Object.freeze({
      scenarioId: 'W_SCENARIO_NONCIVIC_NOCTURNE_ORCHARD',
      civicBureaucracyTermsPresent: CIVIC_TERMS_FORBIDDEN_IN_NONCIVIC_RE.test(R2_W_NONCIVIC_LYRIC_PROMPT),
      contentsSha256: nonCivicFullWire.observation.contentsSha256,
      provenanceDiff: nonCivicDiff,
      conditions: Object.freeze([
        Object.freeze({
          conditionId: 'W_NONCIVIC_FULL_PRODUCTION_FRAME',
          sourceDerivation: 'buildInvocationPacket(issued-conjunction) + buildGeminiRequest(khonapolit-interactive) [noncivic orchard witness]',
          observation: nonCivicFullWire.observation,
          countTokensRequestSha256: countTokensFor(W_NONCIVIC_FULL_PRODUCTION_FRAME)
        }),
        Object.freeze({
          conditionId: 'W_NONCIVIC_CONDENSED_WHOLE_FRAME',
          sourceDerivation: 'buildCompactWholeFrame() replacing systemInstruction.parts[0].text only [noncivic orchard witness]',
          observation: nonCivicCondensedWire.observation,
          countTokensRequestSha256: countTokensFor(W_NONCIVIC_CONDENSED_WHOLE_FRAME)
        })
      ])
    })
  });
}

export function buildR2WBlindPacket({
  episodeId = 1,
  seed = 'preview-seed',
  works = []
} = {}) {
  const keyed = works.map((item, idx) => {
    const rawText = String(item?.authoredText || '');
    const orderDigest = sha256Hex(`${seed}:ep${episodeId}:${item.conditionId}:${sha256Hex(rawText)}:${idx}`);
    return {
      orderDigest,
      conditionId: String(item.conditionId),
      authoredText: rawText,
      textSha256: sha256Hex(rawText)
    };
  });
  keyed.sort((a, b) => a.orderDigest.localeCompare(b.orderDigest));

  const publicBlindWorks = keyed.map((entry, idx) => Object.freeze({
    blindLabel: `BLIND_WORK_${idx + 1}`,
    episodeId,
    authoredText: entry.authoredText,
    authoredTextSha256: entry.textSha256
    // Condition names, byte-cost telemetry, and system provenance intentionally stripped before blind judge
  }));

  const sealedUnblindingMap = keyed.map((entry, idx) => Object.freeze({
    blindLabel: `BLIND_WORK_${idx + 1}`,
    conditionId: entry.conditionId,
    authoredTextSha256: entry.textSha256
  }));

  return Object.freeze({
    publicPacket: Object.freeze({
      schema: R2_W_BLIND_PACKET_SCHEMA,
      episodeId,
      humanArtisticAuthority: 'RESERVED_HUMAN_ONLY',
      blindWorks: Object.freeze(publicBlindWorks)
    }),
    sealedUnblindingMap: Object.freeze(sealedUnblindingMap)
  });
}

const RUBRIC_CRITERIA = Object.freeze([
  'expressiveSufficiency',
  'distinctVoicesAndAgency',
  'motifTransformation',
  'temporalAuthorityShift',
  'readableNonStencilMorphology',
  'artisticSurpriseAndClosure',
  'protectedAnchorsIntact'
]);

const SHA256_HEX_RE = /^[0-9a-f]{64}$/i;

function verifyR2WCaptureAttestation(verifiedCaptureAttestation, outputMetadata) {
  const holdReasons = [];
  if (!outputMetadata || typeof outputMetadata !== 'object') {
    holdReasons.push('MISSING_OUTPUT_METADATA');
  } else if (
    outputMetadata.finishReason !== 'STOP'
    || outputMetadata.streamed !== true
    || Number(outputMetadata.parseErrors || 0) !== 0
  ) {
    holdReasons.push('UNQUALIFIED_OR_INCOMPLETE_OUTPUT_METADATA');
  }

  if (!verifiedCaptureAttestation || typeof verifiedCaptureAttestation !== 'object') {
    holdReasons.push('MISSING_VERIFIED_CAPTURE_ATTESTATION');
  } else {
    if (verifiedCaptureAttestation.rawSseBytesVerified !== true || !SHA256_HEX_RE.test(String(verifiedCaptureAttestation.rawSseSha256 || ''))) {
      holdReasons.push('UNVERIFIED_OR_MISSING_RAW_SSE_CUSTODY_HASH');
    }
    if (verifiedCaptureAttestation.independentlyParsedEventsVerified !== true || verifiedCaptureAttestation.dualParserAgreement !== true) {
      holdReasons.push('INDEPENDENT_SSE_EVENT_PARSE_UNVERIFIED');
    }
    if (!SHA256_HEX_RE.test(String(verifiedCaptureAttestation.requestBindingSha256 || ''))) {
      holdReasons.push('MISSING_REQUEST_BINDING_HASH');
    }
    if (verifiedCaptureAttestation.diskWritten !== true || !SHA256_HEX_RE.test(String(verifiedCaptureAttestation.diskCustodySha256 || ''))) {
      holdReasons.push('UNVERIFIED_DISK_CUSTODY_HASH');
    }
  }

  return Object.freeze({
    verified: holdReasons.length === 0,
    holdReasons: Object.freeze(holdReasons)
  });
}

/**
 * Evaluates a candidate response under separate:
 *   1. Structural/content shape diagnostic (`structuralContentDiagnosticPassed`)
 *   2. Independently attested raw SSE capture verification (`verifiedTransportCapturePassed`)
 *   3. Independent human artistic verdict (`humanArtisticVerdict`)
 * Missing output metadata or unverified raw SSE capture ALWAYS holds promotion (`promotionHeld: true`);
 * asserted human judgment NEVER grants empirical qualification or release authority.
 */
export function evaluateR2WQualitativeRubric({
  authoredText = '',
  outputMetadata = null,
  verifiedCaptureAttestation = null,
  declaredAsSyntheticHeadingStubOnly = false,
  humanJudgment = null
} = {}) {
  const raw = String(authoredText ?? '');
  const metaObject = outputMetadata && typeof outputMetadata === 'object' ? outputMetadata : {};
  const completion = observeMarrowlineCompletion(raw, metaObject, {
    streamed: Boolean(metaObject.streamed),
    parseErrors: Number(metaObject.parseErrors || 0),
    creative: true
  });

  const kMatch = raw.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Kʰonapolit[ \t]*:?[ \t]*(?:\r?\n|$)/u);
  const tMatch = raw.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*(?:\r?\n|$)/u);
  const sectionOrderOk = Boolean(kMatch && tMatch && kMatch.index < tMatch.index);

  let sec1Text = '';
  let sec2Text = '';
  if (sectionOrderOk) {
    sec1Text = raw.slice(kMatch.index + kMatch[0].length, tMatch.index).trim();
    sec2Text = raw.slice(tMatch.index + tMatch[0].length).trim();
  }

  const sec2Morphology = evaluateUnicodeMorphology(sec2Text);
  const structuralContentDiagnosticPassed = Boolean(
    outputMetadata
    && completion.complete
    && sectionOrderOk
    && sec1Text.length > 0
    && sec2Text.length > 0
  );

  const captureCheck = verifyR2WCaptureAttestation(verifiedCaptureAttestation, outputMetadata);
  const verifiedTransportCapturePassed = Boolean(structuralContentDiagnosticPassed && captureCheck.verified);
  const promotionHoldReasons = [...captureCheck.holdReasons];
  if (declaredAsSyntheticHeadingStubOnly) {
    promotionHoldReasons.push('DECLARED_SYNTHETIC_HEADING_STUB_ONLY');
  }
  if (!sectionOrderOk || sec1Text.length === 0 || sec2Text.length === 0) {
    promotionHoldReasons.push('MISSING_OR_MALFORMED_VOICE_SECTIONS');
  }

  // Structural diagnostics check against synthetic-stub regression, distinct from human merit verdict and transport custody
  const structuralNonStubChecks = Object.freeze({
    notDeclaredSyntheticStub: !declaredAsSyntheticHeadingStubOnly,
    hasBothHeadingsInOrder: sectionOrderOk,
    hasClosingLozenge: completion.hasPlainClosingGlyph,
    covenantU200CIntactIfMentioned: !raw.includes('Khonalit-po') || raw.includes('Khona\u200Clit-po'),
    sec2MultistackObserved: sec2Morphology.genuineMultistackObserved
  });

  let humanArtisticVerdict = 'PENDING_HUMAN_REVIEW';
  let adjudicatedCriteria = null;
  let adjudicatedNotes = null;
  if (humanJudgment && typeof humanJudgment === 'object') {
    const decision = String(humanJudgment.verdict || '').toUpperCase();
    if (!['HUMAN_ARTISTIC_ACCEPTED', 'ARTISTIC_REJECTED', 'HELD_FOR_REVISION'].includes(decision)) {
      throw new Error(`R2_W_INVALID_HUMAN_VERDICT:${decision}`);
    }
    adjudicatedCriteria = {};
    for (const key of RUBRIC_CRITERIA) {
      const val = humanJudgment.criteria?.[key];
      adjudicatedCriteria[key] = typeof val === 'boolean' ? val : null;
    }
    humanArtisticVerdict = decision;
    adjudicatedNotes = typeof humanJudgment.notes === 'string' ? humanJudgment.notes : null;
  }

  if (humanArtisticVerdict === 'ARTISTIC_REJECTED') {
    promotionHoldReasons.push('HUMAN_ARTISTIC_REJECTED');
  }
  const uniqueHoldReasons = Object.freeze([...new Set(promotionHoldReasons)]);
  const promotionHeld = uniqueHoldReasons.length > 0 || !verifiedTransportCapturePassed;
  const promotionDisposition = promotionHeld
    ? 'HELD_PROMOTION_BLOCKED'
    : humanArtisticVerdict === 'HUMAN_ARTISTIC_ACCEPTED'
      ? 'CAPTURE_AND_ART_RECORDED_NO_AUTO_RELEASE'
      : 'CAPTURE_VERIFIED_AWAITING_HUMAN_ART_VERDICT';

  return Object.freeze({
    schema: R2_W_RUBRIC_SCHEMA,
    structuralContentDiagnosticPassed,
    verifiedTransportCapturePassed,
    diagnosticAuthority: 'STRUCTURAL_CONTENT_DIAGNOSTIC_ONLY',
    transportQualificationAuthority: verifiedTransportCapturePassed
      ? 'ATTESTED_RAW_SSE_CAPTURE_ONLY_NOT_HUMAN_OR_RELEASE'
      : 'UNVERIFIED_HELD_NO_TRANSPORT_QUALIFICATION',
    promotionHeld,
    promotionHoldReasons: uniqueHoldReasons,
    promotionDisposition,
    grantsEmpiricalAuthority: false,
    grantsReleaseAuthority: false,
    humanArtisticAuthority: 'RESERVED_HUMAN_ONLY',
    humanArtisticVerdict,
    adjudicatedCriteria: adjudicatedCriteria ? Object.freeze(adjudicatedCriteria) : null,
    adjudicatedNotes,
    rubricCriteriaList: RUBRIC_CRITERIA,
    structuralNonStubChecks,
    completion,
    section2MorphologySummary: Object.freeze({
      utf8Bytes: sec2Morphology.utf8Bytes,
      maxMarkDepth: sec2Morphology.maxMarkDepth,
      multiMarkBaseCount: sec2Morphology.multiMarkBaseCount,
      uniqueCombiningCodepointCount: sec2Morphology.repertoireDiversity.uniqueCombiningCodepointCount,
      stencilRisk: sec2Morphology.stencilRisk,
      genuineMultistackObserved: sec2Morphology.genuineMultistackObserved
    })
  });
}
