// Keep the cursor stable when rendering drops below 30fps or skips a frame.
export function stepCursorSpring(state, goal, stiffness, damping, dt) {
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    state.v += (stiffness * (goal - state.x) - damping * state.v) * h;
    state.x += state.v * h;
  }
  if (Math.abs(goal - state.x) < 0.001 && Math.abs(state.v) < 0.01) {
    state.x = goal;
    state.v = 0;
  }
}
