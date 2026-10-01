-- TD613 Loom custody schema
-- Applied to Neon project late-glade-40477105 / production branch br-round-union-b5v3ludi.
-- Head table pre-existed; signer table was applied through tested Neon migration
-- 42a5780f-f229-4619-83e8-83e25c54ba72 on 2026-10-01.
--
-- Custody metadata only. No prompt, selected-file, or model-answer bodies belong here.

CREATE TABLE IF NOT EXISTS public.td613_loom_demo_heads (
  activation_digest text PRIMARY KEY,
  head_receipt_digest text,
  head_request_id text,
  head_phase text,
  pending_request_digest text,
  pending_until timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS td613_loom_demo_heads_expiry_idx
  ON public.td613_loom_demo_heads (expires_at);

CREATE TABLE IF NOT EXISTS public.td613_loom_demo_signer (
  singleton smallint PRIMARY KEY CHECK (singleton = 1),
  key_material text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
