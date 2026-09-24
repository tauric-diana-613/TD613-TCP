#!/usr/bin/env python3
"""Reproduce coarse pixel descriptors, never reconstruct Unicode or score art.

Requires Pillow. Uses original RGB samples, no resizing and no OCR. Coordinates
are manually annotated in atlas.json. Grayscale threshold sensitivity is retained.
"""
import hashlib
import json
import statistics
from pathlib import Path
from PIL import Image, __version__ as pillow_version

ROOT = Path(__file__).resolve().parent


def bins(values, n):
    return [round(statistics.mean(values[i * len(values)//n:(i+1)*len(values)//n]), 6)
            for i in range(n)]


def profile(im, rect, threshold):
    gray = im.crop(rect).convert('L')
    w, h = gray.size
    px = list(gray.getdata())
    mask = [int(v >= threshold) for v in px]
    rows = [sum(mask[y*w:(y+1)*w])/w for y in range(h)]
    cols = [sum(mask[x::w])/h for x in range(w)]
    grid = []
    for iy in range(24):
        row = []
        y0, y1 = iy*h//24, (iy+1)*h//24
        for ix in range(16):
            x0, x1 = ix*w//16, (ix+1)*w//16
            ink = sum(sum(mask[y*w+x0:y*w+x1]) for y in range(y0,y1))
            row.append(round(ink/((x1-x0)*(y1-y0)),6))
        grid.append(row)
    return {'threshold':threshold,'bright_pixel_fraction':round(sum(mask)/len(mask),6),
            'row_occupancy_64_bins':bins(rows,64),'column_occupancy_32_bins':bins(cols,32),
            'occupancy_grid_24x16':grid}


def line_envelope(im, region):
    x0,y0,x1,y1=region['crop_xyxy']
    b0,b1=region['base_band_y']
    h=b1-b0
    gray=im.convert('L')
    upper=[]; lower=[]
    for k in range(32):
        left=x0+k*(x1-x0)//32; right=x0+(k+1)*(x1-x0)//32
        ys=[y for y in range(y0,y1) if any(gray.getpixel((x,y))>=140 for x in range(left,right))]
        upper.append(round(max(0,b0-min(ys))/h,4) if ys else None)
        lower.append(round(max(0,max(ys)-(b1-1))/h,4) if ys else None)
    return {'id':region['id'],'threshold':140,'manual_base_band_height_px':h,
            'upper_extent_in_base_band_heights_32_bins':upper,
            'lower_extent_in_base_band_heights_32_bins':lower,
            'attribution':'All bright ink in each vertical strip; no assignment to characters or individual combining marks.'}


def main():
    manifest=json.loads((ROOT/'atlas.json').read_text())
    results=[]
    for e in manifest['entries']:
        p=ROOT/e['file']
        assert hashlib.sha256(p.read_bytes()).hexdigest()==e['sha256'], e['id']
        im=Image.open(p).convert('RGB')
        w,h=im.size
        rect=tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(e['roi_normalized_xyxy']))
        results.append({'id':e['id'],'image_size_px':[w,h],'roi_xyxy':rect,
                        'profiles':[profile(im,rect,t) for t in [100,140,180]],
                        'line_envelopes':[line_envelope(im,r) for r in e.get('line_regions',[])]})
    result={'schema':'td613.native-prosody-pixels/v1','pillow_version':pillow_version,
            'method':'Pillow RGB-to-L grayscale; count pixels >= threshold inside manual region; no resampling.',
            'limitations':['Base letters, marks and any residual UI are all counted.',
                           'Font, zoom, screenshot compression, viewport and wrapping confound cross-image comparisons.',
                           'Occupancy is descriptive geometry, not a metric of expressive success.',
                           'Three thresholds expose binarization sensitivity; they are not independent observations.'],
            'images':results}
    (ROOT/'pixel-profiles.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(f'Checked original hashes and measured {len(results)} images; no image bytes changed.')


if __name__=='__main__':
    main()
