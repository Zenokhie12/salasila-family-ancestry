import { useEffect, useState } from 'react';

import { subscribeDbChanges } from '../db/events';
import { getAllFamilyUnits } from '../db/queries/familyUnits';
import { getMediaForPerson } from '../db/queries/media';
import { getAllPeople, getPerson } from '../db/queries/people';
import type { FamilyUnit, MediaAttachment, Person } from '../models/types';

/**
 * Fetch-on-mount + refetch whenever any write goes through src/db/queries
 * (signalled via src/db/events.ts). `loaded` distinguishes "still fetching"
 * from a genuinely empty result so screens don't flash their empty states.
 */
function useQuery<T>(run: () => Promise<T>, deps: unknown[]): { data: T | undefined; loaded: boolean } {
  const [state, setState] = useState<{ data: T | undefined; loaded: boolean }>({
    data: undefined,
    loaded: false,
  });

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      run().then(
        (data) => {
          if (alive) setState({ data, loaded: true });
        },
        (error) => console.error('DB query failed', error),
      );
    };
    refresh();
    const unsubscribe = subscribeDbChanges(refresh);
    return () => {
      alive = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function usePeople(): { people: Person[]; loaded: boolean } {
  const { data, loaded } = useQuery(() => getAllPeople(), []);
  return { people: data ?? [], loaded };
}

export function usePerson(id: string): { person: Person | undefined; loaded: boolean } {
  const { data, loaded } = useQuery(() => getPerson(id), [id]);
  return { person: data, loaded };
}

export function useFamilyUnits(): { units: FamilyUnit[]; loaded: boolean } {
  const { data, loaded } = useQuery(() => getAllFamilyUnits(), []);
  return { units: data ?? [], loaded };
}

export function useMediaForPerson(personId: string): { media: MediaAttachment[]; loaded: boolean } {
  const { data, loaded } = useQuery(() => getMediaForPerson(personId), [personId]);
  return { media: data ?? [], loaded };
}
