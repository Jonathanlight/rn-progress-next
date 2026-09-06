/**
 * rn-progress-next — progress indicators for React Native on Reanimated 4.
 *
 * Independent community rewrite. Not affiliated with, nor endorsed by, the
 * authors of react-native-progress. See NOTICE for attribution.
 *
 * Importing from the package root gives you all four components, matching
 * `import * as Progress from 'react-native-progress'`. If you only need the bar,
 * `rn-progress-next/bar` keeps react-native-svg out of your bundle entirely.
 */
export { Bar } from './Bar.js';
export { Circle } from './Circle.js';
export { Pie } from './Pie.js';
export { CircleSnail } from './CircleSnail.js';

export {
  clampProgress,
  defaultFormatText,
  accessibilityValueFor,
} from './progress.js';
export { circumference, dashOffsetFor, piePath, pointOnCircle, strokeRadius } from './geometry.js';
export { useReduceMotion } from './useReduceMotion.js';
export { useProgressValue } from './useProgressValue.js';

export type {
  AnimationType,
  BarProps,
  CircleProps,
  CircleSnailProps,
  CommonProgressProps,
  Direction,
  PieProps,
  StrokeCap,
} from './types.js';

import { Bar } from './Bar.js';
import { Circle } from './Circle.js';
import { CircleSnail } from './CircleSnail.js';
import { Pie } from './Pie.js';

/** Default export mirrors upstream so `import Progress from '...'` also works. */
export default { Bar, Circle, Pie, CircleSnail };
