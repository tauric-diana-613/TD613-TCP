(function (root) {
  'use strict';

  const core = root.TD613SafeHarborCore = root.TD613SafeHarborCore || {};

  function canonicalJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map((item) => canonicalJson(item)).join(',') + ']';
    return '{' + Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => JSON.stringify(key) + ':' + canonicalJson(value[key]))
      .join(',') + '}';
  }

  function canonicalPacketBody(packet) {
    const body = packet ? JSON.parse(JSON.stringify(packet)) : null;
    if (body && typeof body === 'object') {
      delete body.packet_hash_sha256;
      delete body.packet_checksum;
    }
    return canonicalJson(body);
  }

  core.canonical_json = canonicalJson;
  core.canonical_packet_body = canonicalPacketBody;
})(window);
