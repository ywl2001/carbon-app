type Props = {
    stepsInput: string;
    setStepsInput: (value: string) => void;
    onUpdate: () => void;
    hasMinted: boolean;
    updating: boolean;
    loading: boolean;
    explanation?: any;
  };
  
  export default function UpdateStepsPanel({
    stepsInput,
    setStepsInput,
    onUpdate,
    hasMinted,
    updating,
    loading,
  }: Props) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500">Action</p>
          <h2 className="mt-1 text-2xl font-semibold">Update from Steps</h2>
        </div>
  
        <div className="space-y-4">
          <div>
            <label
              htmlFor="steps"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Today’s Total Steps
            </label>
            <input
              id="steps"
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              placeholder="Enter today's total steps, e.g. 9200"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
  
          <button
            onClick={onUpdate}
            disabled={!hasMinted || updating || loading}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {updating ? "Updating..." : "Update Carbon Identity"}
          </button>

        
  
          <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Enter your current total steps for today. This will replace today's previous step value and update your Carbon Identity.
          </div>
        </div>
      </section>
    );
  }