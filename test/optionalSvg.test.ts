import { describe, expect, it } from 'vitest';
import { svgInstallMessage } from '../src/optionalSvg.js';

describe('missing react-native-svg message', () => {
  const message = svgInstallMessage('Circle');

  it('names the component that needs it', () => {
    expect(message).toContain('<Circle>');
  });

  it('gives the exact install command, for both npm and Expo', () => {
    expect(message).toContain('npm install react-native-svg');
    expect(message).toContain('npx expo install react-native-svg');
  });

  it('points at the Bar entry point, which needs no SVG at all', () => {
    expect(message).toContain('rn-progress-next/bar');
  });
});
