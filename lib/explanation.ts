import { calculateCarbon } from "./carbonEngine";

export function generateExplanation(steps: number) {
  const result = calculateCarbon(steps);

  let message = "";

  if (steps < 3000) {
    message = "Light activity.";
  } else if (steps < 8000) {
    message = "Good low-carbon behavior.";
  } else {
    message = "Strong low-carbon behavior.";
  }

  return {
    ...result,
    message,
  };
}