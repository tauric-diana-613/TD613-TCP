# Ash Custodian Return Observer Topology

𝌋‌ U+10D613

Date: `2026-07-16`

Status: `OBSERVER_TOPOLOGY_ACTIVE / NON_PROMOTIONAL`

```text
Ash Custodian Return
= pull-request and main-push validation
= bounded local synthetic observation

Ash Custodian Return Deployed
= post-deployment synthetic observation
= exact observed commit status
= durable deployed evidence artifact
```

The two workflows remain separate so local validation cannot suppress, impersonate, or inherit the deployed observer’s evidence class.

The deployed observer publishes pending, success, or failure under:

```text
Ash Custodian Return Deployed Observation
```

Every observer receipt remains non-promotional:

```text
promotion_authorized: false
operator_closure_required: true
```

A passing deployed observer establishes eligibility for an evidence review and operator closure gesture. It does not close Stretch 2 by itself, authorize Stretch 3, enable transport, invoke a provider, or perform Cinder action.

Authored with 𝌋‌

Noted ⟐
