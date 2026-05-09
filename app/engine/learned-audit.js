// Learned audit via the Anthropic API. The deterministic audit
// (propositionCoverage + conjunctionStackCount + repeatedWordBoundaryCount)
// catches token-level artifacts but is blind to hallucinated sentences,
// dropped conditionals, contrast-flipped connectors, and other meaning-
// preservation failures that the toy→tool calibration harness surfaced
// (see tests/audit-calibration/labels.mjs and PR #14). This module asks
// Claude Opus 4.7 to judge.
//
// **Opt-in via ANTHROPIC_API_KEY.** The deployed github.io page never
// triggers this path — there is no API key in client JavaScript. The
// learned audit is a test-time / operator-time tool. Operators with a
// key exported in their shell get the higher-fidelity audit when they
// run `npm run test:calibration`.
//
// **Observational only.** The seal pipeline does not consume these
// scores. SHI derivation is unchanged. Sealed artifacts remain
// reproducibly derived from stylometric inputs.
//
// **Static-site safe.** This module imports from `@anthropic-ai/sdk`
// dynamically and relies on `process.env`. It is not bundled into
// `app/browser-engine.js` and would throw immediately if loaded in a
// browser. Keep the dynamic import pattern intact.

const SYSTEM_PROMPT = `You are evaluating outputs from a stylometry-driven cadence-transformation engine. The engine takes a source text written in one register (e.g., a formal incident record) and rewrites it in a different register's cadence (e.g., a rushed-mobile text message). The transformation is INTENDED to change cadence, sentence shape, abbreviations, punctuation, register markers, and lexical choice. It is NOT intended to change meaning.

For each (SOURCE, OUTPUT) pair, judge whether the OUTPUT preserves the MEANING of the SOURCE.

The output PRESERVES meaning if all of the following hold:
- Every clause of propositional content from the source appears (or is validly paraphrased) in the output.
- No hallucinated content — sentences or phrases that introduce information not present in the source.
- All critical numbers, dates, names, identifiers, and quantities are preserved (not dropped, not altered).
- Grammatical and conjunctional structure is sound — no broken connectors ("and but please"), no comma-spliced run-ons that flip meaning, no dangling em-dashes that strand a clause.
- Contrastive and conditional structure is preserved — "but" should not silently become "and" if it carries contrast; "if X..." should not silently lose the "if" and become a non-conditional statement.

The output BREAKS meaning if any of the above fail.

Cadence and register changes are NOT errors. Lowercase opening, abbreviations, dropped articles, register-appropriate slang, sentence reordering for cadence, contractions and expansions, "tho" for "though", "b" for "be", "2" for "two" — all expected.

Return your judgment in the structured JSON schema requested.`;

const JUDGMENT_SCHEMA = {
  type: 'object',
  properties: {
    meaning_preserved: {
      type: 'number',
      description: '0 = meaning destroyed, 1 = meaning fully preserved'
    },
    label: {
      type: 'string',
      enum: ['preserves', 'breaks']
    },
    issues: {
      type: 'array',
      items: { type: 'string' },
      description: 'Specific issues found, if any. Empty array if preserves.'
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of the judgment, 1-3 sentences.'
    }
  },
  required: ['meaning_preserved', 'label', 'issues', 'reasoning'],
  additionalProperties: false
};

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  if (typeof process === 'undefined' || !process?.env?.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. The learned audit is opt-in; export the env var to enable it.'
    );
  }
  let Anthropic;
  try {
    ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
  } catch (err) {
    throw new Error(
      'The @anthropic-ai/sdk package is not installed. Run `npm install` to add it (it is a devDependency), then retry. Underlying error: ' +
        (err && err.message ? err.message : String(err))
    );
  }
  cachedClient = new Anthropic();
  return cachedClient;
}

export async function assessMeaningPreservation({ sourceText, outputText, options = {} } = {}) {
  if (!sourceText || !outputText) {
    throw new Error('assessMeaningPreservation requires both sourceText and outputText');
  }
  const client = await getClient();
  const model = options.model || 'claude-opus-4-7';
  const effort = options.effort || 'medium';

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    // Prompt cache: SYSTEM_PROMPT is identical across all calls in a run,
    // so the cache fires on every call after the first. The user message
    // (source/output pair) is what varies. See shared/prompt-caching.md
    // — caching is a prefix match; keep stable content first, volatile
    // content after the breakpoint.
    system: [{
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' }
    }],
    messages: [{
      role: 'user',
      content: 'SOURCE:\n' + String(sourceText) + '\n\n---\n\nOUTPUT:\n' + String(outputText)
    }],
    output_config: {
      format: { type: 'json_schema', schema: JUDGMENT_SCHEMA },
      effort
    },
    thinking: { type: 'adaptive' }
  });

  const textBlock = (response.content || []).find((b) => b && b.type === 'text');
  if (!textBlock) {
    throw new Error('Learned audit: no text content in response');
  }
  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (err) {
    throw new Error(
      'Learned audit: response did not parse as JSON. First 200 chars: ' +
        String(textBlock.text || '').slice(0, 200)
    );
  }

  return {
    meaning_preserved: Number(parsed.meaning_preserved),
    label: String(parsed.label),
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
    reasoning: String(parsed.reasoning || ''),
    model: response.model,
    cache_read_tokens: Number(response.usage?.cache_read_input_tokens || 0),
    cache_creation_tokens: Number(response.usage?.cache_creation_input_tokens || 0),
    input_tokens: Number(response.usage?.input_tokens || 0),
    output_tokens: Number(response.usage?.output_tokens || 0)
  };
}
