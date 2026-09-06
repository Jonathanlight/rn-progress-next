import { describe, expect, it } from 'vitest';
import {
  circumference,
  dashOffsetFor,
  piePath,
  pointOnCircle,
  strokeRadius,
} from '../src/geometry.js';

describe('circumference and dash offsets', () => {
  it('computes the circumference', () => {
    expect(circumference(10)).toBeCloseTo(62.8318, 3);
  });

  it('hides the arc completely at zero and reveals it fully at one', () => {
    const r = 10;
    expect(dashOffsetFor(r, 0)).toBeCloseTo(circumference(r), 6);
    expect(dashOffsetFor(r, 1)).toBeCloseTo(0, 6);
  });

  it('reveals only the requested sweep when endAngle is under a full turn', () => {
    const r = 10;
    // endAngle 0.5 means a full progress bar covers half the circle.
    expect(dashOffsetFor(r, 1, 0.5)).toBeCloseTo(circumference(r) / 2, 6);
  });

  it('clamps out-of-range progress', () => {
    expect(dashOffsetFor(10, -1)).toBeCloseTo(circumference(10), 6);
    expect(dashOffsetFor(10, 4)).toBeCloseTo(0, 6);
  });
});

describe('pointOnCircle', () => {
  const center = { x: 0, y: 0 };

  it('starts at twelve o’clock', () => {
    const p = pointOnCircle(center, 10, 0);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(-10, 6);
  });

  it('goes right at a quarter turn clockwise and left counter-clockwise', () => {
    expect(pointOnCircle(center, 10, 0.25, 'clockwise').x).toBeCloseTo(10, 6);
    expect(pointOnCircle(center, 10, 0.25, 'counter-clockwise').x).toBeCloseTo(-10, 6);
  });

  it('returns to the start after a full turn', () => {
    const p = pointOnCircle(center, 10, 1);
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(-10, 6);
  });
});

describe('piePath', () => {
  it('draws nothing at zero progress', () => {
    expect(piePath(40, 0)).toBe('');
    expect(piePath(40, -1)).toBe('');
  });

  it('draws a wedge from the centre for a partial slice', () => {
    const path = piePath(40, 0.25);
    expect(path.startsWith('M 20 20')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    expect(path).toContain('A 20 20');
  });

  it('sets the large-arc flag only past the halfway point', () => {
    expect(piePath(40, 0.4)).toContain('A 20 20 0 0 1');
    expect(piePath(40, 0.6)).toContain('A 20 20 0 1 1');
  });

  it('draws a full circle as two arcs, because one arc back to its own start draws nothing', () => {
    const path = piePath(40, 1);
    expect(path.match(/A /g)).toHaveLength(2);
    expect(path).not.toContain('M 20 20 L');
  });

  it('reverses the sweep flag for counter-clockwise', () => {
    expect(piePath(40, 0.25, 'clockwise')).toContain(' 0 1 ');
    expect(piePath(40, 0.25, 'counter-clockwise')).toContain(' 0 0 ');
  });
});

describe('strokeRadius', () => {
  it('insets by half the stroke so the ring stays inside the requested size', () => {
    expect(strokeRadius(40, 4)).toBe(18);
    expect(strokeRadius(40, 0)).toBe(20);
  });

  it('never goes negative when the stroke is thicker than the circle', () => {
    expect(strokeRadius(10, 40)).toBe(0);
  });
});
