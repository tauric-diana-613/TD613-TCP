export function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9’']+/g) || []);
}

export function sentenceSplit(text) {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

export function avgSentenceLength(text) {
  const s = sentenceSplit(text);
  if (!s.length) return 0;
  return s.reduce((n, x) => n + tokenize(x).length, 0) / s.length;
}

export function punctuationDensity(text) {
  return ((text.match(/[,:;.!?\-—]/g) || []).length) / Math.max(text.length, 1);
}

export function contractionDensity(text) {
  const w = tokenize(text);
  return w.filter(x => x.includes("'") || x.includes('’')).length / Math.max(w.length, 1);
}

export function lineBreakDensity(text) {
  return ((text.match(/\n/g) || []).length) / Math.max(text.length, 1);
}

export function repeatedBigramPressure(text) {
  const w = tokenize(text);
  if (w.length < 2) return 0;
  const counts = new Map();
  for (let i = 0; i < w.length - 1; i++) {
    const bigram = `${w[i]} ${w[i + 1]}`;
    counts.set(bigram, (counts.get(bigram) || 0) + 1);
  }
  let repeated = 0;
  for (const n of counts.values()) {
    if (n > 1) repeated += (n - 1);
  }
  return repeated / Math.max(w.length - 1, 1);
}

export function recurrencePressure(text) {
  const punct = Math.min(punctuationDensity(text) / 0.04, 1);
  const line = Math.min(lineBreakDensity(text) / 0.03, 1);
  const bigram = Math.min(repeatedBigramPressure(text) / 0.2, 1);
  const pressure = (punct + line + bigram) / 3;
  return Number(pressure.toFixed(3));
}

export function lexicalDispersion(text) {
  const w = tokenize(text);
  if (!w.length) return 0;
  const uniq = new Set(w).size / w.length;
  const counts = {};
  w.forEach(t => counts[t] = (counts[t] || 0) + 1);
  let repeats = 0, singles = 0;
  Object.values(counts).forEach(v => {
    if (v === 1) singles++;
    else repeats += v - 1;
  });
  const predictability = 1 - repeats / Math.max(w.length, 1);
  const novel = singles / Math.max(Object.keys(counts).length, 1);
  return 0.4 * uniq + 0.3 * predictability + 0.3 * novel;
}

export function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const i = [...A].filter(x => B.has(x)).length;
  const u = new Set([...A, ...B]).size || 1;
  return i / u;
}

export function compareTexts(a, b) {
  const wa = tokenize(a), wb = tokenize(b);
  const sA = avgSentenceLength(a), sB = avgSentenceLength(b);
  const pA = punctuationDensity(a), pB = punctuationDensity(b);
  const cA = contractionDensity(a), cB = contractionDensity(b);
  const lA = lexicalDispersion(a), lB = lexicalDispersion(b);
  const rA = recurrencePressure(a), rB = recurrencePressure(b);
  const lex = jaccard(wa, wb);
  const sentenceDistance = Math.min(Math.abs(sA - sB) / 18, 1);
  const punctDistance = Math.min(Math.abs(pA - pB) / 0.08, 1);
  const contractionDistance = Math.min(Math.abs(cA - cB) / 0.22, 1);
  const lexicalDistance = Math.min(Math.abs(lA - lB) / 0.45, 1);
  const recurrenceDistance = Math.abs(rA - rB);
  const similarity =
    (lex * 0.23) +
    ((1 - sentenceDistance) * 0.20) +
    ((1 - punctDistance) * 0.15) +
    ((1 - contractionDistance) * 0.12) +
    ((1 - lexicalDistance) * 0.14) +
    ((1 - recurrenceDistance) * 0.16);
  const traceability =
    ((1 - Math.min(Math.abs(sA - sB) / 10, 1)) * 0.30) +
    ((1 - Math.min(Math.abs(pA - pB) / 0.04, 1)) * 0.25) +
    ((1 - Math.min(Math.abs(cA - cB) / 0.08, 1)) * 0.20) +
    ((1 - recurrenceDistance) * 0.25);
  return {
    similarity: Number(similarity.toFixed(3)),
    traceability: Number(traceability.toFixed(3)),
    recurrencePressure: Number((((rA + rB) / 2)).toFixed(3)),
    sentenceDistance: Number(sentenceDistance.toFixed(3)),
    punctDistance: Number(punctDistance.toFixed(3)),
    contractionDistance: Number(contractionDistance.toFixed(3)),
    lexicalDistance: Number(lexicalDistance.toFixed(3)),
    recurrenceDistance: Number(recurrenceDistance.toFixed(3)),
    avgSentenceA: Number(sA.toFixed(2)),
    avgSentenceB: Number(sB.toFixed(2)),
    lexicalOverlap: Number(lex.toFixed(3))
  };
}

export function transformText(text, mod) {
  let s = text;
  if (mod.sent > 0) s = s.replace(/([.!?])\s+/g, ', and ');
  else if (mod.sent < 0) s = s.replace(/, and /g, '. ').replace(/, but /g, '. ');
  if (mod.cont > 0) s = s.replace(/\bdo not\b/gi, "don't").replace(/\bcannot\b/gi, "can't");
  else if (mod.cont < 0) s = s.replace(/\bdon't\b/gi, 'do not').replace(/\bcan't\b/gi, 'cannot');
  if (mod.punc > 0) {
    s = s.replace(/\. /g, '; ');
    if (!/[!?—]$/.test(s)) s += ' —';
  } else if (mod.punc < 0) {
    s = s.replace(/[;:—]/g, '.').replace(/,+/g, '.');
  }
  return s;
}
