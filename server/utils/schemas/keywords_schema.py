from typing import List
from enum import Enum
from pydantic import BaseModel
from .tailor_resume_schema import Keyword
 
class KeywordListSchema(BaseModel):
    keywords: List[Keyword]
