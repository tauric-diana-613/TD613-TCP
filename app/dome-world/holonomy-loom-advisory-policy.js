export const HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA = 'td613.holonomy-loom.provider-advisory-request/v0.1';
export const HOLONOMY_LOOM_ADVISORY_ACTION = 'EXPLAIN_FINDING';
export const HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING = 'Kʰonapolit may explain the finding class and suggest bounded mitigation. Deterministic Loom policy alone controls Loom release.';

export const HOLONOMY_LOOM_ADVISORY_ROUTE_MODES = Object.freeze([
  'TD613_HOSTED',
  'CHATGPT_THREAD_COMPANION',
  'LOCAL_POCKET'
]);

export const HOLONOMY_LOOM_ADVISORY_RULES = Object.freeze({
  PRIVATE_KEY_BLOCK: Object.freeze({
    rule_id: 'PRIVATE_KEY_BLOCK',
    label: 'private key material',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'REMOVE',
    finding_category: 'private key material',
    why_class: 'private_key_access_risk'
  }),
  BEARER_TOKEN_BLOCK: Object.freeze({
    rule_id: 'BEARER_TOKEN_BLOCK',
    label: 'bearer token',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'REMOVE',
    finding_category: 'bearer token',
    why_class: 'bearer_token_access_risk'
  }),
  COMMON_API_KEY_BLOCK: Object.freeze({
    rule_id: 'COMMON_API_KEY_BLOCK',
    label: 'credential-like token',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'REMOVE',
    finding_category: 'credential-like token',
    why_class: 'credential_access_risk'
  }),
  EMAIL_IDENTIFIER: Object.freeze({
    rule_id: 'EMAIL_IDENTIFIER',
    label: 'email address',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'CHANGE',
    finding_category: 'email address',
    why_class: 'direct_identifier_email'
  }),
  PHONE_IDENTIFIER: Object.freeze({
    rule_id: 'PHONE_IDENTIFIER',
    label: 'phone number',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'CHANGE',
    finding_category: 'phone number',
    why_class: 'direct_identifier_phone'
  }),
  EXACT_TIMESTAMP: Object.freeze({
    rule_id: 'EXACT_TIMESTAMP',
    label: 'exact timestamp',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'CHANGE',
    finding_category: 'exact timestamp',
    why_class: 'record_linkability_exact_time'
  }),
  USER_DECLARED_PROTECTED_TERM: Object.freeze({
    rule_id: 'USER_DECLARED_PROTECTED_TERM',
    label: 'user-declared protected term',
    evidence_class: 'USER_DECLARED_EXACT_RULE',
    action_class: 'REMOVE',
    finding_category: 'user-declared protected term',
    why_class: 'user_declared_nonrelease_rule'
  })
});

export function canonicalLoomAdvisoryFinding(ruleId, routeMode) {
  const rule = HOLONOMY_LOOM_ADVISORY_RULES[String(ruleId || '').trim()];
  if (!rule) throw new TypeError('unsupported rule_id');
  const route = String(routeMode || '').trim().toUpperCase();
  if (!HOLONOMY_LOOM_ADVISORY_ROUTE_MODES.includes(route)) throw new TypeError('unsupported route_mode');
  return Object.freeze({
    schema: HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
    action: HOLONOMY_LOOM_ADVISORY_ACTION,
    rule_id: rule.rule_id,
    evidence_class: rule.evidence_class,
    action_class: rule.action_class,
    minimized_context: Object.freeze({
      finding_category: rule.finding_category,
      why_class: rule.why_class,
      route_mode: route
    }),
    claim_ceiling: HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING
  });
}

export function describeLoomAdvisoryRule(ruleId) {
  return HOLONOMY_LOOM_ADVISORY_RULES[String(ruleId || '').trim()] || null;
}
