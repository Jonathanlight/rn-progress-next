import type { StyleProp, ViewStyle } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

/** How the progress value is driven when it changes. Upstream default is `spring`. */
export type AnimationType = 'decay' | 'timing' | 'spring';

export type StrokeCap = 'butt' | 'square' | 'round';

export type Direction = 'clockwise' | 'counter-clockwise';

/** Props shared by every indicator, matching react-native-progress. */
export interface CommonProgressProps {
  /** 0 to 1. Values outside the range are clamped. */
  progress?: number;
  /** Ignore `progress` and run the indeterminate animation instead. */
  indeterminate?: boolean;
  indeterminateAnimationDuration?: number;
  /** Animate changes to `progress`. When false the value jumps. */
  animated?: boolean;
  animationType?: AnimationType;
  /** Extra config forwarded to the underlying Reanimated animation. */
  animationConfig?: Record<string, number | boolean>;
  color?: string;
  unfilledColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  /**
   * Accepted and ignored — animations already run on the UI thread. Present so
   * that code moving over from react-native-progress keeps type-checking.
   */
  useNativeDriver?: boolean;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Overrides the automatic label; pass null to remove it. */
  accessibilityLabel?: string;
}

export interface BarProps extends CommonProgressProps {
  /** Fixed width, or `null` to fill the available width. */
  width?: number | null;
  height?: number;
}

export interface CircleProps extends CommonProgressProps {
  size?: number;
  thickness?: number;
  showsText?: boolean;
  textStyle?: StyleProp<Record<string, unknown>>;
  formatText?: (progress: number) => string;
  direction?: Direction;
  strokeCap?: StrokeCap;
  /** Sweep of the arc, as a fraction of a full turn. */
  endAngle?: number;
  allowFontScaling?: boolean;
  children?: React.ReactNode;
}

export interface PieProps extends CommonProgressProps {
  size?: number;
}

export interface CircleSnailProps {
  size?: number;
  thickness?: number;
  /** A single colour, or a list cycled through across spins. */
  color?: string | string[];
  animating?: boolean;
  hidesWhenStopped?: boolean;
  duration?: number;
  spinDuration?: number;
  strokeCap?: StrokeCap;
  style?: StyleProp<ViewStyle>;
  useNativeDriver?: boolean;
  accessibilityLabel?: string;
}
