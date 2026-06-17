import React, { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View, BackHandler } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  clamp,
  Extrapolation,
} from "react-native-reanimated";
import { useShell } from "../../context/ShellContext";
import { useTheme } from "../../context/ThemeContext";
import { Springs } from "../../constants/motion";
import * as haptics from "../../lib/haptics";
import HistoryDrawerBody from "./HistoryDrawerBody";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;
const EDGE_STRIP_WIDTH = 24;

/**
 * X/Twitter tarzı global history slide-over.
 * Mimari: 3 katman, tek `progress` shared value (0=kapalı, 1=açık).
 *  - Layer 0: Drawer (SAĞA pinli, altta sabit) — HistoryDrawerBody
 *  - Layer 1: Ana içerik (root Stack) — SOLA kayar + küçülür + gölge + yuvarlak köşe
 *  - Layer 2: Scrim (ana içerik üstünde) — tap/swipe-to-close
 *  - Layer 3: Sağ kenar şeridi — kapalıyken sola sürükleyerek açma
 *
 * GGHub AppSidebar deseninin sağ-kenar mirror'ı.
 * NOT: RN <Modal> bileşenleri bu ağacın ÜSTÜNDE ayrı pencerede açılır; yaprak
 * transform'undan etkilenmezler. İleride bir Modal'a GHG gesture'ı eklenirse o
 * Modal kendi <GestureHandlerRootView>'ını sarmalı.
 */
interface AppShellSidebarProps {
  children: React.ReactNode;
}

export function AppShellSidebar({ children }: AppShellSidebarProps) {
  const { colors } = useTheme();
  const { isSidebarOpen, openSidebar, closeSidebar } = useShell();

  const progress = useSharedValue(0);

  // Açık/kapalı state'ini animasyona senkronla (buton ile açma/kapama)
  useEffect(() => {
    progress.value = withSpring(isSidebarOpen ? 1 : 0, Springs.smooth);
  }, [isSidebarOpen, progress]);

  // Android donanım geri tuşu — açıkken kapat
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isSidebarOpen) {
        closeSidebar();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [isSidebarOpen, closeSidebar]);

  // AÇMA — sağ kenardan sola sürükle
  const openPan = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isSidebarOpen)
        .activeOffsetX(-12)
        .failOffsetY([-14, 14])
        .onUpdate((e) => {
          "worklet";
          progress.value = clamp(-e.translationX / SIDEBAR_WIDTH, 0, 1);
        })
        .onEnd((e) => {
          "worklet";
          const shouldOpen = progress.value > 0.4 || e.velocityX < -650;
          if (shouldOpen) {
            progress.value = withSpring(1, Springs.smooth);
            runOnJS(openSidebar)();
            runOnJS(haptics.impactLight)();
          } else {
            progress.value = withSpring(0, Springs.smooth);
          }
        }),
    [isSidebarOpen, progress, openSidebar]
  );

  // KAPATMA — ana içerik (scrim) üzerinde sağa sürükle
  const closePan = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(isSidebarOpen)
        .activeOffsetX(12)
        .failOffsetY([-14, 14])
        .onUpdate((e) => {
          "worklet";
          progress.value = clamp(1 - e.translationX / SIDEBAR_WIDTH, 0, 1);
        })
        .onEnd((e) => {
          "worklet";
          const shouldClose = progress.value < 0.6 || e.velocityX > 650;
          if (shouldClose) {
            progress.value = withSpring(0, Springs.smooth);
            runOnJS(closeSidebar)();
            runOnJS(haptics.selection)();
          } else {
            progress.value = withSpring(1, Springs.smooth);
          }
        }),
    [isSidebarOpen, progress, closeSidebar]
  );

  // Tap-to-close Pressable ile uyumlu olması için Native ile birleştir
  const closeGesture = Gesture.Simultaneous(closePan, Gesture.Native());

  // Drawer: hafif parallax + fade
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [40, 0], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(progress.value, [0, 0.25, 1], [0, 0.5, 1], Extrapolation.CLAMP),
  }));

  // Ana içerik: sola kay + küçül + gölge
  const mainStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, -SIDEBAR_WIDTH], Extrapolation.CLAMP) },
      { scale: interpolate(progress.value, [0, 1], [1, 0.92], Extrapolation.CLAMP) },
    ],
    shadowOpacity: interpolate(progress.value, [0, 1], [0, 0.22], Extrapolation.CLAMP),
    elevation: interpolate(progress.value, [0, 1], [0, 16], Extrapolation.CLAMP),
  }));

  // borderRadius: hem gölge (dış) hem clip (iç) katmanında — iOS gölge clipping fix
  const radiusStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(progress.value, [0, 1], [0, 18], Extrapolation.CLAMP),
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.42], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {/* Layer 0: Drawer (sağa pinli, altta) */}
      <Animated.View style={[styles.drawer, { width: SIDEBAR_WIDTH }, drawerStyle]}>
        <HistoryDrawerBody />
      </Animated.View>

      {/* Layer 1: Ana içerik (sola kayan + scale + gölge) */}
      <Animated.View style={[styles.main, mainStyle, radiusStyle, { backgroundColor: colors.surface }]}>
        <Animated.View style={[styles.mainClip, radiusStyle, { backgroundColor: colors.surface }]}>
          {children}

          {/* Layer 2: Scrim (tap/swipe-to-close) */}
          <GestureDetector gesture={closeGesture}>
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}
              pointerEvents={isSidebarOpen ? "auto" : "none"}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>

      {/* Layer 3: Sağ kenar açma şeridi (kapalıyken) */}
      {!isSidebarOpen && (
        <GestureDetector gesture={openPan}>
          <View style={styles.edgeStrip} />
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    overflow: "hidden",
  },
  main: {
    flex: 1,
    zIndex: 2,
    shadowColor: "#000",
    shadowRadius: 24,
    shadowOffset: { width: 4, height: 0 },
  },
  mainClip: { flex: 1, overflow: "hidden" },
  scrim: { zIndex: 3, backgroundColor: "#000" },
  edgeStrip: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: EDGE_STRIP_WIDTH,
    zIndex: 4,
  },
});

export default AppShellSidebar;
