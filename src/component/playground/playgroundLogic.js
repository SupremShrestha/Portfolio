export const GAME_SECONDS = 15;
export const BEST_SCORE_KEY = 'suprem-portfolio-bug-best';

export function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function pointInSurface(clientX, clientY, bounds) {
  return {
    x: clamp((clientX - bounds.left) / Math.max(1, bounds.width)),
    y: clamp((clientY - bounds.top) / Math.max(1, bounds.height)),
  };
}

export function nextBugPosition(previous, random = Math.random) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const point = { x: 0.08 + random() * 0.84, y: 0.08 + random() * 0.84 };
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.3) return point;
  }
  return { x: previous.x < 0.5 ? 0.85 : 0.15, y: previous.y < 0.5 ? 0.85 : 0.15 };
}

export function secondsRemaining(deadline, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function loadBestScore(storage) {
  try {
    const value = Number((storage ?? globalThis.localStorage).getItem(BEST_SCORE_KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(BEST_SCORE_KEY, String(score));
    return true;
  } catch {
    return false;
  }
}
