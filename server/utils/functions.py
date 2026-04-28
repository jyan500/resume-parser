import os

SPLIT_MARKER = "##SPLIT##"


def split_prompt(rendered: str) -> tuple[str | None, str]:
    """Splits a rendered prompt into (system_prompt, user_prompt) on SPLIT_MARKER."""
    if SPLIT_MARKER in rendered:
        system_part, user_part = rendered.split(SPLIT_MARKER, 1)
        return system_part.strip(), user_part.strip()
    return None, rendered


def load_prompt(name: str) -> str:
    """
    Load prompt from prompts folder
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, '..', 'prompts', f'{name}.txt')
    with open(path) as f:
        return f.read()

def capitalize_clean_text(line):
    """
    capitalize the first character of each word
    """
    def capitalize(text):
        return text[0].upper() + text[1:] if text else text
    return " ".join(list(map(capitalize, line.split(" "))))
