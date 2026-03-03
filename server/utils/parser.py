import pdfplumber
import docx2txt
import re
import traceback
from utils.models import Models
from utils.functions import (
    capitalize_clean_text
)
from utils.constants import (
    EMAIL_PATTERN,
    PHONE_NUMBER_PATTERNS,
    SECTION_PATTERNS,
    DATE_PATTERNS,
    DATE_RANGE_PATTERN,
    COMPANY_OVERRIDES,
    WORK_MODES,
    SPACY_HEADER_SELF_EMPLOYED,
    SPACY_HEADER_WORK_MODE,
    REGION_ABBREVIATIONS,
)
from collections import defaultdict
from string import punctuation

class ResumeParser:
    def __init__(self):
        self.predictions = Models()

    def parse_resume(self, filepath):
        """Extract text from resume file"""
        if filepath.endswith('.pdf'):
            text = self._parse_pdf(filepath)
        elif filepath.endswith('.docx'):
            text = self._parse_docx(filepath)
        else:
            raise ValueError('Unsupported file format')
        text = self._clean_text(text)
        structured_data = self._parse_resume_structured(text)
        return structured_data

    def _parse_pdf(self, filepath):
        """Extract text from PDF"""
        text = ''
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + '\n'
        
        return text.strip()

    def _parse_docx(self, filepath):
        """Extract text from Word document"""
        text = docx2txt.process(filepath)
        return text.strip()

    def _parse_resume_structured(self, text):
        """ Main function to parse resume into structured format """
        resume_data = {}
        try:
            # Step 1: Identify sections
            # returns the section header and content between each section
            sections = self._identify_sections(text)

            # Step 2: Extract Header
            header = self._extract_header(text, sections)

            # Step 3: Extract Summary
            summary = self._extract_summary(sections.get("summary", ""))

            # Step 4: Extract Experiences
            # Make sure to merge any broken lines that are commonly found
            # in experience sections within pdf resumes
            experiences = self._extract_experience(sections.get("experience", ""))

            resume_data = {
                "header": header,
                "summary": summary,
                "experiences": experiences,
                "education": "",
                "skills": ""
            }
        except Exception as e:
            print(traceback.print_exc())

        return resume_data 
    
    def _identify_sections(self, text):
        """ Split resume into sections based on common headers """

        lines = text.split("\n")
        sections = {}
        current_section = None
        current_content = []
        section_start_line = {}

        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if not line_stripped:
                continue

            # check if this line is a section header
            is_header = False
            for section_name, pattern in SECTION_PATTERNS.items():
                if re.match(pattern, line_stripped):
                    # If we've found a section, save previous section
                    # and all of its content in the sections dict
                    if current_section:
                        sections[current_section] = "\n".join(current_content)

                    # Start new section
                    current_section = section_name
                    current_content = []

                    # save the line number where the new section begins
                    section_start_line[section_name] = i
                    is_header = True
                    break
            
            # save all content between each section
            if not is_header and current_section:
                current_content.append(line)

        # add the last section found (if available)
        if current_section != None and len(current_content) > 0:
            sections[current_section] = "\n".join(current_content)

        # Store the line numbers where each section starts (for header extraction) 
        sections["_meta"] = {"section_start_line": section_start_line}

        return sections

    # Header Extraction
    def _extract_header(self, text, sections):
        # Get text before first section (usually contact info)
        lines = text.split("\n")
        header_lines = []

        # Find where first section starts
        meta = sections.get("_meta", {})
        section_starts = meta.get("section_start_line", {})
        # find the first section
        first_section_line = min(section_starts.values() if section_starts else len(lines))

        # Get lines before first section (typically first 5-10 lines)
        header_text = "\n".join(lines[:min(first_section_line, 15)])

        # Extract components
        email = self._extract_email(header_text)
        phone = self._extract_phone_number(header_text)
        name_parts = self._extract_name(header_text)
        urls = self._extract_urls(header_text)

        return {
            "first_name": name_parts.get("first_name", ""),
            "last_name": name_parts.get("last_name", ""),
            "phone": phone,
            "email": email,
            "urls": urls
        }

    # Summary Extraction
    def _extract_summary(self, text):
        if not text:
            return ""
        return text.strip().replace("\n", " ")

    # Experience Extraction
    def _extract_experience(self, text):
        """ 
        Parse experience section into structured objects containing 
        company, date range and bullet points 
        """
        if not text:
            return []

        experiences = []
        entries = self._split_experience_entries(text)
        # TODO: just for debugging
        experiences = entries

        return experiences

    def _clean_text(self, text: str) -> str:
        replacements = {
            '\u25cf': '-', '\u25cb': '-', '\u25a0': '-',
            '\u2022': '-', '\u2023': '-', '\u2043': '-',
            '\u2013': '-', '\u2014': '-', '\u2019': "'",
            '\u201c': '"', '\u201d': '"', '\u2026': '...',
        }
        for unicode_char, replacement in replacements.items():
            text = text.replace(unicode_char, replacement)

        text = text.encode('ascii', 'ignore').decode('ascii')

        return text

    def _extract_email(self, text) -> str:
        """ Extract email address from text """
        match = re.search(EMAIL_PATTERN, text)
        return match.group(0) if match else ""

    def _extract_phone_number(self, text) -> str:
        """ Extract phone number from text """
        for pattern in PHONE_NUMBER_PATTERNS:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return ""

    def _extract_name(self, text: str) -> dict:
        """ 
            Using Named Entity Recognition,
            match a first/last name
        """
        entities = self.predictions.group_entities(text)
        res = {"first_name": "", "last_name": ""}
        if "PERSON" in entities:
            # get the highest scoring possibility for a name
            if "word" in entities["PERSON"][0]:
                fullname = entities["PERSON"][0]["word"]
                parts = fullname.split(" ")
                if len(parts) > 0:
                    first_name = parts[0][0].upper() + parts[0][1:]
                    res["first_name"] = first_name
                if len(parts) == 2:
                    res["last_name"] = parts[1][0].upper() + parts[1][1:]
        return res

    def _extract_urls(self, text: str) -> [str]:
        """ Extract all URLs from header text, ignoring any emails """
        pattern = re.compile(
        r'\b'
        r'(?<![@\w])'               # negative lookbehind: not preceded by @ or word char
        r'(?:https?://)?'           # optional protocol
        r'(?:www\.)?'               # optional www
        r'[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]'  # domain (min 3 chars, no single letters)
        r'\.[a-zA-Z]{2,}'           # TLD (at least 2 letters, rules out "U.S" since S is 1 char)
        r'(?:/[^\s]*)?'             # optional path
        r'\b'
    )
        matches = re.findall(pattern, text)
        
        # Step 2: Filter out matches that contain an "@" symbol, thus ignoring emails.
        urls = [match for match in matches if '@' not in match]
        
        return urls


    def _split_experience_entries(self, text: str) -> [dict]:
        lines = [line for line in text.split('\n')]
        # print(lines)
        entries = defaultdict(dict) 
        current_header_block = []
        current_body_block = []
        
        entryId = 0
        for line in lines:
            is_header = self._is_header_line(line)
            if is_header:
                # If our current_header was empty before this, that means that
                # we were just in a previous body section, so we need to save the previous body section
                # and then reset the body and increment the entryId to indicate a new section
                if len(current_header_block) == 0 and len(current_body_block) > 0:
                    entries[entryId]["bullets"] = current_body_block
                    current_body_block = []
                    entryId += 1
                    entries[entryId] = {
                        "header": [],
                        "bullets": []
                    }

                # add to the current header block
                current_header_block.append(line)

            else:
                # If we've found headers but are now in the body, we need to save the current header block,
                # and reset the current header block
                if len(current_header_block) > 0:
                    entries[entryId]["header"] = current_header_block
                    current_header_block = []
                current_body_block.append(line)

        # after the loop finishes, collect the last body block
        if len(current_body_block) > 0:
            entries[entryId]["bullets"] = current_body_block

        # after splitting off the headers and bullets, change the header from array to
        # object containing each entity (i.e "job_title", "date_range", etc)
        for entryId in entries:
            entry = entries[entryId]
            entities = self._extract_entities_from_job_header(entry["header"])
            entries[entryId]["header"] = entities
        return list(entries.values())
    
        
    def _is_header_line(self, line: str) -> bool:
        """
        Aiming to catch companies, job titles, location or date range
        ...
        """
        if not line.strip():
            return False

        # If a date exists in the line, it's almost certainly a header
        if re.search(DATE_RANGE_PATTERN, line, re.IGNORECASE):
            return True

        # --- Stage 1: POS filter (same logic as the repo) ---
        doc = self.predictions.get_spacy_doc(line)
        spacy_entities = {ent.label_ for ent in doc.ents}

        # TODO: remove
        # for ent in doc.ents:
        #     print(f"word: {ent} label: {ent.label_}")

        self_employment_exists = SPACY_HEADER_SELF_EMPLOYED in spacy_entities
        work_mode_exists = SPACY_HEADER_WORK_MODE in spacy_entities

        tags = [token.tag_ for token in doc]
        if not tags:
            return False

        has_verb = any(tag.startswith("V") for tag in tags)
        most_common_tag = max(set(tags), key=tags.count)

        # Lines dominated by nouns with no verbs are candidates, and also need to 
        # catch an edge case where our special cases get marked as adjectives or other tags,
        # so need to not reject these cases here.
        if not self_employment_exists and (has_verb or most_common_tag not in ("NNP", "NN")):
            # print("fails on verbiage check")
            return False

        # --- Stage 2: NER confirmation ---
        ner_results = self.predictions.ner(line)
        # print("ner_results: ", ner_results)
        
        header_entities = {"Designation", "ORG", "DATE", "GPE"}
        
        found_entities = {result["entity_group"] for result in ner_results}

        # perform set intersection
        header_entity_exists = any(e in header_entities for e in found_entities) 
        spacy_header_entities = {"SELF_EMPLOYED", "WORK_MODE", "GPE", "LOC", "DATE"}

        if header_entity_exists:
            return True
        if any(e in spacy_header_entities for e in spacy_entities): 
            return True

        return False

    def _run_zero_shot_classification_on_results(self, tokens, classes):
        element = ""
        confidence = 0
        for token in tokens:
            res = self.predictions.zero_shot_classifier(token, classes)
            print("res: ", res)
            class_score = zip(res["labels"], res["scores"])
            print("class_score: ", class_score)
            highest = sorted(class_score, key=lambda x: x[1])[-1]
            print("*******************")
            print("highest: ", highest)
            print("token: ", token)
            if highest[1] > confidence:
                if (highest[0] in classes):
                    element = token.strip()
                    confidence = highest[1]
        return element

    def _extract_entities_from_job_header(self, header_array):
        """
        Extract Job Title, Company, Location, Date Range, Work Type from the 
        header of each job section within the work experiences
        """
        # Combine the lines to give the classifier a better chance
        # of identifying each entity with the additional context of being
        # analyzed all together as opposed to line-by-line
        # the array placeholders are to collect potential tokens to run the zero shot classifier on,
        # as NER and spacy struggle to correctly distinguish the company/location on their own.
        result = {
            "job_title": "",
            "company": [],
            "date_range": "",
            "location": [],
            "work_mode": ""
        }
        header_line = " ".join(header_array)
        ner_results = self.predictions.group_entities(header_line) 
        # found_entities = {result["entity_group"] for result in ner_results}
        doc = self.predictions.get_spacy_doc(header_line)
        date = re.search(DATE_RANGE_PATTERN, header_line, re.IGNORECASE)
        self_employed = "" 
        if date:
            result["date_range"] = date.group(0)
        # spacy_entities = {ent.label_ for ent in doc.ents}
        # print("found entities: ", found_entities)
        # print("date: ", date)
        # print("spacy_entities: ", spacy_entities)
        print(ner_results)
        for entity_group in ner_results:
            # find the top result of each entity group, where the
            # top result is the highest match score, should already be in descending order
            results = ner_results[entity_group]
            if len(results):
                top_result = capitalize_clean_text(results[0]["word"])
                if entity_group == "Designation":
                    print("top_result: ", top_result)
                    result["job_title"] = top_result
                # NER sometimes correctly identifies the ORG and sometimes doesn't,
                # so need to add both types to the to company list
                if entity_group == "ORG" or entity_group == "GPE":
                    print("top_result: ", top_result)
                    result["company"].append(top_result)

        for ent in doc.ents:
            print("ent: ", ent, " ", ent.label_)
            # spacy sometimes identifies the org and location but not correctly labeled,
            # thus adding to both lists
            if ent.label_ == "ORG" or ent.label_ == "GPE" or ent.label_ == "LOC":
                result["company"].append(ent.text)
                result["location"].append(ent.text)
            # note that if self employed is found, this is likely the company,
            # and we skip the zero shot classification here for this edge case
            if ent.label_ == "SELF_EMPLOYED":
                self_employed = ent.text
                print("self_employed found; ", self_employed)
            if ent.label_ == "WORK_MODE":
                result["work_mode"] = ent.text
        
        # run zero shot classification to distinguish company and location,
        # skip if company classification if self employed 
        print("results before zero shot: ", result)
        result["company"] = self._run_zero_shot_classification_on_results(
            result["company"], 
            ["company", "organization", "institution"]
        ) if self_employed == "" else self_employed 
        result["location"] = self._run_zero_shot_classification_on_results(
            result["location"], 
            ["location"]
        )
        # look for a region abbreviation immediately after the location in the original line
        # handles "San Francisco, CA" or "San Francisco CA"
        pattern = re.compile(
            rf'{re.escape(result["location"])}\s*,?\s*([A-Z]{{2}})\b'
        )
        match = re.search(pattern, header_line)
        if match:
            abbrev = match.group(1)
            if abbrev in REGION_ABBREVIATIONS:
                result["location"] = f"{result['location']}, {abbrev}"
        print("res: ", result)
        return result
        
