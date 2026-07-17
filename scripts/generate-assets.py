from pathlib import Path
import math
import struct
import wave

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "build" / "icons"
FIXTURE_DIR = ROOT / "tests" / "e2e" / "fixtures"
ICON_DIR.mkdir(parents=True, exist_ok=True)
FIXTURE_DIR.mkdir(parents=True, exist_ok=True)

size = 1024
image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
coral = (255, 56, 92, 255)
white = (255, 255, 255, 255)
draw.rounded_rectangle((48, 48, 976, 976), radius=224, fill=coral)
draw.rounded_rectangle((164, 236, 860, 760), radius=132, fill=white)
draw.polygon([(548, 724), (710, 724), (598, 856)], fill=white)
draw.polygon([
    (288, 620), (288, 384), (376, 384), (512, 528), (648, 384),
    (736, 384), (736, 620), (648, 620), (648, 510), (512, 652),
    (376, 510), (376, 620),
], fill=coral)

svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-labelledby="title">
  <title id="title">Mineloa</title>
  <rect x="48" y="48" width="928" height="928" rx="224" fill="#FF385C"/>
  <path class="brand-glyph" d="M296 236h432c73 0 132 59 132 132v260c0 73-59 132-132 132H710L598 856l-50-96H296c-73 0-132-59-132-132V368c0-73 59-132 132-132z" fill="#FFFFFF"/>
  <path d="M288 620V384h88l136 144 136-144h88v236h-88V510L512 652 376 510v110z" fill="#FF385C"/>
</svg>
"""

image.save(ICON_DIR / "icon.png")
image.save(ICON_DIR / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
image.save(ICON_DIR / "icon.icns", sizes=[(16, 16), (32, 32), (64, 64), (128, 128), (256, 256), (512, 512), (1024, 1024)])
(ICON_DIR / "icon.svg").write_text(svg, encoding="utf-8")

sample_rate = 48_000
duration_seconds = 3
with wave.open(str(FIXTURE_DIR / "fake-audio.wav"), "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(sample_rate)
    frames = bytearray()
    for index in range(sample_rate * duration_seconds):
        sample = int(3_000 * math.sin(2 * math.pi * 440 * index / sample_rate))
        frames.extend(struct.pack("<h", sample))
    output.writeframes(frames)
