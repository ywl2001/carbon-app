"use client";

import { useMemo, useState } from "react";
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
  if (level === 1) return "Seed";
  if (level === 2) return "Green";
  if (level === 3) return "Pro";
  return `Unknown (${level})`;
}

function levelToEmoji(level: number) {
  if (level === 1) return "🌱";
  if (level === 2) return "🌿";
  if (level === 3) return "🌳";
  return "❔";
}

function levelToClasses(level: number | null) {
  if (level === 1) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (level === 2) {
    return "bg-lime-50 text-lime-700 ring-1 ring-lime-200";
  }
  if (level === 3) {
    return "bg-green-100 text-green-800 ring-1 ring-green-300";
  }
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function ipfsToHttp(uri: string) {
  if (!uri.startsWith("ipfs://")) return uri;
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
}

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function extractAttribute(
  metadata: Metadata | null,
  traitType: string
): string | number | null {
  const attr = metadata?.attributes?.find((item) => item.trait_type === traitType);
  return attr ? attr.value : null;
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

  const imageUrl = useMemo(() => {
    const raw = metadata?.image || "";
    if (!raw) return "https://placehold.co/400x400?text=Carbon+Identity";
    return ipfsToHttp(raw);
  }, [metadata]);

  const stepsValue = extractAttribute(metadata, "Steps");

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
        throw new Error("Invalid response from server.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update Carbon SBT");
      }

      setStepsInput("");
      setSuccessMessage(
        `Updated successfully. Score = ${data.score}, Level = ${data.levelLabel}`
      );

      await loadIdentity();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update identity");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                <span>🌱</span>
                <span>Dynamic Carbon Identity</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  Carbon SBT Identity
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  A behavior-driven on-chain identity that turns daily activity
                  into a dynamic carbon profile.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadIdentity}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {walletAddress ? "Reload Identity" : "Connect Wallet"}
              </button>
            </div>
          </div>

          {(loading || error || successMessage) && (
            <div className="mt-6 space-y-2">
              {loading && (
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  Loading identity...
                </div>
              )}
              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                  {successMessage}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Identity Card</p>
                  <h2 className="mt-1 text-2xl font-semibold">Carbon Identity</h2>
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${levelToClasses(level)}`}
                >
                  <span>{levelToEmoji(level ?? 0)}</span>
                  <span>{level !== null ? levelToLabel(level) : "Not Connected"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  <img
                    src={imageUrl}
                    alt="Carbon Identity"
                    className="h-[220px] w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=Carbon+Identity";
                    }}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Wallet
                  </p>
                  <p className="mt-2 font-medium text-slate-900">
                    {shortAddress(walletAddress)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 break-all">
                    {walletAddress || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Score</p>
                    <p className="mt-2 text-3xl font-semibold">{score || "-"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Level</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {level !== null ? levelToLabel(level) : "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Steps</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {stepsValue ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Token ID</p>
                    <p className="mt-2 text-lg font-medium">{tokenId || "-"}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Minted</p>
                    <p className="mt-2 text-lg font-medium">
                      {hasMinted ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-2 leading-7 text-slate-700">
                    {metadata?.description || "No description"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Token URI</p>
                  {tokenURI ? (
                    <a
                      href={ipfsToHttp(tokenURI)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm text-emerald-700 underline underline-offset-4"
                    >
                      {tokenURI}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">-</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-medium text-slate-500">Action</p>
                <h2 className="mt-1 text-2xl font-semibold">Update from Steps</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="steps" className="mb-2 block text-sm font-medium text-slate-700">
                    Daily Steps
                  </label>
                  <input
                    id="steps"
                    type="number"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    placeholder="Enter steps, e.g. 9200"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <button
                  onClick={updateFromSteps}
                  disabled={!hasMinted || updating || loading}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {updating ? "Updating..." : "Update Carbon Identity"}
                </button>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Enter daily steps to recalculate score and level, then sync the
                  updated identity metadata to IPFS and on-chain storage.
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-medium text-slate-500">Metadata</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Attributes Snapshot
                </h2>
              </div>

              <div className="space-y-3">
                {metadata?.attributes?.length ? (
                  metadata.attributes.map((attr, index) => (
                    <div
                      key={`${attr.trait_type}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="text-sm text-slate-500">{attr.trait_type}</p>
                      <p className="font-medium text-slate-900">
                        {String(attr.value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    No metadata available.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}