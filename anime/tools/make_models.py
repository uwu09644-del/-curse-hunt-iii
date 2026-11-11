"""Build the episode's character models from CC0 VRoid Studio sample avatars.

Each source .vrm (a GLB file) is rewritten with smaller textures and recoloured to match the series' character
designs (Takuto: white hair, red jacket, red eyes; Sieg: white hair, crimson eye; Nemu: amber eyes).
Geometry, rig, expressions and spring bones are left untouched.

usage: python3 make_models.py SOURCE_DIR OUT_DIR
SOURCE_DIR holds HairSample_Male.vrm, Sakurada_Fumiriya.vrm and HairSample_Female.vrm
(github.com/madjin/vrm-samples, vroid/beta, licence CC0 per each model's VRM meta).
"""
import io, json, struct, sys
from PIL import Image

def read_glb(path):
    b = open(path, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + n])
    o = 20 + n
    bl = struct.unpack('<I', b[o:o + 4])[0]
    return j, bytearray(b[o + 8:o + 8 + bl])

def write_glb(path, j, views):
    # views: list of bytes, one per bufferView, in order
    blob = bytearray()
    for i, v in enumerate(views):
        while len(blob) % 4: blob.append(0)
        j['bufferViews'][i]['byteOffset'] = len(blob)
        j['bufferViews'][i]['byteLength'] = len(v)
        blob += v
    while len(blob) % 4: blob.append(0)
    j['buffers'] = [{'byteLength': len(blob)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    out = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + 8 + len(blob))
    out += struct.pack('<I4s', len(js), b'JSON') + js + struct.pack('<I4s', len(blob), b'BIN\x00') + bytes(blob)
    open(path, 'wb').write(out)

def lum(im):
    return im.convert('L')

def tint(im, rgb, lo=0.0, hi=1.0, gamma=1.0):
    """Recolour by luminance: dark parts toward lo*rgb, light parts toward hi*rgb; alpha kept."""
    a = im.getchannel('A') if im.mode == 'RGBA' else None
    L = lum(im).point(lambda v: int(255 * ((v / 255) ** gamma)))
    chans = [L.point(lambda v, c=c: int(255 * min(1, c * (lo + (hi - lo) * v / 255)))) for c in rgb]
    out = Image.merge('RGB', chans)
    if a is not None: out.putalpha(a)
    return out

def normalize(im):
    """Stretch luminance so a dark hair texture keeps its shading when lightened."""
    a = im.getchannel('A') if im.mode == 'RGBA' else None
    L = lum(im); lo, hi = L.getextrema()
    if hi - lo < 8: return im
    L = L.point(lambda v: int(255 * (v - lo) / (hi - lo)))
    out = Image.merge('RGB', [L, L, L])
    if a is not None: out.putalpha(a)
    return out

CAST = {
    'takuto': ('HairSample_Male.vrm', {
        'Hair_00': lambda im: tint(normalize(im), (0.93, 0.93, 1.0), 0.58, 1.06),
        'HairBack': lambda im: tint(normalize(im), (0.93, 0.93, 1.0), 0.58, 1.06),
        'Tops_01': lambda im: tint(im, (0.78, 0.12, 0.17), 0.18, 1.05, 1.3),
        'EyeIris': lambda im: tint(im, (1.0, 0.22, 0.25), 0.12, 1.05),
        'FaceBrow': lambda im: tint(im, (0.62, 0.62, 0.7), 0.6, 0.9),
    }, {'HAIR': ((1, 1, 1, 1), (0.74, 0.74, 0.86, 1)), 'Tops': ((1, 1, 1, 1), (0.62, 0.5, 0.58, 1))}),
    'sieg': ('Sakurada_Fumiriya.vrm', {
        'Hair_00': lambda im: tint(normalize(im), (0.95, 0.94, 0.9), 0.6, 1.05),
        'HairBack': lambda im: tint(normalize(im), (0.95, 0.94, 0.9), 0.6, 1.05),
        'EyeIris': lambda im: tint(im, (0.95, 0.2, 0.32), 0.12, 1.05),
        'FaceBrow': lambda im: tint(im, (0.66, 0.64, 0.6), 0.6, 0.9),
        'Accessory': lambda im: tint(im, (0.62, 0.1, 0.16), 0.3, 1.0),
    }, {'HAIR': ((1, 1, 1, 1), (0.76, 0.74, 0.8, 1))}),
    'sable': ('Sakurada_Fumiriya.vrm', {  # Mr. Sable: a man-shaped shadow in a black suit with pale, glowing irises
        'Face_00': lambda im: tint(im, (0.07, 0.07, 0.1), 0.5, 1.1), 'Body_00': lambda im: tint(im, (0.07, 0.07, 0.1), 0.5, 1.1),
        'Hair_00': lambda im: tint(im, (0.08, 0.08, 0.11), 0.4, 1.0), 'HairBack': lambda im: tint(im, (0.08, 0.08, 0.11), 0.4, 1.0),
        'EyeWhite': lambda im: tint(im, (0.04, 0.04, 0.06), 0.5, 1.0), 'EyeIris': lambda im: tint(im, (0.86, 0.93, 1.0), 0.7, 1.1),
        'Tops_01': lambda im: tint(im, (0.15, 0.15, 0.19), 0.35, 1.0), 'Bottoms': lambda im: tint(im, (0.1, 0.1, 0.13), 0.4, 1.0),
        'Accessory': lambda im: tint(im, (0.3, 0.32, 0.4), 0.4, 1.0), 'FaceMouth': lambda im: tint(im, (0.6, 0.7, 0.9), 0.3, 1.0), 'FaceBrow': lambda im: tint(im, (0.05, 0.05, 0.07), 0.5, 1.0),
    }, {'SKIN': ((1, 1, 1, 1), (0.6, 0.6, 0.7, 1)), 'HAIR': ((1, 1, 1, 1), (0.6, 0.6, 0.7, 1))}),
    'rin': ('Sendagaya_Shino.vrm', {  # Rin Ashveil: Takuto's white hair (the running joke), crimson eyes, red bow
        'Hair_00': lambda im: tint(normalize(im), (0.95, 0.93, 0.95), 0.6, 1.05), 'HairBack': lambda im: tint(normalize(im), (0.95, 0.93, 0.95), 0.6, 1.05),
        'EyeIris': lambda im: tint(im, (1.0, 0.2, 0.26), 0.12, 1.05), 'FaceBrow': lambda im: tint(im, (0.66, 0.62, 0.66), 0.6, 0.9),
        'Accessory': lambda im: tint(im, (0.78, 0.1, 0.16), 0.3, 1.05),
    }, {'HAIR': ((1, 1, 1, 1), (0.78, 0.74, 0.82, 1))}),
    'valentine': ('Darkness_Shibu.vrm', {  # Valentine: the Guild's theatrical appraiser, pink hair and a pink-black gown
        'Hair_00': lambda im: tint(normalize(im), (1.0, 0.66, 0.82), 0.45, 1.05), 'HairBack': lambda im: tint(normalize(im), (1.0, 0.66, 0.82), 0.45, 1.05),
        'Tops_01': lambda im: tint(im, (0.95, 0.42, 0.66), 0.12, 1.0), 'EyeIris': lambda im: tint(im, (1.0, 0.45, 0.75), 0.15, 1.05),
    }, {'HAIR': ((1, 1, 1, 1), (0.85, 0.6, 0.75, 1))}),
    'clerk': ('Sendagaya_Shibu.vrm', {  # the Guild receptionist: brown hair, green eyes
        'Hair_00': lambda im: tint(normalize(im), (0.6, 0.4, 0.26), 0.25, 1.0), 'HairBack': lambda im: tint(normalize(im), (0.6, 0.4, 0.26), 0.25, 1.0),
        'EyeIris': lambda im: tint(im, (0.35, 0.8, 0.45), 0.15, 1.05),
    }, {'HAIR': ((1, 1, 1, 1), (0.7, 0.6, 0.55, 1))}),
    'nemu': ('HairSample_Female.vrm', {
        'EyeIris': lambda im: tint(im, (1.0, 0.68, 0.22), 0.14, 1.05),
    }, {}),
}

def size_for(name):
    if 'Thumbnail' in name: return 8
    if name.endswith('_nml'): return 512
    if any(k in name for k in ('Body', 'Tops', 'Bottoms')): return 1024
    return 1024

def build(src_dir, out_dir, key):
    src, recolor, mats = CAST[key]
    j, binb = read_glb(f'{src_dir}/{src}')
    views = [bytes(binb[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]) for v in j['bufferViews']]
    for img in j['images']:
        name = img.get('name', '')
        im = Image.open(io.BytesIO(views[img['bufferView']]))
        im.load()
        im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
        for k, f in recolor.items():
            if k in name and not name.endswith(('_nml', '_spe', '_out')): im = f(im)
        m = size_for(name)
        if max(im.size) > m: im = im.resize((max(1, im.size[0] * m // max(im.size)), max(1, im.size[1] * m // max(im.size))), Image.LANCZOS)
        buf = io.BytesIO()
        opaque = im.mode == 'RGB' or im.getchannel('A').getextrema()[0] == 255
        if opaque and not name.endswith('_nml') and max(im.size) >= 512:
            im.convert('RGB').save(buf, 'JPEG', quality=88); img['mimeType'] = 'image/jpeg'
        else:
            im.save(buf, 'PNG', optimize=True); img['mimeType'] = 'image/png'
        views[img['bufferView']] = buf.getvalue()
    for mp in j['extensions']['VRM']['materialProperties']:
        for k, (col, shade) in mats.items():
            if k in mp['name']:
                mp.setdefault('vectorProperties', {})['_Color'] = list(col)
                mp['vectorProperties']['_ShadeColor'] = list(shade)
    meta = j['extensions']['VRM']['meta']
    meta['title'] = f"{meta.get('title', src)} (recoloured for Ruinbreaker as {key})"
    write_glb(f'{out_dir}/{key}.glb', j, views)  # a VRM 0.x file; .glb so any server sends it as glTF

if __name__ == '__main__':
    for k in CAST: build(sys.argv[1], sys.argv[2], k)
