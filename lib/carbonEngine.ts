export function calculateCarbon(steps: number) {
    const score = Math.min(Math.floor(steps / 1000), 10);
  
    // 粗略估算（之後可以換模型）
    const co2Reduction = Number((steps * 0.00012).toFixed(2));
  
    return {
      score,
      co2Reduction,
    };
  }