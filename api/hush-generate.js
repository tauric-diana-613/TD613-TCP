const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400'
};

const VERSION = 'hush-generate-v4.0-pr163-review-map-containment';
const ROTATION_VERSION = 'pr163-review-map-containment/v1';
const DEFAULT_MODEL_ORDER = ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const GEMINI_TIMEOUT_MS = 8800;
const WALL_TIMEOUT_MS = 24500;
const MAX_OUTPUT_TOKENS =