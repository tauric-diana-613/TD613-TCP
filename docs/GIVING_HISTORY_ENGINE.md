# TD613 Giving History

Private operator research is available only at `/giving/history/`. The route is intentionally absent from site navigation and sitemaps and carries `noindex`, `nofollow`, `noarchive`, and `nosnippet` directives.

## Call-time workflow

1. Open the route and enter the Giving access secret.
2. Give the dossier a useful name, keep `Local` custody unless an encrypted hosted vault is configured, and enter a contributor name, aliases, identity hints, and explicit date range.
3. Select electronic source instances. The browser runs at most three source calls concurrently; each source retains an independent completion, continuation, failure, or partial-coverage receipt.
4. Review every candidate record. Only `Confirmed` rows enter committee totals; `Excluded`, `Candidate`, and `Unreviewed` rows never do.
5. Use Committee ledger for reviewed totals and XLSX/CSV or encrypted JSON export.
6. If Campaign Deputy writeback is ready, select an exact existing person or explicitly create a new contact, then link the reviewed committee list. `Withhold` records the decision without a CRM mutation.

## Campaign Deputy handoff

Campaign Deputy integration is deliberately a reviewed handoff, not an automatic bulk import. The Giving dossier remains the detailed historical evidence record; Campaign Deputy receives only the contact and committee relationship the operator has explicitly approved.

1. **Load contact index:** Giving walks the paginated `/v1/peoples` endpoint and builds a minimal contact index under the dossier's selected custody policy. Because Campaign Deputy exposes pagination rather than server-side person search, local filtering only proposes candidates.
2. **Review duplicates:** compare the public-source identity evidence with the candidate contacts. Giving never treats an email, name, or address similarity as authorization and never silently merges contacts.
3. **Link an existing person:** select the exact Campaign Deputy `personId`, then choose a reviewed committee from the dossier. Giving finds or creates a normal `listType=list` list using the committee taxonomy, checks membership, and adds the person only if absent.
4. **Sync one reviewed contact:** after selecting an exact Campaign Deputy person, one explicit gesture can sync every reviewed committee relationship for the active Giving contact. Historical contribution rows remain in Giving.
5. **Multi-contact exact sync:** the queue-level bulk gesture loads the Campaign Deputy index and processes Giving targets independently. It only syncs a target when exactly one Campaign Deputy person has the same normalized name. Missing or ambiguous targets are held; the bulk path never creates people, never merges identities, and never borrows committees across Giving targets.
6. **Create explicitly:** when no candidate is correct, choose a confirmed source record and make a separate create gesture. Select the fields to copy; public street address is off by default. Giving uses the documented `PUT /v1/people` no-match path, then adds the returned person to the committee list. Campaign Deputy notes that a returned person ID can take a short time to become available, so only this post-creation membership write receives a bounded retry; it never searches recent people by email.
7. **Withhold:** choose this when research should remain in Giving. It records the operator decision and performs no Campaign Deputy mutation.

Every successful handoff stores an idempotent receipt containing the dossier, person, list, and committee identifiers. Repeating the same reviewed link reuses the list and does not intentionally duplicate membership. Upstream failures are receipts, not implied successes.

Giving does **not** send historical public donations to `/v1/contribution`: that endpoint records contributions belonging to the current Campaign Deputy account, not outside giving history. It also avoids the asynchronous `POST /v1/people` match endpoint because the supplied API specification has no reliable request-status resolver. The explicit no-match create path plus human duplicate review is the safer contract.

The live API origin is `https://us.api.campaigndeputy.app/v1`. Create a **Campaign Deputy custom API key** at **Settings → Integrations → Campaign Deputy API** with exactly `people-read`, `people-write`, `list-read`, and `list-write`; an integration-vendor key such as Zapier must not be repurposed. If the custom-key control is disabled, an account administrator or Campaign Deputy must enable custom API access before writeback can become ready.

Never commit that key to GitHub or place it in `.env.example`. In Vercel, open **tauric-diana-s-projects → td-613-tcp → Settings → Environment Variables**, add `CAMPAIGN_DEPUTY_API_KEY` as a **Sensitive**, **Production** variable, then intentionally redeploy the current `main` commit so the runtime receives it.

## Campaign / PC identity lookup

The Campaign Deputy view also contains a candidate / committee directory for campaign and political-committee work.

- OpenFEC candidate search supplies candidate IDs plus principal committees when available.
- OpenFEC committee search supplies exact FEC committee IDs and committee metadata.
- A committee result has a one-touch **Integrate committee → Campaign Deputy** action. The action finds or creates the normal Campaign Deputy `listType=list` taxonomy list and records the exact FEC committee ID, candidate ID when present, committee type, and designation in the TD613 receipt.
- Repeating the same integration is idempotent at the Campaign Deputy list layer.
- The committee integration never writes a historical contribution to Campaign Deputy.

This representation deliberately reuses the reviewed list taxonomy already used by donor-contact handoff. It does not invent a separate Campaign Deputy committee object when the admitted Giving contract only guarantees list membership.

## OpenSecrets enrichment and duplicate protection

OpenSecrets is optional aggregate research enrichment in the Campaign / PC directory. Configure `OPENSECRETS_API_KEY` in the production environment to enable organization lookup and aggregate organization summaries.

OpenSecrets is **not registered as a Giving donor-transaction source** in this release. Its organization/candidate intelligence therefore cannot populate a second transaction beside an OpenFEC Schedule A contribution. This is an intentional duplicate-prevention boundary: OpenSecrets aggregate totals, organization summaries, top-contributor-style data, and similar research context remain enrichment rather than contribution rows.

If a future OpenSecrets contract exposes transaction-level records suitable for donor retrieval, those rows must pass a cross-source identity fingerprint before admission. A matching underlying gift should merge source provenance rather than add dollars twice. Until transaction-level identity can be proven from stable fields, OpenSecrets data remains non-transactional context.

## Coverage

- OpenFEC Schedule A
- Florida Division of Elections electronic contribution search
- Ten VoterFocus custodians, including Hillsborough, Duval/Jacksonville, and Leon/Tallahassee
- Eleven reachable EasyVote municipal portals
- A 62-municipality Tampa Bay coverage inventory
- Optional OpenSecrets aggregate organization intelligence in Campaign / PC lookup; not counted as a donor-contribution source

Source failures never become zero-giving claims. Raw rows, normalized records, query digests, retrieval timestamps, amendment context, and coverage receipts stay attached to the dossier.

## Custody and configuration

`LOCAL` uses IndexedDB and needs no database. `HOSTED` and `HYBRID` encrypt dossier versions in the browser before writing ciphertext to Neon. Vault decryption and signed session access are separate authorities.

Required production variables:

- `TD613_GIVING_ACCESS_SECRET`
- `TD613_GIVING_SESSION_SECRET`

Optional capability variables:

- `FEC_API_KEY` for higher OpenFEC limits; a low-quota demonstration key is otherwise used.
- `CAMPAIGN_DEPUTY_API_KEY` for reviewed contact/list writeback and committee-list integration.
- `OPENSECRETS_API_KEY` for OpenSecrets organization lookup and aggregate summaries.
- `TD613_GIVING_NEON_DATABASE_URL` for encrypted hosted or hybrid custody.

Gemini is not in the retrieval, identity-confirmation, or CRM-authorization path. Historical public contributions are not written to Campaign Deputy's contribution endpoint; committee-list membership is the reviewed relationship record.
