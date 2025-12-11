from typing import Any, Tuple
import os
import re
import openai
import instructor
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)


def get_client_llm(model_name: str, structured_output: bool = False) -> Tuple[Any, str]:
    """Get the client and model for the given model name.

    Args:
        model_name (str): The name of the model to get the client.

    Raises:
        ValueError: If the model is not supported.

    Returns:
        The client and model for the given model name.
    """
    # Only Ollama / local OpenAI-compatible endpoint support
    if model_name.startswith("ollama:") or model_name.startswith("ollama-"):
        # Pattern allows `ollama:llama3` or `ollama-llama3`
        parsed_model = re.sub(r"^ollama[:\-]", "", model_name)
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        client = openai.OpenAI(
            api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
            base_url=base_url,
        )
        model_name = parsed_model
        if structured_output:
            client = instructor.from_openai(client, mode=instructor.Mode.TOOLS_STRICT)
    else:
        raise ValueError(f"Model {model_name} not supported.")

    return client, model_name
