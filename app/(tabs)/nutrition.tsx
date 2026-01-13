import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beslenme Profili</Text>
      <Text style={styles.subtitle}>Alerjenler, Diyet Tipi ve Aile Yönetimi</Text>
      <View style={styles.placeholderBox}>
        <Text style={styles.info}>Buraya kullanıcı profilleri gelecek.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.secondary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.gray[500], marginBottom: 32 },
  placeholderBox: { padding: 20, backgroundColor: Colors.gray[100], borderRadius: 12 },
  info: { color: Colors.gray[400] }
});