from shinka.core import EvolutionRunner, EvolutionConfig
from shinka.database import DatabaseConfig
from shinka.launch import LocalJobConfig


MUTATION_SYSTEM_PROMPT = """
You are an expert academic editor.

Your task is to improve the text content inside the Python string in the provided code.

RULES:
1. The code contains a function 'def methodology():' . DO NOT CHANGE THE FUNCTION NAME.
2. Inside the function, there is a Python string 'text = \"\"\" ... \"\"\"'. Improve the text inside for clarity, impact, and style.
3. DO NOT remove the Python syntax. The result must be valid Python code.
4. DO NOT add logic, code, prints, or comments outside of the string.
5. Only edit the text content within the triple quotes.
"""


def main():
    # 1. Configure where the evaluation happens
    job_config = LocalJobConfig(
        eval_program_path="evaluate.py",
        conda_env="EvoOwl",
    )

    # 2. Configure the database
    db_config = DatabaseConfig(check_novelty=True)

    # 3. Configure the evolution
    evo_config = EvolutionConfig(
        init_program_path="initial.py",
        num_generations=10,
        population_size=5,
        language="python",
        task_sys_msg=MUTATION_SYSTEM_PROMPT,
        llm_models=["ollama:llama3"],
        embedding_model="ollama:nomic-embed-text",
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