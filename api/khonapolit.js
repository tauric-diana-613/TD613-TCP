// Canonical Kʰonapolit boundary. Implementation lives outside /api so one route consumes one Vercel function.
import geminiReadinessHandler from '../server/gemini-readiness.js';
import loomTaskHandler from '../server/loom-task.js';
import loomDemoTaskHandler from '../server/loom-demo-task.js';
import marrowlineAttachmentHandler from '../server/marrowline-attachment-quality.js';
import khonapolitHandler from '../server/khonapolit-quality.js';
import loomAdvisoryHandler from '../server/holonomy-loom-khonapolit-advisory.js';
import loomAssayHandler from '../server/loom-assay.js';
import loomAssayCredentialHandler from '../server/loom-assay-credential.js';
import {
  GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
  withGeminiGenerationProfile
} from '../server/gemini-generation-envelope.js';

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
  if (requestedOperation(req) === 'loom-assay-credential') return loomAssayCredentialHandler(req, res);
  if (requestedOperation(req) === 'loom-assay') return loomAssayHandler(req, res);
  if (requestedOperation(req) === 'loom-advisory') return withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => loomAdvisoryHandler(req, res)
  );
  if (requestedOperation(req) === 'loom-demo-task') return loomDemoTaskHandler(req, res);
  if (requestedOperation(req) === 'loom-task') return loomTaskHandler(req, res);
  if (requestedOperation(req) === 'gemini-readiness') {
    return geminiReadinessHandler(req, res);
  }
  if (requestHasAttachments(req)) return marrowlineAttachmentHandler(req, res);
  return withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => khonapolitHandler(req, res)
  );
}

export * from '../server/khonapolit-quality.js';
