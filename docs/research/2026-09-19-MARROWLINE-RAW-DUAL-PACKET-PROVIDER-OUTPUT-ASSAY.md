# 𝌋 Marrowline raw dual-packet provider-output assay

Date: 2026-09-18 / 2026-09-19 UTC boundary

## Production falsifier

Vercel Operator Release #1169 / run `35415259454` deployed exact source `de364597bd4302dfb5618d3c40862502259ef07c`, passed source receipt, byte parity, stale-rollback stability, A14/Archive, and Ash lifecycle, then HELD only at the live Marrowline AI witness.

Observed Marrowline route:

```text
gemini-3.8-flash -> 408 timeout
gemini-3.5-flash -> 503
gemini-3.6-flash -> 503
gemini-3.7-flash -> transport-successful return -> local admission HELD
reason = tauric-diana-high-zalgo-below-floor
```

Independent Loom in the same episode returned HTTP 200 through Gemini 3.5.

This is the first production episode after hard orthographic admission in which a Gemini 3.x Marrowline answer reached local output admission and failed specifically on the provider-authored Tauric Diana vertical-Zalgo floor.

## Provider diagnostic prediction now exercised

The earlier Gemini/Kʰonapolit diagnostic predicted that constrained structured-output decoding could prune or flatten high-entropy combining-mark sequences even when the semantic content survived.

That prediction is now sufficiently matched by a production falsifier to justify a bounded transport experiment:

```text
structured JSON generation pressure
    ↓ remove
raw two-packet text generation
    ↓ preserve
hard local dual-channel admission
    ↓ unchanged
provider-authored Unicode
    ↓ exact payload preservation
```

This does not establish a hidden provider mechanism beyond the observable response behavior. It does establish that the next lawful experiment is to remove Marrowline's structured response schema while leaving the quality gate untouched.

## Repair

The live Gemini request no longer supplies:

```text
responseMimeType = application/json
responseSchema = KHONAPOLIT_RELAY_RESPONSE_SCHEMA
```

Instead the provider receives a raw transport contract:

```text
<<<PACKET_A_FORMAL_AUDIT>>>
Kʰonapolit
[clean formal derivation]
<<<PACKET_A_END>>>
<<<PACKET_B_STRESS_TELEMETRY>>>
Tauric Diana bots
[provider-authored vertical-Zalgo stress payload]
<<<PACKET_B_END>>>
```

Marrowline removes only those four ASCII transport delimiters. It does not add, replace, normalize, decorate, or repair any payload combining marks.

The exact packet payloads are concatenated for the existing human conversation surface. The same hard admission laws remain:

- Kʰonapolit: zero combining marks;
- Tauric Diana bots: >=96 combining marks;
- >=1 six-mark run;
- >=8 dense above/below vertical clusters;
- >=2 line breaks;
- uppercase-dominant stress channel;
- no duplicated transmission;
- no dense canonical recitation;
- no local Zalgo post-processing.

Legacy JSON parsing remains readable for archived fixtures and compatibility tests, but it is no longer the live provider-generation contract.

## Falsifier

The next production canary still asks:

`Quis custodiet ipsos custodes?`

If a transport-successful Gemini 3.x raw-packet return again reaches admission and fails `tauric-diana-high-zalgo-below-floor`, then structured JSON decoding was not sufficient to explain the flattening and the next assay must move to model/version/context or token-pressure hypotheses rather than adding a local filter.

```text
provider-authored Zalgo != local Zalgo filter
transport delimiter removal != payload mutation
raw provider output != admission relaxation
```

Sealed ⟐
