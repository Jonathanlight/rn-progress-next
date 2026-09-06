import { useState, type ComponentType } from 'react';
import { View } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { accessibilityValueFor, clampProgress } from './progress.js';
import { piePath } from './geometry.js';
import { loadSvg } from './optionalSvg.js';
import { useProgressValue } from './useProgressValue.js';
import { useReduceMotion } from './useReduceMotion.js';
import type { PieProps } from './types.js';

const DEFAULT_COLOR = 'rgba(0, 122, 255, 1)';

/**
 * Filled pie indicator. Requires react-native-svg.
 *
 * A pie is the one shape here that cannot be animated by interpolating a single
 * numeric prop — the slice is a path whose shape changes — so the path string is
 * rebuilt as the value moves. It is quantised to whole percents to keep that to
 * at most 100 updates per sweep instead of one per frame.
 */
export function Pie({
  progress = 0,
  indeterminate = false,
  animated = true,
  animationType = 'spring',
  animationConfig,
  size = 40,
  color = DEFAULT_COLOR,
  unfilledColor,
  borderWidth = 1,
  borderColor,
  style,
  onLayout,
  accessibilityLabel,
  useNativeDriver: _useNativeDriver,
}: PieProps) {
  const svg = loadSvg('Pie');
  const Svg = svg['default'] as ComponentType<Record<string, unknown>>;
  const Path = svg['Path'] as ComponentType<Record<string, unknown>>;
  const SvgCircle = svg['Circle'] as ComponentType<Record<string, unknown>>;

  const reduceMotion = useReduceMotion();
  const value = useProgressValue(progress, {
    animated,
    animationType,
    animationConfig,
    reduceMotion,
  });

  const [percent, setPercent] = useState(() => Math.round(clampProgress(progress) * 100));

  useDerivedValue(() => {
    const next = Math.round(value.value * 100);
    if (next !== percent) scheduleOnRN(setPercent, next);
  }, [percent]);

  const radius = size / 2;
  const path = piePath(size, indeterminate ? 0.25 : percent / 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={accessibilityValueFor(clampProgress(progress), indeterminate)}
      {...(accessibilityLabel !== undefined ? { accessibilityLabel } : {})}
      onLayout={onLayout}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <SvgCircle
          cx={radius}
          cy={radius}
          r={Math.max(0, radius - borderWidth / 2)}
          fill={unfilledColor ?? 'transparent'}
          stroke={borderColor ?? color}
          strokeWidth={borderWidth}
        />
        {path ? <Path d={path} fill={color} /> : null}
      </Svg>
    </View>
  );
}

export default Pie;
