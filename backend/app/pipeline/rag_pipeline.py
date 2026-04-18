from openai import OpenAI
from pinecone import Pinecone

from app.core.config import settings


class RagPipeline:
    def __init__(self) -> None:
        self.openai = OpenAI(api_key=settings.openai_api_key)
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index = self.pc.Index(settings.pinecone_index)

    def answer(self, query: str, subject: str) -> tuple[str, int, int, int]:
        emb = self.openai.embeddings.create(model=settings.openai_embed_model, input=query)
        vector = emb.data[0].embedding
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
        chat = self.openai.chat.completions.create(
            model=settings.openai_chat_model,
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = chat.choices[0].message.content or "This is not available in provided material."
        usage = chat.usage
        prompt_tokens = usage.prompt_tokens if usage else 0
        completion_tokens = usage.completion_tokens if usage else 0
        total_tokens = usage.total_tokens if usage else 0
        return content, prompt_tokens, completion_tokens, total_tokens
