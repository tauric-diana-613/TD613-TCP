/** Local document custody and the selected-document route into Loom's AI task lane.
 * This module performs no network, storage, clipboard, or provider operation.
 */
export const LOOM_AI_LIMITS = Object.freeze({
  documentBytes: 65536, documentCharacters: 48000, documents: 8, requestBytes: 196608, requestCharacters: 60000,
  taskCharacters: 12000, rules: 32, ruleCharacters: 1000,
  protectedTerms: 128, protectedTermCharacters: 1000, responseBytes: 131072
});
const bytes = value => new TextEncoder().encode(value).byteLength;
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
function fail(code, message, locations = []) {
  const error = new Error(message);
  error.code = code;
  error.locations = locations;
  throw error;
}
function text(value, label, limit, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > limit || value.includes('\0')) {
    fail('INVALID_INPUT', `${label} must contain ${allowEmpty ? 'at most' : '1 to'} ${limit} text characters.`);
  }
  return value;
}
function dense(array, label, limit) {
  if (!Array.isArray(array) || array.length > limit || Array.from({ length: array.length }, (_, i) => !own(array, i)).some(Boolean)) {
    fail('INVALID_INPUT', `${label} must be a complete list of at most ${limit} entries.`);
  }
  return array;
}
function termsFrom(input = []) {
  return [...new Set(dense(input, 'Local private terms', LOOM_AI_LIMITS.protectedTerms)
    .map(term => text(term, 'Local private term', LOOM_AI_LIMITS.protectedTermCharacters)))];
}
function rulesFrom(input = []) {
  const rules = typeof input === 'string' ? input.split(/\r?\n/).map(rule => rule.trim()).filter(Boolean) : input;
  return dense(rules, 'Rules', LOOM_AI_LIMITS.rules).map(rule => text(rule, 'Rule', LOOM_AI_LIMITS.ruleCharacters));
}
function blockedLocations(fields, protectedTerms) {
  return fields.filter(([, value]) => protectedTerms.some(term => value.includes(term))).map(([location]) => location);
}

/** Match the established Ash text import lane; unsupported binary formats stay local. */
export async function readLoomDocument(file) {
  if (!record(file) || typeof file.arrayBuffer !== 'function') fail('INVALID_FILE', 'Choose a local text document.');
  const name = text(file.name, 'Document name', 240);
  const extension = /\.(txt|md|csv|json)$/i.exec(name)?.[1]?.toLowerCase();
  const mime = typeof file.type === 'string' ? file.type.toLowerCase().split(';')[0].trim() : '';
  const allowedMimes = ['', 'text/plain', 'text/markdown', 'text/csv', 'application/json'];
  if (!extension || !allowedMimes.includes(mime)) {
    fail('UNSUPPORTED_FILE', 'Open a .txt, .md, .csv, or .json document. For PDF or Word, first save a selected text excerpt.');
  }
  if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > LOOM_AI_LIMITS.documentBytes) {
    fail('FILE_SIZE', 'Choose a nonempty text document of at most 64 KiB.');
  }
  const buffer = await file.arrayBuffer();
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength !== file.size || buffer.byteLength > LOOM_AI_LIMITS.documentBytes) {
    fail('FILE_SIZE', 'The selected document changed or exceeds the local import size limit.');
  }
  let body;
  try { body = new TextDecoder('utf-8', { fatal: true }).decode(buffer); }
  catch { fail('UNSUPPORTED_ENCODING', 'Save the selected document as UTF-8 text before opening it.'); }
  if (!body.trim() || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body)) fail('INVALID_FILE', 'Choose readable UTF-8 text rather than a binary file.');
  if (body.length > LOOM_AI_LIMITS.documentCharacters) fail('DOCUMENT_SIZE', 'Choose a document of at most 48,000 characters.');
  if (extension === 'json') {
    try { JSON.parse(body); } catch { fail('INVALID_JSON', 'The selected JSON document could not be parsed.'); }
  }
  const id = `doc-${globalThis.crypto.randomUUID()}`;
  return { id, name, text: body, share: false };
}

