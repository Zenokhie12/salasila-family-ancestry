import type { FamilyUnit, Person } from '../models/types';
import { buildFamilyGraph } from './familyGraph';

export const NODE_WIDTH = 132;
export const NODE_HEIGHT = 64;
const H_GAP = 28;
const V_GAP = 96;
const PADDING = 80;

export interface TreeNodeLayout {
  person: Person;
  /** top-left corner in canvas coordinates */
  x: number;
  y: number;
}

export interface TreeEdgeLayout {
  id: string;
  /** SVG path data */
  d: string;
  kind: 'spouse' | 'parent-child';
}

export interface TreeLayoutResult {
  nodes: TreeNodeLayout[];
  edges: TreeEdgeLayout[];
  width: number;
  height: number;
  /** canvas-space center of the root user's node, for initial centering */
  rootCenter: { x: number; y: number } | null;
}

const EMPTY: TreeLayoutResult = { nodes: [], edges: [], width: 0, height: 0, rootCenter: null };

/**
 * Generation-band layout: BFS from the root assigns each person a generation
 * (ancestors negative, descendants positive); within a band people are ordered
 * by the barycenter of their parents' positions (children sit under their
 * parents, spouses attach beside their partner), falling back to lineage side
 * so the paternal family leans left and the maternal family right.
 */
export function computeTreeLayout(people: Person[], units: FamilyUnit[]): TreeLayoutResult {
  if (people.length === 0) return EMPTY;

  const byId = new Map(people.map((p) => [p.id, p]));
  const { unitsAsParent, unitsAsChild } = buildFamilyGraph(units);

  // 1. Generations, BFS out from the root user (or an arbitrary person).
  const root = people.find((p) => p.isRoot) ?? people[0];
  const generation = new Map<string, number>([[root.id, 0]]);
  const queue = [root.id];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const gen = generation.get(id)!;
    const visit = (nextId: string, nextGen: number) => {
      if (byId.has(nextId) && !generation.has(nextId)) {
        generation.set(nextId, nextGen);
        queue.push(nextId);
      }
    };
    for (const unit of unitsAsParent.get(id) ?? []) {
      for (const p of unit.parentIds) visit(p, gen);
      for (const c of unit.childIds) visit(c, gen + 1);
    }
    for (const unit of unitsAsChild.get(id) ?? []) {
      for (const p of unit.parentIds) visit(p, gen - 1);
      for (const c of unit.childIds) visit(c, gen);
    }
  }
  // People not connected to the root yet are parked below the deepest band.
  const deepest = Math.max(...generation.values());
  for (const person of people) {
    if (!generation.has(person.id)) generation.set(person.id, deepest + 1);
  }

  // 2. Horizontal ordering, most ancestral band first.
  const lineageBias: Record<string, number> = { paternal: -1, root: 0, unknown: 1, maternal: 2 };
  const slot = NODE_WIDTH + H_GAP;
  const centerX = new Map<string, number>();
  const bands = [...new Set(generation.values())].sort((a, b) => a - b);

  for (const band of bands) {
    const members = people.filter((p) => generation.get(p.id) === band);
    const sortKey = new Map<string, number>();

    for (const person of members) {
      const parentXs = (unitsAsChild.get(person.id) ?? [])
        .flatMap((u) => u.parentIds)
        .map((id) => centerX.get(id))
        .filter((x): x is number => x !== undefined);
      if (parentXs.length > 0) {
        sortKey.set(person.id, parentXs.reduce((a, b) => a + b, 0) / parentXs.length);
      }
    }
    // Spouses with no parents in the tree sort just beside their partner.
    for (const person of members) {
      if (sortKey.has(person.id)) continue;
      for (const unit of unitsAsParent.get(person.id) ?? []) {
        const partner = unit.parentIds.find((id) => id !== person.id && sortKey.has(id));
        if (partner) {
          sortKey.set(person.id, sortKey.get(partner)! + 1);
          break;
        }
      }
    }
    for (const person of members) {
      if (!sortKey.has(person.id)) {
        sortKey.set(person.id, (lineageBias[person.lineage ?? 'unknown'] ?? 1) * 10_000);
      }
    }

    members.sort(
      (a, b) =>
        sortKey.get(a.id)! - sortKey.get(b.id)! || a.fullName.localeCompare(b.fullName),
    );
    members.forEach((person, i) => {
      centerX.set(person.id, (i - (members.length - 1) / 2) * slot);
    });
  }

  // 3. Normalize to positive canvas coordinates.
  const minBand = bands[0];
  const allX = [...centerX.values()];
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const nodeCenter = (id: string) => ({
    x: centerX.get(id)! - minX + PADDING + NODE_WIDTH / 2,
    y: (generation.get(id)! - minBand) * (NODE_HEIGHT + V_GAP) + PADDING + NODE_HEIGHT / 2,
  });

  const nodes: TreeNodeLayout[] = people.map((person) => {
    const c = nodeCenter(person.id);
    return { person, x: c.x - NODE_WIDTH / 2, y: c.y - NODE_HEIGHT / 2 };
  });

  // 4. Edges per family unit: a spouse line between parents, then an elbow
  //    from the couple's midpoint down to each child.
  const edges: TreeEdgeLayout[] = [];
  for (const unit of units) {
    const parents = unit.parentIds.filter((id) => byId.has(id)).map(nodeCenter);
    const children = unit.childIds.filter((id) => byId.has(id));

    if (parents.length === 2) {
      edges.push({
        id: `${unit.id}-spouse`,
        kind: 'spouse',
        d: `M ${parents[0].x} ${parents[0].y} L ${parents[1].x} ${parents[1].y}`,
      });
    }
    if (children.length === 0) continue;

    let anchorX: number;
    let anchorY: number;
    if (parents.length > 0) {
      anchorX = parents.reduce((sum, p) => sum + p.x, 0) / parents.length;
      anchorY = parents[0].y + NODE_HEIGHT / 2;
    } else {
      // Parentless sibling unit: hang a bracket just above the children.
      const childCenters = children.map(nodeCenter);
      anchorX = childCenters.reduce((sum, c) => sum + c.x, 0) / childCenters.length;
      anchorY = childCenters[0].y - NODE_HEIGHT / 2 - V_GAP / 2;
    }
    for (const childId of children) {
      const child = nodeCenter(childId);
      const elbowY = child.y - NODE_HEIGHT / 2 - V_GAP / 2;
      edges.push({
        id: `${unit.id}-${childId}`,
        kind: 'parent-child',
        d: `M ${anchorX} ${anchorY} V ${elbowY} H ${child.x} V ${child.y - NODE_HEIGHT / 2}`,
      });
    }
  }

  const rootCenterPos = nodeCenter(root.id);
  return {
    nodes,
    edges,
    width: maxX - minX + NODE_WIDTH + PADDING * 2,
    height: (bands.length - 1) * (NODE_HEIGHT + V_GAP) + NODE_HEIGHT + PADDING * 2,
    rootCenter: root.isRoot ? rootCenterPos : null,
  };
}
