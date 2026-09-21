import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../utils/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.container, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    overflow: 'hidden',
    borderColor: 'rgba(102, 252, 241, 0.2)', // subtle neon cyan border
    borderWidth: 1,
  },
});
