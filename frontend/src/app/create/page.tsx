"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ethers } from 'ethers';
import { API_URL } from '../../lib/config';
import { useTeleo } from '../../context/TeleoContext';
import styles from './create.module.css';
import Navbar from '../../components/Navbar';

export default function CreateJob() {
  const { currentUser, network } = useTeleo();
  const router = useRouter();
  
  // Form State
  const [form, setForm] = useState({ title: '', desc: '', amount: '', tags: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // UI State
  const [status, setStatus] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0); // 0=Idle, 1=Approving, 2=Funding, 3=Syncing

  // 1. Handle Tag KeyPress (Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submission
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  // 2. Remove Tag
  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleCreate = async () => {
    if (!window.ethereum) return alert("Please install MetaMask to fund this job.");
    
    setIsLoading(true);
    try {

      // SETUP ETHERS WITH "ANY" NETWORK
      // Passing "any" as the 2nd argument fixes the "network changed" error
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const currentChainId = (await provider.getNetwork()).chainId;
      if (currentChainId !== BigInt(network.id)) {
        try {
          await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: network.hex }], // Uses hex from config
          });
        } catch (err : any) {
          if (err.code === 4902) {
              alert("Please add Sepolia network to MetaMask!");
              return;
            }
        }
      }


      // 3. DEFINE CONTRACTS
      const mneeContract = new ethers.Contract(network.mneeToken, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], signer);

      const teleoContract = new ethers.Contract(network.escrowContract, [
        // 1. The Function
        "function createJob(address _freelancer, uint256 _amount, string memory _description) external",
        
        // 2. The Event
        "event JobCreated(uint256 indexed jobId, address client, address freelancer, uint256 amount)"
      ], signer);

      const amountWei = ethers.parseEther(form.amount || "10");

      // 4. STEP 1: APPROVE (With Gas Override)
      setStep(1);
      setStatus("Step 1/3: Approving budget transfer...");
      
      const approveTx = await mneeContract.approve(
        network.escrowContract, 
        amountWei,
        { gasLimit: 100000 }
      );
      await approveTx.wait();

      // 5. STEP 2: CREATE JOB (With Gas Override)
      setStep(2);
      setStatus("Step 2/3: Funding escrow smart contract...");
      
      const createTx = await teleoContract.createJob(
        userAddress, 
        amountWei, 
        form.desc,
        { gasLimit: 500000 }
      );
      const receipt = await createTx.wait();

      // 6. STEP 3: SYNC TO BACKEND
      setStep(3);
      setStatus("Step 3/3: Publishing job to marketplace...");

      // GET JOB ID ---
      let realChainJobId = "";

      // 1. Loop through ALL logs (Approval, Transfer, JobCreated...)
      for (const log of receipt.logs) {
        try {
          // 2. Parse the log using the Contract Interface
          // This automatically handles indexed vs non-indexed fields based on ABI
          const parsed = teleoContract.interface.parseLog(log);
          
          // 3. Check if this is the event we want
          if (parsed && parsed.name === "JobCreated") {
             // 4. Extract the ID (ethers returns BigInt, convert to string)
             realChainJobId = parsed.args.jobId.toString();
             break; // Found it, stop looking
          }
        } catch (e) {
          // This log belongs to another contract (like MNEE token), ignore it
          continue;
        }
      }

      // Fallback only if absolutely necessary
      if (!realChainJobId) {
        console.warn("Could not find JobCreated event. Using timestamp fallback.");
        realChainJobId = Date.now().toString();
      }

      await axios.post(`${API_URL}/jobs`, {
        chain_job_id: realChainJobId,
        title: form.title,
        description: form.desc,
        tags: tags,
        amount_mnee: parseFloat(form.amount),
        client_address: userAddress,
        freelancer_address: userAddress,
        chain_id: network.id,
        client_name: currentUser?.name || "Anonymous",
      });

      setStatus("Job Posted Successfully! Redirecting...");
      setTimeout(() => router.push('/'), 1000);

    } catch (err: any) {
      console.error(err);
      // Ignore the "network changed" error if it slips through, as we handled it
      if (err.code === "NETWORK_ERROR" && err.event === "changed") {
         return; 
      }
      setStatus(`Error: ${err.reason || err.message}`);
      setStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <Navbar />

      {/* Main Form */}
      <div className={`container ${styles.formContainer}`}>
        <h1 className={styles.title}>Post a New Job</h1>

        <div className={styles.card}>
          
          {/* Title Input */}
          <div className={styles.group}>
            <label className={styles.label}>Job Title</label>
            <input 
              className={styles.input} 
              placeholder="e.g. Build a Python Web Scraper for Stock Data"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              disabled={isLoading}
            />
          </div>

          {/* Budget Input */}
          <div className={styles.group}>
            <label className={styles.label}>Budget (MNEE)</label>
            <span className={styles.helperText}>
              This amount will be held securely in escrow until the work is verified.
            </span>
            <input 
              className={styles.input} 
              type="number" 
              placeholder="100.00"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              disabled={isLoading}
            />
          </div>

          {/* Description Input */}
          <div className={styles.group}>
            <label className={styles.label}>Deliverables & Acceptance Criteria</label>
            <span className={styles.helperText}>
              Be specific. The Teleo AI Agent uses this to automatically verify the work.
            </span>
            <textarea 
              className={`${styles.input} ${styles.textarea}`} 
              placeholder="Describe the task constraints, expected output format, and any specific logic required..."
              value={form.desc}
              onChange={e => setForm({...form, desc: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Tags (Press Enter to add)</label>
            <div className={styles.tagContainer} onClick={() => document.getElementById('tag-input')?.focus()}>
              {tags.map((tag, index) => (
                <div key={index} className={styles.tagChip}>
                  {tag}
                  <button onClick={() => removeTag(index)} className={styles.removeTagBtn}>×</button>
                </div>
              ))}
              <input 
                id="tag-input"
                className={styles.tagInput} 
                placeholder={tags.length === 0 ? "e.g. React, Python..." : ""}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Action Button */}
          <button 
            className={`btn btn-primary ${styles.submitBtn}`}
            onClick={handleCreate}
            disabled={isLoading || !form.title || !form.amount}
          >
            {isLoading ? 'Processing...' : `Fund & Post Job ($${form.amount || '0'} MNEE)`}
          </button>

          {/* Status Feedback */}
          {status && (
            <div className={`${styles.statusBox} ${status.includes('Error') ? styles.statusError : styles.statusLoading}`}>
              {step > 0 && !status.includes('Error') && <span style={{ marginRight: '10px' }}>⏳</span>}
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}