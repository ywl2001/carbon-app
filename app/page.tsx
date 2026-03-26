"use client";

import { useState } from "react";
import { calculateScore } from "@/lib/score";

export default function Home() {
  const [steps, setSteps] = useState(8000);
  const [streak, setStreak] = useState(5);

  const score = calculateScore(steps, streak);

  const getLevel = () => {
    if (score < 20) return "🌱 Seed";
    if (score < 50) return "🍃 Leaf";
    if (score < 100) return "🌳 Tree";
    return "🌲 Forest";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 bg-gray-100">
      <h1 className="text-3xl font-bold">🌍 Carbon App MVP</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md w-80 text-center">
        <p className="text-gray-500">Steps</p>
        <p className="text-2xl font-bold">{steps}</p>

        <p className="text-gray-500 mt-4">Streak</p>
        <p className="text-2xl font-bold">{streak} days</p>

        <p className="text-gray-500 mt-4">Score</p>
        <p className="text-3xl font-bold text-green-600">
          {score.toFixed(1)}
        </p>

        <p className="mt-4 text-xl font-semibold">{getLevel()}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSteps(steps + 1000)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + Steps
        </button>

        <button
          onClick={() => setStreak(streak + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Streak
        </button>
      </div>
    </main>
  );
}