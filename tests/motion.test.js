import test from 'node:test';
import assert from 'node:assert/strict';
import { animationScope } from '../src/lib/motion.js';
import { createThemeTransition } from '../src/lib/themeTransition.js';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function settle() { for (let n = 0; n < 5; n++) await Promise.resolve(); }
function browser(t, supportsTransitions = true) {
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const classes = new Set(), transitions = [], animations = [];
  const root = {
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    animate(frames, options) { const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } }; animations.push(animation); return animation; },
  };
  const document = { documentElement: root };
  if (supportsTransitions) document.startViewTransition = update => {
    const ready = deferred(), finished = deferred();
    const transition = { update, readyControl: ready, finishControl: finished, ready: ready.promise, finished: finished.promise, skipped: false, skipTransition() { this.skipped = true; } };
    transitions.push(transition); return transition;
  };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { innerWidth: 1200, innerHeight: 800 } });
  t.after(() => {
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else delete globalThis.document;
    if (savedWindow) Object.defineProperty(globalThis, 'window', savedWindow); else delete globalThis.window;
  });
  return { classes, transitions, animations };
}

test('rapid theme selections commit only the latest requested palette', async t => {
  const { transitions, classes, animations } = browser(t);
  const controller = createThemeTransition(), applied = [];
  controller.change(() => applied.push('ion'), { motionOn: true, x: 200, y: 40 });
  controller.change(() => applied.push('pearl'), { motionOn: true, x: 240, y: 40 });
  assert.equal(transitions[0].skipped, true);
  transitions[0].update(); transitions[1].update();
  transitions[0].readyControl.resolve(); transitions[1].readyControl.resolve();
  await settle();
  assert.deepEqual(applied, ['pearl']);
  assert.equal(animations.length, 1);
  assert.equal(animations[0].options.pseudoElement, '::view-transition-new(root)');
  assert.match(animations[0].frames[0].clipPath, /240px 40px/);
  transitions[0].finishControl.resolve(); await settle();
  assert.equal(classes.has('theme-transition'), true, 'An obsolete transition cannot remove current transition styles');
  transitions[1].finishControl.resolve(); await settle();
  assert.equal(classes.size, 0);
  assert.equal(animations[0].cancelled, true);
  assert.equal(controller.pending, false);
});

test('reduced motion applies the palette immediately and clears an earlier transition', async t => {
  const { transitions, animations, classes } = browser(t);
  const controller = createThemeTransition(), applied = [];
  controller.change(() => applied.push('ion'), { motionOn: true });
  controller.change(() => applied.push('void'), { motionOn: false });
  transitions[0].update(); transitions[0].readyControl.resolve(); transitions[0].finishControl.resolve();
  await settle();
  assert.deepEqual(applied, ['void']);
  assert.equal(animations.length, 0);
  assert.equal(classes.size, 0);
  assert.equal(controller.pending, false);
});

test('a browser without View Transitions still applies a theme', t => {
  const { animations } = browser(t, false);
  let applied = 0;
  createThemeTransition().change(() => applied++, { motionOn: true });
  assert.equal(applied, 1); assert.equal(animations.length, 0);
});

test('pausing pending theme motion preserves the requested palette without animating', async t => {
  const { transitions, animations } = browser(t);
  const controller = createThemeTransition();
  let applied = 0;
  controller.change(() => applied++, { motionOn: true });
  controller.cancel();
  transitions[0].update(); transitions[0].readyControl.resolve(); transitions[0].finishControl.resolve();
  await settle();
  assert.equal(applied, 1); assert.equal(animations.length, 0);
});

test('rejected snapshots do not block updates or leave transition styles behind', async t => {
  const { transitions, classes } = browser(t);
  let applied = 0;
  const controller = createThemeTransition();
  controller.change(() => applied++, { motionOn: true });
  transitions[0].update();
  transitions[0].readyControl.reject(new Error('Snapshot unavailable'));
  transitions[0].finishControl.resolve(); await settle();
  assert.equal(applied, 1); assert.equal(classes.size, 0);
});

test('interrupted animation scopes cancel work, settle promises, and clean up exactly once', async () => {
  const scope = animationScope(), finished = deferred();
  let cancelCount = 0, cleanups = 0, calls = 0;
  const element = { animate() { calls++; return { finished: finished.promise, cancel() { cancelCount++; finished.reject(new Error('Cancelled')); } }; } };
  scope.cleanup(() => cleanups++);
  const pending = scope.animate(element, [{ opacity: 0 }, { opacity: 1 }]);
  scope.cancel(); scope.cancel();
  await pending;
  await scope.animate(element, []);
  assert.equal(scope.cancelled, true);
  assert.ok(cancelCount >= 1);
  assert.equal(cleanups, 1);
  assert.equal(calls, 1, 'A cancelled animation owner cannot start more work');
});

test('animation scopes degrade safely when animation support is absent', async () => {
  const scope = animationScope();
  await scope.animate({}, []); await scope.animate(null, []);
  scope.cancel();
});

test('exit frames remain in place until the enclosing transition is cleaned up', async () => {
  const scope = animationScope();
  let cancelled = false;
  const element = { animate(_frames, options) {
    assert.equal('hold' in options, false, 'Internal lifecycle options must not reach the browser');
    return { finished: Promise.resolve(), cancel() { cancelled = true; } };
  } };
  await scope.animate(element, [{ opacity: 1 }, { opacity: 0 }], { fill: 'both', hold: true });
  assert.equal(cancelled, false);
  scope.cancel();
  assert.equal(cancelled, true);
});
