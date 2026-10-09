-- Prepared only. No automatic migration or authority provisioning.
-- Budget metadata only; no prompts, source documents, answers, keys or bearer tokens.
CREATE TABLE IF NOT EXISTS public.td613_assay_runs (
  run_id text PRIMARY KEY,
  credential_sha256 text NOT NULL CHECK (credential_sha256 ~ '^[a-f0-9]{64}$'),
  policy jsonb NOT NULL,
  policy_sha256 text NOT NULL CHECK (policy_sha256 ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('ACTIVE','HELD','CLOSED')),
  calls_reserved integer NOT NULL DEFAULT 0 CHECK (calls_reserved >= 0),
  reserved_cost_nanos bigint NOT NULL DEFAULT 0 CHECK (reserved_cost_nanos >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.td613_assay_calls (
  run_id text NOT NULL REFERENCES public.td613_assay_runs(run_id),
  call_key text NOT NULL,
  trial_id text NOT NULL,
  role text NOT NULL,
  turn_index integer NOT NULL CHECK (turn_index BETWEEN 0 AND 3),
  request_sha256 text NOT NULL CHECK (request_sha256 ~ '^[a-f0-9]{64}$'),
  reserved_cost_nanos bigint NOT NULL CHECK (reserved_cost_nanos >= 0),
  status text NOT NULL CHECK (status IN ('RESERVED','CAPTURED_NOT_ADMITTED','HELD_EVIDENCE_GAP')),
  response_sha256 text,
  answer_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (run_id,call_key),
  UNIQUE (run_id,trial_id,role,turn_index)
);
