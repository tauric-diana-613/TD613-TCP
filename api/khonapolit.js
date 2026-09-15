// Canonical Kʰonapolit boundary. Implementation lives outside /api so one route consumes one Vercel function.
import geminiReadinessHandler from '../server/gemini-readiness.js';
import loomTaskHandler from '../server/loom-task.js';
import marrowlineAttachmentHandler from '../server/marrowline-attachment-quality.js';
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

function requestHasAttachments(req = {}) {
  if (req?.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return Array.isArray(req.body.attachments) && req.body.attachments.length > 0;
  if (typeof req?.body === 'string' || Buffer.isBuffer(req?.body)) {
    try {
      const body = JSON.parse(String(req.body));
      return Array.isArray(body?.attachments) && body.attachments.length > 0;
    } catch {
      return false;
    }
  }
  return false;
}

export default function handler(req, res) {
  if (requestedOperation(req) === 'loom-task') return loomTaskHandler(req, res);
  if (requestedOperation(req) === 'gemini-readiness') {
    return geminiReadinessHandler(req, res);
  }
  if (requestHasAttachments(req)) return marrowlineAttachmentHandler(req, res);
  return khonapolitHandler(req, res);
}

export * from '../server/khonapolit-quality.js';
