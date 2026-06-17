/**
 * Merkezi animasyon (spring) tokenları.
 * react-native-reanimated `withSpring` ile kullanılır.
 *  - smooth: drawer / modal / sayfa geçişleri (doğal, ağırlıklı)
 *  - snappy: buton press-in (hızlı tepki)
 *  - bouncy: buton release (hafif overshoot, canlı his)
 */
export const Springs = {
  smooth: { damping: 20, stiffness: 200, mass: 1 },
  snappy: { damping: 26, stiffness: 320, mass: 0.8 },
  bouncy: { damping: 14, stiffness: 220, mass: 0.9 },
} as const;
