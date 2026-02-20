import re
from spacy.matcher import Matcher
from utils.constants import ( 
    NLP, 
    FULLNAME_PATTERN,
    EMAIL_PATTERN, 
    PHONE_NUMBER_PATTERNS,
    DATE_RANGE_PATTERN,
)

def clean_text(text):
    """Remove or replace problematic Unicode characters"""
    
    replacements = {
        '\u25cf': '-',  # ● 
        '\u25cb': '-',  # ○
        '\u25a0': '-',  # ■
        '\u2022': '-',  # •
        '\u2023': '-',  # ‣
        '\u2043': '-',  # ⁃
        '\u2013': '-',  # –
        '\u2014': '-',  # —
        '\u2019': "'",  # '
        '\u201c': '"',  # "
        '\u201d': '"',  # "
        '\u2026': '...',  # …
    }
    
    for unicode_char, replacement in replacements.items():
        text = text.replace(unicode_char, replacement)
    
    # Remove any remaining problematic characters
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    return text

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
        match a first/last name
    """
    matcher = Matcher(NLP.vocab)
    matcher.add("FULL_NAME", [FULLNAME_PATTERN])
    doc = NLP(text)
    matches = matcher(doc)
    match_id, start, end = matches[0]
    span = doc[start:end]
    fullname = span.text
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

def extract_urls(text):
    """ Extract all URLs from header text, ignoring any emails """
    # Step 1: Broadly match potential URLs/emails.
    # This pattern looks for sequences of non-whitespace characters that contain a dot,
    # and might have common URL characters (:, /, @, ., -).
    # It tries to capture things that look like domains or URLs.
    potential_matches = re.findall(r'\S+\.\S+', text) #
    
    # Step 2: Filter out matches that contain an "@" symbol, thus ignoring emails.
    urls = [match for match in potential_matches if '@' not in match]
    
    return urls

def split_experience_entries(text):
    """Split experience section into individual jobs"""
    
    lines = text.split('\n')
    entries = []
    current_entry = []
    
    for line in lines:
        # Check if line contains a date range (likely start of new entry)
        if re.search(DATE_RANGE_PATTERN, line, re.IGNORECASE) and current_entry:
            entries.append('\n'.join(current_entry))
            current_entry = [line]
        else:
            current_entry.append(line)
    
    # Add last entry
    if current_entry:
        entries.append('\n'.join(current_entry))
    
    return entries
