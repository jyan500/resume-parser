MAX_PAGES = 3
MAX_WORDS = 1500
GEMINI_FLASH_LITE_MODEL = "gemini-2.5-flash-lite"
# GEMINI_FLASH_MODEL = "gemini-3-flash-preview"
GEMINI_FLASH_MODEL = "gemini-2.5-flash"
# Match exact words to categorize as a section
MINIMAX_M2_5_MODEL = "minimax/minimax-m2.5:free"
OPENAI_GPT_OSS_120B_MODEL = "openai/gpt-oss-120b:free"
NVIDIA_NEMOTRON_3 = "nvidia/nemotron-3-super-120b-a12b:free"

SECTION_PATTERNS = {
    'summary': r'(?i)^(summary|profile|objective|about|personal summary|professional summary)$',
    'experience': r'(?i)^(experience|work history|employment|professional experience|work experience)$',
    'education': r'(?i)^(education|academic background|academic)$',
    'skills': r'(?i)^(skills|technical skills|competencies|core competencies)$',
    'projects': r'(?i)^(projects)$',
    'interests': r'(?i)^(interests|hobbies)$',
    'certifications': r'(?i)^(certifications)$',
    'languages': r'(?i)^(languages|foreign languages)$',
}
