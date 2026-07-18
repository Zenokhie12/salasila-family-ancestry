import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { initDb } from '../src/db/client';
import { UI } from '../src/lib/colors';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error>();

  // The DB must open asynchronously (the sync API is unsupported on web) and
  // migrations must finish before any screen queries it.
  useEffect(() => {
    initDb().then(
      () => setReady(true),
      (e) => setError(e instanceof Error ? e : new Error(String(e))),
    );
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Database failed to open</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }
  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={UI.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: UI.card },
          headerTintColor: UI.text,
          contentStyle: { backgroundColor: UI.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Salasila' }} />
        <Stack.Screen
          name="add-person"
          options={{ title: 'Add Family Member', presentation: 'modal' }}
        />
        <Stack.Screen name="person/[id]/index" options={{ title: 'Profile' }} />
        <Stack.Screen
          name="person/[id]/edit"
          options={{ title: 'Edit Profile', presentation: 'modal' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.background,
    padding: 24,
    gap: 8,
  },
  errorTitle: { fontSize: 17, fontWeight: 'bold', color: UI.danger },
  errorDetail: { fontSize: 13, color: UI.subtleText, textAlign: 'center' },
});
