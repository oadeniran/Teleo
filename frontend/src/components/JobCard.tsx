"use client";
import React from 'react';
import Link from 'next/link';

// Define what a "Job" looks like (matching your Python DB model)
interface JobProps {
  chain_job_id: string;
  title: string;
  description: string;
  amount_mnee: number;
  status: string;
  client_address: string;
  tags: string[];
  client_name: string;
}

export default function JobCard({ job }: { job: JobProps }) {
  // Color coding for status
  const statusColors: Record<string, string> = {
    OPEN: "#00D084",      // Green
    REVIEWING: "#FFC107", // Amber
    PAID: "#2196F3",      // Blue
    REFUNDED: "#F44336"   // Red
  };

  return (
    <Link href={`/job/${job.chain_job_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
       <div className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>{job.title}</h3>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                padding: '2px 8px', 
                borderRadius: '4px',
                backgroundColor: statusColors[job.status] || '#eee',
                color: '#fff' 
              }}>
                {job.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
             {job.tags && job.tags.map(tag => (
               <span key={tag} style={{ fontSize: '11px', background: '#f0fdf9', color: '#065f46', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ccfbf1' }}>
                 {tag}
               </span>
             ))}
           </div>

           <div style={{ fontSize: '12px', color: '#999' }}>
             Posted by: <b>{job.client_name}</b>
           </div>

            <p style={{ color: '#666', fontSize: '14px', maxWidth: '500px' }}>
              {job.description.substring(0, 120)}...
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
              Posted by: {job.client_address.substring(0, 6)}...{job.client_address.substring(38)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--teleo-green)' }}>
              ${job.amount_mnee}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>MNEE</div>
            
            {/* Placeholder Button - We will wire this up later */}
            <button className="btn btn-outline" style={{ marginTop: '10px', padding: '8px 16px', fontSize: '14px' }}>
              View Details
            </button>
          </div>
        </div>
    </Link>
  );
}