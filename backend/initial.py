def initial_solution():
    # EVOLVE-BLOCK-START
    doc = {
        "overview": (
            "Methodology for the SPAD camera project. Summarize objectives and approach for image classification."
        ),
        "data": (
            "Capture 1000 images with a SPAD camera using an appropriate lens; filter noise before processing."
        ),
        "model": (
            " Use a ResNet20 to classify the images into different classes."
        ),
        "training_steps": (
            "Use the data and SGD to train the model."
        ),
        "validation": (
            "Cross-validation with manually labeled data"
        ),
        "considerations": (
            "1000 images may not be enough for training a model."
        ),
    }
    # EVOLVE-BLOCK-END

    return doc


def run_experiment(**kwargs) -> str:
    """
    Entry point used by evaluate.py. Returns the methodology text to score.
    """
    doc = initial_solution() #initial solution is a function that returns a dictionary

    if isinstance(doc, dict):
        # Join sections into a markdown string for scoring
        parts = []
        for k, v in doc.items():
            parts.append(f"## {k}\n{v.strip()}")
        return "\n\n".join(parts).strip()
    return str(doc).strip()