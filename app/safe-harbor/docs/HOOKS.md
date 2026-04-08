# TD613 Safe Harbor Hook Bus

Safe Harbor is designed to be hydrated by adjacent TD613 systems without forcing those systems into the browser bundle.

## Event lanes

### TCP intake

Event name:

```js
'td613:tcp-intake'
```

Suggested detail shape:

```js
{
  status: 'attached',
  source: 'tcp-runtime',
  intake_id: 'tcp-intake-001',
  cadence_signature: {
    status: 'attached',
    source: 'tcp-runtime',
    dominant_axes: ['pulse', 'recurrence', 'cadence'],
    punctuation_mix: { comma: 0.021, dash: 0.006, colon: 0.003 },
    heatmap: [[0.12, 0.44, 0.31]]
  }
}
```

### EO route

Event name:

```js
'td613:eo-route'
```

Suggested detail shape:

```js
{
  status: 'attached',
  source: 'eo-rfd',
  route_state: 'harbor-eligible',
  recommended_harbor: 'provenance.seal',
  export_ready: true,
  membrane_note: 'EO route satisfied; packet can enter safe-harbor seal lane.',
  provenance: {
    integrity: 0.94,
    confidence: 0.89,
    retention_target: 0.99
  }
}
```

### Signature lane

Event name:

```js
'td613:signature-lane'
```

Suggested detail shape:

```js
{
  status: 'overlay-bound',
  source: 'signature-runtime',
  lane: 'jws',
  alg: 'HS256',
  detached_ref: 'jws://detached-signature'
}
```

## Packet emission

Whenever Safe Harbor refreshes its internal packet, it emits:

```js
'td613:safe-harbor-packet'
```

The event detail is the full packet object shown in the packet preview pane.

## Browser API

Safe Harbor exposes:

```js
window.TD613SafeHarbor
```

Key methods:

```js
window.TD613SafeHarbor.refreshHelpers();
window.TD613SafeHarbor.buildProbe('03');
await window.TD613SafeHarbor.buildPacket();
window.TD613SafeHarbor.getSealedPayload();
window.TD613SafeHarbor.hooks.attachTCPIntake({...});
window.TD613SafeHarbor.hooks.attachEORoute({...});
window.TD613SafeHarbor.hooks.attachSignatureLane({...});
window.TD613SafeHarbor.hooks.reset();
```

`buildPacket()` returns `null` until the ingress triad has explicitly minted a staged packet. `getSealedPayload()` returns the session-only sealed ingress body once a staged packet exists.

## Example integration

```js
window.dispatchEvent(new CustomEvent('td613:tcp-intake', {
  detail: {
    status: 'attached',
    source: 'tcp-runtime',
    intake_id: 'tcp-live-001',
    cadence_signature: {
      status: 'attached',
      source: 'tcp-runtime',
      dominant_axes: ['pulse', 'recurrence', 'cadence']
    }
  }
}));

window.dispatchEvent(new CustomEvent('td613:eo-route', {
  detail: {
    status: 'attached',
    source: 'eo-rfd',
    route_state: 'harbor-eligible',
    recommended_harbor: 'provenance.seal',
    export_ready: true
  }
}));
```


## Operator bypass

Bypass is intentionally absent from the public hook model. The public ship requires a locally configured operator token hash before a packetless operator shell can open, and that shell does not mint a packet or receipt.


## Public / operator / dev boundary

- Public mode ships with canonical intake, staged packet minting, and public-safe readouts only.
- Operator mode may inspect packet internals and attach signature-lane overlays after local authorization.
- Dev mode is reserved for local hook simulation and is disabled by default in public ship.


## Current stabilization pass — do later layer

This pass makes three structural changes:
- public probe building now derives packet context from the staged packet instead of helper values alone,
- placeholder badge-number minting is replaced with a deterministic badge assignment id derived from canonical intake context,
- operator signature overlays attach to the staged packet cleanly after packetization rather than floating beside it.

Public mode remains unsigned by default. Advanced signature sealing is operator-only and never changes the compact public footer.
