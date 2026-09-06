import type { ComponentType } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import {
  accessibilityValueFor,
  clampProgress,
  defaultFormatText,
} from './progress.js';
import { circumference, dashOffsetFor, strokeRadius } from './geometry.js';
import { loadSvg } from './optionalSvg.js';
import { useIndeterminateSpin } from './useIndeterminateSpin.js';
import { useProgressValue } from './useProgressValue.js';
import { useReduceMotion } from './useReduceMotion.js';
import type { CircleProps } from './types.js';

const DEFAULT_COLOR = 'rgba(0, 122, 255, 1)';

/** Circular progress indicator. Requires react-native-svg. */
export function Circle({
  progress = 0,
  indeterminate = false,
  indeterminateAnimationDuration = 1000,
  animated = true,
  animationType = 'spring',
  animationConfig,
  size = 40,
  thickness = 3,
  color = DEFAULT_COLOR,
  unfilledColor,
  borderWidth = 1,
  borderColor,
  showsText = false,
  textStyle,
  formatText = defaultFormatText,
  direction = 'clockwise',
  strokeCap = 'butt',
  endAngle = 0.9,
  allowFontScaling = true,
  style,
  onLayout,
  accessibilityLabel,
  children,
  useNativeDriver: _useNativeDriver,
}: CircleProps) {
  const svg = loadSvg('Circle');
  const Svg = svg['default'] as ComponentType<Record<string, unknown>>;
  const SvgCircle = svg['Circle'] as ComponentType<Record<string, unknown>>;
  const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

  const reduceMotion = useReduceMotion();
  const value = useProgressValue(progress, {
    animated,
    animationType,
    animationConfig,
    reduceMotion,
  });
  const spin = useIndeterminateSpin({
    active: indeterminate,
    duration: indeterminateAnimationDuration,
    reduceMotion,
  });

  const outerRadius = size / 2;
  const radius = strokeRadius(size, thickness);
  const total = circumference(radius);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: indeterminate
      ? dashOffsetFor(radius, 0.25, 1)
      : dashOffsetFor(radius, value.value, endAngle),
  }));

  const label = clampProgress(progress);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValueFor(label, indeterminate)}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      onLayout={onLayout}
      style={[{ width: size, height: size }, styles.container, style]}
    >
      <Animated.View style={spin.style}>
        <Svg width={size} height={size}>
          {unfilledColor !== undefined || borderWidth > 0 ? (
            <SvgCircle
              cx={outerRadius}
              cy={outerRadius}
              r={radius}
              stroke={unfilledColor ?? borderColor ?? 'transparent'}
              strokeWidth={thickness}
              fill="none"
            />
          ) : null}
          <AnimatedCircle
            cx={outerRadius}
            cy={outerRadius}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap={strokeCap}
            strokeDasharray={total}
            fill="none"
            // Start the arc at 12 o'clock, and flip it for counter-clockwise.
            transform={
              direction === 'clockwise'
                ? `rotate(-90 ${outerRadius} ${outerRadius})`
                : `rotate(-90 ${outerRadius} ${outerRadius}) scale(1 -1) translate(0 ${-size})`
            }
            animatedProps={animatedProps}
          />
        </Svg>
      </Animated.View>

      {showsText || children ? (
        <View style={styles.textLayer} pointerEvents="none">
          {children ?? (
            <Text
              allowFontScaling={allowFontScaling}
              style={[{ fontSize: size / 4, color }, textStyle as never]}
            >
              {formatText(label)}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  textLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

export default Circle;
