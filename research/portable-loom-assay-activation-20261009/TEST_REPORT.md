# First-receiver activation — source and service checkpoint

Tawanna's direct 2026-10-09 approval binds governed activation and up to 54 first-receiver Gemini calls within USD 10 token charges. The exact corrected Markdown is unchanged. Actual model generation has not begun at this checkpoint.

## Coordinates and executed checks

- Base main: `8d57bdfcd69cff9c5760cd001549197f3180c00a`.
- Initial activation source: `6cd1e2393844c427c3426704a297f738ceb09f2e`; captured `raw/local-001`: **38/38 PASS**.
- Source-bound configuration: `603b0a5b83eed9e0d570146d0bb67f3112e40653`; captured `raw/local-002`: **39/39 PASS**.
- Exact Markdown SHA-256: `2d9c23bb6ad26430bcf4fd2a52e9aa5e876a1546265a00087cdb7e7e4f1c1872`.
- Deployed Neon archive SHA-256: `a5a7909e08f4913412bd187be294ec7a57a54407dde022b7af4e2bf3a81a2832`.

The final local checks cover transactional SQL, numerical spending/call limits, policy commitment, single completion, replay and predecessor rejection, trial-family separation, full-packet carriage, one-shot provider transport, credential echo, output/model/usage failure, capture continuation, bounded primary scheduling, public activation configuration, native API/profile preservation, workflow estate and release hygiene. They use synthetic provider fixtures and embedded single-connection PostgreSQL. They are `LOCAL_STRUCTURAL_TEST`, not actual receiver or deployed database-concurrency evidence.

The deployed service is `loomassaybudget`, Neon project `late-glade-40477105`, branch `br-round-union-b5v3ludi`, Node.js 24, deployment 1, remotely reported `completed` at `2026-10-09T07:42:30.447567Z`:

`https://br-round-union-b5v3ludi-loomassaybudget.compute.c-7.us-east-2.aws.neon.tech/`

Its two new metadata tables are present with the inspected column types. Existing custody tables were not altered. Actual anonymous HTTPS requests returned GET 405 and POST 401, with exact bodies retained in `raw/neon-http-001`. That is a hosted service negative-boundary witness, not model generation, an authenticated workload witness or a browser witness. The later database inspection found **0 runs and 0 calls**.

The first SQL submission incorrectly split a comment at its semicolon. The first fragment was comment-only and the second failed syntax parsing. Those tool responses are retained. Comment stripping corrected the submission, after which both frozen CREATE statements succeeded. No scientific evidence was reconstructed from that failure.

## Activation repairs

The retained server capture now exposes its verified returned answer to the continuation builder; failures expose no eligible answer. Policy v0.2 enforces first-receiver versus comparison authority both before provider work and inside the SQL reservation. The fixed primary runner schedules 54 registered calls and stops on transport HOLD without overwriting, retrying or self-resuming.

The Vercel connector recognized the intended team but returned no project/deployment records and 404 for the configured project. Its responses are retained without interpreting them as proof the project disappeared. A reviewed nonsecret source configuration supplies the exact deployed Neon URL, approved run ID, fresh high-entropy capability digest and authorization reference. The raw capability is kept outside Git for runtime injection. Existing Gemini and Vercel workload credentials stay runtime-only. Conflicting environment overrides hold.

## Remaining execution boundary

At this checkpoint, full remote CI, merge, Vercel release, runtime policy enrollment and live model generation are **not yet established**. The prepared policy's deployment commit and expiry still require the actual release receipt; a Git-fallback deployable commit differs from its reviewed packet and relock commit. No comparison, second-provider or historical sequence execution is authorized by this checkpoint. No custody admission or scientific promotion occurs.

`NEON_BUNDLE.json` retains its prepared predeployment state; the later `SERVICE_RECEIPTS.json` records actual migration, deployment and schema observations. The prior complete research lane and its failures remain at `7e7cf4d6490fcdc68584764a63f3198302f7fc39`. This checkpoint's publication commit contains the retained raw evidence; it does not retroactively change either earlier source execution.
