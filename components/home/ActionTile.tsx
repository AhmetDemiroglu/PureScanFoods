// Ana ekranın küçük eylem kartı (Barkod, Galeri, Yazarak). Tek dokunuşla ilgili yolu açar.
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import { Springs } from "../../constants/motion";
import { shadow } from "../../constants/design";
import * as haptics from "../../lib/haptics";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IconName;
  label: string;
  height: number;
  onPress: () => void;
  /** dark: koyu kart (barkod), diğerleri açık. */
  tone?: "light" | "dark";
};

export default function ActionTile({ icon, label, height, onPress, tone = "light" }: Props) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const darkTile = tone === "dark";
  const compact = height < 80;

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Pressable
        onPress={() => {
          haptics.selection();
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.95, Springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Springs.bouncy);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.tile,
          { height },
          darkTile
            ? { backgroundColor: isDark ? colors.gray[300] : colors.secondary }
            : {
                backgroundColor: colors.card,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? colors.border : "rgba(42,31,24,0.08)",
              },
          !isDark ? shadow("sm", isDark) : null,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            compact && styles.iconWrapCompact,
            { backgroundColor: darkTile ? "rgba(255,255,255,0.12)" : isDark ? "rgba(255,139,61,0.16)" : "#FFF1E6" },
          ]}
        >
          <Ionicons name={icon} size={compact ? 18 : 21} color={darkTile ? "#FFFFFF" : colors.primary} />
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={1.25}
          style={[styles.label, { color: darkTile ? "#FFFFFF" : colors.text }]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
  },
  tile: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 6,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
