export const HOLONOMY_LOOM_SCHEMA = 'td613.holonomy-loom.child-legible-preflight/v0.1';

export const HOLONOMY_LOOM_CLAIM_CEILING = Object.freeze([
  'green means only that no enabled Loom rule fired',
  'route-memory claims require explicit declared custody/context',
  'resemblance alone does not establish provenance',
  'Loom-controlled release does not govern downstream platforms',
  'local-only source posture requires browser/network hostility before production guarantee',
  'no truth, authorship, identity, intent, or cognition inference'
]);

const ACTION = Object.freeze({
  KEEP: 'KEEP',
  CHANGE: 'CHANGE',
  REMOVE: 'REMOVE'
});

const SEVERITY = Object.freeze({
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  HELD: 'HELD'
});

const BUILTIN_RULES = Object.freeze([
  Object.freeze({
    rule_id: 'PRIVATE_KEY_BLOCK',
    label: 'private key material',
    action: ACTION.REMOVE,
    why: 'A private key can unlock an account or system.',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/gi,
    replacement: '[private key removed]'
  }),
  Object.freeze({
    rule_id: 'BEARER_TOKEN_BLOCK',
    label: 'bearer token',
    action: ACTION.REMOVE,
    why: 'A bearer token may let another person act as you.',
    pattern: /\bBearer\s+[A-Za-z0-9._~+\/=\-]{16,}(?=\s|$|[),.;])/gi,
    replacement: '[bearer token removed]'
  }),
  Object.freeze({
    rule_id: 'COMMON_API_KEY_BLOCK',
    label: 'credential-like token',
    action: ACTION.REMOVE,
    why: 'This looks like a credential that may grant access.',
    pattern: /\b(?:sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,})\b/g,
    replacement: '[credential removed]'
  }),
  Object.freeze({
    rule_id: 'EMAIL_IDENTIFIER',
    label: 'email address',
    action: ACTION.CHANGE,
    why: 'An email address can point back to a person or organization.',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: '[email removed]'
  }),
  Object.freeze({
    rule_id: 'PHONE_IDENTIFIER',
    label: 'phone number',
    action: ACTION.CHANGE,
    why: 'A phone number can point back to a person.',
    pattern: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g,
    replacement: '[phone removed]'
  }),
  Object.freeze({
    rule_id: 'EXACT_TIMESTAMP',
    label: 'exact timestamp',
    action: ACTION.CHANGE,
    why: 'An exact time can make a record easier to join with another system.',
    pattern: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})\b/g,
    replacement: '[exact time removed]'
  })
]);

function freeze(value) {
  if (Array.isArray(value)) {
    value.forEach(freeze);
    return Object.freeze(value);
  }
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }
  return value;
}

function normalizeExactTerms(values, kind) {
  if (!Array.isArray(values)) throw new TypeError(`${kind} must be an array`);
  const seen = new Set();
  return values.map((entry, index) => {
    const raw = typeof entry === 'string' ? { value: entry } : entry;
    if (!raw || typeof raw !== 'object') throw new TypeError(`${kind}[${index}] must be a string or object`);
    const value = String(raw.value ?? '').trim();
    if (!value) throw new TypeError(`${kind}[${index}] needs a non-empty value`);
    const label = String(raw.label ?? value).trim();
    const normalized = value.toLocaleLowerCase();
    if (seen.has(normalized)) throw new TypeError(`${kind} contains duplicate exact values`);
    seen.add(normalized);
    return freeze({ value, label });
  });
}

function findExactOccurrences(text, needle) {
  const haystack = text.toLocaleLowerCase();
  const target = needle.toLocaleLowerCase();
  const spans = [];
  let from = 0;
  while (from <= haystack.length - target.length) {
    const index = haystack.indexOf(target, from);
    if (index < 0) break;
    spans.push([index, index + needle.length]);
    from = index + Math.max(1, needle.length);
  }
  return spans;
}

