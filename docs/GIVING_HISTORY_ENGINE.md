# TD613 Giving History

Private operator research is available only at `/giving/history/`. The route is intentionally absent from site navigation and sitemaps and carries `noindex`, `nofollow`, `noarchive`, and `nosnippet` directives.

## Call-time workflow

1. Open the route and enter the Giving access secret.
2. Give the dossier a useful name, keep `Local` custody unless an encrypted hosted vault is configured, and enter a contributor name, aliases, identity hints, and explicit date range.
3. Select electronic source instances. The browser runs at most three source calls concurrently; each source retains an independent completion, continuation, failure, or partial-coverage receipt.
4. Review every candidate record. Only `Confirmed` rows enter committee totals; `Excluded`, `Candidate`, and `Unreviewed` rows never do.
5. Use Committee ledger for reviewed totals and CSV or encrypted JSON export.
6. If Campaign Deputy writeback is ready, select an exact existing person or explicitly create a new contact, then link the reviewed committee list. `Withhold` records the decision without a CRM mutation.

## Campaign Deputy handoff

Campaign Deputy integration is deliberately a reviewed handoff, not an automatic bulk import. The Giving dossier remains the detailed historical evidence record; Campaign Deputy receives only the contact and committee relationship the operator has explicitly approved.

1. **Load contact index:** Giving walks the paginated `/v1/peoples` endpoint and builds a minimal contact index under the dossier's selected custody policy. Because Campaign Deputy exposes pagination rather than server-side person search, local filtering only proposes candidates.
2. **Review duplicates:** compare the public-source identity evidence with the candidate contacts. Giving never treats an email, name, or address similarity as authorization and never silently merges contacts.
3. **Link an existing person:** select the exact Campaign Deputy `personId`, then choose a reviewed committee from the dossier. Giving finds or creates a normal `listType=list` list using the committee taxonomy, checks membership, and adds the person only if absent.
4. **Create explicitly:** when no candidate is correct, choose a confirmed source record and make a separate create gesture. Select the fields to copy; public street address is off by default. Giving uses the documented `PUT /v1/people` no-match path, then adds the returned person to the committee list. Campaign Deputy notes that a returned person ID can take a short time to become available, so only this post-creation membership write receives a bounded retry; it never searches recent people by email.
5. **Withhold:** choose this when research should remain in Giving. It records the operator decision and performs no Campaign Deputy mutation.

Every successful handoff stores an idempotent receipt containing the dossier, person, list, and committee identifiers. Repeating the same reviewed link reuses the list and does not intentionally duplicate membership. Upstream failures are receipts, not implied successes.

Giving does **not** send historical public donations to `/v1/contribution`: that endpoint records contributions belonging to the current Campaign Deputy account, not outside giving history. It also avoids the asynchronous `POST /v1/people` match endpoint because the supplied API specification has no reliable request-status resolver. The explicit no-match create path plus human duplicate review is the safer contract.

The live API origin is `https://us.api.campaigndeputy.app/v1`. Create a **Campaign Deputy custom API key** at **Settings → Integrations → Campaign Deputy API** with exactly `people-read`, `people-write`, `list-read`, and `list-write`; an integration-vendor key such as Zapier must not be repurposed. If the custom-key control is disabled, an account administrator or Campaign Deputy must enable custom API access before writeback can become ready.

Never commit that key to GitHub or place it in `.env.example`. In Vercel, open **tauric-diana-s-projects → td-613-tcp → Settings → Environment Variables**, add `CAMPAIGN_DEPUTY_API_KEY` as a **Sensitive**, **Production** variable, then intentionally redeploy the current `main` commit so the runtime receives it. The repository already contains the empty variable name in [`.env.example`](../.env.example) only as documentation; it must remain empty.

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
