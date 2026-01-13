import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";

export default function ListsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Listelerim</Text>
            <Text style={styles.subtitle}>Favoriler ve Geçmiş Taramalar</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
    subtitle: { fontSize: 16, color: Colors.gray[500], marginTop: 8 }
});