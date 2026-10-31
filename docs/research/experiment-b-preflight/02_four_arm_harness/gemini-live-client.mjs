// TD613 Experiment B · Authorized Live Model Provider Client
// Interacts with Google Gemini API via official REST transport.
// Records exact timestamps, raw prompt/response traces, token usage metadata, and sampling parameters.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { geminiGenerateContentUrl, geminiRequestHeaders, observeGeminiQuota } from '../../../../server/gemini-provider-transport.js';

export const MODEL_PRICING = Object.freeze({
  'gemini-2.5-flash-lite': {
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    thoughtsPerMillion: 0.40
  },
  'gemini-2.5-flash': {
    inputPerMillion: 0.30,
    outputPerMillion: 2.50,
    thoughtsPerMillion: 2.50
  }
});

/**
 * Calculates financial cost in USD using current Google standard paid API rates.
 * Output pricing includes thinking / reasoning tokens.
 */
export function calculateModelCost(model, inputTokens = 0, outputTokens = 0, thoughtsTokens = 0) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gemini-2.5-flash-lite'];
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = ((outputTokens + thoughtsTokens) / 1_000_000) * pricing.outputPerMillion;
  return Number((inputCost + outputCost).toFixed(8));
}

function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const parts = line.trim().split('=');
      if (parts[0] === 'GEMINI_API_KEY') {
        return parts.slice(1).join('=');
      }
    }
  }
  return null;
}

