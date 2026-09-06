import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { accessibilityValueFor, clampProgress, indeterminateBarSegment } from './progress.js';
import { useProgressValue } from './useProgressValue.js';
import { useReduceMotion } from './useReduceMotion.js';
import type { BarProps } from './types.js';

const DEFAULT_COLOR = 'rgba(0, 122, 255, 1)';

/**
 * Linear progress bar.
 *
 * Draws with two plain views and one `useAnimatedStyle`, deliberately: this is
 * the component most apps reach for, and it should never drag a native module
 * into the build. `rn-progress-next/bar` is the entry point that keeps it that way.
 */
export function Bar({
  progress = 0,
  indeterminate = false,
  indeterminateAnimationDuration = 1000,
  animated = true,
  animationType = 'spring',
  animationConfig,
  color = DEFAULT_COLOR,
  unfilledColor,
  borderWidth = 1,
  borderColor,
  borderRadius = 4,
  width = 150,
  height = 6,
  style,
  onLayout,
  accessibilityLabel,
  useNativeDriver: _useNativeDriver,
  ...rest
}: BarProps) {
  const reduceMotion = useReduceMotion();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  const value = useProgressValue(progress, {
    animated,
    animationType,
    animationConfig,
    reduceMotion,
  });

  // `width: null` means "fill the parent", so the track has to be measured.
  const trackWidth = width === null ? measuredWidth : width;
  const innerWidth = Math.max(0, (trackWidth ?? 0) - borderWidth * 2);

  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!indeterminate) {
      cancelAnimation(sweep);
      sweep.value = 0;
      return;
    }
    if (reduceMotion) {
      // Reduce motion: hold a static partial bar rather than sweep forever.
      cancelAnimation(sweep);
      sweep.value = 0.5;
      return;
    }
    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, {
        duration: indeterminateAnimationDuration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
    return () => cancelAnimation(sweep);
  }, [indeterminate, indeterminateAnimationDuration, reduceMotion, sweep]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (width === null) setMeasuredWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [onLayout, width],
  );

  const fillStyle = useAnimatedStyle(() => {
    if (indeterminate) {
      const segment = indeterminateBarSegment(innerWidth, sweep.value);
      return {
        width: segment.width,
        transform: [{ translateX: segment.offset }],
      };
    }
    return {
      width: innerWidth * value.value,
      transform: [{ translateX: 0 }],
    };
  });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValueFor(clampProgress(progress), indeterminate)}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      {...rest}
      onLayout={handleLayout}
      style={[
        styles.track,
        {
          width: width ?? undefined,
          height,
          borderWidth,
          borderRadius,
          borderColor: borderColor ?? color,
          backgroundColor: unfilledColor ?? 'transparent',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { height: Math.max(0, height - borderWidth * 2), backgroundColor: color },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    // The fill is laid out at the start of the track and moved by transform, so
    // the indeterminate sweep never triggers a layout pass.
    alignSelf: 'flex-start',
  },
});

export default Bar;
