"""Cut a character or creature out of its illustration's background with the anime segmentation model
skytnt/anime-seg (isnetis.onnx, Apache-2.0), so the art can stand inside a scene.

usage: python3 cutout.py MODEL.onnx IN.webp OUT.webp [--keep-largest]
MODEL is isnetis.onnx (anime-seg, for characters) or BiRefNet_lite (onnx-community/BiRefNet_lite-ONNX, MIT, for creatures
and scenes that fill the frame); the script tells them apart by their input name.
Writes an RGBA webp cropped to the subject, with a soft 1px edge.
"""
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

model, src, dst = sys.argv[1:4]
keep_largest = '--keep-largest' in sys.argv
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
im = Image.open(src).convert('RGB'); w, h = im.size
s = 1024 / max(w, h); nw, nh = int(w * s), int(h * s)
inp = sess.get_inputs()[0]
if inp.name == 'img':  # anime-seg: letterboxed 1024 square, output 0..1
    canvas = np.zeros((1024, 1024, 3), np.float32); px, py = (1024 - nw) // 2, (1024 - nh) // 2
    canvas[py:py + nh, px:px + nw] = np.asarray(im.resize((nw, nh), Image.LANCZOS), np.float32) / 255
    mask = sess.run(None, {'img': canvas.transpose(2, 0, 1)[None]})[0][0, 0][py:py + nh, px:px + nw]
else:  # BiRefNet: stretched 1024 square, ImageNet normalisation, logits out
    x = (np.asarray(im.resize((1024, 1024), Image.BILINEAR), np.float32) / 255 - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    mask = 1 / (1 + np.exp(-sess.run(None, {inp.name: x.transpose(2, 0, 1)[None].astype(np.float32)})[-1][0, 0]))
m = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)
a = np.asarray(m).astype(np.float32) / 255
a = np.clip((a - 0.35) / 0.4, 0, 1)  # firm up the edge
if keep_largest:  # drop small islands (background figures, text boxes)
    from scipy import ndimage
    lab, nlab = ndimage.label(a > 0.5)
    if nlab > 1:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, nlab + 1)); big = 1 + int(np.argmax(sizes))
        a = a * ndimage.binary_dilation(lab == big, iterations=3)
alpha = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
out = im.convert('RGBA'); out.putalpha(alpha)
bb = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
if bb: out = out.crop((max(0, bb[0] - 6), max(0, bb[1] - 6), min(w, bb[2] + 6), min(h, bb[3] + 6)))
out.save(dst, 'WEBP', quality=90)
print(dst, out.size)
