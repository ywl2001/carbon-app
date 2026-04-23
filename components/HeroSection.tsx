type Props = {
    walletAddress: string;
    onReload: () => void;
  };
  
  export default function HeroSection({ walletAddress, onReload }: Props) {
    return (
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
                A behavior-driven on-chain identity that turns daily activity into a dynamic carbon profile.
              </p>
            </div>
          </div>
  
          <button
            onClick={onReload}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {walletAddress ? "Reload Identity" : "Connect Wallet"}
          </button>
        </div>
      </section>
    );
  }