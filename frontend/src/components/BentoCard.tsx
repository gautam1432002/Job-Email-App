import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme, borderRadius } from '../utils/theme';

interface BentoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function BentoCard({ children, style }: BentoCardProps) {
  const { isDark, colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardSurface,
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0,
        },
        !isDark && styles.lightShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
