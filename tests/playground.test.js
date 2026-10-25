import test from 'node:test';
import assert from 'node:assert/strict';
import { BEST_SCORE_KEY, loadBestScore, nextBugPosition, pointInSurface, saveBestScore, secondsRemaining } from '../src/component/playground/playgroundLogic.js';

test('drawing coordinates stay inside the canvas, including captured drags outside its bounds', () => {
  const bounds = { left: 20, top: 40, width: 400, height: 200 };
  assert.deepEqual(pointInSurface(220, 140, bounds), { x: 0.5, y: 0.5 });
  assert.deepEqual(pointInSurface(-20, 300, bounds), { x: 0, y: 1 });
});

test('the bug moves a useful distance and remains inside its safe habitat', () => {
  const previous = { x: 0.08, y: 0.08 };
  const position = nextBugPosition(previous, () => 0.75);
  assert.ok(Math.hypot(position.x - previous.x, position.y - previous.y) > 0.3);
  assert.ok(position.x >= 0.08 && position.x <= 0.92);
  assert.ok(position.y >= 0.08 && position.y <= 0.92);
  assert.deepEqual(nextBugPosition({ x: 0.5, y: 0.5 }, () => 0.5), { x: 0.15, y: 0.15 });
});

test('the round uses elapsed time rather than counting delayed timer ticks', () => {
  assert.equal(secondsRemaining(15000, 0), 15);
  assert.equal(secondsRemaining(15000, 12101), 3);
  assert.equal(secondsRemaining(15000, 18000), 0);
});

test('personal best storage survives blocked storage and rejects corrupt scores', () => {
  const blocked = { getItem() { throw new Error('Storage blocked'); }, setItem() { throw new Error('Storage blocked'); } };
  assert.equal(loadBestScore(blocked), 0);
  assert.equal(saveBestScore(9, blocked), false);
  for (const value of ['NaN', '-2', '3.5', 'Infinity', '9999999999999999999999']) {
    assert.equal(loadBestScore({ getItem: () => value }), 0);
  }
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(saveBestScore(23, storage), true);
  assert.equal(values.get(BEST_SCORE_KEY), '23');
  assert.equal(loadBestScore(storage), 23);
});
