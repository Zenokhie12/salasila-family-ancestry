import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { UI } from '../../lib/colors';
import type { Person } from '../../models/types';

export interface PersonFormValues {
  fullName: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  currentAddress?: string;
  isDeceased?: boolean;
  dateOfDeath?: string;
  placeOfDeath?: string;
  notes?: string;
}

interface Props {
  initial?: Person;
  submitLabel: string;
  onSubmit: (values: PersonFormValues) => void;
}

export function PersonForm({ initial, submitLabel, onSubmit }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? '');
  const [placeOfBirth, setPlaceOfBirth] = useState(initial?.placeOfBirth ?? '');
  const [currentAddress, setCurrentAddress] = useState(initial?.currentAddress ?? '');
  const [isDeceased, setIsDeceased] = useState(initial?.isDeceased ?? false);
  const [dateOfDeath, setDateOfDeath] = useState(initial?.dateOfDeath ?? '');
  const [placeOfDeath, setPlaceOfDeath] = useState(initial?.placeOfDeath ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const valid = fullName.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onSubmit({
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim() || undefined,
      placeOfBirth: placeOfBirth.trim() || undefined,
      currentAddress: isDeceased ? undefined : currentAddress.trim() || undefined,
      isDeceased: isDeceased || undefined,
      dateOfDeath: isDeceased ? dateOfDeath.trim() || undefined : undefined,
      placeOfDeath: isDeceased ? placeOfDeath.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <Field label="Full name *">
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Amina binti Yusof"
          placeholderTextColor={UI.subtleText}
        />
      </Field>
      <Field label="Date of birth">
        <TextInput
          style={styles.input}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={UI.subtleText}
        />
      </Field>
      <Field label="Place of birth">
        <TextInput
          style={styles.input}
          value={placeOfBirth}
          onChangeText={setPlaceOfBirth}
          placeholder="City, country"
          placeholderTextColor={UI.subtleText}
        />
      </Field>

      <View style={styles.switchRow}>
        <Text style={styles.label}>Deceased</Text>
        <Switch value={isDeceased} onValueChange={setIsDeceased} />
      </View>

      {isDeceased ? (
        <>
          <Field label="Date of death">
            <TextInput
              style={styles.input}
              value={dateOfDeath}
              onChangeText={setDateOfDeath}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={UI.subtleText}
            />
          </Field>
          <Field label="Place of death">
            <TextInput
              style={styles.input}
              value={placeOfDeath}
              onChangeText={setPlaceOfDeath}
              placeholder="City, country"
              placeholderTextColor={UI.subtleText}
            />
          </Field>
        </>
      ) : (
        <Field label="Current address">
          <TextInput
            style={styles.input}
            value={currentAddress}
            onChangeText={setCurrentAddress}
            placeholder="Street, city, country"
            placeholderTextColor={UI.subtleText}
          />
        </Field>
      )}

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything worth remembering"
          placeholderTextColor={UI.subtleText}
          multiline
        />
      </Field>

      <Pressable style={[styles.submit, !valid && styles.disabled]} disabled={!valid} onPress={submit}>
        <Text style={styles.submitLabel}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: UI.subtleText },
  input: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: UI.text,
    backgroundColor: UI.card,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  submit: {
    backgroundColor: UI.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLabel: { color: UI.onDark, fontSize: 16, fontWeight: 'bold' },
  disabled: { opacity: 0.4 },
});
