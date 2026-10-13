import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import personas from '../app/data/personas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'AU';
const REQUEST_TIMEOUT_MS = Number(process.env.AU_SIGNAL_TIMEOUT_MS || 900000);
const REPORT_DIR = path.join(repoRoot, 'reports', 'au-signal');

function clamp01(value) {
  const numeric = Number(value || 0);
  return Math.max(0, Math.min(1, numeric));
}

function round3(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function personaSignal(persona) {
  const mod = persona?.profileRecipe?.overlayMod || {};
  const modMagnitude = Object.values(mod).reduce((sum, value) => sum + Math.abs(Number(value || 0)), 0);
  const chipPressure = Array.isArray(persona.chips) ? persona.chips.length : 0;
  const copyPressure = [
    persona.tagline,
    persona.blurb,
    persona.voicePromise,
    persona.fieldUse,
    persona.riskTell
  ].filter(Boolean).join(' ').length;
  const signalDensity = clamp01((modMagnitude / 38) + (chipPressure / 28) + (copyPressure / 1800));
  const rhythmRisk = clamp01(
    (Math.abs(Number(mod.sent || 0)) / 12) +
    (Math.abs(Number(mod.cont || 0)) / 18) +
    (persona.riskTell ? 0.08 : 0)
  );
  return {
    id: persona.id,
    name: persona.name,
    family: persona.family,
    chips: persona.chips || [],
    overlayMod: mod,
    strength: Number(persona?.profileRecipe?.strength || 0),
    riskTell: persona.riskTell || '',
    signalDensity: round3(signalDensity),
    rhythmRisk: round3(rhythmRisk)
  };
}

function buildPrompt(personaSignals) {
  return [
    'TD613-TCP AU SIGNAL DENSITY AUDIT',
    'Input = compact built-in persona metrics for retrieval-generator grounding.',
    'Return one dense tactical block with SIGNAL_DENSITY / RHYTHM_RISK / PERSONA_FLAGS / REFINEMENT_DIRECTIVES.',
    '',
    JSON.stringify({
      personas: personaSignals.map((persona) => ({
        id: persona.id,
        name: persona.name,
        family: persona.family,
        chips: persona.chips,
        mod: persona.overlayMod,
        signalDensity: persona.signalDensity,
        rhythmRisk: persona.rhythmRisk
      }))
    })
  ].join('\n');
}

async function callOllama(prompt) {
  let response;
  try {
    response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.0,
          num_ctx: 8192,
          num_predict: 260
        }
      })
    });
  } catch (err) {
    throw new Error(`AU signal audit could not reach ${OLLAMA_ENDPOINT}: ${err && err.message ? err.message : String(err)}`);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AU signal audit failed with HTTP ${response.status}: ${body.slice(0, 300)}`);
  }
  const payload = await response.json();
  return {
    model: payload.model || OLLAMA_MODEL,
    response: String(payload.response || '').trim(),
    inputTokens: Number(payload.prompt_eval_count || 0),
    outputTokens: Number(payload.eval_count || 0)
  };
}

function writeReports(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  const lines = [
    '# AU Signal Density',
    '',
    `Generated: ${report.generatedAt}`,
    `Model: ${report.model}`,
    `Personas: ${report.personas.length}`,
    '',
    '## Receipt',
    '',
    report.auReceipt || '(empty)',
    '',
    '## Persona Metrics',
    '',
    '| Persona | Signal density | Rhythm risk |',
    '| --- | ---: | ---: |',
    ...report.personas.map((persona) => `| ${persona.name} | ${persona.signalDensity.toFixed(3)} | ${persona.rhythmRisk.toFixed(3)} |`)
  ];
  fs.writeFileSync(path.join(REPORT_DIR, 'latest.md'), `${lines.join('\n')}\n`, 'utf8');
}

const personaSignals = personas.map(personaSignal);
const prompt = buildPrompt(personaSignals);
const au = await callOllama(prompt);
const report = {
  generatedAt: new Date().toISOString(),
  endpoint: OLLAMA_ENDPOINT,
  model: au.model,
  inputTokens: au.inputTokens,
  outputTokens: au.outputTokens,
  personas: personaSignals,
  auReceipt: au.response
};

writeReports(report);
console.log(`AU signal audit wrote ${path.relative(repoRoot, path.join(REPORT_DIR, 'latest.json'))}`);
console.log(`AU signal audit wrote ${path.relative(repoRoot, path.join(REPORT_DIR, 'latest.md'))}`);
