from typing import List, Optional
from enum import Enum
from pydantic import BaseModel

class SkillType(str, Enum):
    TECHNICAL = "Technical"
    SOFT_SKILL = "Soft Skill"

# class Recommendation(BaseModel):
#     id: str
#     text: str
#     suggestion: str
#     reasoning: str

class RecommendationBullet(BaseModel):
    id: str
    text: str
    recommendation: str

class Keyword(BaseModel):
    type: SkillType 
    text: str

class TailorResumeSchema(BaseModel):
    recommendations: List[str]
    missing_keywords: List[Keyword]
    suggested_bullets: List[RecommendationBullet]
