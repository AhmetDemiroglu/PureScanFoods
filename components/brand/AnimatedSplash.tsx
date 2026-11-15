// Hareketli açılış ekranı. Yerel açılış ekranının (SplashScreen.storyboard) ilk karesiyle birebir aynı
// başlar, böylece geçiş görünmez. Sonra:
//   1. Tarama çubuğu portakalın üstünden altına tarar, arkasında ışık bandı bırakır.
//   2. Yaprak hafifçe sallanır, simge yukarı kayıp küçülür.
//   3. "PureScan" yazısı soldan sağa, önünde turuncu bir tarama çizgisiyle açılır, "FOODS" belirir.
//   4. Uygulama hazırsa ekran hafif büyüyerek kaybolur.
// Ölçüler storyboard ile ortak: simge genişliği ekranın %44'ü, en fazla 220 pt (splashMarkSize).
// Renkler SİSTEM temasını izler (uygulama teması değil): yerel açılış ekranı da sistem temasıyla açılıyor.

import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SPLASH_SVG,
  SPLASH_BACKGROUNDS,
  PURESCAN_ASPECT,
  FOODS_ASPECT,
  FOODS_WIDTH_RATIO,
} from "./splashSvgs";

/**
 * Simge ölçüsü, yerel açılış ekranıyla aynı:
 * iOS: storyboard kısıtı (genişliğin %44'ü, en fazla 220 pt).
 * Android: sistem açılış simgesi sabit 180dp (splashscreen_icon: 288dp tuval, 180dp kutu).
 */
export const splashMarkSize = (screenWidth: number) =>
  Platform.OS === "android" ? 180 : Math.min(screenWidth * 0.44, 220);

// Zamanlama (ms)
const T = {
  sweepStart: 150,
  sweepUp: 260,
  sweepDown: 460,
  sweepBack: 240,
  leaf: 960,
  markMove: 1060,
  textStart: 1330,
  textDur: 560,
  foods: 1720,
  introDone: 2150,
  exit: 320,
};

const MARK_FINAL_SCALE = 0.78;

type Props = {
  /** Uygulama hazır mı (tema, fontlar). Hazır olmadan çıkış animasyonu başlamaz. */
  ready: boolean;
  /** İlk kare çizildi: yerel açılış ekranı bu anda gizlenir. */
  onFirstFrame?: () => void;
  /** Animasyon bitti, bileşen kaldırılabilir. */
  onFinish: () => void;
};

