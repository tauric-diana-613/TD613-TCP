// TD613 Experiment B · Authorized Live Model Provider Client
// Interacts with Google Gemini API via official REST transport.
// Records exact timestamps, raw prompt/response traces, token usage metadata, and sampling parameters.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { geminiGenerateContentUrl, geminiRequestHeaders, observeGeminiQuota } from '../../../../server/gemini-provider-transport.js';

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
    this.recordedTraces = [];
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  async invoke({ systemInstruction = '', prompt = '', context = '', episodeId = 'ep-0' }) {
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

    while (attempts < maxAttempts) {
      attempts++;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: geminiRequestHeaders(this.apiKey),
          body: JSON.stringify(requestBody)
        });

        resData = await response.json();

        if (response.status === 200) {
          break;
        } else if (response.status === 429 || response.status >= 500) {
          const quota = observeGeminiQuota(resData, { model: this.model, response });
          const delay = Math.max(2000 * attempts, 2000);
          console.warn(`[GeminiLiveClient] HTTP ${response.status} on attempt ${attempts}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw new Error(`Gemini API Error (HTTP ${response.status}): ${JSON.stringify(resData)}`);
        }
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 2000 * attempts));
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
      system_instruction_hash: systemInstruction ? crypto.createHash('sha256').update(systemInstruction).digest('hex') : null,
      request_token_budget: this.maxOutputTokens,
      provider_usage: {
        prompt_tokens: resData.usageMetadata?.promptTokenCount ?? null,
        candidates_tokens: resData.usageMetadata?.candidatesTokenCount ?? null,
        thoughts_tokens: resData.usageMetadata?.thoughtsTokenCount ?? null,
        total_tokens: resData.usageMetadata?.totalTokenCount ?? null,
        service_tier: resData.usageMetadata?.serviceTier ?? 'standard'
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
