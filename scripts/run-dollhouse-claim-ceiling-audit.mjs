#!/usr/bin/env node
import {
  CLAIM_CEILING_REGISTRY,
  auditClaimCeilingRegistry,
  claimCeilingSummary
} from '../app/engine/dollhouse-claim-ceilings.js';

const packet = {
  schema: 'td613.dollhouse.claim-ceiling-observatory-run/v0.1',
  generated_from: 'repository-declared-evidence-registry',
  summary: claimCeilingSummary(),
  registry: CLAIM_CEILING_REGISTRY,
  dollhouse: auditClaimCeilingRegistry(),
  law: {
    role_agreement_is_evidence_multiplication: false,
    deployment_authority_from_role_agreement: false,
    empirical_promotion_requires_matching_evidence_class: true
  }
};

process.stdout.write(JSON.stringify(packet, null, 2) + '\n');
