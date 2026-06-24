import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

// "Gerçekte ne tüketiyorsun?" AI görsel üretilirken gösterilen eğlenceli geçiş ekranı.
// Sıkıcı spinner yerine: ai-generate Lottie + sırayla değişen esprili durum mesajları.

function ProgressDots({ color }: { color: string }) {
    const d0 = useRef(new Animated.Value(0.3)).current;
    const d1 = useRef(new Animated.Value(0.3)).current;
    const d2 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const make = (v: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(v, { toValue: 1, duration: 380, useNativeDriver: true }),
                    Animated.timing(v, { toValue: 0.3, duration: 380, useNativeDriver: true }),
                    Animated.delay(380 - delay),
                ]),
            );
        const anims = [make(d0, 0), make(d1, 180), make(d2, 360)];
        anims.forEach((a) => a.start());
        return () => anims.forEach((a) => a.stop());
    }, [d0, d1, d2]);

    return (
        <View style={styles.dotsRow}>
            {[d0, d1, d2].map((v, i) => (
                <Animated.View
                    key={i}
                    style={[styles.dot, { backgroundColor: color, opacity: v, transform: [{ scale: v }] }]}
                />
            ))}
        </View>
    );
}

export default function GenerationLoader() {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const messages = useMemo(
        () => [
            t("consumption.gen_msg_1", { defaultValue: "Boş kavanozu hazırladık 🫙" }),
            t("consumption.gen_msg_2", { defaultValue: "Malzemeleri katman katman diziyoruz…" }),
            t("consumption.gen_msg_3", { defaultValue: "Şeker kaşıklarını sayıyoruz 🥄" }),
            t("consumption.gen_msg_4", { defaultValue: "Gizli katkıları en dibe koyuyoruz 🔬" }),
            t("consumption.gen_msg_5", { defaultValue: "Işıkları ayarlayıp fotoğrafı çekiyoruz 📸" }),
            t("consumption.gen_msg_6", { defaultValue: "Neredeyse hazır, son rötuşlar ✨" }),
        ],
        [t],
    );

    const [idx, setIdx] = useState(0);
    const idxRef = useRef(0);
    const fade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const id = setInterval(() => {
            // Son mesaja gelince orada bekle — başa DÖNME (o artık "son adım" durumu).
            if (idxRef.current >= messages.length - 1) {
                clearInterval(id);
                return;
            }
            Animated.timing(fade, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => {
                idxRef.current += 1;
                setIdx(idxRef.current);
                Animated.timing(fade, { toValue: 1, duration: 340, useNativeDriver: true }).start();
            });
        }, 2000);
        return () => clearInterval(id);
    }, [messages.length, fade]);

    return (
        <View style={styles.wrap}>
            <LottieView
                source={require("../../assets/ai-generate.json")}
                autoPlay
                loop
                style={styles.lottie}
            />
            <Animated.View style={{ opacity: fade, minHeight: 52, justifyContent: "center" }}>
                <Text style={[styles.msg, { color: colors.text }]}>{messages[idx]}</Text>
            </Animated.View>
            <Text style={[styles.subtitle, { color: colors.gray[500] }]}>
                {t("consumption.gen_subtitle", { defaultValue: "Sana özel fotogerçekçi kavanoz hazırlanıyor" })}
            </Text>
            <ProgressDots color={colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingBottom: 40,
    },
    lottie: { width: 210, height: 210 },
    msg: {
        fontSize: 17,
        fontWeight: "800",
        textAlign: "center",
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: "500",
        textAlign: "center",
        marginTop: 4,
        paddingHorizontal: 20,
    },
    dotsRow: { flexDirection: "row", gap: 7, marginTop: 18 },
    dot: { width: 8, height: 8, borderRadius: 4 },
});
