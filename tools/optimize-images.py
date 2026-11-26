"""Generate responsive WebP copies. Originals are never modified.

Run locally with Python + Pillow when artwork changes. Generated assets and
src/image-variants.json are committed, so Cloudflare needs no image tooling.
"""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUTPUT = PUBLIC / 'media/optimized'
OUTPUT.mkdir(parents=True, exist_ok=True)
media = json.loads((PUBLIC / 'content/project-media.json').read_text(encoding='utf-8'))
sizes = json.loads((ROOT / 'src/image-sizes.json').read_text(encoding='utf-8'))
jobs = {}
for entry in media.values():
    jobs[entry.get('thumbnail') or entry['image']] = ('cover', [160, 320, 640, 960, 1440], 88)
for path in (PUBLIC / 'media/games').glob('*-thumb.webp'):
    jobs['/' + path.relative_to(PUBLIC).as_posix()] = ('game', [180, 360, 540], 84)
jobs['/media/portrait.webp'] = ('portrait', [320, 480, 750], 88)

manifest = {}
report = []
for source, (kind, widths, quality) in jobs.items():
    path = PUBLIC / source.lstrip('/')
    source_bytes = path.read_bytes()
    original = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    image_width, image_height = original.size
    variants = []
    for width in sorted(set(min(width, image_width) for width in widths)):
        height = max(1, round(image_height * width / image_width))
        version = hashlib.sha256(source_bytes + f'{width}:{quality}:webp-v1'.encode()).hexdigest()[:12]
        name = f'{path.stem}-{version}-{width}w.webp'
        dest = OUTPUT / name
        if not dest.exists():
            original.resize((width, height), Image.Resampling.LANCZOS).save(dest, 'WEBP', quality=quality, method=6)
        variants.append({'src': '/media/optimized/' + name, 'width': width, 'height': height, 'bytes': dest.stat().st_size})
    manifest[source] = {'width': image_width, 'height': image_height, 'variants': variants}
    target_width = 360 if kind == 'game' else 960 if kind == 'cover' else 750
    selected = next((v for v in variants if v['width'] >= target_width), variants[-1])
    report.append({'source': source, 'kind': kind, 'before': len(source_bytes), 'after': selected['bytes'], 'selectedWidth': selected['width']})
    assert path.read_bytes() == source_bytes, 'Original image changed'

(ROOT / 'src/image-variants.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
hero_source = media['one-more-move'].get('thumbnail') or media['one-more-move']['image']
hero = manifest[hero_source]
hero_variant = next((v for v in hero['variants'] if v['width'] >= 960), hero['variants'][-1])
srcset = ', '.join(f"{v['src']} {v['width']}w" for v in hero['variants'])
preload = '\n'.join([
    '    <!-- responsive-hero-preload:start -->',
    f'    <link rel="preload" as="image" href="{hero_variant["src"]}" imagesrcset="{srcset}" imagesizes="{html.escape(sizes["hero"], quote=True)}" fetchpriority="high" />',
    '    <!-- responsive-hero-preload:end -->',
])
index_path = ROOT / 'index.html'
index = index_path.read_text(encoding='utf-8')
index = re.sub(r'    <!-- responsive-hero-preload:start -->[\s\S]*?    <!-- responsive-hero-preload:end -->\n?', '', index)
index = index.replace('  </head>', preload + '\n  </head>')
index_path.write_text(index, encoding='utf-8')
qa = ROOT / 'qa'
qa.mkdir(exist_ok=True)
(qa / 'image-optimization.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
for kind in ('game', 'cover', 'portrait'):
    items = [item for item in report if item['kind'] == kind]
    before = sum(item['before'] for item in items)
    after = sum(item['after'] for item in items)
    print(f'{kind}: {len(items)} images, {before / 1024:.1f} KB -> {after / 1024:.1f} KB ({(1 - after / before) * 100:.1f}% smaller)')
print('Hero:', next(item for item in report if item['source'] == hero_source))
