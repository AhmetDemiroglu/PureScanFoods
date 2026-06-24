import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Defs, ClipPath, Rect, Line, G } from "react-native-svg";
import { RenderLayer } from "../../lib/composition";

interface Props {
    layers: RenderLayer[];
    size?: number;
}

// AI img2img için ETİKETSİZ referans kavanoz: yalnızca renkli, oranlı yatay bantlar.
// view-shot ile yakalanıp gemini-2.5-flash-image'a "bu yapıyı birebir fotogerçekçi yap"
// referansı olarak verilir. Oranlar SVG (ConsumptionJar) ile aynı renderFraction'dan gelir.
export default function JarReference({ layers, size = 512 }: Props) {
    const jarW = size * 0.46;
    const jarH = size * 0.84;
    const jarX = (size - jarW) / 2;
    const jarTop = size * 0.1;
    const radius = jarW * 0.16;
    const clipId = "refJarClip";

    const bands = useMemo(() => {
        let acc = 0;
        return layers.map((l) => {
            const top = jarTop + acc * jarH;
            const h = l.renderFraction * jarH;
            acc += l.renderFraction;
            return { color: l.color, top, h };
        });
    }, [layers, jarH, jarTop]);

    return (
        <View style={{ width: size, height: size, backgroundColor: "#FFFFFF" }}>
            <Svg width={size} height={size}>
                <Defs>
                    <ClipPath id={clipId}>
                        <Rect x={jarX} y={jarTop} width={jarW} height={jarH} rx={radius} ry={radius} />
                    </ClipPath>
                </Defs>

                {/* Renkli oranlı bantlar (kavanoz şekline kırpılır) */}
                <G clipPath={`url(#${clipId})`}>
                    {bands.map((b, i) => (
                        <Rect key={`b-${i}`} x={jarX} y={b.top} width={jarW} height={b.h + 1} fill={b.color} />
                    ))}
                    {bands.map((b, i) =>
                        i > 0 ? (
                            <Line
                                key={`s-${i}`}
                                x1={jarX}
                                y1={b.top}
                                x2={jarX + jarW}
                                y2={b.top}
                                stroke="rgba(0,0,0,0.10)"
                                strokeWidth={1.5}
                            />
                        ) : null,
                    )}
                </G>

                {/* Kavanoz dış hattı */}
                <Rect
                    x={jarX}
                    y={jarTop}
                    width={jarW}
                    height={jarH}
                    rx={radius}
                    ry={radius}
                    fill="none"
                    stroke="rgba(0,0,0,0.20)"
                    strokeWidth={2.5}
                />
            </Svg>
        </View>
    );
}
