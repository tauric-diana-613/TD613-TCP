/* Same-origin browser-data reset handled by the existing Dome-World shell function.
 * No new Vercel function and no server-side database mutation.
 */
const E='td613.site.browser-reset/2026-09-27-v1';
export default function handleSiteEpochReset(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  const site=String(req.headers?.['sec-fetch-site']||'');
  if(String(req.method||'').toUpperCase()!=='POST'||req.headers?.['x-td613-reset-epoch']!==E||(site&&site!=='same-origin')){
    res.statusCode=403;
    res.end(JSON.stringify({status:'DENIED'}));
    return;
  }
  res.setHeader('Clear-Site-Data','"cache", "cookies", "storage"');
  res.setHeader('X-TD613-Site-Epoch',E);
  res.statusCode=200;
  res.end(JSON.stringify({schema:'td613.site.browser-reset/v1',epoch:E,scope:'this-browser-origin',local_cleanup_required:true}));
}
