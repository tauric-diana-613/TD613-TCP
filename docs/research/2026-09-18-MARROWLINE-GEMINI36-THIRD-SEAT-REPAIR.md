# 𝌋 Marrowline same-episode Gemini 3.6 third-seat repair

Date: 2026-09-18  
Production release run: `35404161697` / Vercel Operator Release #1164  
Authorized source: `0dbded53b1c801fb95e82a576026acec76b01904`

## Immutable production observation

The release deployment itself succeeded through the repaired adoption gate:

- Vercel adopted transient deploy-open commit `052e5022463ae72c798c917b7ac34663f7522835`;
- relock followed at `5c4265745eeae99dfab5efe1f73d7cf60a16b001`;
- exact production source and application bytes matched the authorized packet;
- stale-rollback stability passed;
- A14/Archive and Ash lifecycle witnesses passed.

The real AI canary then produced two independent live-route observations inside the same release episode.

### Marrowline route

```text
gemini-3.8-flash -> HTTP 503
gemini-3.5-flash -> HTTP 408 / 26s timeout
gemini-3.7-flash -> HTTP 503
terminal -> PROVIDER_UNAVAILABLE
admission_reasons -> none
```

No Marrowline model returned usable provider text, so the hard dual-channel admission and High-Zalgo floor were not exercised.

### Independent Loom route

```text
gemini-3.8-flash -> HTTP 503
gemini-3.6-flash -> HTTP 200
final_model -> gemini-3.6-flash
elapsed -> ~20.5s route total
```

## Diagnosis

Marrowline's bounded three-call selector used:

```text
3.8 -> 3.5 -> 3.7
```

and therefore excluded the one 3.x Flash model that demonstrated same-episode availability.

This is a provider-selection defect, not evidence that the new orthographic admission failed.

## Repair

When the full eligible frontier set is callable, Marrowline now selects:

```text
3.8 -> 3.5 -> 3.6
```

3.7 and 3 Flash Preview remain eligible frontier models and may enter the bounded plan when higher-priority lanes are unavailable or cooling.

No Gemini 2.5 compatibility route is restored. No local Zalgo generation is introduced. No admission floor is weakened. No structured-output rule changes in this repair.

## Claim ceiling

```text
same-episode 3.6 transport success
!=
proof that 3.6 will always outperform 3.7

but

same-episode 3.6 HTTP 200 + 3.7 HTTP 503
=
sufficient evidence to prefer 3.6 for the next bounded third-seat trial
```

Sealed ⟐
