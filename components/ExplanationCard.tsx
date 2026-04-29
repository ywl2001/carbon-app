type Explanation = {
    steps: number;
    score: number;
    co2Reduction: number;
    methodology?: string;
    behaviorLabel?: string;
    message: string;
    nextAction?: string;
  };
  
  type Props = {
    explanation: Explanation | null;
  };
  
  export default function ExplanationCard({ explanation }: Props) {
    if (!explanation) return null;
  
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-medium text-emerald-700">
            Behavior Feedback
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            Today’s Carbon Impact
          </h2>
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
            <p className="text-sm text-slate-500">Steps</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {explanation.steps}
            </p>
          </div>
  
          <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
            <p className="text-sm text-slate-500">Carbon Score</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">
              +{explanation.score}
            </p>
          </div>
  
          <div className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
            <p className="text-sm text-slate-500">CO₂ Reduction</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-700">
              ~{explanation.co2Reduction} kg
            </p>
          </div>
        </div>
  
        <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
          <p className="text-sm font-medium text-emerald-700">
            🌱 {explanation.behaviorLabel || "Carbon behavior detected"}
          </p>
  
          <p className="mt-2 text-base leading-7 text-slate-700">
            {explanation.message}
          </p>
  
          {explanation.nextAction && (
            <p className="mt-3 text-sm text-slate-500">
              Next: {explanation.nextAction}
            </p>
          )}
  
          {explanation.methodology && (
            <p className="mt-3 text-xs text-slate-400">
              Methodology: {explanation.methodology}
            </p>
          )}
        </div>
      </section>
    );
  }