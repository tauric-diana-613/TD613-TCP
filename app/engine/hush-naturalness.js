export const HUSH_NATURALNESS_VERSION = 'phase-16';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

function words(text = '') {
  return safeText(text).trim().split(/\s+/).filter(Boolean);
}

function sentences(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return [];
  return value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [value];
}

function repeatedPhrases(text = '') {
  const list = words(text).map((word) => word.toLowerCase().replace(/[^a-z0-9']/g, '')).filter(Boolean);
  const counts = new Map();
  for (let size = 2; size <= 4; size += 1) {
    for (let i = 0; i <= list.length - size; i += 1) {
      const phrase = list.slice(i, i + size).join(' ');
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
    }
  }
  return [...counts.entries()].filter(([phrase, count]) => count > 1 && phrase.length > 4).map(([phrase]) => phrase).slice(0, 8);
}

export function detectAwkwardness(input = {}) {
  const text = safeText(input.text ?? input.outputText);
  const sentenceList = sentences(text);
  const wordList = words(text);
  const flags = [];
  const repairs = [];
  const reps = repeatedPhrases(text);
  if (reps.length) { flags.push('repeated-phrase'); repairs.push('remove repeated phrase loops'); }
  if (sentenceList.some((sentence) => words(sentence).length > 32)) { flags.push('overlong-sentence'); repairs.push('split overlong sentence'); }
  const shortRun = sentenceList.filter((sentence) => words(sentence).length <= 4).length;
  if (sentenceList.length >= 4 && shortRun / sentenceList.length > 0.65) { flags.push('choppy-sentence-pileup'); repairs.push('merge some short sentences'); }
  if (/\b(?:regarding|furthermore|moreover|therefore)\b[^.!?]{0,80}\b(?:regarding|furthermore|moreover|therefore)\b/i.test(text)) { flags.push('double-transition'); repairs.push('remove double transition'); }
  if (/([—–-]\s*){2,}|([,;:]\s*){3,}/.test(text)) { flags.push('punctuation-cluster'); repairs.push('clean punctuation cluster'); }
  if (/\b(?:synergy|leverage|utilize|robust|streamline|stakeholder|circle back|touch base)\b/i.test(text)) { flags.push('empty-corporate-filler'); repairs.push('replace corporate filler with plain words'); }
  if (/\b(?:I\s+am|do not|does not)\b.*\b(?:I'm|don't|doesn't)\b|\b(?:I'm|don't|doesn't)\b.*\b(?:I\s+am|do not|does not)\b/i.test(text)) { flags.push('mixed-contraction-posture'); repairs.push('normalize contraction posture'); }
  if (/\b(.{2,24})\b\s+\b\1\b/i.test(text)) { flags.push('semantic-stutter'); repairs.push('remove duplicated phrase'); }
  if (wordList.length > 0 && new Set(wordList.map((word) => word.toLowerCase())).size / wordList.length < 0.42) { flags.push('low-lexical-variety'); repairs.push('vary repeated wording'); }
  return { awkwardnessFlags: [...new Set(flags)], recommendedRepair: [...new Set(repairs)] };
}

export function scoreNaturalness(input = {}) {
  const text = safeText(input.text ?? input.outputText);
  const mask = input.mask || {};
  const traits = input.realizationPlan?.traits || mask.writingTraits || {};
  const sentenceList = sentences(text);
  const wordList = words(text);
  const detected = detectAwkwardness({ text });
  let score = 1;
  score -= detected.awkwardnessFlags.length * 0.095;
  const avgSentence = sentenceList.length ? wordList.length / sentenceList.length : 0;
  if (!wordList.length) score = 0;
  if (avgSentence > 32) score -= 0.16;
  if (avgSentence < 4 && wordList.length > 20) score -= 0.12;
  if (traits.sentenceLength === 'short' && avgSentence > 24) score -= 0.08;
  if (traits.sentenceLength === 'long' && avgSentence < 8 && wordList.length > 18) score -= 0.06;
  if (traits.contractionPosture === 'avoid' && /\b(?:I'm|you're|we're|they're|don't|doesn't|can't|won't|it's)\b/i.test(text)) score -= 0.09;
  if (traits.contractionPosture === 'frequent' && /\b(?:I am|you are|we are|they are|do not|does not|cannot|will not)\b/i.test(text)) score -= 0.04;
  if (traits.emotionalTemperature === 'low' && /!{1,}|\b(?:honestly|wild|amazing|love|hate)\b/i.test(text)) score -= 0.06;
  const naturalnessScore = round(clamp(score));
  return {
    version: HUSH_NATURALNESS_VERSION,
    naturalnessScore,
    awkwardnessFlags: detected.awkwardnessFlags,
    fluencyWarnings: detected.awkwardnessFlags.map((flag) => `awkwardness:${flag}`),
    recommendedRepair: detected.recommendedRepair
  };
}

export function summarizeNaturalness(input = {}) {
  const result = input.naturalnessScore === undefined ? scoreNaturalness(input) : input;
  return {
    version: result.version || HUSH_NATURALNESS_VERSION,
    naturalnessScore: result.naturalnessScore ?? 0,
    status: (result.naturalnessScore ?? 0) >= 0.78 ? 'natural' : (result.naturalnessScore ?? 0) >= 0.58 ? 'review' : 'awkward',
    awkwardnessFlags: asArray(result.awkwardnessFlags),
    recommendedRepair: asArray(result.recommendedRepair)
  };
}
