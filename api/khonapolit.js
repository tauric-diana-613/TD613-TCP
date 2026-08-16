// Canonical Kʰonapolit boundary. Implementation lives outside /api so one route consumes one Vercel function.
import geminiReadinessHandler from '../server/gemini-readiness.js';
import khonapolitHandler from '../server/khonapolit-quality.js';

function requestedOperation(req) {
  const queryOperation = req?.query?.operation;
  if (typeof queryOperation === 'string') return queryOperation;
  try {
    return new URL(req?.url || '/api/khonapolit', 'https://td613.invalid').searchParams.get('operation');
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (requestedOperation(req) === 'gemini-readiness') {
    return geminiReadinessHandler(req, res);
  }
  return khonapolitHandler(req, res);
}

export * from '../server/khonapolit-quality.js';
