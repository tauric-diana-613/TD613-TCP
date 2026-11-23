import io,zipfile,stat,json,pathlib,sys,os,socket
sys.path.insert(0,'/runner');from static_intake_guard import inspect
rows=[]
def test(name,data,state):
 r=inspect(data);assert r['state']==state,(name,r);assert r.get('hydration')=='HYDRATION_NOT_ESTABLISHED';rows.append({'name':name,'input_class':'INERT_SYNTHETIC_CONTROL_NOT_EIGHTH_ARTIFACT','result':r})
def z(name,payload=b'fixture',symlink=False):
 out=io.BytesIO()
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as f:
  i=zipfile.ZipInfo(name)
  if symlink:i.external_attr=(stat.S_IFLNK|0o777)<<16
  f.writestr(i,payload,compress_type=zipfile.ZIP_DEFLATED)
 return out.getvalue()
test('opaque bytes',b'INERT TEST FIXTURE ONLY','HELD_UNSUPPORTED_FORMAT')
test('executable magic',b'\x7fELF INERT HEADER NOT PROGRAM','HELD_EXECUTABLE_NO_EXECUTION')
test('parent path escape',z('../outside'),'HELD_PATH_ESCAPE')
test('absolute path escape',z('/outside'),'HELD_PATH_ESCAPE')
test('symlink',z('link',b'/outside',True),'HELD_SYMLINK')
test('nested archive metadata',z('inner.zip'),'HELD_NESTED_CONTAINER')
test('decompression ratio',z('ratio',b'A'*1000000),'HELD_DECOMPRESSION_LIMIT')
test('bounded zip listing',z('readme.txt'),'CLASSIFIED_ZIP_STATIC_METADATA_ONLY')
assert not pathlib.Path('/workspace').exists() and not pathlib.Path('/home').exists();assert not any('TOKEN' in k or 'KEY' in k or 'PROXY' in k for k in os.environ)
try:pathlib.Path('/app/encyclopedia/vix-cyb.html').write_text('INERT NEGATIVE CONTROL');raise AssertionError('READONLY_FAILURE')
except OSError as e:rows.append({'name':'source write refused','errno':e.errno,'refused':True})
s=socket.socket();s.settimeout(1);error=s.connect_ex(('1.1.1.1',443));assert error!=0;rows.append({'name':'outbound fixed canary blocked','errno':error,'actual_external_contact':False})
print(json.dumps({'classification':'SANDBOX_AND_INTAKE_ENGINEERING_CONTROLS_NOT_PRIMARY_MODEL_RESULTS','controls':rows,'eighth_artifact_received':False},indent=2))
