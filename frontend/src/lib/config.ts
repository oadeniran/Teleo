const getEnv = (key: string, fallback?: string): string => {
  // 1. Runtime Injection (Docker/Azure)
  if (typeof window !== "undefined" && (window as any).env?.[key]) {
    return (window as any).env[key];
  }
  // 2. Build-time / Dev fallback
  return fallback || "";
};

export const API_URL = getEnv("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

// Teleo Specific Configs
export const MNEE_TOKEN_ADDRESS_MAINNET = getEnv("NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_MAINNET", process.env.NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_MAINNET);
export const MNEE_TOKEN_ADDRESS_SEPOLIA = getEnv("NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_SEPOLIA", process.env.NEXT_PUBLIC_MNEE_TOKEN_ADDRESS_SEPOLIA);
export const CONTRACT_ADDRESS_MAINNET = getEnv("NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET);
export const CONTRACT_ADDRESS_SEPOLIA = getEnv("NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA);
export const RPC_SEPOLIA = getEnv("NEXT_PUBLIC_SEPOLIA_RPC", process.env.NEXT_PUBLIC_SEPOLIA_RPC);
export const RPC_MAINNET = getEnv("NEXT_PUBLIC_MAINNET_RPC", process.env.NEXT_PUBLIC_MAINNET_RPC);
// Network Definitions
export const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    hex: "0xaa36a7",
    name: "Sepolia Testnet",
    color: "#00D084", // Green
    rpc: RPC_SEPOLIA,
    mneeToken: MNEE_TOKEN_ADDRESS_SEPOLIA,
    escrowContract: CONTRACT_ADDRESS_SEPOLIA
  },
  MAINNET: {
    id: 1,
    hex: "0x1",
    name: "Ethereum Mainnet",
    color: "#627EEA", // ETH Blue
    rpc: RPC_MAINNET,
    mneeToken: MNEE_TOKEN_ADDRESS_MAINNET,
    escrowContract: CONTRACT_ADDRESS_MAINNET
  }
};