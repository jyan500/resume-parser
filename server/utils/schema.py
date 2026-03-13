from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field

class WorkType(str, Enum):
    ONSITE = "Onsite"
    HYBRID = "Hybrid"
    REMOTE = "Remote"
    UNKNOWN = ""

class Education(BaseModel):
    school_name: str
    major: str
    degree: str
    graduation_date: str

class Certification(BaseModel):
    name: str
    organization: str
    date: str

class Experience(BaseModel):
    company: str
    location: str
    work_type: WorkType
    job_title: str
    start_date: str
    end_date: str
    bullets: List[str]

class Project(BaseModel):
    title: str
    bullets: List[str]

class ResumeSchema(BaseModel):
    first_name: str
    last_name: str
    location: str
    phone_number: str
    summary: str
    email: str
    urls: List[str]
    education: List[Education]
    certifications: List[Certification]
    experience: List[Experience]
    skills: List[str]
    projects: List[Project]
    languages: List[str]    
    interests: List[str]
