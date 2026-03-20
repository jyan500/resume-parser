MAX_PAGES = 3
MAX_WORDS = 1500
GEMINI_FLASH_LITE_MODEL = "gemini-2.5-flash-lite"
# Match exact words to categorize as a section
SECTION_PATTERNS = {
    'summary': r'(?i)^(summary|profile|objective|about|professional summary)$',
    'experience': r'(?i)^(experience|work history|employment|professional experience|work experience)$',
    'education': r'(?i)^(education|academic background|academic)$',
    'skills': r'(?i)^(skills|technical skills|competencies|core competencies)$',
    'projects': r'(?i)^(projects)$',
    'interests': r'(?i)^(interests|hobbies)$',
    'certifications': r'(?i)^(certifications)$',
    'languages': r'(?i)^(languages|foreign languages)$',
}
