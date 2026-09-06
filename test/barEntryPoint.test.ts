import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The headline claim of this package is that a project using only the bar never
 * pulls react-native-svg into its bundle. That is a property of the import
 * graph, so it is checked as one — a stray import in a shared helper would
 * otherwise reintroduce the dependency silently.
 */
function collectImports(entry: string): { files: string[]; externals: Set<string> } {
  const seen = new Set<string>();
  const externals = new Set<string>();
  const queue = [resolve(entry)];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);

    // Comments contain import examples, which are documentation rather than
    // edges in the graph.
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const specifiers = [...source.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1] as string);
    // `require(...)` is how the optional SVG dependency is reached at runtime.
    specifiers.push(...[...source.matchAll(/require\('([^']+)'\)/g)].map((m) => m[1] as string));

    for (const specifier of specifiers) {
      if (!specifier.startsWith('.')) {
        externals.add(specifier);
        continue;
      }
      const target = resolve(dirname(file), specifier).replace(/\.js$/, '');
      for (const candidate of [`${target}.ts`, `${target}.tsx`, `${target}/index.ts`]) {
        try {
          readFileSync(candidate, 'utf8');
          queue.push(candidate);
          break;
        } catch {
          // Try the next extension.
        }
      }
    }
  }

  return { files: [...seen], externals };
}

describe('rn-progress-next/bar entry point', () => {
  const graph = collectImports('src/entries/bar.ts');

  it('never reaches react-native-svg', () => {
    expect([...graph.externals]).not.toContain('react-native-svg');
  });

  it('never reaches the optional-SVG loader either', () => {
    expect(graph.files.some((f) => f.endsWith('optionalSvg.ts'))).toBe(false);
  });

  it('does not reach any of the SVG-backed components', () => {
    for (const component of ['Circle.tsx', 'Pie.tsx', 'CircleSnail.tsx']) {
      expect(graph.files.some((f) => f.endsWith(component)), component).toBe(false);
    }
  });

  it('depends only on React, React Native and Reanimated', () => {
    expect([...graph.externals].sort()).toEqual([
      'react',
      'react-native',
      'react-native-reanimated',
    ]);
  });
});

describe('package root entry point', () => {
  it('does reach the SVG components, so `import * as Progress` keeps working', () => {
    const graph = collectImports('src/index.ts');
    expect(graph.files.some((f) => f.endsWith('Circle.tsx'))).toBe(true);
    expect(graph.files.some((f) => f.endsWith('optionalSvg.ts'))).toBe(true);
  });
});
