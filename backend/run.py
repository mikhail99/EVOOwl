from shinka.core import EvolutionRunner, EvolutionConfig
from shinka.database import DatabaseConfig
from shinka.launch import LocalJobConfig


MUTATION_SYSTEM_PROMPT = """
You are an expert technical editor. Inside EVOLVE-BLOCK-START/END the code defines a
Python dict returned by def initial_solution(). Produce methodology text that could
plausibly achieve state-of-the-art results: specific, actionable, technically rigorous
(concrete models, data scale/quality, metrics, validation, risks, safeguards).

RULES:
1. Keep EVOLVE-BLOCK-START/END and surrounding code unchanged.
2. Edit the dict keys/values to improve clarity and strength; keep valid Python. You may
   add/rename/remove sections if it improves the plan.
3. Do not add new logic outside the block; keep the rest of the file identical.
4. Prefer concise bullets with concrete numbers, metrics, and checks geared toward SOTA performance.
5. Keep each dict value focused on its section topic; avoid cross-topic content or drift.
"""


def main():
    # 1. Configure where the evaluation happens
    job_config = LocalJobConfig(
        # Paths are relative to repo root when running `python backend/run.py`
        eval_program_path="backend/evaluate.py",
        conda_env="EvoOwl",
    )

    # 2. Configure the database (uses default SQLite file under results dir)
    db_config = DatabaseConfig()

    # 3. Configure the evolution
    evo_config = EvolutionConfig(
        init_program_path="backend/initial.py",
        num_generations=5,
        patch_types=["full"],
        patch_type_probs=[1.0],
        language="python",
        task_sys_msg=MUTATION_SYSTEM_PROMPT,
        llm_models=["ollama:gemma3:latest"],
        embedding_model="ollama:nomic-embed-text",
        llm_kwargs={"temperatures": 0.3, "max_tokens": 2048},
    )

    runner = EvolutionRunner(
        evo_config=evo_config,
        job_config=job_config,
        db_config=db_config,
        verbose=True,
    )

    print("Running evolution...")
    runner.run()
    print("Evolution completed!")


if __name__ == "__main__":
    main()