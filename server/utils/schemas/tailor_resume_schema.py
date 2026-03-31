from typing import List
from enum import Enum
from pydantic import BaseModel
 
 
class SkillType(str, Enum):
    TECHNICAL = "Technical"
    SOFT_SKILL = "Soft Skill"
 
 
class Keyword(BaseModel):
    type: SkillType
    text: str
 
 
class HHCritique(BaseModel):
    """A Headless Headhunter-style critique of a specific resume bullet."""
    id: str           # bullet uuid from the resume JSON
    text: str         # the original bullet text being critiqued
    rule_violated: str  # e.g. "Rule 3 — Missing Result/Reason", "Rule 2 — Fewer than 3 keywords"
    critique: str     # plain-English explanation of what is wrong and what needs to change
 
 
class RecommendationBullet(BaseModel):
    id: str           # bullet uuid from the resume JSON
    text: str         # the original bullet text
    recommendation: str  # what structural element is missing or needs fixing
 

class TailorJobDescriptionSchema(BaseModel): 
    missing_keywords: List[Keyword]
    hh_critiques: List[HHCritique]
    recommendations: List[str]
    suggested_bullets: List[RecommendationBullet]

class TailorJobTitleSchema(BaseModel):
    # All keywords that are commonly required for this job title
    common_keywords: List[Keyword]
 
    # Subset of common_keywords not found in any experience bullet point
    missing_keywords: List[Keyword]
 
    # HH-rule violations on specific bullets
    hh_critiques: List[HHCritique]
 
    # High-level actionable advice for positioning the resume toward this job title
    recommendations: List[str]
 
    # Bullets that need What→How→Result restructuring (no rewrites, just flags)
    suggested_bullets: List[RecommendationBullet]