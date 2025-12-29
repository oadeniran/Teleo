"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { useTeleo } from '../context/TeleoContext';

export default function Navbar() {
  const { currentUser, setCurrentUser, users, network, toggleNetwork } = useTeleo();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const isMainnet = network.id === 1;

  return (
    <nav className={styles.header}>
      <div className={styles.container}>
        
        {/* LEFT GROUP: Logo + Network Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" className={styles.logo}>
            <span>◈</span> TELEO
          </Link>

          <Link href="/about" className={styles.link}>About</Link>

          {/* Clean Network Toggle */}
          <div 
            className={`${styles.toggleContainer} ${isMainnet ? styles.mainnet : ''}`}
            onClick={toggleNetwork}
          >
            <div className={styles.togglePill} />
            <div className={`${styles.toggleText} ${styles.sepoliaText}`}>SEPOLIA</div>
            <div className={`${styles.toggleText} ${styles.mainnetText}`}>MAINNET</div>
          </div>
        </div>

        {/* RIGHT GROUP: Links + Profile */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.link}>Marketplace</Link>
          <Link href="/my-jobs" className={styles.link}>My Jobs</Link>
          <Link href="/create" className={styles.link}>Post Job</Link>

          {/* Profile Dropdown */}
          <div className={styles.profileSection} ref={dropdownRef}>
            <button 
              className={styles.avatarButton} 
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className={styles.userInfo}>
                <span className={styles.userName}>{currentUser.name}</span>
                <span className={styles.userRole}>Switch User ▾</span>
              </div>
              <div className={styles.avatarCircle}>
                {currentUser.avatar}
              </div>
            </button>

            {isOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownLabel}>Switch Profile (God Mode)</div>
                {users.map((u) => (
                  <div 
                    key={u.id} 
                    className={`${styles.dropdownItem} ${currentUser.id === u.id ? styles.activeItem : ''}`}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsOpen(false);
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{u.avatar}</span>
                    <span>{u.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}