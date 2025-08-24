"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { walletAuth, type WalletAuthSession } from "@/lib/wallet-auth";
import { SessionProvider } from "next-auth/react";

interface AuthContextType {
  // Wallet auth
  walletSession: WalletAuthSession | null;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Loading states
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletSession, setWalletSession] = useState<WalletAuthSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing wallet session
    const session = walletAuth.getSession();
    setWalletSession(session);
    setIsLoading(false);
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const address = await walletAuth.connectWallet();
      if (address) {
        const session = await walletAuth.authenticateWallet(address);
        setWalletSession(session);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    walletAuth.clearSession();
    setWalletSession(null);
  };

  return (
    <SessionProvider>
      <AuthContext.Provider
        value={{
          walletSession,
          isWalletConnected: !!walletSession,
          connectWallet,
          disconnectWallet,
          isLoading,
        }}
      >
        {children}
      </AuthContext.Provider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider as WalletAuthProvider };
