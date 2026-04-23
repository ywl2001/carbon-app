type Props = {
    loading: boolean;
    error: string;
    successMessage: string;
  };
  
  export default function StatusBanner({
    loading,
    error,
    successMessage,
  }: Props) {
    if (!loading && !error && !successMessage) return null;
  
    return (
      <div className="mb-6 space-y-2">
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
    );
  }