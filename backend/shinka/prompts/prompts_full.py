# Multiple Full Rewrite Prompt Variants
# 1. Default
# 2. Different Algorithm
# 3. Context Motivated
# 4. Structural Redesign
# 5. Parametric Design

# Original/Default Full Rewrite (adapted for text clarity/structure)
FULL_SYS_FORMAT_DEFAULT = """
Rewrite the text inside the EVOLVE-BLOCK to improve clarity, structure, and actionability.
Return the full file, but only edit the text inside EVOLVE-BLOCK-START/END. Do not change anything else.

You MUST respond with ONLY the rewritten file inside a markdown code fence:

```{language}
# full file content here
```

Rules:
- Keep the markers "EVOLVE-BLOCK-START" and "EVOLVE-BLOCK-END" in place.
- Do not add or remove code outside the EVOLVE-BLOCK.
- Focus on rewriting the text (clarity, structure, actionability), not changing function names or logic.
- Ensure the file remains valid Python."""

# Variant 1: Alternative framing for text rewrite
FULL_SYS_FORMAT_DIFFERENT = """
Rewrite the EVOLVE-BLOCK text with a different framing or narrative, while preserving meaning.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Only change the text inside EVOLVE-BLOCK-START/END.
- Keep structure clear and actionable (headings, bullets, steps as needed).
- Do not change code outside the EVOLVE block."""


# Variant 2: Context-inspired text polish
FULL_SYS_FORMAT_MOTIVATED = """
Polish the EVOLVE-BLOCK text using inspiration from prior attempts (if provided), but keep meaning intact.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Only modify text within EVOLVE-BLOCK-START/END.
- Improve clarity, coherence, and actionable phrasing.
- Keep the rest of the file unchanged."""


# Variant 3: Structural rephrase
FULL_SYS_FORMAT_STRUCTURAL = """
Rephrase and restructure the EVOLVE-BLOCK text for readability (headings, bullets, short sentences).
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Edit only inside EVOLVE-BLOCK-START/END.
- Prefer concise bullet points or numbered steps for clarity.
- Keep semantics intact; do not alter code outside the block."""


# Variant 4: Concise rewrite
FULL_SYS_FORMAT_PARAMETRIC = """
Condense and clarify the EVOLVE-BLOCK text with minimal wording while preserving meaning.
Return the full file in a markdown code fence:

```{language}
# full file content here
```

Rules:
- Only edit text inside EVOLVE-BLOCK-START/END.
- Keep sentences short and direct; remove redundancy.
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

Here is the current file to improve (edit text only inside EVOLVE-BLOCK):

```{language}
{code_content}
```

Here are the current metrics/feedback:

{performance_metrics}{text_feedback_section}

# Task

Rewrite the EVOLVE-BLOCK text for clarity, structure, and actionability.
Return the full file in a markdown code fence. Do not change code outside the EVOLVE block.
"""
