import { calculateCarbon } from "./carbonEngine";

function getBehaviorLabel(steps: number) {
  if (steps < 3000) return "Light activity";
  if (steps < 8000) return "Good low-carbon behavior";
  return "Strong low-carbon behavior";
}

function getBehaviorMessage(steps: number) {
  if (steps < 3000) {
    return "You made a small low-carbon movement today. Keep building the habit.";
  }

  if (steps < 8000) {
    return "You walked enough to meaningfully reduce short-distance transport emissions.";
  }

  return "You showed strong low-carbon behavior today by replacing short-distance travel with walking.";
}

function getNextAction(steps: number) {
  if (steps < 3000) return "Try reaching 3,000 steps to strengthen your daily carbon signal.";
  if (steps < 8000) return "Reach 8,000 steps to move into strong low-carbon behavior.";
  return "Great work. Keep the streak going tomorrow.";
}

export function generateExplanation(steps: number) {
  const result = calculateCarbon(steps);

  return {
    steps,
    score: result.score,
    co2Reduction: result.co2Reduction,
    methodology: "v1-steps-proxy",
    behaviorLabel: getBehaviorLabel(steps),
    message: getBehaviorMessage(steps),
    nextAction: getNextAction(steps),
  };
}