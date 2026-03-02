import { useMemo } from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t("navigation.nutrition"),
          tabBarIcon: ({ color }) => <Ionicons name="nutrition-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="guru"
        options={{
          title: t("navigation.guru", { defaultValue: "Guru" }),
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
              <Ionicons name="scan" size={28} color={colors.white} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 28,
          },
        }}
      />

      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: t("navigation.encyclopedia"),
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("navigation.settings"),
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    centerButton: {
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      transform: [{ rotate: "8deg" }],
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.16 : 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    centerButtonActive: {
      shadowOpacity: isDark ? 0.26 : 0.5,
    },
  });
