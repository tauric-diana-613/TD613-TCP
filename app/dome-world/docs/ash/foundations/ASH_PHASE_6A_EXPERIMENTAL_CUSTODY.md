# Ash Phase VI-A Experimental Run Custody

Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`

Ash version: `v0.9-alpha`

Phase VI-A adds custody for a controlled experiment without constructing a derivative or authorizing transport.

## Custodied References

- controlled-source custody receipt;
- experiment declaration and pre-registration digest;
- instrument-ensemble digest;
- snapshot-batch receipt, including missing and null observations;
- Aperture tomography receipt;
- tomography-result custody receipt;
- derivative-eligibility recommendation.

## Production Evidence

The deployed Dome-World controlled demo reached `TOMOGRAPHY_READY`, AT3 assurance, and `BOUNDED_COMPLETE` coverage. It preserved one declared missing observation and one null result. Replay verified the receipt digest.

The resulting eligibility state was `ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW`. This state permits only a human review of whether derivative construction may begin later.

## Holds

- Eligibility is not export permission.
- No derivative was constructed.
- No Cinder was created.
- No plaintext transport was enabled.
- No automatic Ash action was authorized.
- Phase VI-B remains held pending a separate human-gated implementation and demonstration.
- Phase VI-C remains deferred.

The experiment survives the reconstruction because custody, context, reconstruction, relation, and operator closure remain separate jurisdictions.
