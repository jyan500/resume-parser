from nt import environ
import re
import traceback
import json
import os
from difflib import SequenceMatcher
from jinja2 import Template
from google import genai
from openai import OpenAI
from utils.schemas.tailor_resume_schema import TailorJobSchema
from utils.schemas.evaluation_schema import EvaluationSchema, RuleVerdict
from utils.schemas.revision_schema import RevisionSchema
from utils.schemas.keywords_schema import KeywordListSchema
from utils.functions import load_prompt
from utils.client import LLMClient
from pydantic import BaseModel


MAX_REVISION_ROUNDS = 1
# Suggested bullets whose new_text is more than 90% similar to the original
# text are dropped — the change is too minor to be a useful suggestion.
MIN_CHANGE_THRESHOLD = 0.90

RULE_FIELDS = [
    "rule_1_what_how_impact",
    "rule_2_one_sentence_max_3_lines",
    "rule_3_no_fabricated_metrics",
    "rule_4_no_fabricated_experience",
    "rule_5_no_ai_sounding_language",
]


def _all_rules_pass(evaluation) -> bool:
    return all(
        getattr(evaluation, field) == RuleVerdict.PASS
        for field in RULE_FIELDS
    )


def _is_trivial_change(original: str, new_text: str) -> bool:
    """Returns True if the rewrite is too similar to the original to be useful."""
    ratio = SequenceMatcher(None, original.strip(), new_text.strip()).ratio()
    return ratio >= MIN_CHANGE_THRESHOLD


class TailorResume:
    def __init__(self):
        ## render using jinja2 to escape curly braces
        self.client = LLMClient("gemini")
        self.template = Template(load_prompt("tailor-resume-job-v3"))
        self.evaluate_template = Template(load_prompt("evaluate-bullets"))
        self.revise_template = Template(load_prompt("revise-bullets"))

    def _generate(self, prompt: str) -> dict:
        schema_response = self.client.generate_response(prompt, "TailorJobSchema", TailorJobSchema)
        return schema_response.model_dump()

    def _evaluate_bullets(self, bullets: list[dict], job_context: str):
        bullets_json = json.dumps([
            {"id": b["id"], "text": b["text"], "new_text": b["new_text"]}
            for b in bullets
        ])
        prompt = self.evaluate_template.render(
            job_context=job_context,
            bullets_json=bullets_json
        )
        result = self.client.generate_response(prompt, "EvaluationSchema", EvaluationSchema)
        return result.evaluations

    def _revise_bullets(self, failed_bullets: list[dict], job_context: str) -> list[dict]:
        prompt = self.revise_template.render(
            job_context=job_context,
            bullets_with_failures_json=json.dumps(failed_bullets)
        )
        result = self.client.generate_response(prompt, "RevisionSchema", RevisionSchema)
        return [b.model_dump() for b in result.revised_bullets]

    def _run_evaluation_loop(self, result: dict, job_context: str) -> dict:
        """Evaluates suggested bullets against the rubric and revises failures."""
        suggested = result["suggested_bullets"]

        if not suggested:
            return result

        for round_num in range(MAX_REVISION_ROUNDS + 1):
            try:
                evaluations = self._evaluate_bullets(suggested, job_context)
            except Exception:
                traceback.print_exc()
                # Evaluation failed — return what we have
                return result

            eval_map = {e.id: e for e in evaluations}

            failed = []
            for bullet in suggested:
                ev = eval_map.get(bullet["id"])
                if ev is not None and not _all_rules_pass(ev):
                    failed.append({
                        **bullet,
                        "failed_rules_summary": ev.failed_rules_summary
                    })

            if not failed:
                break

            if round_num < MAX_REVISION_ROUNDS:
                try:
                    revised = self._revise_bullets(failed, job_context)
                    revised_map = {b["id"]: b for b in revised}
                    suggested = [
                        revised_map.get(b["id"], b) for b in suggested
                    ]
                except Exception:
                    traceback.print_exc()
                    # Revision failed — return what we have
                    break

        # Drop bullets where the rewrite is nearly identical to the original
        suggested = [
            b for b in suggested
            if not _is_trivial_change(b["text"], b["new_text"])
        ]
        result["suggested_bullets"] = suggested
        return result

    def tailor_resume(self, resume_json_string, job_title, job_description):
        try:
            prompt = self.template.render(resume=resume_json_string, job_title=job_title, job_description=job_description)
            result = self._generate(prompt)
            # The evaluate/revise prompts only need enough context to understand the role
            # (e.g. job title, company, whether it's sales/leadership). Passing the full
            # description (up to 15k chars) would add unnecessary tokens to each call.
            # TODO: ideally, the LLM would remember the context instead of having to pass it in again
            job_context = job_description[:500]
            return self._run_evaluation_loop(result, job_context)
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong while tailoring resume")
