# Hush Known Failure Modes

## Blank output after hard block

Symptom: output area stays empty or accept remains unavailable. Operator action: review hard block and use synthetic retry.

## Target register not visible

Symptom: target-register report shows `target-register-not-visible`. Operator action: keep the run in test flight and review target mask fit.

## Target register overcooked

Symptom: output adds too many target-register features. Operator action: switch to preserve or clear-with-cadence mode.

## Event shape lost

Symptom: IDs survive but timing, copy, footer, version, or sequence relations vanish. Operator action: do not export.

## Certainty inflated

Symptom: maybe/idk/could/may becomes proves/definitely/intentional. Operator action: reject output.

## Register feature erased

Symptom: preserve-source mode drops dialect, chatspeak, code-switch, hedge, or affect signals. Operator action: use Phase 27 preservation masks.

## Accept paused by controller

Symptom: Accept pauses after Hush release. Operator action: analyze again; developer action: verify Phase 26.1 accept-gate patch.
