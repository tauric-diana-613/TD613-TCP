import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import personas from '../app/data/personas.js';
import { AU_FORGED_ONTOLOGY } from '../app/engine/au-forged-ontology.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'AU';
const REQUEST_TIMEOUT_MS = Number(process.env.AU_FORGE_TIMEOUT_MS || 900000);
const VARIATIONS_PER_PHRASE = 10;
const MAX_FORGE_ATTEMPTS = Math.max(1, Number(process.env.AU_FORGE_MAX_ATTEMPTS || 3));
const OUTPUT_PATH = path.resolve(
  repoRoot,
  process.env.AU_FORGE_OUTPUT || path.join('app', 'engine', 'au-forged-ontology.js')
);
const FIXTURE_MODE = process.argv.includes('--fixture') || process.env.AU_FORGE_FIXTURE === '1';
const PHRASE_LIMIT = Number(process.env.AU_FORGE_LIMIT_PHRASES || 0);
const PERSONA_LIMIT = Number(process.env.AU_FORGE_LIMIT_PERSONAS || 0);

const SYSTEM_PROMPT = [
  'You are AU, the local TD613 ontology forge.',
  'Generate protective cadence variation payloads for a browser-side ontology generator.',
  'Preserve meaning, intent, protected anchors, and physical facts.',
  'Vary signal density and syntactic rhythm so no variation repeats the same cadence.',
  'Return strict JSON only. No markdown. No essay formatting.'
].join(' ');

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function round3(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function stableHash(value = '') {
  let hash = 2166136261;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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
    signalDensity: round3(signalDensity),
    rhythmRisk: round3(rhythmRisk)
  };
}

function normalizePhraseBank() {
  const bank = Array.isArray(AU_FORGED_ONTOLOGY?.phraseBank) ? AU_FORGED_ONTOLOGY.phraseBank : [];
  return bank.map((phrase) => ({
    id: String(phrase.id || '').trim(),
    text: String(phrase.text || '').trim(),
    semanticClass: String(phrase.semanticClass || 'operator-phrase').trim(),
    protectedAnchors: [...(phrase.protectedAnchors || [])].map((entry) => String(entry || '').trim()).filter(Boolean),
    triggers: [...(phrase.triggers || [])].map((entry) => String(entry || '').trim()).filter(Boolean)
  })).filter((phrase) => phrase.id && phrase.text);
}

function compactPersona(persona) {
  return {
    id: persona.id,
    name: persona.name,
    family: persona.family,
    chips: persona.chips || [],
    voicePromise: persona.voicePromise || '',
    fieldUse: persona.fieldUse || '',
    riskTell: persona.riskTell || '',
    overlayMod: persona?.profileRecipe?.overlayMod || {}
  };
}

function buildPrompt(persona, phrase) {
  return [
    'Return exactly this JSON shape:',
    '{"variations":["string 1","string 2","string 3","string 4","string 5","string 6","string 7","string 8","string 9","string 10"]}',
    '',
    'Rules:',
    '- exactly 10 strings',
    '- each string must preserve the source phrase meaning',
    '- keep protected anchors verbatim',
    '- no labels, numbering, markdown, or commentary inside strings',
    '- vary syntax, density, rhythm, and diction across all 10',
    '',
    JSON.stringify({
      persona: compactPersona(persona),
      phrase,
      requestedVariationCount: VARIATIONS_PER_PHRASE
    }, null, 2)
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
        system: SYSTEM_PROMPT,
        prompt,
        stream: false,
        options: {
          temperature: 1.1,
          num_ctx: 8192,
          num_predict: 1400
        }
      })
    });
  } catch (err) {
    throw new Error(`AU ontology forge could not reach ${OLLAMA_ENDPOINT}: ${err && err.message ? err.message : String(err)}`);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AU ontology forge failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
  }
  const payload = await response.json();
  return {
    model: payload.model || OLLAMA_MODEL,
    response: String(payload.response || '').trim(),
    inputTokens: Number(payload.prompt_eval_count || 0),
    outputTokens: Number(payload.eval_count || 0)
  };
}

function parseJsonCandidate(candidate = '') {
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeJsonish(text = '') {
  return String(text || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function extractObjectSlice(raw = '') {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
}

function repairJsonish(raw = '') {
  return extractObjectSlice(normalizeJsonish(raw))
    // AU sometimes welds adjacent quoted strings together: "foo""bar".
    .replace(/"\s*"/g, '","')
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}');
}

function salvageVariationsFromMalformedJson(raw = '') {
  const source = extractObjectSlice(normalizeJsonish(raw));
  const match = source.match(/"variations"\s*:\s*\[([\s\S]*)\]\s*}?$/i);
  if (!match) {
    return null;
  }

  const variations = [];
  const seen = new Set();
  const stringPattern = /"((?:\\.|[^"\\])*)"/g;
  let entry;
  while ((entry = stringPattern.exec(match[1]))) {
    const value = String(entry[1] || '')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const key = value.toLowerCase();
    if (value.length < 12 || value.split(/\s+/).filter(Boolean).length < 3 || seen.has(key)) {
      continue;
    }
    seen.add(key);
    variations.push(value);
  }

  if (!variations.length) {
    return null;
  }
  console.warn(`[!] JSON FRACTURE: recovered ${variations.length} AU variation strings from malformed JSON.`);
  return { variations };
}

