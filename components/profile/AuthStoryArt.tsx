// Giriş / kayıt görünümünün hikâye animasyonu (eski Lottie'nin yerine). Döngü ~6 sn:
//  1) Profil kartının kenarı çizilir, kart dolar.
//  2) Avatar halkası çizilir, içindeki kişi belirir, ad satırları uzar.
//  3) Sepet gelir, mandalina, yaprak ve başak tek tek süzülüp sepete oturur.
//  4) Kalkan çizilir, turuncuya dolar, onay işareti çizilir, hafifçe nabız atar (veriler güvende).
//  5) Altta aile avatarları ve boş "ekle" yuvası belirir.
//  6) Kısa bekleme, yumuşak sönüş, baştan.
// Yalnız transform, opaklık ve strokeDashoffset canlandırılır. Azaltılmış harekette kurulmuş son kare durur.
// Çizim 160x160 birimlik tek koordinat düzleminde yapılır; hareket eden her parça kendi küçük Svg'sinde,
// viewBox'u o parçanın düzlemdeki dikdörtgeni olan bir Animated.View içinde durur (dönüşler View'da).
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const VB = 160;
const LOOP_MS = 6000;
/** Azaltılmış harekette gösterilen an: her şey kurulmuş, sönüş başlamamış. */
const REST_T = 0.86;

// Zaman çizelgesi (döngünün kesri olarak).
const TL = {
  cardDraw: [0.0, 0.12],
  cardFill: [0.07, 0.15],
  ring: [0.09, 0.18],
  glyph: [0.15, 0.22],
  line1: [0.17, 0.23],
  line2: [0.2, 0.26],
  basket: [0.22, 0.29],
  food1: [0.27, 0.37],
  food2: [0.31, 0.41],
  food3: [0.35, 0.45],
  shieldIn: [0.44, 0.47],
  shieldDraw: [0.44, 0.53],
  shieldFill: [0.51, 0.56],
  check: [0.55, 0.61],
  pulse: [0.6, 0.67],
  ripple: [0.6, 0.72],
  sparkle: [0.59, 0.66],
  fam1: [0.63, 0.7],
  fam2: [0.66, 0.73],
  fam3: [0.69, 0.76],
  famAdd: [0.72, 0.79],
  fadeOut: [0.91, 0.98],
} as const;

// Yol uzunlukları elle hesaplandı, biraz fazlası alındı (eksik olursa çizginin sonu boş kalır).
const CARD_PATH =
  "M46 32 H114 A16 16 0 0 1 130 48 V104 A16 16 0 0 1 114 120 H46 A16 16 0 0 1 30 104 V48 A16 16 0 0 1 46 32 Z";
const CARD_LEN = 352; // 248 düz + 4 x 8π
const RING_LEN = 77; // 2π x 12
const LINE1 = "M74 51 H112";
const LINE1_LEN = 40;
const LINE2 = "M74 61.5 H100";
const LINE2_LEN = 28;
const SHIELD_PATH =
  "M125 23 L137 27.5 V37 C137 45 131.5 50.5 125 53 C118.5 50.5 113 45 113 37 V27.5 Z";
const SHIELD_LEN = 96; // ~87.6, %10 pay
const CHECK_PATH = "M119 38 L123.2 42.2 L131 34";
const CHECK_LEN = 19;

const FAMILY_Y = 138;

function seg(t: number, a: number, b: number) {
  "worklet";
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}
function easeOut(x: number) {
  "worklet";
  return 1 - Math.pow(1 - x, 3);
}
function easeInOut(x: number) {
  "worklet";
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
/** Hafif taşma ile oturma (sakin, zıplamasız). */
function easeOutBack(x: number) {
  "worklet";
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/** Çizgiyi baştan sona çizer. Gizliyken yuvarlak uç nokta bırakmasın diye opaklık da kapanır. */
function useDraw(t: SharedValue<number>, range: readonly [number, number], length: number, opacity = 1) {
  const a = range[0];
  const b = range[1];
  return useAnimatedProps(() => {
    const p = easeInOut(seg(t.value, a, b));
    return { strokeDashoffset: length * (1 - p), strokeOpacity: p > 0.002 ? opacity : 0 };
  });
}

function useFill(t: SharedValue<number>, range: readonly [number, number], max = 1) {
  const a = range[0];
  const b = range[1];
  return useAnimatedProps(() => ({ fillOpacity: easeOut(seg(t.value, a, b)) * max }));
}

/** Parça yerine süzülür: kayma (birim), dönüş ve büyüme hafif taşmayla oturur. */
function useSettle(
  t: SharedValue<number>,
  range: readonly [number, number],
  k: number,
  dy: number,
  rotate = 0,
  scaleFrom = 1
) {
  const a = range[0];
  const b = range[1];
  return useAnimatedStyle(() => {
    const s = seg(t.value, a, b);
    const e = easeOutBack(s);
    return {
      opacity: Math.min(1, s * 2.2),
      transform: [
        { translateY: (1 - e) * dy * k },
        { rotate: `${(1 - e) * rotate}deg` },
        { scale: scaleFrom + (1 - scaleFrom) * e },
      ],
    };
  });
}

/** Düzlemde [x, y, w, h] dikdörtgenine oturan, kendi Svg'si olan hareketli katman. */
function Piece({
  k,
  rect,
  style,
  children,
}: {
  k: number;
  rect: readonly [number, number, number, number];
  style?: any;
  children: React.ReactNode;
}) {
  const [x, y, w, h] = rect;
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k }, style]}
    >
      <Svg width={w * k} height={h * k} viewBox={`${x} ${y} ${w} ${h}`}>
        {children}
      </Svg>
    </Animated.View>
  );
}

