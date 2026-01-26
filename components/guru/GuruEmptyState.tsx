import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";

interface GuruEmptyStateProps {
    onSelectSuggestion: (text: string) => void;
}

export const GuruEmptyState = ({ onSelectSuggestion }: GuruEmptyStateProps) => {
    const { t } = useTranslation();

    const suggestions = (t("guru.suggestions", { returnObjects: true }) || []) as string[];

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="restaurant-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t("guru.emptyState.title")}</Text>
            <Text style={styles.subtitle}>{t("guru.emptyState.subtitle")}</Text>

            <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                    <Pressable
                        key={index}
                        style={styles.suggestionChip}
                        onPress={() => onSelectSuggestion(suggestion)}
                    >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.gray[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.secondary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.gray[500],
        marginBottom: 24,
        textAlign: "center",
    },
    suggestionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
    },
    suggestionChip: {
        backgroundColor: Colors.gray[50],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    suggestionText: {
        fontSize: 13,
        color: Colors.secondary,
        fontWeight: "500",
    },
});
