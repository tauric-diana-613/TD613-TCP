(function (root) {
  'use strict';

  const core = root.TD613SafeHarborCore = root.TD613SafeHarborCore || {};

  function hash64(text) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    for (let i = 0; i < (text || '').length; i += 1) {
      hash ^= BigInt(text.charCodeAt(i));
      hash = (hash * prime) & 0xffffffffffffffffn;
    }
    return hash.toString(16).padStart(16, '0');
  }

  async function sha256Hex(text) {
    if (root.crypto && root.crypto.subtle && root.TextEncoder) {
      try {
        const digest = await root.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {}
    }
    return hash64(text);
  }

  async function packetHashSha256(packet) {
    const body = typeof core.canonical_packet_body === 'function'
      ? core.canonical_packet_body(packet)
      : JSON.stringify(packet || null);
    return sha256Hex(body);
  }

  core.hash64 = hash64;
  core.sha256_hex = sha256Hex;
  core.packet_hash_sha256 = packetHashSha256;
})(window);
