import argparse
from typing import Any, Dict, List, Optional, Tuple
from shinka.core.wrap_eval import run_shinka_eval


def _aggregate_fn(results: List[Any]) -> Dict[str, Any]:
    """Aggregate run results into metrics."""
    texts = [r for r in results if isinstance(r, str)]
    if not texts:
        return {
            "combined_score": 0.0,
            "public": {"length": 0, "non_empty": False},
            "private": {},
            "text_feedback": "No methodology text produced.",
        }

    # Simple heuristic: shorter, non-empty text scores better (placeholder until LLM scorer)
    length = len(texts[0].strip())
    non_empty = length > 0
    base_score = max(0.0, 100.0 - length * 0.1)

    return {
        "combined_score": base_score,
        "public": {
            "length": length,
            "non_empty": non_empty,
        },
        "private": {},
        "text_feedback": "Heuristic score favors concise, non-empty methodology text.",
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