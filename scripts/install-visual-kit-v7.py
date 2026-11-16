#!/usr/bin/env python3
"""Install the generated 48-piece Verbarium visual kit into the V7 site.
Usage: python scripts/install-visual-kit-v7.py /path/to/verbarium-visual-kit-v1.zip
No external dependencies or network required. Idempotent and path-safe.
"""
from __future__ import annotations
import argparse
import json
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

EXPECTED_CATEGORIES = {
    "buttons": 8, "cards": 6, "grids": 8, "backgrounds": 6,
    "labels": 10, "mascot": 4, "rewards": 6,
}
EXPECTED_TOTAL = sum(EXPECTED_CATEGORIES.values())


def check_zip(source: Path):
    if not source.is_file():
        raise ValueError(f"Arquivo não encontrado: {source}")
    with zipfile.ZipFile(source) as archive:
        names = set(archive.namelist())
        if "manifest.json" not in names:
            raise ValueError("Kit sem manifest.json")
        manifest = json.loads(archive.read("manifest.json"))
        assets = manifest.get("assets", {})
        if len(assets) != EXPECTED_TOTAL:
            raise ValueError(f"Esperados {EXPECTED_TOTAL} assets, recebidos {len(assets)}")
        counts = {}
        allowed = {"manifest.json", "README.md"}
        for key, asset in assets.items():
            category = asset.get("category")
            if category not in EXPECTED_CATEGORIES:
                raise ValueError(f"Categoria inválida: {key}")
            counts[category] = counts.get(category, 0) + 1
            for field, ext in (("path", ".webp"), ("png", ".png")):
                entry = asset.get(field)
                if not isinstance(entry, str) or not entry.endswith(ext):
                    raise ValueError(f"Entrada inválida: {key}.{field}")
                posix = PurePosixPath(entry)
                if posix.is_absolute() or ".." in posix.parts or posix.parts[:2] != ("assets", category):
                    raise ValueError(f"Caminho inseguro: {entry}")
                if entry not in names:
                    raise ValueError(f"Arquivo ausente: {entry}")
                content = archive.read(entry)
                if ext == ".webp" and (content[:4] != b"RIFF" or content[8:12] != b"WEBP"):
                    raise ValueError(f"WebP inválido: {entry}")
                if ext == ".png" and content[:8] != b"\x89PNG\r\n\x1a\n":
                    raise ValueError(f"PNG inválido: {entry}")
                allowed.add(entry)
        if counts != EXPECTED_CATEGORIES:
            raise ValueError(f"Distribuição de assets incorreta: {counts}")
        return manifest, sorted(allowed)


def install(source: Path, root: Path, dry_run: bool):
    manifest, allowed = check_zip(source)
    destination = root / "public" / "verbarium-visual-kit"
    print(f"Validado: {len(manifest['assets'])} assets | {len(allowed)} arquivos incluindo PNG/WebP")
    print(f"Destino: {destination}")
    if dry_run:
        print("Dry-run: nenhum arquivo alterado.")
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="vb-visual-kit-", dir=destination.parent) as temp_dir:
        stage = Path(temp_dir) / "verbarium-visual-kit"
        stage.mkdir()
        with zipfile.ZipFile(source) as archive:
            for entry in allowed:
                target = stage.joinpath(*PurePosixPath(entry).parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(entry) as input_stream, target.open("wb") as output:
                    shutil.copyfileobj(input_stream, output)
        for entry in allowed:
            src = stage.joinpath(*PurePosixPath(entry).parts)
            target = destination.joinpath(*PurePosixPath(entry).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            src.replace(target)
    print("Kit instalado com sucesso. Os assets carregam automaticamente na Home, Academy e onboarding.")
    print("Revise o diff e execute: npm test && npm run build")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("kit", type=Path, help="ZIP entregue com os 48 assets")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Raiz do repositório Verbarium")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        install(args.kit.resolve(), args.root.resolve(), args.dry_run)
    except (ValueError, OSError, zipfile.BadZipFile, json.JSONDecodeError) as exc:
        print(f"Falha na instalação: {exc}", file=sys.stderr)
        raise SystemExit(1)
