import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepCursorSpring } from '../src/effects/reactbits/TargetCursorSpring.js';

test('cursor settles without runaway oscillation at low or uneven frame rates', () => {
  for (const frames of [[1 / 60], [1 / 30], [0.05], [1 / 120, 0.05, 1 / 60, 0.04]]) {
    for (const stiffness of [2200, (4.6 / 0.2) ** 2]) {
      const state = { x: 0, v: 0 };
      const damping = 2 * Math.sqrt(stiffness);
      for (let i = 0; i < 240; i++) {
        stepCursorSpring(state, 500, stiffness, damping, frames[i % frames.length]);
        assert.ok(Number.isFinite(state.x));
        assert.ok(state.x >= 0 && state.x <= 500.001, `Cursor overshot to ${state.x}`);
      }
      assert.equal(state.x, 500);
      assert.equal(state.v, 0, 'A stationary mouse must not keep oscillating');
      stepCursorSpring(state, 500, stiffness, damping, 0.05);
      assert.deepEqual(state, { x: 500, v: 0 });
    }
  }
});
