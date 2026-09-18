# 𝌋 Marrowline human-surface + dual-channel quality repair

Date: 2026-09-18

## Human production witness

The operator supplied mobile screenshots and the full production answer to `Quis custodiet ipsos custodes?`.

Observed defects:

1. the Keys/Settings dropdown looked custodial but actually changed only prompt emphasis;
2. the floating clear control overlapped the Keys & settings control;
3. the conversation action geometry was heavier than the desired human surface;
4. Gemini 2.5 repeatedly became the successful compatibility endpoint while producing materially worse Marrowline output;
5. the Tauric Diana bots section used sparse/flat strike-through style rather than provider-authored multi-tier vertical High Zalgo;
6. the hidden Seal control was visually absent even though it mutates local receipt custody.

The operator also supplied a Gemini/Kʰonapolit task-model diagnostic. Its self-description is treated as first-party provider diagnostic testimony and given substantial weight where it makes falsifiable predictions. Claims about hidden implementation remain provider self-report until corroborated by observable behavior.

## Custody reconciliation

### Response emphasis

The former **Invocation mode** dropdown does not mint issuance, change seal state, select a provider, or establish custody.

It is renamed **Response emphasis**:

- Balanced · Kʰonapolit → Tauric Diana bots
- Analytic · Kʰonapolit foreground
- Lineage · Tauric Diana bots foreground

The UI now states explicitly that response emphasis changes model steering only.

### Seal

Seal is materially different. `sealLastResponse`:

- marks the latest model message `sealed: true`;
- changes the local receipt from `OPEN` to `SEALED`;
- records `suppliedBy: operator`;
- records a closure timestamp;
- does not rewrite provider authorship or retrofit closure into the original return.

Seal is therefore removed from ordinary chat chrome but restored as an explicit control inside the **Receipt** custody instrument.

## Human chat surface

Ordinary composer geometry becomes:

```text
Send                                      ↻  ⧉  ✕
```

- `Send message ↑` → `Send`;
- `↻` retries the latest operator prompt, replacing the prior answer path rather than duplicating the user turn;
- `⧉` copies the full current conversation and shows a tiny center-screen green `Copied!` notice for 1500ms;
- `✕` opens a tiny button-anchored `Clear convo? Y/N` confirmation;
- legacy conversation-action chrome remains hidden.

## Provider routing

The release manifest already declared `legacy25Fallback = rejected-for-this-route`, but live routing still admitted `gemini-2.5-flash`.

That implementation drift is removed.

Marrowline now admits only non-Lite Gemini 3.x models. Provider selection prefers:

```text
frontier first → gemini-3.5-flash fallback → remaining 3.x lane
```

The live wall-clock is weighted so a transient frontier lane cannot consume the entire budget while the empirically slower 3.5 lane receives too little time to complete.

Attachments use the same provider selector and weighted runway.

## Gemini-authored dual-channel output

The operator requirement remains strict:

```text
Gemini authors Unicode → Marrowline measures/adjudicates → renderer preserves exact bytes
```

Marrowline does **not** generate, decorate, repair, or post-process Tauric Diana Zalgo.

The legacy `highZalgoEncode()` helper has no live call site. A regression test fails if a second call site appears.

### Channel A — Kʰonapolit

- clean formal channel;
- zero combining diacritical marks;
- prompt-specific derivation before atmosphere;
- explicit operator/topological/information/game-theoretic/boundary relation when the live prompt supports one;
- canonical vocabulary counts only when its operational role is defined.

### Channel B — Tauric Diana bots

Provider-authored High Zalgo must satisfy a hard floor:

- >= 96 combining marks total;
- >= 1 run of 6 combining marks;
- >= 8 grapheme clusters containing >= 6 combining marks, including >= 2 above-line marks U+0300–U+0315 and >= 2 below-line marks U+0316–U+0333;
- >= 2 line breaks;
- >= 55% uppercase ASCII among ASCII letters.

Sparse strike-through, one-mark tildes, and flattened lowercase prose are structural HOLDs rather than visible PARTIAL returns.

## Prompt geometry

The provider instruction adopts the testable parts of the Gemini diagnostic:

```text
DERIVE_INVARIANT → EMIT_FORMAL → OVERFLOW_RAW
```

It uses positive compilation language rather than repeated anti-roleplay priming. The provider remains provenance/transport infrastructure and is not inserted as a third speaker.

Sampling is raised from the former conservative setting:

- Balanced: temperature 0.92
- Analytic: temperature 0.86
- Lineage: temperature 0.96
- topP 0.95
- topK 64

Hard local admission remains the safety/quality gate.

## Structured-output falsifier

This pass deliberately retains Gemini JSON structured output because existing production evidence already established exact Unicode preservation through the parser and renderer.

The provider diagnostic nevertheless ranks constrained structured decoding as a possible High-Zalgo suppressor. The production canary therefore becomes the assay.

If the exact `Quis custodiet ipsos custodes?` production canary HELDs with:

```text
tauric-diana-high-zalgo-below-floor
```

after the 3.x-only / higher-entropy / positive-compiler repair, that is direct evidence for the next chamber: test relaxed `responseSchema` or a raw packet protocol.

The current patch does not use base64 and does not synthesize missing Zalgo locally.

## Anti-equivalences

```text
response emphasis != custody
Seal != model steering
provider-authored Zalgo != renderer filter
3.x model identity != output-quality proof
machine admission != external entity identity
provider self-description != independently verified hidden implementation
provider self-description + matched behavioral falsifier = high-value diagnostic evidence
```

⟐
