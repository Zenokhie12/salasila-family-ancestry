import type { FamilyUnit, LineageSide, Person } from '../models/types';
import { buildFamilyGraph } from './familyGraph';

/**
 * Assigns every person a lineage side relative to the root user:
 *
 * - 'root'     — the root user, their siblings, spouse(s), descendants, and
 *                everyone reached laterally/downward from them (nieces,
 *                children-in-law, ...). These blend both bloodlines, so they
 *                get their own color.
 * - 'maternal' — everyone reachable from the root's mother without passing
 *                through a 'root'-labeled person.
 * - 'paternal' — same, from the root's father.
 * - 'unknown'  — not connected to the root, or no root exists yet.
 *
 * If both sides can reach a person (e.g. cousins who married), the paternal
 * flood runs first and wins; this is a display heuristic, not genealogy data.
 */
export function computeLineages(people: Person[], units: FamilyUnit[]): Map<string, LineageSide> {
  const result = new Map<string, LineageSide>(people.map((p) => [p.id, 'unknown']));
  const root = people.find((p) => p.isRoot);
  if (!root) return result;

  const { unitsAsParent, unitsAsChild } = buildFamilyGraph(units);

  // 1. Root side: seed with root + siblings, then flood downward/laterally
  //    (only through units where the current person is a parent, so the walk
  //    never climbs into the ancestor generations that maternal/paternal own).
  const rootSide = new Set<string>([root.id]);
  for (const unit of unitsAsChild.get(root.id) ?? []) {
    for (const siblingId of unit.childIds) rootSide.add(siblingId);
  }
  const queue = [...rootSide];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const unit of unitsAsParent.get(id) ?? []) {
      for (const next of [...unit.parentIds, ...unit.childIds]) {
        if (!rootSide.has(next)) {
          rootSide.add(next);
          queue.push(next);
        }
      }
    }
  }
  for (const id of rootSide) {
    if (result.has(id)) result.set(id, 'root');
  }

  // 2. Identify mother and father from the root's birth unit. Missing roles
  //    fall back to filling whichever side is still empty (display fallback).
  const birthUnit = (unitsAsChild.get(root.id) ?? [])[0];
  let motherId: string | undefined;
  let fatherId: string | undefined;
  if (birthUnit) {
    const roles = birthUnit.parentRoles ?? {};
    motherId = birthUnit.parentIds.find((id) => roles[id] === 'mother');
    fatherId = birthUnit.parentIds.find((id) => roles[id] === 'father');
    for (const id of birthUnit.parentIds) {
      if (id === motherId || id === fatherId) continue;
      if (!fatherId) fatherId = id;
      else if (!motherId) motherId = id;
    }
  }

  // 3. Flood each side outward through every family edge, never overwriting
  //    an already-claimed person. Pre-claim both parents so neither flood
  //    swallows the other through their shared unit.
  if (fatherId && result.get(fatherId) === 'unknown') result.set(fatherId, 'paternal');
  if (motherId && result.get(motherId) === 'unknown') result.set(motherId, 'maternal');

  const flood = (startId: string | undefined, side: LineageSide) => {
    if (!startId || result.get(startId) !== side) return;
    const floodQueue = [startId];
    while (floodQueue.length > 0) {
      const id = floodQueue.shift()!;
      const allUnits = [...(unitsAsParent.get(id) ?? []), ...(unitsAsChild.get(id) ?? [])];
      for (const unit of allUnits) {
        for (const next of [...unit.parentIds, ...unit.childIds]) {
          if (result.get(next) === 'unknown') {
            result.set(next, side);
            floodQueue.push(next);
          }
        }
      }
    }
  };
  flood(fatherId, 'paternal');
  flood(motherId, 'maternal');

  return result;
}
