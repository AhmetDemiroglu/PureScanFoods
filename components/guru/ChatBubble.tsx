import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

interface ChatBubbleProps {
    role: "user" | "assistant";
    content: string;
}

export const ChatBubble = ({ role, content }: ChatBubbleProps) => {
    const isUser = role === "user";

    return (
        <View style={[
            styles.container,
            isUser ? styles.userContainer : styles.assistantContainer
        ]}>
            <Text style={[
                styles.text,
                isUser ? styles.userText : styles.assistantText
            ]}>
                {content}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: "85%",
        padding: 14,
        borderRadius: 16,
        marginBottom: 8,
    },
    userContainer: {
        alignSelf: "flex-end",
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    assistantContainer: {
        alignSelf: "flex-start",
        backgroundColor: Colors.gray[100],
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: Colors.white,
    },
    assistantText: {
        color: Colors.secondary,
    },
});
