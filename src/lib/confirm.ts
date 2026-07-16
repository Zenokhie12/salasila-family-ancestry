import { Alert, Platform } from 'react-native';

/** Alert.alert is a no-op on react-native-web, so web falls back to window.confirm. */
export function confirmAsync(title: string, message: string, actionLabel = 'Delete'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: actionLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
