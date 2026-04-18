import argparse
import os
from pathlib import Path

from ingest_textbook import main as ingest_one  # type: ignore


def _iter_files(data_dir: Path) -> list[Path]:
    exts = {".pdf", ".txt"}
    files = [p for p in data_dir.iterdir() if p.is_file() and p.suffix.lower() in exts]
    return sorted(files, key=lambda p: p.name.lower())


def _subject_from_filename(p: Path) -> str:
    # Expect filenames like "Mathematics.pdf" or "Kannada_1.pdf"
    # Normalize to human-readable subject names.
    subj = p.stem.replace("_", " ").replace("-", " ").strip()
    subj = " ".join(subj.split())
    return subj


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest ALL PDFs/TXTs under backend/data into Pinecone.")
    parser.add_argument("--data-dir", default=str(Path(__file__).resolve().parent.parent / "data"))
    parser.add_argument("--namespace", default=os.getenv("PINECONE_NAMESPACE", "default"))
    parser.add_argument("--batch", type=int, default=50)
    args = parser.parse_args()

    data_dir = Path(args.data_dir).expanduser().resolve()
    if not data_dir.exists():
        raise SystemExit(f"Data dir not found: {data_dir}")

    files = _iter_files(data_dir)
    if not files:
        raise SystemExit(f"No .pdf/.txt files found in {data_dir}")

    # We call ingest_textbook.py's CLI entrypoint by patching argv-style args.
    # This avoids duplicating ingestion logic.
    for f in files:
        subject = _subject_from_filename(f)
        print(f"\n=== Ingesting: {f.name} -> subject='{subject}' ===", flush=True)
        # Reconstruct sys.argv for ingest_textbook's argparse
        import sys

        sys.argv = [
            "ingest_textbook.py",
            "--subject",
            subject,
            "--file",
            str(f),
            "--namespace",
            args.namespace,
            "--batch",
            str(args.batch),
        ]
        ingest_one()

    print("\nAll done.", flush=True)


if __name__ == "__main__":
    main()

