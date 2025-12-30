import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-[#FF6F00]">
        PureScan Foods
      </Text>
      <Text className="text-base text-[#1E293B] mt-2">
        Gıda içeriklerini analiz et
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}