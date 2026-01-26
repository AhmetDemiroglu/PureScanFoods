import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[200],
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
      {/* 1. SOL: Beslenme */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t("navigation.nutrition"),
          tabBarIcon: ({ color }) => <Ionicons name="nutrition-outline" size={24} color={color} />,
        }}
      />

      {/* 2. SOL-ORTA: Guru */}
      <Tabs.Screen
        name="guru"
        options={{
          title: t("navigation.guru", { defaultValue: "Guru" }),
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />,
        }}
      />

      {/* 3. ORTA: Scan (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
              <Ionicons name="scan" size={28} color={Colors.white} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 28,
          },
        }}
      />

      {/* 4. SAĞ-ORTA: Ansiklopedi */}
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: t("navigation.encyclopedia"),
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
        }}
      />

      {/* 5. SAĞ: Ayarlar */}
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

const styles = StyleSheet.create({
  centerButton: {
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    transform: [{ rotate: "8deg" }],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonActive: {
    shadowOpacity: 0.5,
  },
});