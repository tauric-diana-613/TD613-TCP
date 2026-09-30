{
  "schema": "td613.pedagogue.live-external-https-observation-custody-hostile-execution-receipt/v0.1",
  "assay": "Post Office Window",
  "candidate": "E9_LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY",
  "science_head": "f00d324424afef26f2b8d7c7059e7459339d4639",
  "run": {
    "number": 1928,
    "id": 32552369042,
    "static_job_id": 96981105261,
    "result_provenance": "LITERAL_CI_STDOUT_RECOVERED"
  },
  "verdict": "LIVE_EXTERNAL_HTTPS_OBSERVATION_CUSTODY_CANDIDATE_FALSIFIED_OR_UNAVAILABLE_IN_BOUNDED_POST_OFFICE_WINDOW",
  "defeat_conditions": [
    "LIVE_PREREGISTERED_HTTPS_OBSERVATION_NOT_ADMITTED"
  ],
  "target": "https://www.iana.org/domains/reserved",
  "observed": {
    "network_observed": true,
    "response_status": 200,
    "tls_authorized_under_runner_trust_store": false,
    "contract_status": "REFUSE_LIVE_EXTERNAL_OBSERVATION_TLS_NOT_AUTHORIZED_BY_RUNNER_TRUST_STORE",
    "body_sha256": "720e5cce9016212d2d28777356d2844fb0ca9e19a32636eb232f8653360dc450",
    "body_bytes": 10499
  },
  "interpretation": {
    "endpoint_contact_observed": true,
    "candidate_contract_satisfied": false,
    "iana_certificate_invalid_claim": false,
    "iana_untrusted_claim": false,
    "source_honesty_identified": false,
    "institutional_identity_identified": false,
    "physical_origin_identified": false,
    "external_chronology_identified": false
  },
  "next_learning_action": "PREREGISTER_TLS_MEASUREMENT_SEMANTICS_DIAGNOSTIC_BEFORE_ANY_E9_RESCUE",
  "holds": {
    "e9_promotion_authority": false,
    "posthoc_e9_contract_weakening": false,
    "H2": "HELD_NOT_TESTED_HERE",
    "H3": "HELD_NOT_TESTED_HERE",
    "intersections": "HELD_NOT_OPENED_HERE",
    "APERTURE_V32_REPLAY_STABILITY": "HELD_NOT_YET_WITNESSED",
    "product_mutation": false,
    "shared_pedagogue_engine_mutation": false,
    "workflow_mutation": false,
    "browser_execution": false,
    "merge_performed": false,
    "deployment_performed": false,
    "release_authority": false,
    "vercel_release_requires_issue_405_and_new_explicit_operator_gesture": true,
    "human_closure_required": true
  }
}
