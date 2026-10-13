export const HUSH_REGISTER_CONTRACT_VERSION = 'phase-27';

const MODES = new Set(['preserve-source', 'stabilize-source', 'formalize-source', 'transform-to-chatspeak', 'transform-to-aave', 'custom-mask']);

export function buildHushRegisterContract(input = {}) {
  const registerMode = MODES.has(input.registerMode) ? input.registerMode : 'preserve-source';
  const transformsRegister = registerMode === 'formalize-source' || registerMode === 'transform-to-chatspeak' || registerMode === 'transform-to-aave';
  return {
    version: HUSH_REGISTER_CONTRACT_VERSION,
    registerMode,
    preserveSource: registerMode === 'preserve-source' || registerMode === 'stabilize-source' || registerMode === 'custom-mask',
    transformsRegister,
    ontologySource: input.ontologySource || (registerMode === 'transform-to-aave' ? 'repo-aave' : registerMode === 'transform-to-chatspeak' ? 'repo-chatspeak' : 'none'),
    dialectPolicy: input.dialectPolicy || (registerMode === 'transform-to-aave' ? 'target-register' : registerMode === 'formalize-source' ? 'translate-with-warning' : 'preserve'),
    chatspeakPolicy: input.chatspeakPolicy || (registerMode === 'transform-to-chatspeak' ? 'target-register' : registerMode === 'formalize-source' ? 'stabilize-with-warning' : 'preserve'),
    emojiPolicy: input.emojiPolicy || (registerMode === 'formalize-source' ? 'describe' : 'preserve'),
    codeSwitchPolicy: input.codeSwitchPolicy || (registerMode === 'formalize-source' ? 'normalize-with-warning' : 'preserve-boundaries'),
    warningMode: input.warningMode || (transformsRegister ? 'strict' : 'standard')
  };
}

export function summarizeHushRegisterContract(contract = {}) {
  return {
    version: contract.version || HUSH_REGISTER_CONTRACT_VERSION,
    registerMode: contract.registerMode || 'preserve-source',
    preserveSource: contract.preserveSource !== false,
    transformsRegister: Boolean(contract.transformsRegister),
    ontologySource: contract.ontologySource || 'none',
    dialectPolicy: contract.dialectPolicy || 'preserve',
    chatspeakPolicy: contract.chatspeakPolicy || 'preserve',
    emojiPolicy: contract.emojiPolicy || 'preserve',
    codeSwitchPolicy: contract.codeSwitchPolicy || 'preserve-boundaries',
    warningMode: contract.warningMode || 'standard'
  };
}
