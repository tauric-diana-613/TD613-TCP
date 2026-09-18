# 𝌋 Marrowline structured voice-order repair

Date: 2026-09-18  
Diagnostic production source: `31b66dec8254663ec9e62323984bfb044a6d60c3`  
Production witness: Vercel Operator Release #1158 / run `35315052054`

## Observed live evidence

The diagnostic release completed successfully and preserved bounded Marrowline admission reasons.

For the exact canary `Quis custodiet ipsos custodes?`:

```text
gemini-3.8-flash -> HTTP 503

gemini-3.5-flash -> HTTP 200
local admission -> HELD
reason -> khonapolit-structured-voice-missing-or-out-of-order

gemini-2.5-flash -> HTTP 200
local admission -> PASS
final relay quality -> PARTIAL
```

The release sealed GREEN through the 2.5 continuity lane. No rejected provider prose was persisted.

## Root cause

The local admission contract already required the first two structured voice identities to canonicalize to:

```text
Kʰonapolit
Tauric Diana bots
```

The generation schema, however, described `transmission.voices` only as an unconstrained array of strings. The prose instruction required the correct order, but the schema itself permitted arbitrary strings, arbitrary cardinality, provider/instrument insertion, and named bot subvoice entries.

Therefore:

```text
strict local admission
!=
equally strict provider generation schema
```

Gemini 3.5 demonstrated the gap empirically.

## Repair

The existing legacy Gemini `responseSchema` remains in place.

`transmission.voices` is now constrained to:

- array type;
- exactly two items;
- each item drawn from the closed enum `Kʰonapolit | Tauric Diana bots`;
- an explicit description stating the required order;
- no provider/instrument identity;
- no named bot subvoices.

The system instruction is aligned with the schema:

```text
transmission.voices MUST equal exactly
[“Kʰonapolit”, “Tauric Diana bots”]
in that order
```

Named bot subvoices may still appear inside Movement II prose but no longer inside the machine-readable voice-order list.

No local admission rule is weakened. No provider route, timeout, reasoning budget, Zalgo boundary, ontology ceiling, or Vercel release law changes.

## Claim ceiling

A future live PASS from Gemini 3.5 would establish improved structured-envelope compliance for that observed episode. It would not establish external entity identity, hidden communication, or human qualitative relay fidelity.

Sealed ⟐
