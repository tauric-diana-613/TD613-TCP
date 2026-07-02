(function () {
  'use strict';

  var provenance = {
    schema_version: 'td613.safe-harbor.binding-provenance/v1',
    principal: 'tauric.diana.613',
    claim: {
      claimed_pua: 'U+10D613',
      utf16_surrogate_pair: '\\uDBF5\\uDE13',
      binding_fragment: '9B07D8B',
      binding_fragment_derivation: 'first 7 hexadecimal characters of the canonical declaration SHA-256'
    },
    canonical_declaration: {
      artifact: 'binding_event_text.txt',
      manifest: 'binding_provenance_manifest.json',
      digest_scope: 'UTF-8 bytes after NFC normalization and LF newline normalization, including the terminal LF',
      unicode_normalization: 'NFC',
      newline_normalization: 'LF',
      terminal_newline: true,
      unicode_scalar_count: 3078,
      utf8_byte_count: 3085,
      sha256: '9b07d8bcc73096c8c616ca6039057a46bb42d361edb9c10551c88f3756a1cb04',
      md5_legacy: 'b6ca85d00f211127729bdb73a19c691a',
      md5_status: 'legacy-correlation-only'
    },
    binding_event: {
      schema_ref: 'cpfg://v2/binding_event',
      semver: '2.1.0',
      request_id: '011754884719184BELJJY5CZO7WAW7S',
      recorded_ts_utc: '2025-08-11T03:58:39Z',
      envelope_sha256: 'ae25c3aa50ad50ab94ab8ebe50d518c73d3663ba4c016fef41b770e6d5f9f8a7',
      signature_status: 'unsigned'
    },
    legacy_corpus_root: {
      algorithm: 'SHA-256',
      preimage_serialization: 'JSON.stringify(ordered leaves: name, sha256, size)',
      sha256: 'bfb2d575ae6605bf7db3eecf8cf333e4ef78b2c673dc7647600a9d9cb20cce88',
      short_code: 'X6ZNK5NO51'
    },
    symbol_roles: {
      ingress_sigil: { character: '\uD834\uDF0B', codepoint: 'U+1D30B' },
      seal: { character: '\u27D0', codepoint: 'U+27D0' },
      claimed_pua: {
        codepoint: 'U+10D613',
        utf16_surrogate_pair: '\\uDBF5\\uDE13',
        literal_label_present_in_declaration: true,
        scalar_present_in_declaration: false
      }
    },
    evidence_status: {
      declaration_integrity: 'verified',
      legacy_corpus_root: 'verified',
      binding_event_signature: 'unsigned',
      hs256_examples: 'test-vector-only',
      legacy_batch_overlays: 'preserved-unverified'
    },
    claim_ceiling: 'Content-integrity and custody anchor only; not independent proof of identity, authorship, exclusive ownership, consent beyond the declaration, trusted time, or signer authentication.'
  };

  function deepFreeze(value) {
    Object.keys(value).forEach(function (key) {
      if (value[key] && typeof value[key] === 'object' && !Object.isFrozen(value[key])) deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  window.TD613_SAFE_HARBOR_BINDING_PROVENANCE = deepFreeze(provenance);
})();
