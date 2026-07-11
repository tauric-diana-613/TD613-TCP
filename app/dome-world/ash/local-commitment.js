/**
 * TD613 Ash Local Commitment Kernel
 *
 * Generates an L1 browser-local SHA-256 commitment from exact file-picker
 * bytes. This module performs no network operation and returns no raw bytes.
 *
 * It does not establish possession, authorship, authenticity, identity, truth,
 * or trusted time. JavaScript cannot guarantee immediate memory erasure.
 */

export const LOCAL_COMMITMENT_SCHEMA = "td613.ash.local-commitment/v0.7";
export const L0_METADATA_ONLY = "L0_METADATA_ONLY";
export const L1_BROWSER_LOCAL_ARTIFACT_DIGEST =
  "L1_BROWSER_LOCAL_ARTIFACT_DIGEST";
export const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;

function requireWebCrypto() {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle || typeof subtle.digest !== "function") {
    throw new Error(
      "Web Crypto SHA-256 is unavailable. Use an HTTPS or localhost browser context.",
    );
  }
  return subtle;
}

function validateFileLike(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new TypeError(
      "Ash local commitment requires a browser File or file-like object with arrayBuffer().",
    );
  }

  const byteLength = Number(file.size);
  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    throw new TypeError("File byte length is invalid or unsupported.");
  }

  return byteLength;
}

function bytesToHex(buffer) {
  return Array.from(
    new Uint8Array(buffer),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

function finiteLastModified(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function generateLocalCommitment(
  file,
  { maxBytes = DEFAULT_MAX_BYTES } = {},
) {
  const byteLength = validateFileLike(file);

  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new TypeError("Local commitment maxBytes must be a non-negative safe integer.");
  }

  if (byteLength > maxBytes) {
    throw new RangeError(
      `File exceeds the Phase 1 browser-local hashing ceiling of ${maxBytes} bytes.`,
    );
  }

  const subtle = requireWebCrypto();
  let artifactBuffer = null;

  try {
    artifactBuffer = await file.arrayBuffer();
    if (!(artifactBuffer instanceof ArrayBuffer)) {
      throw new TypeError("file.arrayBuffer() did not return an ArrayBuffer.");
    }
    if (artifactBuffer.byteLength !== byteLength) {
      throw new Error(
        "File byte length changed while the local commitment was being generated.",
      );
    }

    const digestBuffer = await subtle.digest("SHA-256", artifactBuffer);
    const artifactDigest = `sha256:${bytesToHex(digestBuffer)}`;

    return {
      schema: LOCAL_COMMITMENT_SCHEMA,
      assurance_class: L1_BROWSER_LOCAL_ARTIFACT_DIGEST,
      digest_algorithm: "SHA-256",
      artifact_digest: artifactDigest,
      byte_length: byteLength,
      media_type: file.type || "application/octet-stream",
      file_name_claim: typeof file.name === "string" && file.name
        ? file.name
        : null,
      last_modified_claim: finiteLastModified(file.lastModified),
      hash_input: "exact-file-picker-bytes",
      hash_execution: "browser-local",
      execution_attestation: "client-generated-not-independently-attested",
      network_operation_performed_by_module: false,
      raw_bytes_returned: false,
      raw_bytes_persisted_by_module: false,
      best_effort_buffer_overwrite: true,
      memory_erasure_guaranteed: false,
      does_not_establish: [
        "possession",
        "authorship",
        "authenticity",
        "identity",
        "truth",
        "trusted-time",
      ],
    };
  } finally {
    if (artifactBuffer instanceof ArrayBuffer) {
      // Best effort only. The JavaScript engine or cryptographic
      // implementation may retain internal copies outside application control.
      new Uint8Array(artifactBuffer).fill(0);
    }
    artifactBuffer = null;
  }
}
