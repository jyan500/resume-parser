import re
from utils.constants import ( 
    NLP, 
    EMAIL_PATTERN, 
    PHONE_NUMBER_PATTERNS,
    ADDRESS_PATTERN,
    COMMON_COUNTRIES, 
    CANADIAN_PROVINCES,
    CANADIAN_PROVINCES_FULLNAMES,
    US_STATE_ABBREVIATIONS,
    US_STATE_FULLNAMES,
    AUSTRALIAN_STATES,
    AUSTRALIAN_STATE_FULLNAMES,
    URL_PATTERN,
    NAME_SKIP_PATTERNS,
)

def extract_email(text):
    """ Extract email address from text """
    match = re.search(EMAIL_PATTERN, text)
    return match.group(0) if match else ""

def extract_phone_number(text):
    """ Extract phone number from text """
    for pattern in PHONE_NUMBER_PATTERNS:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return ""

def extract_name(text):
    """ 
        Using Named Entity Recognition,
        match a first/last name in the first line of the resume
    """
    
    # Assume the first non-empty line of the resume usually contains the name
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    if not lines:
        return {"first_name": "", "last_name": ""}

    first_line = lines[0]

    # Check if the first line contains any of the skip patterns that would likely disqualify
    # this line from being the firstname/lastname
    if not re.search(PHONE_NUMBER_PATTERNS[1], first_line) and not any(pattern in first_line.lower() for pattern in NAME_SKIP_PATTERNS):
        parts = first_line.split()
        if len(parts) >= 2:
            return {
                "first_name": parts[0],
                "last_name": " ".join(parts[1:])
            }

    # categorize just the first line
    doc = NLP(first_line)

    # Look for PERSON entities
    persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]

    if persons:
        # separate the first and last name
        fullname = persons[0]
        parts = fullname.split()

        if len(parts) >= 2:
            return {
                "first_name": parts[0],
                # if the text includes a middle name, include that as part of the last name for display purposes
                "last_name": " ".join(parts[1:]),
            }
        elif len(parts) == 1:
            return {
                "first_name": parts[0],
                "last_name": ""
            }


    return {"first_name": "", "last_name": ""}

def match_address(text):
    
    city = ""    
    state = ""
    country = ""
    match = re.search(ADDRESS_PATTERN, text) 

    if match:
        potential_city = match.group(1).strip()
        potential_state = match.group(2).strip()
        # if a country is listed
        potential_country = match.group(3).strip() if match.group(3) else ""

        # check if middle element is a state abbreviation
        if potential_state in US_STATE_ABBREVIATIONS:
            city = potential_city
            state = potential_state
            country = "USA"
            if potential_country:
                # verify it matches the USA based on common variants such as "U.S", "US", "U.S.A", etc
                for country_standard, variants in COMMON_COUNTRIES.items():
                    if any(variant.lower() in potential_country.lower() for variant in variants):
                        country = country_standard
                        break
        # check if its a full state name
        elif potential_state in US_STATE_FULLNAMES:
            city = potential_city
            state = US_STATE_FULLNAMES[potential_state] # convert to abbreviation
            country = "USA"
        # Check if its a canadian province
        elif potential_state in CANADIAN_PROVINCES or potential_state in CANADIAN_PROVINCES_FULLNAMES:
            city = potential_city
            state = potential_state if potential_state in CANADIAN_PROVINCES else CANADIAN_PROVINCES_FULLNAMES[potential_state]
            country = "Canada"
        # check if its an australian state
        elif potential_state in AUSTRALIAN_STATES or potential_state in AUSTRALIAN_STATE_FULLNAMES:
            city = potential_city
            state = potential_state if potential_state in AUSTRALIAN_STATES else AUSTRALIAN_STATE_FULLNAMES[potential_state]
            country = "Australia"

        # couldn't identify state, might be "City, Country"
        else:
            city = potential_city
            if potential_country:
                country = potential_country
            elif potential_state:
                country = potential_state
    
    return {
        "city": city,
        "state": state,
        "country": country,
    }

