/** Normalized progress is bounded even for short sections and overscroll. */
export function progressBetween(
  position: number,
  start: number,
  end: number,
): number {
  if (end <= start) return position >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (position - start) / (end - start)));
}

export function sceneProgress(
  top: number,
  height: number,
  viewport: number,
): number {
  return progressBetween(-top, 0, Math.max(1, height - viewport));
}

export function craftStep(progress: number): number {
  return Math.min(2, Math.max(0, Math.floor(progress * 3)));
}

/** A word reaches full contrast before the next word starts to light up. */
export function wordProgress(
  progress: number,
  index: number,
  total: number,
): number {
  return progressBetween(progress * (total + 2), index, index + 2);
}

/** Each product gets a full dwell segment, including the last before release. */
export function productScrollIndex(
  distance: number,
  stride: number,
  count: number,
): number {
  if (count < 1 || stride <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(distance / stride)));
}

export function productScrollOffset(
  index: number,
  stride: number,
  count: number,
): number {
  if (count < 1 || stride <= 0) return 0;
  return (Math.min(count - 1, Math.max(0, index)) + 0.1) * stride;
}
