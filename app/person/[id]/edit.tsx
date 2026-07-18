import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { PersonForm, type PersonFormValues } from '../../../src/components/profile/PersonForm';
import { updatePerson } from '../../../src/db/queries/people';
import { usePerson } from '../../../src/hooks/useLiveData';
import { UI } from '../../../src/lib/colors';

export default function EditPersonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person } = usePerson(id);

  if (!person) return null;

  const submit = async (values: PersonFormValues) => {
    // Explicit nulls clear fields the user emptied (undefined would be
    // dropped by drizzle's .set and leave stale values behind).
    await updatePerson(id, {
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth ?? null,
      placeOfBirth: values.placeOfBirth ?? null,
      currentAddress: values.currentAddress ?? null,
      isDeceased: values.isDeceased ?? null,
      dateOfDeath: values.dateOfDeath ?? null,
      placeOfDeath: values.placeOfDeath ?? null,
      notes: values.notes ?? null,
    });
    router.back();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PersonForm initial={person} submitLabel="Save changes" onSubmit={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: UI.background },
  content: { padding: 16, paddingBottom: 48 },
});
