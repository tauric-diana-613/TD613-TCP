# Actual browser and function challenge reproduction

Serve app/encyclopedia/vix-cyb.html from exact HEAD 7b6b4887f646155ba62b5c1b7bc0afc382fcaa34 at http://127.0.0.1:6137/encyclopedia/vix-cyb.html using the archived static server or an equivalent read-only loopback server. The served SHA-256 must be def23216f2f60e65be22fbf11cbf8086bb04ee467efcd73036746963f6fda8c4. The original automated UI acquisition used graphical Chromium 157 on Windows; its results are in browser-ui.json.

## UI steps actually exercised

1. Click all six numbered navigation buttons. On partitions, click Simulate 256 Partition Evaluation. Inspect the fixed returned text and retained human-gate HOLD.
2. On Exact Passage Witness, choose each demonstration document. Set start/end through the visible fields. Retrieve [0,4] in the signature document; compare the returned 𝌋 and 64-hex digest.
3. Click each of the four Probe buttons. Record observed codes and document state. They are INVALID_UTF8_BOUNDARY, INVALID_UTF8_BOUNDARY, INVALID_SPAN and DOCUMENT_NOT_FOUND in the baseline.
4. Enter 0.9 and 4.9 in the fields; click retrieval. The original UI truncated to 0 and 4. Leave start empty; click retrieval; observe INVALID_SPAN. Test Tab from the start field and inspect focus on the end field.
5. On Mathematical Representation, evaluate the default numbers and change z to 99. The arithmetic concordance changes but does not establish scholarly meaning or proof.
6. Reload and confirm that the default panel returns and a valid normal retrieval still has an actual digest.

## Deliberate runtime fault injections

These injections change only the isolated test page's runtime; reload after each. Use real visible retrieval/probe clicks after installing the fault and record the resulting DOM/output.

- Missing crypto: in the isolated page's developer console, execute Object.defineProperty(window,'crypto',{configurable:true,value:undefined}); set the signature document span to [0,4] through the fields and click retrieval. The original run returned VERIFIED_GROUNDED_BYTE_SPAN with UNSUPPORTED_CRYPTO_API. This is the critical falsifier.
- Digest rejection: after reload, execute crypto.subtle.digest = async()=>{throw new Error('REVIEWER_DIGEST_FAILURE')}; click normal retrieval. The original result was error:true, UNKNOWN_ERROR, rather than verification.
- Unrelated exception: after reload, execute retrievePassageWitnessInBrowser = async()=>{throw new TypeError('REVIEWER_UNRELATED_FAILURE')}; click Probe 4. The original UI claimed negative_control_passed:true and FAIL_CLOSED_CONFIRMED with UNKNOWN_ERROR.

The added browser-function-challenges.js repeats the direct-function/scalar probes and missing-crypto check and restores its temporary state. It is separate from actual UI automation and cannot establish that a click path worked. The exact original scalar text is recorded in browser-scalars.json; direct coordinate classes and outputs are in browser-direct.json. No actual insecure-origin session was acquired: localhost was secure. A missing-crypto injection is not an insecure-origin observation.

All these fixture inputs are now disclosed for review. Preserve fresh independent challenges for any future corrective candidate.
