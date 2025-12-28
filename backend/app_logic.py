
from app.judge import TeleoJudge
from app.chain import release_payment, get_job_details
from dtos import Submission, JobModel
from app.database import get_database
from starlette.concurrency import run_in_threadpool
import datetime

judge = TeleoJudge()

async def submit_work(
    jobId, notes: str, files
):
    db = get_database()
    print(f"📡 Received submission for Job #{jobId}")
    
    # 1. PROCESS FILES
    file_context = ""
    file_names = []
    
    if files:
        for file in files:
            print(f"📂 Processing file: {file.filename}")
            file_names.append(file.filename)
            
            # Simple Logic: Read text files directly for AI Context
            if file.filename.endswith(('.py', '.js', '.txt', '.md', '.json', '.html', '.css')):
                content = await file.read()
                file_context += f"\n\n--- FILE: {file.filename} ---\n{content.decode('utf-8', errors='ignore')}"
            else:
                file_context += f"\n\n--- ATTACHMENT ---\nFile '{file.filename}' (Binary) received."

    # 2. COMBINE NOTES + FILE CONTEXT
    submission_summary = f"Files Uploaded: {', '.join(file_names)}\n\n"
    full_submission_text = f"FREELANCER NOTES:\n{notes}\n\n{submission_summary}{file_context}"

    # 3. FETCH JOB & VALIDATE
    db_job = await db.jobs.find_one({"chain_job_id": jobId})
    if not db_job:
        return

    job_details = await run_in_threadpool(get_job_details, int(jobId))
    if not job_details:
        return {"status": "FAIL", "reason": "Job not found on chain"}

    # 4. AI REVIEW
    print("⚖️  AI Judge is reviewing...")
    review = await run_in_threadpool(
        judge.evaluate_submission,
        job_desc=job_details['description'],
        code=full_submission_text,
        language="Multi-File Project"
    )
    
    tx_hash = None
    if review['verdict'] == 'PASS':
        try:
            print("💸 Initiating Payout...")
            tx_hash = await run_in_threadpool(release_payment, int(jobId))
            print(f"✅ Payout Sent! Hash: {tx_hash}")
            await db.jobs.update_one(
                {"chain_job_id": jobId},
                {"$set": {"status": "PAID", "tx_hash": tx_hash}}
            )
        except Exception as e:
            print(f"❌ Blockchain Error: {e}")
            return {
                "status": "FAIL", 
                "verdict": "PASS", 
                "reason": f"Payout failed: {str(e)}", 
                "tx_hash": None
            }
        
    # 5. STORE SUBMISSION
    submission_entry = {
        "chain_job_id": jobId,
        "freelancer_name": db_job.get("freelancer_name", "Unknown"),
        "notes": notes,
        "files": file_names, # List of filenames
        "verdict": review['verdict'],
        "reason": review['reason'],
        "tx_hash": tx_hash,
        "created_at": datetime.datetime.now()
    }
    await db.submissions.insert_one(submission_entry)

    return {
        "status": "OK",
        "verdict": review['verdict'],
        "reason": review['reason'],
        "tx_hash": tx_hash
    }


async def index_job(job: JobModel):
    db = get_database()
    
    # Convert Pydantic model to dict
    job_dict = job.model_dump()
    job_dict["created_at"] = datetime.datetime.now()
    
    # Check if exists (Idempotency)
    existing = await db.jobs.find_one({"chain_job_id": job.chain_job_id})
    if existing:
        return {"message": "Job already indexed", "id": str(existing["_id"])}

    # Async Insert
    new_job = await db.jobs.insert_one(job_dict)
    return {"id": str(new_job.inserted_id), "status": "Indexed"}

async def list_jobs(chain_id: int = None):
    print(chain_id)
    db = get_database()
    query = {}
    if chain_id:
        query["chain_id"] = chain_id
    print(query)
    cursor = db.jobs.find(query).sort("chain_job_id", -1).limit(50)
    jobs = await cursor.to_list(length=50)
    for job in jobs:
        job["_id"] = str(job["_id"])
        
    return jobs

async def assign_freelancer(
    jobId, freelancerName
):
    db = get_database()
    # Update status to ASSIGNED and set the name
    await db.jobs.update_one(
        {"chain_job_id": jobId},
        {"$set": {
            "status": "ASSIGNED", 
            "freelancer_name": freelancerName
            # We don't change blockchain address because it's already YOU
        }}
    )
    return {"status": "Assigned"}


async def apply_to_job(jobId, applicantName):
    db = get_database()
    # Add user to applicants list if not already there
    await db.jobs.update_one(
        {"chain_job_id": jobId},
        {"$addToSet": {"applicants": applicantName}}
    )
    return {"status": "Applied"}

async def get_submissions(jobId: str):
    db = get_database()
    cursor = db.submissions.find({"chain_job_id": jobId}).sort("created_at", -1)
    return await cursor.to_list(length=100)