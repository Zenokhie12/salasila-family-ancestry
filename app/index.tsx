import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Legend } from '../src/components/tree/Legend';
import { TreeCanvas } from '../src/components/tree/TreeCanvas';
import { useFamilyUnits, usePeople } from '../src/hooks/useLiveData';
import { UI } from '../src/lib/colors';
import { computeTreeLayout } from '../src/lib/treeLayout';

export default function TreeScreen() {
  const router = useRouter();
  const people = usePeople();
  const units = useFamilyUnits();
  const layout = useMemo(() => computeTreeLayout(people, units), [people, units]);

  if (people.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Start your family tree</Text>
        <Text style={styles.emptySubtitle}>
          Create your own profile first — everyone else connects outward from you.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/add-person?asRoot=1')}>
          <Text style={styles.primaryLabel}>Create my profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TreeCanvas layout={layout} onPressPerson={(id) => router.push(`/person/${id}`)} />
      <Legend />
      <Pressable style={styles.fab} onPress={() => router.push('/add-person')}>
        <Text style={styles.fabLabel}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: UI.background,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: UI.text },
  emptySubtitle: {
    fontSize: 15,
    color: UI.subtleText,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: UI.accent,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  primaryLabel: { color: UI.onDark, fontSize: 16, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabLabel: { color: UI.onDark, fontSize: 26, lineHeight: 30 },
});
