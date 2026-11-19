// Yüzen cam alt bar (iOS 26 sekme çubuğu dili). Geometri ve katmanlar Ahmet'in onayladığı Anıl Boya
// alt barından: kapsül kenarlardan ayrı, güvenli alanın üstünde yüzer, içerik altından akar; ortadaki
// tarama düğmesi kapsülün üst kenarından taşar ve kırpılmasın diye kapsülle kardeş katmanda durur.
//
// Kenar şeritleri: AppShellSidebar ekranın sağ ve sol 24 pt'ini tüm yükseklikte tutar (geçmiş çekmecesi,
// ana ekrana dönüş). Kapsül EDGE_SAFE_INSET (28 pt) içeride başlar; hiçbir sekme şeridin altında kalmaz.
//
// Bar içeriğin ÜSTÜNDE yüzer (position absolute). Kapladığı yüksekliği React Navigation'a bildirir;
// ekranlar useBottomTabBarHeight ile o kadar alt boşluk bırakır.

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Keyboard, LayoutChangeEvent, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Text } from "../ui/AppText";
import GlassSurface, { hasNativeGlass } from "../ui/GlassSurface";
import { useTheme } from "../../context/ThemeContext";
import { useTourTarget } from "../tour/TourContext";
import { Springs } from "../../constants/motion";
import { EDGE_GESTURE_WIDTH, TabBarGeometry as G, glassTint, tabBarOccupiedHeight } from "../../constants/design";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, { idle: IconName; active: IconName }> = {
  nutrition: { idle: "nutrition-outline", active: "nutrition" },
  guru: { idle: "chatbubbles-outline", active: "chatbubbles" },
  encyclopedia: { idle: "book-outline", active: "book" },
  settings: { idle: "settings-outline", active: "settings" },
};

const SCAN_ROUTE = "index";
const SCAN_RING = 3;
const SCAN_SLOT = G.scanSize + 14;

function TabCell({
  routeName,
  label,
  focused,
  narrow,
  onPress,
  onLongPress,
  onLayout,
}: {
  routeName: string;
  label: string;
  focused: boolean;
  narrow: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const { colors, isDark } = useTheme();
  const tint = glassTint(colors, isDark);
  const target = useTourTarget(`tab.${routeName}`);
  const scale = useSharedValue(1);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const icon = ICONS[routeName] ?? { idle: "ellipse-outline", active: "ellipse" };

  return (
    <Pressable
      onLayout={onLayout}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.86, Springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Springs.bouncy);
      }}
      style={styles.cell}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
    >
      {/* Tur hedefi simge + yazıyı birlikte kapsar: vurgu sekmenin tamamına oturur. */}
      <View {...target} style={styles.cellInner}>
        <Animated.View style={iconStyle}>
          <Ionicons
            name={focused ? icon.active : icon.idle}
            size={23}
            color={focused ? colors.primary : tint.idleIcon}
          />
        </Animated.View>
        <Text
          numberOfLines={1}
          // Etiketler birbirinden farklı boyda görünmesin: büyütme sınırı düşük, otomatik küçültme yok.
          maxFontSizeMultiplier={narrow ? 1 : 1.05}
          style={[styles.label, narrow && styles.labelNarrow, { color: focused ? colors.primary : colors.textMuted }, focused && styles.labelActive]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ScanButton({ focused, onPress, onLongPress }: { focused: boolean; onPress: () => void; onLongPress: () => void }) {
  const { colors, isDark } = useTheme();
  const target = useTourTarget("tab.scan");
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      {...target}
      style={[
        styles.scanFab,
        {
          backgroundColor: colors.primary,
          borderColor: isDark ? colors.gray[100] : colors.surface,
          shadowColor: colors.primaryDeep,
          shadowOpacity: isDark ? 0.3 : focused ? 0.45 : 0.32,
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, Springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Springs.bouncy);
        }}
        style={styles.scanInner}
        accessibilityRole="button"
        accessibilityLabel="Scan"
        accessibilityState={{ selected: focused }}
      >
        <LinearGradient
          colors={["#FF8A3D", colors.primary, colors.primaryDeep]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Üst yarıda ışık: düğme cam üstünde kabarık, ışık alan bir yüzey gibi durur. */}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.32)", "rgba(255,255,255,0)"]}
          style={styles.scanShine}
        />
        <Ionicons name="scan" size={26} color="#FFF" />
      </Pressable>
    </Animated.View>
  );
}

