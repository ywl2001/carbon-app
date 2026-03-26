"use client";

import { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Not connected");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        setStatus("No wallet account found");
        return;
      }

      setAccount(accounts[0]);
      setStatus("Wallet connected");
    } catch (error: any) {
      console.error("Wallet connection failed:", error);

      if (error?.code === "ACTION_REJECTED" || error?.info?.error?.code === 4001) {
        setStatus("Connection request rejected");
        return;
      }

      setStatus("Failed to connect wallet");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Carbon Identity</h1>

      <button
        onClick={connectWallet}
        className="rounded-xl bg-black px-5 py-3 text-white"
      >
        Connect Wallet
      </button>

      <p>{status}</p>

      {account && (
        <div className="rounded-xl border px-4 py-3 text-sm">
          Connected: {account}
        </div>
      )}
    </main>
  );
}