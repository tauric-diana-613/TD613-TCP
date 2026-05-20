export const HUSH_CLAIM_ROLES_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function hashText(text = '') {
  let hash = 2166136261;
  for (const ch of safeText(text)) {
    hash ^= ch.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `hcr-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function unique(values = []) {
  return [...new Set(asArray(values))];
}

function detectProtected(text = '', protectedLiterals = []) {
  const value = safeText(text);
  const detected = value.match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{4}-\d{2}-\d{2}\b/g) || [];
  return unique([...protectedLiterals.filter((literal) => value.includes(literal)), ...detected]);
}

export function classifyClaimUnit(unit = {}, context = {}) {
  const text = safeText(unit.text);
  const protectedFragments = unique([...(unit.protectedFragments || []), ...detectProtected(text, context.protectedLiterals || [])]);
  const subroles = [];
  const invariants = [];
  let role = unit.kind || 'claim';

  const hasEvidence = /\b(?:exhibit|doc|case|id|ref|td613|shi|sac)\b|\b(?:file|record|note|packet|attachment|label)\b/i.test(text);
  const hasDate = /\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{4}-\d{2}-\d{2}\b/.test(text);
  const hasCaveat = /\b(may|might|appears|seems|possibly|cannot confirm|from what i can tell|i do not know|not naming)\b/i.test(text);
  const hasNegation = (/\b(no|not|never|none|without|can't|do not|don't|did not|didn't)\b/i.test(text) || (/\bcannot\b/i.test(text) && !/\bcannot confirm\b/i.test(text)) || Boolean(unit.hasNegation));
  const hasRequest = /\b(please keep|i need|make sure|should remain|do not separate|preserve|keep)\b/i.test(text);
  const hasReason = /\b(because|so that|since|as|therefore)\b/i.test(text);

  if (hasEvidence) { role = 'evidence-anchor'; subroles.push('evidence-anchor'); invariants.push('keep-literal-near-evidence-noun'); }
  if (hasDate) { if (!hasEvidence) role = 'date-anchor'; subroles.push('date-anchor'); invariants.push('preserve-date', 'keep-date-near-event'); }
  if (hasNegation) { role = 'negation'; subroles.push('negation'); invariants.push('preserve-negation', 'keep-negation-near-action'); }
  if (hasCaveat) { role = 'caveat'; subroles.push('uncertainty', 'caveat'); invariants.push('preserve-uncertainty'); }
  if (hasRequest) { if (!hasNegation && !hasEvidence && !hasCaveat) role = 'request'; subroles.push('request'); invariants.push('preserve-request-intent'); }
  if (hasReason) { subroles.push('reason'); invariants.push('preserve-reason-link'); }
  if (protectedFragments.length) invariants.push('preserve-protected-literals');

  const locked = hasNegation || hasCaveat || protectedFragments.length || hasDate;
  const moveFreedom = locked ? 'locked' : hasReason || hasRequest ? 'local' : 'flexible';
  const rewriteFreedom = unit.rewriteFreedom || (locked ? 'low' : 'medium');

  return {
    id: unit.id || `unit-${context.index + 1}`,
    text,
    role,
    subroles: unique(subroles),
    protectedFragments,
    linkedUnits: [],
    moveFreedom,
    rewriteFreedom,
    invariants: unique(invariants)
  };
}

function buildRelationships(units = []) {
  const relationships = [];
  const evidenceUnits = units.filter((unit) => unit.subroles.includes('evidence-anchor'));
  const dateUnits = units.filter((unit) => unit.subroles.includes('date-anchor'));
  const negationUnits = units.filter((unit) => unit.subroles.includes('negation'));
  const caveatUnits = units.filter((unit) => unit.subroles.includes('caveat') || unit.subroles.includes('uncertainty'));
  for (const date of dateUnits) {
    const target = evidenceUnits.find((unit) => unit.id !== date.id) || units.find((unit) => unit.id !== date.id);
    if (target) relationships.push({ fromUnitId: date.id, toUnitId: target.id, relation: 'dates' });
  }
  for (const evidence of evidenceUnits) {
    const target = units.find((unit) => unit.id !== evidence.id && unit.role !== 'date-anchor');
    if (target) relationships.push({ fromUnitId: evidence.id, toUnitId: target.id, relation: 'identifies' });
  }
  for (const negation of negationUnits) relationships.push({ fromUnitId: negation.id, toUnitId: negation.id, relation: 'negates' });
  for (const caveat of caveatUnits) relationships.push({ fromUnitId: caveat.id, toUnitId: caveat.id, relation: 'qualifies' });
  return relationships;
}

export function buildClaimRoleMap(input = {}) {
  const sourceText = safeText(input.sourceText);
  const meaningPlan = input.meaningPlan || {};
  const protectedLiterals = unique([...(input.protectedLiterals || []), ...(meaningPlan.protectedLiterals || [])]);
  const sourceUnits = asArray(meaningPlan.units).length
    ? asArray(meaningPlan.units)
    : sourceText.split(/(?<=[.!?])\s+/).filter(Boolean).map((text, index) => ({ id: `unit-${index + 1}`, text }));
  const units = sourceUnits.map((unit, index) => classifyClaimUnit(unit, { index, protectedLiterals }));
  const relationships = buildRelationships(units);
  return {
    version: HUSH_CLAIM_ROLES_VERSION,
    sourceHash: hashText(sourceText || units.map((unit) => unit.text).join(' ')),
    units,
    relationships,
    warnings: units.some((unit) => unit.role === 'negation') ? ['negation-role-present'] : [],
    limitations: ['Claim roles are local rewrite constraints, not legal conclusions.']
  };
}

export function summarizeClaimRoleMap(roleMap = {}) {
  const units = asArray(roleMap.units);
  return {
    version: roleMap.version || HUSH_CLAIM_ROLES_VERSION,
    unitCount: units.length,
    lockedCount: units.filter((unit) => unit.moveFreedom === 'locked').length,
    roles: unique(units.map((unit) => unit.role)),
    relationshipCount: asArray(roleMap.relationships).length,
    warnings: asArray(roleMap.warnings)
  };
}
