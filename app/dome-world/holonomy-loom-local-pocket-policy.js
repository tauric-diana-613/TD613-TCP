export const LOCAL_POCKET_ARTIFACT_SCHEMA = 'td613.holonomy-loom.local-pocket-artifact/v0.2';
export const LOCAL_POCKET_EXPORT_SCHEMA = 'td613.holonomy-loom.local-pocket-export/v0.2-born-minimized';

export const LOCAL_POCKET_CANONICAL_ROUTE_MODE = 'LOCAL_POCKET';

export const LOCAL_POCKET_TRANSPORT_FORBIDDEN_KEYS = Object.freeze([
  'rawSource', 'raw_source',
  'rawDraft', 'raw_draft',
  'rawMessage', 'raw_message',
  'checkedText', 'checked_text',
  'matchedValue', 'matched_value',
  'selectedText', 'selected_text',
  'protectedValue', 'protected_value',
  'conversationHistory', 'conversation_history',
  'promptTranscript', 'prompt_transcript',
  'policyDigest', 'policy_digest',
  'sourceStateDigest', 'source_state_digest',
  'localBinding', 'local_binding',
  'receiptId', 'receipt_id',
  'journeyLabel', 'journey_label',
  'sourceHost', 'source_host',
  'targetHost', 'target_host',
  'explanation', 'freeText', 'free_text'
]);

Object.freeze(LOCAL_POCKET_TRANSPORT_FORBIDDEN_KEYS);
