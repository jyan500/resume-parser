import os

def load_prompt(name: str) -> str:
    """
    Load prompt from prompts folder
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, '..', 'prompts', f'{name}.txt')
    with open(path) as f:
        return f.read()