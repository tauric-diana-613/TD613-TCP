#!/usr/bin/env python3
"""Offline MiniLM sentence encoder. Loads only local ONNX/tokenizer files.

No Hub client, HTTP transport, remote code, or automatic checkpoint download.
Mean pooling and normalization follow the checkpoint author's model card.
"""
from pathlib import Path
import hashlib
import json
import os

class LocalSentenceEncoder:
    def __init__(self,folder):
        import numpy as np
        import onnxruntime as ort
        from tokenizers import Tokenizer
        root=Path(folder)
        if not root.is_absolute() or not root.is_dir() or root.is_symlink():
            raise ValueError("LOCAL_ONNX_MODEL_DIRECTORY_REQUIRED")
        for p in root.parents:
            if p.is_symlink():raise ValueError("LOCAL_MODEL_PARENT_LINK_REFUSED")
        for name in ('model.onnx','tokenizer.json'):
            if not (root/name).is_file() or (root/name).is_symlink():
                raise ValueError("LOCAL_ONNX_CHECKPOINT_INCOMPLETE")
        self.np=np
        self.tokenizer=Tokenizer.from_file(str(root/'tokenizer.json'))
        self.tokenizer.enable_truncation(max_length=256)
        self.tokenizer.enable_padding(pad_id=0,pad_token='[PAD]')
        opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
        self.session=ort.InferenceSession(str(root/'model.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
        self.input_names={i.name for i in self.session.get_inputs()}
        if not {'input_ids','attention_mask'}<=self.input_names:
            raise ValueError("LOCAL_ONNX_MODEL_INPUT_CONTRACT")

    def encode(self,texts,*,normalize_embeddings=True,show_progress_bar=False,batch_size=24):
        if not normalize_embeddings:raise ValueError("NORMALIZED_RETRIEVAL_VECTORS_REQUIRED")
        if isinstance(texts,str) or not texts or not all(isinstance(t,str) for t in texts):
            raise ValueError("LOCAL_TEXT_BATCH_REQUIRED")
        np=self.np;vectors=[]
        for begin in range(0,len(texts),batch_size):
            tokens=self.tokenizer.encode_batch(texts[begin:begin+batch_size])
            arrays={'input_ids':np.array([x.ids for x in tokens],dtype=np.int64),
                    'attention_mask':np.array([x.attention_mask for x in tokens],dtype=np.int64),
                    'token_type_ids':np.array([x.type_ids for x in tokens],dtype=np.int64)}
            feed={k:v for k,v in arrays.items() if k in self.input_names}
            output=self.session.run(None,feed)[0]
            if output.ndim==3:
                mask=arrays['attention_mask'][...,None]
                output=(output*mask).sum(axis=1)/np.maximum(mask.sum(axis=1),1e-9)
            if output.ndim!=2 or not np.isfinite(output).all():raise ValueError("LOCAL_MODEL_VECTOR_CONTRACT")
            norm=np.linalg.norm(output,axis=1,keepdims=True)
            if (norm<=0).any():raise ValueError("LOCAL_MODEL_ZERO_VECTOR")
            vectors.extend(output/norm)
        return np.asarray(vectors,dtype=np.float32)

def fingerprint(folder):
    root=Path(folder);rows=[]
    for parent,dirs,files in os.walk(root,followlinks=False):
        dirs.sort();files.sort()
        if any((Path(parent)/d).is_symlink() for d in dirs):raise ValueError("LOCAL_MODEL_LINK_REFUSED")
        for name in files:
            p=Path(parent)/name
            if p.is_symlink():raise ValueError("LOCAL_MODEL_LINK_REFUSED")
            if p.is_file():rows.append([p.relative_to(root).as_posix(),hashlib.sha256(p.read_bytes()).hexdigest()])
    return hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode('utf8')).hexdigest()
