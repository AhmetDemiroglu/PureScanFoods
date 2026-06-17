import React from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Springs } from "../../constants/motion";
import * as haptics from "../../lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HapticType = "selection" | "light" | "medium" | "heavy" | "none";

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Basılı tutulurken küçülme oranı (default 0.96) */
  scaleTo?: number;
  /** Press'te tetiklenecek haptik (default "light") */
  haptic?: HapticType;
}

/**
 * Animasyonlu + haptik geri bildirimli Pressable.
 * Tüm uygulamada native-feel buton/kart etkileşimlerinin taşıyıcısı.
 * onPressIn'de withSpring ile küçülür, release'de hafif overshoot ile geri gelir.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = "light",
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fireHaptic = () => {
    switch (haptic) {
      case "selection":
        haptics.selection();
        break;
      case "light":
        haptics.impactLight();
        break;
      case "medium":
        haptics.impactMedium();
        break;
      case "heavy":
        haptics.impactHeavy();
        break;
      case "none":
      default:
        break;
    }
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(scaleTo, Springs.snappy);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, Springs.bouncy);
    onPressOut?.(e);
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (!disabled) fireHaptic();
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default PressableScale;
