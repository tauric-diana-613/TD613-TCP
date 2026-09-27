/* Same-origin browser reset handshake: no server-side data is deleted. */
const E="td613.site.browser-reset/2026-09-27-v1";
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  const site=String(req.headers?.['sec-fetch-site']||'');
  if(req.method!=='POST'||req.headers?.['x-td613-reset-epoch']!==E||(site&&site!=='same-origin')){
    return res.status(403).json({status:'DENIED'});
  }
  res.setHeader('Clear-Site-Data','"cache", "cookies", "storage"');
  res.setHeader('X-TD613-Site-Epoch',E);
  return res.status(200).json({schema:'td613.site.browser-reset/v1',epoch:E,scope:'this-browser-origin',local_cleanup_required:true});
}
