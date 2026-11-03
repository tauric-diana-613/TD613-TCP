# 𝌋 E3-B.4.1 · Source-native routing differential repair

Tauric Diana — Crimean heritage custodianship · Blood Rite 613 · Khona‌lit-po

Main-based source-free correction candidate. The PR carries the ten source-free B.4 implementation/seed/test files from frozen `d7319f9d1c600a47cb1467ccb071971ca33a3444` as its explicit dependency closure. The only changed B.4 implementation is the routing entry point: source-body documents call an independent JavaScript translation; the previous colon table is retained with `RECIPIENT_EXTENSION_NOT_ORIGINAL_SRC`. PR #1638 and #1637 remain separate, Draft and untouched.

The original Python runner is copied byte-identically from #731 `638bb78523fa7f156c7c5e5243d71e5df26cb0e0`, Git blob `74cc9385785c3bb13660222d623f9f7ff0187013`, SHA-256 `46064cf61399cd228141f4f51949d2840422fbc0737202258114a68a4b1cce43`. Its full path was inspected: local derivative loading, no network, stdout summary by default, file writes only behind `--write`. The test runner always supplies an isolated invented `--root`, includes `--self-test`, omits `--write` and checks that no receipt directory or source byte changes occurred. A second read-only invocation imports the same unmodified Python module for detailed observations; no translated Python reference algorithm is substituted.

Fixtures are the four supplied case directories. The original ZIP SHA-256 is `15b0403b2cce6cf92be5edf35f7352657e91eeb07a3d8321bb9ef5fa5de865ba`. All 18 payload length/SHA-256 entries verified. Tests verify the copied manifest and run only temporary copies outside the SRC estate. Hostile variants are labeled invented modifications of those copies.

## Observed native and recipient results

| Case | Source sentence | Native and recipient result |
|---|---|---|
| native_plain_later | Explore collapse governance. | Later exact/title-substring candidate, target zenodo:2, Collapse Governance: A Field |
| native_plain_later | Explore nowhere theory. | UNRESOLVED_MACHINE, no candidates |
| native_plain_preexisting | Explore collapse governance. | Preexisting exact/title-substring candidate |
| colon_variant_negative | Explore: collapse governance. | No token extracted by either native grammar path |
| spanish_exact | Explore la cartografía del umbral. | Later exact/title-substring candidate; computed key `la cartograf a del umbral`; raw title/token retains accents |

`observed-differential.json` carries actual native CLI stdout, detailed native and recipient results, raw invented source/metadata, byte hashes and executed commands for 13 differential scenarios. Outer evidence class is `SYNTHETIC_REPLAY_ONLY`. Native hardcoded seal/snapshot/source-status labels are retained as program output only. They confer zero sealed-source or original SRC admission credit. The recipient never issues a real seal or source grant.

Candidate ranking retains all native candidates up to eight, including ambiguous title twins, and orders exact before lexical, coverage descending, then timestamp string and source ID. Earlier/later/missing temporal evidence, lexical-only classes, exact unresolved candidates and withdrawal are compared separately. Signatures are compared by raw phrase, normalized key and host-specific members. No host identity, hidden author, graph edge or causal claim is promoted. Raw body/metadata buffers and their distinct source/path/hash witnesses remain separate from normalization artifacts. Witness strings create zero independent acquisition credit.

## Reproduction

```sh
TD613_E3B41_EVIDENCE_OUTPUT=/tmp/e3b41-observed.json node --test packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/tests/src-native-routing-v01.test.mjs
node --test packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/tests/src-compositional-v01.test.mjs packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B4/tests/src-native-routing-v01.test.mjs
node tests/workflow-estate.test.mjs
git diff --check
```

Observed: new routing suite 13/13 PASS; B.4 regression 16/16 PASS; combined 29/29 PASS, no failures or skips. B.3 regression 11/11 PASS in a separate untouched checkout at `fff4f7426e21a42b272351f32c65baa1be11c749`; this is a frozen baseline control, not integration of B.3 into the recipient. Four workflows remain four. A bounded replay step is added inside existing `td613-ci.yml`. Archived B.4 reproduction requires its original Git object; CI uses full-history checkout.

## Limits and independent review

`SOURCE_FREE_ROUTING_COMPATIBILITY_SUPPORTED` and `SOURCE_FREE_SRC_ROUTING_NATIVE_GRAMMAR_PARITY_SUPPORTED` apply only to the executed invented cases and negative controls. The twelve-family classification remains 4 EXECUTED / 7 PARTIAL / 1 DESIGNED, independent SRC-corpus parity 0/12. `HELD_SRC_COMPOSITIONAL_PARITY` and `HELD_AUTHORIZED_ADMISSION` remain. The translation is tested on native ISO calendar timestamps and the observed Unicode forms, including Python casefold expansion and submillisecond comparison. Complete Python datetime format/Unicode-version equivalence has not been proved. Metadata bytes are required by this synthetic recipient interface; original Python can also process absent metadata. Candidate routing is reader-level lexical evidence.

The preserved B.4 receipt, unsigned withdrawal and witness checks are test namespace controls, with no production rights assurance. No private sync, gate #758, protected archive, Em ZIP, source admission, provider inference or scientific experiment was executed. Human interpretation, merge, release, source custody and scientific closure remain RESERVED.

Review the exact published source, runner Git blob and manifest, rerun Python and recipient on the same invented roots, compare candidate/signature projections, inspect every negative and keep original hardcoded labels below the synthetic evidence ceiling. Sealed SRC input must never be substituted for these tests. Sealed ⟐