export class GeminiLiveClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || loadApiKey();
    this.model = options.model || 'gemini-2.5-flash-lite';
    this.temperature = options.temperature ?? 0.0;
    this.maxOutputTokens = options.maxOutputTokens ?? 4096;
    this.sharedBudgetGovernor = options.sharedBudgetGovernor || null;
    this.fetchStub = options.fetchStub || null;
    this.recordedTraces = [];
    this.totalProviderAttempts = 0;
    this.totalInternalRetries = 0;
  }

  isAvailable() {
    return Boolean(this.fetchStub || (this.apiKey && this.apiKey.length > 10));
  }

  async invoke({ systemInstruction = '', prompt = '', context = '', episodeId = 'ep-0', arm = 'UNKNOWN_ARM' }) {
    if (!this.isAvailable()) {
      throw new Error('MODEL_EXECUTION_UNAVAILABLE: GEMINI_API_KEY not found in environment or .env');
    }

    const url = geminiGenerateContentUrl(this.model);
    const contents = [];

    const fullPrompt = context ? `${context}\n\nTask / Question:\n${prompt}` : prompt;
    contents.push({ role: 'user', parts: [{ text: fullPrompt }] });

    const requestBody = {
      contents,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxOutputTokens
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const startTime = new Date().toISOString();
    const startTimestamp = Date.now();

    let response;
    let resData;
    let attempts = 0;
    const maxAttempts = 3;
    const attemptLog = [];

    while (attempts < maxAttempts) {
      attempts++;
      this.totalProviderAttempts++;

      // R3-04: Account every individual attempt (including retries) under the shared governor
      if (this.sharedBudgetGovernor) {
        this.sharedBudgetGovernor.registerProviderAttempt(arm, { episode_id: episodeId, attempt: attempts });
      }

      const attemptStart = Date.now();
      try {
        if (typeof this.fetchStub === 'function') {
          response = await this.fetchStub(url, {
            method: 'POST',
            headers: geminiRequestHeaders(this.apiKey || 'STUB_API_KEY'),
            body: JSON.stringify(requestBody)
          }, attempts);
          resData = await response.json();
        } else {
          response = await fetch(url, {
            method: 'POST',
            headers: geminiRequestHeaders(this.apiKey),
            body: JSON.stringify(requestBody)
          });
          resData = await response.json();
        }

        const attemptLatency = Date.now() - attemptStart;
        attemptLog.push({
          attempt_index: attempts,
          http_status: response.status,
          latency_ms: attemptLatency,
          timestamp: new Date().toISOString()
        });

        if (response.status === 200) {
          break;
        } else if (response.status === 429 || response.status >= 500) {
          this.totalInternalRetries++;
          const quota = observeGeminiQuota(resData, { model: this.model, response });
          const delay = this.fetchStub ? 10 : Math.max(2000 * attempts, 2000);
          console.warn(`[GeminiLiveClient] HTTP ${response.status} on attempt ${attempts}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw new Error(`Gemini API Error (HTTP ${response.status}): ${JSON.stringify(resData)}`);
        }
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        this.totalInternalRetries++;
        const delay = this.fetchStub ? 10 : 2000 * attempts;
        await new Promise(r => setTimeout(r, delay));
      }
    }

    const finishTime = new Date().toISOString();
    const latencyMs = Date.now() - startTimestamp;

    if (!response || response.status !== 200) {
      throw new Error(`Failed after ${maxAttempts} attempts: ${JSON.stringify(resData)}`);
    }

    const candidate = resData.candidates?.[0];
    const candidateParts = candidate?.content?.parts || [];
    // Extract candidate text (ignoring thinking parts if separate)
    const textParts = candidateParts.filter(p => p.text && !p.thought).map(p => p.text);
    const responseText = textParts.join('\n').trim() || candidateParts.map(p => p.text).join('\n').trim();

    // Granular usage extraction from provider metadata (R3-04)
    const usage = resData.usageMetadata || {};
    let promptTokens = usage.promptTokenCount ?? null;
    let candidatesTokens = usage.candidatesTokenCount ?? null;
    let thoughtsTokens = usage.thoughtsTokenCount ?? 0;
    let cachedTokens = usage.cachedContentTokenCount ?? 0;
    let usageEstimationStatus = 'VERIFIED_PROVIDER_METADATA';

    if (promptTokens === null || candidatesTokens === null) {
      // R3-04: If provider metadata is absent, measure conservatively and record explicit status
      usageEstimationStatus = 'CONSERVATIVE_HEURISTIC_PROVIDER_METADATA_ABSENT';
      promptTokens = promptTokens ?? Math.max(150, Math.ceil(Buffer.byteLength(fullPrompt, 'utf8') / 2.8));
      candidatesTokens = candidatesTokens ?? Math.max(50, Math.ceil(Buffer.byteLength(responseText, 'utf8') / 2.8));
      thoughtsTokens = 0;
    }

    const totalTokens = usage.totalTokenCount ?? (promptTokens + candidatesTokens + thoughtsTokens);

    const trace = {
      episode_id: episodeId,
      model_provider: 'Google Gemini REST API (v1beta)',
      model_identity: this.model,
      sampling_parameters: {
        temperature: this.temperature,
        max_output_tokens: this.maxOutputTokens
      },
      timestamps: {
        started_at: startTime,
        completed_at: finishTime,
        latency_ms: latencyMs
      },
      http_status: response.status,
      attempt_count: attempts,
      internal_retries: attempts - 1,
      attempt_log: attemptLog,
      system_instruction_hash: systemInstruction ? crypto.createHash('sha256').update(systemInstruction).digest('hex') : null,
      request_token_budget: this.maxOutputTokens,
      provider_usage: {
        prompt_tokens: promptTokens,
        candidates_tokens: candidatesTokens,
        thoughts_tokens: thoughtsTokens,
        cached_tokens: cachedTokens,
        total_tokens: totalTokens,
        usage_estimation_status: usageEstimationStatus,
        service_tier: usage.serviceTier ?? 'standard'
      },
      finish_reason: candidate?.finishReason || 'STOP',
      raw_prompt: fullPrompt,
      raw_response: responseText
    };

    this.recordedTraces.push(trace);
    return {
      text: responseText,
      trace,
      usage: trace.provider_usage
    };
  }

  getTraces() {
    return this.recordedTraces;
  }
}
