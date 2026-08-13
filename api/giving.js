// One deployable Giving dispatcher. Supporting source and custody modules remain outside /api.
// Vercel Node API routes read maxDuration from the exported config object. Keep
// the named export as a testable compatibility constant, but make the runtime
// contract explicit so broad FEC retrieval cannot fall through to a 30s default.
export const maxDuration = 60;
export const config = Object.freeze({ maxDuration });

export { default } from '../server/giving/dispatcher.js';
export * from '../server/giving/dispatcher.js';
