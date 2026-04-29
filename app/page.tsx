"use client";

import HeroSection from "@/components/HeroSection";
import StatusBanner from "@/components/StatusBanner";
import CreateIdentityPanel from "@/components/CreateIdentityPanel";
import IdentityDashboard from "@/components/IdentityDashboard";
import UpdateStepsPanel from "@/components/UpdateStepsPanel";
import MetadataSnapshot from "@/components/MetadataSnapshot";
import { useCarbonIdentity } from "@/hooks/useCarbonIdentity";
import ExplanationCard from "@/components/ExplanationCard";
import DailyLoopPanel from "@/components/DailyLoopPanel";

export default function HomePage() {
  const {
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
    explanation,
  } = useCarbonIdentity();
  const todaySteps =
    Number(
      metadata?.attributes?.find((attr) => attr.trait_type === "Steps")?.value || 0
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
        <HeroSection
          walletAddress={walletAddress}
          onReload={loadIdentity}
        />

        <StatusBanner
          loading={loading}
          error={error}
          successMessage={successMessage}
        />

        {!walletAddress && (
          <div className="mt-10 text-center text-slate-500">
            Please connect your wallet to continue.
          </div>
        )}

        {walletAddress && !hasMinted && (
          <CreateIdentityPanel
            loading={loading}
            onCreate={createIdentity}
          />
        )}

        {walletAddress && hasMinted && (
          <div className="space-y-6">
            <IdentityDashboard
              walletAddress={walletAddress}
              tokenId={tokenId}
              score={score}
              level={level}
              tokenURI={tokenURI}
              metadata={metadata}
            />

            <DailyLoopPanel steps={todaySteps} />

            <UpdateStepsPanel
              stepsInput={stepsInput}
              setStepsInput={setStepsInput}
              onUpdate={updateFromSteps}
              hasMinted={hasMinted}
              updating={updating}
              loading={loading}
            />

            <ExplanationCard
              explanation={explanation}
            />

            <MetadataSnapshot
              attributes={metadata?.attributes}
            />
          </div>
        )}
      </div>
    </main>
  );
}