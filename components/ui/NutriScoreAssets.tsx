import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    grade?: string;
}

const COLORS = {
    a: "#00813D",
    b: "#85BB2F",
    c: "#FECB02",
    d: "#EE8100",
    e: "#E63E11"
};

export const NutriScoreGraphic: React.FC<Props> = ({ grade }) => {
    const safeGrade = grade ? grade.toLowerCase() : 'unknown';
    const scales = ['a', 'b', 'c', 'd', 'e'];

    return (
        <View style={styles.container}>
            {scales.map((s) => {
                const isActive = s === safeGrade;
                const color = COLORS[s as keyof typeof COLORS];

                return (
                    <View
                        key={s}
                        style={[
                            styles.box,
                            { backgroundColor: color },
                            isActive ? styles.activeBox : styles.inactiveBox
                        ]}
                    >
                        <Text style={[styles.text, isActive && styles.activeText]}>
                            {s.toUpperCase()}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: 160,
        borderRadius: 8,
    },
    box: {
        flex: 1,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 1,
        borderRadius: 4,
    },
    inactiveBox: {
        opacity: 0.3,
    },
    activeBox: {
        height: 50,
        opacity: 1,
        zIndex: 10,
        transform: [{ scale: 1.05 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    activeText: {
        fontSize: 24,
        fontWeight: '900',
    },
    // Bilinmiyor Stilleri
    unknownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 4,
        height: 50,
        width: 160,
        gap: 10
    },
    unknownBox: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unknownText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#64748B',
    },
    unknownLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1
    }
});