import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Progress from 'rn-progress-next';
import { useReduceMotion } from 'rn-progress-next';

/**
 * Shows all four indicators against a progress slider and an indeterminate
 * toggle, and surfaces whether the OS reduce-motion setting is on — the
 * behaviour that is hardest to check by eye.
 */
export default function App() {
  const [progress, setProgress] = useState(0.35);
  const [indeterminate, setIndeterminate] = useState(false);
  const dark = useColorScheme() === 'dark';
  const reduceMotion = useReduceMotion();

  const color = '#c96442';
  const shared = { progress, indeterminate, color, unfilledColor: dark ? '#2b2b28' : '#e9e6dc' };

  return (
    <View style={[styles.root, dark && styles.rootDark]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, dark && styles.textDark]}>rn-progress-next</Text>
        <Text style={styles.subtitle}>
          Four indicators, one of which needs no native module at all.
        </Text>

        <View style={styles.row}>
          <Text style={[styles.label, dark && styles.textDark]}>Indeterminate</Text>
          <Switch value={indeterminate} onValueChange={setIndeterminate} />
        </View>

        <Text style={[styles.reduceMotion, reduceMotion && styles.reduceMotionOn]}>
          Reduce motion is {reduceMotion ? 'ON — indeterminate indicators hold still' : 'off'}
        </Text>

        {/* A plain stepper rather than a slider, to keep the example dependency-free. */}
        <View style={styles.stepper}>
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Set progress to ${value * 100} percent`}
              onPress={() => setProgress(value)}
              style={[styles.step, progress === value && styles.stepActive]}
            >
              <Text style={progress === value ? styles.stepTextActive : styles.stepText}>
                {Math.round(value * 100)}%
              </Text>
            </Pressable>
          ))}
        </View>

        <Section title="Bar — no react-native-svg needed" dark={dark}>
          <Progress.Bar {...shared} width={null} height={10} borderRadius={6} />
        </Section>

        <Section title="Circle" dark={dark}>
          <Progress.Circle {...shared} size={72} thickness={6} showsText endAngle={1} />
        </Section>

        <Section title="Pie" dark={dark}>
          <Progress.Pie {...shared} size={72} />
        </Section>

        <Section title="CircleSnail — always indeterminate" dark={dark}>
          <Progress.CircleSnail size={72} thickness={6} color={['#c96442', '#5a8a72', '#3c6ea5']} />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  dark,
  children,
}: {
  title: string;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dark && styles.textDark]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#faf9f7' },
  rootDark: { backgroundColor: '#141413' },
  scroll: { padding: 20, paddingTop: 64, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: '700', color: '#141413' },
  subtitle: { fontSize: 14, color: '#63635e', marginTop: 4, marginBottom: 20 },
  textDark: { color: '#f5f4ed' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  label: { fontSize: 14, color: '#141413' },
  reduceMotion: { fontSize: 12, color: '#63635e', marginBottom: 16 },
  reduceMotionOn: { color: '#c96442', fontWeight: '600' },
  stepper: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  step: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e9e6dc' },
  stepActive: { backgroundColor: '#c96442' },
  stepText: { color: '#63635e', fontSize: 12 },
  stepTextActive: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { marginTop: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12, color: '#141413' },
  sectionBody: { alignItems: 'flex-start' },
});
