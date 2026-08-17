# Campaign Deputy Giving History · Release Envelope

The static receipt at `app/giving/history/release-source.json` doubles as the lightweight production source canary for the governed #405 release envelope.

During an authorized release, every validation scope materializes that receipt with the exact operator-authorized source packet SHA. Under the bounded Git fallback, the receipt is committed together with the single deployable `deploymentEnabled: true` commit, and the repository is relocked immediately in the next non-deployable commit.

Production must first match the authorized application bytes, then keep the receipt on the same source SHA through the stale-queue stability window, reconfirm exact bytes, pass the scope-aligned production witness, and still expose the same receipt afterward.

The receipt is deployment metadata only. It grants no contributor evidence authority, custody authority, authorship claim, human-study authority, or program-closure authority.