function builtInFindings(text) {
  const findings = [];
  for (const rule of BUILTIN_RULES) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    while ((match = pattern.exec(text)) !== null) {
      findings.push({
        rule_id: rule.rule_id,
        label: rule.label,
        action: rule.action,
        why: rule.why,
        start: match.index,
        end: match.index + match[0].length,
        replacement: rule.replacement,
        evidence_class: 'DETERMINISTIC_PATTERN_MATCH'
      });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }
  return findings;
}

function declaredProtectedFindings(text, protectedTerms) {
  const findings = [];
  for (const term of protectedTerms) {
    for (const [start, end] of findExactOccurrences(text, term.value)) {
      findings.push({
        rule_id: 'USER_DECLARED_PROTECTED_TERM',
        label: term.label,
        action: ACTION.REMOVE,
        why: 'You told the Loom this exact thing must not leave.',
        start,
        end,
        replacement: '[protected thing removed]',
        evidence_class: 'USER_DECLARED_EXACT_RULE'
      });
    }
  }
  return findings;
}

function journeyRelations(text, journeyMarkers) {
  const relations = [];
  for (const marker of journeyMarkers) {
    const spans = findExactOccurrences(text, marker.value);
    if (!spans.length) continue;
    relations.push({
      relation_id: 'DECLARED_JOURNEY_MARKER_MATCH',
      label: marker.label,
      occurrence_count: spans.length,
      statement: 'That thread came from another journey.',
      child_legible_detail: `This part matches the journey marker you declared: ${marker.label}.`,
      claim_ceiling: 'The Loom is showing a declared connection. It is not claiming the connection proves truth.',
      evidence_class: 'USER_DECLARED_CUSTODY_CONTEXT'
    });
  }
  return relations;
}

function resolveSeverity(findings) {
  if (findings.some(item => item.action === ACTION.REMOVE)) return SEVERITY.RED;
  if (findings.some(item => item.action === ACTION.CHANGE)) return SEVERITY.YELLOW;
  return SEVERITY.GREEN;
}

function trafficLightCopy(severity) {
  if (severity === SEVERITY.RED) return 'Stop. This message contains something your protection rules say must not leave.';
  if (severity === SEVERITY.YELLOW) return 'This message carries something you may not mean to send.';
  if (severity === SEVERITY.GREEN) return 'Nothing matched the protection rules you turned on.';
  return 'Paste a message before asking the Loom to check it.';
}

function redactedReceipt(findings, relations) {
  return freeze({
    schema: `${HOLONOMY_LOOM_SCHEMA}/receipt`,
    finding_count: findings.length,
    findings: findings.map(item => ({
      rule_id: item.rule_id,
      action: item.action,
      evidence_class: item.evidence_class,
      span_start: item.start,
      span_end: item.end
    })),
    route_memory_relation_count: relations.length,
    route_memory_relations: relations.map(item => ({
      relation_id: item.relation_id,
      evidence_class: item.evidence_class,
      occurrence_count: item.occurrence_count
    })),
    raw_match_values_retained: false,
    downstream_platform_governed: false
  });
}

function overlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

function nonOverlappingFindings(findings) {
  const priority = { REMOVE: 3, CHANGE: 2, KEEP: 1 };
  const ordered = [...findings].sort((a, b) => {
    const actionDelta = priority[b.action] - priority[a.action];
    if (actionDelta) return actionDelta;
    const lengthDelta = (b.end - b.start) - (a.end - a.start);
    if (lengthDelta) return lengthDelta;
    return a.start - b.start;
  });
  const kept = [];
  for (const finding of ordered) {
    if (kept.some(existing => overlap(existing, finding))) continue;
    kept.push(finding);
  }
  return kept.sort((a, b) => a.start - b.start || a.end - b.end);
}

