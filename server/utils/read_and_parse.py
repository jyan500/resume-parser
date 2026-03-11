from utils.ner_parser_v2 import NerResumeParserV2
from utils.reader import ResumeReader
from utils.models_v2 import Models
import json
import os


class MainParser:
    def __init__(self):
        self.models = Models()
        self.reader = ResumeReader()
        self.parser = NerResumeParserV2(self.models.ner, self.models.ner_dates, self.models.zero_shot_classifier, self.models.tagger) 

    def parse_cv(self, file_path):
        resume_lines = self.reader.read_file(file_path)
        output = self.parser.parse(resume_lines)
        return output