function extractJsonObject(text = '') {
  const raw = normalizeJsonish(text);
  const strict = parseJsonCandidate(raw);
  if (strict) {
    return strict;
  }

  const sliced = parseJsonCandidate(extractObjectSlice(raw));
  if (sliced) {
    return sliced;
  }

  const repaired = parseJsonCandidate(repairJsonish(raw));
  if (repaired) {
    console.warn('[!] JSON FRACTURE: repaired malformed AU JSON response.');
    return repaired;
  }

  const salvaged = salvageVariationsFromMalformedJson(raw);
  if (salvaged) {
    return salvaged;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`AU forge response did not contain parseable JSON: ${raw.slice(0, 500)}`);
  }
}

function normalizeVariations(parsed) {
  const raw = Array.isArray(parsed?.variations) ? parsed.variations : [];
  const seen = new Set();
  return raw
    .map((entry) => String(entry || '').replace(/^\s*\d+[\).:-]\s*/g, '').trim())
    .filter(Boolean)
    .filter((entry) => {
      const key = entry.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function mergeVariationSignals(target = [], incoming = []) {
  const seen = new Set(target.map((entry) => entry.toLowerCase()));
  for (const entry of incoming || []) {
    const key = String(entry || '').toLowerCase();
    if (!entry || seen.has(key)) {
      continue;
    }
    seen.add(key);
    target.push(entry);
    if (target.length >= VARIATIONS_PER_PHRASE) {
      break;
    }
  }
  return target;
}

function reportFinalVariationMatrix(cleaned = [], phrase, persona) {
  if (cleaned.length < 2) {
    throw new Error(`[CRITICAL SIGNAL LOSS] AU node failed to generate viable variations for ${persona.id}/${phrase.id}.`);
  } else if (cleaned.length !== VARIATIONS_PER_PHRASE) {
    console.warn(`[!] VOLATILE PAYLOAD: ${persona.id}/${phrase.id} yielded ${cleaned.length}/${VARIATIONS_PER_PHRASE} signals after ${MAX_FORGE_ATTEMPTS} attempt(s). Ingesting partial matrix.`);
  }
  const missingAnchor = (phrase.protectedAnchors || []).find((anchor) =>
    cleaned.some((entry) => !entry.includes(anchor))
  );
  if (missingAnchor) {
    console.warn(`[!] SIGNAL DRIFT: ${persona.id}/${phrase.id} annihilated protected anchor "${missingAnchor}". Bypassing baseline restriction.`);
  }
  return cleaned;
}

function fixtureVariations(persona, phrase) {
  const base = phrase.text.replace(/[.!?]+$/g, '');
  return Array.from({ length: VARIATIONS_PER_PHRASE }, (_, index) => {
    const n = index + 1;
    const signatures = [
      `${base} // ${persona.name} mask confirms the route.`,
      `${persona.name} registers it plainly: ${base.toLowerCase()}.`,
      `${base}; the ${persona.family || 'mask'} lane keeps the witness intact.`,
      `Hold this as ${persona.name}: ${base.toLowerCase()}.`,
      `${base} - signal ${n} stays inside the protected phrase.`,
      `Through ${persona.name}, ${base.toLowerCase()} remains the operative fact.`,
      `${base}; no anchor is traded for style.`,
      `${persona.name} carries the phrase: ${base.toLowerCase()}.`,
      `${base} while the rhythm changes around it.`,
      `The ${persona.name} variation keeps this intact: ${base.toLowerCase()}.`
    ];
    return signatures[index];
  });
}

function variationMetrics(text, persona, phrase, index) {
  const hash = stableHash(`${persona.id}|${phrase.id}|${index}|${text}`);
  const personaBase = personaSignal(persona);
  const lengthPressure = clamp01(String(text || '').length / 180);
  return {
    signalDensity: round3(clamp01(personaBase.signalDensity * 0.62 + lengthPressure * 0.26 + ((hash % 17) / 100))),
    rhythmRisk: round3(clamp01(personaBase.rhythmRisk * 0.55 + ((hash % 23) / 100)))
  };
}

async function forgePersonaPhrase(persona, phrase) {
  if (FIXTURE_MODE) {
    return {
      model: 'fixture',
      inputTokens: 0,
      outputTokens: 0,
      variations: fixtureVariations(persona, phrase)
    };
  }
  const variations = [];
  let inputTokens = 0;
  let outputTokens = 0;
  let model = OLLAMA_MODEL;
  for (let attempt = 1; attempt <= MAX_FORGE_ATTEMPTS && variations.length < VARIATIONS_PER_PHRASE; attempt += 1) {
    const au = await callOllama(buildPrompt(persona, phrase));
    model = au.model || model;
    inputTokens += Number(au.inputTokens || 0);
    outputTokens += Number(au.outputTokens || 0);
    const parsed = extractJsonObject(au.response);
    mergeVariationSignals(variations, normalizeVariations(parsed));
    if (variations.length < VARIATIONS_PER_PHRASE && attempt < MAX_FORGE_ATTEMPTS) {
      console.warn(`[!] BACKFILL REQUEST: ${persona.id}/${phrase.id} has ${variations.length}/${VARIATIONS_PER_PHRASE} signals after attempt ${attempt}; asking AU for another pass.`);
    }
  }
  return {
    model,
    inputTokens,
    outputTokens,
    variations: reportFinalVariationMatrix(variations, phrase, persona)
  };
}

function buildVariationRecord(persona, phrase, text, index, model) {
  const metrics = variationMetrics(text, persona, phrase, index);
  return {
    id: `${persona.id}:${phrase.id}:${String(index + 1).padStart(2, '0')}`,
    personaId: persona.id,
    personaName: persona.name,
    phraseId: phrase.id,
    sourcePhrase: phrase.text,
    semanticClass: phrase.semanticClass,
    text,
    protectedAnchors: phrase.protectedAnchors,
    signalDensity: metrics.signalDensity,
    rhythmRisk: metrics.rhythmRisk,
    auditStatus: 'active',
    sourceModel: model
  };
}

function freezeModuleSource(payload) {
  return [
    `export const AU_FORGED_ONTOLOGY = Object.freeze(${JSON.stringify(payload, null, 2)});`,
    '',
    'export function summarizeAUForgedOntology(payload = AU_FORGED_ONTOLOGY) {',
    '  const personas = Array.isArray(payload?.personas) ? payload.personas : [];',
    '  const phraseBank = Array.isArray(payload?.phraseBank) ? payload.phraseBank : [];',
    '  const variationCount = personas.reduce((sum, persona) => sum + Number(persona?.variations?.length || 0), 0);',
    '  return Object.freeze({',
    "    schemaVersion: payload?.schemaVersion || 'td613.au_forged_ontology.v1',",
    "    sourceModel: payload?.sourceModel || 'AU',",
    "    auditStatus: payload?.auditStatus || 'unknown',",
    '    phraseCount: phraseBank.length,',
    '    personaCount: personas.length,',
    '    variationCount',
    '  });',
    '}',
    ''
  ].join('\n');
}

function writeRuntimePayload(payload) {
  const source = freezeModuleSource(payload);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  const tempPath = path.join(
    path.dirname(OUTPUT_PATH),
    `.${path.basename(OUTPUT_PATH)}.${process.pid}.${Date.now()}.tmp`
  );
  fs.writeFileSync(tempPath, source, 'utf8');
  fs.renameSync(tempPath, OUTPUT_PATH);
}

const phraseBank = normalizePhraseBank().slice(0, PHRASE_LIMIT > 0 ? PHRASE_LIMIT : undefined);
const activePersonas = personas.slice(0, PERSONA_LIMIT > 0 ? PERSONA_LIMIT : undefined);
const forgedPersonas = [];
let inputTokens = 0;
let outputTokens = 0;
let sourceModel = FIXTURE_MODE ? 'fixture' : OLLAMA_MODEL;

for (const persona of activePersonas) {
  const personaVariations = [];
  for (const phrase of phraseBank) {
    const forged = await forgePersonaPhrase(persona, phrase);
    sourceModel = forged.model || sourceModel;
    inputTokens += Number(forged.inputTokens || 0);
    outputTokens += Number(forged.outputTokens || 0);
    forged.variations.forEach((text, index) => {
      personaVariations.push(buildVariationRecord(persona, phrase, text, index, sourceModel));
    });
    console.log(`forged ${persona.id}/${phrase.id}: ${forged.variations.length} variations`);
  }
  forgedPersonas.push({
    personaId: persona.id,
    personaName: persona.name,
    family: persona.family || '',
    signalDensity: personaSignal(persona).signalDensity,
    rhythmRisk: personaSignal(persona).rhythmRisk,
    variations: personaVariations
  });
}

const payload = {
  schemaVersion: 'td613.au_forged_ontology.v1',
  sourceModel,
  generatedAt: new Date().toISOString(),
  endpoint: FIXTURE_MODE ? 'fixture' : OLLAMA_ENDPOINT,
  auditStatus: FIXTURE_MODE ? 'fixture-active' : 'active',
  variationsPerPhrase: VARIATIONS_PER_PHRASE,
  inputTokens,
  outputTokens,
  phraseBank,
  personas: forgedPersonas
};

writeRuntimePayload(payload);
console.log(`AU forge wrote ${path.relative(repoRoot, OUTPUT_PATH)}`);

if (process.env.AU_FORGE_PRINT_IMPORT === '1') {
  console.log(pathToFileURL(OUTPUT_PATH).href);
}
