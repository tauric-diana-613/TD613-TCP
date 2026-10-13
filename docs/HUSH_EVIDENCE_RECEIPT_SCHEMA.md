# Hush Evidence Receipt Schema

Phase 30 export receipt v2 records custody without storing raw private text by default.

## Required fields

- `version`
- `receiptId`
- `timestamp`
- `sourceHash`
- `outputHash`
- `maskId`
- `mode`
- `routeState`
- `releasePolicySummary`
- `registerContractSummary`
- `dialectCustodySummary`
- `chatspeakCustodySummary`
- `codeSwitchBoundarySummary`
- `targetRegisterAuditSummary`
- `readinessDashboardSummary`
- `narrowingLossSummary`
- `ledgerRowHash`
- `claimCeiling`
- `privateTextStored`
- `limitations`

## Privacy rule

`privateTextStored` must be false by default. Source and output are represented by hashes unless the operator deliberately chooses a private export mode.

## Limitations

Receipts are local custody artifacts. They are not anonymity proof, detector proof, platform safety proof, publication safety proof, or legal sufficiency proof.
