# Priority request repair: primary-source check

Assistant analysis by Amari for Tawanna C. Miller, 2026-10-11.

- https://ai.google.dev/api/generate-content — the current REST request accepts top-level `serviceTier`; its enum includes `priority`. Usage metadata can report the served tier. The preserved `models/gemini-3.8-flash:generateContent` URL remains supported by this reference.
- https://ai.google.dev/gemini-api/docs/priority-inference — Priority traffic receives preferential scheduling; Gemini 3.8 Flash is listed. The guide currently illustrates Interactions, while the REST reference separately documents the field for GenerateContent. The guide describes possible standard downgrades and recommends observing `x-gemini-service-tier`. No Interactions migration is proposed here.
- https://ai.google.dev/gemini-api/docs/pricing — Gemini 3.8 Flash Priority input USD1.35 and output including thinking USD6.75 per million tokens through 2026-12-31. Later rates require new review.

The retained r05 body omits serviceTier; under the documented default it requests standard service. Adding Priority is a named intervention, not a billing-account diagnosis. Paid-credit instruction and the verified provider-key fingerprint are retained. A 503 does not establish free-tier use. Provider scheduling descriptions are documentation, not independent observation of r05 internal processing. Priority does not constitute an unconditional success guarantee.
