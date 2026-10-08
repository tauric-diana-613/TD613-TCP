// One policy shared by native server transport and pre-Send disclosure. An
// operator Send is distinct from its bounded internal transport attempts.
const providerCalls=5, structuralRepairs=1;
export const MARROWLINE_PROVIDER_BUDGET=Object.freeze({providerCalls,structuralRepairs,
  totalRequests:providerCalls+structuralRepairs});

export function marrowlineProviderUsage(reply) {
  const provider=reply?.receipt?.provider;
  if(!Array.isArray(provider?.attempts))return null;
  const attempts=provider.attempts;
  if(attempts.length>64)return null;
  const counts=attempts.map(item=>item?.output?.usage?.totalTokenCount);
  const usageKnown=counts.length>0&&counts.every(value=>Number.isSafeInteger(value)&&value>=0&&value<=1000000);
  const elapsed=reply.receipt?.elapsedMs;
  return {attempts:attempts.length,limit:MARROWLINE_PROVIDER_BUDGET.totalRequests,
    ...(Number.isFinite(elapsed)&&elapsed>=0?{elapsedSeconds:Math.round(elapsed/100)/10}:{}),
    ...(usageKnown?{reportedTotalTokens:counts.reduce((sum,value)=>sum+value,0)}:{})};
}
