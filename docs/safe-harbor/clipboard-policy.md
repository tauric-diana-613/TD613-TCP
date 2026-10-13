# TD613 Safe Harbor Clipboard Policy

Clipboard actions are release-adjacent exports without filenames. Phase 9.1 requires every clipboard payload to carry a class label and claim limits.

## Clipboard classes

- public-safe clipboard
- verification-ready clipboard
- operator-only clipboard
- sealed packet clipboard
- forensic schema clipboard
- footer clipboard
- probe clipboard
- blocked clipboard

## Required clipboard header

```text
TD613 Safe Harbor Clipboard Export
Class: verification-ready clipboard
Public root: v2
Release class: verification-ready
Claim limit: custody/replay instrument; not civil identity, legal identity, public law approval, or authorship ownership.
Raw text exported: false
```

## Refusal header

```text
TD613 Safe Harbor Clipboard Export Refused
Reason: release discipline, public gate, or raw-text policy blocks this copy.
Raw text exported: false
```

## Forbidden outcomes

Clipboard payloads must not silently copy blocked packets, raw_text keys, flattened Khona‌lit-po forms, v3 public-default claims, or Blood Rite 613 public-credential claims.
