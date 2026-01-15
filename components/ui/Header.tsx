import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { useRouter } from "expo-router";

interface HeaderProps {
    onHistoryPress?: () => void;
}

export default function Header({ onHistoryPress }: HeaderProps) {
    const { i18n } = useTranslation();
    const router = useRouter();

    const toggleLanguage = () => {
        const newLang = i18n.language === "tr" ? "en" : "tr";
        i18n.changeLanguage(newLang);
    };

    return (
        <View style={styles.header}>
            {/* Sol taraf boş bırakıldı veya ilerde menü ikonu gelebilir */}
            <View style={styles.headerLeft} />

            <View style={styles.headerRight}>
                {/* Premium Göstergesi */}
                <Pressable style={styles.iconButtonPremium}>
                    <Ionicons name="diamond" size={18} color={Colors.primary} />
                </Pressable>

                {/* Profil */}
                <Pressable style={styles.iconButton}>
                    <Ionicons name="person-outline" size={20} color={Colors.secondary} />
                </Pressable>

                {/* History (Sidebar tetikleyici olacak, şimdilik sayfaya gider) */}
                <Pressable style={styles.iconButton} onPress={onHistoryPress}>
                    <Ionicons name="time-outline" size={20} color={Colors.secondary} />
                </Pressable>

                {/* Dil Seçimi - Bayrak İkonlu */}
                <Pressable style={styles.langButton} onPress={toggleLanguage}>
                    <Text style={styles.flag}>{i18n.language === "tr" ? "🇹🇷" : "🇺🇸"}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 10, // StatusBar altına pay
        zIndex: 10,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    iconButtonPremium: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#FFF7ED",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FFEDD5",
    },
    langButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    flag: {
        fontSize: 22,
    },
});