import type { DerivedRelations, FamilyUnit, Person } from '../models/types';

export interface FamilyGraph {
  /** personId -> units where they are a parent */
  unitsAsParent: Map<string, FamilyUnit[]>;
  /** personId -> units where they are a child */
  unitsAsChild: Map<string, FamilyUnit[]>;
}

export function buildFamilyGraph(units: FamilyUnit[]): FamilyGraph {
  const unitsAsParent = new Map<string, FamilyUnit[]>();
  const unitsAsChild = new Map<string, FamilyUnit[]>();
  const push = (map: Map<string, FamilyUnit[]>, id: string, unit: FamilyUnit) => {
    const list = map.get(id);
    if (list) list.push(unit);
    else map.set(id, [unit]);
  };
  for (const unit of units) {
    for (const id of unit.parentIds) push(unitsAsParent, id, unit);
    for (const id of unit.childIds) push(unitsAsChild, id, unit);
  }
  return { unitsAsParent, unitsAsChild };
}

/** Spouses, siblings, parents, and children are all derived from unit co-membership. */
export function getDerivedRelations(
  personId: string,
  people: Person[],
  units: FamilyUnit[],
): DerivedRelations {
  const byId = new Map(people.map((p) => [p.id, p]));
  const { unitsAsParent, unitsAsChild } = buildFamilyGraph(units);

  const collect = (ids: Iterable<string>): Person[] => {
    const seen = new Set<string>();
    const result: Person[] = [];
    for (const id of ids) {
      if (id === personId || seen.has(id)) continue;
      seen.add(id);
      const person = byId.get(id);
      if (person) result.push(person);
    }
    return result;
  };

  const asChild = unitsAsChild.get(personId) ?? [];
  const asParent = unitsAsParent.get(personId) ?? [];

  return {
    parents: collect(asChild.flatMap((u) => u.parentIds)),
    siblings: collect(asChild.flatMap((u) => u.childIds)),
    spouses: collect(asParent.flatMap((u) => u.parentIds)),
    children: collect(asParent.flatMap((u) => u.childIds)),
  };
}
