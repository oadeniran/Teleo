"use client";
import React, { useEffect, useRef } from 'react';
import styles from './Terminal.module.css';

interface Log {
  text: string;
  color: string;
}

export default function Terminal({ logs, visible }: { logs: Log[], visible: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!visible) return null;

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`}></span>
          <span className={`${styles.dot} ${styles.yellow}`}></span>
          <span className={`${styles.dot} ${styles.green}`}></span>
        </div>
        <span className={styles.title}>Teleo_Agent_v1.exe</span>
      </div>
      <div className={styles.body}>
        {logs.map((log, i) => (
          <div key={i} className={styles.line} style={{ color: log.color }}>
            <span style={{ opacity: 0.5, marginRight: '10px' }}>{'>'}</span>
            {log.text}
          </div>
        ))}
        <div className={styles.cursor}>_</div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}