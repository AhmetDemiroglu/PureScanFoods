// Ortak ölçü sistemi (2026-11 arayüz yenilemesi). Renkler constants/colors.ts'te kalır;
// burada köşe, boşluk, gölge, yazı ve kabuk geometrisi tek yerden gelir.
import { Platform, ViewStyle } from "react-native";
import type { AppColors } from "./colors";

/** Sistem yazı büyütmesinin üst sınırı. Bunun üstü düzeni taşırıp ekranı kullanılmaz yapıyordu. */
export const FONT_SCALE_CAP = 1.3;
/** Serif başlıklar zaten büyük: daha sıkı sınır. */
export const DISPLAY_FONT_SCALE_CAP = 1.2;

export const Fonts = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semibold: "Inter-SemiBold",
  bold: "Inter-Bold",
  /** Logodaki "PureScan" yazısının yazı tipi. Tek ağırlık. */
  display: "DMSerifDisplay-Regular",
} as const;

export const Radii = {
  chip: 10,
  control: 14,
  card: 20,
  sheet: 28,
  pill: 999,
} as const;

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Sayfa kenarından içerik boşluğu. */
export const SCREEN_PADDING = 20;

/**
 * Kabuk kenar şeritleri (AppShellSidebar): sağ 24 pt geçmiş çekmecesini açar, sol 24 pt sekmelerde
 * ana ekrana döner. Şeritler tüm yüksekliği kaplar; dokunulacak öğeler kenardan en az EDGE_SAFE_INSET
 * içeride durmalı, yoksa dış ucu şeridin altında kalıp dokunuş almaz.
 */
export const EDGE_GESTURE_WIDTH = 24;
export const EDGE_SAFE_INSET = 28;

/** Yüzen alt bar geometrisi. */
export const TabBarGeometry = {
  capsuleHeight: 64,
  /** Kapsülün güvenli alanın üstündeki boşluğu. */
  capsuleGap: 8,
  /** Ana ekran göstergesi olmayan cihazlarda (eski Android, 3 düğmeli gezinme) en az alt boşluk. */
  minBottom: 12,
  capsuleMargin: EDGE_SAFE_INSET,
  radius: 32,
  scanSize: 58,
  /** Tarama düğmesinin kapsülün üst kenarından taşan kısmı. */
  scanProtrusion: 14,
} as const;

/** Barın kapladığı toplam yükseklik (ekran altından kapsülün üst kenarına). İçerik bu kadar boşluk bırakır. */
export const tabBarOccupiedHeight = (bottomInset: number) =>
  Math.max(bottomInset, TabBarGeometry.minBottom) + TabBarGeometry.capsuleGap + TabBarGeometry.capsuleHeight;

type ShadowLevel = "sm" | "md" | "lg";

/** iOS gölgesi ve Android elevation tek yerden. Koyu temada gölge zaten görünmez, hafifletilir. */
export function shadow(level: ShadowLevel, isDark: boolean, color = "#2A1A0E"): ViewStyle {
  const spec = {
    sm: { y: 2, r: 6, o: 0.06, e: 2 },
    md: { y: 6, r: 16, o: 0.09, e: 6 },
    lg: { y: 12, r: 28, o: 0.14, e: 12 },
  }[level];
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: spec.y },
      shadowOpacity: isDark ? spec.o * 1.6 : spec.o,
      shadowRadius: spec.r,
    },
    default: { elevation: isDark ? Math.max(1, spec.e - 2) : spec.e },
  })!;
}

/** Cam yüzey tonları (native cam olmayan yolda). */
export function glassTint(colors: AppColors, isDark: boolean) {
  return {
    /** Eski iOS'ta BlurView'un altındaki ince boya (gölge hesabı için alfa sıfır olmasın). */
    iosFill: isDark ? "rgba(34,25,18,0.55)" : "rgba(255,252,248,0.62)",
    /** Android: blur yok, tema uyumlu düz yüzey. */
    androidFill: isDark ? "#241B14" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(42,31,24,0.08)",
    /** Kapsülün altındaki sis: sayfa zemini rengine çalar. */
    hazeFrom: isDark ? "rgba(21,16,12,0)" : "rgba(255,250,245,0)",
    hazeTo: isDark ? "rgba(21,16,12,0.92)" : "rgba(255,250,245,0.94)",
    /** Cam üstündeki aktif sekme hapı. */
    activePill: isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)",
    idleIcon: colors.gray[500],
  };
}