def extract_location_using_ner(text):
    """ 
        Use NER to find the city, state, and country
    """
    doc = NLP(text)
    # Look for Geopolitical Entity
    locations = [ent.text for ent in doc.ents if ent.label_ == "GPE"]

    city_candidates = []
    city = ""
    state = ""
    country = ""

    for loc in locations:
        matched_country = False
        matched_state = False

        # Check if it's a country
        for country_standard, variants in COMMON_COUNTRIES.items():
            if any(variant.lower() in loc.lower() for variant in variants):
                country = country_standard
                matched_country = True
                break
        
        if matched_country:
            continue
    
        # Check if it's a U.S state (abbreviation)
        if loc in US_STATE_ABBREVIATIONS or loc in US_STATE_FULLNAMES:
            state = loc if loc in US_STATE_ABBREVIATIONS else US_STATE_FULLNAMES[loc]
            country = "USA"
            matched_state = True
        # Check if it's a canadian province
        elif loc in CANADIAN_PROVINCES or loc in CANADIAN_PROVINCES_FULLNAMES:
            state = loc if loc in CANADIAN_PROVINCES else CANADIAN_PROVINCES_FULLNAMES[loc]
            country = "Canada"
            matched_state = True
        # check if it's an australian state
        elif loc in AUSTRALIAN_STATES or loc in AUSTRALIAN_STATE_FULLNAMES:
            state = loc if loc in AUSTRALIAN_STATES else AUSTRALIAN_STATE_FULLNAMES[loc]
            country = "Australia"
            matched_state = True
        
        # if not country or state, assume it's a city
        if not matched_state and not matched_country:
            city_candidates.append(loc)

    # Pick the most likely city (usually the first one)
    if not city and city_candidates: 
        city = city_candidates[0]
    
    return {
        "city": city,
        "state": state,
        "country": country
    }

def extract_location_state_fallback(text):
    """
    look for standalone state abbreviations in the text (i.e "CA")
    """
    city = ""
    state = ""
    country = ""

    state_pattern = r'\b(' + '|'.join(US_STATE_ABBREVIATIONS.keys()) + r')\b'
    state_match = re.search(state_pattern, text)
    if state_match:
        state = state_match.group(1)
        if not country:
            country = "USA"
    else:
        # Try canadian provinces
        province_pattern =  r'\b(' + '|'.join(CANADIAN_PROVINCES.keys()) + r')\b'
        province_match = re.search(province_pattern, text)
        if province_match:
            state = province_match.group(1)
            if not country:
                country = "Canada"
        
        # Try australian state
        else:
            australian_state_pattern = r'\b(' + '|'.join(AUSTRALIAN_STATES.keys()) + r')\b' 
            australian_state_match = re.search(australian_state_pattern, text)
            if australian_state_match:
                state = australian_state_match.group(1)
                if not country:
                    country = "Australia"
    
    return {
        "city": city,
        "state": state,
        "country": country
    }

def extract_location(text):
    """ 
    Extract city, state and country from header
    """
    # attempt to match address and parts using regex
    city, state, country = match_address(text).values()
        
    # if pattern matching didn't work, fall back to NER
    if not city and not country:
       city, state, country = extract_location_using_ner(text).values()

    # additional check, look for state abbreviations in the text 
    if not state:
        city, state, country = extract_location_state_fallback(text).values()
    
    return {
        "city": city,
        "state": state,
        "country": country,
    }

def extract_urls(text):
    """ Extract all URLs from header text """

    urls = []

    # Pattern 1: Full URLs without protocol
    full_matches = re.findall(URL_PATTERN, text, re.IGNORECASE)

    # skip any emails
    emails = re.findall(EMAIL_PATTERN, text)
    email_domains = [email.split('@')[1] for email in emails]

    for match in full_matches:
        # Add https:// prefix to domain-only URLs
        full_url = match if match.startswith("http") else f"https://{match}"
        # Remove trailing slashes
        full_url = full_url.rstrip("/")

        # note that if the domain is from an email domain (i.e gmail.com), ignore it
        domain = match.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        if domain in email_domains:
            continue

        if full_url not in urls:
            urls.append(full_url)
    
    return urls