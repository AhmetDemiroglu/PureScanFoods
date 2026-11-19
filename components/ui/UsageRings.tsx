// Haftalık haklar: tek satırda dört küçük ilerleme halkası (Ayarlar profil kartı ve AuthModal profil
// görünümü). Önceden iki ekranda kopya 2x2 büyük kutuydu. Değerler ve tükenme kuralları aynı kaldı,
// tek yerde: buildWeeklyRights. Halka kalan hakkı gösterir; dolu halka = hepsi duruyor.
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./AppText";
import { useTheme } from "../../context/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type UsageRingState = "normal" | "exhausted" | "unlimited" | "locked";

export type UsageRingItem = {
  key: string;
  label: string;
  /** Halkanın ortasındaki metin (kalan sayı, "0/1", sonsuz). */
  value: string;
  /** 0..1 arası dolgu. */
  fill: number;
  state: UsageRingState;
};

type UsageStatsLike = {
  scanCount: number;
  scanLimit: number;
  aiChatCount: number;
  aiChatLimit: number;
  imageGenCount: number;
  imageGenLimit: number;
};

const UNLIMITED = String.fromCharCode(8734);

const ratio = (part: number, whole: number) => {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return 0;
  return Math.max(0, Math.min(1, part / whole));
};

/**
 * Ayarlar ekranındaki eski hesapla birebir: tarama ve sohbet kalan hakkı, aile kullanılan/sınır,
 * görsel premiumda kalan hak, ücretsizde PRO. Tükenme kuralları da aynı.
 */
export function buildWeeklyRights({
  isPremium,
  usageStats,
  familyMembersLength,
  labels,
}: {
  isPremium: boolean;
  usageStats: UsageStatsLike;
  familyMembersLength: number | undefined;
  labels: { scan: string; chat: string; family: string; image: string };
}): UsageRingItem[] {
  const scanRemaining = Math.max(0, usageStats.scanLimit - usageStats.scanCount);
  const chatRemaining = Math.max(0, usageStats.aiChatLimit - usageStats.aiChatCount);
  const familyCount = Math.max(0, (familyMembersLength || 1) - 1);
  const familyLimitNum = isPremium ? Infinity : 1;
  const familyLimitDisplay = isPremium ? UNLIMITED : "1";
  const imageRemaining = Math.max(0, usageStats.imageGenLimit - usageStats.imageGenCount);

  const isScanExhausted = !isPremium && scanRemaining === 0;
  const isChatExhausted = !isPremium && chatRemaining === 0;
  const isFamilyExhausted = !isPremium && familyCount >= familyLimitNum;
  const isImageExhausted = isPremium && imageRemaining === 0;

  return [
    {
      key: "scan",
      label: labels.scan,
      value: isPremium ? UNLIMITED : String(scanRemaining),
      fill: isPremium ? 1 : ratio(scanRemaining, usageStats.scanLimit),
      state: isPremium ? "unlimited" : isScanExhausted ? "exhausted" : "normal",
    },
    {
      key: "chat",
      label: labels.chat,
      value: isPremium ? UNLIMITED : String(chatRemaining),
      fill: isPremium ? 1 : ratio(chatRemaining, usageStats.aiChatLimit),
      state: isPremium ? "unlimited" : isChatExhausted ? "exhausted" : "normal",
    },
    {
      key: "family",
      label: labels.family,
      value: `${familyCount}/${familyLimitDisplay}`,
      fill: isPremium ? 1 : ratio(1 - familyCount, 1),
      state: isPremium ? "unlimited" : isFamilyExhausted ? "exhausted" : "normal",
    },
    {
      key: "image",
      label: labels.image,
      value: isPremium ? String(imageRemaining) : "PRO",
      fill: isPremium ? ratio(imageRemaining, usageStats.imageGenLimit) : 0,
      state: !isPremium ? "locked" : isImageExhausted ? "exhausted" : "normal",
    },
  ];
}

function Ring({ item, index, size, stroke }: { item: UsageRingItem; index: number; size: number; stroke: number }) {
  const { colors, isDark } = useTheme();
  const reduce = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(1, Number.isFinite(item.fill) ? item.fill : 0));

  const progress = useSharedValue(reduce ? target : 0);

  // Veri ilk çizimden sonra gelir (usageStats): değer değişince de yeniden dolar.
  useEffect(() => {
    if (reduce) {
      progress.value = target;
      return;
    }
    progress.value = withDelay(
      120 + index * 90,
      withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [target, reduce, index, progress]);

  const arcProps = useAnimatedProps(() => {
    const len = progress.value * circumference;
    // Yuvarlak uçlu sıfır uzunluklu çizgi nokta bırakır: boşken gizle.
    return { strokeDasharray: [len, circumference - len], strokeOpacity: len < 0.5 ? 0 : 1 };
  });

  const exhausted = item.state === "exhausted";
  const locked = item.state === "locked";
  // Tükenen hak: halkanın tamamı kırmızı (iz yerine düz kırmızı çizgi).
  const trackColor = exhausted
    ? colors.error
    : locked
      ? isDark
        ? "rgba(255,255,255,0.10)"
        : "rgba(42,31,24,0.08)"
      : isDark
        ? "rgba(255,139,61,0.16)"
        : "rgba(242,96,12,0.12)";
  const valueColor = exhausted ? colors.error : item.state === "unlimited" ? colors.primary : colors.text;
  const gradId = `usageRing_${item.key}`;
  const isUnlimitedGlyph = item.value === UNLIMITED;
  const fontSize = isUnlimitedGlyph ? Math.round(size * 0.42) : Math.round(size * (item.value.length > 2 ? 0.28 : 0.36));

  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.primaryDeep} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeOpacity={exhausted ? 0.85 : 1}
          strokeWidth={stroke}
        />
        {!locked && !exhausted ? (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDashoffset={0}
            animatedProps={arcProps}
            transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          />
        ) : null}
      </Svg>

      {locked ? (
        <>
          <Ionicons name="lock-closed" size={Math.round(size * 0.32)} color={colors.gray[500]} />
          <View style={[styles.proPill, { backgroundColor: colors.primary, borderColor: colors.card }]}>
            <Text style={styles.proText} maxFontSizeMultiplier={1}>
              PRO
            </Text>
          </View>
        </>
      ) : (
        <View style={[styles.valueBox, { width: size - stroke * 2 - 4 }]}>
          <Text
            variant="display"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
            maxFontSizeMultiplier={1.05}
            style={[
              styles.value,
              {
                color: valueColor,
                fontSize,
                lineHeight: Math.round(fontSize * 1.18),
                marginTop: isUnlimitedGlyph ? -2 : 0,
              },
            ]}
          >
            {item.value}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function UsageRings({ items, size = 48, stroke = 4.5 }: { items: UsageRingItem[]; size?: number; stroke?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <View
          key={item.key}
          style={styles.col}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
        >
          <Ring item={item} index={index} size={size} stroke={stroke} />
          <Text
            style={[styles.label, { color: item.state === "exhausted" ? colors.error : colors.textMuted }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  col: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  valueBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    textAlign: "center",
    letterSpacing: -0.3,
  },
  proPill: {
    position: "absolute",
    bottom: -7,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  proText: {
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.6,
  },
  label: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
