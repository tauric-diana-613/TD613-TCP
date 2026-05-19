export const HUSH_LITERAL_PLACEMENT_VERSION = 'phase-19';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values))];

function classifyLiteral(literal = '') {
  const value = safeText(literal);
  if (/^DOC/i.test(value)) return 'doc-id';
  if (/^CASE/i.test(value)) return 'case-id';
  if (/^EXHIBIT/i.test(value)) return 'exhibit-id';
  if (/^REF/i.test(value)) return 'ref-id';
  if (/^ID/i.test(value)) return 'record-id';
  if (/^SHI/i.test(value)) return 'shi-marker';
  if (/^SAC/i.test(value)) return 'sac-marker';
  if (/^TD613/i.test(value)) return 'covenant-marker';
  if (/\d/.test(value)) return 'date';
  return 'literal';
}

function placementFor(kind = '') {
  if (['doc-id', 'case-id', 'exhibit-id', 'ref-id', 'record-id'].includes(kind)) return 'before-noun';
  if (kind === 'date') return 'near-action';
  return 'exact-position';
}

function anchorsFor(kind = '') {
  if (['doc-id', 'case-id', 'exhibit-id', 'ref-id', 'record-id'].includes(kind)) return ['file', 'record', 'note', 'packet', 'attachment', 'label', 'message'];
  if (kind === 'date') return ['saved', 'changed', 'edited', 'attached', 'meeting', 'timestamp', 'note'];
  return ['message', 'note', 'record'];
}

function unitIdFor(literal = '', roleMap = {}, meaningPlan = {}) {
  const units = asArray(roleMap.units).length ? asArray(roleMap.units) : asArray(meaningPlan.units);
  const match = units.find((unit) => safeText(unit.text).includes(literal) || asArray(unit.protectedFragments).includes(literal));
  return match?.id || units[0]?.id || 'unit-1';
}

export function buildLiteralPlacementMap(input = {}) {
  const meaningPlan = input.meaningPlan || {};
  const roleMap = input.claimRoleMap || input.roleMap || {};
  const protectedLiterals = unique([...(input.protectedLiterals || []), ...(meaningPlan.protectedLiterals || [])]);
  return {
    version: HUSH_LITERAL_PLACEMENT_VERSION,
    placements: protectedLiterals.map((literal) => {
      const kind = classifyLiteral(literal);
      return { literal, kind, sourceUnitId: unitIdFor(literal, roleMap, meaningPlan), preferredPlacement: placementFor(kind), anchorWords: anchorsFor(kind), maxDistanceTokens: kind === 'date' ? 10 : 8, required: true };
    }),
    warnings: protectedLiterals.length ? [] : ['no-protected-literals-for-placement'],
    limitations: ['Literal placement is local output hygiene.']
  };
}

function removeDuplicate(text = '', literal = '') {
  const value = safeText(text);
  const first = value.indexOf(literal);
  if (first < 0) return value;
  return value.slice(0, first + literal.length) + value.slice(first + literal.length).split(literal).join('');
}

function insertNearAnchor(text = '', placement = {}) {
  const value = safeText(text).trim();
  if (!placement.literal || value.includes(placement.literal)) return value;
  const words = value.split(/\s+/).filter(Boolean);
  const anchorIndex = words.findIndex((word) => placement.anchorWords.some((anchor) => word.toLowerCase().replace(/[^a-z0-9-]/g, '').includes(anchor)));
  if (anchorIndex >= 0) {
    const beforeNoun = ['doc-id', 'case-id', 'exhibit-id', 'ref-id', 'record-id'].includes(placement.kind);
    const insertAt = beforeNoun ? anchorIndex : Math.min(words.length, anchorIndex + 1);
    return [...words.slice(0, insertAt), placement.literal, ...words.slice(insertAt)].join(' ');
  }
  if (placement.kind === 'date') return `${value.replace(/[.!?]$/, '')} on ${placement.literal}.`;
  return `${placement.literal} ${value}`;
}

export function placeProtectedLiterals(input = {}) {
  const placementMap = input.literalPlacementMap || buildLiteralPlacementMap(input);
  let text = safeText(input.text ?? input.outputText);
  const warnings = [];
  const operations = [];
  for (const placement of asArray(placementMap.placements)) {
    const beforeDedupe = text;
    text = removeDuplicate(text, placement.literal);
    if (text !== beforeDedupe) operations.push('dedupe-protected-literal');
    if (!text.includes(placement.literal)) {
      text = insertNearAnchor(text, placement);
      if (text.includes(placement.literal)) operations.push('in-unit-literal-placement');
      else warnings.push('literal-placement-review');
    }
  }
  return { version: HUSH_LITERAL_PLACEMENT_VERSION, text: text.replace(/\s+/g, ' ').trim(), operations: unique(operations), warnings: unique(warnings) };
}

export function repairLiteralPlacement(input = {}) {
  const original = safeText(input.text ?? input.outputText);
  const placed = placeProtectedLiterals(input);
  const tailStuffed = /(?:\s+(?:EXHIBIT|DOC|CASE|ID|REF)[A-Z0-9:_#\/-]+){1,}\s*(?:\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?)?\.?$/i.test(original);
  return { ...placed, changed: placed.text !== original, operations: unique([...placed.operations, ...(tailStuffed && placed.text !== original ? ['literal-tail-stuff-repaired'] : [])]), warnings: unique([...placed.warnings, ...(tailStuffed ? ['literal-tail-stuffed'] : [])]) };
}

export function summarizeLiteralPlacement(input = {}) {
  const result = input.placements ? input : input.literalPlacementMap || input;
  return { version: result.version || HUSH_LITERAL_PLACEMENT_VERSION, placementCount: asArray(result.placements).length, requiredCount: asArray(result.placements).filter((item) => item.required).length, warnings: asArray(result.warnings), operations: asArray(result.operations) };
}
