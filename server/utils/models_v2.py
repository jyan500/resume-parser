from transformers import AutoTokenizer, AutoModelForTokenClassification, AutoModelForSequenceClassification
from transformers import pipeline
from huggingface_hub import snapshot_download
import spacy
from utils.constants import ( 
    SPACY_HEADER_SELF_EMPLOYED, 
    SPACY_HEADER_WORK_MODE, 
    COMPANY_OVERRIDES, 
    WORK_MODES 
)

class Models:
    def __init__(self):
        self.ner, self.ner_dates, self.zero_shot_classifier, self.tagger = self.load_trained_models()

    def load_trained_models(self):
        #NER (dates)
        date_path = snapshot_download("Jean-Baptiste/camembert-ner-with-dates", cache_dir="./models")
        tokenizer = AutoTokenizer.from_pretrained("Jean-Baptiste/camembert-ner-with-dates")
        model = AutoModelForTokenClassification.from_pretrained("Jean-Baptiste/camembert-ner-with-dates")
        self.ner_dates = pipeline('ner', model=model, tokenizer=tokenizer, aggregation_strategy="simple")

        #Zero Shot Classification
        # self.zero_shot_classifier = pipeline("zero-shot-classification", model='facebook/bart-large-mnli')
        zsc_model_path = snapshot_download("valhalla/distilbart-mnli-12-6", cache_dir="./models")
        self.zero_shot_classifier = pipeline("zero-shot-classification", model=zsc_model_path)

        # Ner
        # bert_path = snapshot_download("dslim/bert-base-NER", cache_dir="./models")
        # tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
        # model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER")
        # self.ner = pipeline('ner', model=model, tokenizer=tokenizer, grouped_entities=True)
        model_path = snapshot_download("manishiitg/resume-ner", cache_dir="./models")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForTokenClassification.from_pretrained(model_path)
        self.ner = pipeline(
            "ner",
            model=model,
            tokenizer=tokenizer,
            aggregation_strategy="simple"
        )


        # spaCy POS tagger + tagging special cases like self-employed or work mode
        self.tagger = spacy.load("en_core_web_lg")
        self._add_entity_ruler()

        # Pos Tagging
        # path = snapshot_download("flair/pos-english-fast", cache_dir="./models")
        # self.tagger = SequenceTagger.load("flair/pos-english-fast")

        return self.ner, self.ner_dates, self.zero_shot_classifier, self.tagger
    
    def get_flair_sentence(self, sent):
        return Sentence(sent)

    def _add_entity_ruler(self):
        ruler = self.tagger.add_pipe("entity_ruler", after="ner", config={"overwrite_ents": True})
        # looks like this:
        # patterns = [
        #     # Company overrides
        #     {"label": "SELF_EMPLOYED", "pattern": [{"LOWER": "self"}, {"LOWER": "-"}, {"LOWER": "employed"}]},
        #     {"label": "SELF_EMPLOYED", "pattern": [{"LOWER": "career"}, {"LOWER": "development"}]},
        #     ...
        #     {"label": "WORK_MODE", "pattern": [{"LOWER": "on"}, {"LOWER": "-"}, {"LOWER": "site"}]},
        # ]
        patterns = []

        for word in COMPANY_OVERRIDES:
            tokens = self._create_entity_pattern_tokens(word)
            patterns.append({"label": SPACY_HEADER_SELF_EMPLOYED, "pattern": tokens})

        for word in WORK_MODES:
            tokens = self._create_entity_pattern_tokens(word) 
            patterns.append({"label": SPACY_HEADER_WORK_MODE, "pattern": tokens})
        ruler.add_patterns(patterns)

    def get_spacy_doc(self, text):
        return self.tagger(text)

    def _create_entity_pattern_tokens(self, word):
        """
        to tokenize words like "career development", 
        or "self-employed", and making sure each part is lowercase,
        first split by spaces
        then if there's a hyphen, split by that to apply
        lowercase on each section
        """
        tokens = []
        for segment in word.split(" "):
            parts = segment.split("-")
            for i, part in enumerate(parts):
                tokens.append({"LOWER": part})
                if i < len(parts) - 1:
                    tokens.append({"LOWER": "-"})
        return tokens