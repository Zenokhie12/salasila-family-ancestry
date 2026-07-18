import { Platform } from 'react-native';

const RELOAD_FLAG = 'coi-reload-attempted';

/**
 * expo-sqlite on web requires SharedArrayBuffer, which requires the page to
 * be cross-origin isolated. Servers rarely send the needed COOP/COEP headers
 * (the Expo dev server doesn't), so public/coi-serviceworker.js injects them.
 * First visit: register the worker and reload once so the navigation itself
 * passes through it. If isolation still fails after that, surface a clear
 * error instead of looping.
 */
export async function ensureCrossOriginIsolated(): Promise<void> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (window.crossOriginIsolated) {
    window.sessionStorage.removeItem(RELOAD_FLAG);
    return;
  }

  if (window.sessionStorage.getItem(RELOAD_FLAG)) {
    throw new Error(
      'This browser blocked cross-origin isolation, which the local database needs on web. ' +
        'Try Chrome or Edge, or run the app natively with Expo Go.',
    );
  }
  if (!('serviceWorker' in navigator)) {
    throw new Error(
      'Service workers are unavailable, so the local database cannot run in this browser. ' +
        'Use a modern browser over http://localhost or https.',
    );
  }

  window.sessionStorage.setItem(RELOAD_FLAG, '1');
  const registration = await navigator.serviceWorker.register('/coi-serviceworker.js');
  await registration.update();
  window.location.reload();
  // Halt init; the reloaded page (now served through the worker) redoes it.
  await new Promise<never>(() => {});
}