export function analyzeHolonomyLoomMessage({ text, protectedTerms = [], journeyMarkers = [] } = {}) {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  const normalizedProtected = normalizeExactTerms(protectedTerms, 'protectedTerms');
  const normalizedJourney = normalizeExactTerms(journeyMarkers, 'journeyMarkers');

  if (!text.trim()) {
    return freeze({
      schema: HOLONOMY_LOOM_SCHEMA,
      status: SEVERITY.HELD,
      summary: trafficLightCopy(SEVERITY.HELD),
      message_length: text.length,
      intended_content: [],
      findings: [],
      journey_relations: [],
      actions: [],
      receipt: redactedReceipt([], []),
      claim_ceiling: HOLONOMY_LOOM_CLAIM_CEILING,
      release_boundary: {
        raw_release_allowed: false,
        safer_copy_available: false,
        downstream_platform_governed: false
      }
    });
  }

  const findings = nonOverlappingFindings([
    ...builtInFindings(text),
    ...declaredProtectedFindings(text, normalizedProtected)
  ]);
  const relations = journeyRelations(text, normalizedJourney);
  const status = resolveSeverity(findings);
  const actions = findings.map(item => ({
    action: item.action,
    rule_id: item.rule_id,
    label: item.label,
    why: item.why,
    child_legible: item.action === ACTION.REMOVE
      ? `REMOVE — ${item.why}`
      : `CHANGE — ${item.why}`
  }));

  return freeze({
    schema: HOLONOMY_LOOM_SCHEMA,
    status,
    summary: trafficLightCopy(status),
    message_length: text.length,
    intended_content: [{
      label: 'your message',
      child_legible: 'This is the text you are choosing to check before you send it.'
    }],
    findings: findings.map(item => ({
      rule_id: item.rule_id,
      label: item.label,
      action: item.action,
      why: item.why,
      start: item.start,
      end: item.end,
      evidence_class: item.evidence_class
    })),
    journey_relations: relations,
    actions,
    receipt: redactedReceipt(findings, relations),
    claim_ceiling: HOLONOMY_LOOM_CLAIM_CEILING,
    release_boundary: {
      raw_release_allowed: findings.length === 0,
      safer_copy_available: findings.length > 0,
      downstream_platform_governed: false
    }
  });
}

export function makeHolonomyLoomSaferCopy({ text, protectedTerms = [], journeyMarkers = [] } = {}) {
  const analysis = analyzeHolonomyLoomMessage({ text, protectedTerms, journeyMarkers });
  if (analysis.status === SEVERITY.HELD) {
    return freeze({
      schema: `${HOLONOMY_LOOM_SCHEMA}/safer-copy`,
      status: SEVERITY.HELD,
      text: '',
      release_allowed: false,
      remaining_status: SEVERITY.HELD
    });
  }

  const normalizedProtected = normalizeExactTerms(protectedTerms, 'protectedTerms');
  const findings = nonOverlappingFindings([
    ...builtInFindings(text),
    ...declaredProtectedFindings(text, normalizedProtected)
  ]);
  let safer = text;
  for (const finding of [...findings].sort((a, b) => b.start - a.start)) {
    safer = `${safer.slice(0, finding.start)}${finding.replacement}${safer.slice(finding.end)}`;
  }

  // Every exact user-declared protected occurrence in the original text has already been
  // removed above. Rechecking the generated replacement strings against arbitrary user
  // phrases could create a false RED merely because a replacement contains a protected word.
  // The recheck therefore reapplies built-in deterministic policy and route-memory context,
  // while the original declared-term closure is guaranteed by exhaustive exact replacement.
  const recheck = analyzeHolonomyLoomMessage({ text: safer, protectedTerms: [], journeyMarkers });
  return freeze({
    schema: `${HOLONOMY_LOOM_SCHEMA}/safer-copy`,
    status: 'READY',
    text: safer,
    release_allowed: recheck.status !== SEVERITY.RED,
    remaining_status: recheck.status,
    child_legible: recheck.status === SEVERITY.RED
      ? 'The safer copy still contains something your hard protection rules block.'
      : 'The safer copy cleared the Loom rules that can block its own release path.',
    claim_ceiling: 'This clearance governs only the enabled Loom rules. It does not guarantee privacy after you send the text elsewhere.'
  });
}

export const HOLONOMY_LOOM_ACTIONS = ACTION;
export const HOLONOMY_LOOM_SEVERITY = SEVERITY;
