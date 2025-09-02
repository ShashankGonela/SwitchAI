import asyncio
from typing import AsyncGenerator, List, Dict
from openai import AsyncOpenAI
from settings import OPENAI_API_KEY

from .base import Provider

class OpenAIProvider(Provider):
    name = "openai"

    def __init__(self):
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    async def stream(self, messages: List[Dict], model: str, max_output_tokens: int) -> AsyncGenerator[str, None]:
        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
            max_tokens=max_output_tokens,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
