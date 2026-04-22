"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";

type MetadataAttribute = {
  trait_type: string;
  value: string | number;
};

type Metadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: MetadataAttribute[];
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

function levelToLabel(level: number) {
  if (level === 1) return "Seed 🌱";
  if (level === 2) return "Green 🌿";
  if (level === 3) return "Pro 🌳";
  return `Unknown (${level})`;
}

function ipfsToHttp(uri: string) {
  if (!uri.startsWith("ipfs://")) return uri;
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
}

function calculateScore(steps: number) {
  return Math.min(Math.floor(steps / 1000), 10);
}

function calculateLevel(score: number) {
  if (score <= 3) return 1;
  if (score <= 7) return 2;
  return 3;
}

export default function HomePage() {
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
      const res = await fetch(metadataUrl);

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

  async function updateFromSteps() {
    try {
      setUpdating(true);
      setError("");
      setSuccessMessage("");

      if (typeof window === "undefined" || !window.ethereum) {
        setError("MetaMask not found. Please open this page in a browser with MetaMask enabled.");
        return;
      }

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

      const newScore = calculateScore(steps);
      const newLevel = calculateLevel(newScore);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const currentTokenId = await contract.getTokenIdByOwner(walletAddress);
      const currentTokenURI = await contract.tokenURI(currentTokenId);

      const tx = await contract.updateCarbonData(
        walletAddress,
        newScore,
        newLevel,
        currentTokenURI
      );

      await tx.wait();

      setStepsInput("");
      setSuccessMessage(`Updated successfully. Score = ${newScore}, Level = ${levelToLabel(newLevel)}`);

      await loadIdentity();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update identity");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Carbon SBT Dashboard</h1>

        <button
          onClick={loadIdentity}
          className="rounded-lg border px-4 py-2"
        >
          {walletAddress ? "Reload Identity" : "Connect Wallet"}
        </button>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {successMessage && <p className="text-green-600">{successMessage}</p>}

        <section className="rounded-xl border p-6 space-y-3">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <p>{walletAddress || "-"}</p>
          <p>Minted: {hasMinted ? "Yes" : "No"}</p>
        </section>

        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Update from Steps</h2>

          <div className="space-y-2">
            <label htmlFor="steps" className="block font-medium">
              Daily Steps
            </label>
            <input
              id="steps"
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="Enter steps, e.g. 7500"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            onClick={updateFromSteps}
            disabled={!hasMinted || updating || loading}
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Carbon Identity"}
          </button>

          <p className="text-sm text-gray-600">
            This version updates on-chain score and level only. Metadata URI remains unchanged for now.
          </p>
        </section>

        {hasMinted && (
          <>
            <section className="rounded-xl border p-6 space-y-3">
              <h2 className="text-xl font-semibold">On-chain Identity</h2>
              <p>Token ID: {tokenId}</p>
              <p>Score: {score}</p>
              <p>Level: {level !== null ? levelToLabel(level) : "-"}</p>
              <p className="break-all">Token URI: {tokenURI}</p>
            </section>

            <section className="rounded-xl border p-6 space-y-3">
              <h2 className="text-xl font-semibold">Metadata</h2>
              <p>Name: {metadata?.name || "-"}</p>
              <p>Description: {metadata?.description || "-"}</p>

              {metadata?.image && (
                <img
                  src={metadata.image}
                  alt="Carbon Identity"
                  className="h-40 w-40 rounded-lg border object-cover"
                />
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Attributes</h3>
                {metadata?.attributes?.length ? (
                  metadata.attributes.map((attr, index) => (
                    <div
                      key={`${attr.trait_type}-${index}`}
                      className="rounded-lg border p-3"
                    >
                      <p className="font-medium">{attr.trait_type}</p>
                      <p>{String(attr.value)}</p>
                    </div>
                  ))
                ) : (
                  <p>No attributes</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}