/**
 * Bar-only entry point: `import Progress from 'rn-progress-next/bar'`.
 *
 * Nothing reachable from here touches react-native-svg, so a bundle that only
 * shows a progress bar never pulls in the native SVG module.
 */
export { Bar, default } from '../Bar.js';
export type { BarProps } from '../types.js';
