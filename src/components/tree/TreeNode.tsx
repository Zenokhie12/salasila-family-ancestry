import { G, Rect, Text as SvgText } from 'react-native-svg';

import { LINEAGE_COLORS } from '../../lib/colors';
import { NODE_HEIGHT, NODE_WIDTH, type TreeNodeLayout } from '../../lib/treeLayout';

interface Props {
  node: TreeNodeLayout;
  onPress: () => void;
}

function truncate(text: string, max = 18): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function lifeSpan(node: TreeNodeLayout): string {
  const { dateOfBirth, dateOfDeath, isDeceased } = node.person;
  const birth = dateOfBirth?.slice(0, 4);
  const death = dateOfDeath?.slice(0, 4);
  if (birth && (death || isDeceased)) return `${birth} – ${death ?? '?'}`;
  if (birth) return `b. ${birth}`;
  if (death || isDeceased) return death ? `d. ${death}` : 'deceased';
  return '';
}

export function TreeNode({ node, onPress }: Props) {
  const { person, x, y } = node;
  const fill = LINEAGE_COLORS[person.lineage ?? 'unknown'];
  const span = lifeSpan(node);
  const centerX = x + NODE_WIDTH / 2;

  return (
    <G onPress={onPress}>
      <Rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        fill={fill}
        stroke={person.isRoot ? '#FFD54F' : 'rgba(0,0,0,0.2)'}
        strokeWidth={person.isRoot ? 3 : 1}
      />
      <SvgText
        x={centerX}
        y={y + (span ? 27 : 36)}
        fill="#FFFFFF"
        fontSize={13}
        fontWeight="bold"
        textAnchor="middle"
      >
        {truncate(person.fullName)}
      </SvgText>
      {span ? (
        <SvgText
          x={centerX}
          y={y + 46}
          fill="rgba(255,255,255,0.85)"
          fontSize={11}
          textAnchor="middle"
        >
          {span}
        </SvgText>
      ) : null}
    </G>
  );
}
