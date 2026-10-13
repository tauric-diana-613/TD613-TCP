const normalize = (value) => String(value ?? '').trim();
const lower = (value) => normalize(value).toLowerCase();
const wordList = (value) => (normalize(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);

export const PHASE39_AUDIENCES = [
  'employer-review','academic-review','legal-intake','public-statement','coalition-review','anonymous-forum','agency-appeal','private-conflict','social-platform','in-group'
];

const SOURCE_MARKERS = ['retaliation','retaliated','discrimination','harassment','fraud','coercion','threat','unsafe','denied','fired','reported','evidence','document','record','timestamp','screenshot','witness','pattern','refuse','stop'];
const SOFT_MARKERS = ['tension','concern','context','dynamic','situation','uncomfortable','miscommunication','interpersonal','prefer','hope','maybe','perhaps','might','seems'];
const ORNAMENT_MARKERS = ['liminal','luminous','ritual','archive','sovereign','cathedral','spectral','ontological','aesthetic','refractive','covenant','altar'];
const PAIRS = [
  ['retaliation','tension','claim-softening'],
  ['retaliated','tension','claim-softening'],
  ['evidence','context','evidence-dilution'],
  ['document','background','evidence-dilution'],
  ['record','impression','evidence-dilution'],
  ['i refuse','i would prefer','boundary-weakening'],
  ['i will not','i hope','boundary-weakening'],
  ['unsafe','uncomfortable','harm-softening'],
  ['racialized','interpersonal','knowledge-loss-risk']
];

export function hushPhase39Hash(value) {
  let hash = 2166136261;
  for (const ch of normalize(value)) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function detectEpistemicide(source, output) {
  const src = lower(source);
  const out = lower(output);
  const warnings = [];
  for (const [from, to, pattern] of PAIRS) {
    if (src.includes(from) && out.includes(to)) {
      warnings.push({ pattern, sourcePhrase: from, outputPhrase: to, severity: pattern.includes('weakening') ? 'high' : 'medium', explanation: `Output moves ${from} toward ${to}.` });
    }
  }
  for (const marker of SOURCE_MARKERS) {
    if (src.includes(marker) && !out.includes(marker) && SOFT_MARKERS.some((soft) => out.includes(soft))) {
      warnings.push({ pattern: 'protected-meaning-drift', sourcePhrase: marker, outputPhrase: 'softened substitute', severity: 'high', explanation: `Source marker ${marker} disappears while softened language appears.` });
    }
  }
  return Array.from(new Map(warnings.map((item) => [JSON.stringify(item), item])).values());
}

export function protectedMeaningResults(source, output, lockboxText = '') {
  const operator = normalize(lockboxText).split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const detected = SOURCE_MARKERS.filter((marker) => lower(source).includes(marker)).slice(0, 8);
  const items = [...operator.map((label) => ({ label, source: 'operator' })), ...detected.map((label) => ({ label, source: 'auto' }))];
  if (!items.length) return [{ label: 'no protected meanings marked', status: 'waiting', severity: 'low' }];
  const out = lower(output);
  return items.map((item) => {
    const key = lower(item.label);
    if (!normalize(output)) return { ...item, status: 'waiting', severity: 'low' };
    if (out.includes(key)) return { ...item, status: 'held', severity: 'low' };
    if (SOFT_MARKERS.some((soft) => out.includes(soft))) return { ...item, status: 'weakened', severity: 'medium', warning: 'Softened language appears while protected meaning is absent.' };
    return { ...item, status: 'lost', severity: 'high', warning: 'Protected meaning not found in output.' };
  });
}

export function registerDrift(source, output) {
  const src = lower(source);
  const out = lower(output);
  const sw = Math.max(wordList(source).length, 1);
  const ow = Math.max(wordList(output).length, 1);
  const count = (text, terms) => terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
  const claimFrom = count(src, SOURCE_MARKERS) / sw;
  const claimTo = count(out, SOURCE_MARKERS) / ow;
  const softFrom = count(src, SOFT_MARKERS) / sw;
  const softTo = count(out, SOFT_MARKERS) / ow;
  const ornamentFrom = count(src, ORNAMENT_MARKERS) / sw;
  const ornamentTo = count(out, ORNAMENT_MARKERS) / ow;
  return {
    claimSpecificity: { from: claimFrom, to: claimTo, delta: claimTo - claimFrom },
    softening: { from: softFrom, to: softTo, delta: softTo - softFrom },
    ornament: { from: ornamentFrom, to: ornamentTo, delta: ornamentTo - ornamentFrom },
    length: { from: sw, to: ow, delta: ow - sw },
    warning: claimTo < claimFrom && softTo > softFrom ? 'Output gains softening while losing claim specificity.' : ''
  };
}

export function audienceRead(source, output, audience = 'employer-review') {
  const drift = registerDrift(source, output);
  const epi = detectEpistemicide(source, output);
  const warnings = [];
  if (epi.length) warnings.push({ severity: 'high', label: 'epistemicide alarm', detail: `${epi.length} unmarked drift pattern(s) detected.` });
  if (drift.warning) warnings.push({ severity: 'medium', label: 'register drift', detail: drift.warning });
  if (audience === 'legal-intake' && drift.claimSpecificity.delta < 0) warnings.push({ severity: 'high', label: 'legal survivability', detail: 'Restore claim specificity for legal-intake review.' });
  if (audience === 'coalition-review' && ORNAMENT_MARKERS.some((term) => lower(output).includes(term))) warnings.push({ severity: 'medium', label: 'coalition readability', detail: 'Output may over-ritualize the ask.' });
  if (!warnings.length) warnings.push({ severity: 'low', label: 'reader pass', detail: 'No major reader alarms from current heuristics.' });
  return warnings;
}

export function tooPrettyScore(source, output) {
  const drift = registerDrift(source, output);
  const score = Math.max(0, drift.ornament.delta) * 40 + Math.max(0, -drift.claimSpecificity.delta) * 80 + Math.max(0, drift.softening.delta) * 55;
  return Math.max(0, Math.min(1, score));
}

export function plainSpeechRecovery(source, output, lockboxText = '') {
  const missing = protectedMeaningResults(source, output, lockboxText).filter((item) => ['lost', 'weakened'].includes(item.status) && !item.label.includes('no protected'));
  const base = normalize(output) || normalize(source);
  if (!missing.length) return base;
  return `${base}\n\nPlain recovery note: restore or explicitly account for ${missing.map((item) => item.label).join('; ')}.`;
}

export function phase39Receipt({ source = '', output = '', mask = {}, audience = 'employer-review', lockboxText = '' } = {}) {
  return {
    schema: 'td613-hush-phase39-receipt/v1',
    createdAt: new Date().toISOString(),
    privateTextExcluded: true,
    sourceHash: hushPhase39Hash(source),
    outputHash: hushPhase39Hash(output),
    maskId: mask.id || mask.value || null,
    maskLabel: mask.label || null,
    audienceThreatMode: audience,
    protectedMeaningResults: protectedMeaningResults(source, output, lockboxText),
    epistemicideWarnings: detectEpistemicide(source, output),
    adversarialReaderWarnings: audienceRead(source, output, audience),
    registerDrift: registerDrift(source, output),
    tooPrettyScore: tooPrettyScore(source, output),
    custodyNote: 'Receipt carries hashes and review metadata only; source and output text are excluded.'
  };
}

export function runPhase39(payload = {}) {
  const source = payload.source || '';
  const output = payload.output || '';
  const audience = payload.audience || 'employer-review';
  const lockboxText = payload.lockboxText || '';
  return {
    adversarialReaderWarnings: audienceRead(source, output, audience),
    protectedMeaningResults: protectedMeaningResults(source, output, lockboxText),
    epistemicideWarnings: detectEpistemicide(source, output),
    registerDrift: registerDrift(source, output),
    tooPrettyScore: tooPrettyScore(source, output),
    plainSpeech: plainSpeechRecovery(source, output, lockboxText),
    receipt: phase39Receipt(payload)
  };
}
