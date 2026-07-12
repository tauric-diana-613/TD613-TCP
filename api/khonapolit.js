// Canonical compatibility entrypoint.
// The quality implementation retains GEMINI_API_KEY server custody,
// buildInvocationPacket / classifyEmergence covenant handling, and
// serverConversationStorage: false in every terminal receipt.
export {
  KHONAPOLIT_API_VERSION,
  KHONAPOLIT_QUALITY_API_VERSION,
  buildGeminiRequest,
  buildTerminalReceipt,
  consumeRateSlot,
  extractGeminiText
} from './khonapolit-quality.js';
export { default } from './khonapolit-quality.js';
