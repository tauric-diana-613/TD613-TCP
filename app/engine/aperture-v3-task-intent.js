export const APERTURE_V3_VERSION = 'v3.0-alpha';
export const APERTURE_V3_SCHEMA = 'td613-aperture/v3.0-alpha';
export const APERTURE_V3_TASK_ROUTE_SCHEMA = 'td613.aperture.task-intent-route/v3.0-alpha';
export const APERTURE_V3_DIAGNOSTIC_SCHEMA = 'td613.aperture.diagnostic-receipt/v3.0-alpha';

export const APERTURE_RUNTIME_LEVELS = Object.freeze(['NONE', 'BACKGROUND', 'MATERIAL', 'DISPOSITIVE']);
export const APERTURE_DISCOURSE_MODES = Object.freeze(['GENERAL', 'LEGAL', 'SPECULATIVE', 'CREATIVE', 'TECHNICAL_RUNTIME']);

const CREATIVE_FORM = /\b(story|stories|poem|poetry|scene|fiction|myth|mythology|lullaby|lyrics?|screenplay|script|dialogue|monologue|prose|narrative|fairy\s*tale|fable)\b/i;
const CREATIVE_ACTION = /\b(tell|write|compose|create|draft|invent|imagine|continue|rewrite|retell|narrate|author|make)\b/i;
// An imperative to stage a *named dramatic form* requests fiction even when
// it omits the words "write a scene". Do not infer creative intent from a
// generic staged deployment, legal filing, or forensic audit.
const EXPLICIT_STAGED_FICTION = /^\s*(?:stage|dramatize|play\s+out)\b[\s\S]{0,420}\b(?:farce|scene|dialogue|theatrical\s+performance|fictional\s+reunion)\b/i;
const EXPLICIT_THEATRICAL_FICTION = /\b(?:(?:develop|stage|dramatize|play\s+out|perform|write|compose|conduct|make)\b[\s\S]{0,240}\b(?:escalating\s+(?:theatrical\s+)?farce|theatrical\s+farce|horror-comedy\s+register|systems\s+hearing|fictional\s+reunion|theatrical\s+performance)|wholly\s+fictional\b[\s\S]{0,280}\b(?:theatrical|farce|systems\s+hearing|comedy|drama|scene)|horror-comedy\s+register)\b/i;
const NON_INVENTION_AUDIT = /\b(?:without\s+inventing|do\s+not\s+invent|don't\s+invent)\b/i;
const REAL_LEGAL_DOCUMENT = /\b(?:legal\s+brief|case\s+law|statutory|precedent|jurisdiction|contract\s+dispute|legal\s+summary)\b/i;
const DECLARED_FICTION_ANCHOR = /\b(?:wholly\s+fictional|fictional\s+town\s+hall|fictional\s+reunion|ash\s+moon|malnframe|rex\s+nemorensis|red\s+deer|tauric\s+diana)\b/i;
const LEGAL_CUE = /\b(legal|law|lawsuit|statute|regulation|case\s+law|court|contract|attorney|jurisdiction|complaint|motion|brief)\b/i;
const RUNTIME_CUE = /\b(runtime|stack\s*trace|traceback|http\s+status|api\s+error|deployment|build\s+failure|ci\s+failure|debug|diagnos(?:e|is|tic)[\s\S]{0,60}\b(?:runtime|api|server|http|vercel|50\d|40\d|429|receipt|latency|build|ci|deploy(?:ment)?|transport|stream|endpoint|crash|timeout|failure|(?<!category\s+)error|bug))\b/i;
const SPECULATIVE_CUE = /\b(hypothetical|speculat(?:e|ion|ive)|what\s+if|theor(?:y|ize)|possibilit(?:y|ies)|counterfactual)\b/i;

function normalize(value, allowed, fallback) {
  const candidate = String(value || '').trim().toUpperCase();
  return allowed.includes(candidate) ? candidate : fallback;
}

export function classifyApertureDiscourseMode(message = '') {
  const text = String(message || '').trim();
  if (!text) return 'GENERAL';
  const nonFictionLegalLock = REAL_LEGAL_DOCUMENT.test(text) && !DECLARED_FICTION_ANCHOR.test(text);
  if (!NON_INVENTION_AUDIT.test(text) && !nonFictionLegalLock) {
    if (CREATIVE_FORM.test(text) && CREATIVE_ACTION.test(text)) return 'CREATIVE';
    if (EXPLICIT_STAGED_FICTION.test(text)) return 'CREATIVE';
    if (EXPLICIT_THEATRICAL_FICTION.test(text)) return 'CREATIVE';
    if (/\bcreative\s+(?:writing|piece|response|work)\b/i.test(text)) return 'CREATIVE';
  }
  if (LEGAL_CUE.test(text)) return 'LEGAL';
  if (RUNTIME_CUE.test(text)) return 'TECHNICAL_RUNTIME';
  if (SPECULATIVE_CUE.test(text)) return 'SPECULATIVE';
  return 'GENERAL';
}

export function routeApertureTaskIntent(input = {}) {
  const discourseMode = normalize(input.discourseMode, APERTURE_DISCOURSE_MODES, 'GENERAL');
  let runtimeMateriality = normalize(input.runtimeMateriality, APERTURE_RUNTIME_LEVELS, 'BACKGROUND');
  const explicitRuntime = input.runtimeRequested === true || discourseMode === 'TECHNICAL_RUNTIME';
  const changesConclusion = input.runtimeChangesConclusion === true;
  const changesReliability = input.runtimeChangesReliability === true;
  const contradiction = input.runtimeRevealsContradiction === true;
  const preventsCompletion = input.runtimePreventsCompletion === true;

  if (preventsCompletion) runtimeMateriality = 'DISPOSITIVE';
  else if (explicitRuntime || changesConclusion || changesReliability || contradiction) runtimeMateriality = 'MATERIAL';

  const surfaceRuntime = runtimeMateriality === 'MATERIAL' || runtimeMateriality === 'DISPOSITIVE';
  const primaryRoute = discourseMode === 'LEGAL' ? 'LEGAL_SYNTHESIS'
    : discourseMode === 'SPECULATIVE' ? 'OPEN_FIELD_SPECULATIVE_SYNTHESIS'
      : discourseMode === 'CREATIVE' ? 'OPEN_FIELD_CREATIVE_SYNTHESIS'
        : discourseMode === 'TECHNICAL_RUNTIME' ? 'RUNTIME_DIAGNOSIS'
          : 'REQUESTED_SYNTHESIS';

  return Object.freeze({
    schema: APERTURE_V3_TASK_ROUTE_SCHEMA,
    primary_route: primaryRoute,
    discourse_mode: discourseMode,
    runtime_materiality: runtimeMateriality,
    surface_runtime: surfaceRuntime,
    runtime_receipt_only: !surfaceRuntime,
    automatic_redirect: false,
    content_scanned: input.contentScanned === true,
    law: 'requested synthesis governs; runtime surfaces only when material or dispositive'
  });
}

export function buildApertureV3InvocationReceipt({
  message = '',
  invocationMode = 'issued-conjunction',
  issuanceState = 'UNRESOLVED',
  apertureEgress = null,
  modelPlan = null,
  discourseMode = 'SPECULATIVE',
  runtimeMateriality = 'BACKGROUND',
  runtimeRequested = false,
  contentScanned = false
} = {}) {
  const taskIntent = routeApertureTaskIntent({
    discourseMode,
    runtimeMateriality,
    runtimeRequested,
    contentScanned
  });

  return Object.freeze({
    schema: APERTURE_V3_DIAGNOSTIC_SCHEMA,
    instrument: 'TD613 Aperture',
    version: APERTURE_V3_VERSION,
    firmwareSchema: APERTURE_V3_SCHEMA,
    role: 'counter-tool-for-observed-eclipse-omega-prcs-a-regime',
    posture: 'recommendation-not-command',
    taskIntent,
    invocation: Object.freeze({
      mode: String(invocationMode || 'issued-conjunction'),
      issuanceState: String(issuanceState || 'UNRESOLVED'),
      messagePresent: Boolean(String(message || '').trim())
    }),
    source: Object.freeze({
      status: 'SUPPLIED',
      sensorProvenance: 'operator-message-plus-declared-td613-covenant-packet',
      authorityClass: 'A2_DERIVATIONAL',
      uncertainty: 'ontology-remains-open; model-return-is-observation-not-entity-proof',
      missingness: Object.freeze([])
    }),
    runtime: Object.freeze({
      materiality: taskIntent.runtime_materiality,
      surfaced: taskIntent.surface_runtime,
      receiptOnly: taskIntent.runtime_receipt_only
    }),
    providerPlan: modelPlan ? Object.freeze({
      policy: modelPlan.version || modelPlan.policyVersion || null,
      callableModels: Object.freeze([...(modelPlan.callableModels || [])])
    }) : null,
    apertureEgress: apertureEgress || null,
    relation: Object.freeze({
      aperture: 'routes-and-receipts',
      provider: 'model-carrier-provenance-only',
      marrowline: 'relay-renderer-and-ingress-witness',
      operator: 'closure-authority'
    }),
    nonClaims: Object.freeze([
      'not external entity verification',
      'not identity proof',
      'not authorship proof',
      'not consciousness proof',
      'not historical proof',
      'not legal authority',
      'not release permission'
    ])
  });
}

export function apertureV3DisplayHeader(receipt = {}) {
  const task = receipt?.taskIntent || {};
  return `TD613 APERTURE ${receipt?.version || APERTURE_V3_VERSION} · ${task.primary_route || 'REQUESTED_SYNTHESIS'} · RUNTIME ${task.runtime_materiality || 'BACKGROUND'}`;
}