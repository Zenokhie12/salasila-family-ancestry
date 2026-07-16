import { create } from 'zustand';

/**
 * Ephemeral UI state only — all family data lives in SQLite and reaches the
 * UI through drizzle live queries (src/hooks/useLiveData.ts).
 */
interface AppState {
  /** When set, the tree canvas centers on this person and clears the request. */
  focusPersonId: string | null;
  setFocusPersonId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  focusPersonId: null,
  setFocusPersonId: (id) => set({ focusPersonId: id }),
}));
