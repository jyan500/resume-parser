from typing import List, Optional
from enum import Enum
from pydantic import BaseModel

class ExperienceBullet(BaseModel):
    id: str
    text: str
    suggested: str

class TailorBulletPointSchema(BaseModel):
    suggested: ExperienceBullet 
