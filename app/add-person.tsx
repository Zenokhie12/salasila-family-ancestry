import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PersonForm, type PersonFormValues } from '../src/components/profile/PersonForm';
import { createPerson } from '../src/db/queries/people';
import { usePeople } from '../src/hooks/useLiveData';
import { UI } from '../src/lib/colors';
import { addRelative, type RelationType } from '../src/lib/relationships';
import type { ParentRole } from '../src/models/types';

const RELATIONS: { value: RelationType; label: string }[] = [
  { value: 'parent', label: 'Parent of' },
  { value: 'child', label: 'Child of' },
  { value: 'spouse', label: 'Spouse of' },
  { value: 'sibling', label: 'Sibling of' },
];

const ROLES: { value: ParentRole; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'parent', label: 'Parent' },
];

function showError(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('Could not add member', message);
}

export default function AddPersonScreen() {
  const router = useRouter();
  const { relativeTo, asRoot } = useLocalSearchParams<{ relativeTo?: string; asRoot?: string }>();
  const { people, loaded } = usePeople();

  const isFirstPerson = asRoot === '1' || (loaded && people.length === 0);
  const [anchorId, setAnchorId] = useState<string | undefined>(relativeTo);
  const [relation, setRelation] = useState<RelationType>('child');
  const [role, setRole] = useState<ParentRole>('parent');

  const anchor = people.find((p) => p.id === anchorId);

  const submit = async (values: PersonFormValues) => {
    try {
      if (isFirstPerson) {
        await createPerson({ ...values, isRoot: true, lineage: 'root' });
      } else {
        if (!anchorId) {
          showError('Choose who this person is related to.');
          return;
        }
        await addRelative(values, anchorId, relation, relation === 'parent' ? role : undefined);
      }
      router.back();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {!isFirstPerson && (
        <View style={styles.relationSection}>
          <Text style={styles.sectionTitle}>Relationship</Text>
          <View style={styles.segmentRow}>
            {RELATIONS.map((r) => (
              <Segment
                key={r.value}
                label={r.label}
                active={relation === r.value}
                onPress={() => setRelation(r.value)}
              />
            ))}
          </View>
          {relation === 'parent' && (
            <View style={styles.segmentRow}>
              {ROLES.map((r) => (
                <Segment
                  key={r.value}
                  label={r.label}
                  active={role === r.value}
                  onPress={() => setRole(r.value)}
                />
              ))}
            </View>
          )}

          {anchor && relativeTo ? (
            <Text style={styles.anchorFixed}>
              {RELATIONS.find((r) => r.value === relation)?.label} {anchor.fullName}
            </Text>
          ) : (
            <View style={styles.anchorList}>
              {people.map((person) => (
                <Pressable
                  key={person.id}
                  style={[styles.anchorRow, anchorId === person.id && styles.anchorRowActive]}
                  onPress={() => setAnchorId(person.id)}
                >
                  <Text
                    style={[
                      styles.anchorLabel,
                      anchorId === person.id && styles.anchorLabelActive,
                    ]}
                  >
                    {person.fullName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <PersonForm
        submitLabel={isFirstPerson ? 'Create my profile' : 'Add family member'}
        onSubmit={submit}
      />
    </ScrollView>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: UI.background },
  content: { padding: 16, gap: 20, paddingBottom: 48 },
  relationSection: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: UI.subtleText },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: UI.card,
  },
  segmentActive: { backgroundColor: UI.accent, borderColor: UI.accent },
  segmentLabel: { fontSize: 13, color: UI.text },
  segmentLabelActive: { color: UI.onDark, fontWeight: 'bold' },
  anchorFixed: { fontSize: 15, color: UI.text, fontWeight: '600' },
  anchorList: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    backgroundColor: UI.card,
    maxHeight: 200,
    overflow: 'hidden',
  },
  anchorRow: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI.border,
  },
  anchorRowActive: { backgroundColor: UI.accent },
  anchorLabel: { fontSize: 14, color: UI.text },
  anchorLabelActive: { color: UI.onDark, fontWeight: 'bold' },
});
