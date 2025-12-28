"use client";
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { API_URL, NETWORKS } from '../lib/config';
import { ethers } from 'ethers';

// Define the shape of our Network Config
type NetworkConfig = typeof NETWORKS.SEPOLIA;

interface User {
  id: number;
  name: string;
  address: string;
  avatar: string;
}

interface TeleoContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  
  // NEW: Network State
  network: NetworkConfig;
  toggleNetwork: () => void;
  
  account: string | null;
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}

const TeleoContext = createContext<TeleoContextType | null>(null);

export function TeleoProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Default to Sepolia
  const [network, setNetwork] = useState<NetworkConfig>(NETWORKS.SEPOLIA);
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle Function
  const toggleNetwork = () => {
    setNetwork(prev => prev.id === NETWORKS.SEPOLIA.id ? NETWORKS.MAINNET : NETWORKS.SEPOLIA);
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      } catch (err) {
        console.error("User rejected", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Fetch Users from Backend
  useEffect(() => {
    async function init() {
      try {
        const res = await axios.get(`${API_URL}/users`);
        setUsers(res.data);
        if (res.data.length > 0) {
          setCurrentUser(res.data[0]); // Default to First User
        }
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  return (
    <TeleoContext.Provider value={{ currentUser, setCurrentUser, users, network, toggleNetwork, account, connectWallet, isLoading }}>
      {children}
    </TeleoContext.Provider>
  );
}

export const useTeleo = () => {
  const context = useContext(TeleoContext);
  if (!context) throw new Error("useTeleo must be used within a TeleoProvider");
  return context;
};