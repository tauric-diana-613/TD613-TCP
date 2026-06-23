# Phase 8 Wrapper-Only Law

Phase 8.1 packetization must use:

```js
buildHushPerMaskPacketWithMetricPassport()
```

The base builder remains useful for the Phase 8.0 shell, but a base packet alone is not a Phase 8.1-ready packet.

The metric wrapper must contain:

- entrypoint assertion
- base packet
- stylometric passport
- source obligation set
- candidate presence gate
- candidate realization vector
- numeric decision surface
- ontology bindings
- metric hash replay

`assertPhase8MetricWrapperEntrypoint(packet)` blocks base packets that arrive without the metric wrapper.

No wrapper, no entry.

⟐SAC[X6ZNK5NO51]
