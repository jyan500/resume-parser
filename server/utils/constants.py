MAX_PAGES = 3
MAX_WORDS = 1500
GEMINI_FLASH_LITE_MODEL = "gemini-2.5-flash-lite"
GEMINI_3_FLASH_LITE_MODEL = "gemini-3.1-flash-lite-preview"
# GEMINI_FLASH_MODEL = "gemini-3-flash-preview"
GEMINI_FLASH_MODEL = "gemini-2.5-flash"
OPENAI_GPT_OSS_120B_MODEL = "openai/gpt-oss-120b:free"
OPENAI_GPT4O_MINI_MODEL = "gpt-4o-mini"
OPENAI_GPT4_1_MINI_MODEL = "gpt-4.1-mini"
OPENAI_GPT_5_MINI_MODEL = "gpt-5-mini"

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
