# TD613 · Sequence 5.5 · Sacrificial Pilot V2 Remote Execution Protocol

Status: AUTHORIZED FOR FRESH 25-UNIT PILOT ONLY  
Episode: `EPISODE_SACRIFICIAL_PILOT_V2`

This protocol continues Sequence 5.5. Sequence 6 remains separately staged and must not ingest results until the Pilot V2 gate is adjudicated.

## Receiver

- Model: `gemini-3.8-flash`
- Thinking level: `medium`
- Sampling parameters: not set by protocol
- Response MIME type: `application/json`
- Tools: none
- Credential source: Vercel Preview `GEMINI_API_KEY`
- Expected credential fingerprint: `51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39`

Google's current Gemini 3.8 migration guidance requires removal of legacy sampling parameters such as temperature/top-p/top-k and supports explicit `thinkingLevel`. The 3.5 harness is retained only as historical evidence.

## Hard preview membrane

The temporary research route must reject execution unless:
1. `VERCEL_ENV === "preview"`;
2. `VERCEL_GIT_COMMIT_REF === "research/sequence-5.5-amari-closure-20261006"` when that variable is available;
3. the active `GEMINI_API_KEY` SHA-256 fingerprint matches the bound fingerprint;
4. the requested unit appears in the frozen 25-unit pilot manifest;
5. no BAT fixture is requested.

## Freshness

No artifact from `13-RAW_PILOT_OUTPUTS` or `13-RAW_PILOT_RECEIPTS` may satisfy Pilot V2.

Pilot V2 writes to a distinct namespace:
- `19-PILOT_V2_RAW_OUTPUTS/`
- `19-PILOT_V2_RECEIPTS/`

## Chronology

`PILOT_V2_EXECUTION → PILOT_V2_RAW_FREEZE → PILOT_KEY_REVEAL → PILOT_V2_SCORING → PILOT_DIFFICULTY_GATE_ADJUDICATION`

No scoring or key reveal before the remote raw freeze commit.

## Retry law

At most 3 attempts per unit. Every failed provider response is preserved. No attempt overwrites history.

## Main battery

`BAT_EXECUTION_COUNT = 0` until the pilot gate is explicitly adjudicated PASS.

⟐
