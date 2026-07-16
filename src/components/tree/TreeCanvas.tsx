import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { UI } from '../../lib/colors';
import type { TreeLayoutResult } from '../../lib/treeLayout';
import { useAppStore } from '../../store/appStore';
import { TreeNode } from './TreeNode';

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;

interface Props {
  layout: TreeLayoutResult;
  onPressPerson: (id: string) => void;
}

export function TreeCanvas({ layout, onPressPerson }: Props) {
  const [container, setContainer] = useState<{ width: number; height: number } | null>(null);
  const [centeredOnce, setCenteredOnce] = useState(false);
  const focusPersonId = useAppStore((s) => s.focusPersonId);
  const setFocusPersonId = useAppStore((s) => s.setFocusPersonId);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const centerOn = (x: number, y: number, animated: boolean) => {
    if (!container) return;
    const targetX = container.width / 2 - x * scale.value;
    const targetY = container.height / 2 - y * scale.value;
    translateX.value = animated ? withTiming(targetX) : targetX;
    translateY.value = animated ? withTiming(targetY) : targetY;
  };

  // Initial centering on the root user's node.
  useEffect(() => {
    if (centeredOnce || !container) return;
    const target = layout.rootCenter ?? { x: layout.width / 2, y: layout.height / 2 };
    centerOn(target.x, target.y, false);
    setCenteredOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, layout, centeredOnce]);

  // "Show in tree" requests from profile screens.
  useEffect(() => {
    if (!focusPersonId || !container) return;
    const node = layout.nodes.find((n) => n.person.id === focusPersonId);
    if (node) centerOn(node.x, node.y, true);
    setFocusPersonId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusPersonId, container, layout]);

  const pan = Gesture.Pan().onChange((e) => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  // Zoom around the pinch focal point: t' = f - k * (f - t)
  const pinch = Gesture.Pinch().onChange((e) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * e.scaleChange));
    const applied = next / scale.value;
    scale.value = next;
    translateX.value = e.focalX - applied * (e.focalX - translateX.value);
    translateY.value = e.focalY - applied * (e.focalY - translateY.value);
  });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Button zoom (mouse/desktop users have no pinch); zooms around the viewport center.
  const zoomBy = (factor: number) => {
    if (!container) return;
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * factor));
    const applied = next / scale.value;
    const cx = container.width / 2;
    const cy = container.height / 2;
    scale.value = withTiming(next);
    translateX.value = withTiming(cx - applied * (cx - translateX.value));
    translateY.value = withTiming(cy - applied * (cy - translateY.value));
  };

  const resetView = () => {
    scale.value = withTiming(1);
    const target = layout.rootCenter ?? { x: layout.width / 2, y: layout.height / 2 };
    if (container) {
      translateX.value = withTiming(container.width / 2 - target.x);
      translateY.value = withTiming(container.height / 2 - target.y);
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainer(e.nativeEvent.layout)}
    >
      <GestureDetector gesture={gesture}>
        <View style={styles.clip}>
          <Animated.View style={[{ width: layout.width, height: layout.height }, animatedStyle]}>
            <Svg width={layout.width} height={layout.height}>
              {layout.edges.map((edge) => (
                <Path
                  key={edge.id}
                  d={edge.d}
                  fill="none"
                  stroke={edge.kind === 'spouse' ? '#B99B6B' : '#A8A29A'}
                  strokeWidth={2}
                />
              ))}
              {layout.nodes.map((node) => (
                <TreeNode
                  key={node.person.id}
                  node={node}
                  onPress={() => onPressPerson(node.person.id)}
                />
              ))}
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.zoomControls}>
        <ZoomButton label="+" onPress={() => zoomBy(1.4)} />
        <ZoomButton label="−" onPress={() => zoomBy(1 / 1.4)} />
        <ZoomButton label="⌂" onPress={resetView} />
      </View>
    </View>
  );
}

function ZoomButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.zoomButton} onPress={onPress}>
      <Text style={styles.zoomLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.background },
  clip: { flex: 1, overflow: 'hidden' },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 8,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  zoomLabel: { fontSize: 20, color: UI.text },
});
