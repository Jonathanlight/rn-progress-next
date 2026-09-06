/**
 * SVG geometry for the circular indicators. Pure functions, no React Native, so
 * the maths is unit tested rather than eyeballed on a simulator.
 */

/** Circumference used as the dash length when drawing an arc with strokeDasharray. */
export function circumference(radius: number): number {
  return 2 * Math.PI * radius;
}

/**
 * `strokeDashoffset` that reveals `progress` of a circle drawn with a dash
 * pattern of one full circumference.
 */
export function dashOffsetFor(radius: number, progress: number, endAngle = 1): number {
  const total = circumference(radius);
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  return total * (1 - clamped * endAngle);
}

export interface Point {
  x: number;
  y: number;
}

/** Point on a circle at `fraction` of a turn, measured clockwise from 12 o'clock. */
export function pointOnCircle(
  center: Point,
  radius: number,
  fraction: number,
  direction: 'clockwise' | 'counter-clockwise' = 'clockwise',
): Point {
  const sign = direction === 'clockwise' ? 1 : -1;
  const angle = sign * fraction * 2 * Math.PI - Math.PI / 2;
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

/**
 * SVG path for a filled pie slice covering `progress` of the circle.
 *
 * A full circle cannot be drawn as a single arc (start and end coincide, so the
 * renderer draws nothing), which is why the complete case returns two half arcs.
 */
export function piePath(
  size: number,
  progress: number,
  direction: 'clockwise' | 'counter-clockwise' = 'clockwise',
): string {
  const radius = size / 2;
  const center: Point = { x: radius, y: radius };
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;

  if (clamped <= 0) return '';

  if (clamped >= 1) {
    const top = pointOnCircle(center, radius, 0, direction);
    const bottom = pointOnCircle(center, radius, 0.5, direction);
    const sweep = direction === 'clockwise' ? 1 : 0;
    return [
      `M ${round(top.x)} ${round(top.y)}`,
      `A ${round(radius)} ${round(radius)} 0 0 ${sweep} ${round(bottom.x)} ${round(bottom.y)}`,
      `A ${round(radius)} ${round(radius)} 0 0 ${sweep} ${round(top.x)} ${round(top.y)}`,
      'Z',
    ].join(' ');
  }

  const start = pointOnCircle(center, radius, 0, direction);
  const end = pointOnCircle(center, radius, clamped, direction);
  const largeArc = clamped > 0.5 ? 1 : 0;
  const sweep = direction === 'clockwise' ? 1 : 0;

  return [
    `M ${round(center.x)} ${round(center.y)}`,
    `L ${round(start.x)} ${round(start.y)}`,
    `A ${round(radius)} ${round(radius)} 0 ${largeArc} ${sweep} ${round(end.x)} ${round(end.y)}`,
    'Z',
  ].join(' ');
}

/** Trims float noise so paths stay readable and stable across platforms. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Radius of the stroked circle for `Circle`: the stroke straddles the path, so
 * the drawable radius has to shrink by half the thickness to stay inside `size`.
 */
export function strokeRadius(size: number, thickness: number): number {
  return Math.max(0, (size - thickness) / 2);
}
