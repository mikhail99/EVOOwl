# Multiple Full Rewrite Prompt Variants
# 1. Default
# 2. Different Algorithm
# 3. Context Motivated
# 4. Structural Redesign
# 5. Parametric Design

# Original/Default Full Rewrite (adapted for sectioned text clarity/structure)
FULL_SYS_FORMAT_DEFAULT = """
Rewrite ONLY the content inside EVOLVE-BLOCK-START/END. The code defines a Python dict
with sections like: overview, data, model, training_steps, validation, considerations.
Produce methodology text that could realistically lead to state-of-the-art results:
specific, actionable, technically strong (concrete models, data needs, metrics, risks,
safeguards). You may add or rename dict entries if it improves clarity, but keep the
code valid.

Return the FULL FILE in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Keep the markers "EVOLVE-BLOCK-START" and "EVOLVE-BLOCK-END" in place.
- Do not modify code outside the EVOLVE-BLOCK.
- Maintain valid Python dict syntax; adjust keys/values as needed for a better plan.
- Prefer concise bullets with quantified details, metrics, and guardrails.
- Keep each section’s value on-topic for its key; avoid mixing topics across sections.
- Ensure the file remains valid Python."""

# Variant 1: Alternative framing for sectioned text
FULL_SYS_FORMAT_DIFFERENT = """
Rephrase the EVOLVE-BLOCK dict with a stronger, alternative framing that could yield
state-of-the-art outcomes. Keep or refine sections to maximize clarity and actionability.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Edit keys/values inside the dict as needed, but keep code valid.
- Prioritize concise, SOTA-worthy guidance: specific models, data, metrics, safeguards.
- Keep each value focused on its section topic; do not drift across keys.
- Do not change code outside the EVOLVE block."""


# Variant 2: Context-inspired text polish (sectioned)
FULL_SYS_FORMAT_MOTIVATED = """
Polish the EVOLVE-BLOCK dict using prior attempts (if provided), pushing it toward a
state-of-the-art methodology that could deliver top results. Keep or refine sections to
increase specificity and rigor.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Edit keys/values inside the dict as needed; keep Python valid.
- Improve clarity, coherence, and actionability with concrete metrics and checks.
- Keep each value aligned to its section; avoid cross-section content.
- Do not modify code outside the EVOLVE block."""


# Variant 3: Structural rephrase (sectioned)
FULL_SYS_FORMAT_STRUCTURAL = """
Restructure the EVOLVE-BLOCK dict for readability and SOTA clarity (bullets, concise sentences,
consistent style). Elevate specificity and practical guidance that could reach top results.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Edit inside EVOLVE-BLOCK-START/END; keep Python valid.
- Adjust keys/values if it improves structure and rigor; prioritize concise bullets and metrics.
- Keep each section on-topic; no cross-topic mixing.
- Do not alter code outside the block."""


# Variant 4: Concise rewrite (sectioned)
FULL_SYS_FORMAT_PARAMETRIC = """
Condense the EVOLVE-BLOCK dict while keeping SOTA-level specificity. Keep meaning but tighten
to short, direct bullets with concrete metrics and safeguards that can drive top performance.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Edit keys/values inside the dict; keep code valid and markers intact.
- Use short, direct bullets; retain concrete details and metrics.
- Keep each value relevant to its section only.
- Do not modify code outside the block."""

# List of all variants for sampling
FULL_SYS_FORMATS = [
    FULL_SYS_FORMAT_DEFAULT,
    FULL_SYS_FORMAT_DIFFERENT,
    FULL_SYS_FORMAT_MOTIVATED,
    FULL_SYS_FORMAT_STRUCTURAL,
    FULL_SYS_FORMAT_PARAMETRIC,
]

# Variant names for debugging/logging
FULL_SYS_FORMAT_NAMES = [
    "default",
    "different_algorithm",
    "context_motivated",
    "structural_redesign",
    "parametric_design",
]

FULL_ITER_MSG = """# Current file

Here is the current file to improve (edit the dict inside EVOLVE-BLOCK):

```{language}
{code_content}
```

Here are the current metrics/feedback:

{performance_metrics}{text_feedback_section}

# Task

Rewrite the dict inside EVOLVE-BLOCK so the resulting methodology could plausibly achieve
state-of-the-art results: concrete models, data scale/quality, metrics, validation, risks,
and safeguards. You may refine or add sections, but keep valid Python and the markers
untouched. Keep each section on-topic for its key; avoid mixing topics across sections.
Return the full file in a markdown code fence. Do not change code outside the EVOLVE block."""
