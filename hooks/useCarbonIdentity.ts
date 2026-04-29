"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import type { Metadata } from "@/types/carbon";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function ipfsToHttp(uri: string) {
  if (!uri.startsWith("ipfs://")) return uri;
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
}

export function useCarbonIdentity() {
  const [walletAddress, setWalletAddress] = useState("");
  const [hasMinted, setHasMinted] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [score, setScore] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [tokenURI, setTokenURI] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const [stepsInput, setStepsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadIdentity() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      if (typeof window === "undefined" || !window.ethereum) {
        setError("MetaMask not found. Please open this page in a browser with MetaMask enabled.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const userAddress = accounts[0];

      setWalletAddress(userAddress);

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const minted = await contract.hasMinted(userAddress);

      setHasMinted(minted);

      if (!minted) {
        setTokenId("");
        setScore("");
        setLevel(null);
        setTokenURI("");
        setMetadata(null);
        return;
      }

      const [tokenIdRaw, scoreRaw, levelRaw] = await Promise.all([
        contract.getTokenIdByOwner(userAddress),
        contract.getScore(userAddress),
        contract.getLevel(userAddress),
      ]);

      const tokenIdStr = tokenIdRaw.toString();
      const scoreStr = scoreRaw.toString();
      const levelNum = Number(levelRaw);

      setTokenId(tokenIdStr);
      setScore(scoreStr);
      setLevel(levelNum);

      const uri = await contract.tokenURI(tokenIdRaw);
      setTokenURI(uri);

      const metadataUrl = ipfsToHttp(uri);
      const res = await fetch(metadataUrl, { cache: "no-store" });

      if (!res.ok) {
        throw new Error("Failed to fetch metadata from IPFS.");
      }

      const metadataJson = await res.json();
      setMetadata(metadataJson);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load identity");
    } finally {
      setLoading(false);
    }
  }

  async function createIdentity() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      if (!walletAddress) {
        setError("Please connect wallet first.");
        return;
      }

      const res = await fetch("/api/create-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: walletAddress,
        }),
      });

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server.");
        return;
      }

      if (!res.ok) {
        if (data?.error === "This address already has a Carbon Identity.") {
          setSuccessMessage("This wallet already has a Carbon Identity.");
          await new Promise((resolve) => setTimeout(resolve, 1200));
          await loadIdentity();
          return;
        }

        setError(data?.error || "Failed to create identity");
        return;
      }

      setSuccessMessage("Carbon Identity created successfully.");

      await new Promise((resolve) => setTimeout(resolve, 1200));
      await loadIdentity();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create identity");
    } finally {
      setLoading(false);
    }
  }

  async function updateFromSteps() {
    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      if (!walletAddress) {
        setError("Please connect wallet first.");
        return;
      }

      if (!hasMinted) {
        setError("This wallet has not minted a Carbon SBT yet.");
        return;
      }

      const steps = Number(stepsInput);

      if (!Number.isFinite(steps) || steps <= 0) {
        setError("Please enter a valid number of steps greater than 0.");
        return;
      }

      const res = await fetch("/api/update-carbon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: walletAddress,
          steps,
        }),
      });

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server.");
        return;
      }

      if (!res.ok) {
        setError(data?.error || "Failed to update Carbon SBT");
        return;
      }

      setStepsInput("");
      setSuccessMessage(
        `Updated successfully. Score = ${data.score}, Level = ${data.levelLabel}`
      );

      await new Promise((resolve) => setTimeout(resolve, 1200));
      await loadIdentity();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update identity");
    } finally {
      setUpdating(false);
    }
  }

  return {
    walletAddress,
    hasMinted,
    tokenId,
    score,
    level,
    tokenURI,
    metadata,
    stepsInput,
    setStepsInput,
    loading,
    updating,
    error,
    successMessage,
    loadIdentity,
    createIdentity,
    updateFromSteps,
  };
}