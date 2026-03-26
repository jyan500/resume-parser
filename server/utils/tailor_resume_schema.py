from typing import List, Optional
from enum import Enum
from pydantic import BaseModel

class TailorResumeSchema(BaseModel):
    recommendations: List[str]
    missing_keywords: List[str]
