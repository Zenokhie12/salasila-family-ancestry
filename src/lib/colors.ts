import type { LineageSide } from '../models/types';

/** Lineage color-coding: maternal = maroon, paternal = dark blue. */
export const LINEAGE_COLORS: Record<LineageSide, string> = {
  root: '#2E7D32',
  maternal: '#800000',
  paternal: '#00008B',
  unknown: '#5B5B66',
};

export const LINEAGE_LABELS: Record<LineageSide, string> = {
  root: 'Immediate family',
  maternal: 'Maternal side',
  paternal: 'Paternal side',
  unknown: 'Unlinked',
};

export const UI = {
  background: '#F7F5F1',
  card: '#FFFFFF',
  border: '#E3DFD7',
  text: '#221E19',
  subtleText: '#6E675E',
  accent: '#7A5C3E',
  danger: '#B3261E',
  onDark: '#FFFFFF',
};
