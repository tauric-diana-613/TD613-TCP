# Registered source control · one-call acquisition

Run ID: `portable-loom-registered-source-control-20261011-r01`  
State before dispatch: `AUTHORIZED_NOT_EXECUTED`  
Provider: Gemini Developer API, `gemini-3.8-flash`  
Trial: `FIRST_CONFIGURED_RECEIVER-R01-1`, turn 0 only  
Source artifact: `PROMPT.txt` (`e139bb196433a873df4a886ac96fc31391f7e2474b3fc779b9fd6b6adf04aa64`)

This is a fresh single-task positive control with one origin-registered practice source. The source is a local practice datum; no external-world provenance is claimed. The request, policy and provider body are bound to the exact deployed source commit before enrollment. The caller uses the `loom-assay` route only. One reservation is capped at USD 0.25; the run has one call, no retry, no tools, no retrieval and no custody admission.

After the exact reviewed source is deployed and the one run is enrolled, execute once:

```sh
node research/portable-loom-registered-source-control-20261011/run-one.mjs POLICY.json NEW_CAPTURE_DIRECTORY
```

The output directory must not exist. The runner makes one HTTP request and does not retry or resume. Its capture remains `CAPTURED_NOT_ADMITTED`; structural receipt inspection and separate semantic review are still required. No result can establish hidden model source use, external source authentication, general reliability or a causal difference from A20.
