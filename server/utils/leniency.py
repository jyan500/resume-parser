from dataclasses import dataclass


@dataclass(frozen=True)
class LeniencyLevel:
    keyword_instruction: str
    rule_4_eval: str
    rule_4_revise: str


LENIENCY_LEVEL_NAMES: dict[str, int] = {
    "strict": 0,
    "variants": 1,
    "full": 2,
}

LENIENCY_LEVELS: dict[int, LeniencyLevel] = {
    0: LeniencyLevel(
        keyword_instruction=(
            "Do NOT add any keyword, technology, or experience not already present "
            "in the original bullet."
        ),
        rule_4_eval=(
            "RULE 4 — No fabricated experience\n"
            "  The rewritten bullet must NOT introduce skills, technologies, tools, or experiences\n"
            "  that were not present in the original bullet text. Compare the rewritten bullet\n"
            "  against the original text provided — if the rewrite mentions a keyword or experience\n"
            "  that does not appear anywhere in the original, it is FAIL.\n"
            "  - Rephrasing or restructuring existing content = PASS\n"
            "  - Adding a technology/tool/skill not in the original = FAIL"
        ),
        rule_4_revise=(
            "RULE 4 — No fabricated experience: Do NOT introduce skills, technologies, tools, or\n"
            "  experiences that were not present in the original bullet text. Only rephrase or\n"
            "  restructure what already exists."
        ),
    ),
    1: LeniencyLevel(
        keyword_instruction=(
            "You MAY substitute or append a more specific version or formal alias of a technology "
            "already present in the original bullet when the job description calls for it "
            "(e.g. 'HTML' -> 'HTML5', 'JavaScript' -> 'ES6', 'React' -> 'React.js', "
            "'Postgres' -> 'PostgreSQL'). Do NOT introduce any technology unrelated to "
            "what is already in the original."
        ),
        rule_4_eval=(
            "RULE 4 — No fabricated experience\n"
            "  The rewritten bullet must NOT introduce skills, technologies, tools, or experiences\n"
            "  that were not present in the original bullet text, EXCEPT when the new keyword is a\n"
            "  specific version, formal name, or close variant of a technology already in the\n"
            "  original (e.g. HTML -> HTML5, JavaScript -> ES6, React -> React.js).\n"
            "  - Rephrasing or restructuring existing content = PASS\n"
            "  - Version upgrade / formal alias of an existing technology = PASS\n"
            "  - Adding an entirely unrelated new technology/tool/skill = FAIL"
        ),
        rule_4_revise=(
            "RULE 4 — No fabricated experience: Do NOT introduce skills, technologies, tools, or\n"
            "  experiences unrelated to what is already in the original bullet. Version upgrades\n"
            "  or formal aliases of existing technologies (e.g. HTML -> HTML5) are allowed."
        ),
    ),
    2: LeniencyLevel(
        keyword_instruction=(
            "You MAY add keywords and qualifications from the job description if they are a "
            "plausible, natural extension of the work already described in the bullet. A keyword "
            "is plausible if a professional doing exactly the work in the original bullet would "
            "reasonably also work with that keyword in practice (e.g. a bullet about SQL queries "
            "may include 'data modeling' or 'schema migrations'; a bullet about Docker may include "
            "'containerization'). Do NOT add competing or alternative technologies that serve the "
            "same role as something already in the bullet (e.g. do not add 'Java' to a bullet that "
            "uses Node.js, or 'Vue.js' to a bullet that uses React)."
        ),
        rule_4_eval=(
            "RULE 4 — No implausible experience\n"
            "  The rewritten bullet may introduce keywords from the job description ONLY if they\n"
            "  are a plausible and natural extension of the work described in the original bullet.\n"
            "  A keyword is plausible if a developer doing the work in the original bullet would\n"
            "  reasonably also work with that keyword (e.g. SQL -> data modeling, Docker ->\n"
            "  containerization, Express -> REST APIs).\n"
            "  A keyword is implausible if it introduces a competing or alternative technology\n"
            "  that fills the same role as one already present in the original bullet.\n"
            "  - Concepts/methodologies that naturally follow from existing tech = PASS\n"
            "  - Keywords that plausibly extend the original work context = PASS\n"
            "  - Competing/alternative technology for a role already filled in the original = FAIL\n"
            "  - Completely unrelated domain or technology = FAIL"
        ),
        rule_4_revise=(
            "RULE 4 — No implausible experience: Only include new keywords from the job description\n"
            "  if they are a plausible, natural extension of the original bullet's context. Remove\n"
            "  any competing or alternative technologies (e.g. Java alongside Node.js, Vue.js\n"
            "  alongside React). Concepts and practices that naturally follow from existing tech\n"
            "  (e.g. data modeling from SQL) are allowed."
        ),
    ),
}

DEFAULT_LENIENCY = "strict"
