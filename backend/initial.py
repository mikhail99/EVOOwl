def methodology():
    # EVOLVE-BLOCK-START
    text = """
    Methodology:
    We define the methodology for the SPAD camera project as follows:
    - We use a SPAD camera to capture the light from the object.
    - We use a lens to focus the light on the SPAD camera.
    - We use a filter to remove the noise from the light.
    - We use a processor to process the light from the SPAD camera.
    - We use a display to display the light from the SPAD camera.
    """
    # EVOLVE-BLOCK-END

    return text


def run_experiment(**kwargs) -> str:
    """
    Entry point used by evaluate.py. Returns the methodology text to score.
    """
    return methodology().strip()