/** Preserve full local originals; only construct a new envelope from explicitly selected supports. */
export function buildLoomAiRequest(input, requestId) {
  if (!record(input)) fail('INVALID_INPUT', 'Prepare a task and its selected documents.');
  const task = text(input.task, 'Task', LOOM_AI_LIMITS.taskCharacters);
  const request_id = text(requestId, 'Request ID', 100);
  if (!/^[A-Za-z0-9_-]+$/.test(request_id)) fail('INVALID_INPUT', 'Use an opaque alphanumeric request identity.');
  const rules = rulesFrom(input.rules);
  const protectedTerms = termsFrom(input.protectedTerms);
  const source = dense(input.documents ?? [], 'Documents', LOOM_AI_LIMITS.documents);
  const documents = [], shared_document_ids = [], withheld_document_ids = [], seen = new Set();
  let shared_document_bytes = 0, withheld_document_bytes = 0;
  for (const document of source) {
    if (!record(document)) fail('INVALID_DOCUMENT', 'Every document needs its own local identity and text.');
    const id = text(document.id, 'Document ID', 80);
    if (!/^[A-Za-z0-9_-]+$/.test(id)) fail('INVALID_DOCUMENT', 'Use opaque alphanumeric document identities.');
    if (seen.has(id)) fail('DUPLICATE_DOCUMENT_ID', 'Each local document must have a distinct identity.');
    seen.add(id);
    const name = text(document.name, 'Document name', 240);
    const body = text(document.text, 'Document text', LOOM_AI_LIMITS.documentCharacters);
    const size = bytes(body);
    if (size > LOOM_AI_LIMITS.documentBytes) fail('DOCUMENT_SIZE', 'A document exceeds 64 KiB; select a smaller excerpt.');
    if (document.share === true) {
      documents.push({ id, name, text: body }); shared_document_ids.push(id); shared_document_bytes += size;
    } else { withheld_document_ids.push(id); withheld_document_bytes += size; }
  }
  const request = { schema: 'td613.loom.ai-task/v0.1', request_id, task, documents, rules };
  const fields = [['schema', request.schema], ['request_id', request_id], ['task', task], ...rules.map((rule, i) => [`rules[${i}]`, rule]),
    ...documents.flatMap((document, i) => Object.entries(document).map(([key, value]) => [`documents[${i}].${key}`, value]))];
  const locations = blockedLocations(fields, protectedTerms);
  if (locations.length) fail('PROTECTED_EGRESS', 'A local private phrase appears in the selected AI input. Edit that input or keep its document local before sending.', locations);
  const selectedCharacters = task.length + rules.reduce((sum, rule) => sum + rule.length, 0) + documents.reduce((sum, doc) => sum + doc.name.length + doc.text.length, 0);
  if (selectedCharacters > LOOM_AI_LIMITS.requestCharacters) fail('REQUEST_SIZE', 'The selected AI task exceeds 60,000 characters; send fewer documents or smaller excerpts.');
  const request_bytes = bytes(JSON.stringify(request));
  if (request_bytes > LOOM_AI_LIMITS.requestBytes) fail('REQUEST_SIZE', 'The selected AI task exceeds 192 KiB; send fewer documents or smaller excerpts.');
  return {
    request,
    localReceipt: {
      schema: 'td613.loom.ai-egress/v0.1', stage: 'LOCAL_PREPARATION', request_id,
      shared_document_ids, withheld_document_ids, shared_document_bytes, withheld_document_bytes, request_bytes,
      protected_term_count: protectedTerms.length, protected_terms_sent: false,
      screening: 'EXACT_LITERAL_MATCH_CASE_SENSITIVE', provider_called: false,
      purpose: 'SELECTED_DOCUMENT_TASK',
      support_scope: 'Selected document identities record input selection, not model use or semantic equivalence.'
    }
  };
}

