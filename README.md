# rn-progress-next

**Progress indicators for React Native — no forced SVG dependency, animations on the UI thread.**

`react-native-progress` is installed about 295,000 times a week and was last
published in 2023, against the old architecture. Two things bite people:
animations run through the JS-driven `Animated` API, and `Circle`, `Pie` and
`CircleSnail` require `react-native-svg` — which is why its own documentation
tells you to deep-`require` the bar to avoid the dependency.

`rn-progress-next` keeps the same four components and the same props, moves the
animation to the UI thread, and makes SVG genuinely optional.

> Independent community rewrite. Not affiliated with, nor endorsed by, the
> authors of react-native-progress.

---

## Migration

```diff
- import * as Progress from 'react-native-progress';
+ import * as Progress from 'rn-progress-next';
```

`<Progress.Bar>`, `<Progress.Circle>`, `<Progress.Pie>` and
`<Progress.CircleSnail>` all keep their names, props and defaults.

### What actually differs

| | `react-native-progress` | `rn-progress-next` |
|---|---|---|
| Animation thread | JS thread | UI thread |
| `react-native-svg` | required for Circle / Pie / CircleSnail | optional peer dependency, and never needed for `Bar` |
| Missing SVG | obscure native module error | a sentence naming the component and the install command |
| Reduce motion | ignored | respected: indeterminate animations hold instead of looping |
| Accessibility | none | `accessibilityRole="progressbar"` and `accessibilityValue` on every indicator |
| `useNativeDriver` | meaningful | accepted and ignored |
| Architecture | Paper (old) | New Architecture only |
| React Native | any | >= 0.78 |

One prop behaves differently and it is worth knowing about: `animationType="decay"`
has no target of its own, so here it coasts under `withDecay` and is then settled
exactly on the value. A progress bar that stops *near* its value would be a bug,
so the landing is deliberate.

---

## Which component pulls which dependency

This is the table people came for.

| Component | Import | Needs `react-native-svg` |
|---|---|---|
| `Bar` | `rn-progress-next/bar` | **No** |
| `Circle` | `rn-progress-next/circle` | Yes |
| `Pie` | `rn-progress-next/pie` | Yes |
| `CircleSnail` | `rn-progress-next/circle-snail` | Yes |
| all four | `rn-progress-next` | Only once you render a circular one |

If your app only shows a progress bar, import it from the `/bar` entry point and
nothing in the graph will reach `react-native-svg`:

```ts
import { Bar } from 'rn-progress-next/bar';
```

That is not a promise, it is a test:
[`test/barEntryPoint.test.ts`](test/barEntryPoint.test.ts) walks the import graph
from the bar entry point and fails the build if `react-native-svg` — or any
module that reaches it — ever appears.

### Installation

```sh
npm install rn-progress-next react-native-reanimated react-native-worklets

# only if you use Circle, Pie or CircleSnail
npx expo install react-native-svg
```

---

## API

### `Bar`

```tsx
<Progress.Bar progress={0.42} width={200} />
<Progress.Bar indeterminate width={null} />   {/* null fills the parent */}
```

| Prop | Type | Default |
|---|---|---|
| `width` | `number \| null` | `150` |
| `height` | `number` | `6` |

### `Circle`

```tsx
<Progress.Circle progress={0.7} size={64} showsText />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `40` |
| `thickness` | `number` | `3` |
| `showsText` | `boolean` | `false` |
| `textStyle` | style | — |
| `formatText` | `(progress: number) => string` | `${round(p * 100)}%` |
| `direction` | `'clockwise' \| 'counter-clockwise'` | `'clockwise'` |
| `strokeCap` | `'butt' \| 'square' \| 'round'` | `'butt'` |
| `endAngle` | `number` | `0.9` |
| `allowFontScaling` | `boolean` | `true` |

### `Pie`

```tsx
<Progress.Pie progress={0.3} size={50} />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `40` |

### `CircleSnail`

```tsx
<Progress.CircleSnail color={['red', 'green', 'blue']} />
```

| Prop | Type | Default |
|---|---|---|
| `size` | `number` | `40` |
| `thickness` | `number` | `3` |
| `color` | `string \| string[]` | system blue |
| `animating` | `boolean` | `true` |
| `hidesWhenStopped` | `boolean` | `false` |
| `duration` | `number` | `1000` |
| `spinDuration` | `number` | `1600` |
| `strokeCap` | `'butt' \| 'square' \| 'round'` | `'round'` |

### Props shared by all indicators

`progress`, `indeterminate`, `indeterminateAnimationDuration`, `animated`,
`animationType` (`'decay' \| 'timing' \| 'spring'`), `animationConfig`, `color`,
`unfilledColor`, `borderWidth`, `borderColor`, `borderRadius`, `useNativeDriver`
(ignored), `style`, `onLayout`.

### Not yet supported

Nothing is silently missing. As of 0.1.0 the whole prop list above is
implemented. Anything added later will be listed here rather than dropped
quietly.

---

## Accessibility

Every indicator renders as a real progress bar to assistive technology:

- `accessibilityRole="progressbar"`
- `accessibilityValue={{ now, min: 0, max: 1 }}` when determinate
- no `now` when indeterminate, so VoiceOver and TalkBack announce "in progress"
  instead of reading a number that means nothing

And the OS reduce-motion setting is honoured: indeterminate indicators hold a
static state rather than looping. `react-native-progress` does not do this, and
it is the single most common accessibility audit finding against a spinner.

## Example app

```sh
cd example
npm install
npx expo start
```

## Licence

MIT. See [NOTICE](NOTICE) for the relationship to react-native-progress.
