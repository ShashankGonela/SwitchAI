from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict

class Provider(ABC):
    name: str

    @abstractmethod
    async def stream(self, messages: List[Dict], model: str, max_output_tokens: int) -> AsyncGenerator[str, None]:
        ...
