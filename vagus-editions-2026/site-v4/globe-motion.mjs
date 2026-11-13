// Closed-form exponential damping keeps momentum independent of frame frequency.
export function dampedMotion(velocity, elapsedSeconds) {
  const damping = 6;
  const retention = Math.exp(-damping * Math.max(0, elapsedSeconds));
  return {
    distance: velocity * (1 - retention) / damping,
    velocity: velocity * retention
  };
}
