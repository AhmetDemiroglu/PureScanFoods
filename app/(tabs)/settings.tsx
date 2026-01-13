// app/(tabs)/settings.tsx
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.subtitle}>Premium, Gizlilik ve Hesap İşlemleri</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
  subtitle: { fontSize: 14, color: Colors.gray[500], marginTop: 8 }
});