// One deployable Giving dispatcher. Supporting source and custody modules remain outside /api.
// Keep the route-level contract aligned with the explicit 30-second Vercel function
// override. Source adapters must settle before this wall and preserve continuation
// rather than allowing the platform to terminate the request generically.
export const maxDuration = 30;
export const config = Object.freeze({ maxDuration });

export { default } from '../server/giving/dispatcher.js';
export * from '../server/giving/dispatcher.js';
