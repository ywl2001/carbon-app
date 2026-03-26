export function calculateScore(steps: number, streak: number) {
  const daily = Math.min(steps / 1000, 15);
  const bonus = Math.min(streak * 0.5, 10);
  return daily + bonus;
}