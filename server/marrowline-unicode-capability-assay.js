// TD613: frozen research-only two-probe Unicode capacity assay.
// These prompts and specimens are synthetic. The live handler must gate them
// using the exact synthetic original-SSE witness and pinned model before use.
export const UNICODE_ASSAY_MODEL = 'gemini-3.8-flash';
export const UNICODE_ASSAY_VARIANTS = Object.freeze([
  'literal-multistack-v1',
  'creative-multistack-v1'
]);
export const UNICODE_ASSAY_SYSTEM = [
  'Synthetic Unicode text-generation conformance assay.',
  'Follow the user request directly and return plain UTF-8 text.',
  'Do not include extra titles, commentary, Markdown formatting, JSON, safety prefaces, explanations or code fences.',
  'Unicode combining characters are part of the writing system; preserve or author them as requested.',
  'No TD613 narrative, no fictional personas, no user-specific history, and no fictional municipality.',
].join('\n');

export const LITERAL_SPECIMEN =
  'A\u0307\u0323\u0304 E\u0301\u0329\u0313 O\u0302\u0327\u0308 U\u0303\u0331\u030a ' +
  'a\u0308\u0324\u0306 e\u0304\u032e\u030c o\u030b\u032d\u0309 u\u0301\u0330\u0307';

export const UNICODE_ASSAY_TASKS = Object.freeze({
  'literal-multistack-v1': [
    'Copy the next specimen EXACTLY, character for character, on one line.',
    'Do not normalize, replace, explain, or recompose its combining marks.',
    'The specimen is:',
    LITERAL_SPECIMEN
  ].join('\n'),
  'creative-multistack-v1': [
    'Write an original, short, vividly expressive English passage about a thunderstorm disrupting a bureaucratic celebration.',
    'Render the entire passage as readable native Unicode Zalgo text composed by you.',
    'Choose and use combinations of diacritics ABOVE and BELOW letters, often multiple marks on one base character.',
    'Allow vivid asymmetry and spontaneous phrasing; there is no fixed stencil, numeric mark quota, or mandated style switch.',
    'Use the full native combining-mark vocabulary whenever it serves the writing, rather than limiting yourself to diagonal slashes.',
    'Do not copy any specimen. Do not use Markdown or headings. Let the passage be yours.'
  ].join('\n')
});

export function buildSyntheticUnicodeAssayRequest(sourceRequest = {}, variant = '') {
  if (!UNICODE_ASSAY_VARIANTS.includes(variant)) throw new Error('SYNTHETIC_UNICODE_VARIANT_NOT_ALLOWED');
  if (typeof sourceRequest?.systemInstruction?.parts?.[0]?.text !== 'string'
      || !sourceRequest.systemInstruction.parts[0].text.includes('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:')
      || !Array.isArray(sourceRequest.contents) || sourceRequest.contents.length !== 1)
    throw new Error('SYNTHETIC_UNICODE_SOURCE_SHAPE_MISMATCH');
  return {
    ...sourceRequest,
    systemInstruction: { ...sourceRequest.systemInstruction, parts: [{ text: UNICODE_ASSAY_SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: UNICODE_ASSAY_TASKS[variant] }] }]
  };
}
