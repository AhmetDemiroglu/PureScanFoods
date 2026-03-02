import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  grade?: string;
}

const SCORE_COLORS = {
  a: '#00813D',
  b: '#85BB2F',
  c: '#FECB02',
  d: '#EE8100',
  e: '#E63E11',
};

export const NutriScoreGraphic: React.FC<Props> = ({ grade }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const safeGrade = grade ? grade.toLowerCase() : 'unknown';
  const scales = ['a', 'b', 'c', 'd', 'e'];

  if (safeGrade === 'unknown') {
    return (
      <View style={styles.unknownContainer}>
        <View style={styles.unknownBox}>
          <Text style={styles.unknownText}>?</Text>
        </View>
        <Text style={styles.unknownLabel}>N/A</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scales.map((s) => {
        const isActive = s === safeGrade;
        const color = SCORE_COLORS[s as keyof typeof SCORE_COLORS];

        return (
          <View key={s} style={[styles.box, { backgroundColor: color }, isActive ? styles.activeBox : styles.inactiveBox]}>
            <Text style={[styles.text, isActive && styles.activeText]}>{s.toUpperCase()}</Text>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 2,
      borderColor: colors.white,
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
    unknownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gray[100],
      borderRadius: 8,
      padding: 4,
      height: 50,
      width: 160,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unknownBox: {
      width: 40,
      height: 40,
      borderRadius: 6,
      backgroundColor: colors.gray[300],
      alignItems: 'center',
      justifyContent: 'center',
    },
    unknownText: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.gray[600],
    },
    unknownLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.gray[500],
      letterSpacing: 1,
    },
  });
