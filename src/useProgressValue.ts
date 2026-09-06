import { useEffect } from 'react';
import {
  useSharedValue,
  withDecay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { clampProgress } from './progress.js';
import type { AnimationType } from './types.js';

export interface ProgressAnimationOptions {
  animated?: boolean | undefined;
  animationType?: AnimationType | undefined;
  animationConfig?: Record<string, number | boolean> | undefined;
  /** Reduce-motion turns every value change into an instant jump. */
  reduceMotion?: boolean | undefined;
}

/**
 * Drives a shared value towards `progress`, using the animation the caller asked
 * for. Everything happens on the UI thread; React never re-renders per frame.
 */
export function useProgressValue(
  progress: number | undefined,
  options: ProgressAnimationOptions,
): SharedValue<number> {
  const {
    animated = true,
    animationType = 'spring',
    animationConfig,
    reduceMotion = false,
  } = options;

  const target = clampProgress(progress);
  const value = useSharedValue(target);

  useEffect(() => {
    if (!animated || reduceMotion) {
      value.value = target;
      return;
    }

    const from = value.value;

    switch (animationType) {
      case 'timing':
        value.value = withTiming(target, { duration: 500, ...animationConfig });
        break;
      case 'decay': {
        // Decay has no target of its own, so it is clamped to the range being
        // crossed and then settled exactly on the value — a progress bar that
        // coasts to *near* its value would just be wrong.
        const [low, high] = from <= target ? [from, target] : [target, from];
        value.value = withSequence(
          withDecay({
            velocity: (target - from) * 2,
            clamp: [low, high],
            deceleration: 0.997,
            ...animationConfig,
          }),
          withTiming(target, { duration: 120 }),
        );
        break;
      }
      case 'spring':
      default:
        value.value = withSpring(target, {
          damping: 20,
          stiffness: 120,
          overshootClamping: true,
          ...animationConfig,
        });
        break;
    }
    // `animationConfig` is a fresh object on most renders; keying the effect on
    // the target keeps a re-render from restarting an in-flight animation.
  }, [target, animated, animationType, reduceMotion, value]); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
}
