// Ana tarama düğmesinin üstünden ara ara geçen ışık bandı. Açılış animasyonundaki tarama hareketinin
// sade hali. Düğmenin içine absolute konur (düğme overflow:hidden). Ekran odakta değilse ve
// azaltılmış harekette çalışmaz.
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BAND = 90;

export default function ScanSweep({ active = true }: { active?: boolean }) {
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const t = useSharedValue(0);

  useEffect(() => {
    if (!active || reduce || !w) {
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    t.value = 0;
    t.value = withRepeat(
      withSequence(
        withDelay(2200, withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.cubic) })),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    );
    return () => cancelAnimation(t);
  }, [active, reduce, w, t]);

  const bandStyle = useAnimatedStyle(() => ({
    opacity: t.value > 0 && t.value < 1 ? 1 : 0,
    transform: [{ translateX: -BAND + t.value * (w + BAND * 2) }, { skewX: "-18deg" }],
  }));

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.band, bandStyle]}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.26)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: "absolute",
    top: -20,
    bottom: -20,
    left: 0,
    width: BAND,
  },
});
