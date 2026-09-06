/**
 * `react-native-svg` is an optional peer dependency: `Bar` is the component most
 * apps use and it draws with plain views, so nothing should force the native SVG
 * module into a build that never renders a circle.
 *
 * Requiring it lazily means the failure, when it happens, is a sentence telling
 * the developer what to install rather than a red screen about a missing module.
 */

declare const require: ((id: string) => unknown) | undefined;

export function svgInstallMessage(componentName: string): string {
  return (
    `rn-progress-next: <${componentName}> needs react-native-svg, which is not installed.\n` +
    `  npm install react-native-svg\n` +
    `  npx expo install react-native-svg   (Expo projects)\n` +
    `Only Circle, Pie and CircleSnail need it. Bar draws without it — ` +
    `import it from "rn-progress-next/bar" to keep SVG out of your bundle.`
  );
}

let cached: unknown;

/** Loads react-native-svg, or throws an actionable error naming the component. */
export function loadSvg(componentName: string): Record<string, unknown> {
  if (cached !== undefined) return cached as Record<string, unknown>;
  if (typeof require !== 'function') {
    throw new Error(svgInstallMessage(componentName));
  }
  try {
    cached = require('react-native-svg');
  } catch {
    throw new Error(svgInstallMessage(componentName));
  }
  if (cached === undefined || cached === null) {
    throw new Error(svgInstallMessage(componentName));
  }
  return cached as Record<string, unknown>;
}

/** Test seam so a suite can exercise both the present and absent branches. */
export function resetSvgCache(): void {
  cached = undefined;
}
