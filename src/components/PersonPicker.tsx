import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LINEAGE_COLORS, UI } from '../lib/colors';
import type { Person } from '../models/types';

interface Props {
  people: Person[];
  selectedId?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
}

/**
 * Dropdown-style person selector: a button that opens a searchable modal
 * list. Scales to large trees where an inline list would get unwieldy.
 */
export function PersonPicker({ people, selectedId, onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = people.find((p) => p.id === selectedId);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? people.filter((p) => p.fullName.toLowerCase().includes(query))
      : people;
    return [...base].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [people, search]);

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerLabel, !selected && styles.triggerPlaceholder]}>
          {selected ? selected.fullName : (placeholder ?? 'Select family member…')}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          {/* Stop backdrop press from closing when tapping inside the sheet */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <TextInput
              style={styles.search}
              placeholder="Search by name…"
              placeholderTextColor={UI.subtleText}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(person) => person.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.empty}>No one matches that name.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.row, item.id === selectedId && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.id);
                    close();
                  }}
                >
                  <View
                    style={[
                      styles.lineageDot,
                      { backgroundColor: LINEAGE_COLORS[item.lineage ?? 'unknown'] },
                    ]}
                  />
                  <Text
                    style={[styles.rowLabel, item.id === selectedId && styles.rowLabelActive]}
                    numberOfLines={1}
                  >
                    {item.fullName}
                  </Text>
                  {item.dateOfBirth ? (
                    <Text style={styles.rowYear}>b. {item.dateOfBirth.slice(0, 4)}</Text>
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: UI.card,
  },
  triggerLabel: { fontSize: 15, color: UI.text, flex: 1 },
  triggerPlaceholder: { color: UI.subtleText },
  chevron: { fontSize: 14, color: UI.subtleText, marginLeft: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: UI.background,
    borderRadius: 14,
    padding: 12,
    maxHeight: '70%',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 10,
  },
  search: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: UI.text,
    backgroundColor: UI.card,
  },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rowActive: { backgroundColor: UI.accent },
  rowLabel: { fontSize: 15, color: UI.text, flex: 1 },
  rowLabelActive: { color: UI.onDark, fontWeight: 'bold' },
  rowYear: { fontSize: 12, color: UI.subtleText },
  lineageDot: { width: 10, height: 10, borderRadius: 5 },
  empty: {
    color: UI.subtleText,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
