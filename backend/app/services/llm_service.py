from openai import OpenAI
import os


class LLMRouterService:
    """
    PADHAKU LLM Router Service
    Routes RAG-grounded prompts, note summaries, and quiz generation to
    NVIDIA Cloud API (z-ai/glm-5.3) using the OpenAI-compatible SDK.
    """

    def __init__(self) -> None:
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self.model = os.getenv("NVIDIA_MODEL", "z-ai/glm-5.3")
        self.client = OpenAI(base_url=self.base_url, api_key=self.api_key) if self.api_key else None

    def generate_grounded_answer(
        self,
        question: str,
        context_chunks: list[dict],
        study_mode: str = "My Notes",
    ) -> dict:
        formatted_context = "\n\n".join(
            [
                f"[Source: {c['document_title']} | Page {c['page_number']}]\n{c['content']}"
                for c in context_chunks
            ]
        )

        system_prompt = (
            f"You are PADHAKU AI Tutor ({study_mode} mode). "
            "Answer the student's question strictly using the provided study notes and cite exact PDF names and page numbers."
        )

        if not self.client:
            raise RuntimeError("NVIDIA_API_KEY is not configured")

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Context:\n{formatted_context}\n\nStudent Question: {question}",
                },
            ],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=False,
        )

        return {
            "answer": completion.choices[0].message.content,
            "model": self.model,
            "sources": context_chunks,
        }


llm_router = LLMRouterService()
