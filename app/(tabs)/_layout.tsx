import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as haptics from "../../lib/haptics";
import AppTabBar from "../../components/shell/AppTabBar";
import { tabBarOccupiedHeight } from "../../constants/design";

// Alt bar components/shell/AppTabBar.tsx: içeriğin üstünde yüzen cam kapsül. Sekmelerin sırası ve
// adları değişmedi; tur hedefleri (tab.nutrition, tab.guru, tab.scan, tab.encyclopedia) barın içinde.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenListeners={{ tabPress: () => haptics.selection() }}
      screenOptions={{
        headerShown: false,
        // Bar kendi yüksekliğini çizimden sonra bildirir; ilk karede de doğru boşluk için başlangıç değeri.
        tabBarStyle: { position: "absolute", height: tabBarOccupiedHeight(insets.bottom) },
      }}
    >
      <Tabs.Screen name="nutrition" options={{ title: t("navigation.nutrition") }} />
      <Tabs.Screen name="guru" options={{ title: t("navigation.guru", { defaultValue: "Guru" }) }} />
      <Tabs.Screen name="index" options={{ title: "" }} />
      <Tabs.Screen name="encyclopedia" options={{ title: t("navigation.encyclopedia") }} />
      <Tabs.Screen name="settings" options={{ title: t("navigation.settings") }} />
    </Tabs>
  );
}
