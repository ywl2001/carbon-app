type Props = {
    steps: number;
    goal?: number;
  };
  
  export default function DailyLoopPanel({ steps, goal = 10000 }: Props) {
    const progress = Math.min(Math.round((steps / goal) * 100), 100);
    const completed = steps >= goal;
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Daily Loop</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Today’s Green Goal
            </h2>
          </div>
  
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              completed
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            }`}
          >
            {completed ? "Completed ✅" : "In Progress"}
          </div>
        </div>
  
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Today Steps</p>
            <p className="mt-2 text-3xl font-semibold">{steps}</p>
          </div>
  
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Goal</p>
            <p className="mt-2 text-3xl font-semibold">{goal}</p>
          </div>
  
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Progress</p>
            <p className="mt-2 text-3xl font-semibold">{progress}%</p>
          </div>
        </div>
  
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span>{steps} / {goal} steps</span>
            <span>{completed ? "Goal reached" : `${goal - steps} steps left`}</span>
          </div>
  
          <div className="h-3 rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>
    );
  }