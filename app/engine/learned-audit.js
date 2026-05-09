const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/api/generate';
const OLLAMA_MODEL = 'AU';

const SYSTEM_PROMPT = "You are AU, an expert code and algorithm auditor. Provide concise, impartial judgments. You are analyzing text transformations. You must output exactly one word: 'preserves' (if the meaning and intent are kept) or 'breaks' (if the meaning is lost or distorted).";

function buildComparisonPrompt(sourceText, outputText) {
  return [
    'INPUT:',
    String(sourceText),
    '',
    'TRANSLATED:',
    String(outputText),
    '',
    "Judge whether TRANSLATED preserves INPUT. Output exactly one word: 'preserves' or 'breaks'."
  ].join('\n');
}

function normalizeJudgment(raw) {
  const text = String(raw || '').trim().toLowerCase();
  const token = text.match(/\b(preserves|breaks)\b/)?.[1];
  if (!token || text.replace(/[^a-z]/g, '') !== token) {
    throw new Error(`Ollama judge returned invalid verdict: ${JSON.stringify(raw)}`);
  }
  return token;
}

export async function assessMeaningPreservation({ sourceText, outputText } = {}) {
  if (!sourceText || !outputText) {
    throw new Error('assessMeaningPreservation requires both sourceText and outputText');
  }

  const payload = {
    model: OLLAMA_MODEL,
    system: SYSTEM_PROMPT,
    prompt: buildComparisonPrompt(sourceText, outputText),
    stream: false,
    temperature: 0.0
  };

  let response;
  try {
    response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    throw new Error(
      `Ollama judge unavailable at ${OLLAMA_ENDPOINT}: ${err && err.message ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Ollama judge failed with HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const body = await response.json();
  const label = normalizeJudgment(body.response);

  return {
    meaning_preserved: label === 'preserves' ? 1 : 0,
    label,
    issues: [],
    reasoning: '',
    model: body.model || OLLAMA_MODEL,
    input_tokens: Number(body.prompt_eval_count || 0),
    output_tokens: Number(body.eval_count || 0),
    cache_read_tokens: 0,
    cache_creation_tokens: 0
  };
}
