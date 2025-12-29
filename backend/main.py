from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form, File, UploadFile
from typing import List
from dtos import JobModel, Optional
from app.constants import GOD_USERS
import app_logic
from app.database import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="Teleo AI Backend",
    description="Backend service for Teleo AI Code Review and Payout System",
    docs_url="/api/docs",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()


@app.get("/")
def read_root():
    return {"status": "Teleo Judge is Online"}

@app.post("/submit-work")
async def submit_work_endpoint(
    jobId: str = Form(...),
    notes: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[])
):
    try:
        result = await app_logic.submit_work(jobId, notes, files)
        if not result:
            raise HTTPException(status_code=404, detail="Job not found on chain")
        elif result.get("status") == "FAIL":
            raise HTTPException(status_code=400, detail=result.get("reason", "Submission failed"))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/jobs")
async def index_job(job: JobModel):
    try:
        result = await app_logic.index_job(job)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs")
async def list_jobs(chainId: int = None):
    try:
        result = await app_logic.list_jobs(chainId)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users")
async def get_users():
    return GOD_USERS

@app.post("/assign")
async def assign_freelancer(
    jobId: str = Form(...),
    freelancerName: str = Form(...)
):
    try:
        await app_logic.assign_freelancer(jobId, freelancerName)
        return {"status": "OK", "message": f"Freelancer {freelancerName} assigned to job {jobId}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/apply")
async def apply_to_job(
    jobId: str = Form(...), 
    applicantName: str = Form(...)
):
    try:
        result = await app_logic.apply_to_job(jobId, applicantName)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/submissions/{jobId}")
async def get_submissions(jobId: str):
    try:
        result = await app_logic.get_submissions(jobId)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))