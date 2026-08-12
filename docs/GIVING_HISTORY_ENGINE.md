# TD613 Giving History

Private operator research is available only at `/giving/history/`. The route is intentionally absent from site navigation and sitemaps and carries `noindex`, `nofollow`, `noarchive`, and `nosnippet` directives.

## Call-time workflow

1. Open the route and enter the Giving access secret.
2. Give the dossier a useful name, keep `Local` custody unless an encrypted hosted vault is configured, and enter a contributor name, aliases, identity hints, and explicit date range.
3. Select electronic source instances. The browser runs at most three source calls concurrently; each source retains an independent completion, continuation, failure, or partial-coverage receipt.
4. Review every candidate record. Only `Confirmed` rows enter committee totals; `Excluded`, `Candidate`, and `Unreviewed` rows never do.
5. Use Committee ledger for reviewed totals and CSV or encrypted JSON export.
6. If Campaign Deputy writeback is ready, select an exact existing person or explicitly create a new contact, then link the reviewed committee list. `Withhold` records the decision without a CRM mutation.

## Coverage

- OpenFEC Schedule A
- Florida Division of Elections electronic contribution search
- Ten VoterFocus custodians, including Hillsborough, Duval/Jacksonville, and Leon/Tallahassee
- Eleven reachable EasyVote municipal portals
- A 62-municipality Tampa Bay coverage inventory

Source failures never become zero-giving claims. Raw rows, normalized records, query digests, retrieval timestamps, amendment context, and coverage receipts stay attached to the dossier.

## Custody and configuration

`LOCAL` uses IndexedDB and needs no database. `HOSTED` and `HYBRID` encrypt dossier versions in the browser before writing ciphertext to Neon. Vault decryption and signed session access are separate authorities.

Required production variables:

- `TD613_GIVING_ACCESS_SECRET`
- `TD613_GIVING_SESSION_SECRET`

Optional capability variables:

- `FEC_API_KEY` for higher OpenFEC limits; a low-quota demonstration key is otherwise used.
- `CAMPAIGN_DEPUTY_API_KEY` for reviewed contact/list writeback.
- `TD613_GIVING_NEON_DATABASE_URL` for encrypted hosted or hybrid custody.

Gemini is not in the retrieval, identity-confirmation, or CRM-authorization path. Historical public contributions are not written to Campaign Deputy's contribution endpoint; committee-list membership is the reviewed relationship record.
