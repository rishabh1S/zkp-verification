"use client"

import { ethers } from "ethers"

export interface WalletAuthSession {
  address: string
  signature: string
  nonce: string
  timestamp: number
}

class WalletAuth {
  private readonly STORAGE_KEY = "zkverify_wallet_session"
  private readonly NONCE_EXPIRY = 5 * 60 * 1000 // 5 minutes

  async connectWallet(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      return accounts[0]
    } catch (error) {
      console.error("Wallet connection failed:", error)
      return null
    }
  }

  async signMessage(address: string, nonce: string): Promise<string> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const message = `Sign this message to authenticate with ZKVerify.\n\nNonce: ${nonce}\nAddress: ${address}`
    return await signer.signMessage(message)
  }

  generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async authenticateWallet(address: string): Promise<WalletAuthSession | null> {
    try {
      const nonce = this.generateNonce()
      const signature = await this.signMessage(address, nonce)

      const session: WalletAuthSession = {
        address,
        signature,
        nonce,
        timestamp: Date.now(),
      }

      // Store session
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
      return session
    } catch (error) {
      console.error("Wallet authentication failed:", error)
      return null
    }
  }

  getSession(): WalletAuthSession | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const session: WalletAuthSession = JSON.parse(stored)

      // Check if session is expired
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        // 24 hours
        this.clearSession()
        return null
      }

      return session
    } catch {
      return null
    }
  }

  clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  getAddress(): string | null {
    const session = this.getSession()
    return session?.address || null
  }
}

export const walletAuth = new WalletAuth()
