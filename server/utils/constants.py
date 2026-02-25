import spacy

NLP = spacy.load('en_core_web_sm')
LOCATION_PATTERN = r'^[A-Z][a-zA-Z\s]+,\s*[A-Z]{2,3}$'

# Match exact words to categorize as a section
SECTION_PATTERNS = {
    'summary': r'(?i)^(summary|profile|objective|about|professional summary)$',
    'experience': r'(?i)^(experience|work history|employment|professional experience|work experience)$',
    'education': r'(?i)^(education|academic background|academic)$',
    'skills': r'(?i)^(skills|technical skills|competencies|core competencies)$',
    'projects': r'(?i)^(projects)$',
    'interests': r'(?i)^(interests|hobbies)$',
    'accomplishments': r'(?i)^(accomplishments|achievements)$',
    'certifications': r'(?i)^(certifications)$',
    'languages': r'(?i)^(languages|foreign languages)$',
}

# Patterns that strongly indicate a header line, not a bullet (within the experience section)
HEADER_PATTERNS = [
    r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b',  # month names
    r'\d{4}\s*[-–—]\s*(\d{4}|present)',                         # year ranges
    r'^(january|february|march|april|may|june|july|august|september|october|november|december)',
    r'^\+?[\d\s\(\)\-]{7,}$',                                   # phone numbers
    r'^[\w\.-]+@[\w\.-]+\.\w+$',                                # email
    r'https?://',                                                # URLs
]

# Firstname Lastname
FULLNAME_PATTERN = [{"POS": "PROPN"}, {"POS": "PROPN"}]

BULLET_VERB_TAGS = {"VBD", "VBG", "VBZ", "VBN"}  # past, gerund, present, past-participle

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_NUMBER_PATTERNS = [
    # (123) 456-7890, 123-456-7890, +1-123-456-7890
    r'\+?\d{1,3}?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
    r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # Simple US
    r'\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}'  # International
]

DATE_RANGE_PATTERN = (
    # START DATE
    r'(?:'
        # Numeric formats: 6/1/2017, 6-1-2017, 6.1.2017
        r'\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}'
        r'|'
        # Month/Year: 6/2017, 6-2017, 6.2017
        r'\d{1,2}[/.\-]\d{2,4}'
        r'|'
        # Month name formats
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)'
        r'(?:uary|ruary|ch|il|e|y|ust|tember|ober|ember)?'  # Full month names
        r'\.?'                                                # Optional period
        r'\s+'
        r'(?:\d{1,2}(?:st|nd|rd|th)?\s+)?'                  # Optional day
        r'\d{4}'                                             # Year
        r'|'
        # Quarter notation
        r'Q[1-4]\s+\d{4}'
        r'|'
        # Season notation
        r'(?:Spring|Summer|Fall|Autumn|Winter)\s+\d{4}'
        r'|'
        # Just year
        r'\d{4}'
    r')'
    
    # SEPARATOR - more options
    r'\s*(?:[-–—]|to|TO|To)\s*'
    
    # END DATE (same as start, plus variations of "present")
    r'(?:'
        r'\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}'
        r'|'
        r'\d{1,2}[/.\-]\d{2,4}'
        r'|'
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)'
        r'(?:uary|ruary|ch|il|e|y|ust|tember|ober|ember)?'
        r'\.?\s+(?:\d{1,2}(?:st|nd|rd|th)?\s+)?\d{4}'
        r'|'
        r'Q[1-4]\s+\d{4}'
        r'|'
        r'(?:Spring|Summer|Fall|Autumn|Winter)\s+\d{4}'
        r'|'
        r'\d{4}'
        r'|'
        # More "present" variations
        r'(?:Present|Current|Now|Ongoing|Today|present|current|PRESENT|CURRENT)'
    r')'
)