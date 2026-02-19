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
URL_PATTERN = r'(?:https?://)?(?:www\.)?[\w\-]+\.[\w\-]+(?:/[\w\-._~:/?#[\]@!$&\'()*+,;=%]*)?'

# if the first line of the resume has any of the following, it's likely not the first name/last name
NAME_SKIP_PATTERNS = ['@', 'http', 'www.', '(', ')', '+', 'engineer', 'developer', 
                     'designer', 'manager', 'analyst', 'scientist', 'consultant']

COMMON_COUNTRIES = {
    'USA': ['USA', 'United States', 'U.S.', 'U.S.A.', 'America'],
    'Canada': ['Canada'],
    'UK': ['UK', 'United Kingdom', 'Britain', 'England', 'Scotland', 'Wales'],
    'Australia': ['Australia'],
    'Germany': ['Germany'],
    'France': ['France'],
    'India': ['India'],
    'China': ['China'],
    'Japan': ['Japan'],
    'Brazil': ['Brazil'],
    'Mexico': ['Mexico'],
    'Spain': ['Spain'],
    'Italy': ['Italy'],
    'Netherlands': ['Netherlands'],
    'Switzerland': ['Switzerland'],
    'Singapore': ['Singapore']
}

US_STATE_ABBREVIATIONS = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
}

US_STATE_FULLNAMES = {value: key for key,value in US_STATE_ABBREVIATIONS.items()}

CANADIAN_PROVINCES = {
    'AB': 'Alberta', 'BC': 'British Columbia', 'MB': 'Manitoba',
    'NB': 'New Brunswick', 'NL': 'Newfoundland and Labrador', 'NS': 'Nova Scotia',
    'ON': 'Ontario', 'PE': 'Prince Edward Island', 'QC': 'Quebec', 'SK': 'Saskatchewan',
    'NT': 'Northwest Territories', 'NU': 'Nunavut', 'YT': 'Yukon'
}

CANADIAN_PROVINCES_FULLNAMES = {value: key for key, value in CANADIAN_PROVINCES.items()}

AUSTRALIAN_STATES = {
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'SA': 'South Australia',
    'WA': 'Western Australia',
    'TAS': 'Tasmania',
    'NT': 'Northern Territory',
    'ACT': 'Australian Capital Territory'
}

AUSTRALIAN_STATE_FULLNAMES = {value: key for key, value in AUSTRALIAN_STATES.items()}