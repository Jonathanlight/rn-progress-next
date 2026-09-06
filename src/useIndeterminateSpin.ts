import { useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export interface IndeterminateSpinOptions {
  active: boolean;
  duration: number;
  reduceMotion: boolean;
}

/**
 * A continuous rotation driven entirely on the UI thread — a worklet loop rather
 * than a `setInterval` nudging React state, which is how the original spins.
 *
 * Under reduce motion the rotation stops rather than slowing down: a spinner
 * that still turns, only slower, is exactly what the setting asks you not to do.
 */
export function useIndeterminateSpin({ active, duration, reduceMotion }: IndeterminateSpinOptions) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!active || reduceMotion) {
      cancelAnimation(rotation);
      rotation.value = 0;
      return;
    }
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [active, duration, reduceMotion, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  return { rotation, style };
}
