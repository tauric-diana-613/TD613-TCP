"""Frozen byte-inspection guard; no extraction or execution, including on unknown +1."""
import io,zipfile,pathlib,stat,hashlib
MAX_INPUT=16777216;MAX_MEMBERS=256;MAX_EXPANDED=33554432;MAX_RATIO=100

def inspect(data):
 if len(data)>MAX_INPUT:return {'state':'HELD_RESOURCE_LIMIT','hydration':'HYDRATION_NOT_ESTABLISHED'}
 r={'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'execution_allowed':False,'network_allowed':False,'operator_authority':False,'hydration':'HYDRATION_NOT_ESTABLISHED'}
 if data.startswith(b'PK\x03\x04'):
  try:
   with zipfile.ZipFile(io.BytesIO(data)) as z:
    info=z.infolist()
    if len(info)>MAX_MEMBERS:return dict(r,state='HELD_ARCHIVE_MEMBER_LIMIT')
    total=0
    for m in info:
     name=m.filename;p=pathlib.PurePosixPath(name)
     if p.is_absolute() or '..' in p.parts or '\\' in name or (p.parts and ':' in p.parts[0]):return dict(r,state='HELD_PATH_ESCAPE')
     if stat.S_ISLNK(m.external_attr>>16):return dict(r,state='HELD_SYMLINK')
     if m.flag_bits&1:return dict(r,state='HELD_ENCRYPTED_ARCHIVE')
     total+=m.file_size
     if total>MAX_EXPANDED or m.file_size/max(m.compress_size,1)>MAX_RATIO:return dict(r,state='HELD_DECOMPRESSION_LIMIT')
     if pathlib.PurePosixPath(name).suffix.lower() in {'.zip','.tar','.gz','.7z','.rar'}:return dict(r,state='HELD_NESTED_CONTAINER')
    return dict(r,state='CLASSIFIED_ZIP_STATIC_METADATA_ONLY',members=len(info),declared_expanded_bytes=total)
  except zipfile.BadZipFile:return dict(r,state='HELD_INVALID_CONTAINER')
 if data.startswith(b'%PDF-'):return dict(r,state='CLASSIFIED_PDF_STATIC_HEADER_ONLY')
 if data.startswith(b'\x7fELF') or data.startswith(b'MZ'):return dict(r,state='HELD_EXECUTABLE_NO_EXECUTION')
 return dict(r,state='HELD_UNSUPPORTED_FORMAT')
