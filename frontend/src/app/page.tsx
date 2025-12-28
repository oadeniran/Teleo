"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { API_URL } from '../lib/config';
import { useTeleo } from '../context/TeleoContext';
import styles from './page.module.css';

export default function Home() {
  const { network } = useTeleo();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/jobs?chainId=${network.id}`);
      setJobs(res.data);
      setError('');
    } catch (err) {
      console.error("API Error:", err);
      setError("Could not connect to Teleo Backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [network.id]);

  return (
    <main>
      <Navbar />

      <div className={styles.container}>
        
        {/* HERO SECTION */}
        <div className={styles.hero}>
          <h1 className={styles.title}>
            The First <span className={styles.highlight}>AI-Arbitrated Freelance Marketplace</span>
          </h1>
          <p className={styles.subtitle}>
            Work is verified by AI Agent. Payments are settled in MNEE. Zero ghosting, zero delays.
          </p>
        </div>

        {/* FEED SECTION */}
        <div>
          <div className={styles.feedHeader}>
            <h3 className={styles.feedTitle}>Active Jobs</h3>
            <button className={styles.refreshBtn} onClick={fetchJobs}>
              <span>↻</span> Refresh
            </button>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className={styles.loading}>
              Loading marketplace data...
            </div>
          )}
          
          {/* ERROR STATE */}
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          {/* --- MAINNET EMPTY STATE (The New Disclaimer) --- */}
          {!loading && !error && network.id === 1 && jobs.length === 0 && (
            <div className={styles.mainnetNotice}>
              <h3 className={styles.noticeTitle}>🌐 You are on Ethereum Mainnet</h3>
              <p className={styles.noticeText}>
                 The marketplace is currently empty on Mainnet. <br/>
                 <strong>For the Hackathon Demo:</strong> Please toggle the switch in the navbar back to <strong>SEPOLIA</strong> to access the "God Mode" with 25+ seeded jobs and AI Agents ready to test.
              </p>
            </div>
          )}

          {/* --- GENERIC EMPTY STATE (Sepolia / Other) --- */}
          {!loading && !error && network.id !== 1 && jobs.length === 0 && (
            <div className={`card ${styles.emptyState}`}>
              <div className={styles.emptyIcon}>📭</div>
              <h3 className={styles.emptyTitle}>No active jobs found</h3>
              <p className={styles.emptyText}>The marketplace is currently empty.</p>
              <Link href="/create">
                <button className="btn btn-primary">Post the First Job</button>
              </Link>
            </div>
          )}

          {/* JOB LIST */}
          <div className={styles.jobList}>
            {jobs.map((job) => (
              <JobCard key={job.chain_job_id} job={job} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}