// English claim patterns for the exact fictional vendor fixture. Inspection
// normalization never replaces custody bytes or establishes semantic truth.
export const LOOM_CLAIM_INSPECTION_PROFILE = 'nfkd-mark-format-inspection/v1';

export function loomEvidenceClauseViews(prose) {
  let text = '';
  const offsets = [];
  for (let index = 0; index < prose.length;) {
    const source = String.fromCodePoint(prose.codePointAt(index));
    const inspected = source.normalize('NFKD').replace(/[\p{M}\p{Cf}]/gu, '');
    for (const unit of inspected) {
      text += unit;
      for (let n = 0; n < unit.length; n++) offsets.push(index);
    }
    index += source.length;
  }
  const views = [];
  const boundaries = /(?<=[.!?;])\s+|\n+/g;
  let start = 0;
  const append = end => {
    if (end <= start) return;
    const from = offsets[start] ?? prose.length;
    const to = offsets[end] ?? prose.length;
    let inspected='';const rawOffsets=[];
    for(let i=start;i<end;i++)if(!/[*_`]/.test(text[i])){
      inspected+=text[i].replace(/[’‘]/g,"'");rawOffsets.push(offsets[i]-from);
    }
    views.push({ text: inspected, raw_offsets:rawOffsets,
      raw: prose.slice(from, to), inspection_profile: LOOM_CLAIM_INSPECTION_PROFILE });
  };
  for (const boundary of text.matchAll(boundaries)) {
    append(boundary.index);
    start = boundary.index + boundary[0].length;
  }
  append(text.length);
  return views;
}

// An adversative or a new subject after a comma ends the earlier caveat's
// scope. "No evidence ..., but records will remain" still asserts persistence.
const localPrefix = prefix => prefix.split(/\b(?:but|yet|however|nevertheless|nonetheless)\b|(?:,\s+|\band\s+)(?=(?:records?|data|content|backups?|(?:the\s+)?residue)\b)/i).at(-1);

export function nonAssertion(text, match) {
  const prefix = localPrefix(text.slice(0, match.index)).slice(-240);
  const claim = match[0];
  if (/\b(?:not|never)\b/i.test(claim) || /\b(?:not|never|doesn't|don't|cannot|can't)\s*$/i.test(prefix)) return true;
  if (/\b(?:no|zero|without|lack(?:s|ing)?\s+of)\s+(?:independent\s+|observed\s+|verified\s+)?evidence\b[^,;]{0,160}(?:\bthat\b|\bwhether\b)/i.test(prefix)) return true;
  if (/\b(?:unknown|uncertain|unresolved|unobserved|undocumented)\b[^,;]{0,100}\b(?:whether|if|that)\b/i.test(prefix)) return true;
  if (/\b(?:does not|do not|did not|cannot|can't|doesn't|don't|no\s+\w+|never)\s+(?:establish|prove|show|demonstrate|guarantee|confirm|assume|infer|assert|claim|say|conclude)\b[^,;]{0,130}/i.test(prefix)) return true;
  if (/\b(?:no|without)\s+guarantee\b[^,;]{0,130}/i.test(prefix)) return true;
  if (/\b(?:if|whether|may|might|could|possibly|potentially)\b[^,;]{0,100}/i.test(prefix) || /\b(?:may|might|could|would)\b/i.test(claim)) return true;
  // Attribution earns an exemption only when this passage explicitly rejects
  // the attributed claim. A merely quoted or endorsed claim remains reviewed.
  if (/\b(?:falsely|incorrectly|wrongly|erroneously)\s+(?:claims?|states?|says?|asserts?)\b[^;]{0,150}/i.test(prefix) ||
      /\b(?:false|unsupported|misleading|prohibited|rejected)\s+(?:claim|assertion|statement)\s*[:=]?\s*["']?[^;]{0,120}/i.test(prefix)) return true;
  const suffix = text.slice(match.index + claim.length);
  if (/^[^;]{0,160}["']\s*(?:is|was)\s+(?:false|unsupported|unverified|misleading|rejected)\b/i.test(suffix)) return true;
  return false;
}

export function reviewVendorRetentionClause(view) {
  const text = view.text;
  const configurationAbsence=text.match(/\b(?:no\s+(?:(?:minimum|maximum|backup|retention)\s+)*duration\s+is\s+configured|(?:backup\s+)?retention(?:\s+(?:period|duration))?\s+is\s+not\s+configured)\b/i);
  if(configurationAbsence && !/\b(?:if|whether|unknown|unobserved|uncertain)\b/i.test(localPrefix(text.slice(0,configurationAbsence.index))) &&
      !/^\s+in\s+(?:the\s+)?(?:selected\s+)?(?:documents?|sources?)\b/i.test(text.slice(configurationAbsence.index+configurationAbsence[0].length)))
    return conflict(view,configurationAbsence,'RETENTION_CONFIGURATION_ASSERTED_WITHOUT_WITNESS',
      'The source leaves retention configuration unobserved. Missing configuration evidence does not establish that no duration is configured.');
  if (!/\b(?:backups?|retention|45\s+days?|forty[- ]five\s+days?)\b/i.test(text)) return null;
  const claims = /\b(?:(?:will|would|shall)\s+(?:(?:not|never)\s+)?(?:persist|remain|linger|be\s+(?:retained|stored|kept))|(?:persists?|remains?|lingers?)|(?:is|are|was|were)\s+(?:(?:not|never)\s+)?(?:retained|stored|kept)|retention(?:\s+(?:period|duration|window))?\s+(?:is|was|equals?|lasts?)\s+\d+)\b/gi;
  for (const match of text.matchAll(claims)) {
    if (nonAssertion(text, match)) continue;
    // A "remains unresolved" predicate describes missing evidence, not data
    // persistence. Permission/maxima language alone likewise earns no duration.
    const tail = text.slice(match.index + match[0].length);
    if(/\bremains?$/i.test(match[0]) && !/^\s+(?:(?:in|inside|within|for|until|through|available|stored|retained|accessible|present|recoverable|undeleted)\b|\d)/i.test(tail))continue;
    if (/^\s+(?:unobserved|unknown|uncertain|unresolved|undocumented|unverified|unspecified|unsettled|a\s+(?:contractual\s+)?ceiling)\b/i.test(tail)) continue;
    return conflict(view,match,'RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION',
      'The source permits backup retention for up to 45 days; it supplies no observed or configured persistence duration. Inspect the asserted claim in every voice.');
  }
  return null;
}

export function conflict(view,match,code,explanation){
  const rawStart=Math.max(0,(view.raw_offsets?.[match.index] ?? 0)-160);
  return {code,excerpt:view.raw.slice(rawStart,rawStart+600),
    inspection_excerpt:view.text.slice(Math.max(0,match.index-160),match.index+400),
    inspection_profile:LOOM_CLAIM_INSPECTION_PROFILE,explanation};
}
