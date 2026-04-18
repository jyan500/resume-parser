from typing import List
from enum import Enum
from pydantic import BaseModel


class RuleVerdict(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"


class BulletEvaluation(BaseModel):
    id: str
    rule_1_what_how_impact: RuleVerdict
    rule_2_one_sentence_max_3_lines: RuleVerdict
    rule_3_no_fabricated_metrics: RuleVerdict
    rule_4_no_fabricated_experience: RuleVerdict
    rule_5_no_ai_sounding_language: RuleVerdict
    failed_rules_summary: str  # empty string if all pass


class EvaluationSchema(BaseModel):
    evaluations: List[BulletEvaluation]
