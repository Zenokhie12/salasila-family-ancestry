/**
 * In-app change bus: every write in src/db/queries notifies here, and the
 * hooks in src/hooks/useLiveData.ts refetch on notification. Used instead of
 * expo-sqlite's change listener / drizzle's useLiveQuery because those depend
 * on enableChangeListener, which the alpha web backend doesn't reliably
 * support — this works identically on native and web.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeDbChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyDbChanged(): void {
  for (const listener of [...listeners]) listener();
}
