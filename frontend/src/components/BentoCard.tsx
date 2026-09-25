import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, borderRadius, shadows } from '../utils/theme';

interface BentoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient' | 'glow';
  padding?: number;
}

export default function BentoCard({ children, style, variant = 'default', padding = 16 }: BentoCardProps) {
  const { isDark, colors } = useAppTheme();

  const baseStyle = [
    styles.card,
    {
      padding,
      backgroundColor: variant === 'gradient' ? 'transparent' : colors.cardSurface,
      borderColor: variant === 'glow' ? colors.neonCyan : (isDark ? colors.border : 'transparent'),
      borderWidth: (isDark || variant === 'glow') ? 1 : 0,
    },
    !isDark && variant !== 'glow' && variant !== 'gradient' && styles.lightShadow,
    variant === 'glow' && shadows.glowBoxCyan,
    style,
  ];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[colors.deepViolet, colors.neonCyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={baseStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={baseStyle}>{children}</View>;
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
