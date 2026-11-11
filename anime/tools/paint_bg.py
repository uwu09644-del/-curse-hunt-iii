"""Paint anime background plates with a local Stable Diffusion 1.5 anime model (CPU).

usage: python3 paint_bg.py MODEL.safetensors LCM_LORA.safetensors PLATES.json OUT_DIR [ONLY_ID ...]

PLATES.json: [{"id": "ashford_street", "prompt": "...", "seed": 1, "w": 768, "h": 432}, ...]
Each plate is generated with the LCM LoRA (6 steps), upscaled 2x and saved as OUT_DIR/<id>.webp.
Model used for the series: gsdf/Counterfeit-V3.0 (CreativeML OpenRAIL-M), LCM-LoRA (latent-consistency/lcm-lora-sdv1-5).
Backgrounds only: characters are rendered separately, so every plate prompt asks for no people.
"""
import json, os, sys, time
import torch
from diffusers import StableDiffusionPipeline, LCMScheduler
from PIL import Image, ImageFilter, ImageEnhance

model, lora, plates_path, out_dir = sys.argv[1:5]
only = set(sys.argv[5:])
os.makedirs(out_dir, exist_ok=True)
torch.set_num_threads(os.cpu_count() or 4)
pipe = StableDiffusionPipeline.from_single_file(model, torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
pipe.load_lora_weights(lora); pipe.fuse_lora()
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.set_progress_bar_config(disable=True)
STYLE = 'anime background art, scenery, no humans, masterpiece, best quality, detailed painted background, cel shading, studio anime film still, soft lighting, '
NEG = 'person, people, human, character, girl, boy, face, text, watermark, signature, logo, lowres, blurry, jpeg artifacts, deformed'
for p in json.load(open(plates_path)):
    if only and p['id'] not in only: continue
    out = os.path.join(out_dir, p['id'] + '.webp')
    if os.path.exists(out) and not only: continue
    t0 = time.time()
    g = torch.Generator().manual_seed(p.get('seed', 1))
    img = pipe(STYLE + p['prompt'], negative_prompt=NEG, num_inference_steps=p.get('steps', 6), guidance_scale=p.get('cfg', 1.6), width=p.get('w', 768), height=p.get('h', 432), generator=g).images[0]
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    img = ImageEnhance.Color(img).enhance(1.06)
    img.save(out, 'WEBP', quality=88)
    print(p['id'], f'{time.time() - t0:.1f}s', flush=True)
