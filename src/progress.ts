/**
 * Pure helpers shared by the indicators. Kept free of React Native imports so
 * they can be unit tested directly.
 */

/** Progress is a 0..1 fraction; anything else is clamped rather than rejected. */
export function clampProgress(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Default label text: `formatText` in upstream, a whole-number percentage. */
export function defaultFormatText(progress: number): string {
  return `${Math.round(clampProgress(progress) * 100)}%`;
}

/**
 * The `accessibilityValue` a progress indicator should publish. Screen readers
 * announce a determinate value; an indeterminate one deliberately has none, so
 * VoiceOver and TalkBack say "in progress" instead of reading a bogus number.
 */
export function accessibilityValueFor(
  progress: number,
  indeterminate: boolean,
): { now?: number; min: number; max: number } {
  if (indeterminate) return { min: 0, max: 1 };
  return { now: clampProgress(progress), min: 0, max: 1 };
}

/**
 * Geometry of the indeterminate bar: a short segment sweeping across the track.
 *
 * `t` runs 0..1 over one cycle. The segment enters from the left edge and exits
 * past the right, so the returned offset is intentionally allowed to go negative
 * and to exceed the track width.
 */
export function indeterminateBarSegment(
  trackWidth: number,
  t: number,
): { width: number; offset: number } {
  const segmentWidth = trackWidth * 0.4;
  const travel = trackWidth + segmentWidth;
  return { width: segmentWidth, offset: -segmentWidth + travel * t };
}

/**
 * Picks the colour for spin `n` when `color` is a list. Upstream cycles through
 * the array one colour per revolution.
 */
export function snailColorAt(color: string | string[] | undefined, spin: number): string {
  const fallback = 'rgba(0, 122, 255, 1)';
  if (!color) return fallback;
  if (typeof color === 'string') return color;
  if (color.length === 0) return fallback;
  const index = ((spin % color.length) + color.length) % color.length;
  return color[index] as string;
}
