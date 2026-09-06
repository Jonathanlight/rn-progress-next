import { describe, expect, it } from 'vitest';
import {
  accessibilityValueFor,
  clampProgress,
  defaultFormatText,
  indeterminateBarSegment,
  snailColorAt,
} from '../src/progress.js';

describe('clampProgress', () => {
  it('passes values inside the range through untouched', () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(0.42)).toBe(0.42);
    expect(clampProgress(1)).toBe(1);
  });

  it('clamps rather than throwing, so a bad value never breaks a screen', () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(1.8)).toBe(1);
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(undefined)).toBe(0);
  });
});

describe('defaultFormatText', () => {
  it('renders a whole-number percentage', () => {
    expect(defaultFormatText(0)).toBe('0%');
    expect(defaultFormatText(0.5)).toBe('50%');
    expect(defaultFormatText(0.333)).toBe('33%');
    expect(defaultFormatText(1)).toBe('100%');
  });

  it('clamps before formatting', () => {
    expect(defaultFormatText(2)).toBe('100%');
    expect(defaultFormatText(-1)).toBe('0%');
  });
});

describe('accessibilityValueFor', () => {
  it('publishes the current value for a determinate indicator', () => {
    expect(accessibilityValueFor(0.6, false)).toEqual({ now: 0.6, min: 0, max: 1 });
  });

  it('omits `now` when indeterminate so screen readers do not read a made-up number', () => {
    expect(accessibilityValueFor(0.6, true)).toEqual({ min: 0, max: 1 });
    expect(accessibilityValueFor(0.6, true)).not.toHaveProperty('now');
  });

  it('clamps the announced value', () => {
    expect(accessibilityValueFor(5, false).now).toBe(1);
  });
});

describe('indeterminateBarSegment', () => {
  it('starts fully off the left edge and ends fully past the right', () => {
    const track = 200;
    const start = indeterminateBarSegment(track, 0);
    const end = indeterminateBarSegment(track, 1);

    expect(start.offset).toBe(-start.width);
    expect(end.offset).toBe(track);
  });

  it('keeps the segment a constant fraction of the track', () => {
    expect(indeterminateBarSegment(200, 0).width).toBe(80);
    expect(indeterminateBarSegment(200, 0.5).width).toBe(80);
    expect(indeterminateBarSegment(50, 0).width).toBe(20);
  });

  it('moves monotonically across the cycle', () => {
    let previous = Number.NEGATIVE_INFINITY;
    for (let t = 0; t <= 1; t += 0.1) {
      const { offset } = indeterminateBarSegment(120, t);
      expect(offset).toBeGreaterThan(previous);
      previous = offset;
    }
  });

  it('degrades to zero width on an unmeasured track instead of producing NaN', () => {
    const segment = indeterminateBarSegment(0, 0.5);
    expect(segment.width).toBe(0);
    expect(Number.isNaN(segment.offset)).toBe(false);
  });
});

describe('snailColorAt', () => {
  it('returns a single colour unchanged whatever the spin count', () => {
    expect(snailColorAt('red', 0)).toBe('red');
    expect(snailColorAt('red', 7)).toBe('red');
  });

  it('cycles through a colour list one entry per revolution', () => {
    const colors = ['a', 'b', 'c'];
    expect(snailColorAt(colors, 0)).toBe('a');
    expect(snailColorAt(colors, 1)).toBe('b');
    expect(snailColorAt(colors, 2)).toBe('c');
    expect(snailColorAt(colors, 3)).toBe('a');
  });

  it('falls back rather than returning undefined for empty or missing colours', () => {
    expect(snailColorAt(undefined, 0)).toBe('rgba(0, 122, 255, 1)');
    expect(snailColorAt([], 0)).toBe('rgba(0, 122, 255, 1)');
  });
});
