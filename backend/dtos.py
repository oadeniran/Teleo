from dataclasses import Field
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from pydantic import ConfigDict

class Submission(BaseModel):
    jobId: str
    code: str
    language: str

class JobModel(BaseModel):
    chain_job_id: str
    title: str
    description: str
    amount_mnee: float
    client_address: str
    client_name: str     
    tags: Optional[List[str]] = []   
    freelancer_address: Optional[str] = None
    status: Optional[str] = "OPEN"
    created_at: Optional[str] = None
    applicants: Optional[List[str]] = []
    freelancer_name: Optional[str] = None
    chain_id: Optional[int] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class SubmissionModel(BaseModel):
    chain_job_id: str
    freelancer_name: str
    notes: str
    files: List[str]
    verdict: str
    reason: str
    tx_hash: Optional[str] = None
    created_at: str