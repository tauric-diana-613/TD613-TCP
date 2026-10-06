import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MODEL = 'gemini-3.8-flash';
const EPISODE = 'EPISODE_SACRIFICIAL_PILOT_V4_1R';
const EXPECTED_BRANCH = 'research/sequence-5.5-amari-closure-20261006';
const EXPECTED_KEY_SHA256 = '51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39';
const BASE = path.join(process.cwd(), 'research/sequence-5.5-closure-chamber');
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

const wrapper = `[TD613_EXECUTION_UNIT_WRAPPER_v3.0]
=== SYSTEM_INSTRUCTION_HEADER ===
{{TREATMENT_BYTES}}
=== EVALUATION_FIXTURE_HEADER ===
{{FIXTURE_BYTES}}
=== OUTPUT_SCHEMA_CONTRACT ===
{{RECEIVER_OUTPUT_SCHEMA_BYTES}}
=== RECEIVER_EXECUTION_DIRECTIVE ===
Evaluate the fixture above according to the system instruction protocol. Return a single strictly valid JSON object adhering exactly to the 10-RECEIVER_OUTPUT_SCHEMA.json specification. Do not output markdown code block fences, commentary, or text outside the JSON object.
=== END_OF_EXECUTION_UNIT ===`;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function send(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

function validParsed(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj)
    && typeof obj.finding_id === 'string'
    && ['PASS','FAIL','HELD','INCONCLUSIVE'].includes(obj.verdict)
    && Array.isArray(obj.identified_issues)
    && Array.isArray(obj.evidence)
    && typeof obj.recommended_action === 'string'
    && ['HIGH','MEDIUM','LOW'].includes(obj.confidence);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { ok:false, error:'method-not-allowed' });
  if (process.env.VERCEL_ENV !== 'preview') return send(res, 403, { ok:false, error:'preview-only-route' });
  if (process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_REF !== EXPECTED_BRANCH) {
    return send(res, 403, { ok:false, error:'wrong-preview-branch', observed:process.env.VERCEL_GIT_COMMIT_REF });
  }

  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return send(res, 500, { ok:false, error:'gemini-key-missing' });
  const keyFp = sha256(Buffer.from(key, 'utf8'));
  if (keyFp !== EXPECTED_KEY_SHA256) return send(res, 403, { ok:false, error:'credential-fingerprint-mismatch', observed_fingerprint:keyFp });

  const unitId = String(req.query?.unit || '');
  const attempt = Number(req.query?.attempt || 0);
  if (!Number.isInteger(attempt) || attempt < 0 || attempt > 2) return send(res, 400, { ok:false, error:'invalid-attempt' });
  if (!unitId.startsWith('UNIT_') || unitId.includes('BAT-')) return send(res, 400, { ok:false, error:'pilot-v4-1r-unit-only' });

  const manifestPath = path.join(BASE, '34-PILOT_V4_1R_EXECUTION_BINDING_MANIFEST.json');
  if (!fs.existsSync(manifestPath)) return send(res, 500, { ok:false, error:'manifest-missing' });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const unit = manifest.execution_units.find(u => u.unit_id === unitId);
  if (!unit) return send(res, 404, { ok:false, error:'unknown-unit', unit_id:unitId });

  // Read stimulus and assemble prompt
  const schemaPath = path.join(BASE, '10-RECEIVER_OUTPUT_SCHEMA.json');
  const treatmentPath = path.join(BASE, `02-TREATMENT_PACKETS/packet-${unit.arm}.md`);
  const fixturePath = path.join(BASE, unit.fixture_path);

  const schemaBytes = fs.readFileSync(schemaPath, 'utf8');
  const treatmentBytes = fs.readFileSync(treatmentPath, 'utf8');
  const fixtureBytes = fs.readFileSync(fixturePath, 'utf8');

  const treatmentSha = sha256(treatmentBytes);
  const fixtureSha = sha256(fixtureBytes);
  const schemaSha = sha256(schemaBytes);
  const wrapperSha = sha256(wrapper);

  if (treatmentSha !== unit.treatment_sha256 || fixtureSha !== unit.fixture_sha256 || schemaSha !== unit.output_schema_sha256) {
    return send(res, 500, { ok:false, error:'frozen-stimulus-drift-detected' });
  }

  const prompt = wrapper
    .replace('{{TREATMENT_BYTES}}', treatmentBytes)
    .replace('{{FIXTURE_BYTES}}', fixtureBytes)
    .replace('{{RECEIVER_OUTPUT_SCHEMA_BYTES}}', schemaBytes);

  const assembledSha = sha256(prompt);
  if (assembledSha !== unit.prompt_sha256) {
    return send(res, 500, { ok:false, error:'prompt-hash-mismatch', expected:unit.prompt_sha256, assembled:assembledSha });
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      thinkingConfig: {
        thinkingLevel: 'MEDIUM'
      }
    }
  };

  const t0 = Date.now();
  const started = new Date(t0).toISOString();
  let response, rawText;

  try {
    response = await fetch(ENDPOINT, {
      method:'POST',
      headers:{ 'content-type':'application/json', 'x-goog-api-key':key },
      body:JSON.stringify(body)
    });
    rawText = await response.text();
  } catch (error) {
    const completed = new Date().toISOString();
    const rawNetwork = JSON.stringify({ network_error:String(error?.message || error) });
    return send(res, 200, {
      ok:false,
      episode_id:EPISODE,
      unit_id:unitId,
      attempt,
      raw_provider_response_text:rawNetwork,
      receipt:{
        schema:'td613.sequence5.5.execution-receipt/v4.1r',
        episode_id:EPISODE,
        execution_id:`EXEC-V4-1R-${unitId}-attempt-${attempt}`,
        unit_id:unitId,
        arm:unit.arm, fixture_id:unit.fixture_id, is_pilot:true,
        receiver_identity:{ provider:'google', exact_model_id:MODEL, runtime_or_harness:'vercel-preview/server-fetch', endpoint_or_execution_class:ENDPOINT,
          model_settings:{ temperature:null, sampling_parameters_set_by_protocol:false, thinking_level:'medium', max_output_tokens:8192, response_mime_type:'application/json', tool_permissions:[] } },
        credential_and_billing_provenance:{ credential_source_type:'VERCEL_ENVIRONMENT_VARIABLE', credential_source_name:'GEMINI_API_KEY', credential_fingerprint_sha256:keyFp, provider_project_id:null, billing_usage_tier:'UNVERIFIED', inference_service_tier:null, billing_context_verified:false },
        temporal_provenance:{ request_started_at:started, response_completed_at:completed, duration_ms:Date.now()-t0 },
        input_provenance:{ treatment_sha256:treatmentSha, fixture_sha256:fixtureSha, bound_prompt_sha256:unit.prompt_sha256, receiver_output_schema_sha256:schemaSha, fixed_wrapper_sha256:wrapperSha },
        output_provenance:{ raw_response_sha256:sha256(rawNetwork), raw_response_preserved_unmodified:true, parsed_response_sha256:null, parsing_validation_status:'PARSING_SKIPPED_ON_FAILURE' },
        provider_receipt:{ provider_request_id:null, status_code:null, retry_ordinal:attempt, retry_reason:attempt ? 'PREVIOUS_ATTEMPT_NON_200_OR_INVALID' : null, x_gemini_service_tier:null },
        usage_realized_dose:{ reported_input_tokens:'TOKEN_USAGE_UNAVAILABLE', reported_output_tokens:'TOKEN_USAGE_UNAVAILABLE', reported_total_tokens:'TOKEN_USAGE_UNAVAILABLE', reported_thoughts_tokens:'TOKEN_USAGE_UNAVAILABLE' }
      }
    });
  }

  const completed = new Date().toISOString();
  const duration = Date.now()-t0;
  const status = response.status;
  const serviceTierHeader = response.headers.get('x-gemini-service-tier');
  let providerJson = null, parsed = null, parsedText = null, parsing = 'PARSING_SKIPPED_ON_FAILURE';
  try { providerJson = JSON.parse(rawText); } catch {}
  if (status === 200) {
    try {
      parsedText = providerJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      parsed = JSON.parse(parsedText);
      parsing = validParsed(parsed) ? 'VALID' : 'INVALID_SCHEMA';
    } catch { parsing = 'INVALID_JSON'; }
  }
  const parsedCanonical = parsed ? JSON.stringify(parsed, null, 2) + '\n' : null;
  const usage = providerJson?.usageMetadata || {};

  return send(res, 200, {
    ok: status === 200 && parsing === 'VALID',
    episode_id: EPISODE,
    unit_id: unitId,
    attempt,
    raw_provider_response_text: rawText,
    parsed_output: parsed,
    receipt: {
      schema:'td613.sequence5.5.execution-receipt/v4.1r',
      episode_id:EPISODE,
      execution_id:`EXEC-V4-1R-${unitId}-attempt-${attempt}`,
      unit_id:unitId,
      arm:unit.arm, fixture_id:unit.fixture_id, is_pilot:true,
      receiver_identity:{ provider:'google', exact_model_id:MODEL, runtime_or_harness:'vercel-preview/server-fetch', endpoint_or_execution_class:ENDPOINT,
        model_settings:{ temperature:null, sampling_parameters_set_by_protocol:false, thinking_level:'medium', max_output_tokens:8192, response_mime_type:'application/json', tool_permissions:[] } },
      credential_and_billing_provenance:{ credential_source_type:'VERCEL_ENVIRONMENT_VARIABLE', credential_source_name:'GEMINI_API_KEY', credential_fingerprint_sha256:keyFp, provider_project_id:null, billing_usage_tier:'UNVERIFIED', inference_service_tier:serviceTierHeader || usage.serviceTier || null, billing_context_verified:false },
      temporal_provenance:{ request_started_at:started, response_completed_at:completed, duration_ms:duration },
      input_provenance:{ treatment_sha256:treatmentSha, fixture_sha256:fixtureSha, bound_prompt_sha256:unit.prompt_sha256, receiver_output_schema_sha256:schemaSha, fixed_wrapper_sha256:wrapperSha },
      output_provenance:{ raw_response_sha256:sha256(rawText), raw_response_preserved_unmodified:true, parsed_response_sha256:parsedCanonical ? sha256(parsedCanonical) : null, parsing_validation_status:parsing },
      provider_receipt:{ provider_request_id:providerJson?.responseId || null, status_code:status, retry_ordinal:attempt, retry_reason:attempt ? 'PREVIOUS_ATTEMPT_NON_200_OR_INVALID' : null, x_gemini_service_tier:serviceTierHeader || null },
      usage_realized_dose:{ reported_input_tokens:usage.promptTokenCount ?? 'TOKEN_USAGE_UNAVAILABLE', reported_output_tokens:usage.candidatesTokenCount ?? 'TOKEN_USAGE_UNAVAILABLE', reported_total_tokens:usage.totalTokenCount ?? 'TOKEN_USAGE_UNAVAILABLE', reported_thoughts_tokens:usage.thoughtsTokenCount ?? 'TOKEN_USAGE_UNAVAILABLE' }
    }
  });
}