export default function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const tint = glassTint(colors, isDark);
  const reduce = useReducedMotion();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  // Dar ekranda (ör. 320 pt) sekme hücresi ~45 pt kalıyor, "Beslenme" sığmıyordu: kapsül kenara biraz
  // yaklaşır (yine kenar şeridinin dışında), orta yuva daralır, etiketler hep aynı küçük boyda.
  const { width: winW } = useWindowDimensions();
  // 380 altı: 360 pt telefonda da hücre ~55 pt, "Beslenme" 10,5 boyutta sığmıyordu.
  const narrow = winW < 380;
  const occupied = tabBarOccupiedHeight(insets.bottom);
  const capsuleBottom = occupied - G.capsuleHeight;

  // İçerik bu kadar alt boşluk bırakır (kapsülün üst kenarı). Taşan tarama düğmesi sayılmaz:
  // altından içerik akabilir, düğmenin iki yanı boştur.
  useEffect(() => {
    reportHeight?.(occupied);
  }, [occupied, reportHeight]);

  // Android adjustResize: klavye açılınca pencere kısalır, bar klavyenin üstüne çıkardı. Gizlenir.
  const [kbVisible, setKbVisible] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const s = Keyboard.addListener("keyboardDidShow", () => setKbVisible(true));
    const h = Keyboard.addListener("keyboardDidHide", () => setKbVisible(false));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  // Kayan aktif hap: her sekme hücresinin konumu ölçülür, hap odaktaki hücreye yayla akar.
  const [cells, setCells] = useState<Record<string, { x: number; w: number }>>({});
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);
  const pillO = useSharedValue(0);
  const focusedName = state.routes[state.index]?.name;
  const focusedCell = cells[focusedName];

  useEffect(() => {
    if (!focusedCell || focusedName === SCAN_ROUTE) {
      pillO.value = withTiming(0, { duration: 160 });
      return;
    }
    const first = pillW.value === 0;
    if (first || reduce) {
      pillX.value = focusedCell.x;
      pillW.value = focusedCell.w;
    } else {
      pillX.value = withSpring(focusedCell.x, Springs.smooth);
      pillW.value = withSpring(focusedCell.w, Springs.smooth);
    }
    pillO.value = withTiming(1, { duration: 180 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedName, focusedCell?.x, focusedCell?.w, reduce]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillO.value,
    width: pillW.value,
    transform: [{ translateX: pillX.value }],
  }));

  const items = useMemo(
    () =>
      state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const label = typeof options.title === "string" ? options.title : route.name;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });
        return { route, focused, label, onPress, onLongPress };
      }),
    [state.routes, state.index, descriptors, navigation],
  );

  if (kbVisible) return null;

  const scanItem = items.find((i) => i.route.name === SCAN_ROUTE);
  const tabItems = items.filter((i) => i.route.name !== SCAN_ROUTE);
  const half = Math.ceil(tabItems.length / 2);
  const left = tabItems.slice(0, half);
  const right = tabItems.slice(half);

  const cellLayout = (name: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setCells((c) => (c[name] && Math.abs(c[name].x - x) < 0.5 && Math.abs(c[name].w - width) < 0.5 ? c : { ...c, [name]: { x, w: width } }));
  };

  const renderCell = (it: (typeof items)[number]) => (
    <TabCell
      key={it.route.key}
      routeName={it.route.name}
      label={it.label}
      focused={it.focused}
      narrow={narrow}
      onPress={it.onPress}
      onLongPress={it.onLongPress}
      onLayout={cellLayout(it.route.name)}
    />
  );

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { height: occupied + G.scanProtrusion }]}>
      {/* Kapsülün altındaki sis: kapsül boşlukta asılı durmasın, altından akan içerik dibinde kesilmiş görünmesin. */}
      {!hasNativeGlass && (
        <LinearGradient
          pointerEvents="none"
          colors={[tint.hazeFrom, tint.hazeTo]}
          style={[styles.haze, { height: occupied }]}
        />
      )}

      <GlassSurface
        radius={G.radius}
        elevation="lg"
        dense
        style={[styles.capsule, narrow && styles.capsuleNarrow, { bottom: capsuleBottom }]}
        contentStyle={styles.capsuleContent}
      >
        {/* Hap hücrelerle aynı koordinat düzleminde: içerik katmanının ilk çocuğu. */}
        <Animated.View pointerEvents="none" style={[styles.pill, { backgroundColor: tint.activePill }, pillStyle]} />
        {left.map(renderCell)}
        {scanItem ? <View style={[styles.scanSlot, narrow && styles.scanSlotNarrow]} pointerEvents="none" /> : null}
        {right.map(renderCell)}
      </GlassSurface>

      {scanItem ? (
        <View
          pointerEvents="box-none"
          style={[styles.scanLayer, { bottom: capsuleBottom + G.capsuleHeight - G.scanSize + G.scanProtrusion }]}
        >
          <ScanButton focused={scanItem.focused} onPress={scanItem.onPress} onLongPress={scanItem.onLongPress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  haze: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  capsule: {
    position: "absolute",
    left: G.capsuleMargin,
    right: G.capsuleMargin,
    height: G.capsuleHeight,
  },
  capsuleNarrow: {
    left: EDGE_GESTURE_WIDTH + 2,
    right: EDGE_GESTURE_WIDTH + 2,
  },
  capsuleContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  pill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 0,
    borderRadius: G.radius - 6,
  },
  cell: {
    flex: 1,
    minWidth: 0,
  },
  cellInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: "700",
  },
  labelNarrow: {
    fontSize: 9.5,
    letterSpacing: -0.1,
  },
  scanSlot: {
    width: SCAN_SLOT,
  },
  scanSlotNarrow: {
    width: G.scanSize + 4,
  },
  scanLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanFab: {
    width: G.scanSize,
    height: G.scanSize,
    borderRadius: G.scanSize / 2,
    borderWidth: SCAN_RING,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    // Android: kapsülün elevation'ı 12; eşitlikte çizim sırası garanti değil, düğme üstte kalsın.
    elevation: 16,
  },
  scanInner: {
    flex: 1,
    borderRadius: G.scanSize / 2 - SCAN_RING,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  scanShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 24,
  },
});
