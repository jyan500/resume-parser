from utils.ner_parser_v2 import NerResumeParserV2
from utils.models_v2 import Models

models = Models()
parser = NerResumeParserV2(models.ner, models.ner_dates, models.zero_shot_classifier, models.tagger) 

parser.parse_job_history(["Software Engineer", "Sep 2021 - Jul 2023", "Rhumbix", "Remote", "knex.js", "Collaborate with product and development teams to ship new features."])
