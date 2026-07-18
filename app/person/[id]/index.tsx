import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MediaGallery } from '../../../src/components/profile/MediaGallery';
import {
  useFamilyUnits,
  useMediaForPerson,
  usePeople,
  usePerson,
} from '../../../src/hooks/useLiveData';
import { LINEAGE_COLORS, LINEAGE_LABELS, UI } from '../../../src/lib/colors';
import { confirmAsync } from '../../../src/lib/confirm';
import { getDerivedRelations } from '../../../src/lib/familyGraph';
import { removePerson } from '../../../src/lib/relationships';
import { useAppStore } from '../../../src/store/appStore';
import type { Person } from '../../../src/models/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person, loaded } = usePerson(id);
  const { people } = usePeople();
  const { units } = useFamilyUnits();
  const { media } = useMediaForPerson(id);
  const setFocusPersonId = useAppStore((s) => s.setFocusPersonId);

  const relations = useMemo(
    () => getDerivedRelations(id, people, units),
    [id, people, units],
  );

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UI.accent} />
      </View>
    );
  }
  if (!person) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtle}>This person no longer exists in the tree.</Text>
      </View>
    );
  }

  const lineage = person.lineage ?? 'unknown';

  const onDelete = async () => {
    const confirmed = await confirmAsync(
      `Delete ${person.fullName}`,
      'Their profile, relationships, and media will be removed permanently.',
    );
    if (!confirmed) return;
    await removePerson(person.id);
    router.back();
  };

  const showInTree = () => {
    setFocusPersonId(person.id);
    router.dismissTo('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: person.fullName }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.header, { borderLeftColor: LINEAGE_COLORS[lineage] }]}>
          <Text style={styles.name}>{person.fullName}</Text>
          <View style={[styles.lineageBadge, { backgroundColor: LINEAGE_COLORS[lineage] }]}>
            <Text style={styles.lineageBadgeLabel}>
              {person.isRoot ? 'You' : LINEAGE_LABELS[lineage]}
            </Text>
          </View>
        </View>

        <Section title="Details">
          <DetailRow label="Born" value={formatDate(person.dateOfBirth)} />
          <DetailRow label="Place of birth" value={person.placeOfBirth} />
          {person.isDeceased ? (
            <>
              <DetailRow label="Died" value={formatDate(person.dateOfDeath) ?? 'Yes'} />
              <DetailRow label="Place of death" value={person.placeOfDeath} />
            </>
          ) : (
            <DetailRow label="Current address" value={person.currentAddress} />
          )}
          <DetailRow label="Notes" value={person.notes} />
        </Section>

        <Section title="Family">
          <RelationGroup title="Parents" people={relations.parents} onPress={openPerson} />
          <RelationGroup title="Siblings" people={relations.siblings} onPress={openPerson} />
          <RelationGroup title="Spouse" people={relations.spouses} onPress={openPerson} />
          <RelationGroup title="Children" people={relations.children} onPress={openPerson} />
          {relations.parents.length +
            relations.siblings.length +
            relations.spouses.length +
            relations.children.length ===
            0 && <Text style={styles.subtle}>No relationships recorded yet.</Text>}
        </Section>

        <Section title="Photos, recordings & stories">
          <MediaGallery personId={person.id} media={media} />
        </Section>

        <View style={styles.actions}>
          <ActionButton
            label="Add relative"
            onPress={() => router.push(`/add-person?relativeTo=${person.id}`)}
          />
          <ActionButton
            label="Edit"
            onPress={() => router.push(`/person/${person.id}/edit`)}
          />
          <ActionButton label="Show in tree" onPress={showInTree} />
          {!person.isRoot && <ActionButton label="Delete" destructive onPress={onDelete} />}
        </View>
      </ScrollView>
    </>
  );

  function openPerson(personId: string) {
    router.push(`/person/${personId}`);
  }
}

function formatDate(iso: string | undefined): string | undefined {
  return iso || undefined;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function RelationGroup({
  title,
  people,
  onPress,
}: {
  title: string;
  people: Person[];
  onPress: (id: string) => void;
}) {
  if (people.length === 0) return null;
  return (
    <View style={styles.relationGroup}>
      <Text style={styles.detailLabel}>{title}</Text>
      <View style={styles.chipRow}>
        {people.map((person) => (
          <Pressable
            key={person.id}
            style={[
              styles.chip,
              { borderColor: LINEAGE_COLORS[person.lineage ?? 'unknown'] },
            ]}
            onPress={() => onPress(person.id)}
          >
            <Text style={styles.chipLabel}>{person.fullName}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable style={[styles.actionButton, destructive && styles.destructive]} onPress={onPress}>
      <Text style={[styles.actionLabel, destructive && styles.destructiveLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: UI.background },
  content: { padding: 16, gap: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    backgroundColor: UI.card,
    borderRadius: 12,
    borderLeftWidth: 6,
    padding: 16,
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: UI.text },
  lineageBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  lineageBadgeLabel: { color: UI.onDark, fontSize: 12, fontWeight: 'bold' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: UI.text },
  detailRow: { flexDirection: 'row', gap: 12 },
  detailLabel: { width: 120, fontSize: 13, color: UI.subtleText, fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 14, color: UI.text },
  relationGroup: { gap: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: UI.card,
  },
  chipLabel: { fontSize: 13, color: UI.text },
  subtle: { color: UI.subtleText, fontSize: 13, fontStyle: 'italic' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionButton: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: UI.card,
  },
  actionLabel: { fontSize: 14, color: UI.text, fontWeight: '600' },
  destructive: { borderColor: UI.danger },
  destructiveLabel: { color: UI.danger },
});
