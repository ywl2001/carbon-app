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

type Props = {
  walletAddress: string;
  tokenId: string;
  score: string;
  level: number | null;
  tokenURI: string;
  metadata: Metadata | null;
};

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

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ipfsToHttp(uri: string) {
  if (!uri.startsWith("ipfs://")) return uri;
  return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
}

function extractAttribute(
  metadata: Metadata | null,
  traitType: string
): string | number | null {
  const attr = metadata?.attributes?.find((item) => item.trait_type === traitType);
  return attr ? attr.value : null;
}

export default function IdentityDashboard({
  walletAddress,
  tokenId,
  score,
  level,
  tokenURI,
  metadata,
}: Props) {
  const stepsValue = extractAttribute(metadata, "Steps");

  return (
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
            <span>{level !== null ? levelToEmoji(level) : "❔"}</span>
            <span>{level !== null ? levelToLabel(level) : "Not Connected"}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">
              {score || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Level</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900 truncate">
              {level !== null ? levelToLabel(level) : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Steps</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">
              {stepsValue ?? "-"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Token ID</p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              {tokenId || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Minted</p>
            <p className="mt-2 text-lg font-medium text-slate-900">Yes</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Wallet
            </p>
            <p className="mt-2 font-medium text-slate-900">
              {shortAddress(walletAddress)}
            </p>
            <p className="mt-1 break-all text-sm text-slate-500">
              {walletAddress || "-"}
            </p>
          </div>

          <div className="space-y-4 min-w-0">
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
      </div>
    </section>
  );
}