// Kayan başparmaklı ortak seçici (iOS segmented control dili). Seçili öğenin altındaki başparmak
// yayla kayar. Ana ekrandaki mod seçici ve Sözlük sekmeleri kullanır.
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { Text } from "./AppText";
import { useTheme } from "../../context/ThemeContext";
import { Springs } from "../../constants/motion";
import { shadow } from "../../constants/design";
import * as haptics from "../../lib/haptics";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type SegmentItem<K extends string> = {
  key: K;
  label: string;
  icon?: IconName;
  iconActive?: IconName;
};

type Props<K extends string> = {
  items: SegmentItem<K>[];
  value: K;
  onChange: (key: K) => void;
  /** onPrimary: turuncu başlık üstünde (Sözlük). */
  tone?: "surface" | "onPrimary";
  /** stacked: simge yazının üstünde (uzun etiketler için). */
  layout?: "inline" | "stacked";
  style?: StyleProp<ViewStyle>;
};

const PAD = 4;

export default function SegmentedControl<K extends string>({ items, value, onChange, tone = "surface", layout = "inline", style }: Props<K>) {
  const { colors, isDark } = useTheme();
  const reduce = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, items.findIndex((i) => i.key === value));
  const segW = width > 0 ? (width - PAD * 2) / items.length : 0;
  const x = useSharedValue(0);
  const first = React.useRef(true);

  useEffect(() => {
    if (!segW) return;
    const to = index * segW;
    if (first.current || reduce) {
      x.value = to;
      first.current = false;
    } else {
      x.value = withSpring(to, Springs.smooth);
    }
  }, [index, segW, reduce, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onPrimary = tone === "onPrimary";
  const trackBg = onPrimary ? "rgba(255,255,255,0.16)" : isDark ? colors.gray[200] : colors.gray[100];
  const thumbBg = onPrimary ? "#FFFFFF" : isDark ? colors.gray[300] : colors.card;
  const activeColor = onPrimary ? colors.primaryDeep : isDark ? colors.text : colors.secondary;
  const idleColor = onPrimary ? "rgba(255,255,255,0.85)" : colors.gray[500];

  return (
    <View
      style={[styles.track, { backgroundColor: trackBg }, style]}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
    >
      {segW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { width: segW, backgroundColor: thumbBg },
            !onPrimary && !isDark ? shadow("sm", isDark) : null,
            thumbStyle,
          ]}
        />
      ) : null}
      {items.map((it) => {
        const active = it.key === value;
        const icon = active ? it.iconActive ?? it.icon : it.icon;
        return (
          <Pressable
            key={it.key}
            style={[styles.segment, layout === "stacked" && styles.segmentStacked]}
            onPress={() => {
              if (!active) {
                haptics.selection();
                onChange(it.key);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={it.label}
          >
            {icon ? <Ionicons name={icon} size={17} color={active ? activeColor : idleColor} /> : null}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={layout === "stacked" ? 0.72 : 0.8}
              maxFontSizeMultiplier={1.2}
              style={[styles.label, { color: active ? activeColor : idleColor }, active && styles.labelActive]}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: 14,
    padding: PAD,
  },
  thumb: {
    position: "absolute",
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: 10,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  segmentStacked: {
    flexDirection: "column",
    gap: 3,
    paddingVertical: 8,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    flexShrink: 1,
  },
  labelActive: {
    fontWeight: "700",
  },
});
