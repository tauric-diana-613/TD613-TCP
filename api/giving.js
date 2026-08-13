// One deployable Giving dispatcher. Supporting source and custody modules remain outside /api.
// Function-code configuration takes precedence over the legacy 30-second vercel.json
// override on current Vercel Node runtimes, so broad OpenFEC searches can use a
// real bounded retrieval window rather than dying at the old platform ceiling.
export const maxDuration = 60;

export { default } from '../server/giving/dispatcher.js';
export * from '../server/giving/dispatcher.js';
