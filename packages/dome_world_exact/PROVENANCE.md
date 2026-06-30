# Dome-World Exact Substrate Provenance

The exact engine, trainer, bridge specifications, fixtures, and original test
suite were supplied by O'Malley for authorized TD613 integration.

| Artifact | SHA-256 |
| --- | --- |
| `domeworld-aperture-substrate-trainer-kit.zip` | `03F5AF1D281EED2B037DD4D5FA2A430E28FA9744653978257CA050DB845CCADB` |
| `lambda2c-emissiongap-verification.zip` | `000EF383AA062D0581DECEFA91D092EB3BE4416AA73B928CDF0E5095DC046ECA` |
| `Dome_World_runtime_with_Ash.html` | `70BFB44FD194EC98B8DE8AE9937E427C94A0CF844E0A59D974AB212490593276` |
| `Aperture_v2_9_4.html` | `4CB2D7F8FD006469CF5742F6FD548982053E44F79A443C29441CAB00AEAFAA1E` |

The original verification packages remain under `verification/` as audit
artifacts. Production runtime code imports only the small exact modules needed
for capture, capacity, and opt-in closure decisions.

Integration changes made by TD613:

- reject floats at every public exact-coordinate boundary;
- preserve proposal and confirmation as separate operations;
- authenticate client-held checkpoints and parent hashes before resume;
- keep the conformal constant `c` explicit and free;
- apply the `2c * log(phi)` emission profile only when explicitly selected.
