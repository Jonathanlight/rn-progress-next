import { useEffect, useState, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { circumference, strokeRadius } from './geometry.js';
import { loadSvg } from './optionalSvg.js';
import { snailColorAt } from './progress.js';
import { useReduceMotion } from './useReduceMotion.js';
import type { CircleSnailProps } from './types.js';

/**
 * The indeterminate "snail" spinner: an arc whose length grows and shrinks while
 * the whole thing rotates. Requires react-native-svg.
 *
 * Both motions are worklet loops, so a busy JS thread does not stutter the
 * spinner — which, for a spinner shown *because* the app is busy, is the point.
 */
export function CircleSnail({
  size = 40,
  thickness = 3,
  color,
  animating = true,
  hidesWhenStopped = false,
  duration = 1000,
  spinDuration = 1600,
  strokeCap = 'round',
  style,
  accessibilityLabel = 'Loading',
  useNativeDriver: _useNativeDriver,
}: CircleSnailProps) {
  const svg = loadSvg('CircleSnail');
  const Svg = svg['default'] as ComponentType<Record<string, unknown>>;
  const SvgCircle = svg['Circle'] as ComponentType<Record<string, unknown>>;
  const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

  const reduceMotion = useReduceMotion();
  const active = animating && !reduceMotion;

  const rotation = useSharedValue(0);
  const sweep = useSharedValue(0.1);
  const [spin, setSpin] = useState(0);

  const radius = strokeRadius(size, thickness);
  const total = circumference(radius);

  useEffect(() => {
    if (!active) {
      cancelAnimation(rotation);
      cancelAnimation(sweep);
      // Held at a readable arc so a stopped spinner still looks like a spinner.
      sweep.value = 0.25;
      return;
    }

    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(1, { duration: spinDuration, easing: Easing.linear }),
      -1,
      false,
    );

    sweep.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(sweep);
    };
  }, [active, duration, spinDuration, rotation, sweep]);

  // Cycle the colour list one entry per revolution, as upstream does.
  useEffect(() => {
    if (!active || typeof color === 'string' || !Array.isArray(color) || color.length < 2) return;
    const timer = setInterval(() => setSpin((n) => n + 1), spinDuration);
    return () => clearInterval(timer);
  }, [active, color, spinDuration]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: total * (1 - sweep.value),
  }));

  if (!animating && hidesWhenStopped) return null;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 1 }}
      style={[{ width: size, height: size }, styles.container, style]}
    >
      <Animated.View style={spinStyle}>
        <Svg width={size} height={size}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={snailColorAt(color, spin)}
            strokeWidth={thickness}
            strokeLinecap={strokeCap}
            strokeDasharray={total}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={animatedProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});

export default CircleSnail;
