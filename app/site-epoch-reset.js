/* One-time origin-local destructive browser reset. No external URLs or persistent audit payloads. */
(async()=>{
  const E="td613.site.browser-reset/2026-09-27-v1", K="td613.site.browser-reset.epoch";
  const status=document.getElementById('status'),detail=document.getElementById('detail'),retry=document.getElementById('retry');
  const raw=new URLSearchParams(location.search).get('return')||'/';
  const target=(()=>{try{const u=new URL(raw,location.origin);return u.origin===location.origin&&u.pathname!=='/site-epoch-reset.html'?u.pathname+u.search+u.hash:'/'}catch{return'/'}})();
  const errors=[],notes=[];
  const bounded=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(label+' timed out')),ms))]);
  try{
    const response=await bounded(fetch('/api/site-epoch-reset',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'X-TD613-Reset-Epoch':E,'Cache-Control':'no-store'}}),8000,'HTTP reset');
    if(!response.ok||response.headers.get('X-TD613-Site-Epoch')!==E)throw Error('Server did not acknowledge this epoch');
    notes.push('Clear-Site-Data requested from this origin');
  }catch(error){errors.push('HTTP reset: '+String(error.message||error))}
  try{
    if(globalThis.caches?.keys)for(const name of await bounded(caches.keys(),3500,'Cache Storage list')){
      if(await bounded(caches.delete(name),3500,'Cache deletion'))notes.push('Cache removed: '+name);
    }
  }catch(error){errors.push('Cache Storage: '+String(error.message||error))}
  try{
    if(navigator.serviceWorker?.getRegistrations)for(const reg of await bounded(navigator.serviceWorker.getRegistrations(),3500,'Worker list')){
      if(new URL(reg.scope,location.href).origin===location.origin){
        if(await bounded(reg.unregister(),3500,'Worker unregister'))notes.push('Worker unregistered: '+reg.scope);
        else errors.push('Worker unregister declined: '+reg.scope);
      }
    }
  }catch(error){errors.push('Service workers: '+String(error.message||error))}
  const known=['td613-marrowline-conversations-v1','td613-ash-keep','td613-ash-ingress-v1','td613-ash-return-sandbox'];
  const names=new Set(known);
  try{
    if(globalThis.indexedDB?.databases){for(const db of await bounded(indexedDB.databases(),4000,'Database enumeration'))if(db.name)names.add(db.name);}
    else notes.push('Database enumeration unavailable; deleting all known TD613 databases plus requesting browser-native storage eviction');
  }catch(error){errors.push('Database enumeration: '+String(error.message||error))}
  if(globalThis.indexedDB?.deleteDatabase)for(const name of names){
    try{
      await bounded(new Promise((resolve,reject)=>{
        const req=indexedDB.deleteDatabase(name);
        req.onsuccess=()=>resolve();
        req.onerror=()=>reject(req.error||Error('Deletion failed'));
        req.onblocked=()=>reject(Error('Blocked by another open tab'));
      }),4500,'Delete '+name);
      notes.push('Database deleted: '+name);
    }catch(error){errors.push('IndexedDB '+name+': '+String(error.message||error))}
  }
  try{localStorage.clear()}catch(error){errors.push('localStorage: '+String(error.message||error))}
  try{sessionStorage.clear()}catch(error){errors.push('sessionStorage: '+String(error.message||error))}
  if(errors.length){
    status.textContent='Reset incomplete. Close other TD613 tabs and retry.';
    detail.textContent=errors.join(' · ');retry.hidden=false;retry.onclick=()=>location.reload();return;
  }
  let marked=false;
  try{
    localStorage.setItem(K,E);marked=localStorage.getItem(K)===E;
  }catch{}
  if(!marked)try{sessionStorage.setItem(K,E);marked=sessionStorage.getItem(K)===E}catch{}
  status.textContent='Old TD613 browser data cleared. Opening a fresh session…';
  const next=new URL(target,location.origin);
  next.searchParams.set('td613_site_epoch',E);
  location.replace(next.href);
})().catch(error=>{
  document.getElementById('status').textContent='Reset interrupted: '+String(error.message||error);
  const retry=document.getElementById('retry');retry.hidden=false;retry.onclick=()=>location.reload();
});
