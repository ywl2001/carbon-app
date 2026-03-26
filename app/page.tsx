"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

type CarbonMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
};

export default function Home() {
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [level, setLevel] = useState<string>("");
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [tokenUri, setTokenUri] = useState<string>("");
  const [metadata, setMetadata] = useState<CarbonMetadata | null>(null);

  function getLevelLabel(levelValue: number) {
    switch (levelValue) {
      case 1:
        return "Seed 🌱";
      case 2:
        return "Leaf 🍃";
      case 3:
        return "Tree 🌳";
      case 4:
        return "Forest 🌲";
      default:
        return `Level ${levelValue}`;
    }
  }

  function toHttpUrl(uri: string) {
    if (uri.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }
    return uri;
  }

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

      const userAddress = accounts[0];
      setAccount(userAddress);
      setStatus("Wallet connected");

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const minted = await contract.hasMinted(userAddress);

      if (!minted) {
        setStatus("Wallet connected, but no SBT found");
        return;
      }

      const userLevel = await contract.getLevel(userAddress);
      const userTokenId = await contract.getTokenIdByOwner(userAddress);

      console.log("TokenId raw:", userTokenId);
      console.log("TokenId string:", userTokenId.toString());

      const userTokenUri = await contract.tokenURI(userTokenId);

      setLevel(getLevelLabel(Number(userLevel)));
      setTokenId(userTokenId.toString());
      setTokenUri(userTokenUri);

      const metadataUrl = toHttpUrl(userTokenUri);
      const response = await fetch(metadataUrl);
      const metadataJson = await response.json();

      setMetadata(metadataJson);
      setStatus("Carbon identity loaded");
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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Carbon Identity</h1>

      <button
        onClick={connectWallet}
        className="rounded-xl bg-black px-5 py-3 text-white"
      >
        Connect Wallet
      </button>

      <p>{status}</p>

      {account && (
        <div className="w-full max-w-2xl rounded-2xl border p-4 text-sm">
          <p><strong>Connected:</strong> {account}</p>
          {level && <p><strong>Level:</strong> {level}</p>}
          {tokenId && <p><strong>Token ID:</strong> {tokenId ?? "N/A"}</p>}
          {tokenUri && <p><strong>Token URI:</strong> {tokenUri}</p>}
        </div>
      )}

      {metadata && (
        <div className="w-full max-w-2xl rounded-2xl border p-6">
          <h2 className="text-2xl font-semibold">{metadata.name}</h2>
          <p className="mt-2 text-gray-700">{metadata.description}</p>

          <div className="mt-4 space-y-2">
            {metadata.attributes?.map((attr, index) => (
              <div
                key={`${attr.trait_type}-${index}`}
                className="rounded-xl border px-4 py-2"
              >
                <strong>{attr.trait_type}:</strong> {String(attr.value)}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}