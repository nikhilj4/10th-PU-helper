import argparse
import os
import re
import uuid
from dataclasses import dataclass
from typing import Iterable

from google import genai
from google.genai import types
from pinecone import Pinecone


@dataclass(frozen=True)
class Chunk:
    id: str
    subject: str
    source: str
    chunk_index: int
    text: str


def _load_env(path: str) -> None:
    # Optional convenience: load backend/.env if present without adding a dependency.
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv(path)
    except Exception:
        pass


def _clean_text(s: str) -> str:
    s = s.replace("\x00", " ")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _chunk_text(text: str, target_chars: int = 1500, overlap_chars: int = 200) -> Iterable[str]:
    text = _clean_text(text)
    if not text:
        return []
    chunks: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        j = min(n, i + target_chars)
        # Try to end on a paragraph boundary if possible.
        para = text.rfind("\n\n", i, j)
        if para != -1 and para > i + int(target_chars * 0.6):
            j = para
        chunk = text[i:j].strip()
        if chunk:
            chunks.append(chunk)
        i = max(j - overlap_chars, j)
    return chunks


def _read_pdf(path: str) -> str:
    try:
        import pypdf  # type: ignore
        import pypdf.filters  # type: ignore
    except Exception as exc:
        raise RuntimeError("Missing dependency pypdf. Install it in backend venv: pip install pypdf") from exc

    # Some textbooks legitimately exceed pypdf's default FlateDecode output limit.
    # For trusted local files, disable the limit to allow extraction.
    pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH = 0

    reader = pypdf.PdfReader(path)
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n\n".join(parts)


def _read_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def _iter_chunks(subject: str, source: str, raw_text: str) -> Iterable[Chunk]:
    for idx, chunk_text in enumerate(_chunk_text(raw_text)):
        chunk_id = f"{subject}:{uuid.uuid4().hex}"
        yield Chunk(id=chunk_id, subject=subject, source=source, chunk_index=idx, text=chunk_text)


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest textbook (PDF/TXT) into Pinecone for RAG.")
    parser.add_argument("--subject", required=True, help="Subject name (must match frontend subject value).")
    parser.add_argument("--file", required=True, nargs="+", help="One or more paths to .pdf/.txt files.")
    parser.add_argument("--namespace", default=os.getenv("PINECONE_NAMESPACE", "default"))
    parser.add_argument("--batch", type=int, default=50)
    args = parser.parse_args()

    # Try loading backend/.env when running from repo root.
    _load_env(os.path.join(os.path.dirname(__file__), "..", ".env"))

    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    pinecone_api_key = os.getenv("PINECONE_API_KEY", "")
    pinecone_index = os.getenv("PINECONE_INDEX", "")
    embed_model = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")

    missing = [k for k, v in [("GEMINI_API_KEY", gemini_api_key), ("PINECONE_API_KEY", pinecone_api_key), ("PINECONE_INDEX", pinecone_index)] if not v]
    if missing:
        raise SystemExit(f"Missing env vars: {', '.join(missing)}")

    client = genai.Client(api_key=gemini_api_key)
    pc = Pinecone(api_key=pinecone_api_key)
    index = pc.Index(pinecone_index)
    try:
        index_dimension = int(pc.describe_index(pinecone_index).dimension or 0)
    except Exception:
        index_dimension = 0

    def embed_with_fallback(text: str) -> list[float]:
        candidates = [
            embed_model,
            "gemini-embedding-001",
            "gemini-embedding-2-preview",
        ]
        last_exc: Exception | None = None
        for model in candidates:
            try:
                config = None
                if index_dimension > 0:
                    config = types.EmbedContentConfig(output_dimensionality=index_dimension)
                emb = client.models.embed_content(model=model, contents=[text], config=config)
                return emb.embeddings[0].values
            except Exception as exc:
                last_exc = exc
                continue
        if last_exc:
            raise last_exc
        raise RuntimeError("Embedding failed with all fallback models.")

    vectors: list[dict] = []
    upserted = 0
    total_chunks = 0
    for path in args.file:
        if path.lower().endswith(".pdf"):
            raw = _read_pdf(path)
        else:
            raw = _read_txt(path)

        chunks = list(_iter_chunks(subject=args.subject, source=os.path.basename(path), raw_text=raw))
        if not chunks:
            print(f"Skipped (no text extracted): {path}")
            continue

        for c in chunks:
            vec = embed_with_fallback(c.text)
            vectors.append(
                {
                    "id": c.id,
                    "values": vec,
                    "metadata": {
                        "subject": c.subject,
                        "source": c.source,
                        "chunk_index": c.chunk_index,
                        "text": c.text,
                    },
                }
            )
            if len(vectors) >= args.batch:
                index.upsert(vectors=vectors, namespace=args.namespace)
                upserted += len(vectors)
                vectors = []
                print(f"Upserted {upserted} chunks so far", flush=True)
        total_chunks += len(chunks)

    if total_chunks == 0:
        raise SystemExit("No text extracted/chunked from provided files.")

    if vectors:
        index.upsert(vectors=vectors, namespace=args.namespace)
        upserted += len(vectors)
        vectors = []

    print(f"Done. Total chunks: {total_chunks}. Upserted: {upserted}.", flush=True)


if __name__ == "__main__":
    main()

