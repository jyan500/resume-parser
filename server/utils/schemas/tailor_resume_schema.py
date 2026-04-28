from typing import List
from enum import Enum
from pydantic import BaseModel
 
 
class SkillType(str, Enum):
    TECHNICAL = "Technical"
    SOFT_SKILL = "Soft Skill"
 
 
class Keyword(BaseModel):
    type: SkillType
    text: str
 
class RecommendationBullet(BaseModel):
    id: str           # bullet uuid from the resume JSON
    text: str         # the original bullet text
    new_text: str     # rewritten bullet point

class TailorJobSchema(BaseModel):
    # Subset of keywords not found in any experience bullet point
    missing_keywords: List[Keyword]

    # Bullets that need What→How→Result restructuring (no rewrites, just flags)
    suggested_bullets: List[RecommendationBullet]