/** Inspect structured model output before presentation. Model source attribution remains a claim. */
export function inspectLoomAiResponse(response, localContext = {}) {
  const reasons = [];
  if (!record(localContext)) { reasons.push({ code: 'INVALID_LOCAL_POLICY', locations: [] }); localContext = {}; }
  const hold = (code, locations = []) => reasons.push({ code, locations });
  let serialized;
  try { serialized = JSON.stringify(response); } catch { hold('MALFORMED_RESPONSE'); }
  if (typeof serialized !== 'string' || bytes(serialized) > LOOM_AI_LIMITS.responseBytes) hold('RESPONSE_SIZE');
  if (!record(response) || response.schema !== 'td613.loom.ai-task-result/v0.1' ||
      typeof response.request_id !== 'string' || response.status !== 'completed' || typeof response.answer !== 'string' || !response.answer.trim() || response.answer.length > 24000 ||
      !Array.isArray(response.missing_information) || response.missing_information.length > 32 || response.missing_information.some(item => typeof item !== 'string' || item.length > 1000) ||
      (Array.isArray(response.missing_information) && Array.from({ length: response.missing_information.length }, (_, i) => !own(response.missing_information, i)).some(Boolean)) ||
      typeof response.suggested_next_step !== 'string' || response.suggested_next_step.length > 2000 ||
      !Array.isArray(response.used_document_ids) || response.used_document_ids.some(id => typeof id !== 'string' || !id.trim()) ||
      (Array.isArray(response.used_document_ids) && Array.from({ length: response.used_document_ids.length }, (_, i) => !own(response.used_document_ids, i)).some(Boolean))) {
    hold('MALFORMED_RESPONSE');
  }
  if (response?.request_id !== (localContext.request_id ?? localContext.requestId ?? localContext.request?.request_id)) hold('REQUEST_MISMATCH');
  let terms;
  try { terms = termsFrom(localContext.protectedTerms); } catch { hold('INVALID_LOCAL_POLICY'); terms = []; }
  const fields = [];
  const visit = (value, path, depth) => {
    if (depth > 8 || fields.length > 2048) { hold('MALFORMED_RESPONSE'); return; }
    if (typeof value === 'string') fields.push([path, value]);
    else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) { fields.push([`${path}.[key]`, key]); visit(child, `${path}.${key}`, depth + 1); }
  };
  if (typeof serialized === 'string' && bytes(serialized) <= LOOM_AI_LIMITS.responseBytes) visit(response, 'response', 0);
  const locations = blockedLocations(fields, terms);
  if (locations.length) hold('PROTECTED_RESPONSE', locations);
  if (Array.isArray(response?.used_document_ids) && new Set(response.used_document_ids).size !== response.used_document_ids.length) hold('DUPLICATE_SOURCE_CLAIM');
  let knownIds = localContext.shared_document_ids ?? localContext.localReceipt?.shared_document_ids ?? localContext.request?.documents?.map(document => document.id) ?? [];
  if (!Array.isArray(knownIds) || knownIds.some(id => typeof id !== 'string')) { hold('INVALID_LOCAL_POLICY'); knownIds = []; }
  const known = new Set(knownIds);
  if (Array.isArray(response?.used_document_ids) && response.used_document_ids.some(id => !known.has(id))) hold('UNSELECTED_SOURCE_CLAIM');
  return {
    status: reasons.length ? 'HELD' : 'ALLOWED', held: reasons.length > 0, allowed: reasons.length === 0,
    action: reasons.length ? 'WITHHOLD_MODEL_OUTPUT' : 'PRESENT_FOR_REVIEW', reasons,
    used_document_ids_verified: false, source_claim_status: 'MODEL_REPORTED_UNVERIFIED',
    screening: 'EXACT_LITERAL_MATCH_CASE_SENSITIVE', release_authority: false
  };
}
