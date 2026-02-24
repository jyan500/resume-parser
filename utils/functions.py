import re
from spacy.matcher import Matcher
from utils.constants import ( 
    NLP, 
    FULLNAME_PATTERN,
    EMAIL_PATTERN, 
    HEADER_PATTERNS,
    PHONE_NUMBER_PATTERNS,
    DATE_RANGE_PATTERN,
    BULLET_VERB_TAGS,
)
from enum import Enum, auto

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

def token_is_action_verb(token) -> bool:
    """
    Determines if a token is acting as an action verb, even if spaCy
    has mislabeled it (e.g. NNP instead of VBD for 'Led').
    """
    # First, trust spaCy if it's confident
    if token.tag_ in BULLET_VERB_TAGS:
        return True

    # If spaCy is uncertain (tagged as noun/proper noun), use context
    # to infer whether it's acting as a verb
    if token.tag_ in {"NNP", "NN", "JJ"}:
        # Look at the tokens immediately following this one
        next_tokens = [t for t in token.doc[token.i + 1:token.i + 4]]

        for next_token in next_tokens:
            # A direct object following strongly implies this is a verb
            # e.g. "Led [development]" — "development" is dobj
            if next_token.dep_ in {"dobj", "nsubj", "attr"}:
                return True

            # A preposition following also implies verb
            # e.g. "Led [a] team..." or "Worked [with]..."
            if next_token.dep_ in {"prep", "det"} and next_token.head == token:
                return True

    return False

def is_body_line(line: str) -> bool:
    """
    Determine if the line is a bullet point of the experience section,
    as opposed to a header (i.e company name, job title, date range, company location, etc)
    """
    line = line.strip()
    if not line:
        return False

    # 1. Explicit negative check — rule out known header patterns immediately
    #    This runs before spaCy to keep it cheap
    for pattern in HEADER_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return False

    doc = NLP(line)
    words = [token for token in doc if not token.is_punct and not token.is_space]
    word_count = len(words)

    if word_count == 0:
        return False

    # 2. Stop word density — only meaningful above a minimum word count.
    #    Short lines like "The Bank of America" would hit 60%+ and false-positive.
    if word_count >= 6:
        stop_word_count = sum(
            1 for token in words
            if token.is_stop
            and not (token.text.isupper() and len(token.text) <= 3)  # exclude abbreviations
        )
        if stop_word_count / word_count > 0.25:
            return True

    # 3. Action verb check and check if its followed by a preposition or direct object
    # This prevents issues where a verb such as "Led" gets miscategorized as a proper noun or adjective
    # since the context would treat this as a verb 
    # (i.e Led development team ... )
    for token in doc[:3]:
        if token_is_action_verb(token):
            return True

    # 4. Length fallback — raised threshold, only fires if nothing else matched
    if word_count > 15:
        return True

    return False

class ParserState(Enum):
    # set auto() to make sure each enum key has a unique value, but the value
    # itself is not relevant
    SEEKING_HEADER = auto()
    IN_HEADER = auto()
    IN_BULLETS = auto()

def split_experience_entries(text):
    lines = [line.strip() for line in text.split('\n')]
    entries = []

    state = ParserState.SEEKING_HEADER
    current_header = []   # company, title, location, date lines
    current_bullets = []  # bullet point lines

    def save_entry():
        if current_header or current_bullets:
            entries.append({
                'header': '\n'.join(current_header),
                'bullets': '\n'.join(current_bullets)
            })

    for line in lines:
        if not line:
            continue
        
        has_date = bool(re.search(DATE_RANGE_PATTERN, line, re.IGNORECASE))
        is_bullet = is_body_line(line)

        if state == ParserState.SEEKING_HEADER:
            if not is_bullet:
                current_header.append(line)
                state = ParserState.IN_HEADER
                if has_date:
                    state = ParserState.IN_BULLETS

        elif state == ParserState.IN_HEADER:
            if has_date:
                # Date confirms this whole header block is real
                current_header.append(line)
                state = ParserState.IN_BULLETS

            elif is_bullet:
                # Body line arrived before any date — the "header" 
                # we buffered was probably trailing text from the 
                # last entry. Flush it back and treat this as a bullet.
                current_bullets.extend(current_header)
                current_header = []
                current_bullets.append(line)
                state = ParserState.IN_BULLETS

            else:
                # Another short line, keep buffering
                current_header.append(line)

        elif state == ParserState.IN_BULLETS:
            if has_date:
                # New job entry found mid-bullets (this is a rare case if the bullet points have a date range,
                # which is a strong indicator of a new header)
                save_entry()
                current_header = [line]
                current_bullets = []
                state = ParserState.IN_BULLETS  # date already seen

            elif is_bullet:
                current_bullets.append(line)

            else:
                # Short line while collecting bullets — candidate 
                # for a new job's header. Save current entry and start fresh.
                save_entry()
                current_header = [line]
                current_bullets = []
                state = ParserState.IN_HEADER

    # Flush whatever's left
    save_entry()

    return entries