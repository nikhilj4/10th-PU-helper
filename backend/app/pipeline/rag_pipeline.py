from google import genai
from pinecone import Pinecone

from app.core.config import settings


class RagPipeline:
    def __init__(self) -> None:
        self.gemini = genai.Client(api_key=settings.gemini_api_key)
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index)

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
        resp = self.gemini.models.generate_content(
            model=settings.gemini_model,
            contents=[sys_prompt, user_prompt],
        )
        content = (resp.text or "").strip() or "This is not available in provided material."
        # Gemini response doesn't always provide token usage in this SDK.
        return content, 0, 0, 0
