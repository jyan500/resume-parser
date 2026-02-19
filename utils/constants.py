import spacy

NLP = spacy.load('en_core_web_sm')

SECTION_PATTERNS = {
    'summary': r'(?i)^(summary|profile|objective|about|professional summary).*$',
    'experience': r'(?i)^(experience|work history|employment|professional experience|work experience).*$',
    'education': r'(?i)^(education|academic background|academic).*$',
    'skills': r'(?i)^(skills|technical skills|competencies|core competencies).*$',
    'projects': r'(?i)^(projects).*$',
    'interests': r'(?i)^(interests|hobbies).*$',
    'accomplishments': r'(?i)^(accomplishments|achievements).*$',
    'certifications': r'(?i)^(certifications).*$',
    'languages': r'(?i)^(languages|foreign languages).*$',
}

# Firstname Lastname
FULLNAME_PATTERN = [{"POS": "PROPN"}, {"POS": "PROPN"}]

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_NUMBER_PATTERNS = [
    # (123) 456-7890, 123-456-7890, +1-123-456-7890
    r'\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
    r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # Simple US
    r'\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}'  # International
]

# "City, State/Province, Country" or "City, Country"
# i.e
# San Francisco, CA, USA
# Toronto, ON, Canada
# New York, New York, USA
ADDRESS_PATTERN = r'([A-Z][a-z\s]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z]{2}|[A-Z][a-z\s]+)\s*,?\s*([A-Z][a-z\s]+)?'

# capture URLs with http/https
URL_PATTERN = r'(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})'
