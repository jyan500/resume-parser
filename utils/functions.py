import re
from spacy.matcher import Matcher
from utils.constants import ( 
    NLP, 
    FULLNAME_PATTERN,
    EMAIL_PATTERN, 
    PHONE_NUMBER_PATTERNS,
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
        match a first/last name
    """
    matcher = Matcher(NLP.vocab)
    matcher.add("FULL_NAME", [FULLNAME_PATTERN])
    doc = NLP(text)
    matches = matcher(doc)

    # separate the first and last name
    for (match_id, start, end) in matches:
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