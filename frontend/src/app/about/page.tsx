import Navbar from '../../components/Navbar';
import styles from './about.module.css';

export default function About() {
  return (
    <main>
      <Navbar />
      
      <div className={styles.container}>
        
        {/* HERO */}
        <div className={styles.hero}>
          <h1 className={styles.title}>
            The Future of Work is <span className={styles.highlight}>Autonomous</span>
          </h1>
          <p className={styles.subtitle}>
            Teleo removes the friction from freelancing. No disputes, no ghosting, and no waiting for payments. 
            Just code, verify, and get paid instantly in MNEE.
          </p>
        </div>

        {/* --- HOW TO TEST SECTION (New) --- */}
        <section className={styles.testSection}>
          <h2 className={styles.sectionTitle}>🧪 How to Test (God Mode)</h2>
          <p style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto 30px auto', color: '#666'}}>
            We created a "God Mode" simulation so you can test the full lifecycle (Job → Work → AI Verification → Payment) in seconds without needing real funds.
          </p>
          
          <div className={styles.stepGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepTitle}>Connect Wallet to Create Jobs</div>
              <div className={styles.stepDesc}>Connect any MetaMask wallet (Sepolia) and use "Post a Job" for job creation. You don't need ETH/MNEE to view the demo.</div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepTitle}>Switch User</div>
              <div className={styles.stepDesc}>Use the Navbar Profile dropdown to switch between "Neeraj" to interact as (Client) for his jobs and "Samir" to interact as (Freelancer) for jobs by others.</div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepTitle}>Submit Work</div>
              <div className={styles.stepDesc}>Go to "My Jobs -&gt; Assigned to Me". Click "Submit Work" on any job.</div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepTitle}>AI Verdict</div>
              <div className={styles.stepDesc}>Watch the AI Agent verify the files in real-time and release the escrow funds!</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>The Protocol</h2>
          <div className={styles.grid}>
            
            <div className={styles.card}>
              <span className={styles.cardIcon}>🔒</span>
              <h3 className={styles.cardTitle}>1. Smart Escrow</h3>
              <p className={styles.cardText}>
                Clients post a job and deposit <strong>MNEE</strong> stablecoin into a Smart Contract. 
                The funds are locked and guaranteed—no one can touch them until the work is done.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>🤖</span>
              <h3 className={styles.cardTitle}>2. AI Arbitration</h3>
              <p className={styles.cardText}>
                Instead of a human manager, an <strong>AI Agent</strong> reviews the code or deliverables. 
                It checks for bugs, requirements, and quality in seconds, providing an unbiased verdict.
              </p>
            </div>

            <div className={styles.card}>
              <span className={styles.cardIcon}>⚡</span>
              <h3 className={styles.cardTitle}>3. Instant Settlement</h3>
              <p className={styles.cardText}>
                If the AI approves the work, the Smart Contract <strong>automatically releases</strong> the funds 
                to the freelancer's wallet. No invoices, no Net-30 terms.
              </p>
            </div>

          </div>
        </section>

        {/* TECH STACK */}
        <section className={styles.section} style={{ textAlign: 'center' }}>
          <h2 className={styles.sectionTitle}>Built With</h2>
          <div className={styles.techStack}>
            <span className={styles.techBadge}>MNEE Stablecoin</span>
            <span className={styles.techBadge}>Ethereum Sepolia</span>
            <span className={styles.techBadge}>Gemini</span>
            <span className={styles.techBadge}>Next.js 14</span>
            <span className={styles.techBadge}>Python FastAPI</span>
            <span className={styles.techBadge}>Solidity</span>
          </div>
        </section>

        {/* MISSION */}
        <section className={styles.section} style={{ background: '#f9fafb', padding: '40px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Why "Teleo"?</h3>
          <p style={{ lineHeight: '1.8', color: '#444' }}>
            Derived from the Greek word <em>Telos</em> (Purpose/End Goal), Teleo is designed to focus purely on the <strong>output</strong>. 
            In the traditional gig economy, humans waste time negotiating, disputing, and managing trust. 
            By replacing the "Middleman" with Code and AI, we return that time to the creators.
          </p>
        </section>

      </div>
    </main>
  );
}