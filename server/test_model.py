from huggingface_hub import snapshot_download
import spacy
from transformers import pipeline
from utils.parser import ResumeParser

# model_path = snapshot_download("yashpwr/resume-ner-bert-v2", cache_dir="./models")
# NLP = pipeline("token-classification", model=model_path, aggregation_strategy="simple")
# NLP = spacy.load(model_path)
# model_path = snapshot_download("manishiitg/resume-ner", cache_dir="./models")
# pipe = pipeline("token-classification", model=model_path, aggregation_strategy="simple")
# NLP = spacy.load('en_core_web_lg')
# print("Model downloaded.")
parser = ResumeParser()

# line = "Self-Employed San Francisco, CA - Remote"
lines = [

    "React, TypeScript, RTK Query, Tailwind, Node.js, Express, PostgreSQL, Knex.js, Recharts and Gemini.",
    "Self-Employed Remote",
    "Rhumbix San Francisco, CA - Remote",
    "Home Campus Costa Mesa, CA - Remote",
    "- Initiated redesign of legacy Android/iOS application into a hybrid mobile application using Ionic 3 and Angular 2."

]
for i in range(len(lines)):
    print(f"****** Test #{i+1} ******")
    is_header = parser._is_header_line(lines[i])
    print("line: ", lines[i])
    print("is_header: ", is_header)
