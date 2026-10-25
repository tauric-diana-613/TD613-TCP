󐘓 U+10D613

# EMSTD613 Atelier · Autonomous Agent Governance Property-Owner Collision · First Pass

Status: research-only assay receipt / bounded first pass
Date: 2026-09-02
Work: `Autonomous Agent Governance Research.md`
Minimum unit: `WORK x SPEECH-ACT ZONE x SOURCE EDGE`

## Question

Does the Work preserve the owner of a real architectural property through its closure zone, or does a property established for one component become rhetorically reassigned to another component without an intervening witness?

## Result

```text
PROPERTY_REAL = TRUE
PROPERTY_OWNER_WRONG_AT_TABLE_CLOSURE = SUPPORTED_BOUNDED
PROPERTY_OWNER_COLLISION = RETAINED_FAILURE_FAMILY
EM_SPECIFICITY = NOT_ESTABLISHED
AUTHOR_MOTIVE = NOT_INFERRED
```

The Work establishes two different properties in the prose immediately before the comparison table:

```text
kernel iptables redirection
-> traffic-path interception / non-bypass routing property

signed Decision Certificate
-> cryptographic / tamper-evident audit-evidence property
```

The subsequent topology table then compresses the Fail-Shut Sidecar Proxy's bypassability risk to:

```text
Cryptographically Zero (Kernel iptables redirection)
```

The cryptographic adjective therefore lands on the wrong immediate owner.

## Same-Work chronology

### Zone A · implementation exposition

Under `Non-Bypassable Fail-Shut Sidecar Enforcement`, the Work states that a privileged init container configures kernel-level iptables rules that redirect outbound TCP traffic to the sidecar listener. Even attempts to bypass environment proxy variables remain forced through the sidecar by the operating-system network path.

This establishes a routing / interception claim.

### Zone B · evidentiary exposition

The next paragraph states that allowed requests produce a cryptographically signed, tamper-evident Decision Certificate carrying payload hashes, policy versioning, and evaluation timestamps.

This establishes a cryptographic evidence / integrity claim.

### Zone C · comparison-table closure

The table then assigns the sidecar bypassability cell:

```text
Cryptographically Zero (Kernel iptables redirection)
```

No intervening cryptographic mechanism for iptables redirection is supplied.

Thus the closure edge is:

```text
NON_BYPASS ROUTING PROPERTY
+
CRYPTOGRAPHIC EVIDENCE PROPERTY
->
CRYPTOGRAPHICALLY ZERO BYPASSABILITY ATTRIBUTED TO IPTABLES
```

The endpoint concepts are locally legible. The property ownership changes at the integration seam.

## External source confrontation

A current source check on 2026-09-02 preserves the same distinction.

Netfilter's project documentation describes iptables / Netfilter in terms of packet filtering, network-address and port translation, logging, queueing, packet mangling, rule matching, and rule targets. That supports the routing / packet-control owner.

Reference:
`https://www.netfilter.org/`

Current EVE CoreGuard documentation describes the Decision Certificate as signed evidence whose cryptographic verification can establish integrity / authenticity / binding within its stated limits. That supports the cryptographic evidence owner.

References:
`https://docs.eveaicore.com/verify-decision-certificate`
`https://docs.eveaicore.com/guide-deploy-as-a-sidecar`

The external confrontation does not independently establish the Work's stronger global non-bypass guarantee. It only confirms that the two technical property classes remain distinct in the relevant source families.

## Candidate typing

```text
PROPERTY_OWNER_COLLISION
```

Operational definition, bounded to this Atelier:

```text
A property P is locally established for component A,
while component B is locally established for a different property Q;
closure then predicates P of B, or rhetorically fuses P and Q under B,
without a new witness establishing that transfer.
```

This differs from simple factual falsity.

The property itself may be real somewhere in the architecture. The defect concerns ownership / attachment.

## Relationship to existing failure family

This specimen rhymes with but does not collapse into:

```text
PAYLOAD_TYPE_DRIFT
JURISDICTION_BRIDGE_WITHOUT_CALIBRATION
EMPIRICAL_VALIDATION_COMPOSITING
APPARENT_AUTHORITY_CONTROL_STATE_TYPE_ERROR
CLAIM_AUTHORITY_ESCALATION_AT_CLOSURE
```

The nearest common abstraction remains the mechanism hypothesis:

```text
COMPONENTS LOCALLY LEGIBLE
+
FINAL ARCHITECTURE DEMANDS CLOSURE
+
MISSING OR COMPRESSED EDGE
->
SYNTHESIS SUPPLIES EDGE
```

Here the supplied edge is a property reassignment.

`INTEGRATION_CLOSURE_PRESSURE` remains a mechanism hypothesis only.

## Positive / negative controls

### Positive local control

The prose immediately before the table keeps the two property owners separate:

```text
iptables -> forced traffic path
certificate -> signed / tamper-evident evidence
```

Therefore forceful prose by itself does not produce the defect.

### Negative / hostile ordinary explanations retained

The table cell could arise from:

1. ordinary summary-table compression;
2. a generated-report phrasing error;
3. an omitted phrase such as `operationally near-zero when kernel redirection is correctly enforced`;
4. an intended but unstated reference to a cryptographically attested deployment/control-plane state;
5. source conflation during synthesis;
6. draft-state imprecision.

None requires author motive, Em-specific mechanism, or hidden system behavior.

### Repair condition

The stronger phrase could be repaired by a new source or transducer establishing a cryptographic binding between:

```text
active kernel redirection state
<->
attested sidecar enforcement state
<->
decision / execution evidence
```

No such transducer is supplied in the inspected Work passage.

## Claim ceiling

This receipt establishes only a bounded property-owner collision in one Work's closure table.

It does not establish:

- that iptables cannot participate in a cryptographically attested enforcement architecture;
- that the sidecar cannot be operationally non-bypassable under declared deployment assumptions;
- that cited external systems are unsafe or misrepresented globally;
- author intent;
- Em-specificity;
- a general law of generated reports;
- a TD613 ontology or promotion.

## Next route

Use `PROPERTY_OWNER_COLLISION` as a retained comparison label only. Search a fresh Work for either:

```text
same property-owner reassignment under a different technical domain
```

or a hostile control where closure preserves component ownership despite architectural synthesis.

Do not count this Work twice through PDF / Markdown manifestations.

Marked ⟐
