from utils.models_v2 import Models
from utils.segmenter import ResumeSegmenter
from datetime import datetime
from dateutil import parser
import re
from string import punctuation
from utils.constants import (
    DATE_RANGE_PATTERN,
    COMPANY_OVERRIDES,
    WORK_MODES,
    SPACY_HEADER_SELF_EMPLOYED,
    SPACY_HEADER_WORK_MODE,
)
from collections import defaultdict

class NerResumeParserV2:
    def __init__(self, ner, ner_dates, zero_shot_classifier, tagger):
        self.segmenter = ResumeSegmenter(zero_shot_classifier)
        self.ner, self.ner_dates, self.zero_shot_classifier, self.tagger = ner, ner_dates, zero_shot_classifier, tagger 
        self.parsed_cv = {}

    def parse(self, resume_lines):
        resume_segments = self.segmenter.segment(resume_lines)
        print("***************************** Parsing the Resume...***************************** ")
        for segment_name in resume_segments:
            if segment_name == "work_and_employment":
                resume_segment = resume_segments[segment_name]
                self.parse_job_history(resume_segment)
            elif segment_name == "contact_info":
                contact_info = resume_segments[segment_name]
                self.parse_contact_info(contact_info)
            elif segment_name == "education_and_training":
                education_and_training = resume_segments[segment_name]
                self.parse_education(education_and_training)
            elif segment_name == "skills_header":
                skills_header = resume_segments[segment_name]
                self.parse_skills(skills_header)
                print("************************************** SKILLS HEADER ***************************** <br>",skills_header)
        return self.parsed_cv

    def parse_education(self, education_and_training):
        self.parsed_cv['Education'] = education_and_training

    def parse_skills(self, skills_header):
        self.parsed_cv['Skills'] = skills_header

    def parse_contact_info(self, contact_info):
        contact_info_dict = {}
        name = self.find_person_name(contact_info)
        email = self.find_contact_email(contact_info)
        self.parsed_cv['Name'] = name
        contact_info_dict["Email"] = email
        self.parsed_cv['Contact Info'] = contact_info_dict

    def find_person_name(self, items):
        class_score = []
        splitter = re.compile(r'[{}]+'.format(re.escape(punctuation.replace("&", "") )))
        classes = ["person name", "address", "email", "title"]
        for item in items: 
            elements = splitter.split(item)
            for element in elements:
                element = ''.join(i for i in element.strip() if not i.isdigit())
                if not len(element.strip().split()) > 1: continue
                out = self.zero_shot_classifier(element, classes)
                highest = sorted(zip(out["labels"], out["scores"]), key=lambda x: x[1])[-1]
                if highest[0] == "person name":
                    class_score.append((element, highest[1]))
        if len(class_score):
            return sorted(class_score, key=lambda x: x[1], reverse=True)[0][0]
        return ""
    
    def find_contact_email(self, items):
        for item in items: 
            match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', item)
            if match:
                return match.group(0)
        return ""

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
        doc = self.tagger(line)
        spacy_entities = {ent.label_ for ent in doc.ents}

        # TODO: remove
        for ent in doc.ents:
            print(f"word: {ent} label: {ent.label_}")

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
            print("fails on verbiage check")
            return False

        # --- Stage 2: NER confirmation ---
        ner_results = self.ner(line)
        print("ner_results: ", ner_results)
        
        header_entities = {"Designation", "ORG", "DATE", "GPE"}
        
        found_entities = {result["entity_group"] for result in ner_results}

        # perform set intersection
        header_entity_exists = any(e in header_entities for e in found_entities) 
        exclude = {"CARDINAL", "PERSON"}
        spacy_header_entities = {"SELF_EMPLOYED", "WORK_MODE", "GPE", "LOC", "DATE", "ORG"}
        print("any e in exclude: ", any(e in exclude for e in spacy_entities))

        if header_entity_exists:
            return True
        if any(e in spacy_header_entities for e in spacy_entities): 
            return True

        # make sure entities like cardinals do not slip through, otherwise they may be misinterpreted by the zero shot classifier
        if any(e in exclude for e in spacy_entities):
            return False
            
        classes = ["organization", "institution", "job title"]
        out = self.zero_shot_classifier(line, classes)
        highest = sorted(zip(out["labels"], out["scores"]), key=lambda x: x[1])[-1]

        # final check to see if this segment is an organization, job title or institution
        if highest[0] in ["organization", "institution", "job title"]:
            return True

        return False

    def _extract_entities_from_job_header(self, entries):
        pass

    def parse_job_history(self, resume_segment):
        # print(lines)
        entries = defaultdict(dict) 
        current_header_block = []
        current_body_block = []
        
        entryId = 0
        for line in resume_segment:
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
        # for entryId in entries:
        #     entry = entries[entryId]
        #     entities = self._extract_entities_from_job_header(entry["header"])
        #     entries[entryId]["header"] = entities
        print("entries: ", list(entries.values()))
        return list(entries.values())
        # idx_job_title = self.get_job_titles(resume_segment)
        # current_and_below = False
        # if not len(idx_job_title): 
        #     self.parsed_cv["Job History"] = [] 
        #     return
        # if idx_job_title[0][0] == 0: current_and_below = True
        # job_history = []
        # for ls_idx, (idx, job_title) in enumerate(idx_job_title): 
        #     job_info = {}
        #     # print("<br> Job Title: ",job_title)
        #     job_info["Job Title"] = self.filter_job_title(job_title) 
        #     # company 
        #     if current_and_below: line1, line2 = idx, idx+1
        #     else: line1, line2 = idx, idx-1 
        #     job_info["Company"] = self.get_job_company(line1, line2, resume_segment)
        #     if current_and_below: st_span = idx
        #     else: st_span = idx-1
        #     # Dates 
        #     if ls_idx == len(idx_job_title) - 1: end_span = len(resume_segment) 
        #     else: end_span = idx_job_title[ls_idx+1][0]
        #     start, end = self.get_job_dates(st_span, end_span, resume_segment)
        #     job_info["Start Date"] = start
        #     job_info["End Date"] = end
        #     # if(start != "" and end != ""):
        #     job_history.append(job_info)
        # self.parsed_cv["Job History"] = job_history 

    def get_job_titles(self, resume_segment):
        classes = ["organization", "institution", "company", "job title", "work details"]
        idx_line = []
        for idx, line in enumerate(resume_segment):
            has_verb = False
            line_modifed = ''.join(i for i in line if not i.isdigit())
            print("line_modifed: ", line_modifed)
            sentence = self.models.get_flair_sentence(line_modifed)
            print("sentence; ", sentence)
            self.tagger.predict(sentence)
            print(sentence.to_dict())  # shows all annotation layers and their keys
            print(sentence.annotation_layers)  # shows what keys are available
            print("get_spans: ", sentence.get_spans("pos"))
            tags = []
            for token in sentence.tokens:
                tag = token.get_label('pos').value
                tags.append(tag)
                if tag.startswith("V"):
                    has_verb = True
            print("tags: ", tags)
            if len(tags) > 0:
                most_common_tag = max(set(tags), key=tags.count)
                if (most_common_tag == "NNP") or (most_common_tag == "NN"):
                # if most_common_tag == "NNP":
                    if not has_verb:
                        out = self.zero_shot_classifier(line, classes)
                        class_score = zip(out["labels"], out["scores"])
                        highest = sorted(class_score, key=lambda x: x[1])[-1]

                        if (highest[0] == "job title") or (highest[0] == "organization"):
                        # if highest[0] == "job title":
                            idx_line.append((idx, line))
        return idx_line

    def get_job_dates(self, st, end, resume_segment):
        search_span = resume_segment[st:end]
        dates = []
        for line in search_span:
            for dt in self.get_ner_in_line(line, "DATE"):
                if self.isvalidyear(dt.strip()):
                    dates.append(dt)
        if len(dates): first = dates[0]
        exists_second = False
        if len(dates) > 1:
            exists_second = True
            second = dates[1]
        
        if len(dates) > 0:
            if self.has_two_dates(first):
                d1, d2 = self.get_two_dates(first)
                return self.format_date(d1), self.format_date(d2)
            elif exists_second and self.has_two_dates(second): 
                d1, d2 = self.get_two_dates(second)
                return self.format_date(d1), self.format_date(d2)
            else: 
                if exists_second: 
                    st = self.format_date(first)
                    end = self.format_date(second)
                    return st, end
                else: 
                    return (self.format_date(first), "") 
        else: return ("", "")

    
    
    def filter_job_title(self, job_title):
        job_title_splitter = re.compile(r'[{}]+'.format(re.escape(punctuation.replace("&", "") )))
        job_title = ''.join(i for i in job_title if not i.isdigit())
        tokens = job_title_splitter.split(job_title)
        tokens = [''.join([i for i in tok.strip() if (i.isalpha() or i.strip()=="")]) for tok in tokens if tok.strip()] 
        classes = ["company", "organization", "institution", "job title", "responsibility",  "details"]
        new_title = []
        for token in tokens:
            if not token: continue
            res = self.zero_shot_classifier(token, classes)
            class_score = zip(res["labels"], res["scores"])
            highest = sorted(class_score, key=lambda x: x[1])[-1]
            if (highest[0] == "job title") or (highest[0] == "organization"):
            # if highest[0] == "job title":
                new_title.append(token.strip())
        if len(new_title):
            return ', '.join(new_title)
        else: return ', '.join(tokens)

    def has_two_dates(self, date):
        years = self.get_valid_years()
        count = 0
        for year in years:
            if year in str(date):
                count+=1
        return count == 2
    
    def get_two_dates(self, date):
        years = self.get_valid_years()
        idxs = []
        for year in years:
            if year in date: 
                idxs.append(date.index(year))
        min_idx = min(idxs)  
        first = date[:min_idx+4]
        second = date[min_idx+4:]
        return first, second
    def get_valid_years(self):
        current_year = datetime.today().year
        years = [str(i) for i in range(current_year-100, current_year)]
        return years

    def format_date(self, date):
        out = self.parse_date(date)
        if out: 
            return out
        else: 
            date = self.clean_date(date)
            out = self.parse_date(date)
            if out: 
                return out
            else: 
                return date

    def clean_date(self, date): 
        try:
            date = ''.join(i for i in date if i.isalnum() or i =='-' or i == '/')
            return date
        except:
            return date

    def parse_date(self, date):
        try:
            date = parser.parse(date)
            return date.strftime("%m-%Y")
        except: 
            try:
                date = datetime(date)
                return date.strftime("%m-%Y")
            except: 
                return 0 


    def isvalidyear(self, date):
        current_year = datetime.today().year
        years = [str(i) for i in range(current_year-100, current_year)]
        for year in years:
            if year in str(date):
                return True 
        return False

    def get_ner_in_line(self, line, entity_type):
        if entity_type == "DATE": ner = self.ner_dates
        else: ner = self.ner
        return [i['word'] for i in ner(line) if i['entity_group'] == entity_type]
        

    def get_job_company(self, idx, idx1, resume_segment):
        job_title = resume_segment[idx]
        print("job_title: ", job_title)
        if not idx1 <= len(resume_segment)-1: context = ""
        else:context = resume_segment[idx1]
        candidate_companies = self.get_ner_in_line(job_title, "ORG") + self.get_ner_in_line(context, "ORG")
        print("candidate companies: ", candidate_companies)
        classes = ["organization", "company", "institution", "not organization", "not company", "not institution"]
        scores = []
        for comp in candidate_companies:
            res = self.zero_shot_classifier(comp, classes)['scores']
            print("res: ", res)
            scores.append(max(res[:3]))
        sorted_cmps = sorted(zip(candidate_companies, scores), key=lambda x: x[1], reverse=True)
        if len(sorted_cmps): return sorted_cmps[0][0]
        return context