import backoff
import openai
from .result import QueryResult
import logging

logger = logging.getLogger(__name__)


def backoff_handler(details):
    exc = details.get("exception")
    if exc:
        logger.warning(
            f"Ollama - Retry {details['tries']} due to error: {exc}. Waiting {details['wait']:0.1f}s..."
        )


@backoff.on_exception(
    backoff.expo,
    (
        openai.APIConnectionError,
        openai.APIStatusError,
        openai.RateLimitError,
        openai.APITimeoutError,
    ),
    max_tries=10,
    max_value=10,
    on_backoff=backoff_handler,
)
def query_ollama(
    client,
    model,
    msg,
    system_msg,
    msg_history,
    output_model,
    model_posteriors=None,
    **kwargs,
) -> QueryResult:
    """Query Ollama via OpenAI-compatible endpoint."""
    new_msg_history = msg_history + [{"role": "user", "content": msg}]
    if output_model is None:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_msg},
                *new_msg_history,
            ],
            **kwargs,
        )
        content = response.choices[0].message.content
        new_msg_history.append({"role": "assistant", "content": content})
    else:
        # Ollama typically does not support strict tool schemas; fall back to text
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_msg},
                *new_msg_history,
            ],
            **kwargs,
        )
        content = response.choices[0].message.content
        new_msg_history.append({"role": "assistant", "content": content})

    usage = getattr(response, "usage", None)
    input_tokens = getattr(usage, "prompt_tokens", 0) or getattr(
        usage, "input_tokens", 0
    ) or 0
    output_tokens = getattr(usage, "completion_tokens", 0) or getattr(
        usage, "output_tokens", 0
    ) or 0

    result = QueryResult(
        content=content,
        msg=msg,
        system_msg=system_msg,
        new_msg_history=new_msg_history,
        model_name=model,
        kwargs=kwargs,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost=0.0,
        input_cost=0.0,
        output_cost=0.0,
        thought="",
        model_posteriors=model_posteriors,
    )
    return result
