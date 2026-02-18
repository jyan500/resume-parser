import pdfplumber
import docx2txt
import spacy
import re
from utils.constants import (
    SECTION_PATTERNS
)

def parse_resume(filepath):
    """Extract text from resume file"""
    if filepath.endswith('.pdf'):
        text = parse_pdf(filepath)
    elif filepath.endswith('.docx'):
        text = parse_docx(filepath)
    else:
        raise ValueError('Unsupported file format')
    
    structured_data = parse_resume_structured(text)
    return structured_data

def parse_pdf(filepath):
    """Extract text from PDF"""
    text = ''
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + '\n'
    
    return text.strip()

def parse_docx(filepath):
    """Extract text from Word document"""
    text = docx2txt.process(filepath)
    return text.strip()

def parse_resume_structured(text):
    """ Main function to parse resume into structured format """

    # Step 1: Identify sections
    # returns the section header and content between each section
    sections = identify_sections(text)

    print(sections, flush=True)

    resume_data = {
        "header": "",
        "summary": "",
        "experiences": "",
        "education": "",
        "skills": ""
    }

    return resume_data 

def identify_sections(text):
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
