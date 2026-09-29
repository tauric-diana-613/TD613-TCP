/* Retired compatibility endpoint for the former origin-wide browser reset.
 * Kept only so legacy callers receive a bounded response without Clear-Site-Data.
 */
export default function handleSiteEpochReset(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-TD613-Site-Epoch','RETIRED');
  res.statusCode=410;
  res.end(JSON.stringify({
    schema:'td613.site.browser-reset/v2-retired',
    status:'RETIRED',
    destructive_reset:false,
    clear_site_data:false
  }));
}
