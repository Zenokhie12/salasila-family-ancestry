import { StyleSheet, Text, View } from 'react-native';

import { LINEAGE_COLORS, LINEAGE_LABELS, UI } from '../../lib/colors';
import type { LineageSide } from '../../models/types';

const SIDES: LineageSide[] = ['paternal', 'root', 'maternal'];

export function Legend() {
  return (
    <View style={styles.container}>
      {SIDES.map((side) => (
        <View key={side} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: LINEAGE_COLORS[side] }]} />
          <Text style={styles.label}>{LINEAGE_LABELS[side]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    backgroundColor: UI.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  label: { fontSize: 12, color: UI.text },
});