export default function AnimatedSplash({
  ready,
  onFirstFrame,
  onFinish,
}: Props) {
  const win = useWindowDimensions();
  // Konum gerçek kök görünüm ölçüsünden: Android'de pencere ölçüsü sistem çubuklarını dışarıda
  // bırakabiliyor, yerel açılış simgesi ise tüm ekranın ortasında.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const W = box?.w ?? win.width;
  const H = box?.h ?? win.height;
  const reduceMotion = useReducedMotion();
  const tone = useColorScheme() === "dark" ? "dark" : "light";
  const art = SPLASH_SVG[tone];
  const background = SPLASH_BACKGROUNDS[tone];
  const glow = tone === "dark" ? "255,214,180" : "255,255,255";
  const [introDone, setIntroDone] = useState(false);
  const firstFrameSent = useRef(false);
  const exiting = useRef(false);

  // --- Geometri ---
  const M = splashMarkSize(W);
  const cx = W / 2;
  const cy = H / 2;
  const markLeft = cx - M / 2;
  const markTop = cy - M / 2;

  // Çubuk (viewBox x15..85, y57.4..60.6)
  const bar = {
    left: 0.15 * M,
    top: 0.574 * M,
    width: 0.7 * M,
    height: 0.032 * M,
  };
  const scanUp = -0.264 * M; // y=31: portakalın tepesi
  const scanDown = 0.272 * M; // y=84.6: dilimin dibi

  // Portakal dairesi (cx50 cy59 r28): ışık bandı bu dairenin içinde kalır
  const circle = { left: 0.22 * M, top: 0.31 * M, size: 0.56 * M };
  const bandH = 0.2 * M;

  // Son yerleşim: simge (küçülmüş) + PureScan + FOODS dikey ortalı
  const sF = MARK_FINAL_SCALE;
  const textW = M * 1.42;
  const textH = textW / PURESCAN_ASPECT;
  const foodsW = textW * FOODS_WIDTH_RATIO;
  const foodsH = foodsW / FOODS_ASPECT;
  const gap1 = M * 0.07;
  const gap2 = foodsH * 0.7;
  const markVisible = 0.795 * M * sF; // yaprak tepesi (y7.5) .. dilim dibi (y87)
  const groupH = markVisible + gap1 + textH + gap2 + foodsH;
  const groupTop = cy - groupH / 2;
  const markBoxTopFinal = groupTop - 0.075 * M * sF;
  const markShift = markBoxTopFinal + (M * sF) / 2 - cy;
  const textTop = groupTop + markVisible + gap1;
  const foodsTop = textTop + textH + gap2;

  // --- Animasyon değerleri ---
  const scanY = useSharedValue(0);
  const band = useSharedValue(0);
  const leaf = useSharedValue(0);
  const markY = useSharedValue(0);
  const markScale = useSharedValue(1);
  const reveal = useSharedValue(0);
  const head = useSharedValue(0);
  const foods = useSharedValue(0);
  const fade = useSharedValue(1);
  const zoom = useSharedValue(1);
  // Giriş bitişi animasyonlarla AYNI saatte (UI thread) ölçülür. JS sayacı kullanılmaz:
  // uygulama yüklenirken animasyon geç başlarsa sayaç erken dolup yazı görünmeden ekranı kapatıyordu.
  const introClock = useSharedValue(0);
  const markIntroDone = () => setIntroDone(true);

  useEffect(() => {
    if (reduceMotion) {
      // Azaltılmış hareket: tarama ve kayma yok, yazı yalnız belirir.
      markY.value = markShift;
      markScale.value = sF;
      reveal.value = withTiming(1, { duration: 250 });
      foods.value = withTiming(1, { duration: 250 });
      introClock.value = withDelay(
        600,
        withTiming(1, { duration: 1 }, (finished) => {
          if (finished) runOnJS(markIntroDone)();
        }),
      );
      return;
    }

    const ease = Easing.bezier(0.65, 0, 0.35, 1);
    scanY.value = withDelay(
      T.sweepStart,
      withSequence(
        withTiming(scanUp, {
          duration: T.sweepUp,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(scanDown, { duration: T.sweepDown, easing: ease }),
        withTiming(0, {
          duration: T.sweepBack,
          easing: Easing.out(Easing.cubic),
        }),
      ),
    );
    band.value = withDelay(
      T.sweepStart,
      withSequence(
        withTiming(1, { duration: 160 }),
        withDelay(
          T.sweepUp + T.sweepDown - 240,
          withTiming(0, { duration: 320 }),
        ),
      ),
    );
    leaf.value = withDelay(
      T.leaf,
      withSequence(
        withTiming(-14, { duration: 140, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 6, stiffness: 180 }),
      ),
    );
    markY.value = withDelay(
      T.markMove,
      withSpring(markShift, { damping: 20, stiffness: 210 }),
    );
    markScale.value = withDelay(
      T.markMove,
      withSpring(sF, { damping: 20, stiffness: 210 }),
    );
    reveal.value = withDelay(
      T.textStart,
      withTiming(1, { duration: T.textDur, easing: Easing.out(Easing.cubic) }),
    );
    head.value = withDelay(
      T.textStart,
      withSequence(
        withTiming(1, { duration: 90 }),
        withDelay(T.textDur - 200, withTiming(0, { duration: 260 })),
      ),
    );
    foods.value = withDelay(
      T.foods,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );

    introClock.value = withDelay(
      T.introDone,
      withTiming(1, { duration: 1 }, (finished) => {
        if (finished) runOnJS(markIntroDone)();
      }),
    );
    // Ölçüler açılışta bir kez okunur; animasyon döndürmede yeniden başlamaz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  useEffect(() => {
    if (!introDone || !ready || exiting.current) return;
    exiting.current = true;
    zoom.value = withTiming(1.05, {
      duration: T.exit,
      easing: Easing.in(Easing.quad),
    });
    fade.value = withTiming(
      0,
      { duration: T.exit, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introDone, ready]);

  // --- Stiller ---
  const rootStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: markY.value }, { scale: markScale.value }],
  }));
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));
  const bandStyle = useAnimatedStyle(() => ({
    opacity: band.value,
    transform: [{ translateY: scanY.value }],
  }));
  const leafStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leaf.value}deg` }],
  }));
  const revealStyle = useAnimatedStyle(() => ({ width: textW * reveal.value }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: head.value,
    transform: [{ translateX: textW * reveal.value }],
  }));
  const foodsStyle = useAnimatedStyle(() => ({
    opacity: foods.value,
    transform: [{ translateY: (1 - foods.value) * 6 }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!box || box.w !== width || box.h !== height)
      setBox({ w: width, h: height });
  };

  // İlk kare, ölçü alınıp içerik o ölçüyle çizildikten sonra bildirilir.
  useEffect(() => {
    if (!box || firstFrameSent.current) return;
    firstFrameSent.current = true;
    onFirstFrame?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        { backgroundColor: background },
        rootStyle,
      ]}
      onLayout={handleLayout}
      pointerEvents="none"
      accessible
      accessibilityLabel="PureScan Foods"
    >
      <Animated.View style={[StyleSheet.absoluteFill, stageStyle]}>
        {/* Simge */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: markLeft,
              top: markTop,
              width: M,
              height: M,
            },
            markStyle,
          ]}
        >
          <SvgXml xml={art.body} width={M} height={M} />

          {/* Işık bandı: daire içinde, çubuğu izler */}
          <View
            style={{
              position: "absolute",
              left: circle.left,
              top: circle.top,
              width: circle.size,
              height: circle.size,
              borderRadius: circle.size / 2,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: bar.top + bar.height / 2 - circle.top - bandH / 2,
                  height: bandH,
                },
                bandStyle,
              ]}
            >
              <LinearGradient
                colors={[
                  `rgba(${glow},0)`,
                  `rgba(${glow},0.55)`,
                  `rgba(${glow},0)`,
                ]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                top: 0,
                width: M,
                height: M,
                transformOrigin: "49.5% 29.5%",
              },
              leafStyle,
            ]}
          >
            <SvgXml xml={art.leaf} width={M} height={M} />
          </Animated.View>

          <Animated.View
            style={[
              {
                position: "absolute",
                left: bar.left,
                top: bar.top,
                width: bar.width,
                height: bar.height,
                borderRadius: bar.height / 2,
                backgroundColor: art.bar,
              },
              barStyle,
            ]}
          />
        </Animated.View>

        {/* PureScan: soldan sağa açılır */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: cx - textW / 2,
              top: textTop,
              height: textH,
              overflow: "hidden",
            },
            revealStyle,
          ]}
        >
          <SvgXml xml={art.pureScan} width={textW} height={textH} />
        </Animated.View>
        <Animated.View
          style={[
            {
              position: "absolute",
              left: cx - textW / 2 - 1,
              top: textTop - textH * 0.12,
              width: 2,
              height: textH * 1.24,
              borderRadius: 1,
              backgroundColor: art.accent,
              shadowColor: art.accent,
              shadowOpacity: 0.9,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            },
            headStyle,
          ]}
        />

        {/* FOODS */}
        <Animated.View
          style={[
            { position: "absolute", left: cx - foodsW / 2, top: foodsTop },
            foodsStyle,
          ]}
        >
          <SvgXml xml={art.foods} width={foodsW} height={foodsH} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 1000,
    elevation: 1000,
  },
});
