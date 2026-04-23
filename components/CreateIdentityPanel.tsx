type Props = {
    loading: boolean;
    onCreate: () => void;
  };
  
  export default function CreateIdentityPanel({ loading, onCreate }: Props) {
    return (
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold">
          Create Your Carbon Identity
        </h2>
  
        <p className="mt-2 text-slate-600">
          Start tracking your daily activity and build your on-chain carbon identity.
        </p>
  
        <button
          onClick={onCreate}
          disabled={loading}
          className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-white font-medium hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Creating..." : "Create Identity"}
        </button>
      </div>
    );
  }