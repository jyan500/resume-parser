import pdfplumber
from docx import Document

def parseResume(filepath):
    """ 
    Extract text from resume file
    """
    if filepath.endswith(".pdf"):
        return parsePdf(filepath)
    elif filepath.endswith(".docx"):
        return parseDocx(filepath)
    else:
        raise ValueError("Unsupported file format")

def parsePdf(filepath):
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return {"text": text.strip()}

def parseDocx(filepath):
    doc = Document(filepath)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return {"text": text.strip()}
    
