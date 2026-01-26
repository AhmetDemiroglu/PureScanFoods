import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isLoading: boolean;
}

export const ChatInput = ({ value, onChangeText, onSend, isLoading }: ChatInputProps) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container, focused && styles.focused]}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder="Bir şey sorun..."
                placeholderTextColor={Colors.gray[400]}
                multiline
                maxLength={500}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            <Pressable
                style={[styles.sendButton, !value.trim() && styles.disabled]}
                onPress={onSend}
                disabled={!value.trim() || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                    <Ionicons name="send" size={20} color={Colors.white} />
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: Colors.white,
        gap: 10,
    },
    focused: {
        backgroundColor: Colors.surface,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.gray[50],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: Colors.secondary,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: {
        backgroundColor: Colors.gray[300],
    },
});
