import argparse
import json
import os
import re
import time
from typing import Any, Dict, List, Optional, Tuple

import httpx
from shinka.core.wrap_eval import run_shinka_eval


DEFAULT_MODEL = os.getenv("EVAL_LLM_MODEL", "ollama:gemma3:latest")
DEFAULT_TEMP = float(os.getenv("EVAL_LLM_TEMPERATURE", "0.3"))
DEFAULT_MAX_TOKENS = int(os.getenv("EVAL_LLM_MAX_TOKENS", "512"))
DEFAULT_TIMEOUT = float(os.getenv("EVAL_LLM_TIMEOUT", "15.0"))  # seconds
DRY_RUN = os.getenv("EVAL_LLM_DRY_RUN", "false").lower() == "true"
BASE_URL = os.getenv("EVAL_LLM_BASE_URL", os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"))
API_KEY = os.getenv("EVAL_LLM_API_KEY", os.getenv("OLLAMA_API_KEY", "ollama"))


def _call_llm_judge(text: str) -> Tuple[float, str]:
    """
    Call local Ollama (OpenAI-compatible) to score the methodology text.
    Returns (score_0_100, feedback_text).
    """
    prompt = (
        "You are a concise reviewer. Score the methodology text from 0 to 100 for clarity, "
        "SOTA potential, structure, and actionability. Respond with JSON: {\"score\": <0-100>, "
        "\"feedback\": \"...\"}. Keep feedback brief."
    )
    payload = {
        "model": DEFAULT_MODEL.replace("ollama:", "").replace("ollama-", ""),
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text},
        ],
        "temperature": DEFAULT_TEMP,
        "max_tokens": DEFAULT_MAX_TOKENS,
    }

    print(
        "[LLM-JUDGE] request",
        {
            "model": payload["model"],
            "temperature": payload["temperature"],
            "max_tokens": payload["max_tokens"],
            "text_len": len(text),
            "prompt_preview": prompt[:200],
        },
        flush=True,
    )

    headers = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}
    with httpx.Client(base_url=BASE_URL, timeout=DEFAULT_TIMEOUT) as client:
        resp = client.post("/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    # Extract content
    content = data["choices"][0]["message"]["content"]
    print("[LLM-JUDGE] raw_content", content[:1000], flush=True)

    def _extract_json_snippet(txt: str) -> Optional[str]:
        """Find a JSON object even if wrapped in fences or extra text."""
        # Common: ```json ... ```
        fence_match = re.search(r"```json\s*([\s\S]*?)```", txt, re.IGNORECASE)
        if fence_match:
            return fence_match.group(1)
        # Any {...} block
        brace_match = re.search(r"\{[\s\S]*\}", txt)
        if brace_match:
            return brace_match.group(0)
        return None

    def _parse_score_and_feedback(raw: str) -> Tuple[float, str]:
        try:
            parsed = json.loads(raw)
            return float(parsed.get("score", 0.0)), str(parsed.get("feedback", "")).strip()
        except Exception:
            snippet = _extract_json_snippet(raw)
            if snippet:
                try:
                    parsed = json.loads(snippet)
                    return float(parsed.get("score", 0.0)), str(parsed.get("feedback", "")).strip()
                except Exception:
                    pass
            return 0.0, raw.strip()

    score, feedback = _parse_score_and_feedback(content)
    score = max(0.0, min(100.0, score))
    print(
        "[LLM-JUDGE] parsed",
        {"score": score, "feedback_preview": feedback[:500]},
        flush=True,
    )
    return score, feedback


def _aggregate_fn(results: List[Any]) -> Dict[str, Any]:
    """Aggregate run results into metrics with LLM judge fallback."""
    texts = [r for r in results if isinstance(r, str)]
    if not texts:
        return {
            "combined_score": 0.0,
            "public": {"length": 0, "non_empty": False},
            "private": {},
            "text_feedback": "No methodology text produced.",
        }

    text = texts[0].strip()
    length = len(text)
    non_empty = length > 0

    # Fallback heuristic
    def heuristic():
        base = max(0.0, 100.0 - length * 0.1)
        return base, "Heuristic score favors concise, non-empty methodology text."

    if DRY_RUN:
        score, fb = heuristic()
    else:
        try:
            start = time.time()
            score, fb = _call_llm_judge(text)
            elapsed = time.time() - start
            fb = fb or "LLM judge returned no feedback."
            fb = f"[LLM score in {elapsed:.1f}s] {fb}"
        except Exception as e:
            score, fb = heuristic()
            fb = f"[LLM judge failed: {e}] {fb}"

    return {
        "combined_score": score,
        "public": {
            "length": length,
            "non_empty": non_empty,
        },
        "private": {},
        "text_feedback": fb,
    }


def _validate_fn(result: Any) -> Tuple[bool, Optional[str]]:
    """Validate that a methodology string exists."""
    if isinstance(result, str) and result.strip():
        return True, None
    return False, "Empty or missing methodology text."


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate evolved methodology text.")
    parser.add_argument("--program_path", required=True, help="Path to the candidate program.")
    parser.add_argument("--results_dir", required=True, help="Directory to write metrics/correct files.")
    args = parser.parse_args()

    run_shinka_eval(
        program_path=args.program_path,
        results_dir=args.results_dir,
        experiment_fn_name="run_experiment",
        num_runs=1,
        aggregate_metrics_fn=_aggregate_fn,
        validate_fn=_validate_fn,
    )


if __name__ == "__main__":
    main()