"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import Terminal from '../../../components/Terminal';
import { useTeleo } from '../../../context/TeleoContext'; // Need User Context
import { API_URL } from '../../../lib/config';
import styles from './job.module.css';

declare global { interface Window { ethereum?: any; } }

export default function JobDetail() {
  const params = useParams();
  const jobId = params?.id;
  const { currentUser } = useTeleo(); // Get current user

  const [job, setJob] = useState<any>(null);
  
  // Submission State
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isJudging, setIsJudging] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([])

  // Load Job
  const fetchJob = () => {
    if (!jobId) return;
    axios.get(`${API_URL}/jobs`).then(res => {
      const found = res.data.find((j: any) => j.chain_job_id == jobId);
      if (found) setJob(found);
    }).catch(err => console.error(err));
  };

  // Fetch history
  const fetchHistory = () => {
    if(!jobId) return;
    axios.get(`${API_URL}/submissions/${jobId}`).then(res => setHistory(res.data));
  };

  useEffect(() => {
    fetchJob();
    fetchHistory();
  }, [jobId]);

  // --- LOGIC HELPERS ---
  const isOwner = currentUser?.name === job?.client_name;
  const isAssignedToMe = job?.freelancer_name === currentUser?.name;
  const isPaid = job?.status === 'PAID';
  const hasApplied = job?.applicants?.includes(currentUser?.name);
  const canSubmit = isAssignedToMe && !isPaid;

  // --- HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so you can select the same file again if needed
    e.target.value = '';
  };

  // 2. REMOVE FILE
  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleApply = async () => {
    if (!currentUser) return alert("Please connect wallet/select user");
    try {
        await axios.post(`${API_URL}/apply`, { 
            jobId: job.chain_job_id, 
            applicantName: currentUser.name 
        }, { headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
        alert("Application Sent!");
        fetchJob(); // Refresh to update UI state
    } catch(e) { alert("Error applying"); }
  };

  const submitWork = async () => {
    if (!notes && files.length === 0) return alert("Please upload files or write notes.");
    setIsJudging(true); setLogs([]); setVerdict(null);

    addLog(`Initiating Teleo Secure Protocol...`, "#fff");
    await sleep(500);
    
    try {
      const formData = new FormData();
      formData.append('jobId', String(jobId));
      formData.append('notes', notes);
      files.forEach(f => formData.append('files', f));

      addLog(`> Uploading ${files.length} files to Judge Node...`, "#888");
      
      const res = await axios.post(`${API_URL}/submit-work`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.verdict === 'PASS') {
        addLog("✅ VERDICT: PASS", "#00D084");
        addLog(`TX Hash: ${res.data.tx_hash || '0x...'}`, "#2196F3");
        setVerdict('PASS');
        setJob((prev: any) => ({ ...prev, status: 'PAID' }));
      } else {
        addLog("❌ VERDICT: FAIL", "#ff4444");
        addLog(`Reason: ${res.data.reason}`, "#ff4444");
        setVerdict('FAIL');
      }
    } catch (err) {
      addLog("System Error: Could not reach Judge.", "red");
    } finally { setIsJudging(false); }
  };

  const addLog = (text: string, color: string) => setLogs(prev => [...prev, { text, color }]);
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  if (!job) return <div style={{padding: 50, textAlign: 'center'}}>Loading Job...</div>;

  return (
    <main>
       <Navbar />

      <div className={styles.container}>
        {/* LEFT: Job Info */}
        <div>
          <div className={styles.badge}>{job.status}</div>
          <h1 className={styles.title}>{job.title}</h1>
          
          <div className={styles.budgetCard}>
            <div className={styles.budgetLabel}>Job Budget</div>
            <div className={styles.budgetAmount}>
              ${job.amount_mnee} <span style={{fontSize: '16px', color: '#666'}}>MNEE</span>
            </div>
            <div className={styles.budgetSubtext}>
               Owner: {job.client_name}
            </div>
          </div>

          <div className={`card ${styles.descriptionCard}`}>
            <h3 style={{ marginBottom: '10px' }}>Deliverables & Criteria</h3>
            <p className={styles.descriptionText}>{job.description}</p>
          </div>
        </div>

        {/* RIGHT: Action Area */}
        <div>
          
          {/* SCENARIO 1: I am the Assigned Freelancer (Show Submission) */}
          {canSubmit || isPaid ? (
             <div className={styles.uploadCard}>
                <h2 style={{ marginBottom: '20px' }}>Submit Deliverables</h2>
                {/* File Box */}
                <div className={styles.uploadBox}>
                  <span style={{ fontSize: '24px' }}>📂</span>
                  <p style={{ margin: '10px 0', fontWeight: '500' }}>Add Files</p>
                  <input type="file" multiple className={styles.fileInput} onChange={handleFileUpload} disabled={isPaid} />
                </div>
                {/* File List */}
                {files.length > 0 && (
                  <div className={styles.fileList}>
                    {files.map((f, i) => (
                      <div key={i} className={styles.fileItem}>
                         <div className={styles.fileName}>{f.name}</div>
                         {!isPaid && <button onClick={() => removeFile(i)} className={styles.removeBtn}>×</button>}
                      </div>
                    ))}
                  </div>
                )}
                {/* Notes */}
                <div className={styles.notesSection}>
                  <label className={styles.notesLabel}>NOTES</label>
                  <textarea 
                    className={styles.notesInput} 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    disabled={isPaid || isJudging || verdict === 'PASS'} 
                    placeholder="Describe your work..."
                  />
                </div>
                <button 
                  className={styles.submitBtn} 
                  onClick={submitWork}
                  disabled={isPaid || isJudging || verdict === 'PASS'}
                >
                  {isPaid || verdict === 'PASS' ? '✅ Work Accepted & Paid' : isJudging ? 'Verifying...' : 'Submit Work'}
                </button>
                <Terminal logs={logs} visible={logs.length > 0} />
             </div>
          ) : (
             /* SCENARIO 2: I am a Visitor / Applicant */
             <div className={styles.applyCard}>
                {isOwner ? (
                   <div>
                     <div className={styles.applyTitle}>Manage Your Job</div>
                     <p className={styles.applyText}>
                       You are the owner. Go to "My Jobs" to hire applicants or manage this listing.
                     </p>
                     {/* Could add link to My Jobs here */}
                   </div>
                ) : hasApplied ? (
                   <div className={styles.appliedBadge}>
                      <span>✓</span> Application Sent
                   </div>
                ) : job.status !== 'OPEN' ? (
                   <div style={{color:'#888'}}>This job is assigned to another freelancer.</div>
                ) : (
                   <>
                     <div className={styles.applyTitle}>Interested in this role?</div>
                     <p className={styles.applyText}>
                       Apply now to be considered. The budget is held in escrow and guaranteed upon successful delivery.
                     </p>
                     <button className={styles.applyBtn} onClick={handleApply}>
                       ⚡ Apply Now
                     </button>
                   </>
                )}
             </div>
          )}

        </div>

        {/* SUBMISSION HISTORY */}
        {(isOwner || isAssignedToMe) && (
        <div style={{ gridColumn: '1 / -1' }} className={styles.historySection}>
            <h3 className={styles.historyTitle}>Submission History</h3>
            
            {history.length === 0 ? (
                <div style={{color:'#888', fontStyle:'italic'}}>No submissions yet.</div>
            ) : (
                history.map((sub, idx) => (
                    <div key={idx} className={`${styles.historyCard} ${sub.verdict === 'PASS' ? styles.pass : styles.fail}`}>
                        <div className={styles.historyHeader}>
                            <span style={{color: sub.verdict==='PASS'?'#065f46':'#b91c1c'}}>
                                {sub.verdict === 'PASS' ? '✅ ACCEPTED & PAID' : '❌ REJECTED'}
                            </span>
                            <span style={{color:'#888'}}>
                                {new Date(sub.created_at).toLocaleString()}
                            </span>
                        </div>
                        
                        <div style={{fontSize:'13px', color:'#666', marginBottom:'6px'}}>
                            <strong>Delivered:</strong> {sub.notes} {sub.files?.length > 0 && `(+ ${sub.files.length} files)`}
                        </div>

                        <div className={styles.historyReason}>
                            <strong>AI Feedback:</strong> {sub.reason}
                        </div>
                    </div>
                ))
            )}
        </div>
      )}
      </div>
    </main>
  );
}