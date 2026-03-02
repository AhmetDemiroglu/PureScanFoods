import React, { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

export const ScanFailGraphic = () => {
  const { colors } = useTheme();

  return (
    <Svg width={130} height={130} viewBox="0 0 130 130" fill="none">
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0.1" />
          <Stop offset="1" stopColor={colors.secondary} stopOpacity="0.05" />
        </LinearGradient>
      </Defs>

      <Circle cx="65" cy="65" r="58" fill="url(#bgGrad)" />
      <Circle cx="65" cy="65" r="46" stroke={colors.border} strokeWidth="2" strokeDasharray="6 6" />

      <G>
        <Path d="M45 45 L85 85 M85 45 L45 85" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
        <Circle cx="65" cy="65" r="20" stroke={colors.secondary} strokeWidth="3" />
      </G>
    </Svg>
  );
};
