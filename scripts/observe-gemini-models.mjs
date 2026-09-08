import { listGeminiGenerateContentModels } from '../server/gemini-model-policy.js';

// Read-only provider metadata, never generateContent or a production deployment.
const listing = await listGeminiGenerateContentModels(process.env.GEMINI_API_KEY, { force: true });
console.log(JSON.stringify({
  schema: 'td613.gemini-model-list-observation/v0.1',
  source: 'https://generativelanguage.googleapis.com/v1beta/models',
  ...listing,
  claimCeiling: 'credential-scoped-model-listing-not-quota-quality-routing-or-release-authority'
}, null, 2));
if (!listing.ok) process.exitCode = 1;
