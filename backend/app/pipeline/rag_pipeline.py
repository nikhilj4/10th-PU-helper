from google import genai
from pinecone import Pinecone

from app.core.config import settings


class RagPipeline:
    def __init__(self) -> None:
        self.gemini = genai.Client(api_key=settings.gemini_api_key)
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index)

    def _generate_with_fallback(self, sys_prompt: str, user_prompt: str) -> str:
        # Model availability changes frequently; keep a small fallback chain.
        candidates = [
            settings.gemini_model,
            "gemini-flash-latest",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
        ]
        last_exc: Exception | None = None
        for model in candidates:
            try:
                resp = self.gemini.models.generate_content(model=model, contents=[sys_prompt, user_prompt])
                text = (resp.text or "").strip()
                if text:
                    return text
            except Exception as exc:
                last_exc = exc
                continue
        if last_exc:
            raise last_exc
        return ""

    def answer(self, query: str, subject: str) -> tuple[str, int, int, int]:
        emb = self.gemini.models.embed_content(
            model=settings.gemini_embed_model,
            contents=[query],
        )
        vector = emb.embeddings[0].values
        res = self.index.query(
            vector=vector,
            top_k=settings.pinecone_top_k,
            namespace=settings.pinecone_namespace,
            include_metadata=True,
            filter={"subject": {"$eq": subject}},
        )
        contexts = [m.metadata.get("text", "") for m in res.matches if m.metadata]
        context_blob = "\n\n".join(contexts[: settings.pinecone_top_k])

        sys_prompt = (
            "You are a strict tutor assistant. Answer using only provided context. "
            "If the answer is missing, say: 'This is not available in provided material.'"
        )
        user_prompt = f"Context:\n{context_blob}\n\nQuestion:\n{query}"
        content = self._generate_with_fallback(sys_prompt=sys_prompt, user_prompt=user_prompt)
        content = content or "This is not available in provided material."
        # Gemini response doesn't always provide token usage in this SDK.
        return content, 0, 0, 0
