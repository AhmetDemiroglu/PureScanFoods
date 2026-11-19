// Sekme sayfalarının ortak turuncu başlığı (Beslenme, Sözlük, Ayarlar, Guru). Önceden her ekranda
// ayrı kopyaydı ve ölçüleri birbirinden kaymıştı. Davranış aynı: geri ana ekrana döner (router.replace),
// info turu yeniden açar, geçmiş çekmeceyi açar. Ek içerik (profil kartı, sekmeler) children ile gelir.
//
// Düğmeler kenardan EDGE_SAFE_INSET kadar içeride: sağ ve sol 24 pt kenar şeritleri (geçmiş çekmecesi,
// ana ekrana dönüş) düğmelerin üstüne binmez.
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "./AppText";
import { useTheme } from "../../context/ThemeContext";
import { EDGE_SAFE_INSET, Radii } from "../../constants/design";
import * as haptics from "../../lib/haptics";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TargetProps = { ref: (node: View | null) => void; collapsable: false };

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onHistory?: () => void;
  onInfo?: () => void;
  /** Info düğmesi tur hedefiyse (Sözlük). */
  infoTarget?: TargetProps;
  /** Ek düğmeler (Guru: sohbeti temizle). Geçmiş düğmesinden sonra gelir. */
  actions?: { icon: IconName; onPress: () => void; label: string }[];
  /** Başlık satırının altında, turuncu alanın içinde duran içerik. */
  children?: React.ReactNode;
};

const BTN = 40;

function HeaderButton({
  onPress,
  label,
  children,
  small,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={small ? 8 : 4}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, small && styles.btnSmall, pressed && styles.btnPressed]}
    >
      {children}
    </Pressable>
  );
}

export default function PageHeader({ title, subtitle, onBack, onHistory, onInfo, infoTarget, actions, children }: Props) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // Turuncu başlık üstünde durum çubuğu hep açık renk. Ekran odaktayken bağlanır: sekme ekranları
  // açık kaldığı için en son bağlanan kazanır, odak dönünce kök düzenin tema rengi geri gelir.
  const focused = useIsFocused();

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, { paddingTop: insets.top + 8 }]}
    >
      {focused ? <StatusBar style="light" /> : null}
      {/* Sağ üstten düşen yumuşak ışık: düz turuncu şerit yerine derinliği olan yüzey. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="pageHeaderLight" cx="88%" cy="0%" r="75%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDark ? 0.14 : 0.22} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#pageHeaderLight)" />
        </Svg>
      </View>

      <View style={styles.row}>
        <HeaderButton onPress={onBack} label="Back">
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </HeaderButton>

        <View style={styles.titleArea}>
          <Text variant="display" style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2} maxFontSizeMultiplier={1.2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {onInfo ? (
          <View {...(infoTarget ?? {})}>
            <HeaderButton onPress={onInfo} label="Tips" small>
              <Ionicons name="information-circle-outline" size={19} color="rgba(255,255,255,0.9)" />
            </HeaderButton>
          </View>
        ) : null}

        {onHistory ? (
          <HeaderButton
            onPress={() => {
              haptics.impactLight();
              onHistory();
            }}
            label="History"
          >
            <MaterialCommunityIcons name="history" size={22} color="#FFF" />
          </HeaderButton>
        ) : null}

        {actions?.map((a) => (
          <HeaderButton key={a.label} onPress={a.onPress} label={a.label}>
            <Ionicons name={a.icon} size={21} color="#FFF" />
          </HeaderButton>
        ))}
      </View>

      {children ? <View style={styles.extra}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: 18,
    borderBottomLeftRadius: Radii.sheet,
    borderBottomRightRadius: Radii.sheet,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: EDGE_SAFE_INSET - 2,
    gap: 8,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.32)",
  },
  btnSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  btnPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },
  title: {
    fontSize: 26,
    lineHeight: 31,
    color: "#FFF",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 16,
    color: "rgba(255,255,255,0.84)",
    marginTop: 1,
  },
  extra: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
