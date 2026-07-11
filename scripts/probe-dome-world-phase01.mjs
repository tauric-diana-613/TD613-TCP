#!/usr/bin/env node

const base = (process.env.TD613_DOME_BASE_URL || "https://td613.com").replace(/\/+$/, "");
const timeoutMs = Number(process.env.TD613_DOME_PROBE_TIMEOUT_MS || 15000);

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(base + path, {
      ...options,
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.ok === false) {
      throw new Error(
        `${path} returned ${response.status}: ${JSON.stringify(body)}`,
      );
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ping = await request("/api/dome-world/ping");
const readiness = await request("/api/dome-world/readiness");

assert(ping.operation === "ping", "ping operation mismatch");
assert(readiness.operation === "readiness", "readiness operation mismatch");
assert(
  readiness.ashLocalCommitment?.metadataDigestFallback === false,
  "deployment still reports metadata digest fallback",
);

const l0Envelope = {
  operation: "ash-custody-register",
  traceId: `phase01_probe_${Date.now().toString(36)}`,
  apertureContext: {
    version: "v3.0-alpha",
    schema: "td613-aperture/v3.0-alpha",
    observedRegime: "PRCS-A",
  },
  payload: {
    sourceEnvironment: "manual",
    sourceLocator: { label: "phase-01 deployment probe" },
    artifactMetadata: {
      mediaType: "application/octet-stream",
      byteLength: 0,
      artifactDigest: null,
      commitmentAssurance: "L0_METADATA_ONLY",
      localCommitment: null,
      hashScope: "unavailable",
    },
    privacyBoundary: { public_weather_only: true },
    ashPosture: {
      roomRoute: "private-sense-only",
      recommendedTending: ["private-hold", "ash-receipt"],
    },
  },
};

const registration = await request("/api/dome-world/ash-custody-register", {
  method: "POST",
  body: JSON.stringify(l0Envelope),
});
const result = registration.result || registration;
const metadata = result.manifest?.artifact_metadata || {};

assert(result.assurance_class === "L0_METADATA_ONLY", "L0 assurance mismatch");
assert(metadata.artifact_digest === null, "server manufactured artifact digest");
assert(metadata.content_hash === null, "server manufactured content hash alias");
assert(metadata.hash_scope === "unavailable", "L0 hash scope mismatch");
assert(result.public_surface?.content_exported === false, "content export boundary failed");

console.log(JSON.stringify({
  status: "PASS",
  base,
  ping: ping.operation,
  readiness: readiness.operation,
  assurance: result.assurance_class,
  metadata_digest_fallback: readiness.ashLocalCommitment.metadataDigestFallback,
  seal: "⟐",
}, null, 2));
