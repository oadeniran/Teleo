"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useTeleo } from '../../context/TeleoContext';
import { API_URL } from '../../lib/config';
import styles from './myjobs.module.css'; // Import the module

export default function MyJobs() {
  const { currentUser, network, users } = useTeleo();
  const [jobs, setJobs] = useState<any[]>([]);
  const [tab, setTab] = useState<'CREATED' | 'ASSIGNED' | 'COMPLETED'>('CREATED');
  const [loading, setLoading] = useState(false);

  const fetchJobs = () => {
    if (!currentUser) return;
    setLoading(true);
    axios.get(`${API_URL}/jobs?chainId=${network.id}`)
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [currentUser, network.id]);

  const handleAssign = async (jobId: string, name: string) => {
    if(!confirm(`Assign this job to ${name}?`)) return;
    try {
        await axios.post(`${API_URL}/assign`, { 
            jobId: jobId, 
            freelancerName: name 
        }, { headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
        alert("Assigned Successfully!");
        fetchJobs();
    } catch(e) { alert("Error assigning user"); }
  };

  const myCreated = jobs.filter(j => j.client_name === currentUser?.name && j.status !== 'PAID');
  const myAssigned = jobs.filter(j => j.freelancer_name === currentUser?.name && j.status !== 'PAID');
  const myCompleted = jobs.filter(j => (j.client_name === currentUser?.name || j.freelancer_name === currentUser?.name) && j.status === 'PAID');

  const displayedJobs = 
    tab === 'CREATED' ? myCreated : 
    tab === 'ASSIGNED' ? myAssigned : myCompleted;

  return (
    <main>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>My Workspace</h1>

        {/* --- TABS --- */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabButton} ${tab === 'CREATED' ? styles.active : ''}`}
            onClick={() => setTab('CREATED')}
          >
            Created ({myCreated.length})
          </button>
          <button 
            className={`${styles.tabButton} ${tab === 'ASSIGNED' ? styles.active : ''}`}
            onClick={() => setTab('ASSIGNED')}
          >
            Assigned to Me ({myAssigned.length})
          </button>
          <button 
            className={`${styles.tabButton} ${tab === 'COMPLETED' ? styles.active : ''}`}
            onClick={() => setTab('COMPLETED')}
          >
            History ({myCompleted.length})
          </button>
        </div>

        {/* --- JOB LIST --- */}
        <div className={styles.listContainer}>
            {loading && <div className={styles.emptyState}>Syncing...</div>}

            {!loading && displayedJobs.length === 0 && (
              <div className={styles.emptyState}>
                No jobs found in this section.
              </div>
            )}
            
            {!loading && displayedJobs.map(job => (
              <div key={job.chain_job_id} className={styles.jobCard}>
                
                {/* Left: Info */}
                <div>
                   <div className={styles.jobHeader}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <span className="status-badge">{job.status}</span>
                   </div>
                   <p className={styles.jobMeta}>
                     Budget: <strong>${job.amount_mnee} MNEE</strong> • Client: {job.client_name}
                   </p>

                   {/* APPLICANT SECTION (Only for Created + Open Jobs) */}
                   {tab === 'CREATED' && job.status === 'OPEN' && (
                       <div className={styles.applicantsBox}>
                           <div className={styles.applicantsTitle}>
                               APPLICANTS ({job.applicants?.length || 0})
                           </div>
                           
                           {(!job.applicants || job.applicants.length === 0) ? (
                               <div className={styles.noApplicants}>
                                   <span className={styles.noApplicantsText}>No applicants yet.</span>
                                   <select 
                                     className={styles.assignSelect}
                                     onChange={(e) => handleAssign(job.chain_job_id, e.target.value)}
                                     value=""
                                   >
                                       <option value="" disabled>Manual Assign...</option>
                                       {users.filter(u => u.name !== currentUser?.name).map(u => (
                                           <option key={u.id} value={u.name}>{u.name}</option>
                                       ))}
                                   </select>
                               </div>
                           ) : (
                               <div className={styles.applicantsGrid}>
                                   {job.applicants.map((name: string) => (
                                       <div key={name} className={styles.applicantTag}>
                                           <span>👤 {name}</span>
                                           <button 
                                              className={styles.hireBtn}
                                              onClick={() => handleAssign(job.chain_job_id, name)}
                                           >
                                              HIRE
                                           </button>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}
                </div>

                {/* Right: Actions */}
                <div className={styles.actionArea}>
                    <Link href={`/job/${job.chain_job_id}`}>
                        <button className={`btn btn-outline ${styles.viewBtn}`}>
                            {tab === 'ASSIGNED' ? 'Submit Work' : 'View Details'}
                        </button>
                    </Link>
                </div>

              </div>
            ))}
        </div>
      </div>
    </main>
  );
}