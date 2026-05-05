import pytest
from unittest.mock import MagicMock

from utils.tailor import _is_trivial_change, _all_rules_pass, TailorResume
from utils.schemas.evaluation_schema import BulletEvaluation, RuleVerdict
from utils.leniency import LENIENCY_LEVELS, LENIENCY_LEVEL_NAMES


def make_eval(bullet_id, passing=True):
    verdict = RuleVerdict.PASS if passing else RuleVerdict.FAIL
    return BulletEvaluation(
        id=bullet_id,
        rule_1_what_how_impact=verdict,
        rule_2_one_sentence_max_3_lines=RuleVerdict.PASS,
        rule_3_no_fabricated_metrics=RuleVerdict.PASS,
        rule_4_no_fabricated_experience=RuleVerdict.PASS,
        rule_5_no_ai_sounding_language=RuleVerdict.PASS,
        rule_6_no_removed_keywords=RuleVerdict.PASS,
        failed_rules_summary="" if passing else "rule_1 failed",
    )


STRICT = LENIENCY_LEVELS[LENIENCY_LEVEL_NAMES["strict"]]


class TestIsTrivialChange:
    def test_identical_strings_are_trivial(self):
        assert _is_trivial_change("Built REST APIs.", "Built REST APIs.") is True

    def test_high_similarity_is_trivial(self):
        # One word difference in a long sentence — similarity > 90%
        original = "Led development of microservices using Node.js and PostgreSQL reducing latency by thirty percent."
        similar = "Led development of microservices using Node.js and PostgreSQL reducing latency by 30 percent."
        assert _is_trivial_change(original, similar) is True

    def test_different_content_is_not_trivial(self):
        original = "Built REST APIs."
        rewritten = (
            "Engineered high-throughput REST APIs using Node.js serving 50k daily requests "
            "and reducing average response time from 200ms to 45ms through query optimization."
        )
        assert _is_trivial_change(original, rewritten) is False

    def test_leading_trailing_whitespace_ignored(self):
        assert _is_trivial_change("  hello  ", "hello") is True

    def test_empty_both_sides_is_trivial(self):
        assert _is_trivial_change("", "") is True

    def test_one_empty_is_not_trivial(self):
        assert _is_trivial_change("Built APIs.", "") is False

class TestRunEvaluationLoop:
    def test_empty_suggested_bullets_skips_evaluation(self, tailor):
        tailor._evaluate_bullets = MagicMock()
        result = {"suggested_bullets": []}
        output = tailor._run_evaluation_loop(result, "context", STRICT)
        tailor._evaluate_bullets.assert_not_called()
        assert output == result

    def test_all_pass_does_not_call_revise(self, tailor):
        bullet = {"id": "b1", "text": "Built APIs.", "new_text": "Designed scalable REST APIs."}
        result = {"suggested_bullets": [bullet]}

        tailor._evaluate_bullets = MagicMock(return_value=[make_eval("b1", passing=True)])
        tailor._revise_bullets = MagicMock()

        output = tailor._run_evaluation_loop(result, "context", STRICT)

        tailor._evaluate_bullets.assert_called_once()
        tailor._revise_bullets.assert_not_called()
        assert len(output["suggested_bullets"]) == 1

    def test_failing_bullet_triggers_revision(self, tailor):
        bullet = {"id": "b1", "text": "Built APIs.", "new_text": "Built better APIs."}
        result = {"suggested_bullets": [bullet]}

        revised_bullet = {
            "id": "b1",
            "text": "Built APIs.",
            "new_text": "Designed and implemented RESTful APIs using Python, reducing response time by 40%.",
        }

        tailor._evaluate_bullets = MagicMock(
            side_effect=[
                [make_eval("b1", passing=False)],
                [make_eval("b1", passing=True)],
            ]
        )
        tailor._revise_bullets = MagicMock(return_value=[revised_bullet])

        output = tailor._run_evaluation_loop(result, "context", STRICT)

        tailor._revise_bullets.assert_called_once()
        assert output["suggested_bullets"][0]["new_text"] == revised_bullet["new_text"]

    def test_trivial_change_filtered_after_loop(self, tailor):
        # new_text identical to text → trivial, should be removed
        bullet = {"id": "b1", "text": "Built APIs.", "new_text": "Built APIs."}
        result = {"suggested_bullets": [bullet]}

        tailor._evaluate_bullets = MagicMock(return_value=[make_eval("b1", passing=True)])
        tailor._revise_bullets = MagicMock()

        output = tailor._run_evaluation_loop(result, "context", STRICT)

        assert len(output["suggested_bullets"]) == 0

    def test_evaluate_exception_returns_result_unchanged(self, tailor):
        bullet = {"id": "b1", "text": "Built APIs.", "new_text": "Designed REST APIs."}
        result = {"suggested_bullets": [bullet]}

        tailor._evaluate_bullets = MagicMock(side_effect=Exception("LLM error"))
        tailor._revise_bullets = MagicMock()

        output = tailor._run_evaluation_loop(result, "context", STRICT)

        assert output is result
        tailor._revise_bullets.assert_not_called()

    def test_revise_exception_breaks_gracefully(self, tailor):
        bullet = {"id": "b1", "text": "Built APIs.", "new_text": "Built better APIs."}
        result = {"suggested_bullets": [bullet]}

        tailor._evaluate_bullets = MagicMock(return_value=[make_eval("b1", passing=False)])
        tailor._revise_bullets = MagicMock(side_effect=Exception("LLM error"))

        # Should not raise; returns with trivial filter applied
        output = tailor._run_evaluation_loop(result, "context", STRICT)
        assert "suggested_bullets" in output
