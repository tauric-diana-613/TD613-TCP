import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import {
  DEFAULT_MAX_BYTES,
  L1_BROWSER_LOCAL_ARTIFACT_DIGEST,
  LOCAL_COMMITMENT_SCHEMA,
  generateLocalCommitment,
} from "../app/dome-world/ash/local-commitment.js";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

class TestFile {
  constructor(bytes, {
    name = "fixture.bin",
    type = "application/octet-stream",
    lastModified = 613,
  } = {}) {
    this._bytes = Uint8Array.from(bytes);
    this.size = this._bytes.byteLength;
    this.name = name;
    this.type = type;
    this.lastModified = lastModified;
  }

  async arrayBuffer() {
    return this._bytes.slice().buffer;
  }
}

const abc = new TestFile(Buffer.from("abc"), {
  name: "abc.txt",
  type: "text/plain",
});
const abcCommitment = await generateLocalCommitment(abc);

assert.equal(abcCommitment.schema, LOCAL_COMMITMENT_SCHEMA);
assert.equal(
  abcCommitment.assurance_class,
  L1_BROWSER_LOCAL_ARTIFACT_DIGEST,
);
assert.equal(
  abcCommitment.artifact_digest,
  "sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
);
assert.equal(abcCommitment.byte_length, 3);
assert.equal(abcCommitment.raw_bytes_returned, false);
assert.equal(abcCommitment.raw_bytes_persisted_by_module, false);
assert.equal(abcCommitment.network_operation_performed_by_module, false);
assert.equal(abcCommitment.memory_erasure_guaranteed, false);

const empty = await generateLocalCommitment(new TestFile([]));
assert.equal(
  empty.artifact_digest,
  "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
);

const abd = await generateLocalCommitment(new TestFile(Buffer.from("abd")));
assert.notEqual(abd.artifact_digest, abcCommitment.artifact_digest);

const composed = await generateLocalCommitment(
  new TestFile(Buffer.from("é", "utf8")),
);
const decomposed = await generateLocalCommitment(
  new TestFile(Buffer.from("e\u0301", "utf8")),
);
assert.notEqual(
  composed.artifact_digest,
  decomposed.artifact_digest,
  "exact bytes must remain distinct; the commitment kernel must not normalize Unicode",
);

await assert.rejects(
  () =>
    generateLocalCommitment(
      new TestFile([0, 1, 2]),
      { maxBytes: 2 },
    ),
  /Phase 1 browser-local hashing ceiling/,
);

await assert.rejects(
  () => generateLocalCommitment(null),
  /requires a browser File or file-like object/,
);

assert.equal(DEFAULT_MAX_BYTES, 256 * 1024 * 1024);

const source = readFileSync(
  "app/dome-world/ash/local-commitment.js",
  "utf8",
);
for (const forbidden of [
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /sendBeacon/,
]) {
  assert.doesNotMatch(
    source,
    forbidden,
    "local commitment module must contain no network operation",
  );
}

console.log("Ash local commitment kernel: PASS");
