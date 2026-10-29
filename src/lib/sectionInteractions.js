// Shared keyboard behavior for the vertical journey and horizontal interests.
export function tabDestination(key, index, count, orientation = 'horizontal') {
  if (count < 1) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  if (key === forward) return (index + 1) % count;
  if (key === backward) return (index - 1 + count) % count;
  return null;
}