function sparklePath(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

function FamilyMember({ cx, color, ring }: { cx: number; color: string; ring: string }) {
  const cy = FAMILY_Y;
  return (
    <>
      <Circle cx={cx} cy={cy} r={7.6} fill={color} stroke={ring} strokeWidth={2} />
      <Circle cx={cx} cy={cy - 2.1} r={2.5} fill="#FFFFFF" fillOpacity={0.95} />
      <Path
        d={`M${cx - 4.3} ${cy + 5.4} Q${cx - 4} ${cy + 1.6} ${cx} ${cy + 1.6} Q${cx + 4} ${cy + 1.6} ${cx + 4.3} ${cy + 5.4} Z`}
        fill="#FFFFFF"
        fillOpacity={0.95}
      />
    </>
  );
}

export default function AuthStoryArt({ size }: { size: number }) {
  const { colors, isDark } = useTheme();
  const reduce = useReducedMotion();
  const t = useSharedValue(reduce ? REST_T : 0);
  const k = size / VB;

  useEffect(() => {
    if (reduce) {
      cancelAnimation(t);
      t.value = REST_T;
      return;
    }
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: LOOP_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(t);
  }, [reduce, t]);

  const pal = {
    orange: colors.primary,
    deep: colors.primaryDeep,
    discInner: isDark ? "rgba(255,139,61,0.17)" : "#FFE6D0",
    discOuter: isDark ? "rgba(255,139,61,0.04)" : "#FFF7F0",
    cardFill: isDark ? "#2C2119" : "#FFFFFF",
    cardStroke: isDark ? "rgba(255,139,61,0.55)" : "#F1C29C",
    line: colors.text,
    green: isDark ? "#4CC07A" : "#2E9E5B",
    wheat: isDark ? "#F2B856" : "#E39A2D",
    wheatDeep: isDark ? "#D9993A" : "#B9741A",
    basket: isDark ? "#4A2B17" : "#FFE4CE",
    ring: colors.card,
  };

  // Kart ve avatar (taban katman)
  const cardShadowProps = useFill(t, TL.cardFill, isDark ? 0.3 : 0.1);
  const cardFillProps = useFill(t, TL.cardFill);
  const cardDrawProps = useDraw(t, TL.cardDraw, CARD_LEN);
  const ringProps = useDraw(t, TL.ring, RING_LEN);
  const line1Props = useDraw(t, TL.line1, LINE1_LEN, isDark ? 0.9 : 0.8);
  const line2Props = useDraw(t, TL.line2, LINE2_LEN, isDark ? 0.34 : 0.24);

  // Hareketli parçalar
  const glyphStyle = useSettle(t, TL.glyph, k, 0, 0, 0.55);
  const basketStyle = useSettle(t, TL.basket, k, 7);
  const food1Style = useSettle(t, TL.food1, k, -16, -14);
  const food2Style = useSettle(t, TL.food2, k, -18, 12);
  const food3Style = useSettle(t, TL.food3, k, -16, 10);

  // Kalkan
  const [inA, inB] = TL.shieldIn;
  const [pulseA, pulseB] = TL.pulse;
  const [ripA, ripB] = TL.ripple;
  const [fadeA, fadeB] = TL.fadeOut;
  const shieldStyle = useAnimatedStyle(() => {
    const inP = easeOut(seg(t.value, inA, inB));
    const pulse = seg(t.value, pulseA, pulseB);
    return {
      opacity: inP,
      transform: [{ scale: (0.88 + 0.12 * inP) * (1 + 0.08 * Math.sin(Math.PI * pulse)) }],
    };
  });
  const rippleStyle = useAnimatedStyle(() => {
    const r = seg(t.value, ripA, ripB);
    return {
      opacity: r > 0 && r < 1 ? 0.55 * (1 - r) : 0,
      transform: [{ scale: 0.75 + 0.85 * easeOut(r) }],
    };
  });
  const shieldDrawProps = useDraw(t, TL.shieldDraw, SHIELD_LEN);
  const shieldFillProps = useFill(t, TL.shieldFill);
  const checkProps = useDraw(t, TL.check, CHECK_LEN);
  const sparkleProps = useFill(t, TL.sparkle);

  // Aile sırası
  const fam1Style = useSettle(t, TL.fam1, k, 8, 0, 0.8);
  const fam2Style = useSettle(t, TL.fam2, k, 8, 0, 0.8);
  const fam3Style = useSettle(t, TL.fam3, k, 8, 0, 0.8);
  const famAddStyle = useSettle(t, TL.famAdd, k, 6, 0, 0.8);

  const groupStyle = useAnimatedStyle(() => ({
    opacity: 1 - seg(t.value, fadeA, fadeB),
  }));

  return (
    <View
      style={{ width: size, height: size }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Sabit zemin: yumuşak krem daire */}
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="authArtDisc" cx="50%" cy="42%" r="50%">
            <Stop offset="0" stopColor={pal.discInner} />
            <Stop offset="1" stopColor={pal.discOuter} />
          </RadialGradient>
        </Defs>
        <Circle cx={80} cy={84} r={70} fill="url(#authArtDisc)" />
      </Svg>

      {/* Android'de sönüşte katmanlar tek tek saydamlaşıp üst üste binmesin: grup olarak birleştir. */}
      <Animated.View needsOffscreenAlphaCompositing style={[StyleSheet.absoluteFill, groupStyle]}>
        {/* Taban: kart, avatar halkası, ad satırları */}
        <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={StyleSheet.absoluteFill}>
          <AnimatedRect x={30} y={36} width={100} height={88} rx={16} fill={pal.deep} animatedProps={cardShadowProps} />
          <AnimatedRect x={30} y={32} width={100} height={88} rx={16} fill={pal.cardFill} animatedProps={cardFillProps} />
          <AnimatedPath
            d={CARD_PATH}
            fill="none"
            stroke={pal.cardStroke}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[CARD_LEN, CARD_LEN]}
            animatedProps={cardDrawProps}
          />
          <AnimatedCircle
            cx={54}
            cy={58}
            r={12}
            fill="none"
            stroke={pal.orange}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray={[RING_LEN, RING_LEN]}
            transform="rotate(-90 54 58)"
            animatedProps={ringProps}
          />
          <AnimatedPath
            d={LINE1}
            stroke={pal.line}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={[LINE1_LEN, LINE1_LEN]}
            animatedProps={line1Props}
          />
          <AnimatedPath
            d={LINE2}
            stroke={pal.line}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={[LINE2_LEN, LINE2_LEN]}
            animatedProps={line2Props}
          />
        </Svg>

        {/* Avatarın içindeki kişi */}
        <Piece k={k} rect={[40, 44, 28, 28]} style={glyphStyle}>
          <Circle cx={54} cy={58} r={10.6} fill={pal.orange} fillOpacity={isDark ? 0.22 : 0.13} />
          <Circle cx={54} cy={54.6} r={4.2} fill={pal.orange} />
          <Path
            d="M46.4 66 C47.2 61.9 50.3 60.3 54 60.3 C57.7 60.3 60.8 61.9 61.6 66 C59.4 67.6 56.8 68.4 54 68.4 C51.2 68.4 48.6 67.6 46.4 66 Z"
            fill={pal.orange}
          />
        </Piece>

        {/* Mandalina */}
        <Piece k={k} rect={[48, 66, 24, 28]} style={food1Style}>
          <Circle cx={60} cy={83} r={9.5} fill={pal.orange} />
          <Ellipse cx={56.6} cy={79.4} rx={2.6} ry={1.7} fill="#FFFFFF" fillOpacity={0.45} transform="rotate(-35 56.6 79.4)" />
          <Path d="M60 73.8 L60.5 71.6" stroke={pal.deep} strokeWidth={1.4} strokeLinecap="round" />
          <Path d="M60.6 72.4 C62.6 69.4 66.2 69 68.2 70 C66.8 72.8 63.6 73.9 60.6 72.4 Z" fill={pal.green} />
        </Piece>

        {/* Yaprak */}
        <Piece k={k} rect={[66, 62, 26, 32]} style={food2Style}>
          <Path d="M77 92 C69.5 84 71.5 71.5 86.5 65.5 C89 78 86.5 87 77 92 Z" fill={pal.green} />
          <Path d="M77.8 90.4 Q80.8 79.5 85.6 67.8" fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1.3} strokeLinecap="round" />
          <Path d="M79.6 83.2 Q77.2 81.8 75.4 79.4" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" />
          <Path d="M81.6 77 Q79.6 75.6 78.4 73.2" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1} strokeLinecap="round" />
        </Piece>

        {/* Başak */}
        <Piece k={k} rect={[92, 64, 20, 30]} style={food3Style}>
          <Path d="M99.6 93 Q101.4 80.5 103.8 68.8" fill="none" stroke={pal.wheatDeep} strokeWidth={1.5} strokeLinecap="round" />
          <Ellipse cx={103.7} cy={70.4} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(12 103.7 70.4)" />
          <Ellipse cx={100.3} cy={75.3} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(-28 100.3 75.3)" />
          <Ellipse cx={104.9} cy={74.7} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(28 104.9 74.7)" />
          <Ellipse cx={99.25} cy={81.2} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(-28 99.25 81.2)" />
          <Ellipse cx={103.85} cy={80.6} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(28 103.85 80.6)" />
          <Ellipse cx={98.2} cy={87.2} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(-28 98.2 87.2)" />
          <Ellipse cx={102.8} cy={86.6} rx={2.1} ry={3.6} fill={pal.wheat} transform="rotate(28 102.8 86.6)" />
        </Piece>

        {/* Sepetin önü: gıdaların alt kısmını örter, sepete oturmuş görünürler */}
        <Piece k={k} rect={[38, 86, 84, 30]} style={basketStyle}>
          <Path
            d="M44 94 H116 L111.2 109.6 Q110 113.6 105.8 113.6 H54.2 Q50 113.6 48.8 109.6 Z"
            fill={pal.basket}
          />
          <Path
            d="M47.4 100.4 H112.6 M49.3 106.8 H110.7"
            stroke={pal.orange}
            strokeOpacity={0.3}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Path
            d="M62 97 V111 M80 97 V111 M98 97 V111"
            stroke={pal.orange}
            strokeOpacity={0.18}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <Rect x={40} y={88} width={80} height={7.5} rx={3.75} fill={pal.orange} />
          <Path d="M44.5 90.4 H115.5" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.1} strokeLinecap="round" />
        </Piece>

        {/* Kalkan: dalga, gövde, onay */}
        <Piece k={k} rect={[105, 18, 40, 40]} style={rippleStyle}>
          <Circle cx={125} cy={38} r={17} fill="none" stroke={pal.orange} strokeWidth={1.6} />
        </Piece>
        <Piece k={k} rect={[109, 20, 32, 36]} style={shieldStyle}>
          <Defs>
            <SvgGradient id="authArtShield" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0" stopColor={pal.orange} />
              <Stop offset="1" stopColor={pal.deep} />
            </SvgGradient>
          </Defs>
          <Path d={SHIELD_PATH} fill={pal.cardFill} />
          <AnimatedPath d={SHIELD_PATH} fill="url(#authArtShield)" animatedProps={shieldFillProps} />
          <AnimatedPath
            d={SHIELD_PATH}
            fill="none"
            stroke={pal.orange}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={[SHIELD_LEN, SHIELD_LEN]}
            animatedProps={shieldDrawProps}
          />
          <AnimatedPath
            d={CHECK_PATH}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[CHECK_LEN, CHECK_LEN]}
            animatedProps={checkProps}
          />
        </Piece>

        {/* Aile: üç avatar ve boş "ekle" yuvası */}
        <Piece k={k} rect={[52, FAMILY_Y - 10, 20, 20]} style={fam1Style}>
          <FamilyMember cx={62} color={pal.green} ring={pal.ring} />
        </Piece>
        <Piece k={k} rect={[64, FAMILY_Y - 10, 20, 20]} style={fam2Style}>
          <FamilyMember cx={74} color={pal.orange} ring={pal.ring} />
        </Piece>
        <Piece k={k} rect={[76, FAMILY_Y - 10, 20, 20]} style={fam3Style}>
          <FamilyMember cx={86} color={pal.wheat} ring={pal.ring} />
        </Piece>
        <Piece k={k} rect={[90, FAMILY_Y - 10, 20, 20]} style={famAddStyle}>
          <Circle
            cx={100}
            cy={FAMILY_Y}
            r={7}
            fill="none"
            stroke={pal.line}
            strokeOpacity={isDark ? 0.45 : 0.32}
            strokeWidth={1.3}
            strokeDasharray={[2.4, 2.4]}
          />
          <Path
            d={`M100 ${FAMILY_Y - 3.4} V${FAMILY_Y + 3.4} M96.6 ${FAMILY_Y} H103.4`}
            stroke={pal.line}
            strokeOpacity={isDark ? 0.55 : 0.42}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </Piece>

        {/* Kalkanın yanında iki küçük ışıltı */}
        <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={StyleSheet.absoluteFill}>
          <AnimatedPath d={sparklePath(146, 50, 4)} fill={pal.wheat} animatedProps={sparkleProps} />
          <AnimatedPath d={sparklePath(106, 19, 3.2)} fill={pal.orange} animatedProps={sparkleProps} />
        </Svg>
      </Animated.View>
    </View>
  );
}
