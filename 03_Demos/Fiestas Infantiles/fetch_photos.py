#!/usr/bin/env python3
"""
Descarga 6 fotos de fiestas infantiles desde la API de Pexels y las
comprime a WebP para la galeria de 03_Demos/Fiestas Infantiles/index.html.

Uso:
  export PEXELS_API_KEY="tu_api_key_aqui"
  python3 fetch_photos.py

No hardcodea la API key -- la toma de la variable de entorno PEXELS_API_KEY.
"""
import json
import os
import subprocess
import shutil
import sys
import urllib.request
import urllib.parse

API_KEY = os.environ.get("PEXELS_API_KEY")
if not API_KEY:
    sys.exit("Falta la variable de entorno PEXELS_API_KEY. Corre:\n  export PEXELS_API_KEY=\"tu_key\"")

if not shutil.which("cwebp"):
    sys.exit("No se encontro 'cwebp' en el PATH. Instalalo con: brew install webp")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(SCRIPT_DIR, "img")
os.makedirs(IMG_DIR, exist_ok=True)

# query de busqueda -> nombre base del archivo (sin extension)
SEARCHES = [
    ("clown kids birthday party",      "gal-payasos"),
    ("magician kids party",            "gal-mago"),
    ("unicorn birthday decoration",    "gal-unicornio"),
    ("bounce house kids party",        "gal-inflables"),
    ("birthday cake candles kids",     "gal-pastel"),
    ("kids party balloons celebration","gal-celebracion"),
]

MAX_BYTES = 200 * 1024
WEBP_QUALITY_START = 80
WEBP_QUALITY_FLOOR = 40
WEBP_QUALITY_STEP = 10


def pexels_search(query):
    params = urllib.parse.urlencode({
        "query": query,
        "orientation": "landscape",
        "size": "large",
        "per_page": 1,
    })
    url = f"https://api.pexels.com/v1/search?{params}"
    req = urllib.request.Request(url, headers={
        "Authorization": API_KEY,
        "User-Agent": "wonderfiesta-demo-fetch/1.0",
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download(url, dest_path):
    req = urllib.request.Request(url, headers={"User-Agent": "wonderfiesta-demo-fetch/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        with open(dest_path, "wb") as f:
            f.write(resp.read())


def compress_to_webp(jpg_path, webp_path):
    quality = WEBP_QUALITY_START
    while True:
        subprocess.run(
            ["cwebp", "-quiet", "-q", str(quality), jpg_path, "-o", webp_path],
            check=True,
        )
        size = os.path.getsize(webp_path)
        if size <= MAX_BYTES or quality <= WEBP_QUALITY_FLOOR:
            return size, quality
        quality -= WEBP_QUALITY_STEP


def main():
    results = []
    for query, basename in SEARCHES:
        print(f"Buscando: {query!r} ...")
        data = pexels_search(query)
        photos = data.get("photos") or []
        if not photos:
            print(f"  [!] Sin resultados para {query!r}, se omite.")
            continue

        photo = photos[0]
        photo_url = photo["src"]["large2x"]
        credit = f'{photo.get("photographer", "?")} ({photo.get("url", "")})'

        jpg_path = os.path.join(IMG_DIR, f"{basename}.jpg")
        webp_path = os.path.join(IMG_DIR, f"{basename}.webp")

        print(f"  Descargando -> {jpg_path}")
        download(photo_url, jpg_path)
        jpg_size = os.path.getsize(jpg_path)

        print(f"  Comprimiendo -> {webp_path}")
        webp_size, used_quality = compress_to_webp(jpg_path, webp_path)

        ok = webp_size <= MAX_BYTES
        results.append((basename, jpg_size, webp_size, used_quality, ok, credit))
        print(f"  jpg: {jpg_size/1024:.0f}KB  webp: {webp_size/1024:.0f}KB (q={used_quality}) "
              f"{'OK' if ok else 'AUN EXCEDE 200KB'}")
        print(f"  Foto de: {credit}")
        print()

    print("--- Resumen ---")
    for basename, jpg_size, webp_size, used_quality, ok, credit in results:
        status = "OK" if ok else "EXCEDE 200KB"
        print(f"{basename:20s} jpg={jpg_size/1024:6.0f}KB  webp={webp_size/1024:6.0f}KB  q={used_quality:3d}  {status}")

    if any(not ok for *_, ok, _ in results):
        print("\nAlgunas imagenes no bajaron de 200KB ni en q=40 -- revisa manualmente "
              "(puede requerir redimensionar, no solo bajar calidad).")


if __name__ == "__main__":
    main()
