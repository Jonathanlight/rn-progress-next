import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" setting.
 *
 * react-native-progress ignores it, so its indeterminate spinners keep looping
 * for users who asked the system to stop animating things. Respecting it is the
 * one behavioural difference here that is a deliberate improvement rather than a
 * consequence of the rewrite.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!cancelled) setReduceMotion(enabled);
      })
      .catch(() => {
        // Platforms without the API (some web targets) simply keep animating.
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => setReduceMotion(enabled),
    );

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}
