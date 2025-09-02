from typing import AsyncGenerator, List, Dict
import google.generativeai as genai
import asyncio
from settings import GEMINI_API_KEY
from .base import Provider

class GeminiProvider(Provider):
    name = "gemini"

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)

    async def stream(self, messages: List[Dict], model: str, max_output_tokens: int) -> AsyncGenerator[str, None]:
        # Convert chat history to Gemini format
        history = [{"role": m["role"], "parts": [m["content"]]} for m in messages]

        try:
            model_obj = genai.GenerativeModel(model_name=model)
            resp = await asyncio.to_thread(
                model_obj.generate_content,
                history,
                stream=True,
                generation_config={
                    "max_output_tokens": max_output_tokens,
                    "temperature": 0.7,
                    "top_p": 0.95
                }
            )

            for chunk in resp:
                # Check for text in parts
                for part in getattr(chunk, "parts", []):
                    if hasattr(part, "text"):
                        yield part.text

        except Exception as e:
            print(f"Gemini stream error: {e}")
