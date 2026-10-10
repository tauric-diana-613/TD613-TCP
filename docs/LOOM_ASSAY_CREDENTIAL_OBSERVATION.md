# Assay credential observation

`GET /api/khonapolit?operation=loom-assay-credential` observes the current
server-side `GEMINI_API_KEY` SHA-256 under the existing assay Bearer capability.
It requires `x-td613-expected-source` to equal the deployed source commit.
An optional `x-td613-expected-credential-sha256` compares an independently known
fingerprint. An unequal fingerprint returns HTTP 409 and an explicit HOLD.

The response includes the observed key fingerprint, source commit, declared
Vercel environment, observation time and zero provider/ledger operation counts.
It releases no raw API key, caller capability or workload token. Responses are
uncacheable. Anonymous, wrong-capability and wrong-source requests disclose no
fingerprint. The production wrapper uses the existing approved activation file
and rejects a conflicting runtime capability digest.

Fingerprint equality establishes key equality only. It does not identify the
owning Google project or establish paid billing, quota entitlement or provider
capacity. `google_project_id` remains null and `billing_tier` remains UNVERIFIED.
Google account access is unnecessary for this observation. Matching the result
to a paid key still requires an independent operator-held key/project record.

This operation performs no model listing, generation, retry, reservation,
completion or custody admission. Held runs stay held. It does not alter prompt
bytes, generation settings, trial order or the current acquisition ledger.
The existing assay handler's access check is exported for exact reuse; its
existing execution accepts the optional expected-fingerprint header too. A wrong
or malformed value holds before any ledger inspection, reservation or provider
contact. A completed attempt records `provider_credential_sha256` for the key
actually used. Legacy requests without the header preserve their behavior; a
future fresh freeze should require it in its caller. These checks add no bytes
to the provider prompt or generation envelope.

The diagnostic is a source candidate until exact-head validation and the
governed issue #405 release workflow complete. A new release changes the source
commit; any future acquisition needs a fresh freeze bound to that release.

Local verification: `node --test tests/loom-assay-credential.test.mjs`.
