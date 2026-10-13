/* Legacy compatibility endpoint for the retired 2026-09-27 site-wide browser reset.
 * The endpoint is intentionally incapable of emitting Clear-Site-Data or requesting
 * any client-side deletion. Cached callers receive an explicit retired response.
 */
const E='td613.site.browser-reset/2026-09-27-v1';
export default function handleSiteEpochReset(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  const site=String(req.headers?.['sec-fetch-site']||'');
  const validLegacyCall=String(req.method||'').toUpperCase()==='POST'
    && req.headers?.['x-td613-reset-epoch']===E
    && (!site||site==='same-origin');
  res.statusCode=validLegacyCall?410:403;
  res.end(JSON.stringify({
    schema:'td613.site.browser-reset-retired/v1',
    status:validLegacyCall?'RETIRED':'DENIED',
    destructive:false,
    storage_mutation:false
  }));
}
