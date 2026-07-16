import {
  GEMINI_MODEL_POLICY_VERSION,
  geminiModelCatalog,
  listGeminiGenerateContentModels,
  resolveGeminiModelPlan
} from './gemini-model-policy.js';

const VERSION = 'td613.gemini-readiness/v1';

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Gemini-Policy', GEMINI_MODEL_POLICY_VERSION);
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

function intersect(plan = {}, discovered = []) {
  const set = new Set(discovered);
  return {
    configured: plan.models,
    callableByCooldown: plan.callableModels,
    listedByProvider: plan.models.filter((model) => set.has(model)),
    notListedByProvider: plan.models.filter((model) => !set.has(model))
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return send(res, 204, {});
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return send(res, 405, { ok: false, error: 'method-not-allowed', allowed: ['GET', 'OPTIONS'] });
  }

  const hush = resolveGeminiModelPlan({ task: 'hush-transform', maxModels: 8 });
  const khonapolit = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  const listing = await listGeminiGenerateContentModels(process.env.GEMINI_API_KEY);
  const discovered = listing.models || [];

  return send(res, 200, {
    ok: true,
    version: VERSION,
    policyVersion: GEMINI_MODEL_POLICY_VERSION,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    providerModelListing: {
      ok: listing.ok,
      status: listing.status || null,
      cached: Boolean(listing.cached),
      generateContentModelCount: discovered.length,
      models: discovered,
      error: listing.error || null
    },
    routes: {
      hush: { plan: hush, providerIntersection: intersect(hush, discovered) },
      khonapolit: { plan: khonapolit, providerIntersection: intersect(khonapolit, discovered) }
    },
    catalog: geminiModelCatalog(),
    exclusions: {
      proModels: 'explicit-opt-in-only because current project quota may be zero',
      specializedModels: 'image, audio, live, embedding, robotics, and agent models require task-specific routes and are not text-rewrite fallbacks'
    },
    claimCeiling: 'provider-listing-and-local-routing-readiness-not-quota-entitlement-latency-output-quality-or-model-availability-proof'
  });
}
