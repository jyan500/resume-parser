from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline
from huggingface_hub import snapshot_download
import spacy
import re
from utils.constants import ( 
    SPACY_HEADER_SELF_EMPLOYED, 
    SPACY_HEADER_WORK_MODE, 
    COMPANY_OVERRIDES, 
    WORK_MODES 
)

class Models:
    def __init__(self):
        self.ner, self.nlp, self.zero_shot_classifier = self.load_models()

    def load_models(self):
        # Resume NER
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
        self.nlp = spacy.load("en_core_web_lg")
        self._add_entity_ruler()

        # Zero Shot Classifier
        zsc_model_path = snapshot_download("valhalla/distilbart-mnli-12-6", cache_dir="./models")
        # uses AutoModelForSequenceClassification by default here (instead of token classification like the NER)
        self.zero_shot_classifier = pipeline(
            "zero-shot-classification",
            model=zsc_model_path
        )

        return self.ner, self.nlp, self.zero_shot_classifier

    def _add_entity_ruler(self):
        ruler = self.nlp.add_pipe("entity_ruler", after="ner", config={"overwrite_ents": True})
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
        return self.nlp(text)
    
    def print_doc(self, spacy_doc):
        for ent in spacy_doc.ents:
            print(f"{ent.text} -> {ent.label_}")
        
    def group_entities(self, text):
        """
        group each entity by its group and within each group, sort by the entity's score
        """
        entities = self.ner(text)
        groups = {}
        for ent in entities:
            label = ent["entity_group"]
            if label in groups:
                groups[label].append(ent)
            else:
                groups[label] = [ent]
        # sort each group by its score descending
        for key in groups:
            groups[key].sort(key=lambda x: x["score"], reverse=True)
        return groups
    
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