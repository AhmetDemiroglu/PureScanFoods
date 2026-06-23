import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
    Defs,
    ClipPath,
    Rect,
    Line,
    G,
    LinearGradient as SvgLinearGradient,
    Stop,
    Ellipse,
} from "react-native-svg";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { RenderLayer } from "../../lib/composition";

interface Props {
    layers: RenderLayer[];
    spoons: number;
    sugarEstimated: boolean;
    fullyEstimated: boolean;
    width: number;
    servingLabel?: string;
    // Paylaşım kartı için: tema ne olursa olsun açık (light) renkler kullan.
    forceLight?: boolean;
}

// "Gerçekte ne tüketiyorsun?" — katmanlı bardak (SVG) + leader-line etiketler + şeker kaşığı sırası.
export default function ConsumptionJar({
    layers,
    spoons,
    sugarEstimated,
    fullyEstimated,
    width,
    servingLabel,
    forceLight,
}: Props) {
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    // Efektif renkler (forceLight → her zaman açık tema)
    const darkMode = forceLight ? false : isDark;
    const textColor = forceLight ? "#16203A" : colors.text;
    const mutedColor = forceLight ? "#6B7280" : colors.gray[500];
    const servingColor = forceLight ? "#9AA0A6" : colors.gray[400];

    // ── Yerleşim ──
    const jarTop = 12;
    const jarH = 320;
    const jarX = width * 0.07;
    const jarW = width * 0.3;
    const dotX = width * 0.5;
    const legendTextX = width * 0.535;
    const legendW = width * 0.43;
    const svgH = jarTop + jarH + 14;

    const n = Math.max(layers.length, 1);
    const rowH = jarH / n;

    const bands = useMemo(() => {
        let acc = 0;
        return layers.map((l) => {
            const top = jarTop + acc * jarH;
            const h = l.renderFraction * jarH;
            acc += l.renderFraction;
            return { layer: l, top, h, centerY: top + h / 2 };
        });
    }, [layers, jarH, jarTop]);

    const glassStroke = darkMode ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.18)";
    const leaderStroke = darkMode ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.22)";
    const clipId = "jarClip";

    const spoonsToShow = Math.min(Math.round(spoons), 8);

    return (
        <View style={{ width, alignSelf: "center" }}>
            <View style={{ width, height: svgH }}>
                <Svg width={width} height={svgH} style={StyleSheet.absoluteFill}>
                    <Defs>
                        <ClipPath id={clipId}>
                            <Rect x={jarX} y={jarTop} width={jarW} height={jarH} rx={20} ry={20} />
                        </ClipPath>
                        <SvgLinearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={darkMode ? 0.18 : 0.35} />
                            <Stop offset="0.25" stopColor="#FFFFFF" stopOpacity="0" />
                            <Stop offset="0.85" stopColor="#000000" stopOpacity="0" />
                            <Stop offset="1" stopColor="#000000" stopOpacity={darkMode ? 0.12 : 0.08} />
                        </SvgLinearGradient>
                    </Defs>

                    {/* Katmanlar (bardak şekline kırpılır) */}
                    <G clipPath={`url(#${clipId})`}>
                        {bands.map((b, i) => (
                            <Rect
                                key={`band-${i}`}
                                x={jarX}
                                y={b.top}
                                width={jarW}
                                height={b.h + 0.5}
                                fill={b.layer.color}
                            />
                        ))}
                        {bands.map((b, i) =>
                            i > 0 ? (
                                <Line
                                    key={`sep-${i}`}
                                    x1={jarX}
                                    y1={b.top}
                                    x2={jarX + jarW}
                                    y2={b.top}
                                    stroke="rgba(0,0,0,0.08)"
                                    strokeWidth={1}
                                />
                            ) : null
                        )}
                        <Rect x={jarX} y={jarTop} width={jarW} height={jarH} fill="url(#glassShine)" />
                    </G>

                    {/* Bardak dış hattı + kapak/ağız */}
                    <Rect
                        x={jarX}
                        y={jarTop}
                        width={jarW}
                        height={jarH}
                        rx={20}
                        ry={20}
                        fill="none"
                        stroke={glassStroke}
                        strokeWidth={2}
                    />
                    <Rect
                        x={jarX + jarW * 0.16}
                        y={jarTop - 6}
                        width={jarW * 0.68}
                        height={8}
                        rx={4}
                        ry={4}
                        fill={glassStroke}
                    />

                    {/* Leader-line'lar: katman merkezinden lejant noktasına */}
                    {bands.map((b, i) => {
                        const rowCenter = jarTop + (i + 0.5) * rowH;
                        return (
                            <G key={`leader-${i}`}>
                                <Line
                                    x1={jarX + jarW}
                                    y1={b.centerY}
                                    x2={dotX - 6}
                                    y2={rowCenter}
                                    stroke={leaderStroke}
                                    strokeWidth={1}
                                />
                                <Rect
                                    x={dotX - 5}
                                    y={rowCenter - 5}
                                    width={10}
                                    height={10}
                                    rx={2}
                                    ry={2}
                                    fill={b.layer.color}
                                    stroke={glassStroke}
                                    strokeWidth={0.5}
                                />
                            </G>
                        );
                    })}
                </Svg>

                {/* Lejant metinleri (RN — keskin i18n) */}
                {bands.map((b, i) => {
                    const rowCenter = jarTop + (i + 0.5) * rowH;
                    return (
                        <View
                            key={`legend-${i}`}
                            style={[
                                styles.legendRow,
                                { left: legendTextX, top: rowCenter - 16, width: legendW },
                            ]}
                            pointerEvents="none"
                        >
                            <Text style={[styles.legendName, { color: textColor }]} numberOfLines={1}>
                                {b.layer.display_name}
                            </Text>
                            <Text style={[styles.legendRange, { color: mutedColor }]} numberOfLines={1}>
                                {b.layer.rangeLabel}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Şeker kaşığı sırası */}
            {spoons > 0 && (
                <View style={styles.spoonWrap}>
                    <View style={styles.spoonRow}>
                        {Array.from({ length: spoonsToShow }).map((_, i) => (
                            <Svg key={`spoon-${i}`} width={22} height={30} viewBox="0 0 22 30">
                                <Ellipse cx="11" cy="9" rx="8" ry="6.5" fill={darkMode ? "#E2E8F0" : "#CBD5E1"} />
                                <Ellipse cx="11" cy="8" rx="6" ry="4.5" fill="#FFFFFF" />
                                <Rect x="9.5" y="13" width="3" height="15" rx="1.5" fill={darkMode ? "#E2E8F0" : "#CBD5E1"} />
                            </Svg>
                        ))}
                        {Math.round(spoons) > spoonsToShow && (
                            <Text style={[styles.spoonMore, { color: mutedColor }]}>
                                ×{Math.round(spoons)}
                            </Text>
                        )}
                    </View>
                    <Text style={[styles.spoonLabel, { color: textColor }]}>
                        ≈ {spoons % 1 === 0 ? spoons : spoons.toFixed(1)}{" "}
                        {t("consumption.sugar_spoons", { defaultValue: "yemek kaşığı şeker" })}
                        {sugarEstimated ? " " + t("consumption.estimated_tag", { defaultValue: "(tahmini)" }) : ""}
                    </Text>
                    <Text style={[styles.spoonServing, { color: servingColor }]}>
                        {servingLabel || t("consumption.per_100g", { defaultValue: "100 g ürün için" })}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    legendRow: {
        position: "absolute",
        justifyContent: "center",
    },
    legendName: {
        fontSize: 12.5,
        fontWeight: "700",
    },
    legendRange: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 1,
    },
    spoonWrap: {
        alignItems: "center",
        marginTop: 8,
    },
    spoonRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 3,
        flexWrap: "wrap",
        justifyContent: "center",
    },
    spoonMore: {
        fontSize: 13,
        fontWeight: "800",
        marginLeft: 2,
        alignSelf: "center",
    },
    spoonLabel: {
        fontSize: 15,
        fontWeight: "800",
        marginTop: 6,
        textAlign: "center",
    },
    spoonServing: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
});
