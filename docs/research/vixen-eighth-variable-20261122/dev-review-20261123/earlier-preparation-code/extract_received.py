import pathlib,sys,json,hashlib,re,datetime
sys.path.insert(0,str(pathlib.Path(__file__).parent));from sandbox import sandbox,ROOT
reg=json.loads((ROOT/'evidence/intake-register.json').read_text());out=[]
for row in reg['records']:
 sid=row['source_id'];folder=ROOT/'derived'/sid;folder.mkdir();inp=ROOT/row['original_path']
 r,meta=sandbox(['/usr/bin/pdfinfo','/input.pdf'],input_path=inp,output=folder/'pdfinfo.txt');assert r.returncode==0,(sid,meta)
 pages=int(re.search(rb'^Pages:\s*(\d+)',r.stdout,re.M).group(1));assert pages==row['expected_pages'],sid
 r,receipt=sandbox(['/usr/bin/pdftotext','-layout','-enc','UTF-8','/input.pdf','-'],input_path=inp,output=folder/'extracted.txt');assert r.returncode==0,(sid,receipt)
 assert r.stdout.strip();part=r.stdout.decode('utf-8').split('\f');pagearr=part[:-1] if not part[-1].strip() else part;assert len(pagearr)==pages,(sid,len(pagearr),pages)
 spans=[];offset=0
 for i,text in enumerate(pagearr,1):spans.append({'page':i,'character_start':offset,'character_length':len(text),'sha256':hashlib.sha256(text.encode()).hexdigest(),'text':text});offset+=len(text)+1
 (folder/'pages.json').write_text(json.dumps(spans,ensure_ascii=False,indent=2))
 out.append({'source_id':sid,'input_sha256':row['received_sha256'],'pages':pages,'expected_pages_match':True,'extract_sha256':hashlib.sha256(r.stdout).hexdigest(),'extract_bytes':len(r.stdout),'nonempty_pages':sum(bool(x.strip()) for x in pagearr),'derived_only_not_indexed':True,'active_content_executed':False,'outbound_network_available':False,'wall_seconds':receipt['elapsed_seconds']})
 print(sid,'pages',pages,'extract bytes',len(r.stdout))
(ROOT/'evidence/pdf-intake-results.json').write_text(json.dumps(out,indent=2))
