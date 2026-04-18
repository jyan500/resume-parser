from typing import List
from pydantic import BaseModel
from utils.schemas.tailor_resume_schema import RecommendationBullet


class RevisionSchema(BaseModel):
    revised_bullets: List[RecommendationBullet]
