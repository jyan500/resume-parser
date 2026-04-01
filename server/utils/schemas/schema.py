from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field

class WorkType(str, Enum):
    ONSITE = "Onsite"
    HYBRID = "Hybrid"
    REMOTE = "Remote"
    UNKNOWN = ""

class Education(BaseModel):
    school_name: Optional[str] = ""
    major: Optional[str] = ""
    degree: Optional[str] = ""
    graduation_date: Optional[str] = ""

class Certification(BaseModel):
    name: Optional[str] = ""
    organization: Optional[str] = ""
    date: Optional[str] = ""

class Experience(BaseModel):
    company: Optional[str] = ""
    location: Optional[str] = ""
    work_type: Optional[WorkType] = WorkType.UNKNOWN
    job_title: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    bullets: List[str]

class Project(BaseModel):
    title: Optional[str] = ""
    bullets: List[str]

class Skill(BaseModel):
    category: Optional[str] = ""
    skills: List[str]

class Header(BaseModel):
    first_name: str
    last_name: str
    location: Optional[str] = ""
    phone_number: Optional[str] = ""
    email: str
    urls: Optional[List[str]] = Field(default_factory=list)

class ResumeSchema(BaseModel):
    header: Header
    summary: Optional[str] = ""
    education: List[Education]
    certifications: List[Certification]
    experience: List[Experience]
    skills: Optional[List[Skill]] = Field(default_factory=list)
    projects: Optional[List[Project]] = Field(default_factory=list)
    languages: Optional[List[str]] = Field(default_factory=list)
    interests: Optional[List[str]] = Field(default_factory=list)

class ExperienceBullet(BaseModel):
    id: str
    text: str

class TailorResumeSchema(BaseModel):
    recommendations: List[ExperienceBullet]
    missing_keywords: List[str]

