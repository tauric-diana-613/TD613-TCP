import json, hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path('/mnt/data')
BASE=ROOT/'VIXEN_CYBERNETICS_ASTRA_HANDOFF(10).html'
NEW=ROOT/'vixen_amari_surgical/VIXEN_CYBERNETICS_ASTRA_HANDOFF.html'

def check(path, width):
    with sync_playwright() as p:
      browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
      page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='reduce')
      errs=[];reqs=[]
      page.on('pageerror',lambda e: errs.append(str(e)))
      page.on('request',lambda r:reqs.append(r.url))
      page.set_content(path.read_text(),wait_until='domcontentloaded',timeout=45000)
      page.evaluate("() => document.querySelector('button[data-view=\"protocols\"]').click()")
      page.locator('[data-inst-family="TRACKS"]').first.click()
      targets=page.locator('#protocolsReaderPanel [data-open-ref]')
      assert targets.count()>0,(path.name,'no target')
      target=targets.first.get_attribute('data-open-ref')
      page.evaluate('''() => {
        window.__amari={replace:0,push:0,scroll:0};
        const r=window.history.replaceState.bind(window.history), p=window.history.pushState.bind(window.history);
        window.history.replaceState=function(...args){window.__amari.replace++;return r(...args)};
        window.history.pushState=function(...args){window.__amari.push++;return p(...args)};
        const s=window.scrollTo.bind(window);
        window.scrollTo=function(...args){window.__amari.scroll++;try{return s(...args)}catch(e){}};
      }''')
      page.evaluate('''() => document.querySelector('#protocolsReaderPanel [data-open-ref]').click()''')
      data=page.evaluate('''() => ({events:window.__amari,hash:location.hash,view:document.body.dataset.view,selected:document.querySelector('#protocolsListContainer [aria-current="true"]')?.getAttribute('data-select-inst'),reader:document.querySelector('#protocolsReaderPanel h2')?.textContent,summary:document.querySelector('#protocolsResultSummary')?.textContent,focus:document.activeElement?.tagName,externalScripts:document.querySelectorAll('script[src],link[href^="http"]').length, overflow:document.documentElement.scrollWidth>innerWidth})''')
      data.update({'input':str(path.name),'width':width,'expected':target,'pageErrors':errs,'requests':reqs})
      browser.close();return data

if __name__=='__main__':
    results=[]
    for file in [BASE,NEW]:
      for width in [1440,390,320]:results.append(check(file,width))
    out=Path('/mnt/data/vixen_amari_surgical/BROWSER_NEGATIVE_CONTROL_RECEIPT.json')
    out.write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(json.dumps(results,ensure_ascii=False,indent=2))
