"use client";

import { useEffect, useState } from "react";
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

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [hasMinted, setHasMinted] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [score, setScore] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [tokenURI, setTokenURI] = useState("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadIdentity() {
    try {
      setLoading(true);
      setError("");

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
      const metadataJson = await res.json();
      setMetadata(metadataJson);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load identity");
    } finally {
      setLoading(false);
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
          Connect Wallet
        </button>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <section className="rounded-xl border p-6 space-y-3">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <p>{walletAddress || "-"}</p>
          <p>Minted: {hasMinted ? "Yes" : "No"}</p>
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