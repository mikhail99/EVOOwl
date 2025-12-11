from typing import List, Union, Optional, Dict
from pydantic import BaseModel
from .client import get_client_llm
from .models import query_ollama, QueryResult
import logging

logger = logging.getLogger(__name__)


THINKING_TOKENS = {
    "auto": 0,
    "low": 2048,
    "medium": 4096,
    "high": 8192,
    "max": 16384,
}


def sample_batch_kwargs(
    num_samples: int,
    model_names: Union[List[str], str] = "gpt-4o-mini-2024-07-18",
    temperatures: Union[List[float], float] = 0.0,
    max_tokens: Union[List[int], int] = 4096,
    reasoning_efforts: Union[List[str], str] = "",
    model_sample_probs: Optional[List[float]] = None,
    unique_filter: bool = False,
):
    """Sample a dictionary of kwargs for a given model."""
    all_kwargs = []
    attempts = 0
    max_attempts = num_samples * 10  # Prevent infinite loops

    while len(all_kwargs) < num_samples and attempts < max_attempts:
        kwargs_dict = sample_model_kwargs(
            model_names=model_names,
            temperatures=temperatures,
            max_tokens=max_tokens,
            reasoning_efforts=reasoning_efforts,
            model_sample_probs=model_sample_probs,
        )

        if unique_filter:
            if kwargs_dict not in all_kwargs:
                all_kwargs.append(kwargs_dict)
        else:
            all_kwargs.append(kwargs_dict)

        attempts += 1

    if len(all_kwargs) < num_samples:
        logger.info(
            f"Could not generate {num_samples} unique kwargs combinations "
            f"after {max_attempts} attempts"
        )
        logger.info(f"Returning {len(all_kwargs)} unique kwargs combinations.")

    return all_kwargs


def sample_model_kwargs(
    model_names: Union[List[str], str] = "ollama:llama3",
    temperatures: Union[List[float], float] = 0.7,
    max_tokens: Union[List[int], int] = 4096,
    reasoning_efforts: Union[List[str], str] = "",
    model_sample_probs: Optional[List[float]] = None,
):
    """Sample kwargs for Ollama; currently only temperature and max_tokens matter."""
    if isinstance(model_names, str):
        model_names = [model_names]
    if isinstance(temperatures, float):
        temperatures = [temperatures]
    if isinstance(max_tokens, int):
        max_tokens = [max_tokens]

    kwargs_dict: Dict[str, Union[str, float, int]] = {}
    if model_sample_probs is not None:
        if len(model_sample_probs) != len(model_names):
            raise ValueError("model_sample_probs must match model_names length")
        if not abs(sum(model_sample_probs) - 1.0) < 1e-9:
            raise ValueError("model_sample_probs must sum to 1")
        kwargs_dict["model_name"] = model_names[0]
    else:
        kwargs_dict["model_name"] = model_names[0]

    kwargs_dict["temperature"] = temperatures[0]
    kwargs_dict["max_tokens"] = max_tokens[0]
    return kwargs_dict


def query(
    model_name: str,
    msg: str,
    system_msg: str,
    msg_history: List = [],
    output_model: Optional[BaseModel] = None,
    model_posteriors: Optional[Dict[str, float]] = None,
    **kwargs,
) -> QueryResult:
    """Query the LLM."""
    original_model_name = model_name
    client, model_name = get_client_llm(
        model_name, structured_output=output_model is not None
    )
    if original_model_name.startswith("ollama:") or original_model_name.startswith(
        "ollama-"
    ):
        query_fn = query_ollama
    else:
        raise ValueError(f"Model {model_name} not supported.")
    result = query_fn(
        client,
        model_name,
        msg,
        system_msg,
        msg_history,
        output_model,
        model_posteriors=model_posteriors,
        **kwargs,
    )
    return result
